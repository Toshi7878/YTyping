"use client";

import { useCallback, useRef, useState } from "react";
import type { FlickEvent } from "@/ui/flick-keyboard";
import { applyMod, FlickKeyboard } from "@/ui/flick-keyboard";

interface TapState {
  keyId: string;
  toggleIndex: number;
}

export default function Page() {
  const [text, setText] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [flickStyle, setFlickStyle] = useState<"cross" | "flower">("cross");
  const tapRef = useRef<TapState | null>(null);

  const handleEvent = useCallback((e: FlickEvent) => {
    if (e.type === "flick") {
      tapRef.current = null;
      setText((t) => t + e.char);
      return;
    }

    if (e.type === "tap") {
      const { key } = e;
      if (key.type === "mod") {
        tapRef.current = null;
        setText((t) => {
          if (!t) return t;
          const last = t[t.length - 1] ?? "";
          const next = applyMod(last);
          return next != null ? t.slice(0, -1) + next : t;
        });
        return;
      }

      const toggle = key.toggle;
      if (!toggle || toggle.length === 0) {
        tapRef.current = null;
        setText((t) => t + key.c);
        return;
      }

      const prev = tapRef.current;
      if (prev?.keyId === key.id) {
        const nextIndex = (prev.toggleIndex + 1) % toggle.length;
        tapRef.current = { keyId: key.id, toggleIndex: nextIndex };
        setText((t) => t.slice(0, -1) + (toggle[nextIndex] ?? key.c));
      } else {
        tapRef.current = { keyId: key.id, toggleIndex: 0 };
        setText((t) => t + (toggle[0] ?? key.c));
      }
      return;
    }

    tapRef.current = null;

    if (e.type === "backspace") {
      setText((t) => t.slice(0, -1));
      return;
    }

    if (e.type === "space") {
      setText((t) => t + "　");
      return;
    }

    if (e.type === "mod") {
      setText((t) => {
        if (!t) return t;
        const last = t[t.length - 1] ?? "";
        const next = applyMod(last);
        return next != null ? t.slice(0, -1) + next : t;
      });
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: theme === "dark" ? "#1a1a1a" : "#f0f0f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 390,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "20px 16px 0",
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, color: theme === "dark" ? "#fff" : "#111", margin: 0 }}>
          フリックキーボード テスト
        </h1>

        {/* controls */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: theme === "dark" ? "#333" : "#fff",
              color: theme === "dark" ? "#fff" : "#111",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {theme === "light" ? "ダーク" : "ライト"}
          </button>
          <button
            type="button"
            onClick={() => setFlickStyle((s) => (s === "cross" ? "flower" : "cross"))}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: theme === "dark" ? "#333" : "#fff",
              color: theme === "dark" ? "#fff" : "#111",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {flickStyle === "cross" ? "フラワー" : "クロス"}
          </button>
          <button
            type="button"
            onClick={() => {
              setText("");
              tapRef.current = null;
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: theme === "dark" ? "#333" : "#fff",
              color: theme === "dark" ? "#fff" : "#111",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            クリア
          </button>
        </div>

        {/* text display */}
        <div
          style={{
            minHeight: 80,
            padding: "12px 14px",
            borderRadius: 10,
            background: theme === "dark" ? "#2a2a2a" : "#fff",
            border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
            fontSize: 24,
            lineHeight: 1.5,
            color: theme === "dark" ? "#fff" : "#111",
            wordBreak: "break-all",
          }}
        >
          {text || <span style={{ color: "#aaa", fontSize: 16 }}>入力してください…</span>}
        </div>
      </div>

      {/* keyboard pinned to bottom */}
      <div style={{ width: "100%", maxWidth: 390, marginTop: "auto" }}>
        <FlickKeyboard onEvent={handleEvent} theme={theme} flickStyle={flickStyle} />
      </div>
    </div>
  );
}
