/**
 * 形態素解析は全文 1 回の結果（lyrics / readings）を前提に、元の `sentence` に含まれる改行位置へ
 * `lyrics` と `readings` の両方へ `"\\n"` を 1 要素として差し込む。
 *
 * 各トークンの表層形が `sentence` の該当部分と一致するときだけ挿入する。
 * 改行の扱いで一致できない場合は、挿入せず `lyrics` / `readings` をそのまま返す。
 */
export function injectNewlinesIntoTokenArrays(
  sentence: string,
  lyrics: string[],
  readings: string[],
): { lyrics: string[]; readings: string[] } {
  if (lyrics.length !== readings.length) {
    return { lyrics: [...lyrics], readings: [...readings] };
  }

  const outL: string[] = [];
  const outR: string[] = [];
  let origPos = 0;

  for (let t = 0; t < lyrics.length; t++) {
    while (origPos < sentence.length && sentence[origPos] === "\n") {
      outL.push("\n");
      outR.push("\n");
      origPos++;
    }

    const ly = lyrics[t];
    const rd = readings[t];
    if (ly === undefined || rd === undefined) {
      return { lyrics: [...lyrics], readings: [...readings] };
    }
    if (origPos + ly.length > sentence.length) {
      return { lyrics: [...lyrics], readings: [...readings] };
    }
    if (sentence.slice(origPos, origPos + ly.length) !== ly) {
      return { lyrics: [...lyrics], readings: [...readings] };
    }

    outL.push(ly);
    outR.push(rd);
    origPos += ly.length;
  }

  while (origPos < sentence.length && sentence[origPos] === "\n") {
    outL.push("\n");
    outR.push("\n");
    origPos++;
  }

  if (origPos !== sentence.length) {
    return { lyrics: [...lyrics], readings: [...readings] };
  }

  return { lyrics: outL, readings: outR };
}
