const HAPPY_EMOJI = [
  "((o(｡>ω<｡)o))",
  "(◍>ᴗ<◍)",
  "＞ ω ＜ﾉ",
  "(*>ᴗ<*)",
  "(๑>◡<๑)",
  "(˶ ᵔ ᵕ ᵔ ˶)",
  "꜆＞⩊＜꜀",
  ",,>𖥦<,,",
  "＞𐋣＜",
  "ฅ^ ̳>𖥦< ̳^ฅ",
  "˶>ᴗ<˶",
  "⌯>ᴗ<⌯",
  "^›⩊‹^",
  "(^> ·̮ <^)✩",
  "＞⩊＜",
  ">⩊<",
  "＞ω＜",
  "ฅ^›⩊‹^ฅ",
  "(^> ·̮ <^)✩",
  "(๑ > ◡ < ๑)",
  "ヽ(｡>▽<｡)ﾉ",
  `"(∩>ω<∩)"`,
  "٩(๑>∀<๑)و",
  "⸜(*´꒳`*)⸝",
  "ฅ(*´꒳`*ฅ",
  ">ω</ﾐ",
  "^> ·̫ <^◝✩",
  "(｡>∀<｡)",
  "(>ω<)",
  "(＞⩊＜)",
];

export const getRandomEmoji = () => {
  const randomIndex = Math.floor(Math.random() * HAPPY_EMOJI.length);
  return HAPPY_EMOJI[randomIndex];
};
export const RandomEmoji = () => {
  const randomIndex = Math.floor(Math.random() * HAPPY_EMOJI.length);
  const randomEmoji = HAPPY_EMOJI[randomIndex];

  return <span className="font-sans">{randomEmoji}</span>;
};
