from database import fires


def log_failed_response(data):
    fires.insert_one(data)

def log_sucess_response(data):
    pass