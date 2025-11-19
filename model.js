const tf = require("@tensorflow/tfjs");

// pad a single array
function padArray(arr, targetSize) {
  if (!Array.isArray(arr)) arr = [arr];

  const copy = [...arr];
  while (copy.length < targetSize) copy.push(0);
  return copy.slice(0, targetSize);
}

function diffVector(a, b) {
  const size = Math.max(a.length || 1, b.length || 1);

  const aa = padArray(a, size);
  const bb = padArray(b, size);

  return aa.map((v, i) => Math.abs(v - bb[i]) / 255);
}

let model = null;

async function trainModel(dataset) {
  console.log("🚀 Training ML model...");

  const X = [];
  const y = [];

  const anchor = dataset.anchor;

  dataset.sameHardware.forEach(fp => {
    X.push(diffVector(anchor, fp));
    y.push(1);
  });

  dataset.differentHardware.forEach(fp => {
    X.push(diffVector(anchor, fp));
    y.push(0);
  });

  const xs = tf.tensor2d(X);
  const ys = tf.tensor2d(y, [y.length, 1]);

  model = tf.sequential();
  model.add(tf.layers.dense({ units: 64, activation: "relu", inputShape: [X[0].length] }));
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({
    optimizer: tf.train.adam(0.005),
    loss: "binaryCrossentropy"
  });

  await model.fit(xs, ys, { epochs: 150 });

  console.log("✔ Training complete!");
}

async function predict(anchorFp, testFp) {
  if (!model) return { error: "Model not trained" };

  const diff = diffVector(anchorFp, testFp);
  const input = tf.tensor2d([diff]);
  const output = model.predict(input);
  const probability = (await output.data())[0];

  return { probability };
}

module.exports = { trainModel, predict };

