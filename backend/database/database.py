from pymongo import MongoClient

client = MongoClient('')
print(client)

db = client["fire_management"]

print(db)

prev_fires = db['previous_fires_dataset']

