export function windowFocus() {
  ;(document.activeElement as HTMLElement)?.blur()
  window.focus()
  ;(document.activeElement as HTMLElement)?.blur()
  window.focus()
}
