"use client";

import { cva } from "class-variance-authority";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────

type CellTheme = "light" | "dark";

type FlickMode = "kana" | "english" | "number";

interface FlickKey {
  id: string;
  c: string;
  l?: string;
  u?: string;
  r?: string;
  d?: string;
  face?: string;
  sub?: string;
  toggle?: string[];
  type?: string;
}

type FlickEvent =
  | { type: "tap"; key: FlickKey }
  | { type: "flick"; char: string }
  | { type: "space" }
  | { type: "delete" }
  | { type: "mod" }
  | { type: "modeSwitch"; to: FlickMode };

interface FlickKeyboardProps {
  keys?: FlickKey[];
  onEvent: (event: FlickEvent) => void;
  theme?: CellTheme;
  flickStyle?: "cross";
  threshold?: number;
  mode?: FlickMode;
  isLineStart?: boolean;
  candidateBar?: React.ReactNode;
}

// ── Kana key data ──────────────────────────────────────────────────────────

const FLICK_KEYS: FlickKey[] = [
  { id: "a", c: "あ", l: "い", u: "う", r: "え", d: "お", toggle: ["あ", "い", "う", "え", "お"] },
  { id: "ka", c: "か", l: "き", u: "く", r: "け", d: "こ", toggle: ["か", "き", "く", "け", "こ"] },
  { id: "sa", c: "さ", l: "し", u: "す", r: "せ", d: "そ", toggle: ["さ", "し", "す", "せ", "そ"] },
  { id: "ta", c: "た", l: "ち", u: "つ", r: "て", d: "と", toggle: ["た", "ち", "つ", "て", "と"] },
  { id: "na", c: "な", l: "に", u: "ぬ", r: "ね", d: "の", toggle: ["な", "に", "ぬ", "ね", "の"] },
  { id: "ha", c: "は", l: "ひ", u: "ふ", r: "へ", d: "ほ", toggle: ["は", "ひ", "ふ", "へ", "ほ"] },
  { id: "ma", c: "ま", l: "み", u: "む", r: "め", d: "も", toggle: ["ま", "み", "む", "め", "も"] },
  { id: "ya", c: "や", l: "「", u: "ゆ", r: "」", d: "よ", toggle: ["や", "ゆ", "よ"] },
  { id: "ra", c: "ら", l: "り", u: "る", r: "れ", d: "ろ", toggle: ["ら", "り", "る", "れ", "ろ"] },
  { id: "mod", type: "mod", face: "小゛゜", c: "小" },
  { id: "wa", c: "わ", l: "を", u: "ん", r: "ー", d: "〜", toggle: ["わ", "を", "ん", "ー", "〜"] },
  { id: "kut", c: "、", l: "。", u: "？", r: "！", d: "…", face: "、。?!", toggle: ["、", "。", "？", "！", "…"] },
];

const MOD_CYCLE: Record<string, string[]> = {
  あ: ["あ", "ぁ"],
  い: ["い", "ぃ"],
  う: ["う", "ぅ", "ゔ"],
  え: ["え", "ぇ"],
  お: ["お", "ぉ"],
  か: ["か", "が"],
  き: ["き", "ぎ"],
  く: ["く", "ぐ"],
  け: ["け", "げ"],
  こ: ["こ", "ご"],
  さ: ["さ", "ざ"],
  し: ["し", "じ"],
  す: ["す", "ず"],
  せ: ["せ", "ぜ"],
  そ: ["そ", "ぞ"],
  た: ["た", "だ"],
  ち: ["ち", "ぢ"],
  つ: ["つ", "っ", "づ"],
  て: ["て", "で"],
  と: ["と", "ど"],
  は: ["は", "ば", "ぱ"],
  ひ: ["ひ", "び", "ぴ"],
  ふ: ["ふ", "ぶ", "ぷ"],
  へ: ["へ", "べ", "ぺ"],
  ほ: ["ほ", "ぼ", "ぽ"],
  や: ["や", "ゃ"],
  ゆ: ["ゆ", "ゅ"],
  よ: ["よ", "ょ"],
  わ: ["わ", "ゎ"],
};

