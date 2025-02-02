from pymongo import MongoClient

client = MongoClient('mongodb+srv://airbnc:airbnc@airbnc.6uoyscd.mongodb.net/')
print(client)

db = client["fire_management"]

print(db)

resources = db['resources']
fires = db['fires']
knowledge_base = db['knowledge_base']

def csv_to_mongo(file_name,data):
    knowledge_base.insert_one({'file_name':file_name,'data':data,'test':1})

def mongo_to_csv(file_name):
    query = {'file_name':file_name}
    result = knowledge_base.find_one(query)
    return result['data']