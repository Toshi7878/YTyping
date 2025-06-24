import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { InstallationSteps } from "./_components/InstallationSteps";

export default function PreMidManual() {
  return (
    <article className="mx-auto max-w-screen-xl space-y-4">
      <h1 className="text-3xl font-bold">DiscordにYTypingのプレイ中ステータスを表示する</h1>
      <Card>
        <CardHeader>
          <CardDescription className="text-foreground text-lg">
            PreMiDブラウザ拡張機能を使用すると、DiscordのステータスにYTypingをプレイしていることを表示できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-semibold">インストール手順</h2>
          <InstallationSteps />
        </CardContent>
      </Card>
    </article>
  );
}
