import { useHistoryReducer } from "../atoms/history-reducer-atom";
import { useMapReducer, useReadMap } from "../atoms/map-reducer-atom";
import { useSetCanUpload, useSetIsUpdateUpdatedAt } from "../atoms/state-atoms";

export const useWordSearchReplace = () => {
  const getKanaSearchLength = useGetKanaSearchLength();
  const readMap = useReadMap();
  const replaceDialog = useReplaceDialog();
  const replaceFoundFocus = useReplaceFoundFocus();

  return async () => {
    const searchText = escapeRegExp(prompt("置き換えしたい読みを入力してください。") ?? "");

    if (!searchText) {
      return;
    }

    let matchLength = getKanaSearchLength(new RegExp(searchText, "g"));
    const replace = prompt("置き換えする文字を入力してください。");
    if (!replace) {
      return;
    }

    const searchReg = new RegExp(`${replace ? `(?!${replace})` : ""}${searchText}`, "g");

    if (searchText && replace.match(searchText)) {
      alert("sorry...置き換えする文字に検索する文字が含まれないようにしてください。");
      return;
    }
    const map = readMap();

    for (let i = 0, len = map.length; i < len; i++) {
      const match = map[i]["word"].match(searchReg);
      if (!match) {
        continue;
      }
      let replacedWord = map[i]["word"];

      for (let j = 1; j < match.length + 1; j++) {
        void replaceFoundFocus({ i, searchText });
        await replaceDialog(i, searchReg, replace, matchLength);
        replacedWord = replacedWord.replace(searchText, "");
        matchLength--;
      }
    }
  };
};

function useReplaceFoundFocus() {
  return ({ i, searchText }: { i: number; searchText: string }) => {
    return new Promise((resolve) => {
      const tbody = document.getElementById("map-table-tbody");
      if (!tbody) return;
      const targetRow = tbody.children[i];

      if (targetRow) {
        targetRow.scrollIntoView({ behavior: "auto", block: "center" });
      }

      const range = document.createRange();

      const wordCell = tbody.children[i].children[2];
      if (wordCell && wordCell.textContent) {
        const textMatch = wordCell.textContent.match(new RegExp(searchText));
        if (textMatch) {
          range.selectNodeContents(wordCell);
        }
        if (wordCell && wordCell.firstChild && textMatch && textMatch.index !== undefined) {
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
}

function useGetKanaSearchLength() {
  const readMap = useReadMap();

  return (searchReg: RegExp) => {
    const map = readMap();
    let lyricsKana = "";

    for (let i = 0, len = map.length; i < len; i++) {
      lyricsKana += map[i]["word"];
    }

    const Result = lyricsKana.match(searchReg);

    return Result ? Result.length : 0;
  };
}

function useReplaceDialog() {
  const readMap = useReadMap();
  const setCanUpload = useSetCanUpload();
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAt();

  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  return (i: number, searchReg: RegExp, replace, matchLength: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const map = readMap();
        const { time, lyrics, word } = map[i];
        if (confirm(`残り${matchLength}件\n${word}\n置き換えますか？`)) {
          let n = 0;

          const newWord = word.replace(searchReg, (match) => {
            if (++n === 1) return replace;
            else return match;
          });

          mapDispatch({
            type: "update",
            payload: {
              time,
              lyrics,
              word: newWord,
            },
            index: i,
          });

          historyDispatch({
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
}

function escapeRegExp(string: string) {
  return string ? string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&") : null;
}
