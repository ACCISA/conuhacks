import pandas as pd
import time
from fires.receiver import Receiver

speed_factor = 100000

def process_entries(entries):
    receiver= Receiver()
    for idx, entry in enumerate(entries):
        if idx > 0:
            diff = (entry['timestamp'] - df.iloc[idx-1]['timestamp']).total_seconds()

            time_adjust = diff / speed_factor

            print(time_adjust)
            time.sleep(time_adjust)
            receiver.check_deploying()

        

df = pd.read_csv("test\\current_wildfiredata.csv")

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


print(entries)

process_entries(entries)