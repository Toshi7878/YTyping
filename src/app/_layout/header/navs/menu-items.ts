import type { Route } from "next";
import type { Session } from "@/auth/client";

type HeaderMenu = { title: string; href: Route; device?: "PC" };

export const LEFT_MENU_LINK_ITEMS: HeaderMenu[] = [
  { title: "更新履歴", href: "/changelog" },
  { title: "公開ブックマーク一覧", href: "/bookmarks" },
  { title: "バグ報告 (GitHub)", href: "https://github.com/Toshi7878/YTyping/issues" },
  { title: "ツール", href: "/tools", device: "PC" },
  { title: "クレジット", href: "/credit" },
  { title: "利用規約", href: "/terms-of-service" },
  { title: "プライバシーポリシー", href: "/privacy" },
  { title: "API Docs", href: "/api-docs" },
];

/** ログイン中のユーザーメニューで、ログアウトの直前に表示する */
export const CONTACT_MENU_ITEM: HeaderMenu = { title: "お問い合わせ", href: "/contact" };

export const LEFT_LINKS: HeaderMenu[] = [
  { title: "タイムライン", href: "/timeline" },
  { title: "ランキング", href: "/rankings/performance" },
];

export const buildUserMenuLinkItems = (session: Session) => {
  const menus: HeaderMenu[] = [
    { title: "ユーザーページ", href: `/user/${session.user.id}` as Route },
    { title: "ユーザー設定", href: "/user/settings" },
  ];

  return menus;
};

/** 管理者のみ。ユーザーメニューでは区切り線を挟んで表示する */
export const buildAdminMenuLinkItems = (session: Session) => {
  if (session.user.role !== "ADMIN") return [];

  const menus: HeaderMenu[] = [
    { title: "通報管理", href: "/admin/reports" },
    { title: "重要なお知らせ管理", href: "/admin/important-notices" },
    { title: "BANした記録一覧", href: "/admin/invalid-results" },
    { title: "お問い合わせ管理", href: "/admin/contacts" },
  ];

  return menus;
};
