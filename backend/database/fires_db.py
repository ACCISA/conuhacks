from pymongo import MongoClient

client = MongoClient('mongodb+srv://airbnc:airbnc@airbnc.6uoyscd.mongodb.net/')
db = client["fire_management"]
fires = db['fires']

def log_fire_processing(data):
    fires.insert_one(data)


def fetch_past_fires():
    return fires.find({})