import "server-only";
import { after } from "next/server";
import { ENV } from "varlock/env";
import { getBaseUrl } from "@/utils/get-base-url";

const DESCRIPTION_MAX_LENGTH = 1000;
const REQUEST_TIMEOUT_MS = 5000;

interface AdminNotification {
  title: string;
  /** ユーザーが入力した文章など。長い場合は切り詰める */
  description: string;
  /** 管理画面のパス（例: /admin/contacts） */
  adminPath: string;
  fields?: { name: string; value: string }[];
}

const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}…` : text);

const getAdminBaseUrl = () =>
  ENV.VERCEL_ENV === "production" ? `https://${ENV.VERCEL_PROJECT_PRODUCTION_URL}` : getBaseUrl();

/**
 * 運営用の Discord チャンネルに通知する（DISCORD_WEBHOOK_URL が未設定なら何もしない）。
 * レスポンスを返した後に送信し、通知の失敗で本来の処理は失敗させない。
 */
export const notifyAdmins = ({ title, description, adminPath, fields }: AdminNotification) => {
  const webhookUrl = ENV.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const body = JSON.stringify({
    // ユーザーが入力した文章に含まれる @everyone などでメンションされないようにする
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title,
        description: truncate(description, DESCRIPTION_MAX_LENGTH),
        url: `${getAdminBaseUrl()}${adminPath}`,
        color: 0x3b82f6,
        fields: fields?.map(({ name, value }) => ({ name, value: truncate(value, 200), inline: true })),
        timestamp: new Date().toISOString(),
      },
    ],
  });

  const send = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) console.error(`>>> Discord notification failed: ${response.status}`);
    } catch (error) {
      console.error(">>> Discord notification failed", error);
    }
  };

  try {
    after(send);
  } catch {
    // リクエストの外（スクリプトなど）では after が使えないので、そのまま送る
    void send();
  }
};
