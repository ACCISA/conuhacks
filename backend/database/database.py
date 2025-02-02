from pymongo import MongoClient

client = MongoClient('mongodb+srv://airbnc:airbnc@airbnc.6uoyscd.mongodb.net/')
print(client)

db = client["fire_management"]

print(db)

resources = db['resources']
fires = db['fires']

def helo():
    pass