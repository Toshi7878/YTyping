import CustomCard from "@/components/custom-ui/CustomCard";
import { CardBody, Table, TableContainer } from "@chakra-ui/react";
import StatusTbody from "./child/StatusTbody";

interface TabStatusProps {
  height: string;
}

const TabStatusCard = (props: TabStatusProps) => {
  return (
    <CustomCard className="tab-card">
      <CardBody>
        <TableContainer>
          <Table
            minH={props.height}
            variant="unstyled"
            className="table-fixed overflow-hidden"
            overflowY="auto"
          >
            <StatusTbody />
          </Table>
        </TableContainer>
      </CardBody>
    </CustomCard>
  );
};

export default TabStatusCard;
