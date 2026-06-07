"use client";

import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { THEME_LIST } from "@/theme/const";
import type { FlickEvent, FlickMode } from "@/ui/flick-keyboard";
import { applyMod, FlickKeyboard } from "@/ui/flick-keyboard";

export default function Page() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<FlickMode>("kana");
  const { resolvedTheme } = useTheme();

  const isDark = THEME_LIST.dark.some((t) => t.class === resolvedTheme);
  const flickTheme = isDark ? "dark" : "light";

  const handleEvent = useCallback((e: FlickEvent) => {
    if (e.type === "modeSwitch") {
      setMode(e.to);
      return;
    }

    if (e.type === "flick") {
      setText((t) => t + e.char);
      return;
    }

    if (e.type === "tap") {
      const { key } = e;
      if (key.type === "mod") {
        setText((t) => {
          if (!t) return t;
          const last = t[t.length - 1] ?? "";
          const next = applyMod(last);
          return next != null ? t.slice(0, -1) + next : t;
        });
        return;
      }
      setText((t) => t + key.c);
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
        background: isDark ? "#1a1a1a" : "#f0f0f5",
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
        <h1 style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#fff" : "#111", margin: 0 }}>
          フリックキーボード テスト
        </h1>

        {/* controls */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setText("")}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: isDark ? "#333" : "#fff",
              color: isDark ? "#fff" : "#111",
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
            background: isDark ? "#2a2a2a" : "#fff",
            border: `1px solid ${isDark ? "#444" : "#ddd"}`,
            fontSize: 24,
            lineHeight: 1.5,
            color: isDark ? "#fff" : "#111",
            wordBreak: "break-all",
          }}
        >
          {text || <span style={{ color: "#aaa", fontSize: 16 }}>入力してください…</span>}
        </div>
      </div>

      {/* keyboard pinned to bottom */}
      <div style={{ width: "100%", maxWidth: 390, marginTop: "auto" }}>
        <FlickKeyboard onEvent={handleEvent} theme={flickTheme} mode={mode} isLineStart={text.length === 0} />
      </div>
    </div>
  );
}
