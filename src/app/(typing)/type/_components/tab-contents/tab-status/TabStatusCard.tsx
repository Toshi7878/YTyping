import { CardWithContent } from "@/components/ui/card";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import StatusCell from "./StatusCell";

const TabStatusCard = ({ className }: { className: string }) => {
  return (
    <CardWithContent
      className={{
        card: "tab-card py-0",
        cardContent: "overflow-auto",
      }}
    >
      <Table className={cn("table-fixed overflow-hidden", className)}>
        <TableBody className={cn("font-mono text-[2rem] font-bold", className)}>
          <TableRow className="border-b-0 hover:bg-transparent">
            {["score", "type", "kpm", "rank"].map((label) => {
              return <StatusCell key={label} label={label} />;
            })}
          </TableRow>
          <TableRow className="border-b-0 hover:bg-transparent">
            {["point", "miss", "lost", "line"].map((label) => {
              return <StatusCell key={label} label={label} />;
            })}
          </TableRow>
        </TableBody>
      </Table>
    </CardWithContent>
  );
};

export default TabStatusCard;
