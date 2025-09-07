import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { H2, H5, Small } from "@/components/ui/typography";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import ByUser from "./by-user";

const TOOLS = [
  {
    title: "YTyping - PreMiD",
    description: "DiscordにYTypingのプレイ中ステータスを表示する",
    href: "/manual/premid",
    byUserId: "1",
  },
  {
    title: "kana-layout-extension",
    description: "月配列でタイピングすることが可能になるChrome拡張機能",
    href: "https://chromewebstore.google.com/detail/kana-layout-extension/ojfbppdppiaflmgfpjjkfggdobdpgifp",
    byUserId: "62",
  },
  {
    title: "YTyping YouTube Background Player",
    description: "タイピングページの背景にYouTubeの動画を表示する",
    href: "/manual/bg-yt-player",
    byUserId: "1",
  },
];

export default function Page() {
  return (
    <article className="mx-auto max-w-screen-xl space-y-4">
      <H2>ツール</H2>
      <Card>
        <CardHeader>
          <CardDescription className="text-foreground text-lg">YTypingで使用できる外部ツール一覧です。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {TOOLS.map((tool) => {
            const isExternal = tool.href.startsWith("http");

            return (
              <section className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <Link
                    href={tool.href}
                    className="text-primary-light hover:underline"
                    target={isExternal ? "_blank" : undefined}
                  >
                    <H5>
                      {tool.title} {isExternal ? <ExternalLink className="inline-block" size={16} /> : null}
                    </H5>
                  </Link>
                  <Small>
                    <span>by.</span>
                    <ByUser userId={tool.byUserId} />
                  </Small>
                </div>
                <Small>{tool.description}</Small>
              </section>
            );
          })}
        </CardContent>
      </Card>
    </article>
  );
}
