import { getTranslations } from "next-intl/server";

const MaintenancePage = async () => {
  const t = await getTranslations("maintenance");

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="font-bold text-4xl">{t("title")}</h1>
        <p className="text-center text-lg">{t("description")}</p>
      </div>
    </div>
  );
};

export default MaintenancePage;
