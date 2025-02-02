import pandas as pd
import time
import logging
import redis
import json
import threading
import sys
import uuid
from pprint import pprint

sys.path.append("database")

from allocator import Allocator
from deployment import RedisDeploymentQueue
from resources import reset_resources, pull_resources
from fires import log_failed_response
# Set up Redis connection
r = redis.StrictRedis(host='localhost', port=6379, db=0)
queue_key = "priority_queue2"

r.delete(queue_key)
r.delete("locker_handler")

speed_factor = 100000

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

allocator = Allocator() 
deployment = RedisDeploymentQueue()

import uuid

def short_uuid():
    full_uuid = uuid.uuid4()
    return str(full_uuid).replace('-', '')[:8]



def task_handler(task_data):
    task = json.loads(task_data)
    allocator.severity = task['priority']
    resource_usage, ttl = allocator.allocate_task(task)
    if resource_usage is None or ttl is None:
        task_data['num_fires'] = deployment.deployed
        task_data['cur_fires'] = deployment.cur_fires
        log_failed_response(task_data)
        return

    deployment.deploy(task,resource_usage,ttl)


def listen_to_queue():
    while True:
        task_data = r.zrange(queue_key, 0, 0)  # Get the highest priority task
        if task_data:
            task_data = task_data[0]  # Extract task data
            lock = r.lock("locker_handler")
            lock.acquire(blocking=True)
            task_handler(task_data)
            r.zrem(queue_key, task_data)
            lock.release()
        time.sleep(0.5)  # To prevent busy-waiting, add a small sleep


def add_task_to_queue(entry, priority, delay):
    entry_serialized = json.dumps(entry)
    r.zadd(queue_key, {entry_serialized: priority})  # Add task with priority to Redis sorted set
    logging.info(f"Redis(new entry, delay={delay})")

def process_entries(df, entries):
    """Processes entries and adds them to Redis."""
    for idx, entry in enumerate(entries):
        if idx > 0:
            diff = (entry['timestamp'] - df.iloc[idx - 1]['timestamp']).total_seconds()
            time_adjust = diff / speed_factor
            time.sleep(time_adjust)  # Simulate the real-time data insertion delay
            entry['timestamp'] = str(entry['timestamp'])
            add_task_to_queue(entry, entry['priority'], time_adjust)  # Add task to Redis priority queue


def start_simulation():
    """Reads wildfire data and starts adding tasks to Redis."""
    df = pd.read_csv("fires/current_wildfiredata.csv")
    df['timestamp'] = pd.to_datetime(df['timestamp'], format='%Y-%m-%d %H:%M:%S')
    df = df.sort_values('timestamp')

    entries = df.to_dict(orient='records')

    for entry in entries:
        priorities = {
            "high": [3,30],
            "medium": [2,15],
            "low": [1,5]
        }
        entry['priority'] = priorities[entry['severity']][0]
        entry['points'] = priorities[entry['severity']][1] 
        entry['task_id'] =  short_uuid()

    process_entries(df, entries)


def start_listener():
    logging.info("Allocator thread started")
    threading.Thread(target=listen_to_queue, daemon=True).start()
    logging.info("Deployment thread started")
    threading.Thread(target=deployment.process_queue, daemon=True).start()

    


if __name__ == "__main__":
    logging.info("Starting test.py")
    reset_resources()
    pprint(pull_resources()['resources'])
    start_listener()
    start_simulation() 
