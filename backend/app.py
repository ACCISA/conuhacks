import logging
import sys
import streamlit as st
from flask import Flask, jsonify
from flask_socketio import SocketIO
import random
from datetime import datetime, timedelta

sys.path.append('streamlit')
from csv_processing import csv_processing

app = Flask(__name__)
from flask_cors import CORS
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

logging.basicConfig(level=logging.INFO)

# Function to simulate fire prediction data
def generate_fire_predictions():
    predictions = []
    for _ in range(random.randint(1, 5)):
        lat = 45.5 + random.uniform(-0.05, 0.05)
        lng = -73.55 + random.uniform(-0.05, 0.05)
        coordinates = [
            {"lat": lat + random.uniform(-0.01, 0.01), "lng": lng + random.uniform(-0.01, 0.01)},
            {"lat": lat + random.uniform(-0.01, 0.01), "lng": lng + random.uniform(-0.01, 0.01)},
            {"lat": lat + random.uniform(-0.01, 0.01), "lng": lng + random.uniform(-0.01, 0.01)},
            {"lat": lat + random.uniform(-0.01, 0.01), "lng": lng + random.uniform(-0.01, 0.01)},
        ]
        predictions.append({"latitude": lat, "longitude": lng, "coordinates": coordinates})
    return predictions

@app.route("/get_fire_predictions", methods=["GET"])
def get_fire_predictions():
    predictions = generate_fire_predictions()
    return jsonify(predictions)

@socketio.on("connect")
def handle_connect():
    logging.info("Client connected")

@socketio.on("request_fire_predictions")
def send_fire_predictions():
    predictions = generate_fire_predictions()
    socketio.emit("fire_predictions", predictions)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)

if 'component' not in st.query_params:
    st.write("missing component param")
else:
    params = st.query_params
    pages = {
        "csv_processing": csv_processing
    }
    logging.info("Executing: " + str(params.component))
    pages[params.component]()
