import type { Route } from "next";

type HeaderMenu = { title: string; href: Route; device?: "PC" };

export const LEFT_MENU_LINK_ITEM: HeaderMenu[] = [
  { title: "更新履歴", href: "/changelog" },
  { title: "GitHub", href: "https://github.com/Toshi7878/YTyping" },
  { title: "ツール", href: "/tools", device: "PC" },
  { title: "クレジット", href: "/credit" },
  { title: "プライバシーポリシー", href: "/privacy" },
];

export const LEFT_LINKS: HeaderMenu[] = [{ title: "タイムライン", href: "/timeline" }];

export const LOGIN_MENU_LINK_ITEM: HeaderMenu[] = [
  { title: "ユーザーページ", href: "/user/mypage" },
  { title: "ユーザー設定", href: "/user/settings" },
];
