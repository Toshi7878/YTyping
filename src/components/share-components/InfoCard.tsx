import { Card, CardBody, CardHeader, CardProps, Heading } from "@chakra-ui/react";
import { IoMdInformationCircleOutline } from "react-icons/io";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

const InfoCard = ({ title, children, ...props }: InfoCardProps & CardProps) => {
  return (
    <Card colorScheme="blue" variant="outline" borderColor="blue.500" borderWidth="1px" {...props}>
      <CardHeader display="flex" alignItems="end" gap={2}>
        <IoMdInformationCircleOutline size={20} />
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody pt={0}>{children}</CardBody>
    </Card>
  );
};

export default InfoCard;
