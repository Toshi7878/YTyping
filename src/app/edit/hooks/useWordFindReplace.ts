import { Action } from "@reduxjs/toolkit";
import { Dispatch } from "react";
import { useDispatch, useStore as useReduxStore } from "react-redux";
import { useSetCanUploadState, useSetIsMapDataEditedAtom } from "../atoms/stateAtoms";
import { RefsContextType, useRefs } from "../edit-contexts/refsProvider";
import { updateLine } from "../redux/mapDataSlice";
import { RootState } from "../redux/store";
import { addHistory } from "../redux/undoredoSlice";

export const useWordFindReplace = () => {
  const { tbodyRef } = useRefs();
  const dispatch = useDispatch();
  const editReduxStore = useReduxStore<RootState>();
  const setCanUpload = useSetCanUploadState();
  const setIsMapDataEdited = useSetIsMapDataEditedAtom();

  return () => {
    const mapData = editReduxStore.getState().mapData.value;
    new WordReplace(mapData, tbodyRef, dispatch, setCanUpload, setIsMapDataEdited).wordSearchReplace();
  };
};

class WordReplace {
  mapData: RootState["mapData"]["value"];
  tbodyRef: RefsContextType["tbodyRef"];
  dispatch: Dispatch<Action>;
  setCanUpload: Dispatch<boolean>;
  newWord: string;
  setIsMapDataEdited: Dispatch<boolean>;

  constructor(
    mapData: RootState["mapData"]["value"],
    tbodyRef: RefsContextType["tbodyRef"],
    dispatch: Dispatch<Action>,
    setCanUpload: Dispatch<boolean>,
    setIsMapDataEdited: Dispatch<boolean>
  ) {
    this.mapData = mapData;
    this.tbodyRef = tbodyRef;
    this.dispatch = dispatch;
    this.setCanUpload = setCanUpload;
    this.newWord = "";
    this.setIsMapDataEdited = setIsMapDataEdited;
  }

  async wordSearchReplace() {
    const search = this.escapeRegExp(prompt("置き換えしたい読みを入力してください。"));

    if (!search) {
      return;
    }

    let matchLength = this.getKanaSearchLength(new RegExp(search, "g"));
    const replace = prompt("置き換えする文字を入力してください。");
    if (!replace) {
      return;
    }

    const searchReg = new RegExp(`${replace ? `(?!${replace})` : ""}${search}`, "g");

    if (search && replace.match(search)) {
      alert("sorry...置き換えする文字に検索する文字が含まれないようにしてください。");
      return;
    }
    for (let i = 0, len = this.mapData.length; i < len; i++) {
      const match = this.mapData[i]["word"].match(searchReg);
      if (!match) {
        continue;
      }
      let replacedWord = this.mapData[i]["word"];
      let replacedLength = 0;

      for (let j = 1; j < match.length + 1; j++) {
        await this.replaceFoundFocus(i, search);
        await this.replaceDialog(i, searchReg, replace, matchLength);
        replacedWord = replacedWord.replace(search, "");
        replacedLength += search.length;
        matchLength--;
      }
    }
  }

  getKanaSearchLength(searchReg) {
    let lyricsKana = "";

    for (let i = 0, len = this.mapData.length; i < len; i++) {
      lyricsKana += this.mapData[i]["word"];
    }

    const Result = lyricsKana.match(searchReg);

    return Result ? Result.length : 0;
  }

  replaceFoundFocus(i, search) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const targetRow = this.tbodyRef.current?.children[i];

        if (targetRow) {
          targetRow.scrollIntoView({ behavior: "auto", block: "center" });
        }

        let range = document.createRange();

        // 取得した要素の内側を範囲とする
        const WORD_NODE = this.tbodyRef.current?.children[i].children[2];
        if (WORD_NODE && WORD_NODE.textContent) {
          this.newWord = WORD_NODE.textContent;
          const textMatch = WORD_NODE.textContent.match(new RegExp(search));
          if (textMatch) {
            range.selectNodeContents(WORD_NODE);
          }
          if (WORD_NODE && WORD_NODE.firstChild && textMatch && textMatch.index !== undefined) {
            // 範囲を選択状態にする
            range.setStart(WORD_NODE.firstChild, textMatch.index);
            range.setEnd(WORD_NODE.firstChild, textMatch.index + (textMatch[0]?.length || 0));

            // 選択範囲をクリアして新しい範囲を追加
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
  }

  replaceDialog(i, searchReg, replace, matchLength) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (confirm(`残り${matchLength}件\n${this.newWord}\n置き換えますか？`)) {
          let n = 0;

          const selectedLineCount = i;

          const time = this.mapData[i]["time"];

          const lyrics = this.mapData[i]["lyrics"];

          const newWord = this.newWord.replace(searchReg, (match) => {
            if (++n == 1) return replace;
            else return match;
          });

          this.setCanUpload(true);
          this.setIsMapDataEdited(true);
          this.dispatch(
            addHistory({
              type: "update",
              data: {
                old: { time, lyrics, word: this.newWord },
                new: { time, lyrics, word: newWord },
                lineNumber: i,
              },
            })
          );

          this.newWord = newWord;

          this.dispatch(updateLine({ selectedLineCount, time, lyrics, word: this.newWord }));
        }

        resolve(1);
      }, 50);
    });
  }

  escapeRegExp(string) {
    return string ? string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&") : null;
  }
}
