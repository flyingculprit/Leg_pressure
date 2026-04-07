#!/usr/bin/env python3
from pathlib import Path
import json

import joblib
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / 'Physio project' / 'smart-muscle-imbalance-project' / 'model'
OUTPUT_DIR = ROOT / 'public' / 'model'

MODEL_PKL = MODEL_DIR / 'muscle_model.pkl'
ENCODER_PKL = MODEL_DIR / 'label_encoder.pkl'
MODEL_ONNX = OUTPUT_DIR / 'muscle_model.onnx'
LABELS_JSON = OUTPUT_DIR / 'class_labels.json'


def main():
  OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

  if not MODEL_PKL.exists():
    raise FileNotFoundError(f'Missing model file: {MODEL_PKL}')
  if not ENCODER_PKL.exists():
    raise FileNotFoundError(f'Missing label encoder file: {ENCODER_PKL}')

  model = joblib.load(MODEL_PKL)
  encoder = joblib.load(ENCODER_PKL)

  initial_types = [('float_input', FloatTensorType([None, 7]))]
  options = {id(model): {'zipmap': False}}
  onnx_model = convert_sklearn(model, initial_types=initial_types, options=options)

  MODEL_ONNX.write_bytes(onnx_model.SerializeToString())

  labels_payload = {'classes': [str(v) for v in encoder.classes_]}
  LABELS_JSON.write_text(json.dumps(labels_payload, indent=2), encoding='utf-8')

  print(f'Wrote ONNX model: {MODEL_ONNX}')
  print(f'Wrote class labels: {LABELS_JSON}')


if __name__ == '__main__':
  main()
