from database import fires


def log_fire_processing(data):
    
    fires.insert_one(data)