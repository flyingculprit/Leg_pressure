import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
data = pd.read_csv(
    "data/muscle_dataset_with_20_muscles.csv"
)

# -----------------------------
# GROUP MUSCLES
# -----------------------------

def group_muscle(muscle):

    if muscle == "Balanced":
        return "Balanced"

    side, muscle_name = muscle.split(" ", 1)

    tibialis = [
        "Tibialis Anterior",
        "Peroneus Longus"
    ]

    calf = [
        "Gastrocnemius",
        "Soleus"
    ]

    quadriceps = [
        "Rectus Femoris",
        "Vastus Lateralis",
        "Vastus Medialis",
        "Vastus Intermedius",
        "Sartorius"
    ]

    hamstrings = [
        "Biceps Femoris",
        "Semitendinosus",
        "Semimembranosus"
    ]

    adductors = [
        "Adductor Longus",
        "Adductor Magnus",
        "Gracilis"
    ]

    glutes = [
        "Gluteus Maximus",
        "Gluteus Medius",
        "Gluteus Minimus",
        "Tensor Fasciae Latae",
        "Iliopsoas"
    ]

    if muscle_name in tibialis:
        group = "Tibialis Group"

    elif muscle_name in calf:
        group = "Calf Group"

    elif muscle_name in quadriceps:
        group = "Quadriceps Group"

    elif muscle_name in hamstrings:
        group = "Hamstring Group"

    elif muscle_name in adductors:
        group = "Adductor Group"

    else:
        group = "Glute Group"

    return side + " " + group


data["Muscle_Group"] = data[
    "Affected Muscle"
].apply(group_muscle)

# -----------------------------
# FEATURE ENGINEERING
# -----------------------------

data["Difference"] = abs(
    data["Left Leg (kg)"] -
    data["Right Leg (kg)"]
)

data["Imbalance (%)"] = (
    data["Difference"] /
    data["Total (kg)"]
) * 100

data["Load Ratio"] = (
    data["Left Leg (kg)"] /
    data["Right Leg (kg)"]
)

def weak_side(row):

    if row["Left Leg (kg)"] < row["Right Leg (kg)"]:
        return 0

    elif row["Right Leg (kg)"] < row["Left Leg (kg)"]:
        return 1

    else:
        return 2

data["Weak Side"] = data.apply(
    weak_side,
    axis=1
)

# -----------------------------
# ENCODE TARGET
# -----------------------------

encoder = LabelEncoder()

data["Target"] = encoder.fit_transform(
    data["Muscle_Group"]
)

# -----------------------------
# FEATURES
# -----------------------------

X = data[[
    "Left Leg (kg)",
    "Right Leg (kg)",
    "Total (kg)",
    "Difference",
    "Imbalance (%)",
    "Load Ratio",
    "Weak Side"
]]

y = data["Target"]

# -----------------------------
# SPLIT DATA
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# -----------------------------
# MODEL
# -----------------------------

model = GradientBoostingClassifier(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=5,
    random_state=42
)

model.fit(
    X_train,
    y_train
)

# -----------------------------
# TEST
# -----------------------------

y_pred = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    y_pred
)

print(f"Grouped Model Accuracy: {accuracy*100:.2f}%")

# Save model
joblib.dump(
    model,
    "model/muscle_model.pkl"
)

joblib.dump(
    encoder,
    "model/label_encoder.pkl"
)

print("Grouped model saved.")