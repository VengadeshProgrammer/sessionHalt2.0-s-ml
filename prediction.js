const { WorkingCanvasML, trainModel } = require('./model');

class ProductionPredictor {
  constructor() {
    this.ready = false;
    (async () => {
      await trainModel(); // Train once at startup
      this.ready = true;
    })();
  }

  async predict({ currentFingerprint }) {
    if (!this.ready) {
      console.warn('⏳ Model still warming up, please wait...');
    }
    return await WorkingCanvasML(currentFingerprint.canvasFingerprint);
  }

  getSystemHealth() {
    return { status: 'ok', uptime: process.uptime() };
  }

  getModelInsights() {
    return { version: 'SessionHalt 2.0', engine: 'TensorFlow.js' };
  }
}

module.exports = ProductionPredictor;
