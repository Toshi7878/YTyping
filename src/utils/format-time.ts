const padZero = (num: number): string => num.toString().padStart(2, "0");
export const formatTime = (totalSeconds: number): string => {
  const absSeconds = Math.abs(Math.floor(totalSeconds));

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  const MM = padZero(minutes);
  const SS = padZero(seconds);

  return hours > 0 ? `${hours}:${MM}:${SS}` : `${MM}:${SS}`;
};
