import redis
import time
import threading
import json

r = redis.StrictRedis(host='localhost', port=6379, db=0)

queue_key = "priority_queue"

def task_handler(task_data):
    task = json.loads(task_data)
    print()
    print(f"Handling task: {task['task']} with priority: {task['priority']}")

def listen_to_queue():
    while True:
        task_data = r.zrange(queue_key, 0, 0)  # Get the highest priority task
        if task_data:
            task_data = task_data[0]  # Extract task data
            task_handler(task_data)
            r.zrem(queue_key, task_data)
        time.sleep(0.5)  # To prevent busy-waiting, add a small sleep

def add_task_to_queue(task, priority):
    entry = {"task": task, "priority": priority}
    ser = json.dumps(entry)
    r.zadd(queue_key, {ser: priority})

def simulate_adding_tasks():
    add_task_to_queue("High priority task", 1)
    time.sleep(1)
    add_task_to_queue("Low priority task", 5)
    time.sleep(1)
    add_task_to_queue("Medium priority task", 3)

def start_listener():
    listener_thread = threading.Thread(target=listen_to_queue, daemon=True)
    listener_thread.start()