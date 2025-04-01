export const formatTime = (totalSeconds: number): string => {
  // 負の値や小数点を処理するために Math.abs と Math.floor を使用
  const absSeconds = Math.abs(Math.floor(totalSeconds));

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  // パディング関数を使用して読みやすくする
  const padZero = (num: number): string => num.toString().padStart(2, "0");

  const MM = padZero(minutes);
  const SS = padZero(seconds);

  return hours > 0 ? `${hours}:${MM}:${SS}` : `${MM}:${SS}`;
};
