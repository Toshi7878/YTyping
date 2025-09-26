import { UserNameInputForm } from "@/app/user/_components/user-name-input-form"

export default async function Home() {
  return (
    <div className="mx-auto max-w-screen-lg space-y-5">
      <UserNameInputForm placeholder="名前を入力してね (後から変更できます)" />
      <div>
        <h4 className="mb-2 text-lg font-semibold">おしらせ</h4>
        <p className="text-muted-foreground mb-2 text-sm">
          現在開発中のため、データの構成に一貫性をもたせるために予告なくユーザーデータの変更・削除を行う可能性があります。
          ご了承くださいませ。
          <span className="text-sm">ᓚ₍ ^. .^₎</span>
        </p>
      </div>
    </div>
  )
}
