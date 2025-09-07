type HeaderMenu = { title: string; href: string; device?: "PC" };

export const LEFT_MENU_ITEM: HeaderMenu[] = [
  { title: "更新履歴", href: "/changelog" },
  { title: "GitHub", href: "https://github.com/Toshi7878/YTyping" },
  { title: "ツール", href: "/tools", device: "PC" },
  { title: "クレジット", href: "/credit" },
];

export const LEFT_LINKS: HeaderMenu[] = [{ title: "タイムライン", href: "/timeline" }];

export const LOGIN_MENU_ITEM: HeaderMenu[] = [
  { title: "ユーザーページ", href: "/user/mypage" },
  { title: "ユーザー設定", href: "/user/settings" },
];
