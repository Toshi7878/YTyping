import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { H1, H2 } from "@/components/ui/typography";
import { InstallationSteps } from "./installation-steps";

export default function Page() {
  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <H1>NamaYTyping</H1>
      <Card>
        <CardHeader>
          <CardDescription className="text-foreground text-lg">
            YTypingの変換ありタイピング画面を配信し、YouTube Live上のチャットでの対戦が可能になる拡張機能です。
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
