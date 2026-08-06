import { describe, expect, it } from "vitest";
import { calcTimeBonus } from "./calc-time-bonus";

describe("calcTimeBonus", () => {
  it("1倍速では旧式(残り時間×100)と一致する", () => {
    const timeBonus = calcTimeBonus({ constantRemainLineTime: 7, constantLineTime: 3, playSpeed: 1 });
    expect(timeBonus).toBe(700);
  });

  it("同じ実時間で打ち切った場合、倍速でも1倍速と同じボーナスになる", () => {
    // duration 10秒(動画時間軸)のラインを実時間3秒で打ち切ったケース。
    // constantLineTime(実時間経過)は速度によらず3秒で共通。
    // constantRemainLineTime(実時間の残り) = duration / playSpeed - constantLineTime
    const normalBonus = calcTimeBonus({ constantRemainLineTime: 10 / 1 - 3, constantLineTime: 3, playSpeed: 1 });

    // 2倍速: duration/2 - 3 = 2
    const doubleSpeedBonus = calcTimeBonus({ constantRemainLineTime: 10 / 2 - 3, constantLineTime: 3, playSpeed: 2 });

    expect(doubleSpeedBonus).toBe(normalBonus);
    expect(doubleSpeedBonus).toBe(700);
  });

  it("倍速が高いほど旧式よりボーナスが大きくなる(旧式のplaySpeed比例減衰を解消している)", () => {
    const params = { constantRemainLineTime: 4, constantLineTime: 3 };
    const oldFormula = (playSpeed: number) => Math.floor(params.constantRemainLineTime * playSpeed * 100);

    const newBonus = calcTimeBonus({ ...params, playSpeed: 2 });
    const oldBonus = oldFormula(2);

    expect(newBonus).toBeGreaterThan(oldBonus);
  });

  it("0.5倍速でも同じ実時間経過なら1倍速と同じボーナスになる", () => {
    // duration 10秒のラインを実時間3秒で打ち切ったケース(0.5倍速: duration/0.5 - 3 = 17)
    const normalBonus = calcTimeBonus({ constantRemainLineTime: 10 / 1 - 3, constantLineTime: 3, playSpeed: 1 });
    const halfSpeedBonus = calcTimeBonus({ constantRemainLineTime: 10 / 0.5 - 3, constantLineTime: 3, playSpeed: 0.5 });

    expect(halfSpeedBonus).toBe(normalBonus);
  });

  it("残り時間0秒(ぎりぎり打ち切り)ではボーナスも0", () => {
    const timeBonus = calcTimeBonus({ constantRemainLineTime: 0, constantLineTime: 10, playSpeed: 1 });
    expect(timeBonus).toBe(0);
  });

  it("秒未満は100倍後に切り捨てられる", () => {
    const timeBonus = calcTimeBonus({ constantRemainLineTime: 1.239, constantLineTime: 0, playSpeed: 1 });
    expect(timeBonus).toBe(123);
  });
});
