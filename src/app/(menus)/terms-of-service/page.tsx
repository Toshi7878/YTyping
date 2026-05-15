import type { Metadata } from "next";
import { CardWithContent } from "@/ui/card";
import { H1, H2, P } from "@/ui/typography";

export const metadata: Metadata = {
  title: "利用規約 - YTyping",
  description: "YTypingの利用規約",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <H1>利用規約</H1>

      <CardWithContent>
        <H2>はじめに</H2>
        <P>
          本規約は、YTyping（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用の方は、本規約に同意したものとみなします。
        </P>
      </CardWithContent>

      <CardWithContent>
        <H2>禁止事項</H2>
        <P>本サービスにおいて、以下の行為を禁止します。</P>
        <ul className="my-4 list-disc space-y-2 pl-6">
          <li>他のユーザーへの誹謗中傷、嫌がらせ、差別的な発言</li>
          <li>スパム行為や不正なアカウント操作</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>法令または公序良俗に違反する行為</li>
          <li>その他、運営が不適切と判断する行為</li>
        </ul>
      </CardWithContent>

      <CardWithContent>
        <H2>アカウントの停止</H2>
        <P>
          禁止事項に違反した場合、警告を行ったうえでアカウントを停止（BAN）する場合があります。悪質な場合は警告なしに停止することがあります。
        </P>
      </CardWithContent>

      <CardWithContent>
        <H2>免責事項</H2>
        <P>
          本サービスの利用によって生じた損害について、運営は一切の責任を負いません。本サービスは予告なく変更・停止する場合があります。
        </P>
      </CardWithContent>

      <CardWithContent>
        <H2>お問い合わせ</H2>
        <P>本規約に関するお問い合わせは、GitHubのIssueまたはDiscussionsよりご連絡ください。</P>
      </CardWithContent>
    </div>
  );
}
