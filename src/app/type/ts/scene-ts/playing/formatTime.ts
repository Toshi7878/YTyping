export const formatTime = (time: number): string => {
  const HH = Math.floor(time / 3600);
  const MM = ("00" + Math.floor((time % 3600) / 60)).slice(-2);
  const SS = ("00" + Math.floor(time % 60)).slice(-2);

  return HH > 0 ? `${HH}:${MM}:${SS}` : `${MM}:${SS}`;
};
