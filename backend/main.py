import redis
import subprocess
import json
import logging
import asyncio
import pandas as pd
import joblib
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Load the trained model
model = joblib.load("predict_model.pkl")

# Load and preprocess future environmental data
future_env_df = pd.read_csv("future_environmental_data.csv")
future_env_df["timestamp"] = pd.to_datetime(future_env_df["timestamp"])

# Convert timestamp to string immediately
future_env_df["timestamp"] = future_env_df["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")

future_env_df["month"] = pd.to_numeric(future_env_df["timestamp"].str[5:7])  # Extract month
future_env_df["hour"] = pd.to_numeric(future_env_df["timestamp"].str[11:13])  # Extract hour
future_env_df["season"] = future_env_df["month"].apply(
    lambda x: 0 if x in [12, 1, 2] else 1 if x in [3, 4, 5] else 2 if x in [6, 7, 8] else 3
)

# Handle missing features
expected_features = list(model.feature_names_in_) + ["timestamp"]  # Ensure timestamp is retained
missing_features = set(expected_features) - set(future_env_df.columns)

if missing_features:
    logging.warning(f"⚠️ Missing features in input data: {missing_features}")

for feature in missing_features:
    future_env_df[feature] = 0

# Make sure columns are in expected order and timestamp is not dropped
future_env_df = future_env_df[expected_features]

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

r = redis.StrictRedis(host="localhost", port=6379, db=0, decode_responses=True)
queue_key = "priority_queue2"

r.delete(queue_key)

logging.basicConfig(level=logging.INFO)

# Response model
class FirePrediction(BaseModel):
    timestamp: str
    latitude: float
    longitude: float
    fire_risk_probability: float
    fire_risk: int

def predict_fire_risk(row):
    """Predict fire risk probability and return detailed info."""
    timestamp_str = row["timestamp"]  # Already a string
    input_features = row.drop(["timestamp"]).values.reshape(1, -1)  # Drop only for model input
    fire_risk_prob = model.predict_proba(input_features)[0][1]
    
    if fire_risk_prob > 0.01:  # Only process if probability is > 0.01
        return {
            "timestamp": timestamp_str,  # Ensure timestamp is included in response
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "fire_risk_probability": round(fire_risk_prob, 2),
            "fire_risk": 1 if fire_risk_prob > 0.5 else 0,
            "other_details": row.to_dict()  # Include all row details
        }
    return None

# REST API endpoint
@app.get("/get_fire_predictions", response_model=list[FirePrediction])
async def get_fire_predictions():
    """Get all fire predictions at once"""
    predictions = future_env_df.apply(predict_fire_risk, axis=1).dropna().tolist()
    return predictions

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Stream predictions one by one via WebSocket"""
    await websocket.accept()
    logging.info("Client connected via WebSocket")
    
    try:
        while True:
            for _, row in future_env_df.iterrows():
                prediction = predict_fire_risk(row)
                if prediction:
                    logging.info(f"Sending fire prediction: {prediction}")
                    await websocket.send_json(prediction)
                    await asyncio.sleep(5)  # Send every 5 seconds
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@app.websocket("/ws/tasks")
async def tasks_websocket(websocket: WebSocket):
    """Stream tasks from Redis separately"""
    await websocket.accept()
    logging.info("Client connected to Redis tasks WebSocket")

    try:
        while True:
            
            tasks = r.lrange('main_queue', 0, -1)  # Get all tasks in Redis
            r.delete('main_queue')
            
            if tasks:
                task_list = [json.loads(task) for task in tasks]  # Convert to JSON
                logging.info(f"Sending Redis tasks: {task_list}")

                await websocket.send_json(task_list)
            
            await asyncio.sleep(1)  # Wait before checking again
    except Exception as e:
        logging.error(f"Tasks WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    subprocess.Popen(["python", "fires/test.py"])
    uvicorn.run(app, host="0.0.0.0", port=5002)
