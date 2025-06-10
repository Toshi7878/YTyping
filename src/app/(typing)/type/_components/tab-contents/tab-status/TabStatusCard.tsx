import { Card, CardContent } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { ComponentProps } from "react";
import StatusTbody from "./child/StatusTbody";

const TabStatusCard = (props: ComponentProps<typeof Table>) => {
  return (
    <Card className="tab-card">
      <CardContent>
        <div className="overflow-auto">
          <Table style={{ minHeight: props.style?.minHeight }} className="table-fixed overflow-hidden">
            <StatusTbody />
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabStatusCard;
