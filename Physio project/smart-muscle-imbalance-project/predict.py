import joblib
import pandas as pd

# Load trained model
model = joblib.load(
    "model/muscle_model.pkl"
)

# Load label encoder
encoder = joblib.load(
    "model/label_encoder.pkl"
)

# -----------------------------
# USER INPUT
# -----------------------------

left = float(input("Enter Left Load (P): "))
right = float(input("Enter Right Load (P): "))
total = float(input("Enter Total Load (P): "))

# -----------------------------
# FEATURE ENGINEERING
# -----------------------------

difference = abs(left - right)

imbalance_percent = (
    difference / total
) * 100

load_ratio = left / right

# Weak side encoding

if left < right:
    weak_side = 0

elif right < left:
    weak_side = 1

else:
    weak_side = 2

# Create DataFrame with column names

features = pd.DataFrame([{
    "Left Leg (kg)": left,
    "Right Leg (kg)": right,
    "Total (kg)": total,
    "Difference": difference,
    "Imbalance (%)": imbalance_percent,
    "Load Ratio": load_ratio,
    "Weak Side": weak_side
}])

# -----------------------------
# PREDICTION
# -----------------------------

prediction = model.predict(features)

muscle_group = encoder.inverse_transform(
    prediction
)[0]

# Confidence score

probabilities = model.predict_proba(features)

confidence = max(probabilities[0]) * 100

# -----------------------------
# OUTPUT
# -----------------------------

print("\nAffected Muscle Group:", muscle_group)

print(
    f"Prediction Confidence: {confidence:.2f}%"
)
