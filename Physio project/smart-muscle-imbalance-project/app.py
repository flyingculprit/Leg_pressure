from flask import Flask, jsonify, render_template, request
import joblib
import pandas as pd

app = Flask(__name__)

# -----------------------------
# LOAD MODEL
# -----------------------------

model = joblib.load(
    "model/muscle_model.pkl"
)

encoder = joblib.load(
    "model/label_encoder.pkl"
)

# -----------------------------
# MUSCLE RELAXATION TIPS
# -----------------------------

muscle_tips = {

"Left Tibialis Group":
"Do ankle circles, toe raises, and apply ice massage for 10 minutes.",

"Right Tibialis Group":
"Do ankle circles, toe raises, and apply ice massage for 10 minutes.",

"Left Calf Group":
"Perform calf stretching, heel raises, and use warm compress therapy.",

"Right Calf Group":
"Perform calf stretching, heel raises, and use warm compress therapy.",

"Left Quadriceps Group":
"Do quadriceps stretch, straight leg raises, and foam rolling.",

"Right Quadriceps Group":
"Do quadriceps stretch, straight leg raises, and foam rolling.",

"Left Hamstring Group":
"Perform hamstring stretch, gentle walking, and apply warm compress.",

"Right Hamstring Group":
"Perform hamstring stretch, gentle walking, and apply warm compress.",

"Left Adductor Group":
"Try butterfly stretch, inner thigh stretch, and mild heat therapy.",

"Right Adductor Group":
"Try butterfly stretch, inner thigh stretch, and mild heat therapy.",

"Left Glute Group":
"Perform glute stretch, piriformis stretch, and foam rolling.",

"Right Glute Group":
"Perform glute stretch, piriformis stretch, and foam rolling.",

"Balanced":
"Maintain good posture and continue regular stretching exercises."
}


def build_features(left, right, total):
    difference = abs(left - right)
    imbalance_percent = ((difference / total) * 100) if total else 0.0
    load_ratio = left / right if right else 0.0

    if left < right:
        weak_side = 0
    elif right < left:
        weak_side = 1
    else:
        weak_side = 2

    return pd.DataFrame([{
        "Left Leg (kg)": left,
        "Right Leg (kg)": right,
        "Total (kg)": total,
        "Difference": difference,
        "Imbalance (%)": imbalance_percent,
        "Load Ratio": load_ratio,
        "Weak Side": weak_side
    }])


def predict_muscle(left, right, total):
    features = build_features(left, right, total)
    prediction = model.predict(features)
    muscle_group = encoder.inverse_transform(prediction)[0]
    probabilities = model.predict_proba(features)
    confidence = max(probabilities[0]) * 100
    tips = muscle_tips.get(muscle_group, "Do light stretching and take proper rest.")
    return muscle_group, confidence, tips

# -----------------------------
# HOME PAGE
# -----------------------------

@app.route('/')
def home():
    return render_template("index.html")

# -----------------------------
# PREDICTION
# -----------------------------

@app.route('/predict', methods=['POST'])
def predict():

    left = float(request.form['left'])
    right = float(request.form['right'])
    total = float(request.form['total'])
    muscle_group, confidence, tips = predict_muscle(left, right, total)

    return render_template(

        "result.html",

        muscle=muscle_group,
        confidence=f"{confidence:.2f}",
        tips=tips

    )


@app.route('/predict-json', methods=['POST', 'OPTIONS'])
def predict_json():
    if request.method == 'OPTIONS':
        response = jsonify({"ok": True})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    payload = request.get_json(silent=True) or {}
    left = float(payload.get('left', 0))
    right = float(payload.get('right', 0))
    total = float(payload.get('total', (left + right)))

    muscle_group, confidence, tips = predict_muscle(left, right, total)

    response = jsonify({
        "muscle": muscle_group,
        "confidence": round(confidence, 2),
        "tips": tips
    })
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

# -----------------------------
# RUN SERVER
# -----------------------------

if __name__ == "__main__":
    app.run(debug=True)
