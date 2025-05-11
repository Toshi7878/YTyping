import CustomCard from "@/components/custom-ui/CustomCard";
import { CardBody, Table, TableContainer, TableProps } from "@chakra-ui/react";
import StatusTbody from "./child/StatusTbody";

const TabStatusCard = (props: TableProps) => {
  return (
    <CustomCard className="tab-card">
      <CardBody>
        <TableContainer>
          <Table
            minH={props.minH}
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
