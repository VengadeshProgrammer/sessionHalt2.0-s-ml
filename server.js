const express = require("express");
const dataset = require("./dataset");
const ML = require("./model");
const { predict } = require("./model");   // ← FIXED IMPORT
const app = express();
app.use(express.json());

(async () => {
  await ML.trainModel(dataset);
})();

app.post("/predict", async (req, res) => {
  const fp = req.body.fingerprint;

  console.log("Received fingerprint:", fp);

  if (!fp || !Array.isArray(fp) || fp.length < 10) {
    return res.json({
      success: false,
      mlResult: { error: "Invalid fingerprint" }
    });
  }

  try {
    const result = await predict(dataset.anchor, fp);
    if(result["probability"]>0.95) {
    return res.json({mlResult: "Legitimate Change", prob:result});
    }
    return res.json({mlResult: "Session Stealer", prob:result});
  } catch (err) {
    console.error("Prediction error:", err);
    return res.json({
      success: false,
      mlResult: { error: "Prediction failed" }
    });
  }
});
app.post("/replace", async (req, res) => {
  const fp = req.body.fingerprint;

  if (!fp || !Array.isArray(fp) || fp.length < 10) {
    return res.json({
      success: false,
      error: "Invalid fingerprint"
    });
  }

  try {
    let bestMatchIndex = -1;
    let bestProbability = -1;

    // Compare fingerprint with ALL fingerprints in dataset
    for (let i = 0; i < dataset.all.length; i++) {
      const compareFp = dataset.all[i];

      const result = await predict(compareFp, fp);

      if (result.probability > bestProbability) {
        bestProbability = result.probability;
        bestMatchIndex = i;
      }
    }

    // Determine legitimacy
    const classification =
      bestProbability > 0.95 ? "Legitimate Change" : "Session Stealer";

    return res.json({
      success: true,
      classification,
      bestMatchIndex,
      probability: bestProbability
    });

  } catch (err) {
    console.error("Replace prediction error:", err);
    return res.json({
      success: false,
      error: "Prediction failed"
    });
  }
});



app.listen(5000, () => {
  console.log("⚡ ML Fingerprint Server running on port 5000");
});
