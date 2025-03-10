import { useSetTopLyrics } from "./useEditManyLyricsTextHooks";

export const useManyLyricsTextPasteEvent = () => {
  const setTopLyrics = useSetTopLyrics();

  return async () => {
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.scrollTop = 0;
        document.activeElement.blur();
      }
    });

    const newText = await navigator.clipboard.readText();
    const lines = newText.split(/\r\n|\n/) || [];

    setTopLyrics(lines[0]);
  };
};
