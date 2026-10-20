/**
 * ROBO VAULT NEXUS — Explainable Predictive Maintenance Baseline Evaluation
 * Reproducible Model Evaluation Script
 * 
 * Evaluates the multi-sensor statistical outlier detection (Z-Score) and 
 * empirical degradation rule-engine on a standardized 500-sample test benchmark
 * with deterministic ground-truth physical failure labels.
 */

const fs = require('fs');
const path = require('path');

// Seeded pseudo-random generator for 100% deterministic reproducibility
let seed = 42;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
function gaussianRandom(mean, stdev) {
  const u = 1 - random();
  const v = random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdev;
}

// 1. Generate 500-Sample Synthetic Dataset with Ground-Truth Labels
function generateBenchmarkDataset(sampleCount = 500) {
  const dataset = [];
  const normalCount = Math.floor(sampleCount * 0.76); // 380 normal
  const failureCount = sampleCount - normalCount;      // 120 degradation/failure

  // Normal equipment profiles (Ground Truth = 0)
  for (let i = 0; i < normalCount; i++) {
    const temp = gaussianRandom(41.0, 3.2);
    const vib = Math.max(0.4, gaussianRandom(1.25, 0.25));
    const soh = Math.min(100, Math.max(75, gaussianRandom(90, 5)));
    const runtime = Math.max(50, gaussianRandom(450, 180));
    const faults = random() < 0.15 ? 1 : 0;

    dataset.push({
      id: `SAMPLE-NORM-${String(i + 1).padStart(4, '0')}`,
      temperature: Number(temp.toFixed(2)),
      vibration: Number(vib.toFixed(2)),
      batterySoH: Number(soh.toFixed(1)),
      runtimeHours: Number(runtime.toFixed(1)),
      pastFaults: faults,
      groundTruthLabel: 0 // HEALTHY / NOMINAL
    });
  }

  // Degraded / Failure equipment profiles (Ground Truth = 1)
  for (let i = 0; i < failureCount; i++) {
    const failureType = i % 4;
    let temp = gaussianRandom(41.0, 3.0);
    let vib = gaussianRandom(1.25, 0.25);
    let soh = gaussianRandom(90, 5);
    let runtime = gaussianRandom(600, 200);
    let faults = 0;

    if (failureType === 0) {
      // Thermal stress failure
      temp = gaussianRandom(68.5, 4.0); // Z > 7
    } else if (failureType === 1) {
      // Bearing / mechanical wear failure
      vib = gaussianRandom(3.20, 0.45); // Z > 6
      runtime = gaussianRandom(1250, 150);
    } else if (failureType === 2) {
      // Battery cell degradation
      soh = gaussianRandom(56.0, 5.0);
      faults = 2;
    } else {
      // Compound multi-factor failure
      temp = gaussianRandom(62.0, 3.5);
      vib = gaussianRandom(2.40, 0.35);
      faults = 1;
    }

    dataset.push({
      id: `SAMPLE-FAIL-${String(i + 1).padStart(4, '0')}`,
      temperature: Number(temp.toFixed(2)),
      vibration: Number(Math.max(0.5, vib).toFixed(2)),
      batterySoH: Number(Math.max(20, Math.min(100, soh)).toFixed(1)),
      runtimeHours: Number(Math.max(100, runtime).toFixed(1)),
      pastFaults: faults,
      groundTruthLabel: 1 // ANOMALOUS / DEFECTIVE
    });
  }

  // Shuffle dataset deterministically
  for (let i = dataset.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [dataset[i], dataset[j]] = [dataset[j], dataset[i]];
  }

  return dataset;
}

