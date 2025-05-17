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

      if (userInput) {
        let correct = judgeComment(judgedWord, userInput);

        if (correct["lyrics"]) {
          if (userInput.indexOf(correct["lyrics"]) > 0) {
            let missComment = "";

            if (correct["lyrics"]) {
              missComment = userInput.slice(0, userInput.indexOf(correct["lyrics"]));
            }

            setStatus((prev) => ({
              ...prev,
              wordsResult: [
                ...prev.wordsResult,
                { input: missComment, evaluation: "None" as const, targetWord: correct.lyrics },
              ],
            }));
          }

          userInput = userInput.slice(correct["lyrics"].length + userInput.indexOf(correct["lyrics"]));
          const joinedJudgeWord = joinWord(judgedWord);

          setStatus((prev) => {
            const newTypeCount = prev.typeCount + joinedJudgeWord.length / (correct["judge"] == "Good" ? 1.5 : 1);

            return {
              ...prev,
              typeCount: newTypeCount,
              score: Math.round((1000 / readMap().totalNotes) * newTypeCount),
              wordsResult: [
                ...prev.wordsResult,
                {
                  input: correct.lyrics,
                  evaluation: correct["judge"],
                  targetWord: correct["judge"] === "Good" ? joinWord(judgedWord) : undefined,
                },
              ],
              wordIndex: i + 1,
            };
          });

          setNotifications((prev) => [...prev, `${i}: ${correct["judge"]}! ${correct["lyrics"]}`]);
        }
      }
    }

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
  let judge = "Great";
  let correcting = "";
  let reSearchFlag = false;

  for (let i = 0; i < judgedWords.length; i++) {
    for (let m = 0; m < judgedWords[i].length; m++) {
      let search = comment.search(escapeRegExp(judgedWords[i][m]));

      //great判定
      if (m == 0) {
        if (i == 0 && search > 0) {
          comment = comment.slice(search);
          search = 0;
        }

        if (search == 0) {
          correcting += judgedWords[i][m];
          comment = comment.slice(judgedWords[i][m].length);
          break;
        }
      }

      if (search > 0 && correcting) {
        reSearchFlag = true;
      }

      //ハズレかrepl判定
      if (m == judgedWords[i].length - 1) {
        let replSearch = kanaToHira(comment.toLowerCase()).search(
          escapeRegExp(kanaToHira(judgedWords[i][m].toLowerCase()))
        );

        if (i == 0 && replSearch > 0) {
          comment = comment.slice(replSearch);
          replSearch = 0;
        }

        if (replSearch > 0 && i && correcting) {
          reSearchFlag = true;
        }

        if (replSearch == 0) {
          correcting += comment.slice(0, judgedWords[i][m].length);
          comment = comment.slice(judgedWords[i][m].length);
          judge = "Good";
          break;
        } else if (reSearchFlag) {
          return judgeComment(judgedWords, comment);
        } else {
          return { lyrics: "", judge: "None" as const, comment };
        }
      }
    }
  }

  return { lyrics: correcting, judge: judge as "Great" | "Good" | "None", comment };
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
