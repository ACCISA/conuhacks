import pandas as pd
import time
import logging
import redis
import json
import threading

from queue_handler import add_task_to_queue, start_listener

# Set up Redis connection
r = redis.StrictRedis(host='localhost', port=6379, db=0)
queue_key = "priority_queue2"

r.delete(queue_key)

speed_factor = 100000

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def task_handler(task_data):
    task = json.loads(task_data)
    print(task)
    logging.info(f"Processing task: {task['task_id']}, Priority: {task['priority']}, Timestamp: {task['timestamp']}")


def listen_to_queue():
    while True:
        task_data = r.zrange(queue_key, 0, 0)  # Get the highest priority task
        if task_data:
            task_data = task_data[0]  # Extract task data
            task_handler(task_data)
            r.zrem(queue_key, task_data)
        time.sleep(0.5)  # To prevent busy-waiting, add a small sleep


def add_task_to_queue(entry, priority):
    print(entry)
    print("----")
    entry_serialized = json.dumps(entry)
    print(entry_serialized)
    r.zadd(queue_key, {entry_serialized: priority})  # Add task with priority to Redis sorted set
    logging.info(f"Added task: {entry['task_id']} to the queue with priority: {priority}")


def process_entries(df, entries):
    for idx, entry in enumerate(entries):
        if idx > 0:
            diff = (entry['timestamp'] - df.iloc[idx - 1]['timestamp']).total_seconds()
            time_adjust = diff / speed_factor
            logging.info("Delaying: "+str(time_adjust))
            time.sleep(time_adjust)  # Simulate the real-time data insertion delay
            entry['timestamp'] = str(entry['timestamp'])
            add_task_to_queue(entry, entry['priority'])  # Add task to Redis priority queue


def start_simulation():
    df = pd.read_csv("fires\\current_wildfiredata.csv")
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
        entry['task_id'] = f"task_{entries.index(entry)}"  # Assign a unique task_id for logging

    process_entries(df, entries)


def start_listener():
    listener_thread = threading.Thread(target=listen_to_queue, daemon=True)
    listener_thread.start()


if __name__ == "__main__":
    logging.info("Starting test.py")
    start_listener()
    start_simulation() 