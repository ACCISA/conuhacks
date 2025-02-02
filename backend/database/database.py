from pymongo import MongoClient

client = MongoClient('mongodb+srv://airbnc:airbnc@airbnc.6uoyscd.mongodb.net/')
print(client)

db = client["fire_management"]

print(db)

prev_fires = db['previous_fires_dataset']

