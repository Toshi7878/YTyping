import { kanaToHira } from "@/util/global-hooks/kanaToHira";
import {
  useReadGameUtilParams,
  useReadMap,
  useReadStatus,
  useSetNotifications,
  useSetStatus,
} from "../atom/stateAtoms";
import { formatWord } from "./formatWord";

export const useJudgeTargetWords = () => {
  const readStatus = useReadStatus();
  const { readGameUtilParams } = useReadGameUtilParams();
  const setStatus = useSetStatus();
  const setNotifications = useSetNotifications();
  const readMap = useReadMap();

  return (chatData: string) => {
    let userInput = formatComment(chatData);

    const { wordIndex } = readStatus();
    const { judgedWords } = readGameUtilParams();

    for (let i = wordIndex; i < judgedWords.length; i++) {
      const judgedWord = judgedWords[i];

      if (!userInput) break;

      const correct = judgeComment(judgedWord, userInput);

      if (!correct.lyrics) continue;

      const lyricsIndex = userInput.indexOf(correct.lyrics);

      // ミス部分の記録
      if (lyricsIndex > 0) {
        const missComment = userInput.slice(0, lyricsIndex);
        setStatus((prev) => ({
          ...prev,
          wordsResult: [
            ...prev.wordsResult,
            { input: missComment, evaluation: "None" as const, targetWord: correct.lyrics },
          ],
        }));
      }

      // 正解部分の記録
      userInput = userInput.slice(lyricsIndex + correct.lyrics.length);
      const joinedJudgeWord = joinWord(judgedWord);

      setStatus((prev) => {
        const isGood = correct.judge === "Good";
        const newTypeCount = prev.typeCount + joinedJudgeWord.length / (isGood ? 1.5 : 1);
        return {
          ...prev,
          typeCount: newTypeCount,
          score: Math.round((1000 / readMap().totalNotes) * newTypeCount),
          wordsResult: [
            ...prev.wordsResult,
            {
              input: correct.lyrics,
              evaluation: correct.judge,
              targetWord: isGood ? joinedJudgeWord : undefined,
            },
          ],
          wordIndex: i + 1,
        };
      });

      setNotifications((prev) => [...prev, `${i}: ${correct.judge}! ${correct.lyrics}`]);
    }

    // 残りの未判定入力を記録
    if (userInput) {
      setStatus((prev) => ({
        ...prev,
        wordsResult: [
          ...prev.wordsResult,
          {
            input: userInput,
            evaluation: "None" as const,
            targetWord: undefined,
          },
        ],
      }));
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
          return { lyrics: "", judge: "None" as const, comment };
        }
      }
    }
  }

  return { lyrics: correcting, judge, comment };
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
