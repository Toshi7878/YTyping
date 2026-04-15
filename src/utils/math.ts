export const countPerMinute = (count: number, seconds: number): number => {
  if (seconds <= 0) return 0;
  return Math.floor((count / seconds) * 60);
};
