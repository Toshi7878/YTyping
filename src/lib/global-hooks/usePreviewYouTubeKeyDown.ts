import { useSetPreviewVideoIdAtom } from "@/components/atom/globalAtoms";

export const usePreviewYouTubeKeyDown = () => {
  const setPreviewVideoId = useSetPreviewVideoIdAtom();

  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setPreviewVideoId(null);
    }
  };
};
