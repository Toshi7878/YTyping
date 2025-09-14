export const nolink = (s: string) => s.replace(/\bhttps?:\/\//gi, (m) => m.replace(":", ":\u200B") + "\u200B");