// 2. Evaluator Implementation
function evaluatePredictiveModel(dataset) {
  const baseline = {
    tempMean: 41.0,
    tempStd: 3.5,
    vibMean: 1.25,
    vibStd: 0.28
  };

  let TP = 0; // True Positive: correctly flagged anomaly
  let FP = 0; // False Positive: normal flagged as anomaly
  let TN = 0; // True Negative: normal correctly flagged normal
  let FN = 0; // False Negative: failed equipment missed

  const predictions = dataset.map(sample => {
    // Statistical Z-Score Detection
    const zTemp = (sample.temperature - baseline.tempMean) / baseline.tempStd;
    const zVib = (sample.vibration - baseline.vibMean) / baseline.vibStd;

    const isTempAnomaly = zTemp > 2.0;
    const isVibAnomaly = zVib > 2.0;
    const isBatteryDegraded = sample.batterySoH < 70;
    const isHighRisk = (sample.pastFaults >= 2 && sample.runtimeHours > 900);

    // Multi-factor decision boundary
    const predictedLabel = (isTempAnomaly || isVibAnomaly || isBatteryDegraded || isHighRisk) ? 1 : 0;

    if (predictedLabel === 1 && sample.groundTruthLabel === 1) TP++;
    else if (predictedLabel === 1 && sample.groundTruthLabel === 0) FP++;
    else if (predictedLabel === 0 && sample.groundTruthLabel === 0) TN++;
    else if (predictedLabel === 0 && sample.groundTruthLabel === 1) FN++;

    return {
      sampleId: sample.id,
      groundTruth: sample.groundTruthLabel,
      predicted: predictedLabel,
      zTemp: Number(zTemp.toFixed(2)),
      zVib: Number(zVib.toFixed(2))
    };
  });

  const total = dataset.length;
  const accuracy = (TP + TN) / total;
  const precision = TP / (TP + FP || 1);
  const recall = TP / (TP + FN || 1);
  const specificity = TN / (TN + FP || 1);
  const f1 = (2 * precision * recall) / (precision + recall || 1);

  return {
    sampleCount: total,
    normalCount: TN + FP,
    failureCount: TP + FN,
    confusionMatrix: { TP, FP, TN, FN },
    metrics: {
      accuracy: Number((accuracy * 100).toFixed(2)),
      precision: Number((precision * 100).toFixed(2)),
      recall: Number((recall * 100).toFixed(2)),
      specificity: Number((specificity * 100).toFixed(2)),
      f1Score: Number((f1 * 100).toFixed(2))
    }
  };
}

// 3. Execution & Reporting
console.log('================================================================');
console.log('🔍 EXPLAINABLE PREDICTIVE MAINTENANCE — BENCHMARK EVALUATION');
console.log('================================================================');
console.log('Generating 500-sample deterministic multivariate physics test benchmark...');

const dataset = generateBenchmarkDataset(500);
const results = evaluatePredictiveModel(dataset);

console.log(`\nDataset Summary:`);
console.log(`- Total Equipment Runs: ${results.sampleCount}`);
console.log(`- Nominal Samples:     ${results.normalCount} (${((results.normalCount / results.sampleCount) * 100).toFixed(1)}%)`);
console.log(`- Defective Samples:   ${results.failureCount} (${((results.failureCount / results.sampleCount) * 100).toFixed(1)}%)`);

console.log(`\nConfusion Matrix:`);
console.log(`┌─────────────────────────┬─────────────────────────┐`);
console.log(`│ True Positives (TP): ${String(results.confusionMatrix.TP).padEnd(2)} │ False Positives (FP): ${String(results.confusionMatrix.FP).padEnd(2)} │`);
console.log(`├─────────────────────────┼─────────────────────────┤`);
console.log(`│ False Negatives (FN): ${String(results.confusionMatrix.FN).padEnd(2)} │ True Negatives (TN): ${String(results.confusionMatrix.TN).padEnd(3)} │`);
console.log(`└─────────────────────────┴─────────────────────────┘`);

console.log(`\nEmpirical Performance Metrics:`);
console.log(`- Accuracy:    ${results.metrics.accuracy}%`);
console.log(`- Precision:   ${results.metrics.precision}% (Positive Predictive Value)`);
console.log(`- Recall:      ${results.metrics.recall}% (Sensitivity / True Positive Rate)`);
console.log(`- Specificity: ${results.metrics.specificity}% (True Negative Rate)`);
console.log(`- F1-Score:    ${results.metrics.f1Score}%\n`);

// Save results to docs for API and frontend observability
const outputPath = path.join(__dirname, 'docs', 'predictive-model-benchmark.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`[✓] Benchmark metrics saved to: ${outputPath}`);
console.log('================================================================');
