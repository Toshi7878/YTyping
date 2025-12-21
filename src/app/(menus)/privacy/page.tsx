import type { Metadata } from "next";
import { CardWithContent } from "@/components/ui/card";
import { H1, H2, P } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "プライバシーポリシー - YTyping",
  description: "YTypingのプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <H1>プライバシーポリシー</H1>

      <CardWithContent>
        <H2>収集する情報</H2>
        <P>本サービスでは、以下の情報を収集します。</P>
        <ul className="my-4 list-disc space-y-2 pl-6">
          <li>認証に必要なメールアドレス（復元不可能な形式でハッシュ化して保存）</li>
          <li>サービスの利用履歴（タイピングゲームのログ）</li>
          <li>サービス内のユーザー設定情報</li>
        </ul>
      </CardWithContent>

      <CardWithContent>
        <H2>外部認証サービスの利用</H2>
        <P>本サービスでは、以下の認証プロバイダーを利用しています。</P>
        <ul className="my-4 list-disc space-y-2 pl-6">
          <li>Google</li>
          <li>Discord</li>
        </ul>
        <P>
          認証時に必要なユーザー情報へのアクセス権限を取得しますが、本サービスが保存する個人情報は最小限に限定されており、認証で利用するためにメールアドレスを復元不可能な形式でハッシュ化した値のみを保持します。そのほかの情報（ユーザー名、プロフィール画像等）は保持いたしません。
        </P>
      </CardWithContent>

      <CardWithContent>
        <H2>利用目的</H2>
        <P>収集した情報は、以下の目的で利用します。</P>
        <ul className="my-4 list-disc space-y-2 pl-6">
          <li>本人確認およびアカウント管理</li>
          <li>サービスの提供および品質向上</li>
          <li>利用状況の分析</li>
        </ul>
      </CardWithContent>

      <CardWithContent>
        <H2>第三者提供</H2>
        <P>法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。</P>
      </CardWithContent>

      <CardWithContent>
        <H2>お問い合わせ</H2>
        <P>本ポリシーに関するお問い合わせは、GitHubのIssueまたはDiscussionsよりご連絡ください。</P>
      </CardWithContent>
    </div>
  );
}
