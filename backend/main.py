import logging
import time
import pandas as pd
import joblib
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

# Load the trained model
model = joblib.load("predict_model.pkl")

# Load future environmental data
future_env_df = pd.read_csv("future_environmental_data.csv")
future_env_df["timestamp"] = pd.to_datetime(future_env_df["timestamp"])
future_env_df["month"] = future_env_df["timestamp"].dt.month
future_env_df["hour"] = future_env_df["timestamp"].dt.hour
future_env_df["season"] = future_env_df["month"].apply(lambda x: 0 if x in [12, 1, 2] else 1 if x in [3, 4, 5] else 2 if x in [6, 7, 8] else 3)
future_env_df.drop(columns=["timestamp"], inplace=True)

# Ensure all expected features exist
expected_features = model.feature_names_in_
missing_features = set(expected_features) - set(future_env_df.columns)

if missing_features:
    logging.warning(f"⚠️ Missing features in input data: {missing_features}")

# Add missing features with default values (0)
for feature in missing_features:
    future_env_df[feature] = 0

# Reorder columns to match model input
future_env_df = future_env_df[expected_features]

# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

logging.basicConfig(level=logging.INFO)

def predict_fire_risk(row):
    input_features = row.values.reshape(1, -1)
    fire_risk_prob = model.predict_proba(input_features)[0][1]
    fire_risk = 1 if fire_risk_prob > 0.5 else 0
    return {
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "fire_risk_probability": round(fire_risk_prob, 2),
        "fire_risk": fire_risk
    }

# Flask API route
@app.route("/get_fire_predictions", methods=["GET"])
def get_fire_predictions():
    predictions = future_env_df.apply(predict_fire_risk, axis=1).tolist()
    return jsonify(predictions)

# Handle Socket.IO connection
@socketio.on("connect")
def handle_connect():
    logging.info("Client connected")

@socketio.on("request_fire_predictions")
def send_fire_predictions():
    logging.info("Starting to send fire predictions one by one...")
    for _, row in future_env_df.iterrows():  # Simulate continuous data stream
        prediction = predict_fire_risk(row)
        logging.info(f"Sending fire prediction: {prediction}")
        socketio.emit("fire_predictions", prediction)
        time.sleep(5)  # Send one prediction every 5 seconds

# Run Flask with Socket.IO
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5002, debug=True)
