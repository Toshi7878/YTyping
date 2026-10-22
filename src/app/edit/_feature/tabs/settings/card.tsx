import { useTranslations } from "next-intl";
import { VolumeRange } from "@/shared/volume-range";
import { CardWithContent } from "@/ui/card";
import { useYTPlayer } from "../../youtube-player";
import { AllTimeAdjust } from "./all-time-adjust";
import { ConvertOptionButtons } from "./convert-options";
import { MapImportButton } from "./map-import";

export const SettingsCard = () => {
  const player = useYTPlayer();
  return (
    <CardWithContent className={{ card: "py-4", cardContent: "space-y-4 sm:space-y-6" }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <VolumeRange YTPlayer={player} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <MapImportButton />
        </div>
      </div>
      <ConvertOptionButtons />
      <ShortCutKeyList />
      <AllTimeAdjust />
    </CardWithContent>
  );
};

const SHORTCUT_KEY_LIST = [
  { keys: ["←", "→"], descriptionKey: "skip" },
  { keys: ["↑", "↓"], descriptionKey: "moveLine" },
  { keys: ["S"], descriptionKey: "add" },
  { keys: ["Shift+S"], descriptionKey: "addEmpty" },
  { keys: ["U"], descriptionKey: "update" },
  { keys: ["Delete"], descriptionKey: "delete" },
  { keys: ["Esc"], descriptionKey: "play" },
  { keys: ["D"], descriptionKey: "deselect" },
  { keys: ["Tab"], descriptionKey: "focus" },
  { keys: ["Ctrl+Shift+F"], descriptionKey: "replaceAll" },
  { keys: ["Ctrl+Z"], descriptionKey: "undo" },
  { keys: ["Ctrl+Y"], descriptionKey: "redo" },
  { keys: ["Enter"], descriptionKey: "ruby" },
  { keys: [], descriptionKey: "directEdit" },
] as const;

const ShortCutKeyList = () => {
  const t = useTranslations("editorSettings.shortcuts");

  return (
    <section className="mt-2">
      <h3 className="mb-3 font-semibold text-base sm:mb-4 sm:text-lg">{t("title")}</h3>
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4 sm:text-base lg:grid-cols-3">
        {SHORTCUT_KEY_LIST.map((shortcut) => (
          <div key={shortcut.descriptionKey} className="flex flex-wrap items-center gap-1">
            <div className="flex flex-wrap gap-1">
              {(shortcut.descriptionKey === "directEdit" ? [t("directEditKey")] : shortcut.keys).map((key) => (
                <kbd
                  key={key}
                  className="rounded border border-border/50 bg-background px-1.5 py-0.5 font-bold text-foreground text-xs sm:px-2 sm:py-1 sm:text-sm"
                >
                  {key}
                </kbd>
              ))}
            </div>
            <span className="text-muted-foreground">:</span>
            <span className="wrap-break-word">{t(shortcut.descriptionKey)}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
