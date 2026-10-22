import { getTranslations } from "next-intl/server";
import { UserNameInputForm } from "@/app/user/_components/user-name-input-form";

export default async function Home() {
  const t = await getTranslations("userSettings");

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <UserNameInputForm placeholder={t("namePlaceholderRegister")} />
    </div>
  );
}
