import { useSetTopLyricsText } from "./useEditAddLyricsTextHooks";

export const useAddLyricsTextPasteEvents = () => {
  const setTopLyricsText = useSetTopLyricsText();

  return async () => {
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.scrollTop = 0;
        document.activeElement.blur();
      }
    });
    const newText = await navigator.clipboard.readText();
    const lines = newText.split("\n") || [];

    setTopLyricsText(lines[0]);
  };
};
