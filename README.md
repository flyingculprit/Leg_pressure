# Leg Pressure Dashboard (Netlify-Only)

This project now supports fully static deployment on Netlify with in-browser ML inference.

## How it works

- Google Sheet CSV is read in React.
- Latest row is converted into model features in browser.
- ONNX model is executed using `onnxruntime-web`.
- Prediction + confidence + tips are shown in dashboard.

No backend server is required at runtime.

## One-time model conversion

You must generate `public/model/muscle_model.onnx` from your existing sklearn `.pkl` model.

1. Install Python tools (in any environment that has pip):

```bash
pip install joblib scikit-learn skl2onnx onnx
```

2. From project root, run:

```bash
python3 scripts/convert_model_to_onnx.py
```

This writes:
- `public/model/muscle_model.onnx`
- `public/model/class_labels.json`

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Netlify

- Build command: `npm run build`
- Publish directory: `dist`

Ensure `public/model/muscle_model.onnx` exists before deploy.
