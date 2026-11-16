import type { Route } from "next";
import type { Session } from "@/auth/client";
import type ja from "@/i18n/messages/ja.json";

/** `header.menu` 配下のメッセージキー */
export type HeaderMenuLabelKey = keyof (typeof ja)["header"]["menu"];

type HeaderMenu = { labelKey: HeaderMenuLabelKey; href: Route; device?: "PC" };

export const LEFT_MENU_LINK_ITEMS: HeaderMenu[] = [
  { labelKey: "changelog", href: "/changelog" },
  { labelKey: "publicBookmarks", href: "/bookmarks" },
  { labelKey: "bugReport", href: "https://github.com/Toshi7878/YTyping/issues" },
  { labelKey: "tools", href: "/tools", device: "PC" },
  { labelKey: "credit", href: "/credit" },
  { labelKey: "terms", href: "/terms-of-service" },
  { labelKey: "privacy", href: "/privacy" },
  { labelKey: "apiDocs", href: "/api-docs" },
];

/** ログイン中のユーザーメニューで、ログアウトの直前に表示する */
export const CONTACT_MENU_ITEM: HeaderMenu = { labelKey: "contact", href: "/contact" };

export const LEFT_LINKS: HeaderMenu[] = [
  { labelKey: "timeline", href: "/timeline" },
  { labelKey: "ranking", href: "/rankings/performance" },
];

export const buildUserMenuLinkItems = (session: Session) => {
  const menus: HeaderMenu[] = [
    { labelKey: "userPage", href: `/user/${session.user.id}` as Route },
    { labelKey: "userSettings", href: "/user/settings" },
  ];

  return menus;
};

/** 管理者のみ。ユーザーメニューでは区切り線を挟んで表示する */
export const buildAdminMenuLinkItems = (session: Session) => {
  if (session.user.role !== "ADMIN") return [];

  const menus: HeaderMenu[] = [
    { labelKey: "adminReports", href: "/admin/reports" },
    { labelKey: "adminResultReports", href: "/admin/result-reports" },
    { labelKey: "adminImportantNotices", href: "/admin/important-notices" },
    { labelKey: "adminInvalidResults", href: "/admin/invalid-results" },
    { labelKey: "adminContacts", href: "/admin/contacts" },
  ];

  return menus;
};
