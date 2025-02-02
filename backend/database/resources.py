from database import resources
import logging

def update_resource(resource, key, value):
    doc = resources.find_one()
    if doc:
        resources.update_one({'_id':doc['_id']}, {'$set': {"resources."+resource+"."+key: value}})
        logging.info("Updated "+str(key)+":"+str(value))

def pull_resources():
    return resources.find_one()

def reset_resources():
    resource = {"resources":{"fire_engines":{"deployment_time":"1 hour","cost_per_operation":{"$numberInt":"2000"},"units_available":"10","points":"3"},"ground_crews":{"deployment_time":"1.5 hours","cost_per_operation":{"$numberInt":"3000"},"units_available":"8","points":"2"},"helicopters":{"deployment_time":"45 minutes","cost_per_operation":{"$numberInt":"8000"},"units_available":"3","points":"6"},"smoke_jumpers":{"deployment_time":"30 minutes","cost_per_operation":{"$numberInt":"5000"},"units_available":"5","points":"4"},"tanker_planes":{"deployment_time":"2 hours","cost_per_operation":{"$numberInt":"15000"},"units_available":"2","points":"10"}}}
    resources.delete_one({})

    resources.insert_one(resource)