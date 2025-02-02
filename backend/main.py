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
future_env_df["month"] = future_env_df["timestamp"].dt.month
future_env_df["hour"] = future_env_df["timestamp"].dt.hour
future_env_df["season"] = future_env_df["month"].apply(
    lambda x: 0 if x in [12, 1, 2] else 1 if x in [3, 4, 5] else 2 if x in [6, 7, 8] else 3
)
future_env_df.drop(columns=["timestamp"], inplace=True)

# Handle missing features
expected_features = model.feature_names_in_
missing_features = set(expected_features) - set(future_env_df.columns)

if missing_features:
    logging.warning(f"⚠️ Missing features in input data: {missing_features}")

for feature in missing_features:
    future_env_df[feature] = 0

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

logging.basicConfig(level=logging.INFO)

# Response model
class FirePrediction(BaseModel):
    latitude: float
    longitude: float
    fire_risk_probability: float
    fire_risk: int

def predict_fire_risk(row):
    input_features = row.values.reshape(1, -1)
    fire_risk_prob = model.predict_proba(input_features)[0][1]
    fire_risk = 1 if fire_risk_prob > 0.5 else 0
    return FirePrediction(
        latitude=row["latitude"],
        longitude=row["longitude"],
        fire_risk_probability=round(fire_risk_prob, 2),
        fire_risk=fire_risk
    )

# REST API endpoint
@app.get("/get_fire_predictions", response_model=list[FirePrediction])
async def get_fire_predictions():
    """Get all fire predictions at once"""
    return future_env_df.apply(predict_fire_risk, axis=1).tolist()

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Stream predictions one by one via WebSocket"""
    await websocket.accept()
    logging.info("Client connected via WebSocket")
    
    try:
        while True:
            # Simulate continuous stream by iterating through the DataFrame
            for _, row in future_env_df.iterrows():
                prediction = predict_fire_risk(row)
                logging.info(f"Sending fire prediction: {prediction}")
                await websocket.send_json(prediction.dict())
                await asyncio.sleep(5)  # Send every 5 seconds
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)