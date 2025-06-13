import { useEditUtilsParams, usePlayer } from "@/app/edit/atoms/refAtoms";
import { useMapPreviewTimeState, useSetCanUpload, useSetPreviewTime } from "@/app/edit/atoms/stateAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
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
    <CustomToolTip
      label={
        <>
          <div>
            譜面一覧でのプレビュー再生時に入力されているタイムから再生されるようになります。(サビのタイム推奨です)
          </div>
          <div>※ 小さい数値を指定すると最初のタイピングワードが存在するタイムが設定されます。</div>
          <div>↑↓キー: 0.05ずつ調整, Enter:再生</div>
        </>
      }
      placement="top"
    >
      <div className="flex items-baseline">
        <Label className="text-sm">
          <div className="flex items-baseline gap-3">
            <small className="mr-3">
              プレビュータイム
            </small>

            <Input
              className={`h-8 w-20 ${previewTime === "" ? "border-destructive" : ""}`}
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
            <div 
              className="cursor-pointer hover:outline hover:outline-1 p-1" 
              onClick={handlePreviewClick}
            >
              <FaPlay size={15} />
            </div>
          </div>
        </Label>
      </div>
    </CustomToolTip>
  );
};

export default PreviewTimeInput;
