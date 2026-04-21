// starRating ** BASE_EXP * BASE_CONSTANT = basePP
// 最高難易度想定のstarRatingで上限1000ppになるよう調整
const BASE_CONSTANT = 100;
const BASE_EXP = 1;

/**
 * starRatingからbasePPを算出
 * BASE_CONSTANT・BASE_EXPは実データで調整する
 */
export function calcBasePP(starRating: number): number {
  return starRating ** BASE_EXP * BASE_CONSTANT;
}

/**
 * 速度倍率によるpp補正（1.0以上のみ）
 * 1.0超は緩やかにボーナス（上限1.5倍）
 */
function calcSpeedMultiplier(speed: number): number {
  return Math.min(1.0 + (speed - 1.0) * 0.5, 1.5);
}

export type RawPPInput = {
  accuracy: number; // 正確率（0〜1）: totalType / (miss + totalType)
  clearRate: number; // 打ち切り率（0〜1）
  minPlaySpeed: number; // 再生速度（1.0以上）
};

/** `result_statuses` 相当の行から raw pp 用入力を組み立てる（clearRate は DB 上 0〜100 を想定） */
export function buildRawPPInputFromResultStatus(status: {
  romaType: number;
  kanaType: number;
  flickType: number;
  englishType: number;
  spaceType: number;
  symbolType: number;
  numType: number;
  miss: number;
  clearRate: number;
  minPlaySpeed: number;
}): RawPPInput {
  const totalType =
    status.romaType +
    status.kanaType +
    status.flickType +
    status.englishType +
    status.spaceType +
    status.symbolType +
    status.numType;
  const denom = totalType + status.miss;
  const accuracy = denom > 0 ? totalType / denom : 0;
  const clearRate01 = status.clearRate > 1 ? status.clearRate / 100 : status.clearRate;

  return {
    accuracy,
    clearRate: Math.min(1, Math.max(0, clearRate01)),
    minPlaySpeed: status.minPlaySpeed,
  };
}

/**
 * リザルトデータからraw ppを算出
 * acc_pp:  正確率ベース（40%）
 * comp_pp: 打ち切り率ベース（60%）
 */
export function calcRawPP(result: RawPPInput, starRating: number): number {
  const basePP = calcBasePP(starRating);

  const acc_pp = basePP * 0.4 * result.accuracy ** 3;
  const comp_pp = basePP * 0.6 * result.clearRate ** 1.5;

  const speedMultiplier = calcSpeedMultiplier(result.minPlaySpeed);

  return Math.round((acc_pp + comp_pp) * speedMultiplier * 100) / 100;
}

/**
 * 全スコアの加重和からtotal ppを算出
 * pp降順にソートし、0.95の減衰をかけて合計
 */
export function calcTotalPP(scores: { pp: number }[]): number {
  const total = scores
    .map((s) => s.pp)
    .sort((a, b) => b - a)
    .reduce((sum, pp, i) => sum + pp * 0.95 ** i, 0);

  return Math.round(total * 100) / 100;
}
