import CustomCard from "@/components/custom-ui/CustomCard";
import { RouterOutPuts } from "@/server/api/trpc";
import { CardBody, CardFooter, CardHeader, Heading, Stack, Text } from "@chakra-ui/react";

interface UserCardProps {
  user: NonNullable<RouterOutPuts["user"]["getUser"]>;
}

const UserCard = ({ user }: UserCardProps) => {
  return (
    <CustomCard>
      <CardHeader mx={8}>
        <Heading as="h3" size="md">
          ユーザー情報
        </Heading>
      </CardHeader>
      <CardBody mx={8}>
        <Stack direction={{ base: "column", md: "row" }} spacing={4} align="center">
          <Text fontSize="xl" fontWeight="bold">
            {user.name}
          </Text>
        </Stack>
      </CardBody>
      <CardFooter mx={8} />
    </CustomCard>
  );
};

export default UserCard;
