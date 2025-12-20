import { findClosest } from "./array";

const MEDIA_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const DEFAULT = 1;
const MAX_SPEED = 2;
const MIN_SPEED = 0.25;
const STEP = 0.25;

export const getNextMediaSpeed = ({ type, current }: { type: "up" | "down"; current: number }) => {
  const currentSpeed = findClosest(MEDIA_SPEEDS, current);
  if (!currentSpeed) return DEFAULT;

  switch (type) {
    case "up":
      if (currentSpeed < MAX_SPEED) {
        return current + STEP;
      }
      return MAX_SPEED;
    case "down":
      if (currentSpeed > MIN_SPEED) {
        return current - STEP;
      }
      return MIN_SPEED;
  }
};

export const cycleMediaSpeed = ({ current, min }: { current: number; min: number }) => {
  return current + STEP <= MAX_SPEED ? current + STEP : min;
};
