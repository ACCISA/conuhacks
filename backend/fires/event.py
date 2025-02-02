import redis

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

queue_name = 'main_event_queue'

def add_to_queue(item):
    redis_client.lpush(queue_name, item)
    print(f"Added {item} to the queue")

def remove_from_queue():
    item = redis_client.rpop(queue_name) 
    if item:
        print(f"Removed {item.decode('utf-8')} from the queue")
    else:
        print("Queue is empty")

