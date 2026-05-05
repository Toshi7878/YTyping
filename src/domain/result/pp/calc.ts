const BASE_CONSTANT = 100;
const BASE_EXP = 1;

const ACCURACY_EXP = 2;

const MIN_CLEAR_RATE_EXP = 1.2;
const CLEAR_RATE_EXP_RANGE = 1.0;
const CLEAR_RATE_STAR_SCALE = 8;

/**
 * ratingからbasePPを算出
 */
function calcBasePP(rating: number): number {
  return rating ** BASE_EXP * BASE_CONSTANT;
}

/**
 * 再生速度補正
 * 1.0未満は補正なし
 * 1.0超は緩やかに上昇（最大1.5倍）
 */
function calcSpeedMultiplier(speed: number): number {
  const normalizedSpeed = Math.max(1, speed);
  return Math.min(1 + (normalizedSpeed - 1) * 0.5, 1.5);
}

/**
 * 高難易度ほど clearRate 減衰を緩くする
 *
 * star 0  -> exp 2.2
 * star 5  -> exp 1.7
 * star 10 -> exp 1.53
 * star 15 -> exp 1.45
 * star ∞  -> exp 1.2
 */
function calcClearRateExp(rating: number): number {
  const star = Math.max(0, rating);

  return MIN_CLEAR_RATE_EXP + CLEAR_RATE_EXP_RANGE / (1 + star / CLEAR_RATE_STAR_SCALE);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

type RawPPInput = {
  accuracy: number;
  clearRate: number;
  minPlaySpeed: number;
};

/**
 * result_statuses から RawPPInput を生成
 * clearRate は DB上 0~100 を想定
 */
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

  return {
    accuracy: clamp01(accuracy),
    clearRate: clamp01(status.clearRate / 100),
    minPlaySpeed: status.minPlaySpeed,
  };
}

export function calcRawPP(result: RawPPInput, rating: number): number {
  const basePP = calcBasePP(rating);
  const speedMultiplier = calcSpeedMultiplier(result.minPlaySpeed);
  const clearRateExp = calcClearRateExp(rating);

  const pp = basePP * result.accuracy ** ACCURACY_EXP * result.clearRate ** clearRateExp * speedMultiplier;

  return Math.round(pp * 100) / 100;
}

export const TOTAL_PP_TOP_N = 200;
const TOTAL_PP_DECAY = 0.95;

export function calcTotalPP(scores: { pp: number }[]): number {
  const total = scores
    .map((s) => s.pp)
    .sort((a, b) => b - a)
    .slice(0, TOTAL_PP_TOP_N)
    .reduce((sum, pp, i) => sum + pp * TOTAL_PP_DECAY ** i, 0);

  return Math.round(total * 100) / 100;
}
