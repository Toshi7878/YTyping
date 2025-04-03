import CustomCard from "@/components/custom-ui/CustomCard";
import { RouterOutPuts } from "@/server/api/trpc";
import { CardBody, CardFooter, CardHeader, Flex, Heading } from "@chakra-ui/react";
import { UserNameInputForm } from "../../../_components/UserNameInputForm";
import { FingerChartUrlInput } from "./profile-input/FingerChartUrlInput";
import { MyKeyboardInput } from "./profile-input/MyKeyboardInput";
interface ProfileSettingCardProps {
  userProfile: RouterOutPuts["user"]["getUserProfile"];
}
const ProfileSettingCard = ({ userProfile }: ProfileSettingCardProps) => {
  return (
    <CustomCard>
      <CardHeader mx={8}>
        <Heading as="h3" size="md">
          プロフィール設定
        </Heading>
      </CardHeader>
      <CardBody mx={8}>
        <Flex width="100%" flexDirection="column" gap={4}>
          <UserNameInputForm />
          <FingerChartUrlInput url={userProfile?.user_profiles?.[0]?.finger_chart_url ?? ""} />
          <MyKeyboardInput myKeyboard={userProfile?.user_profiles?.[0]?.my_keyboard ?? ""} />
        </Flex>
      </CardBody>
      <CardFooter mx={8} />
    </CustomCard>
  );
};

export default ProfileSettingCard;
