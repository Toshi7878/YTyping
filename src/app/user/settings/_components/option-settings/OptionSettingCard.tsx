import CustomCard from "@/components/custom-ui/CustomCard";
import { RouterOutPuts } from "@/server/api/trpc";
import { CardBody, CardFooter, CardHeader, Flex, Heading } from "@chakra-ui/react";
import { OptionSettingForm } from "./child/OptionSettingForm";

interface OptionSettingCardProps {
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

const OptionSettingCard = ({ userOptions }: OptionSettingCardProps) => {
  return (
    <CustomCard>
      <CardHeader mx={8}>
        <Heading as="h3" size="md">
          ユーザー設定
        </Heading>
      </CardHeader>
      <CardBody mx={8}>
        <Flex width="100%">
          <OptionSettingForm userOptions={userOptions} />
        </Flex>
      </CardBody>
      <CardFooter mx={8} />
    </CustomCard>
  );
};

export default OptionSettingCard;
