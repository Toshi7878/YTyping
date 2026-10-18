import { networkInterfaces } from "node:os";
import QRCode from "qrcode";

const PORT = 3000;

// スマホから開発サーバーに接続するためのQRコードを表示する。LANに接続していない場合は何も表示しない
const findLanAddress = () => {
  const candidates = Object.entries(networkInterfaces()).flatMap(([name, addresses]) =>
    (addresses ?? [])
      .filter((a) => a.family === "IPv4" && !a.internal && !a.address.startsWith("169.254."))
      .map((a) => ({ name, address: a.address })),
  );
  return candidates.find((c) => /wi-?fi|wlan/i.test(c.name)) ?? candidates[0];
};

const main = async () => {
  const lan = findLanAddress();
  if (!lan) return;

  const url = `http://${lan.address}:${PORT}`;
  const qr = await QRCode.toString(url, { type: "terminal", small: true });
  console.log(`\n${qr}${url}\n`);
};

main().catch((error) => console.warn("QRコードの表示に失敗しました", error));
