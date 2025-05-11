import { RESET } from "jotai/utils";
import { useSetPreviewVideo } from "../../lib/global-atoms/globalAtoms";

export const usePreviewYouTubeKeyDown = () => {
  const setPreviewVideo = useSetPreviewVideo();

  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setPreviewVideo(RESET);
    }
  };
};
