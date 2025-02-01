import pandas as pd


csv = "scripts/data/current_wildfiredata.csv"

df = pd.read_csv(csv)

data = df.to_dict(orient='records')



