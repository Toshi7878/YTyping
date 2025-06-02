import { Card, CardContent } from "@/components/ui/card";
import { InstallationSteps } from "./components/InstallationSteps";

export default function PreMidManual() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">DiscordにYTypingのプレイ中ステータスを表示する</h1>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <p className="text-xl">
            PreMiDブラウザ拡張機能を使用すると、DiscordのステータスにYTypingをプレイしていることを表示できます。
          </p>

          <h2 className="text-2xl font-semibold">インストール手順</h2>
          <InstallationSteps />
        </CardContent>
      </Card>
    </div>
  );
}
