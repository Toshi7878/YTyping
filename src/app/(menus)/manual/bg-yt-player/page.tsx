import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { H2, H3 } from "@/components/ui/typography";
import { InstallationSteps } from "./InstallationSteps";

export default function Page() {
  return (
    <article className="mx-auto max-w-screen-xl space-y-4">
      <H2>YTyping YouTube Background Player</H2>
      <Card>
        <CardHeader>
          <CardDescription className="text-foreground text-lg">
            タイピングページの背景にYouTubeの動画を表示する
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
