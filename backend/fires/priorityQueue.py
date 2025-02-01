import heapq

class PriorityQueue:
    def __init__(self):
        self.heap = []
    
    def enqueue(self, item, priority):
        heapq.heappush(self.heap, (priority, item))
    
    def dequeue(self):
        if self.is_empty():
            raise IndexError("No fires in the priority queue.")
        return heapq.heappop(self.heap)[1]
    
    def is_empty(self):
        return len(self.heap) == 0
    
    def peek(self):
        if self.is_empty():
            raise IndexError("No fires in the priority queue.")
        return self.heap[0][1]
    
    def size(self):
        return len(self.heap)


