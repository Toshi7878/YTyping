export function windowFocus() {
  //YouTubeからフォーカスを外す際に2回処理する必要がある
  (document.activeElement as HTMLElement)?.blur();
  window.focus();
  (document.activeElement as HTMLElement)?.blur();
  window.focus();
}
