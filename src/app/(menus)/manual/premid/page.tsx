import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { H1, H2 } from "@/components/ui/typography";
import { InstallationSteps } from "./_components/installation-steps";

export default function PreMidManual() {
  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <H1>DiscordにYTypingのプレイ中ステータスを表示する</H1>
      <Card>
        <CardHeader>
          <CardDescription className="text-foreground text-lg">
            PreMiDブラウザ拡張機能を使用すると、DiscordのステータスにYTypingをプレイしていることを表示できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <H2>インストール手順</H2>
          <InstallationSteps />
        </CardContent>
      </Card>
    </article>
  );
}
