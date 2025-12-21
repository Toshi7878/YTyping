import { CardWithContent } from "@/components/ui/card";
import { H1, Large, LinkText, P, Small, UList } from "@/components/ui/typography";
import { env } from "@/env";
import { ByUser } from "./_components/by-user";

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
    href: "https://chromewebstore.google.com/detail/kana-layout-extension/ojfbppdppiaflmgfpjjkfggdobdpgifp" as const,
    byUserId: "62",
  },
  {
    title: "YTyping YouTube Background Player",
    description: "タイピングページの背景にYouTubeの動画を表示する",
    href: "/manual/bg-yt-player",
    byUserId: "1",
  },
] as const;

export default function Page() {
  return (
    <article className="mx-auto max-w-screen-xl space-y-4">
      <H1>ツール</H1>
      <CardWithContent className={{ cardContent: "space-y-6" }}>
        <P>YTypingで使用できる外部ツール一覧です。</P>
        <section className="space-y-2">
          <UList
            className="ml-2 list-none space-y-4"
            items={TOOLS.map((tool) => {
              return (
                <div key={tool.href}>
                  <div className="flex items-baseline gap-3">
                    <LinkText href={tool.href}>
                      <Large>{tool.title}</Large>
                    </LinkText>
                    {env.VERCEL && (
                      <Small className="flex">
                        <span>by.</span>
                        <ByUser userId={tool.byUserId} />
                      </Small>
                    )}
                  </div>
                  <P>{tool.description}</P>
                </div>
              );
            })}
          />
        </section>
      </CardWithContent>
    </article>
  );
}
