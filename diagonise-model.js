// detailed-diagnostic-3072.js - UPDATED FOR YOUR 2 FINGERPRINTS
const readyTheAccountFingerprints = require('./readyTheAccountFingerprints');

class DetailedDiagnostic {
    runDetailedAnalysis() {
        const accountFingerprints = readyTheAccountFingerprints();
        
        console.log('📊 Available fingerprints:');
        accountFingerprints.forEach((fp, index) => {
            console.log(`   ${index + 1}. ${fp.device} - length: ${fp.downsampledWebGLFP.length}`);
        });

        const desktopFirefox = accountFingerprints.find(f => f.device === "desktop_firefox")?.downsampledWebGLFP;
        const desktopChrome = accountFingerprints.find(f => f.device === "desktop_chrome")?.downsampledWebGLFP;

        if (!desktopFirefox || !desktopChrome) {
            console.log('❌ Missing required fingerprints!');
            return;
        }

        console.log('\n🔍 DETAILED DIFFERENCE ANALYSIS (3072-length fingerprints)');
        console.log('==========================================================');
        console.log(`Fingerprint length: ${desktopFirefox.length}`);

        // Only compare the two fingerprints you have
        console.log('\n🎯 Desktop Firefox vs Desktop Chrome (SAME HARDWARE):');
        this.findExactDifferences(desktopFirefox, desktopChrome, 'Desktop Firefox', 'Desktop Chrome');

        // NEW: Analyze if these are suitable for ML training
        console.log('\n🎯 ML TRAINING SUITABILITY:');
        this.analyzeTrainingSuitability(desktopFirefox, desktopChrome);
    }

    findExactDifferences(fp1, fp2, name1, name2) {
        const differences = [];
        let totalDifferenceMagnitude = 0;
        
        for (let i = 0; i < fp1.length; i++) {
            if (fp1[i] !== fp2[i]) {
                const diff = Math.abs(fp1[i] - fp2[i]);
                differences.push({
                    index: i,
                    value1: fp1[i],
                    value2: fp2[i],
                    difference: diff
                });
                totalDifferenceMagnitude += diff;
            }
        }

        const similarity = ((fp1.length - differences.length) / fp1.length) * 100;
        
        console.log(`   Total differences: ${differences.length}/${fp1.length} (${similarity.toFixed(1)}% similar)`);
        console.log(`   Difference percentage: ${((differences.length / fp1.length) * 100).toFixed(1)}%`);
        console.log(`   Total difference magnitude: ${totalDifferenceMagnitude}`);
        
        // Show first 10 differences
        if (differences.length > 0) {
            console.log('   First 10 differences:');
            differences.slice(0, 10).forEach(diff => {
                console.log(`     [${diff.index}] ${name1}: ${diff.value1} vs ${name2}: ${diff.value2} (diff: ${diff.difference})`);
            });
        }

        // Show significant differences (>1)
        const significantDiffs = differences.filter(d => d.difference > 1);
        console.log(`   Significant differences (>1): ${significantDiffs.length}`);
        
        if (significantDiffs.length > 0) {
            console.log('   First 5 significant differences:');
            significantDiffs.slice(0, 5).forEach(diff => {
                console.log(`     [${diff.index}] ${name1}: ${diff.value1} vs ${name2}: ${diff.value2} (diff: ${diff.difference})`);
            });
        }

        // Analyze difference patterns
        const diffValues = differences.map(d => d.difference);
        const avgDiff = differences.length > 0 ? diffValues.reduce((a, b) => a + b, 0) / differences.length : 0;
        const maxDiff = differences.length > 0 ? Math.max(...diffValues) : 0;
        
        console.log(`   Average difference: ${avgDiff.toFixed(2)}`);
        console.log(`   Maximum difference: ${maxDiff}`);
        
        // Check if differences are clustered
        const clusters = this.findDifferenceClusters(differences.map(d => d.index));
        console.log(`   Difference clusters (3+ consecutive): ${clusters.length}`);
        clusters.forEach((cluster, i) => {
            console.log(`     Cluster ${i + 1}: positions ${cluster.start}-${cluster.end} (${cluster.size} differences)`);
        });
    }

    findDifferenceClusters(differenceIndexes) {
        const clusters = [];
        let currentCluster = null;
        
        differenceIndexes.sort((a, b) => a - b);
        
        for (let i = 0; i < differenceIndexes.length; i++) {
            if (currentCluster === null) {
                currentCluster = { start: differenceIndexes[i], end: differenceIndexes[i], size: 1 };
            } else if (differenceIndexes[i] <= currentCluster.end + 2) {
                currentCluster.end = differenceIndexes[i];
                currentCluster.size++;
            } else {
                if (currentCluster.size >= 3) {
                    clusters.push(currentCluster);
                }
                currentCluster = { start: differenceIndexes[i], end: differenceIndexes[i], size: 1 };
            }
        }
        
        if (currentCluster !== null && currentCluster.size >= 3) {
            clusters.push(currentCluster);
        }
        
        return clusters;
    }

    analyzeTrainingSuitability(desktopFirefox, desktopChrome) {
        console.log('   Same Hardware Analysis (Firefox vs Chrome on Desktop):');
        
        const similarity = this.calculateSimilarity(desktopFirefox, desktopChrome);
        console.log(`   Similarity: ${similarity.toFixed(1)}%`);
        
        // For ML training, we need some differences but not too many
        const differencePercentage = 100 - similarity;
        
        if (differencePercentage < 1) {
            console.log('   ❌ TOO SIMILAR: Fingerprints are virtually identical');
            console.log('   💡 Solution: Use more aggressive WebGL shaders or different downsampling');
        } else if (differencePercentage < 5) {
            console.log('   ⚠️  BORDERLINE: Small differences might work with careful ML tuning');
            console.log('   💡 Recommendation: Collect more diverse browser data');
        } else if (differencePercentage < 15) {
            console.log('   ✅ GOOD: Reasonable differences for same-hardware training');
            console.log('   💡 This should work for ML training');
        } else {
            console.log('   ❓ UNUSUAL: High differences for same hardware');
            console.log('   💡 Check if browsers are on exactly the same machine');
        }

        console.log(`\n   ML Training Strategy:`);
        console.log(`   - Use these as SAME HARDWARE examples`);
        console.log(`   - Generate synthetic DIFFERENT HARDWARE examples`);
        console.log(`   - Focus ML on the ${differencePercentage.toFixed(1)}% difference areas`);
    }

    calculateSimilarity(fp1, fp2) {
        let matches = 0;
        for (let i = 0; i < fp1.length; i++) {
            if (fp1[i] === fp2[i]) matches++;
        }
        return (matches / fp1.length) * 100;
    }
}

// Run detailed diagnostic
const diagnostic = new DetailedDiagnostic();
diagnostic.runDetailedAnalysis();