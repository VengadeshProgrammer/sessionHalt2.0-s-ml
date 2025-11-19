const { trainModel, predictFingerprint } = require("./model");

class ProductionPredictor {
  constructor() {
    this.ready = false;
    (async () => {
      const realData = require("./readyTheAccountFingerprints")();
      await trainModel(realData);
      this.ready = true;
    })();
  }

  async predict(fingerprintArray) {
    if (!this.ready) {
      console.log("⏳ Model warming up...");
      return { matchProbability: 0 };
    }
    return await predictFingerprint(fingerprintArray);
  }

  getSystemHealth() {
    return { status: "ok", uptime: process.uptime() };
  }

  getModelInsights() {
    return { version: "Dev Fingerprint v1", engine: "TensorFlow.js", inputLength: 100 };
  }
}

module.exports = ProductionPredictor;
