// readyTheAccountFingerprints.js
function readyTheAccountFingerprints() {
    return [
        {
            device: "desktop_firefox",
            hardwareGroup: "hardware_1", // 🧠 Same physical machine as desktop_chrome
            canvasFingerprint: {
                imageHash: 731759678,
                colorDistribution: { r: 212.85166666666666, g: 224.56256944444445, b: 198.6798263888889 },
                gradientPatterns: [1431655765,1430258005,1358954837,1431655765,1431568385,1431568385,1431568385,1431568385,1431568385,1431568385,1431655765,1431655765],
                edgeDetection: 3101,
                noisePattern: 5.848425925925926,
                entropy: 1.6755086957808583,
                contrast: 250.33333333333334,
                meanBrightness: 212.03135416666777,
                renderingArtifacts: 0.24166666666666667
            }
        },
        {
            device: "cloud_chrome",
            hardwareGroup: "hardware_2", // 🚫 Different machine
            canvasFingerprint: {
                imageHash: -941370649,
                colorDistribution: { r: 213.17128472222223, g: 224.70177083333334, b: 199.02972222222223 },
                gradientPatterns: [1431655765,1430258005,1363149141,1431655765,1431568385,1431568385,1431568385,1431568385,1431568385,1431568385,357913941,1431655765],
                edgeDetection: 3023,
                noisePattern: 5.857476851851687,
                entropy: 1.8981543307464752,
                contrast: 255,
                meanBrightness: 212.3009259259281,
                renderingArtifacts: 0.23649305555555555
            }
        },
         {
  "device": "desktop_chrome",
  hardwareGroup: "hardware_1", // 🧠 Same physical machine as desktop_chrome
  "canvasFingerprint": {
    "imageHash": 432401520,
    "colorDistribution": {
      "r": 213.15020833333332,
      "g": 224.91204861111112,
      "b": 198.83309027777779
    },
    "gradientPatterns": [
      1431655765,
      1430258005,
      1426063701,
      1431655765,
      1431568385,
      1431568385,
      1431568385,
      1431568385,
      1431568385,
      1431568385,
      1431655765,
      1431655765
    ],
    "edgeDetection": 3047,
    "noisePattern": 5.474513888888991,
    "entropy": 1.9295728787056308,
    "contrast": 250.33333333333334,
    "meanBrightness": 212.29844907407542,
    "renderingArtifacts": 0.23798611111111112
  }
}
    ];
}
module.exports = readyTheAccountFingerprints;

// ----------------------------------------------------
    // desktop_chrome_fingerprint
  /*      {
  "device": "desktop_chrome",
  "canvasFingerprint": {
    "imageHash": 432401520,
    "colorDistribution": {
      "r": 213.15020833333332,
      "g": 224.91204861111112,
      "b": 198.83309027777779
    },
    "gradientPatterns": [
      1431655765,
      1430258005,
      1426063701,
      1431655765,
      1431568385,
      1431568385,
      1431568385,
      1431568385,
      1431568385,
      1431568385,
      1431655765,
      1431655765
    ],
    "edgeDetection": 3047,
    "noisePattern": 5.474513888888991,
    "entropy": 1.9295728787056308,
    "contrast": 250.33333333333334,
    "meanBrightness": 212.29844907407542,
    "renderingArtifacts": 0.23798611111111112
  }
} */