import { useSetIsYTStarted, useSetVideoId, useVideoIdState } from "@/app/edit/atoms/stateAtoms";
import { extractYouTubeVideoId } from "@/utils/extractYTId";
import { z } from "@/validator/z";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const videoIdSchema = z
  .string()
  .length(11)
  .regex(/^[!-~]+$/);

const VideoIdInput = () => {
  const searchParams = useSearchParams();
  const isNewCreateMap = !!searchParams.get("new");

  const videoId = useVideoIdState();
  const [changeVideoId, setChangeVideoId] = useState(videoId);
  const setIsYTStarted = useSetIsYTStarted();
  const setVideoId = useSetVideoId();
  const canChangeVideo = videoIdSchema.safeParse(changeVideoId).success && videoId !== changeVideoId;
  return (
    <div className={`flex items-center ${isNewCreateMap ? "hidden" : ""}`}>
      <Label className="w-[150px] font-bold">
        YouTube URL
      </Label>
      <div className="flex flex-col lg:flex-row items-center flex-1 gap-2">
        <div className="flex items-center flex-1 w-full">
          <span className="text-sm bg-muted px-3 py-1.5 rounded-l-md border border-r-0 truncate">
            https://www.youtube.com/watch?v=
          </span>
          <Input
            placeholder="YouTube URL(動画URLをそのまま貼り付けできます)"
            className="h-8 font-bold rounded-l-none"
            maxLength={11} // YouTubeのID11文字に制限
            value={changeVideoId}
            onPaste={async (e) => {
              const url = await navigator.clipboard.readText();
              const inputElement = e.target as HTMLInputElement;
              const videoId = extractYouTubeVideoId(url);
              if (videoId) {
                inputElement.value = videoId;
                setChangeVideoId(videoId);
              }
            }}
            onChange={(e) => setChangeVideoId(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className={`h-8 ${canChangeVideo ? "border-yellow-500 text-yellow-600 hover:bg-yellow-50" : "opacity-50 cursor-not-allowed"}`}
          onClick={() => {
            if (canChangeVideo) {
              setIsYTStarted(false);
              setVideoId(changeVideoId);
            }
          }}
          disabled={!canChangeVideo}
        >
          切替
        </Button>
      </div>
    </div>
  );
};

export default VideoIdInput;
