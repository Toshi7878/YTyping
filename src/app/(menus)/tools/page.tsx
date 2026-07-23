import { CardWithContent } from "@/ui/card";
import { H1, H2, P } from "@/ui/typography";
import { ToolsTable } from "./_components/tools-table";

type ToolCategory = "all" | "typing" | "editor" | "nama";

interface Tool {
  title: string;
  description: string;
  href: string;
  byUserId: string;
  category: ToolCategory;
}

const TOOLS: Tool[] = [
  {
    title: "YTyping - PreMiD",
    description: "DiscordにYTypingのプレイ中ステータスを表示する",
    href: "/manual/premid",
    byUserId: "1",
    category: "all",
  },
  {
    title: "kana-layout-extension",
    description: "月配列でタイピングすることが可能になるChrome拡張機能",
    href: "https://chromewebstore.google.com/detail/kana-layout-extension/ojfbppdppiaflmgfpjjkfggdobdpgifp",
    byUserId: "62",
    category: "typing",
  },
  {
    title: "YTyping Background YouTube Player",
    description: "タイピングページの背景にYouTubeの動画を表示する",
    href: "/manual/bg-youtube-player",
    byUserId: "1",
    category: "typing",
  },
  {
    title: "YTyping Lyrics Marker",
    description: "譜面作成で、BPMなどからタイミングを自動調節できるツール",
    href: "https://ytyping-lyrics-marker.y5svdwtx8p.workers.dev/",
    byUserId: "21",
    category: "editor",
  },
  {
    title: "YTyping Equalizer",
    description: "YTyping上にイコライザー設定を追加し音質を調整可能にする",
    href: "/manual/ytyping-equalizer",
    byUserId: "1",
    category: "all",
  },
  {
    title: "YTyping PP Counter",
    description: "タイピングページにリアルタイムPPカウンターを追加",
    href: "https://greasyfork.org/ja/scripts/575857-ytyping-pp-counter",
    byUserId: "1",
    category: "typing",
  },
  {
    title: "namaYTyping",
    description: "変換ありタイピングでYouTube Liveチャットでの対戦が可能になる拡張機能",
    href: "/manual/nama-ytyping",
    byUserId: "1",
    category: "nama",
  },
  {
    title: "ニコタイチャット【YouTube|Twitch】",
    description:
      "YouTube・Twitchのページ内入力パネルからチャットを送信できるChrome拡張機能。ニコタイ用にチャットの入力部分を大きく表示できる",
    href: "https://chromewebstore.google.com/detail/%E3%83%8B%E3%82%B3%E3%82%BF%E3%82%A4%E3%83%81%E3%83%A3%E3%83%83%E3%83%88%E3%80%90youtubetwitch%E3%80%91/bhgkolgcippppaoafnmahbgokcojdopf",
    byUserId: "1",
    category: "nama",
  },
];

const SECTIONS: { category: ToolCategory; title: string }[] = [
  { category: "all", title: "全体" },
  { category: "typing", title: "タイピング関連" },
  { category: "nama", title: "変換ありタイピング関連" },
  { category: "editor", title: "エディター関連" },
];

export default function Page() {
  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <H1>ツール</H1>
      <CardWithContent className={{ cardContent: "space-y-8" }}>
        <P>YTypingで使用できる外部ツール一覧です。</P>
        {SECTIONS.map((section) => {
          const tools = TOOLS.filter((tool) => tool.category === section.category);
          if (tools.length === 0) return null;

          return (
            <section key={section.category} className="space-y-2">
              <H2>{section.title}</H2>
              <ToolsTable tools={tools} />
            </section>
          );
        })}
      </CardWithContent>
    </article>
  );
}
