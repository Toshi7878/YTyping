import { useSetIsYTStarted, useSetVideoId, useVideoIdState } from "@/app/edit/_lib/atoms/stateAtoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { extractYouTubeVideoId } from "@/utils/extractYTId";
import { z } from "@/validator/z";
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
      <Label className="w-[150px] font-bold">YouTube URL</Label>
      <div className="flex flex-1 flex-col items-center gap-2 lg:flex-row">
        <div className="flex w-full flex-1 items-center">
          <span className="bg-muted truncate rounded-l-md border border-r-0 px-3 py-1.5 text-sm">
            https://www.youtube.com/watch?v=
          </span>
          <Input
            placeholder="YouTube URL(動画URLをそのまま貼り付けできます)"
            className="h-8 rounded-l-none font-bold"
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
          className={`h-8 ${canChangeVideo ? "border-yellow-500 text-yellow-600 hover:bg-yellow-50" : "cursor-not-allowed opacity-50"}`}
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
