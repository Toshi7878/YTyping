import CustomCard from "@/components/custom-ui/CustomCard";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { RouterOutPuts } from "@/server/api/trpc";
import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import { CardBody, CardFooter, CardHeader, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { MdOutlineEdit } from "react-icons/md";
import FingerChartUrl from "./child/FingerChartUrl";
import MyKeyBoard from "./child/MyKeyboard";

interface UserProfileCardProps {
  userProfile: NonNullable<RouterOutPuts["user"]["getUserProfile"]>;
}

const UserProfileCard = ({ userProfile }: UserProfileCardProps) => {
  const handleLinkClick = useLinkClick();
  const { id: userId } = useParams() as { id: string };
  const { data: session } = useSession();
  const myProfile = session?.user.id === userId;

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
          <Stack gap={0}>
            <FingerChartUrl url={userProfile.user_profiles?.[0]?.finger_chart_url ?? ""} />
            <MyKeyBoard myKeyboard={userProfile.user_profiles?.[0]?.my_keyboard ?? ""} />
          </Stack>
        </Stack>
      </CardBody>
      <CardFooter mx={8} justifyContent="flex-end">
        {myProfile && (
          <CustomToolTip placement="top" label="プロフィール編集ページに移動">
            <Link href={`/user/settings`} onClick={handleLinkClick}>
              <IconButton variant="outline" aria-label="編集" icon={<MdOutlineEdit />} />
            </Link>
          </CustomToolTip>
        )}
      </CardFooter>
    </CustomCard>
  );
};

export default UserProfileCard;
