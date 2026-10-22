"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/ui/button";
import { DialogFooter, DialogHeader, DialogTitle, DialogWithContent } from "@/ui/dialog";
import { FileImportButton } from "@/ui/file-import-button";
import { overlay } from "@/ui/overlay";
import { toast } from "@/ui/toast";
import { normalizeSymbols } from "@/utils/string";
import { decodeText } from "@/utils/text-decoder";
import { LrcSchema } from "@/validator/map/map";
import { type RawMapLine, RawMapSchema } from "@/validator/map/raw-map-json";
import { dispatchEditHistory } from "../../map-table/history";
import { getRawMap, setRawMapAction } from "../../map-table/map-reducer";
import { YTPlayer } from "../../youtube-player";
import { wordConvertAction } from "../editor/button/word-convert";

export const MapImportButton = () => {
  const t = useTranslations("editorSettings.import");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const handleFileSelect = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      setText(decodeText(buffer));
    } catch {
      toast.error(t("readError"));
    }
  };

  const handleImport = async () => {
    if (!text.trim()) {
      toast.error(t("empty"));
      return;
    }

    setOpen(false);
    overlay.loading(t("importing"));

    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }

      if (parsed !== null) {
        const rawResult = RawMapSchema.safeParse(parsed);
        if (rawResult.success) {
          importMapFromRawMap(rawResult.data);
          setText("");
          toast.success(t("done"));
          return;
        }
      }

      const lrcResult = LrcSchema.safeParse(text);
      if (lrcResult.success) {
        await importMapFromLrcText(text);
        setText("");
        toast.success(t("lrcDone"));
      }
    } catch (e) {
      toast.error(t("lrcError"), {
        description: e instanceof Error ? e.message : t("processError"),
      });
    } finally {
      overlay.hide();
    }
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setText("");
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        {t("button")}
      </Button>

      <DialogWithContent id="lrc-import-dialog" open={open} onOpenChange={handleClose} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("button")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <FileImportButton
            accept=".lrc,.json"
            size="sm"
            variant="outline"
            className="self-start"
            onFileSelect={handleFileSelect}
          >
            {t("fromFile")}
          </FileImportButton>

          <textarea
            className="h-64 w-full resize-y rounded-md border bg-background p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t("placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleImport}>{t("confirm")}</Button>
        </DialogFooter>
      </DialogWithContent>
    </>
  );
};

const importMapFromRawMap = (rawMap: RawMapLine[]) => {
  dispatchEditHistory({
    type: "add",
    payload: { actionType: "replaceAll", data: { old: getRawMap(), new: rawMap } },
  });
  setRawMapAction({ type: "replaceAll", payload: rawMap });
};

const importMapFromLrcText = async (text: string) => {
  const lrc = text.split(/\r\n|\n/);
  const convertedData = await lrcConverter(lrc);
  dispatchEditHistory({
    type: "add",
    payload: { actionType: "replaceAll", data: { old: getRawMap(), new: convertedData } },
  });
  setRawMapAction({ type: "replaceAll", payload: convertedData });
};

const lrcConverter = async (lrc: string[]) => {
  const result: RawMapLine[] = [{ time: "0", lyrics: "", word: "" }];
  for (const line of lrc) {
    const matchedTimeTags = line.match(/\[\d\d.\d\d.\d\d\]/);

    if (matchedTimeTags) {
      const matchedTimeTag = matchedTimeTags[0].match(/\d\d/g);
      if (!matchedTimeTag) continue;
      const minute = Number(matchedTimeTag[0]);
      const second = Number(matchedTimeTag[1]);
      const minSec = Number(matchedTimeTag[2]);

      const rawTime = minute * 60 + second + minSec * 0.01;
      const time = (rawTime === 0 ? 0.001 : rawTime).toString();
      const lyrics = normalizeSymbols(line.replace(/\[\d\d.\d\d.\d\d\]/g, ""));
      const word = (await wordConvertAction(lyrics)) ?? "";

      result.push({ time, lyrics, word });
    }
  }

  result.push({ time: YTPlayer.getDuration().toFixed(3), lyrics: "end", word: "" });

  return result;
};
