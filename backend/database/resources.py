from database import resources
import logging

def update_resource(resource, key, value):
    doc = resources.find_one()
    if doc:
        resources.update_one({'_id':doc['_id']}, {'$set': {"resources."+resource+"."+key: value}})
        logging.info("Updated "+str(key)+":"+value)

def pull_resources():
    return resources.find_one()