function applyMod(ch: string): string | null {
  for (const base in MOD_CYCLE) {
    const arr = MOD_CYCLE[base] as string[];
    const i = arr.indexOf(ch);
    if (i !== -1) return arr[(i + 1) % arr.length] ?? null;
  }
  return null;
}

const POPUP_DELAY_MS = 300;
const QUICK_FLICK_HIDE_DELAY_MS = 50;

function ModLineStartFace() {
  return (
    <span className="-mt-1 flex flex-col items-center">
      <span className="text-lg leading-none">^^</span>
      <span className="mt-[-19px] leading-none">_</span>
    </span>
  );
}

function dirOf(dx: number, dy: number, threshold: number): "c" | "l" | "r" | "u" | "d" {
  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return "c";
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "l" : "r";
  return dy < 0 ? "u" : "d";
}

function popupCellCorners(slot: "c" | "l" | "r" | "u" | "d", has: { u: boolean; d: boolean; l: boolean; r: boolean }) {
  switch (slot) {
    case "u":
      return "rounded-t-[7px]";
    case "d":
      return "rounded-b-[7px]";
    case "l":
      return "rounded-l-[7px]";
    case "r":
      return "rounded-r-[7px]";
    case "c":
      return cn(
        !has.u && !has.l && "rounded-tl-[7px]",
        !has.u && !has.r && "rounded-tr-[7px]",
        !has.d && !has.l && "rounded-bl-[7px]",
        !has.d && !has.r && "rounded-br-[7px]",
      );
  }
}

const KANA_POS: Record<string, [number, number]> = {
  a: [2, 1],
  ka: [3, 1],
  sa: [4, 1],
  ta: [2, 2],
  na: [3, 2],
  ha: [4, 2],
  ma: [2, 3],
  ya: [3, 3],
  ra: [4, 3],
  mod: [2, 4],
  wa: [3, 4],
  kut: [4, 4],
};

// ── English key data ───────────────────────────────────────────────────────

const ENGLISH_KEYS: FlickKey[] = [
  { id: "sym", c: "@", l: "#", u: "/", r: "&", d: "_", face: "@#/&_" },
  { id: "abc", c: "A", l: "B", u: "C", face: "ABC" },
  { id: "def", c: "D", l: "E", u: "F", face: "DEF" },
  { id: "ghi", c: "G", l: "H", u: "I", face: "GHI" },
  { id: "jkl", c: "J", l: "K", u: "L", face: "JKL" },
  { id: "mno", c: "M", l: "N", u: "O", face: "MNO" },
  { id: "pqrs", c: "P", l: "Q", u: "R", r: "S", face: "PQRS" },
  { id: "tuv", c: "T", l: "U", u: "V", face: "TUV" },
  { id: "wxyz", c: "W", l: "X", u: "Y", r: "Z", face: "WXYZ" },
  { id: "capsl", type: "caps", c: "a", face: "a/A" },
  { id: "quot", c: "'", l: '"', u: "(", r: ")", face: "'\"()" },
  { id: "punc", c: ".", l: ",", u: "?", r: "!", face: ".,?!" },
];

const ENGLISH_POS: Record<string, [number, number]> = {
  sym: [2, 1],
  abc: [3, 1],
  def: [4, 1],
  ghi: [2, 2],
  jkl: [3, 2],
  mno: [4, 2],
  pqrs: [2, 3],
  tuv: [3, 3],
  wxyz: [4, 3],
  capsl: [2, 4],
  quot: [3, 4],
  punc: [4, 4],
};

