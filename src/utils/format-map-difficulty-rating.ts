/** 星難易度の表示: 1 未満は小数第1位、1 以上は整数（切り捨て） */
export function formatMapDifficultyRating(rating: number): string {
  return rating < 1 ? rating.toFixed(1) : String(Math.trunc(rating));
}
