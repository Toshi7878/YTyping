import type { BuiltMapLineWithOption } from "../types";

/**
 * 総合難易度を計算（0-100のスケール）
 */
export function calculateOverallDifficulty(lines: BuiltMapLineWithOption[]): number {
  const speedScore = calculateSpeedScore(lines);
  const staminaScore = calculateStaminaScore(lines);
  const complexityScore = calculateComplexityScore(lines);
  const densityScore = calculateDensityScore(lines);
  const varianceScore = calculateVarianceScore(lines);

  // 重み付け平均（速度を最重要視）
  const weights = {
    speed: 0.35, // 速度: 35%
    stamina: 0.25, // 持続性: 25%
    complexity: 0.2, // 複雑さ: 20%
    density: 0.1, // 密度: 10%
    variance: 0.1, // 変化: 10%
  };

  const totalScore =
    speedScore * weights.speed +
    staminaScore * weights.stamina +
    complexityScore * weights.complexity +
    densityScore * weights.density +
    varianceScore * weights.variance;

  return Math.min(100, Math.max(0, totalScore));
}

/**
 * 詳細な難易度内訳を計算
 */
export function calculateDetailedDifficulty(lines: BuiltMapLineWithOption[]) {
  return {
    overall: calculateOverallDifficulty(lines),
    breakdown: {
      speed: calculateSpeedScore(lines),
      stamina: calculateStaminaScore(lines),
      complexity: calculateComplexityScore(lines),
      density: calculateDensityScore(lines),
      variance: calculateVarianceScore(lines),
    },
    stats: {
      avgKpm: calculateAverageKpm(lines),
      maxKpm: calculateMaxKpm(lines),
      medianKpm: calculateMedianKpm(lines),
      totalNotes: calculateTotalNotes(lines),
      duration: calculateDuration(lines),
      peakDensity: calculatePeakDensity(lines),
    },
  };
}

/**
 * 速度スコア（KPMベース）
 * 0-100のスケールで返す
 */
function calculateSpeedScore(lines: BuiltMapLineWithOption[]): number {
  const validLines = lines.filter((line) => line.kpm && line.kpm.roma > 0);
  if (validLines.length === 0) return 0;

  const medianKpm = calculateMedianKpm(validLines);
  const maxKpm = calculateMaxKpm(validLines);

  // KPMの難易度基準
  // 100 KPM: 初心者, 200 KPM: 中級者, 300+ KPM: 上級者, 400+ KPM: エキスパート
  const medianScore = Math.min(100, (medianKpm / 400) * 100);
  const maxScore = Math.min(100, (maxKpm / 500) * 100);

  // 中央値を70%、最大値を30%の重みで計算
  return medianScore * 0.7 + maxScore * 0.3;
}

/**
 * 持続性スコア（長時間の高速タイピング）
 */
function calculateStaminaScore(lines: BuiltMapLineWithOption[]): number {
  const validLines = lines.filter((line) => line.kpm && line.kpm.roma > 0);
  if (validLines.length === 0) return 0;

  const duration = calculateDuration(validLines);
  const avgKpm = calculateAverageKpm(validLines);

  // 高速区間の持続時間を計算（KPM 250以上）
  let highSpeedDuration = 0;
  for (let i = 0; i < validLines.length - 1; i++) {
    const line = validLines[i];
    const nextLine = validLines[i + 1];
    if (line && nextLine && line.kpm.roma >= 250) {
      highSpeedDuration += nextLine.time - line.time;
    }
  }

  // 持続時間の割合
  const highSpeedRatio = duration > 0 ? highSpeedDuration / duration : 0;

  // 平均速度と持続時間の両方を考慮
  const durationFactor = Math.min(100, (duration / 180) * 100); // 3分で満点
  const speedFactor = Math.min(100, (avgKpm / 300) * 100);
  const sustainFactor = highSpeedRatio * 100;

  return durationFactor * 0.3 + speedFactor * 0.4 + sustainFactor * 0.3;
}

/**
 * 複雑さスコア（打ちにくい文字列）
 */
function calculateComplexityScore(lines: BuiltMapLineWithOption[]): number {
  const validLines = lines.filter((line) => line.word && line.word.length > 0);
  if (validLines.length === 0) return 0;

  let totalComplexity = 0;
  let totalWeight = 0;

  for (const line of validLines) {
    const lineComplexity = calculateLineComplexity(line);
    const lineLength = line.kanaWord?.length || 0;
    totalComplexity += lineComplexity * lineLength;
    totalWeight += lineLength;
  }

  const avgComplexity = totalWeight > 0 ? totalComplexity / totalWeight : 0;
  return Math.min(100, avgComplexity * 100);
}

/**
 * 1行の複雑さを計算
 */
function calculateLineComplexity(line: BuiltMapLineWithOption): number {
  if (!line.word || line.word.length === 0) return 0;

  let complexityScore = 0;
  const totalChunks = line.word.length;

  for (let i = 0; i < line.word.length; i++) {
    const chunk = line.word[i];
    if (!chunk) continue;

    const firstRoma = chunk.romaPatterns[0];
    if (!firstRoma) continue;

    // 長い打鍵（4文字以上）
    if (firstRoma.length >= 4) complexityScore += 0.3;

    // 連続する同じ文字（例: "っ" -> "ttu"）
    const hasSameChar = /(.)\1{2,}/.test(firstRoma);
    if (hasSameChar) complexityScore += 0.2;

    // 小文字の特殊入力（ゃ、ゅ、ょ、っ など）
    if (chunk.kana && /[ぁぃぅぇぉゃゅょゎっ]/.test(chunk.kana)) {
      complexityScore += 0.15;
    }

    // 長音記号
    if (chunk.kana?.includes("ー")) {
      complexityScore += 0.1;
    }

    // nで終わる（次の文字との関係で打ちにくい）
    if (firstRoma.endsWith("n") && i < line.word.length - 1) {
      const nextChunk = line.word[i + 1];
      const nextRoma = nextChunk?.romaPatterns[0];
      if (nextRoma && /^[aiueony]/.test(nextRoma)) {
        complexityScore += 0.25; // "nn"を打たなければならない
      }
    }
  }

  return totalChunks > 0 ? complexityScore / totalChunks : 0;
}

