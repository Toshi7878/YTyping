import { useEditUtilsParams, usePlayer } from "@/app/edit/_lib/atoms/refAtoms";
import { useMapPreviewTimeState, useSetCanUpload, useSetPreviewTime } from "@/app/edit/_lib/atoms/stateAtoms";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { FaPlay } from "react-icons/fa";

const PreviewTimeInput = () => {
  const previewTime = useMapPreviewTimeState();
  const setPreviewTime = useSetPreviewTime();
  const setCanUpload = useSetCanUpload();
  const { readPlayer } = usePlayer();
  const { writeEditUtils } = useEditUtilsParams();

  const handlePreviewClick = () => {
    writeEditUtils({ preventAutoTabToggle: true });
    readPlayer().seekTo(Number(previewTime), true);
  };

  return (
    <TooltipWrapper
      label={
        <>
          <div>
            譜面一覧でのプレビュー再生時に入力されているタイムから再生されるようになります。(サビのタイム推奨です)
          </div>
          <div>※ 小さい数値を指定すると最初のタイピングワードが存在するタイムが設定されます。</div>
          <div>↑↓キー: 0.05ずつ調整, Enter:再生</div>
        </>
      }
    >
      <div className="flex items-baseline">
        <Label className="text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <small>プレビュータイム</small>

            <Input
              className="h-8 w-20"
              value={previewTime}
              type="number"
              step="0.05"
              min="0"
              required
              onChange={(e) => {
                setPreviewTime(e.target.value);
                setCanUpload(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePreviewClick();
                }
              }}
            />
            <div className="hover:outline-ring cursor-pointer p-1 hover:outline" onClick={handlePreviewClick}>
              <FaPlay size={15} />
            </div>
          </div>
        </Label>
      </div>
    </TooltipWrapper>
  );
};

export default PreviewTimeInput;
