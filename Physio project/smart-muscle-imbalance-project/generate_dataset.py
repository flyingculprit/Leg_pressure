import pandas as pd
import random
from datetime import datetime, timedelta

rows = 3000

# Muscle groups by imbalance severity

low_muscles = [
    "Tibialis Anterior",
    "Peroneus Longus",
    "Soleus",
    "Gastrocnemius"
]

moderate_muscles = [
    "Vastus Medialis",
    "Vastus Lateralis",
    "Rectus Femoris",
    "Sartorius"
]

high_muscles = [
    "Biceps Femoris",
    "Semitendinosus",
    "Semimembranosus",
    "Gracilis",
    "Adductor Longus",
    "Adductor Magnus"
]

severe_muscles = [
    "Gluteus Maximus",
    "Gluteus Medius",
    "Gluteus Minimus",
    "Tensor Fasciae Latae",
    "Iliopsoas"
]

data = []

start_time = datetime(2026, 3, 25, 10, 0, 0)

for i in range(rows):

    time = start_time + timedelta(seconds=i*30)

    left = round(random.uniform(30, 90), 2)

    if random.random() < 0.3:

        # Balanced case
        right = round(left + random.uniform(-2, 2), 2)

        muscle = "Balanced"
        status = "Balanced"

    else:

        diff = random.uniform(3, 25)

        if random.random() < 0.5:
            right = round(left + diff, 2)
            weak_side = "Left"
        else:
            right = round(left - diff, 2)
            weak_side = "Right"

        imbalance_percent = (
            abs(left - right) /
            (left + right)
        ) * 100

        # Choose muscle group logically

        if imbalance_percent <= 7:
            muscle_type = random.choice(low_muscles)

        elif imbalance_percent <= 12:
            muscle_type = random.choice(moderate_muscles)

        elif imbalance_percent <= 18:
            muscle_type = random.choice(high_muscles)

        else:
            muscle_type = random.choice(severe_muscles)

        muscle = weak_side + " " + muscle_type
        status = "Imbalance"

    right = max(30, min(95, right))

    total = round(left + right, 2)

    data.append([
        time.strftime("%d/%m/%Y %H:%M:%S"),
        left,
        right,
        total,
        status,
        muscle
    ])

df = pd.DataFrame(data, columns=[
    "Time",
    "Left Leg (kg)",
    "Right Leg (kg)",
    "Total (kg)",
    "Status",
    "Affected Muscle"
])

df.to_csv(
    "data/muscle_dataset_with_20_muscles.csv",
    index=False
)

print("20-Muscle Dataset Generated Successfully.")
print("Total Rows:", len(df))