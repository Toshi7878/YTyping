import type { WordChunk } from "lyrics-typing-engine";
import {
  readLineSubstatus,
  readTypingStats,
  readTypingSubstatus,
  writeLineSubstatus,
  writeTypingStats,
  writeTypingSubstatus,
} from "../../../../_atoms/ref";
import { readMediaSpeed, readUtilityParams } from "../../../../_atoms/state";
import { setAllTypingStatus } from "../../../../_atoms/status";
import { readCombo, setCombo, setLineKpm } from "../../../../_atoms/substatus";
import { getTypingWord } from "../../../../_atoms/typing-word";
import { calculateLineKpm, calculateLineRkpm, calculateTotalKpm } from "../../../../_utils/calculate-kpm";
import { calcCurrentRank } from "./calc-current-rank";

export const updateSuccessStatus = ({
  isCompleted,
  constantRemainLineTime,
  updatePoint,
  constantLineTime,
}: {
  isCompleted?: boolean;
  constantRemainLineTime: number;
  updatePoint: number;
  constantLineTime: number;
}) => {
  const playSpeed = readMediaSpeed();
  const { isPaused } = readUtilityParams();

  // KPM計算用の状態取得
  // Note: updateSuccessSubstatusより先に実行されるため、現在のlineTypeCountは加算前の値です。
  // そのため、計算には +1 した値を使用します。
  const { typeCount: lineTypeCount } = readLineSubstatus();
  const { totalTypeTime } = readTypingSubstatus();

  if (!isPaused) {
    const newLineKpm = calculateLineKpm({ lineTypeCount: lineTypeCount + 1, constantLineTime });
    setLineKpm(newLineKpm);
  }

  setAllTypingStatus((prev) => {
    const type = prev.type + 1;
    const point = prev.point + updatePoint;

    let kpm = prev.kpm;
    if (!isPaused) {
      kpm = calculateTotalKpm({ totalTypeCount: type, totalTypeTime, constantLineTime });
    }

    if (isCompleted) {
      const timeBonus = Math.floor(constantRemainLineTime * playSpeed * 100);
      const score = prev.score + point + timeBonus;
      return { ...prev, point, type, kpm, timeBonus, score, line: prev.line - 1, rank: calcCurrentRank(score) };
    }

    return { ...prev, point, type, kpm };
  });

  setCombo((prev) => prev + 1);
};

export const updateSuccessSubstatus = ({
  constantLineTime,
  isCompleted,
  chunkType,
  successKey,
}: {
  constantLineTime: number;
  isCompleted?: boolean;
  chunkType?: WordChunk["type"];
  successKey: string;
}) => {
  const { scene } = readUtilityParams();

  // 現在の状態を一度だけ読み込む
  const currentLineSubstatus = readLineSubstatus();
  const currentSubstatus = readTypingSubstatus();
  const currentUserStats = readTypingStats();

  // 更新用の一時オブジェクト（差分のみ保持）
  const diffLineSubstatus: Partial<typeof currentLineSubstatus> = {};
  const diffSubstatus: Partial<typeof currentSubstatus> = {};
  const diffUserStats: Partial<typeof currentUserStats> = {};

  // 1. missComboのリセット
  diffSubstatus.missCombo = 0;

  // 2. 行開始時の処理
  if (currentLineSubstatus.typeCount === 0) {
    diffLineSubstatus.latency = constantLineTime;
    diffSubstatus.totalLatency = currentSubstatus.totalLatency + constantLineTime;
    if (isCompleted) {
      const { latency: lineLatency, typeCount: lineTypeCount } = readLineSubstatus();
      const lineRkpm = calculateLineRkpm({ lineLatency, lineTypeCount, constantLineTime });
      diffSubstatus.rkpm = lineRkpm;
    }
  }

  // 3. MaxComboの更新
  const newCombo = readCombo() + 1;
  if (scene === "play") {
    if (newCombo > currentSubstatus.maxCombo) {
      diffSubstatus.maxCombo = newCombo;
      diffUserStats.maxCombo = newCombo;
    }
  }

  // 4. type数の更新
  diffLineSubstatus.typeCount = currentLineSubstatus.typeCount + 1;

  // 5. 行完了時の処理
  if (isCompleted) {
    diffSubstatus.completeCount = currentSubstatus.completeCount + 1;

    const { kanaToRomaConvertCount } = currentSubstatus;
    diffSubstatus.kanaToRomaConvertCount = kanaToRomaConvertCount + getTypingWord().correct.roma.length;
  }

  // 6. 統計情報の詳細更新（Replay以外）
  if (scene !== "replay" && chunkType) {
    const currentTypes = diffLineSubstatus.types ?? currentLineSubstatus.types;
    diffLineSubstatus.types = [...currentTypes, { char: successKey, isCorrect: true, time: constantLineTime }];

    if (chunkType === "kana") {
      const { inputMode } = readUtilityParams();
      if (inputMode === "roma") {
        diffUserStats.romaType = currentUserStats.romaType + 1;
        diffSubstatus.romaType = currentSubstatus.romaType + 1;
      } else if (inputMode === "kana") {
        diffUserStats.kanaType = currentUserStats.kanaType + 1;
        diffSubstatus.kanaType = currentSubstatus.kanaType + 1;
      } else if (inputMode === "flick") {
        diffUserStats.flickType = currentUserStats.flickType + 1;
        diffSubstatus.flickType = currentSubstatus.flickType + 1;
      }
    } else if (chunkType === "alphabet") {
      diffUserStats.englishType = currentUserStats.englishType + 1;
      diffSubstatus.englishType = currentSubstatus.englishType + 1;
    } else if (chunkType === "num") {
      diffUserStats.numType = currentUserStats.numType + 1;
      diffSubstatus.numType = currentSubstatus.numType + 1;
    } else if (chunkType === "space") {
      diffUserStats.spaceType = currentUserStats.spaceType + 1;
      diffSubstatus.spaceType = currentSubstatus.spaceType + 1;
    } else if (chunkType === "symbol") {
      diffUserStats.symbolType = currentUserStats.symbolType + 1;
      diffSubstatus.symbolType = currentSubstatus.symbolType + 1;
    }
  }

  // まとめてAtomを更新する（回数を削減）
  if (Object.keys(diffSubstatus).length > 0) {
    writeTypingSubstatus(diffSubstatus);
  }
  if (Object.keys(diffLineSubstatus).length > 0) {
    writeLineSubstatus(diffLineSubstatus);
  }
  if (Object.keys(diffUserStats).length > 0) {
    writeTypingStats(diffUserStats);
  }
};
