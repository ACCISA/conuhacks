class Fire:
    def __init__(self, intensity):
       
        if intensity == 'high':
            self.points = 20
            self.weekly_damage=200000
        elif intensity == 'medium':
            self.points = 10
            self.weekly_damage=100000
        elif intensity == 'low':
            self.points = 5
            self.weekly_damage=50000
