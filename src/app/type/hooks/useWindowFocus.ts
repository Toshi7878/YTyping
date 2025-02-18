export function useWindowFocus() {
  return () => {
    (document.activeElement as HTMLElement)?.blur();
    window.focus();
    (document.activeElement as HTMLElement)?.blur();
    window.focus();
  };
}