const LETTER_KEY_IDS = new Set(["abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]);

function getDisplayFace(k: FlickKey, activeMode: FlickMode, caps: boolean): string {
  if (activeMode === "kana") return k.id === "mod" ? "小゛゜" : (k.face ?? k.c);
  if (activeMode === "english") {
    if (k.id === "capsl") return caps ? "A/a" : "a/A";
    if (LETTER_KEY_IDS.has(k.id)) return caps ? (k.face ?? k.c).toUpperCase() : (k.face ?? k.c).toLowerCase();
    return k.face ?? k.c;
  }
  return k.face ?? k.c;
}

function getCellTextClass(k: FlickKey, activeMode: FlickMode): string {
  if (activeMode === "kana") return k.id === "mod" || k.id === "kut" ? "text-[19px]" : "text-[22px]";
  if (activeMode === "english") return LETTER_KEY_IDS.has(k.id) ? "text-[17px]" : "text-sm";
  return k.id === "nbr" || k.id === "npu" ? "text-[15px]" : "text-[22px]";
}

// ── Number key data ────────────────────────────────────────────────────────

// Sub-text shows available flick chars as hints.
const NUMBER_KEYS: FlickKey[] = [
  { id: "n1", c: "1", l: "☆", u: "♪", r: "→", sub: "☆♪→" },
  { id: "n2", c: "2", l: "¥", u: "$", r: "€", sub: "¥$€" },
  { id: "n3", c: "3", l: "%", u: '"', r: "#", sub: '%"#' },
  { id: "n4", c: "4", l: "〒", u: "○", r: "・", sub: "〒○・" },
  { id: "n5", c: "5", l: "+", u: "×", r: "÷", sub: "+×÷" },
  { id: "n6", c: "6", l: "<", u: "=", r: ">", sub: "<=>" },
  { id: "n7", c: "7", l: "&", u: "°", r: "@", sub: "&°@" },
  { id: "n8", c: "8", l: "_", u: "\\", r: "|", sub: "_\\|" },
  { id: "n9", c: "9", l: "^", u: "~", r: "/", sub: "^~/" },
  { id: "nbr", c: "(", l: "[", u: "]", r: ")", face: "()[]" },
  { id: "n0", c: "0", l: "〜", u: "…", r: "−", sub: "〜…−" },
  { id: "npu", c: ".", l: ",", u: "-", r: "/", face: ".,-/" },
];

const NUMBER_POS: Record<string, [number, number]> = {
  n1: [2, 1],
  n2: [3, 1],
  n3: [4, 1],
  n4: [2, 2],
  n5: [3, 2],
  n6: [4, 2],
  n7: [2, 3],
  n8: [3, 3],
  n9: [4, 3],
  nbr: [2, 4],
  n0: [3, 4],
  npu: [4, 4],
};

// ── Grid position helpers ──────────────────────────────────────────────────

const COL_START: Record<number, string> = {
  1: "col-start-1",
  2: "col-start-2",
  3: "col-start-3",
  4: "col-start-4",
  5: "col-start-5",
};

const ROW_START: Record<number, string> = {
  1: "row-start-1",
  2: "row-start-2",
  3: "row-start-3",
  4: "row-start-4",
};

// ── cell style variants ────────────────────────────────────────────────────

const cellShellVariants = cva(
  "flex h-full w-full items-center justify-center rounded-[7px] [transition:filter_90ms,transform_60ms,opacity_120ms]",
  {
    variants: {
      theme: {
        light: "shadow-[0_1px_0_rgba(0,0,0,0.30)]",
        dark: "shadow-[0_1px_2px_rgba(0,0,0,0.45)]",
      },
    },
  },
);

const contentCellSurfaceVariants = cva("", {
  variants: {
    theme: { light: "", dark: "" },
    pressed: { true: "", false: "" },
  },
  compoundVariants: [
    { theme: "light", pressed: false, class: "bg-white text-[#1A1A1A]" },
    { theme: "light", pressed: true, class: "bg-[#E3E5EA] text-[#1A1A1A]" },
    { theme: "dark", pressed: false, class: "bg-[#434345] text-white" },
    { theme: "dark", pressed: true, class: "bg-[#2d2e30] text-white" },
  ],
});

const fnCellSurfaceVariants = cva("", {
  variants: {
    theme: { light: "", dark: "" },
    pressed: { true: "", false: "" },
  },
  compoundVariants: [
    { pressed: true, theme: "light", class: "bg-[#E3E5EA] text-[#1A1A1A]" },
    { pressed: true, theme: "dark", class: "bg-[#2d2e30] text-white" },
    { pressed: false, theme: "light", class: "bg-[#B4B8C0] text-[#1A1A1A]" },
    { pressed: false, theme: "dark", class: "bg-[#434345] text-white" },
  ],
});

// ── ContentCell ────────────────────────────────────────────────────────────

interface ContentCellProps {
  cellKey: FlickKey;
  pos: [number, number];
  activeMode: FlickMode;
  isLineStart: boolean;
  caps: boolean;
  theme: CellTheme;
  isPressed: boolean;
  dimmed: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}

function ContentCell({
  cellKey: k,
  pos,
  activeMode,
  isLineStart,
  caps,
  theme,
  isPressed,
  dimmed,
  onPointerDown,
}: ContentCellProps) {
  const [col, row] = pos;
  return (
    <div
      onPointerDown={onPointerDown}
      className={cn(
        "flex cursor-pointer touch-none items-center justify-center p-[3px]",
        COL_START[col],
        ROW_START[row],
      )}
    >
      <div
        className={cn(
          cellShellVariants({ theme }),
          "flex-col gap-px tracking-[0.5px] [font-variant-ligatures:none]",
          getCellTextClass(k, activeMode),
          contentCellSurfaceVariants({ theme, pressed: isPressed }),
          dimmed && "opacity-50",
        )}
        style={{
          transform: isPressed ? "scale(0.96)" : undefined,
          filter: isPressed ? "brightness(0.92)" : undefined,
        }}
      >
        {activeMode === "kana" && k.id === "mod" && isLineStart ? (
          <ModLineStartFace />
        ) : (
          <span>{getDisplayFace(k, activeMode, caps)}</span>
        )}

        {k.sub && (
          <span className="relative bottom-1.5 flex gap-[3px] font-normal text-[9px] tracking-normal">
            {[...k.sub].map((ch) => (
              <span key={ch}>{ch}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

// ── FnCell ─────────────────────────────────────────────────────────────────

interface FnCellProps {
  id: string;
  col: number;
  row: number;
  rowSpan?: number;
  label?: string;
  icon?: React.ReactNode;
  theme: CellTheme;
  dimmed: boolean;
  action?: FlickEvent;
  onEvent: (event: FlickEvent) => void;
}

function FnCell({ id, col, row, rowSpan, label, icon, theme, dimmed, action, onEvent }: FnCellProps) {
  const [isPressed, setIsPressed] = useState(false);

  const onPointerDown = () => {
    setIsPressed(true);
  };

  const onPointerLeave = () => {
    setIsPressed(false);
  };

  const onPointerUp = () => {
    setIsPressed(false);
    if (action) onEvent(action);
  };

  return (
    <div
      data-key-id={id}
      onPointerDown={onPointerDown}
      onPointerLeave={onPointerLeave}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerLeave}
      className={cn(
        "flex touch-none items-center justify-center p-[3px]",
        COL_START[col],
        ROW_START[row],
        rowSpan === 2 && "row-span-2",
        action ? "cursor-pointer" : "cursor-default",
      )}
    >
      <div
        className={cn(
          cellShellVariants({ theme }),
          "tracking-[0.3px]",
          fnCellSurfaceVariants({ theme, pressed: isPressed }),
          dimmed && "opacity-50",
        )}
        style={{ filter: isPressed ? "brightness(0.9)" : undefined }}
      >
        {icon ?? label}
      </div>
    </div>
  );
}

// ── FlickKeyboard ──────────────────────────────────────────────────────────

interface PressState {
  pointerId: number;
  key: FlickKey;
  dir: "c" | "l" | "r" | "u" | "d";
  cx: number;
  cy: number;
}

type QuickFlickState = PressState;

interface PointerTrack {
  key: FlickKey;
  sx: number;
  sy: number;
  dir: "c" | "l" | "r" | "u" | "d";
  cx: number;
  cy: number;
}

// ── Popup ──────────────────────────────────────────────────────────────────

interface PopupProps {
  press: PressState;
  gridRef: React.RefObject<HTMLDivElement | null>;
  activeMode: FlickMode;
  posMap: Record<string, [number, number]>;
  caps: boolean;
  isDark: boolean;
}

function Popup({ press, gridRef, activeMode, posMap, caps, isDark }: PopupProps) {
  if (!gridRef.current) return null;
  const k = press.key;
  // 最上段キーは上方向(う・く・す等)のセルだけ小さくする
  const isTopRow = posMap[k.id]?.[1] === 1;
  const applyCase = (ch: string) => (activeMode === "english" ? (caps ? ch.toUpperCase() : ch.toLowerCase()) : ch);
  const g = gridRef.current.getBoundingClientRect();
  const scale = 0.98;
  const panelW = (g.width / 5) * 3 * scale;
  const panelH = (g.height / 4) * 3 * scale;
  const halfW = panelW / 2;
  const cx = Math.max(halfW, Math.min(press.cx, g.width - halfW));
  const left = cx - halfW;
  const top = press.cy - panelH / 2;

  const has = { u: !!k.u, d: !!k.d, l: !!k.l, r: !!k.r };
  const slots: { slot: "c" | "l" | "r" | "u" | "d"; row: number; col: number; ch: string | undefined }[] = [
    { slot: "u", row: 1, col: 2, ch: k.u },
    { slot: "l", row: 2, col: 1, ch: k.l },
    { slot: "c", row: 2, col: 2, ch: k.c },
    { slot: "r", row: 2, col: 3, ch: k.r },
    { slot: "d", row: 3, col: 2, ch: k.d },
  ];

  return (
    <div
      className="pointer-events-none absolute z-40 grid grid-cols-3 grid-rows-3"
      style={{ left, top, width: panelW, height: panelH }}
    >
      {slots
        .filter((s): s is typeof s & { ch: string } => s.ch != null)
        .map(({ slot, row, col, ch }) => {
          const on = slot === press.dir;
          const shrinkUp = isTopRow && slot === "u";
          return (
            <div
              key={slot}
              className={cn(
                "flex items-center justify-center leading-none",
                "[transition:background-color_80ms,color_80ms]",
                shrinkUp ? "h-3/5 self-end text-base" : "text-xl",
                popupCellCorners(slot, has),
                on ? "bg-[#2E92FA] text-white" : isDark ? "bg-[#434345] text-white" : "bg-white text-[#1A1A1A]",
              )}
              style={{ gridRow: row, gridColumn: col }}
            >
              {applyCase(ch)}
            </div>
          );
        })}
    </div>
  );
}

// ── QuickFlickPopup ────────────────────────────────────────────────────────

interface QuickFlickPopupProps {
  quickFlick: QuickFlickState;
  gridRef: React.RefObject<HTMLDivElement | null>;
  activeMode: FlickMode;
  posMap: Record<string, [number, number]>;
  caps: boolean;
  isDark: boolean;
}

function QuickFlickPopup({ quickFlick, gridRef, activeMode, posMap, caps, isDark }: QuickFlickPopupProps) {
  if (!gridRef.current) return null;
  const ch = quickFlick.key[quickFlick.dir];
  if (!ch) return null;
  // 最上段キーの上フリックポップアップは候補バーと重なるため半透明にする
  const isTopRowUpFlick = quickFlick.dir === "u" && posMap[quickFlick.key.id]?.[1] === 1;
  const applyCase = (value: string) =>
    activeMode === "english" ? (caps ? value.toUpperCase() : value.toLowerCase()) : value;
  const g = gridRef.current.getBoundingClientRect();
  const cellW = g.width / 5;
  const cellH = g.height / 4;
  const w = isTopRowUpFlick ? cellW * 0.75 : cellW * (quickFlick.dir === "l" || quickFlick.dir === "r" ? 1.28 : 0.98);
  const h = isTopRowUpFlick ? cellH * 0.85 : cellH * (quickFlick.dir === "u" || quickFlick.dir === "d" ? 1.42 : 0.98);
  const offsetX = cellW * 0.86;
  const offsetY = cellH * 1.02;
  // 最上段の上フリックは候補バーにちょっとだけ被る位置に表示する
  const topRowUpOffsetY = cellH * 0.6;
  const positions = {
    u: {
      left: quickFlick.cx - w / 2,
      top: quickFlick.cy - (isTopRowUpFlick ? topRowUpOffsetY : offsetY) - h / 2,
    },
    d: { left: quickFlick.cx - w / 2, top: quickFlick.cy + offsetY - h / 2 },
    l: { left: quickFlick.cx - offsetX - w / 2, top: quickFlick.cy - h / 2 },
    r: { left: quickFlick.cx + offsetX - w / 2, top: quickFlick.cy - h / 2 },
    c: { left: quickFlick.cx - w / 2, top: quickFlick.cy - h / 2 },
  } satisfies Record<"c" | "l" | "r" | "u" | "d", { left: number; top: number }>;
  const shapePaths = {
    u: "M8 0H92Q100 0 100 8V74Q100 78 96 81L57 97Q50 100 43 97L4 81Q0 78 0 74V8Q0 0 8 0Z",
    d: "M4 19L43 3Q50 0 57 3L96 19Q100 22 100 26V92Q100 100 92 100H8Q0 100 0 92V26Q0 22 4 19Z",
    l: "M8 0H76Q81 0 84 5L98 44Q100 50 98 56L84 95Q81 100 76 100H8Q0 100 0 92V8Q0 0 8 0Z",
    r: "M24 0H92Q100 0 100 8V92Q100 100 92 100H24Q19 100 16 95L2 56Q0 50 2 44L16 5Q19 0 24 0Z",
    c: "M8 0H92Q100 0 100 8V92Q100 100 92 100H8Q0 100 0 92V8Q0 0 8 0Z",
  } satisfies Record<"c" | "l" | "r" | "u" | "d", string>;
  const textTransforms = {
    u: "translateY(-8px)",
    d: "translateY(8px)",
    l: "translateX(-8px)",
    r: "translateX(8px)",
    c: undefined,
  } satisfies Record<"c" | "l" | "r" | "u" | "d", string | undefined>;
  const { left, top } = positions[quickFlick.dir];

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-30 flex items-center justify-center font-medium leading-none",
        isTopRowUpFlick ? "text-[21px]" : "text-[28px]",
        isDark ? "text-white" : "text-[#1A1A1A]",
      )}
      data-testid="quick-flick-popup"
      style={{ left, top, width: w, height: h }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          className={cn(isDark ? "fill-[#434345]" : "fill-white")}
          d={shapePaths[quickFlick.dir]}
          data-testid="quick-flick-shape"
        />
      </svg>
      <span className="relative" data-testid="quick-flick-text" style={{ transform: textTransforms[quickFlick.dir] }}>
        {applyCase(ch)}
      </span>
    </div>
  );
}

function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(display-mode: standalone)");
    const update = () => {
      const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsStandalone(mql.matches || iosStandalone);
    };
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isStandalone;
}

function FlickKeyboard({
  keys = FLICK_KEYS,
  onEvent,
  theme = "light",
  threshold = 26,
  mode,
  isLineStart = false,
  candidateBar,
}: FlickKeyboardProps) {
  const isDark = theme === "dark";
  const isStandalone = useIsStandalone();
  const gridRef = useRef<HTMLDivElement>(null);
  // 指(pointerId)ごとに押下状態を管理し、複数キーの同時押しを独立して扱う。
  const pointersRef = useRef<Map<number, PointerTrack>>(new Map());
  const popupTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const quickFlickHideTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const [presses, setPresses] = useState<PressState[]>([]);
  const [quickFlicks, setQuickFlicks] = useState<QuickFlickState[]>([]);
  const [pressedKeyIds, setPressedKeyIds] = useState<Map<number, string>>(new Map());
  const [caps, setCaps] = useState(true);

  const activeMode = mode ?? "kana";
  const activeKeys = activeMode === "english" ? ENGLISH_KEYS : activeMode === "number" ? NUMBER_KEYS : keys;
  const activePosMap = activeMode === "english" ? ENGLISH_POS : activeMode === "number" ? NUMBER_POS : KANA_POS;

  const onMove = useCallback(
    (e: PointerEvent) => {
      const s = pointersRef.current.get(e.pointerId);
      if (!s) return;
      const dir = dirOf(e.clientX - s.sx, e.clientY - s.sy, threshold);
      if (dir !== s.dir) {
        s.dir = dir;
        const pointerId = e.pointerId;
        setQuickFlicks((prev) => {
          const without = prev.filter((q) => q.pointerId !== pointerId);
          return dir !== "c" && s.key[dir] ? [...without, { pointerId, key: s.key, dir, cx: s.cx, cy: s.cy }] : without;
        });
        setPresses((prev) => prev.map((p) => (p.pointerId === pointerId ? { ...p, dir } : p)));
      }
    },
    [threshold],
  );

  const onUp = useCallback(
    (e: PointerEvent) => {
      const pointerId = e.pointerId;
      const pointers = pointersRef.current;
      const s = pointers.get(pointerId);
      if (!s) return;
      pointers.delete(pointerId);
      if (pointers.size === 0) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      }

      const popupTimer = popupTimersRef.current.get(pointerId);
      if (popupTimer) {
        clearTimeout(popupTimer);
        popupTimersRef.current.delete(pointerId);
      }

      setPressedKeyIds((prev) => {
        if (!prev.has(pointerId)) return prev;
        const next = new Map(prev);
        next.delete(pointerId);
        return next;
      });

      const existingHideTimer = quickFlickHideTimersRef.current.get(pointerId);
      if (existingHideTimer) clearTimeout(existingHideTimer);
      quickFlickHideTimersRef.current.set(
        pointerId,
        setTimeout(() => {
          quickFlickHideTimersRef.current.delete(pointerId);
          setQuickFlicks((prev) => prev.filter((q) => q.pointerId !== pointerId));
        }, QUICK_FLICK_HIDE_DELAY_MS),
      );

      setPresses((prev) => prev.filter((p) => p.pointerId !== pointerId));

      const { key, dir } = s;
      if (key.type === "caps") {
        setCaps((c) => !c);
        return;
      }
      const applyCase = (ch: string) => (activeMode === "english" ? (caps ? ch.toUpperCase() : ch.toLowerCase()) : ch);
      if (dir === "c" || !key[dir]) onEvent({ type: "tap", key: { ...key, c: applyCase(key.c) } });
      else onEvent({ type: "flick", char: applyCase(key[dir] as string) });
    },
    [onEvent, onMove, activeMode, caps],
  );

  const onDown = (e: React.PointerEvent, key: FlickKey) => {
    e.preventDefault();
    const pointerId = e.pointerId;
    const hideTimer = quickFlickHideTimersRef.current.get(pointerId);
    if (hideTimer) {
      clearTimeout(hideTimer);
      quickFlickHideTimersRef.current.delete(pointerId);
    }
    if (!gridRef.current) return;
    const g = gridRef.current.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    const pointers = pointersRef.current;
    const s: PointerTrack = { key, sx: e.clientX, sy: e.clientY, dir: "c", cx: 0, cy: 0 };
    pointers.set(pointerId, s);
    setPressedKeyIds((prev) => {
      const next = new Map(prev);
      next.set(pointerId, key.id);
      return next;
    });
    const hasFlickDirections = !!(key.l || key.u || key.r || key.d);
    if (key.type !== "caps" && hasFlickDirections) {
      const cx = r.left - g.left + r.width / 2;
      const cy = r.top - g.top + r.height / 2;
      s.cx = cx;
      s.cy = cy;
      popupTimersRef.current.set(
        pointerId,
        setTimeout(() => {
          popupTimersRef.current.delete(pointerId);
          const current = pointersRef.current.get(pointerId);
          if (current && current.key === key) {
            if (current.dir !== "c") return;
            setQuickFlicks((prev) => prev.filter((q) => q.pointerId !== pointerId));
            setPresses((prev) => [
              ...prev.filter((p) => p.pointerId !== pointerId),
              { pointerId, key, dir: current.dir, cx, cy },
            ]);
          }
        }, POPUP_DELAY_MS),
      );
    }
    if (pointers.size === 1) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
  };

  // ── cell factories ─────────────────────────────────────────────
  const fnCell = (props: Omit<FnCellProps, "theme" | "onEvent" | "dimmed">) => (
    <FnCell key={props.id} {...props} theme={theme} onEvent={onEvent} dimmed={presses.length > 0} />
  );

  const pressedKeyIdSet = new Set(pressedKeyIds.values());

  return (
    <div
      className={cn(
        "relative box-border flex w-full select-none flex-col px-[5px] pt-[5px]",
        isDark ? "bg-[#1e1f21]" : "bg-[#CBCED3]",
        // PWA起動時はホームインジケーター分のセーフエリアを余白として確保する
        isStandalone && "pb-[max(env(safe-area-inset-bottom),60px)]",
      )}
    >
      {candidateBar ?? <div className="h-10" />}

      {/* key grid */}
      <div className="pb-3.5">
        <div ref={gridRef} className="relative m-[-3px] grid grid-cols-5 grid-rows-[repeat(4,50px)]">
          {/* left column row 1 */}
          {activeMode === "kana" && fnCell({ id: "mod2", col: 1, row: 1, label: "" })}
          {activeMode !== "kana" && fnCell({ id: "fn1", col: 1, row: 1, icon: <></> })}
          {/* left column row 2 */}
          {fnCell({ id: "undo", col: 1, row: 2, icon: <></> })}
          {/* left column rows 3-4: mode switch */}
          {activeMode === "kana" &&
            fnCell({
              id: "sw-eng",
              col: 1,
              row: 3,
              rowSpan: 2,
              label: "ABC",
              action: { type: "modeSwitch", to: "english" },
            })}
          {activeMode === "english" &&
            fnCell({
              id: "sw-num",
              col: 1,
              row: 3,
              rowSpan: 2,
              label: "☆123",
              action: { type: "modeSwitch", to: "number" },
            })}
          {activeMode === "number" &&
            fnCell({
              id: "sw-kana",
              col: 1,
              row: 3,
              rowSpan: 2,
              label: "あいう",
              action: { type: "modeSwitch", to: "kana" },
            })}
          {/* content keys */}
          {activeKeys
            .filter((k) => activePosMap[k.id])
            .map((k) => (
              <ContentCell
                key={k.id}
                cellKey={k}
                pos={activePosMap[k.id] as [number, number]}
                activeMode={activeMode}
                isLineStart={isLineStart}
                caps={caps}
                theme={theme}
                isPressed={pressedKeyIdSet.has(k.id) || presses.some((p) => p.key.id === k.id)}
                dimmed={presses.length > 0 && !pressedKeyIdSet.has(k.id)}
                onPointerDown={(e) => onDown(e, k)}
              />
            ))}
          {/* right column */}
          {fnCell({ id: "del", col: 5, row: 1, action: { type: "delete" } })}
          {fnCell({ id: "space", col: 5, row: 2, label: "空白", action: { type: "space" } })}
          {fnCell({
            id: "next",
            col: 5,
            row: 3,
            rowSpan: 2,
            label: activeMode === "kana" ? "" : "",
          })}
          {quickFlicks
            .filter((q) => !presses.some((p) => p.pointerId === q.pointerId))
            .map((q) => (
              <QuickFlickPopup
                key={q.pointerId}
                quickFlick={q}
                gridRef={gridRef}
                activeMode={activeMode}
                posMap={activePosMap}
                caps={caps}
                isDark={isDark}
              />
            ))}
          {presses.map((p) => (
            <Popup
              key={p.pointerId}
              press={p}
              gridRef={gridRef}
              activeMode={activeMode}
              posMap={activePosMap}
              caps={caps}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export type { FlickEvent, FlickKey, FlickKeyboardProps, FlickMode };
export { applyMod, dirOf, FLICK_KEYS, FlickKeyboard, MOD_CYCLE };
