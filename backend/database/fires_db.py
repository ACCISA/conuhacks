from database.database import fires


def log_fire_processing(data):
    fires.insert_one(data)


def fetch_past_fires():
    return fires.find({})