import * as ort from 'onnxruntime-web';

const MODEL_PATH = '/model/muscle_model.onnx';
const LABELS_PATH = '/model/class_labels.json';

let sessionPromise = null;
let labelsPromise = null;
const TIP_BY_GROUP = {
  'Left Tibialis Group': 'Do ankle circles, toe raises, and apply ice massage for 10 minutes.',
  'Right Tibialis Group': 'Do ankle circles, toe raises, and apply ice massage for 10 minutes.',
  'Left Calf Group': 'Perform calf stretching, heel raises, and use warm compress therapy.',
  'Right Calf Group': 'Perform calf stretching, heel raises, and use warm compress therapy.',
  'Left Quadriceps Group': 'Do quadriceps stretch, straight leg raises, and foam rolling.',
  'Right Quadriceps Group': 'Do quadriceps stretch, straight leg raises, and foam rolling.',
  'Left Hamstring Group': 'Perform hamstring stretch, gentle walking, and apply warm compress.',
  'Right Hamstring Group': 'Perform hamstring stretch, gentle walking, and apply warm compress.',
  'Left Adductor Group': 'Try butterfly stretch, inner thigh stretch, and mild heat therapy.',
  'Right Adductor Group': 'Try butterfly stretch, inner thigh stretch, and mild heat therapy.',
  'Left Glute Group': 'Perform glute stretch, piriformis stretch, and foam rolling.',
  'Right Glute Group': 'Perform glute stretch, piriformis stretch, and foam rolling.',
  Balanced: 'Maintain good posture and continue regular stretching exercises.'
};

async function getSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const modelResponse = await fetch(MODEL_PATH, { cache: 'no-cache' });
      if (!modelResponse.ok) {
        throw new Error('muscle_model.onnx not found in /public/model. Generate it and redeploy.');
      }

      const contentType = modelResponse.headers.get('content-type') || '';
      const modelBytes = await modelResponse.arrayBuffer();
      const byteLength = modelBytes.byteLength;

      if (contentType.includes('text/html')) {
        throw new Error('Model path returned HTML instead of ONNX. Check Netlify redirects and file path.');
      }
      if (byteLength < 1024) {
        throw new Error('Model file is too small/invalid. Re-generate muscle_model.onnx and redeploy.');
      }

      return ort.InferenceSession.create(modelBytes, {
        executionProviders: ['wasm']
      });
    })();
  }
  return sessionPromise;
}

async function getLabels() {
  if (!labelsPromise) {
    labelsPromise = fetch(LABELS_PATH).then(async (res) => {
      if (!res.ok) {
        throw new Error('class_labels.json not found. Run the ONNX conversion step first.');
      }
      const payload = await res.json();
      if (!Array.isArray(payload.classes)) {
        throw new Error('class_labels.json must contain a classes array.');
      }
      return payload.classes;
    });
  }
  return labelsPromise;
}

function buildFeatures(left, right, total) {
  const difference = Math.abs(left - right);
  const imbalancePercent = total ? (difference / total) * 100 : 0;
  const loadRatio = right ? left / right : 0;

  let weakSide = 2;
  if (left < right) weakSide = 0;
  else if (right < left) weakSide = 1;

  return [
    left,
    right,
    total,
    difference,
    imbalancePercent,
    loadRatio,
    weakSide
  ];
}

export async function predictMuscleFromLoads({ left, right, total }) {
  const l = Number(left);
  const r = Number(right);
  const t = Number.isFinite(Number(total)) ? Number(total) : (l + r);

  if (![l, r, t].every(Number.isFinite)) {
    throw new Error('Invalid input values for prediction.');
  }

  const [session, classes] = await Promise.all([getSession(), getLabels()]);
  const inputName = session.inputNames[0];
  const featureValues = buildFeatures(l, r, t);

  const inputTensor = new ort.Tensor('float32', Float32Array.from(featureValues), [1, 7]);
  const outputs = await session.run({ [inputName]: inputTensor });

  const labelName = session.outputNames.find((name) => name.toLowerCase().includes('label')) || session.outputNames[0];
  const probName = session.outputNames.find((name) => name.toLowerCase().includes('prob')) || session.outputNames[1];

  if (!outputs[labelName]) {
    throw new Error('Model output does not include labels.');
  }

  const rawLabel = outputs[labelName].data[0];
  const labelIndex = Number(rawLabel);
  const muscle = classes[labelIndex] || `Class ${labelIndex}`;

  let confidence = null;
  if (probName && outputs[probName] && outputs[probName].data) {
    const probs = outputs[probName].data;
    if (labelIndex >= 0 && labelIndex < probs.length) {
      confidence = Number((probs[labelIndex] * 100).toFixed(2));
    }
  }

  return {
    muscle,
    confidence,
    tips: TIP_BY_GROUP[muscle] || 'Do light stretching and take proper rest.',
    input: { left: l, right: r, total: t }
  };
}

export async function warmupPredictor() {
  await Promise.all([getSession(), getLabels()]);
}
