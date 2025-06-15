type HeaderMenu = { title: string; href: string; device?: "PC" };

export const leftMenuItem: HeaderMenu[] = [
  { title: "更新履歴", href: "/changelog" },
  { title: "GitHub", href: "https://github.com/Toshi7878/YTyping" },
  { title: "Discordにプレイ中を表示", href: "/manual/premid", device: "PC" },
  { title: "クレジット", href: "/credit" },
];

export const leftLink: HeaderMenu[] = [{ title: "タイムライン", href: "/timeline" }];

export const loginMenuItem: HeaderMenu[] = [
  { title: "ユーザーページ", href: "/user/mypage" },
  { title: "ユーザー設定", href: "/user/settings" },
];
