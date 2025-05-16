import { kanaToHira } from "@/util/global-hooks/kanaToHira";
import { useReadJudgedWords, useReadStatus, useSetStatus } from "../atom/stateAtoms";
import { formatWord } from "./formatWord";

export const useCheckPhraseMatch = () => {
  const readStatus = useReadStatus();
  const readJudgedWords = useReadJudgedWords();
  const setStatus = useSetStatus();

  return (chatData: string) => {
    let userInput = formatComment(chatData);

    const { wordIndex } = readStatus();
    const judgedWords = readJudgedWords();

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

            const updatedWordResult = [
              ...readStatus().wordResult,
              { input: missComment, evaluation: "None" as const, targetWord: correct.lyrics },
            ];
            setStatus((prev) => ({ ...prev, wordResult: updatedWordResult }));
          }

          //   userInput = userInput.slice(correct["lyrics"].length + userInput.indexOf(correct["lyrics"]));
          //   this.users[userId]["typeCount"] += JOIN_LYRICS.length / (correct["judge"] == "Good" ? 1.5 : 1);
          //   this.users[userId]["score"] = Math.round((1000 / game.totalNotes) * this.users[userId]["typeCount"]);

          const updatedWordResult = [
            ...readStatus().wordResult,
            {
              input: correct.lyrics,
              evaluation: correct["judge"],
              targetWord: correct["judge"] === "Good" ? joinWord(judgedWord) : undefined,
            },
          ];
          setStatus((prev) => ({ ...prev, wordResult: updatedWordResult, wordIndex: i + 1 }));

          //   if (notifyOption.notifyScoring) {
          //     Notify.add(`${i}: ${correct["judge"]}! ${this.users[userId]["name"]} ${correct["lyrics"]}`);
          //   }
        }
      }
    }

    if (userInput) {
      const updatedWordResult = [
        ...readStatus().wordResult,
        {
          input: userInput,
          evaluation: "None" as const,
          targetWord: undefined,
        },
      ];
      setStatus((prev) => ({ ...prev, wordResult: updatedWordResult }));
    }
  };
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& はマッチした部分文字列を示します
}

function judgeComment(judgedWords: string[], comment: string) {
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
          return { lyrics: "", judge: "None" as const };
        }
      }
    }
  }

  return { lyrics: correcting, judge: judge as "Great" | "Good" | "None" };
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

function joinWord(word: string[]) {
  let str = "";

  for (let i = 0; i < word.length; i++) {
    str += word[i][0];
  }

  return str;
}
