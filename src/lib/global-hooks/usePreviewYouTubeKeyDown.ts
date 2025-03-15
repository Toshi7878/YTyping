import { RESET } from "jotai/utils";
import { useSetPreviewVideoState } from "../global-atoms/globalAtoms";

export const usePreviewYouTubeKeyDown = () => {
  const setPreviewVideo = useSetPreviewVideoState();

  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setPreviewVideo(RESET);
    }
  };
};
