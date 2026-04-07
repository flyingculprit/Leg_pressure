import fs from 'node:fs';
import path from 'node:path';

const modelPath = path.join(process.cwd(), 'public', 'model', 'muscle_model.onnx');

if (!fs.existsSync(modelPath)) {
  console.error('\nMissing model file:', modelPath);
  console.error('Run: python3 scripts/convert_model_to_onnx.py\n');
  process.exit(1);
}

const size = fs.statSync(modelPath).size;
if (size < 1024) {
  console.error(`\nInvalid model file size (${size} bytes): ${modelPath}`);
  console.error('Re-generate ONNX and try again.\n');
  process.exit(1);
}

console.log(`Model file OK: ${modelPath} (${size} bytes)`);
