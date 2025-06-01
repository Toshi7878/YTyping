import { UserNameInputForm } from "@/app/user/_components/UserNameInputForm";

export default async function Home() {
  return (
    <div className="flex flex-col gap-5 w-full md:w-[70%] pt-4 mx-auto">
      <UserNameInputForm placeholder="名前を入力してね (後から変更できます)" />
      <div>
        <h4 className="text-lg font-semibold mb-2">おしらせ</h4>
        <p className="text-sm text-muted-foreground mb-2">
          現在開発中のため、データの構成に一貫性をもたせるために予告なくユーザーデータの変更・削除を行う可能性があります。
          ご了承くださいませ。
          <span className="text-sm">ᓚ₍ ^. .^₎</span>
        </p>
      </div>
    </div>
  );
}
