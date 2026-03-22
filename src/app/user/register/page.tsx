import { UserNameInputForm } from "@/app/user/_components/user-name-input-form";

export default async function Home() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <UserNameInputForm placeholder="名前を入力してね (後から変更できます)" />
    </div>
  );
}
