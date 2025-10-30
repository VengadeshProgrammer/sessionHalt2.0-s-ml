// model.js
const tf = require('@tensorflow/tfjs');
const readyTheAccountFingerprints = require('./readyTheAccountFingerprints');

let trainedModel = null;
let datasetCache = null;

function featureExtractor(fp) {
  return [
    fp.imageHash / 1e9,
    fp.colorDistribution.r / 255,
    fp.colorDistribution.g / 255,
    fp.colorDistribution.b / 255,
    fp.entropy / 10,
    fp.contrast / 300,
    fp.meanBrightness / 255,
    fp.noisePattern / 10,
    fp.renderingArtifacts
  ];
}

async function trainModel() {
  console.log('🧠 Initializing SessionHalt 2.0 ML Model (once)');

  const dataset = readyTheAccountFingerprints();
  datasetCache = dataset;

  const samePairs = [];
  const diffPairs = [];

  for (let i = 0; i < dataset.length; i++) {
    for (let j = i + 1; j < dataset.length; j++) {
      const a = dataset[i];
      const b = dataset[j];
      const sameHardware = a.hardwareGroup === b.hardwareGroup;
      const label = sameHardware ? 1 : 0;
      (sameHardware ? samePairs : diffPairs).push({ a, b, label });
    }
  }

  console.log(`📊 Training data summary:\n   Same: ${samePairs.length}\n   Diff: ${diffPairs.length}`);

  const pairs = [...samePairs, ...diffPairs];
  const xs = [];
  const ys = [];

  pairs.forEach(({ a, b, label }) => {
    xs.push([...featureExtractor(a.canvasFingerprint), ...featureExtractor(b.canvasFingerprint)]);
    ys.push([label]);
  });

  const xTensor = tf.tensor2d(xs);
  const yTensor = tf.tensor2d(ys);

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [xs[0].length], units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  model.compile({ optimizer: tf.train.adam(0.01), loss: 'binaryCrossentropy', metrics: ['accuracy'] });

  await model.fit(xTensor, yTensor, {
    epochs: 40,
    shuffle: true,
    verbose: 0,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if ((epoch + 1) % 10 === 0)
          console.log(`⚡ Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)} acc=${logs.acc.toFixed(4)}`);
      }
    }
  });

  const acc = (await model.evaluate(xTensor, yTensor))[1].dataSync()[0].toFixed(4);
  console.log(`✅ Training complete, final acc: ${acc}`);

  trainedModel = model;
  return model;
}

async function WorkingCanvasML(currentFP) {
  if (!trainedModel) {
    console.log('⚙️ Model not trained yet — training now...');
    await trainModel();
  }

  const threshold = 0.7;
  const results = [];

  for (const known of datasetCache) {
    const input = tf.tensor2d([
      [...featureExtractor(currentFP), ...featureExtractor(known.canvasFingerprint)]
    ]);
    const prob = trainedModel.predict(input).dataSync()[0];
    results.push({ device: known.device, prob });
  }

  console.log('\n🖥️ Hardware Matching Results:');
  results.forEach(r => {
    const mark = r.prob >= threshold ? '✅ SAME' : '❌ DIFF';
    console.log(`   ${r.device.padEnd(20)}: ${(r.prob * 100).toFixed(1)}% - ${mark}`);
  });

  const best = results.reduce((a, b) => (a.prob > b.prob ? a : b));
  const decision = best.prob >= threshold ? 'Legitimate Change' : 'SessionStealer';

  console.log(`\n✅ Final Decision: ${decision} (Confidence ${(best.prob * 100).toFixed(1)}%)`);

  return {
    result: decision,
    confidence: `${(best.prob * 100).toFixed(1)}%`,
    matchedDevice: best.device
  };
}

module.exports = { WorkingCanvasML, trainModel };
