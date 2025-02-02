import redis
import time
import threading
import logging
import time
import json
import sys

sys.path.append("database")

from resources import pull_resources, update_resource

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class RedisDeploymentQueue:
    def __init__(self, redis_host='localhost', redis_port=6379, queue_name='deployment_queue'):
        self.redis_client = redis.StrictRedis(host=redis_host, port=redis_port, db=0)
        self.redis_client.delete(queue_name)
        self.queue_name = queue_name
        self.resources = pull_resources
    
    def deploy(self,entry,resources, ttl):
        """
        Adds an item to the Redis queue with a TTL.
        After the TTL expires, the item will be processed and we store its data in MongoDB
        """
        item_data = {'entry': entry,'resources': resources, 'ttl': time.time()+ttl}
        self.redis_client.zadd(self.queue_name, {json.dumps(item_data): item_data['ttl']})
        logging.info(f"Deployment(task_id={entry['task_id']},ttl={ttl},deployed)")
    
    def process_queue(self):
        """
        Continuously check the queue for items to process and handle items after TTL expires.
        """
        while True:
            now = time.time()
            items = self.redis_client.zrangebyscore(self.queue_name, 0, now)
            if items:
                for item in items:
                    entry = json.loads(item)
                    print(entry)
                    self.redis_client.zrem(self.queue_name, item)
                    self.handle_completed_deployment(entry)
    
    def free_resource(self, type):
        units = int(pull_resources()['resources'][type]['units_available'])
        update_resource(type, 'units_available', str(units+1))
        logging.info(f"Deployement(type={type},freed)")

    def handle_completed_deployment(self, item):
        """
        This function will handle the item when its TTL expires.
        we want to log and free the used resources
        """
        logging.info(f"Deployment(task_id={item['entry']['task_id']}, deployment completed)")

        resources = item['resources'][1]

        for resource in resources:
            for unit in resource.keys():
                self.free_resource(unit)