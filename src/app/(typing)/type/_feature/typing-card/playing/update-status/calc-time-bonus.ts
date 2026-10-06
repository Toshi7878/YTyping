export const calcTimeBonus = ({
  constantRemainLineTime,
  constantLineTime,
  playSpeed,
}: {
  constantRemainLineTime: number;
  constantLineTime: number;
  playSpeed: number;
}) => {
  // constantRemainLineTime/constantLineTime は実時間換算のため、そのまま playSpeed を掛けると
  // 動画時間軸の残り時間になり倍速時にボーナス減衰が playSpeed 倍加速してしまう。
  // duration(=動画時間軸)から実時間の経過分を引くことで速度に依存しない減衰にする。
  const lineDuration = (constantRemainLineTime + constantLineTime) * playSpeed;
  return Math.floor((lineDuration - constantLineTime) * 100);
};
