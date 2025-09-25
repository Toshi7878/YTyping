import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { H2, H3 } from "@/components/ui/typography";
import { InstallationSteps } from "./_components/installation-steps";

export default function PreMidManual() {
  return (
    <article className="mx-auto max-w-screen-xl space-y-4">
      <H2>DiscordにYTypingのプレイ中ステータスを表示する</H2>
      <Card>
        <CardHeader>
          <CardDescription className="text-foreground text-lg">
            PreMiDブラウザ拡張機能を使用すると、DiscordのステータスにYTypingをプレイしていることを表示できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <H3>インストール手順</H3>
          <InstallationSteps />
        </CardContent>
      </Card>
    </article>
  );
}
