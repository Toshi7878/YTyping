import { useHistoryReducer } from "../atoms/historyReducerAtom";
import { useMapReducer, useMapStateRef } from "../atoms/mapReducerAtom";
import { useTbodyRef } from "../atoms/refAtoms";
import { useSetCanUploadState, useSetIsUpdateUpdatedAtRef } from "../atoms/stateAtoms";

export const useWordSearchReplace = () => {
  const getKanaSearchLength = useGetKanaSearchLength();
  const readMap = useMapStateRef();
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
      let replacedLength = 0;

      for (let j = 1; j < match.length + 1; j++) {
        replaceFoundFocus({ i, searchText });
        await replaceDialog(i, searchReg, replace, matchLength);
        replacedWord = replacedWord.replace(searchText, "");
        replacedLength += searchText.length;
        matchLength--;
      }
    }
  };
};

function useReplaceFoundFocus() {
  const { readTbody } = useTbodyRef();
  return ({ i, searchText }: { i: number; searchText: string }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tbody = readTbody();
        const targetRow = tbody.children[i];

        if (targetRow) {
          targetRow.scrollIntoView({ behavior: "auto", block: "center" });
        }

        let range = document.createRange();

        const WORD_NODE = tbody.children[i].children[2];
        if (WORD_NODE && WORD_NODE.textContent) {
          const textMatch = WORD_NODE.textContent.match(new RegExp(searchText));
          if (textMatch) {
            range.selectNodeContents(WORD_NODE);
          }
          if (WORD_NODE && WORD_NODE.firstChild && textMatch && textMatch.index !== undefined) {
            range.setStart(WORD_NODE.firstChild, textMatch.index);
            range.setEnd(WORD_NODE.firstChild, textMatch.index + (textMatch[0]?.length || 0));

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
      }, 50);
    });
  };
}

function useGetKanaSearchLength() {
  const readMap = useMapStateRef();

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
  const readMap = useMapStateRef();
  const setCanUpload = useSetCanUploadState();
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAtRef();

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
            if (++n == 1) return replace;
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
