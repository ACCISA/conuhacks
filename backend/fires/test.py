import pandas as pd
import time
import logging
import redis
import json
import threading

from allocator import Allocator

# Set up Redis connection
r = redis.StrictRedis(host='localhost', port=6379, db=0)
queue_key = "priority_queue2"

r.delete(queue_key)

speed_factor = 100000

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

allocator = Allocator() 

def add_task_to_queue(entry, priority):
    """Add tasks to Redis without processing them."""
    entry_serialized = json.dumps(entry)
    r.zadd(queue_key, {entry_serialized: priority})
    logging.info(f"Added task: {entry['task_id']} to the queue with priority: {priority}")

def process_entries(df, entries):
    """Processes entries and adds them to Redis."""
    for idx, entry in enumerate(entries):
        if idx > 0:
            diff = (entry['timestamp'] - df.iloc[idx - 1]['timestamp']).total_seconds()
            time_adjust = diff / speed_factor
            time.sleep(time_adjust)
            entry['timestamp'] = str(entry['timestamp'])
            add_task_to_queue(entry, entry['priority'])

def start_simulation():
    """Reads wildfire data and starts adding tasks to Redis."""
    df = pd.read_csv("fires/current_wildfiredata.csv")
    df['timestamp'] = pd.to_datetime(df['timestamp'], format='%Y-%m-%d %H:%M:%S')
    df = df.sort_values('timestamp')

    entries = df.to_dict(orient='records')

    for entry in entries:
        priorities = {
            "high": 3,
            "medium": 2,
            "low": 1
        }
        entry['priority'] = priorities[entry['severity']]
        entry['task_id'] = f"task_{entries.index(entry)}"

    process_entries(df, entries)

if __name__ == "__main__":
    logging.info("Starting test.py")
    start_simulation()
