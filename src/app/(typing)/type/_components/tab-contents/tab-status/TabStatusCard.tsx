import { CardWithContent } from "@/components/ui/card";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import StatusCell from "./StatusCell";

const TabStatusCard = ({ className }: { className: string }) => {
  return (
    <CardWithContent
      className={{
        card: cn("tab-card py-0", className),
        cardContent: "my-auto overflow-auto",
      }}
    >
      <Table className={cn("h-48 table-fixed overflow-hidden")}>
        <TableBody className={cn("font-mono text-[2rem] font-bold")}>
          <StatusTableRow labels={["score", "type", "kpm", "rank"]} />
          <StatusTableRow labels={["point", "miss", "lost", "line"]} />
        </TableBody>
      </Table>
    </CardWithContent>
  );
};

const StatusTableRow = ({ labels }: { labels: string[] }) => {
  return (
    <TableRow className="border-b-0 hover:bg-transparent">
      {labels.map((label) => {
        return <StatusCell key={label} label={label} />;
      })}
    </TableRow>
  );
};

export default TabStatusCard;
