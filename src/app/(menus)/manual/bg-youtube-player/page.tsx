import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { H1, H2 } from "@/components/ui/typography";
import { InstallationSteps } from "./installation-steps";

export default function Page() {
  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <H1>YTyping YouTube Background Player</H1>
      <Card>
        <CardHeader>
          <CardDescription className="text-foreground text-lg">
            ブラウザ拡張機能を使用することで、タイピングページの背景にYouTubeの動画を表示できます
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
