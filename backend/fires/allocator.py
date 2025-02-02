import sys
import logging
import random
sys.path.append("database")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

from deployment import RedisDeploymentQueue
from resources import pull_resources, update_resource

class Allocator:
    
    whitelist = {
        1: ["fire_engines", "ground_crews"],
        2: ["smoke_jumpers", "helicopters"],
        3: ["tanker_planes", "helicopters"]
    }

    ttl = {
        1: random.uniform(5, 7),
        2: random.uniform(10,15),
        3: random.uniform(25, 30)
    }

    def __init__(self):
        self.resources = pull_resources()['resources']
        self.severity = None
        self.deployment = RedisDeploymentQueue()

    def optimize_cost(self,  combinations):
        logging.info("Allocator(optimizing costs)")
        prices = []
        for combination in combinations:
            total_cost = 0
            for key in combination.keys():
                total_cost += self.resources[key]['cost_per_operation']
            prices.append(total_cost)
        cheapest = min(prices)
        idx = prices.index(cheapest)

        return combinations[idx]

    def closest_sum(self, arr, total_points):
        possible_sums = {0: []}  

        for item in arr:
            name, num = list(item.items())[0]  
            new_sums = {}
            for s, items in possible_sums.items():
                new_sum = s + num
                if new_sum not in possible_sums:
                    new_sums[new_sum] = items + [item]
            
            possible_sums.update(new_sums)
        
        sorted_items = sorted(possible_sums.items(), key=lambda x: x[0])

        combinations = []
        target = None        
        for s, items in sorted_items:
            if target is not None and s == target:
                combinations.append((s, items))
            if target is not None and s > target:
                break

            if s >= total_points:
                target = s
                combinations.append((s, items))
        
        if len(combinations) == 1: return target, combinations[0]
        if len(combinations) == 0: return None, None
        return target, self.optmize_cost(combinations)

    def resource_availability(self, type):
        return int(self.resources[type]['units_available'])
    
    def use_resource(self, type, id):
        logging.info(f"Allocator(task_id={id},resource_reserved={type})")
        units = self.resource_availability(type)
        update_resource(type, 'units_available', str(units-1))
        self.resources = pull_resources()['resources']

    def reserve_resources(self, resources, id):

        for resource in resources:
            for resource_type in resource.keys():
                self.use_resource(resource_type, id)

    def set_higher_whitelist(self, severity, id):
        
        if self.severity >= 3:
            return False
        self.severity += 1
        logging.warning(f"Allocator(task_id={id},severity increased)")
        return True

    def allocate_task(self, entry):
        preferred_types = Allocator.whitelist[self.severity]

        logging.info(f"Allocator(severity={self.severity},preferred_types={preferred_types})")
        points = []
        for type in preferred_types:
            units = int(self.resource_availability(type))
            for i in range(units):
                points.append({type: int(self.resources[type]['points'])})

        sum, sum_arr = self.closest_sum(points, entry['points'])    

        if sum_arr is None or sum is None:
            logging.warning(f"Allocator(resources unvailable)")
            res = self.set_higher_whitelist(self.severity,entry['task_id'])
            if res is False:
                logging.warning(f"Allocator(task_id={entry['task_id']}, completed no resources available)")
                return None, None
            
            return self.allocate_task(entry)

        logging.info(f"Allocator(expected={entry['points']},sum_arr={sum_arr},sum={sum})")

        self.reserve_resources(sum_arr[1], entry['task_id']) # pass in the resources we want to reserve

        logging.info(f"Allocator(task_id={entry['task_id']},raa completed)")
        
        return sum_arr,Allocator.ttl[entry['priority']]