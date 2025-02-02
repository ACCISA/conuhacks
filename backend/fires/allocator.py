import sys
import logging

sys.path.append("database")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


from resources import pull_resources, update_resource

class Allocator:
    
    whitelist = {
        1: ["fire_engines", "ground_crews"],
        2: ["smoke_jumpers", "helicopters"],
        3: ["tanker_planes", "helicopters"]
    }

    def __init__(self):
        self.resources = pull_resources()['resources']

    def resource_availability(self, type):
        return self.resources[type]['units_available']
    
    def use_resource(self, type):
        units = self.resource_availability(type)
        update_resource(type, 'units_available', units-1)
        self.resources = pull_resources()['resources']

    def allocate_task(self, entry):
        severity = entry['priority']
        preferred_types = Allocator.whitelist[severity]

        logging.info(f"Allocator(severity={severity},preferred_types={preferred_types})")

        for type in preferred_types:
            units = self.resource_availability(type)

    
