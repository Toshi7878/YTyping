export const nolink = (s: string) => s.replaceAll(/\bhttps?:\/\//gi, (m) => `${m.replace(":", ":\u200B")}\u200B`)
