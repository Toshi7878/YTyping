import CustomCard from "@/components/custom-ui/CustomCard";
import { RouterOutPuts } from "@/server/api/trpc";
import { CardBody, CardFooter, CardHeader, Heading, Stack, Text } from "@chakra-ui/react";
import FingerChartUrl from "./child/FingerChartUrl";
import MyKeyBoard from "./child/MyKeyboard";

interface UserCardProps {
  userProfile: NonNullable<RouterOutPuts["user"]["getUserProfile"]>;
}

const UserCard = ({ userProfile }: UserCardProps) => {
  return (
    <CustomCard>
      <CardHeader mx={8}>
        <Heading as="h3" size="md">
          ユーザー情報
        </Heading>
      </CardHeader>
      <CardBody mx={8}>
        <Stack spacing={4}>
          <Text fontSize="xl" fontWeight="bold">
            {userProfile.name}
          </Text>
          <FingerChartUrl url={userProfile.user_profiles?.[0]?.finger_chart_url ?? ""} />
          <MyKeyBoard myKeyboard={userProfile.user_profiles?.[0]?.my_keyboard ?? ""} />
        </Stack>
      </CardBody>
      <CardFooter mx={8} />
    </CustomCard>
  );
};

export default UserCard;
