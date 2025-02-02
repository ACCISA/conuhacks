class Units:
    def __init__(self, unit_type):
        self.unit_type = unit_type
        self.assigned_to = None

        self.deployment_time= None

        match self.unit_type:
            case "Smoke Jumper":
                self.deployment_time=30
            case "Fire Engine":
                self.deployment_time=60
            case "Tanker Planes":
                self.deployment_time=45
            case "Helicopter":
                self.deployment_time=120
            case "Ground Crew":
                self.deployment_time=90