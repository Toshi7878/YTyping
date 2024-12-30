import CustomCard from "@/components/custom-ui/CustomCard";
import { CardBody, CardFooter, CardHeader, Flex } from "@chakra-ui/react";
import { UpdateNameForm } from "../../../_components/UpdateNameForm";

const ProfileSettingCard = () => {
  return (
    <CustomCard>
      <CardHeader mx={8}>プロフィール設定</CardHeader>
      <CardBody mx={8}>
        <Flex width="100%">
          <UpdateNameForm />
        </Flex>
      </CardBody>
      <CardFooter mx={8}>Footer</CardFooter>
    </CustomCard>
  );
};

export default ProfileSettingCard;
