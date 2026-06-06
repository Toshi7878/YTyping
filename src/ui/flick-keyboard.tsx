"use client";

// @ds-adherence-ignore -- ported from Figma standalone (raw elements/hex/px by design)

import { useCallback, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface FlickKey {
  id: string;
  c: string;
  l?: string;
  u?: string;
  r?: string;
  d?: string;
  face?: string;
  toggle?: string[];
  type?: string;
}

type FlickEvent =
  | { type: "tap"; key: FlickKey }
  | { type: "flick"; char: string }
  | { type: "backspace" }
  | { type: "space" }
  | { type: "mod" };

interface FlickKeyboardProps {
  keys?: FlickKey[];
  onEvent: (event: FlickEvent) => void;
  theme?: "light" | "dark";
  flickStyle?: "cross";
  threshold?: number;
}

// ── Key data ───────────────────────────────────────────────────────────────

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

// 小゛゜キー: 直前の文字を「濁点 → 半濁点 → 小書き」へ循環
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
  つ: ["つ", "づ", "っ"],
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

function dirOf(dx: number, dy: number, threshold: number): "c" | "l" | "r" | "u" | "d" {
  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return "c";
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "l" : "r";
  return dy < 0 ? "u" : "d";
}

// ── Theme ──────────────────────────────────────────────────────────────────

const FIGMA_THEME = {
  light: {
    tray: "#CBCED3",
    kana: "#FFFFFF",
    fn: "#B4B8C0",
    text: "#1A1A1A",
    fnText: "#1A1A1A",
    icon: "#1A1A1A",
    home: "#4A4A4A",
    popBg: "#FFFFFF",
    popText: "#1A1A1A",
    keyShadow: "0 1px 0 rgba(0,0,0,0.30)",
    popShadow: "0 6px 16px rgba(0,0,0,0.28)",
  },
  dark: {
    tray: "#4A4A4A",
    kana: "#898989",
    fn: "#6E6E6E",
    text: "#FFFFFF",
    fnText: "#FFFFFF",
    icon: "#F2F2F2",
    home: "#FFFFFF",
    popBg: "#898989",
    popText: "#FFFFFF",
    keyShadow: "0 1px 2px rgba(0,0,0,0.45)",
    popShadow: "0 6px 16px rgba(0,0,0,0.5)",
  },
};

const FLICK_ACTIVE = "#3478F6";

// kana cell placement (col, row) — 3 cols × 4 rows live in grid cols 2-4
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

// ── Icons ──────────────────────────────────────────────────────────────────

function IconUndo({ c }: { c: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 7H15.5C18 7 20 9 20 11.5C20 14 18 16 15.5 16H7"
        stroke={c}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 4L6 7L9 10" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDelete({ c }: { c: string }) {
  return (
    <svg width="26" height="20" viewBox="0 0 28 22" fill="none" aria-hidden="true">
      <path
        d="M9 2H25C26.1 2 27 2.9 27 4V18C27 19.1 26.1 20 25 20H9C8.4 20 7.8 19.7 7.4 19.2L1 11L7.4 2.8C7.8 2.3 8.4 2 9 2Z"
        stroke={c}
        strokeWidth="1.6"
      />
      <path d="M13 7.5L20 14.5M20 7.5L13 14.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconGlobe({ c }: { c: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" stroke={c} strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="4" ry="9.2" stroke={c} strokeWidth="1.5" />
      <path d="M3 12H21M4.5 7H19.5M4.5 17H19.5" stroke={c} strokeWidth="1.5" />
    </svg>
  );
}

function IconMic({ c }: { c: string }) {
  return (
    <svg width="20" height="22" viewBox="0 0 20 24" fill="none" aria-hidden="true">
      <rect x="6.5" y="2" width="7" height="12" rx="3.5" stroke={c} strokeWidth="1.6" />
      <path
        d="M3.5 11C3.5 14.6 6.4 17.5 10 17.5C13.6 17.5 16.5 14.6 16.5 11"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M10 17.5V21.5M6.5 21.5H13.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ── FlickKeyboard ──────────────────────────────────────────────────────────

interface PressState {
  key: FlickKey;
  dir: "c" | "l" | "r" | "u" | "d";
  cx: number;
  cy: number;
  w: number;
  h: number;
}

function FlickKeyboard({ keys = FLICK_KEYS, onEvent, theme = "light", threshold = 26 }: FlickKeyboardProps) {
  const p = FIGMA_THEME[theme];
  const gridRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{ key: FlickKey | null; sx: number; sy: number; dir: "c" | "l" | "r" | "u" | "d" }>({
    key: null,
    sx: 0,
    sy: 0,
    dir: "c",
  });
  const [press, setPress] = useState<PressState | null>(null);
  const [tapId, setTapId] = useState<string | null>(null);

  const byId: Record<string, FlickKey> = {};
  for (const k of keys) byId[k.id] = k;

  const onMove = useCallback(
    (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.key) return;
      const dir = dirOf(e.clientX - s.sx, e.clientY - s.sy, threshold);
      if (dir !== s.dir) {
        s.dir = dir;
        setPress((q) => (q ? { ...q, dir } : q));
      }
    },
    [threshold],
  );

  const onUp = useCallback(() => {
    const s = stateRef.current;
    const key = s.key;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (!key) return;
    const dir = s.dir;
    s.key = null;
    setPress(null);
    if (dir === "c" || !key[dir]) onEvent({ type: "tap", key });
    else onEvent({ type: "flick", char: key[dir] as string });
  }, [onEvent, onMove]);

  const onDown = (e: React.PointerEvent, key: FlickKey) => {
    e.preventDefault();
    if (!gridRef.current) return;
    const g = gridRef.current.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    const s = stateRef.current;
    s.key = key;
    s.sx = e.clientX;
    s.sy = e.clientY;
    s.dir = "c";
    setPress({
      key,
      dir: "c",
      cx: r.left - g.left + r.width / 2,
      cy: r.top - g.top + r.height / 2,
      w: r.width,
      h: r.height,
    });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const fnTap = (id: string, ev: FlickEvent) => {
    setTapId(id);
    setTimeout(() => setTapId(null), 110);
    onEvent(ev);
  };

  // ── popup ──────────────────────────────────────────────────────
  const renderPopup = () => {
    if (!press || !gridRef.current) return null;
    const k = press.key;
    const t = Math.min(press.w * 0.92, 60);
    const off = t * 0.96;
    const gw = gridRef.current.offsetWidth;
    const half = off + t / 2 + 2;
    const cx = Math.max(half, Math.min(press.cx, gw - half));
    const cy = press.cy - t * 0.1;
    const slots: { d: "c" | "l" | "r" | "u" | "d"; ch: string | undefined; x: number; y: number }[] = [
      { d: "u", ch: k.u, x: cx, y: cy - off },
      { d: "l", ch: k.l, x: cx - off, y: cy },
      { d: "c", ch: k.c, x: cx, y: cy },
      { d: "r", ch: k.r, x: cx + off, y: cy },
      { d: "d", ch: k.d, x: cx, y: cy + off },
    ].filter((s) => s.ch != null) as { d: "c" | "l" | "r" | "u" | "d"; ch: string; x: number; y: number }[];
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none" }}>
        {slots.map((s) => {
          const on = s.d === press.dir;
          return (
            <div
              key={s.d}
              style={{
                position: "absolute",
                left: s.x,
                top: s.y,
                transform: `translate(-50%,-50%) scale(${on ? 1.06 : 1})`,
                width: t,
                height: t,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: t * 0.5,
                fontWeight: 500,
                lineHeight: 1,
                transition: "transform 60ms, background 60ms, color 60ms",
                background: on ? FLICK_ACTIVE : p.popBg,
                color: on ? "#fff" : p.popText,
                boxShadow: on ? "0 4px 14px rgba(52,120,246,0.4)" : p.popShadow,
              }}
            >
              {s.ch}
            </div>
          );
        })}
      </div>
    );
  };

  // ── cell factories ─────────────────────────────────────────────
  const cellBase = (extra: React.CSSProperties): React.CSSProperties => ({
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
    cursor: "pointer",
    boxShadow: p.keyShadow,
    transition: "filter 90ms, transform 60ms",
    ...extra,
  });

  const kanaCell = (k: FlickKey) => {
    const pos = KANA_POS[k.id];
    if (!pos) return null;
    const [col, row] = pos;
    const down = press?.key.id === k.id;
    const isMod = k.id === "mod";
    return (
      <div
        key={k.id}
        onPointerDown={(e) => onDown(e, k)}
        style={cellBase({
          gridColumn: col,
          gridRow: row,
          background: p.kana,
          color: p.text,
          fontSize: isMod || k.id === "kut" ? 17 : 26,
          fontWeight: 500,
          letterSpacing: 0.5,
          transform: down ? "scale(0.96)" : "none",
          filter: down ? "brightness(0.92)" : "none",
        })}
      >
        {k.id === "mod" ? "小゛゜" : (k.face ?? k.c)}
      </div>
    );
  };

  const fnCell = ({
    id,
    col,
    row,
    rowSpan,
    label,
    icon,
    action,
  }: {
    id: string;
    col: number;
    row: number;
    rowSpan?: number;
    label?: string;
    icon?: React.ReactNode;
    action?: FlickEvent;
    decorative?: boolean;
  }) => {
    const down = tapId === id;
    return (
      <div
        key={id}
        onClick={action ? () => fnTap(id, action) : undefined}
        style={cellBase({
          gridColumn: col,
          gridRow: rowSpan ? `${row} / span ${rowSpan}` : row,
          background: p.fn,
          color: p.fnText,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: 0.3,
          cursor: action ? "pointer" : "default",
          filter: down ? "brightness(0.9)" : "none",
        })}
      >
        {icon ?? label}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "relative",
        background: p.tray,
        width: "100%",
        boxSizing: "border-box",
        padding: "5px 5px 0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* top candidate strip */}
      <div style={{ height: 40 }} />

      {/* key grid */}
      <div ref={gridRef} style={{ position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(4, 47px)",
            gap: 6,
          }}
        >
          {fnCell({ id: "mod2", col: 1, row: 1, label: "小゛゜", action: { type: "mod" } })}
          {fnCell({ id: "undo", col: 1, row: 2, icon: <IconUndo c={p.icon} />, decorative: true })}
          {fnCell({ id: "abc", col: 1, row: 3, rowSpan: 2, label: "ABC", decorative: true })}
          {keys.filter((k) => KANA_POS[k.id]).map(kanaCell)}
          {fnCell({ id: "del", col: 5, row: 1, icon: <IconDelete c={p.icon} />, action: { type: "backspace" } })}
          {fnCell({ id: "space", col: 5, row: 2, label: "空白", action: { type: "space" } })}
          {fnCell({ id: "next", col: 5, row: 3, rowSpan: 2, label: "次へ", decorative: true })}
        </div>
        {renderPopup()}
      </div>

      {/* bottom bar: globe · home-indicator · mic */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          position: "relative",
        }}
      >
        <IconGlobe c={p.icon} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 8,
            transform: "translateX(-50%)",
            width: 133,
            height: 5,
            borderRadius: 3,
            background: p.home,
          }}
        />
        <IconMic c={p.icon} />
      </div>
    </div>
  );
}

export type { FlickEvent, FlickKey, FlickKeyboardProps };
export { applyMod, dirOf, FLICK_KEYS, FlickKeyboard, MOD_CYCLE };
