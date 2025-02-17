import CustomCard from "@/components/custom-ui/CustomCard";
import { CardBody, CardFooter, CardHeader, Flex, Heading } from "@chakra-ui/react";
import { UpdateNameForm } from "../../../_components/UpdateNameForm";

const ProfileSettingCard = () => {
  return (
    <CustomCard>
      <CardHeader mx={8}>
        <Heading as="h3" size="md">
          プロフィール設定
        </Heading>
      </CardHeader>
      <CardBody mx={8}>
        <Flex width="100%">
          <UpdateNameForm />
        </Flex>
      </CardBody>
      <CardFooter mx={8} />
    </CustomCard>
  );
};

export default ProfileSettingCard;
