// server.js - UPDATED FOR CANVAS FINGERPRINTS
const express = require('express');
const cors = require('cors');
const ProductionPredictor = require('./prediction');
const readyTheAccountFingerprints = require('./readyTheAccountFingerprints');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize predictor
const predictor = new ProductionPredictor();

console.log('🚀 Starting ML Server...');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mlSystem: predictor.getSystemHealth(),
    timestamp: new Date().toISOString()
  });
});

// 🎯 UPDATED PREDICTION ENDPOINT FOR CANVAS FINGERPRINTS
app.post('/predict', async (req, res) => {
  console.log('\n🎯 Received prediction request');
  
  try {
    const { current_fingerprint } = req.body;
    console.log('📦 Request body:', {
      device: current_fingerprint?.device,
      hasCanvasFP: !!current_fingerprint?.canvasFingerprint,
      canvasFields: current_fingerprint?.canvasFingerprint ? Object.keys(current_fingerprint.canvasFingerprint) : 'none'
    });

    // Validate request
    if (!current_fingerprint || !current_fingerprint.canvasFingerprint) {
      console.error('❌ Missing canvas fingerprint in request');
      return res.status(400).json({ 
        error: "Canvas fingerprint required",
        expected: {
          current_fingerprint: {
            device: "string",
            canvasFingerprint: {
              imageHash: "number",
              colorDistribution: { r: "number", g: "number", b: "number" },
              gradientPatterns: "array",
              edgeDetection: "number",
              noisePattern: "number", 
              entropy: "number",
              contrast: "number",
              meanBrightness: "number",
              renderingArtifacts: "number"
            }
          }
        }
      });
    }
    // Validate canvas fingerprint structure
    const canvasFP = current_fingerprint.canvasFingerprint;
    const requiredFields = [
      'imageHash', 'colorDistribution', 'gradientPatterns',
      'edgeDetection', 'noisePattern', 'entropy',
      'contrast', 'meanBrightness', 'renderingArtifacts'
    ];
    for (let field of requiredFields) {
      if (canvasFP[field] === undefined) {
        console.error(`❌ Missing canvas field: ${field}`);
        return res.status(400).json({ 
          error: `Missing canvas fingerprint field: ${field}`,
          received: Object.keys(canvasFP)
        });
      }
    }

    console.log('✅ Request validation passed', current_fingerprint.accountFingerprint);
    if(current_fingerprint.accountFingerprint!=null&&current_fingerprint.accountFingerprint!=undefined) {
  const result = await predictor.predict({
      currentFingerprint: current_fingerprint,
      accountFingerprints: current_fingerprint.accountFingerprint
    });
console.log('✅ Prediction completed:', {
      result: result.result,
      confidence: (result.confidence * 100).toFixed(1) + '%',
      matchedDevice: result.matchedDevice
    });
   res.json(result);
    }


    /* // Get account fingerprints
    const accountFingerprints = readyTheAccountFingerprints();
    console.log(`📊 Loaded ${accountFingerprints.length} account fingerprints`);

    // Make prediction
    const result = await predictor.predict({
      currentFingerprint: current_fingerprint,
      accountFingerprints: accountFingerprints
    });

    console.log('✅ Prediction completed:', {
      result: result.result,
      confidence: (result.confidence * 100).toFixed(1) + '%',
      matchedDevice: result.matchedDevice
    });

    res.json(result); */
    
  } catch (error) {
    console.error('❌ Prediction error:', error);
    res.status(500).json({ 
      error: "Prediction failed",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get system info
app.get('/system', async (req, res) => {
  try {
    const health = predictor.getSystemHealth();
    const insights = predictor.getModelInsights();
    
    res.json({
      health,
      insights,
      accountFingerprints: readyTheAccountFingerprints().map(fp => ({
        device: fp.device,
        hasCanvasFP: !!fp.canvasFingerprint
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  res.status(500).json({ 
    error: "Internal server error",
    message: error.message 
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ ML Server running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`🎯 Predict endpoint: http://localhost:${port}/predict`);
  console.log(`📊 System info: http://localhost:${port}/system`);
});

module.exports = app;