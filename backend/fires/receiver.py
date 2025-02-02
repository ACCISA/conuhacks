from fires.priorityQueue import PriorityQueue
from fires.units import Units

class Receiver:
    def __init__(self):
        self.priority_queue = PriorityQueue()
        self.smoke_jumpers=[Units("Smoke Jumper")]*5
        self.fire_engines=[Units("Fire Engine")]*10
        self.helicopters=[Units("Helicopter")]*3
        self.tanker_planes=[Units("Tanker Plane")]*2
        self.ground_crews=[Units("Ground Crew")]*8
        self.deploying =[]
        self.missed=0
        self.damages=0
        self.costs=0
        
    
    def receive(self, data):
       

        if not isinstance(data, dict) or 'priority' not in data:
            raise ValueError("Data must be a dictionary with a 'priority' key")
        for unit in self.smoke_jumpers:
            if not unit.assigned_to:
                unit.assigned_to= data
                data['units'].append(unit)
                self.deploying.append(unit)
        priority = data['priority']
        self.priority_queue.enqueue(data, priority)

    def check_deploying(self, time):
        while(self.deploying[0]<=time):
            temp=self.deploying.pop(0)
            temp.assigned_to['points']+=temp.points
    
    def check_fire(self, fire):
        pass
    
    def get_next(self):
        return self.priority_queue.dequeue()