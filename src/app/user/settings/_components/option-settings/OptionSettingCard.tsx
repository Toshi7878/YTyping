import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { OptionSettingForm } from "./child/OptionSettingForm";

const OptionSettingCard = () => {
  return (
    <Card className="mx-8">
      <CardHeader>
        <h3 className="text-lg font-medium" id="user-settings">
          ユーザー設定
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex w-full">
          <OptionSettingForm />
        </div>
      </CardContent>
      <CardFooter />
    </Card>
  );
};

export default OptionSettingCard;
