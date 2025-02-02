import redis
import json
import logging
import sys

sys.path.append("database")

from fires_db import log_fire_processing

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

queue_name = 'main_queue'

redis_client.delete(queue_name)

def add_to_main_queue(entry):
    entry['status'] = 'start'
    redis_client.lpush(queue_name, json.dumps(entry))

def remove_fire_by_id(task_id):
    queue_items = redis_client.lrange(queue_name, 0, -1)
    for item in queue_items:
        item_data = json.loads(item)
        if item_data.get('task_id') == task_id:
            redis_client.lrem(queue_name, 0, item)  # Remove the item
            log_fire_processing(item_data)
            logging.info(f"Main({item_data})")
            break


def update_fire_by_id(task_id, updated_data):
    queue_items = redis_client.lrange(queue_name, 0, -1)
    for item in queue_items:
        item_data = json.loads(item)
        if item_data.get('task_id') == task_id:
            redis_client.lrem(queue_name, 0, item) 
            item_data.update(updated_data) 
            redis_client.lpush(queue_name, json.dumps(item_data))
            break


def get_queue():
    return [json.loads(item) for item in redis_client.lrange(queue_name, 0, -1)]

