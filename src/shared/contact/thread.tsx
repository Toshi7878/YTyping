import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";

interface ContactExchangeProps {
  body: string;
  createdAt: Date;
  replyBody: string | null;
  repliedAt: Date | null;
}

/** お問い合わせの内容と、運営からの返信 */
export const ContactExchange = ({ body, createdAt, replyBody, repliedAt }: ContactExchangeProps) => {
  return (
    <div className="flex flex-col gap-2">
      <ContactBubble label="お問い合わせ" date={createdAt} body={body} />
      {replyBody && repliedAt ? (
        <ContactBubble label="運営からの返信" date={repliedAt} body={replyBody} isReply />
      ) : null}
    </div>
  );
};

const ContactBubble = ({
  label,
  date,
  body,
  isReply = false,
}: {
  label: string;
  date: Date;
  body: string;
  isReply?: boolean;
}) => (
  <div className={cn("flex flex-col gap-1 rounded-md border p-3 text-sm", isReply && "border-info bg-info/10")}>
    <p className="text-muted-foreground text-xs">
      {label} / {formatDate(date)}
    </p>
    <p className="whitespace-pre-wrap break-words">{body}</p>
  </div>
);