/**
 * 密度スコア（ノート密度）
 */
function calculateDensityScore(lines: BuiltMapLineWithOption[]): number {
  const validLines = lines.filter((line) => line.notes && line.notes.roma > 0);
  if (validLines.length === 0) return 0;

  const totalNotes = calculateTotalNotes(validLines);
  const duration = calculateDuration(validLines);

  if (duration === 0) return 0;

  // ノート密度（秒あたりのノート数）
  const notesPerSecond = totalNotes / duration;

  // 密度の基準: 2/s = 初心者, 4/s = 中級者, 6/s = 上級者, 8+/s = エキスパート
  return Math.min(100, (notesPerSecond / 8) * 100);
}

/**
 * 変化スコア（速度の変化幅）
 */
function calculateVarianceScore(lines: BuiltMapLineWithOption[]): number {
  const validLines = lines.filter((line) => line.kpm && line.kpm.roma > 0);
  if (validLines.length === 0) return 0;

  const kpmValues = validLines.map((line) => line.kpm.roma);
  const mean = kpmValues.reduce((a, b) => a + b, 0) / kpmValues.length;
  const variance = kpmValues.reduce((sum, val) => sum + (val - mean) ** 2, 0) / kpmValues.length;
  const stdDev = Math.sqrt(variance);

  // 変動係数（CV: Coefficient of Variation）
  const cv = mean > 0 ? stdDev / mean : 0;

  // CVの基準: 0.3 = 低変化, 0.5 = 中変化, 0.7+ = 高変化
  return Math.min(100, (cv / 0.7) * 100);
}

/**
 * ピーク密度（最も密度が高い10秒間）
 */
function calculatePeakDensity(lines: BuiltMapLineWithOption[]): number {
  const validLines = lines.filter((line) => line.notes && line.notes.roma > 0);
  if (validLines.length === 0) return 0;

  const windowSize = 10; // 10秒のウィンドウ
  let maxDensity = 0;

  for (let i = 0; i < validLines.length; i++) {
    const startTime = validLines[i]?.time || 0;
    const endTime = startTime + windowSize;

    const notesInWindow = validLines
      .filter((line) => line.time >= startTime && line.time < endTime)
      .reduce((sum, line) => sum + (line.notes?.roma || 0), 0);

    const density = notesInWindow / windowSize;
    maxDensity = Math.max(maxDensity, density);
  }

  return maxDensity;
}

// ヘルパー関数
function calculateAverageKpm(lines: BuiltMapLineWithOption[]): number {
  const validLines = lines.filter((line) => line.kpm && line.kpm.roma > 0);
  if (validLines.length === 0) return 0;

  const totalKpm = validLines.reduce((sum, line) => sum + line.kpm.roma, 0);
  return totalKpm / validLines.length;
}

function calculateMaxKpm(lines: BuiltMapLineWithOption[]): number {
  const validLines = lines.filter((line) => line.kpm && line.kpm.roma > 0);
  if (validLines.length === 0) return 0;

  return Math.max(...validLines.map((line) => line.kpm.roma));
}

function calculateMedianKpm(lines: BuiltMapLineWithOption[]): number {
  const validLines = lines.filter((line) => line.kpm && line.kpm.roma > 0);
  if (validLines.length === 0) return 0;

  const kpmValues = validLines.map((line) => line.kpm.roma).sort((a, b) => a - b);
  const mid = Math.floor(kpmValues.length / 2);

  return kpmValues.length % 2 === 0 ? ((kpmValues[mid - 1] || 0) + (kpmValues[mid] || 0)) / 2 : kpmValues[mid] || 0;
}

function calculateTotalNotes(lines: BuiltMapLineWithOption[]): number {
  return lines.reduce((sum, line) => sum + (line.notes?.roma || 0), 0);
}

function calculateDuration(lines: BuiltMapLineWithOption[]): number {
  if (lines.length === 0) return 0;
  const lastLine = lines[lines.length - 1];
  const firstLine = lines[0];
  return (lastLine?.time || 0) - (firstLine?.time || 0);
}

/**
 * 難易度を文字列表現に変換
 */
export function getDifficultyLabel(score: number): string {
  if (score >= 90) return "EXPERT+";
  if (score >= 75) return "EXPERT";
  if (score >= 60) return "HARD";
  if (score >= 40) return "NORMAL";
  if (score >= 20) return "EASY";
  return "BEGINNER";
}

/**
 * 難易度の色を取得
 */
export function getDifficultyColor(score: number): string {
  if (score >= 90) return "#FF0000"; // 赤
  if (score >= 75) return "#FF6B00"; // オレンジ
  if (score >= 60) return "#FFD700"; // 金
  if (score >= 40) return "#00CC00"; // 緑
  if (score >= 20) return "#00BFFF"; // 青
  return "#A0A0A0"; // グレー
}
