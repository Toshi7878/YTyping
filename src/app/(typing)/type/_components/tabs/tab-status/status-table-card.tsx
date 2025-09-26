import { CardWithContent } from "@/components/ui/card"
import { Table, TableBody, TableRow } from "@/components/ui/table/table"
import { cn } from "@/lib/utils"
import StatusCell from "./status-cell"

const StatusCard = ({ className }: { className: string }) => {
  return (
    <CardWithContent
      id="tab-status-card"
      className={{
        card: cn("tab-card py-0", className),
        cardContent: "my-auto overflow-auto pl-24 md:pl-6",
      }}
    >
      <Table className="h-48 table-fixed overflow-hidden">
        <TableBody className="font-mono text-5xl font-bold md:text-[2rem]">
          <StatusTableRow labels={["score", "type", "kpm", "rank"]} />
          <StatusTableRow labels={["point", "miss", "lost", "line"]} />
        </TableBody>
      </Table>
    </CardWithContent>
  )
}

const StatusTableRow = ({ labels }: { labels: string[] }) => {
  return (
    <TableRow className="border-b-0 hover:bg-transparent">
      {labels.map((label) => (
        <StatusCell key={label} label={label} />
      ))}
    </TableRow>
  )
}

export default StatusCard
