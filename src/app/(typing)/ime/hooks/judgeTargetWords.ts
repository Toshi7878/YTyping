import { kanaToHira } from "@/util/global-hooks/kanaToHira";
import {
  useReadGameUtilParams,
  useReadMap,
  useReadStatus,
  useSetNotifications,
  useSetStatus,
  useUpdateWordResults,
} from "../atom/stateAtoms";
import { formatWord } from "./formatWord";

export const useJudgeTargetWords = () => {
  const readStatus = useReadStatus();
  const { readGameUtilParams } = useReadGameUtilParams();
  const setStatus = useSetStatus();
  const setNotifications = useSetNotifications();
  const readMap = useReadMap();
  const updateWordResults = useUpdateWordResults();

  return (chatData: string) => {
    let userInput = formatComment(chatData);

    const { textWords } = readMap();
    const { wordIndex } = readStatus();
    const { judgedWords } = readGameUtilParams();

    if (wordIndex >= textWords.length) {
      return;
    }

    for (let i = wordIndex; i < judgedWords.length; i++) {
      const judgedWord = judgedWords[i];

      if (!userInput) break;

      const correct = judgeComment(judgedWord, userInput);

      if (correct.judge === "None") {
        updateWordResults({
          index: i,
          result: { input: correct.correcting + correct.comment[0], evaluation: "None" as const },
        });
        continue;
      }

      const lyricsIndex = userInput.indexOf(correct.correcting);

      // 正解部分の記録
      userInput = userInput.slice(lyricsIndex + correct.correcting.length);

      updateWordResults({
        index: i,
        result: {
          input: correct.correcting,
          evaluation: correct.judge,
        },
      });

      setStatus((prev) => {
        const joinedJudgeWord = joinWord(judgedWord);
        const isGood = correct.judge === "Good";
        const newTypeCount = prev.typeCount + joinedJudgeWord.length / (isGood ? 1.5 : 1);
        return {
          typeCount: newTypeCount,
          score: Math.round((1000 / readMap().totalNotes) * newTypeCount),
          wordIndex: i + 1,
        };
      });

      setNotifications((prev) => [...prev, `${i}: ${correct.judge}! ${correct.correcting}`]);
    }

    // 残りの未判定入力を記録
    if (userInput) {
      updateWordResults({
        index: readStatus().wordIndex,
        result: {
          input: userInput,
          evaluation: "None" as const,
        },
      });
    }
  };
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& はマッチした部分文字列を示します
}

function judgeComment(judgedWords: string[][], comment: string) {
  let judge: "Great" | "Good" = "Great";
  let correcting = "";
  let reSearchFlag = false;

  for (let i = 0; i < judgedWords.length; i++) {
    for (let m = 0; m < judgedWords[i].length; m++) {
      const target = judgedWords[i][m];
      let search = comment.search(escapeRegExp(target));

      // Great判定
      if (m === 0) {
        if (i === 0 && search > 0) {
          comment = comment.slice(search);
          search = 0;
        }
        if (search === 0) {
          correcting += target;
          comment = comment.slice(target.length);
          break;
        }
      }

      if (search > 0 && correcting) {
        reSearchFlag = true;
      }

      // 最後の候補でGood/None判定
      if (m === judgedWords[i].length - 1) {
        const commentHira = kanaToHira(comment.toLowerCase());
        const targetHira = kanaToHira(target.toLowerCase());
        let replSearch = commentHira.search(escapeRegExp(targetHira));

        if (i === 0 && replSearch > 0) {
          comment = comment.slice(replSearch);
          replSearch = 0;
        }

        if (replSearch > 0 && i && correcting) {
          reSearchFlag = true;
        }

        if (replSearch === 0) {
          correcting += comment.slice(0, target.length);
          comment = comment.slice(target.length);
          judge = "Good";
          break;
        } else if (reSearchFlag) {
          // 再帰的に再判定
          return judgeComment(judgedWords, comment);
        } else {
          return { lyrics: undefined, judge: "None" as const, comment };
        }
      }
    }
  }

  return { correcting, judge, comment };
}

// function generateCombinations(input: string, index: number = 0, current: string = "") {
//   if (index === input.length) {
//     return [current];
//   }

//   const subArray = input[index];
//   const combinations = [];
//   for (let i = 0; i < subArray.length; i++) {
//     combinations.push(...generateCombinations(input, index + 1, current + subArray[i]));
//   }
//   return combinations;
// }

function formatComment(text: string) {
  text = formatWord(text);

  //全角の前後のスペースを削除
  text = text.replace(/(\s+)([^!-~])/g, "$2").replace(/([^!-~])(\s+)/g, "$1");

  //テキストの末尾が半角ならば末尾に半角スペース追加
  if (/[!-~]$/.test(text)) {
    text = text + " ";
  }
  return text;
}

function joinWord(word: string[][]) {
  let str = "";

  for (let i = 0; i < word.length; i++) {
    str += word[i][0];
  }

  return str;
}
