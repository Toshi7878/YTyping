import { dispatchEditHistory } from "../atoms/history-reducer";
import { mapAction, readMap } from "../atoms/map-reducer";
import { setCanUpload, setIsUpdateUpdatedAt } from "../atoms/state";

export const wordSearchReplace = async () => {
  const searchText = escapeRegExp(prompt("置き換えしたい読みを入力してください。") ?? "");
  if (!searchText) return;

  let matchLength = getKanaSearchLength(new RegExp(searchText, "g"));
  const replace = prompt("置き換えする文字を入力してください。");
  if (!replace) return;

  const searchReg = new RegExp(`${replace ? `(?!${replace})` : ""}${searchText}`, "g");

  if (searchText && replace.match(searchText)) {
    alert("sorry...置き換えする文字に検索する文字が含まれないようにしてください。");
    return;
  }
  const map = readMap();

  for (const [i, line] of map.entries()) {
    const match = line.word.match(searchReg);
    if (!match) {
      continue;
    }
    let replacedWord = line.word;

    for (let j = 1; j < match.length + 1; j++) {
      void replaceFoundFocus({ i, searchText });
      await replaceDialog(i, searchReg, replace, matchLength);
      replacedWord = replacedWord.replace(searchText, "");
      matchLength--;
    }
  }
};

const replaceFoundFocus = ({ i, searchText }: { i: number; searchText: string }) => {
  return new Promise((resolve) => {
    const tbody = document.getElementById("map-table-tbody");
    if (!tbody) return;
    const targetRow = tbody.children[i];

    if (targetRow) {
      targetRow.scrollIntoView({ behavior: "auto", block: "center" });
    }

    const range = document.createRange();

    const targetRowChildren = tbody.children[i];
    if (!targetRowChildren) return resolve(0);
    const wordCell = targetRowChildren.children[2];
    if (wordCell?.textContent) {
      const textMatch = wordCell.textContent.match(new RegExp(searchText));
      if (textMatch) {
        range.selectNodeContents(wordCell);
      }
      if (wordCell.firstChild && textMatch?.index !== undefined) {
        range.setStart(wordCell.firstChild, textMatch.index);
        range.setEnd(wordCell.firstChild, textMatch.index + (textMatch[0]?.length || 0));

        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          console.error("選択オブジェクトが見つかりませんでした。");
        }
      } else {
        console.error("WORD_NODE または textMatch が見つかりませんでした。");
      }
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        console.error("選択オブジェクトが見つかりませんでした。");
      }

      resolve(1);
      console.error("検索語が見つかりませんでした。");
      resolve(0);
    }
  });
};

const getKanaSearchLength = (searchReg: RegExp) => {
  const map = readMap();
  let lyricsKana = "";

  for (const line of map) {
    lyricsKana += line.word;
  }

  const Result = lyricsKana.match(searchReg);

  return Result ? Result.length : 0;
};

const replaceDialog = (i: number, searchReg: RegExp, replace: string, matchLength: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const map = readMap();
      const line = map[i];
      if (!line) return resolve(0);
      const { time, lyrics, word } = line;
      if (confirm(`残り${matchLength}件\n${word}\n置き換えますか？`)) {
        let n = 0;

        const newWord = word.replace(searchReg, (match) => {
          if (++n === 1) return replace;

          return match;
        });

        mapAction({
          type: "update",
          payload: {
            time,
            lyrics,
            word: newWord,
          },
          index: i,
        });

        dispatchEditHistory({
          type: "add",
          payload: {
            actionType: "update",
            data: {
              old: { time, lyrics, word },
              new: { time, lyrics, word: newWord },
              lineIndex: i,
            },
          },
        });
      }

      resolve(1);
      setCanUpload(true);
      setIsUpdateUpdatedAt(true);
    }, 50);
  });
};

function escapeRegExp(string: string) {
  return string ? string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&") : null;
}
