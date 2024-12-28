import { useSetPreviewVideoIdAtom } from "@/lib/global-atoms/globalAtoms";

export const usePreviewYouTubeKeyDown = () => {
  const setPreviewVideoId = useSetPreviewVideoIdAtom();

  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setPreviewVideoId(null);
    }
  };
};
