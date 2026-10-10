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

export const LEFT_LINKS: HeaderMenu[] = [
  { title: "タイムライン", href: "/timeline" },
  { title: "ランキング", href: "/rankings/performance" },
];

export const buildUserMenuLinkItems = (session: Session) => {
  const menus: HeaderMenu[] = [
    { title: "ユーザーページ", href: `/user/${session.user.id}` as Route },
    { title: "ユーザー設定", href: "/user/settings" },
  ];

  if (session.user.role === "ADMIN") {
    menus.push({ title: "管理者メニュー", href: "/admin/reports" });
    menus.push({ title: "重要なお知らせ管理", href: "/admin/important-notices" });
    menus.push({ title: "BANした記録一覧", href: "/admin/invalid-results" });
  }

  return menus;
};
