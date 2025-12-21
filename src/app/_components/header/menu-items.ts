import type { Route } from "next";

type HeaderMenu = { title: string; href: Route; device?: "PC" };

export const LEFT_MENU_LINK_ITEMS: HeaderMenu[] = [
  { title: "更新履歴", href: "/changelog" },
  { title: "バグ報告 (GitHub)", href: "https://github.com/Toshi7878/YTyping/issues" },
  { title: "ツール", href: "/tools", device: "PC" },
  { title: "クレジット", href: "/credit" },
  { title: "プライバシーポリシー", href: "/privacy" },
];

export const LEFT_LINKS: HeaderMenu[] = [{ title: "タイムライン", href: "/timeline" }];

export const buildUserMenuLinkItems = (userId: string): HeaderMenu[] => {
  return [
    { title: "ユーザーページ", href: `/user/${userId}` as Route },
    { title: "ユーザー設定", href: "/user/settings" },
  ];
};
