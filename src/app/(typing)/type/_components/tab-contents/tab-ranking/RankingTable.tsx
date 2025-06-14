import { useBreakpointValue, useTheme } from "@chakra-ui/react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RANKING_COLUMN_WIDTH } from "@/app/(typing)/type/ts/const/consts";
import { ThemeColors } from "@/types";
import { FaHandsClapping } from "react-icons/fa6";

interface RankingTableProps {
  children: React.ReactNode;
}

const RankingTable = (props: RankingTableProps) => {
  const theme: ThemeColors = useTheme();
  const clapIconSize = useBreakpointValue({ base: "2rem", md: "1rem" });

  return (
    <Table
      className="ranking-table text-sm"
      style={{
        ["--table-border-color" as any]: `${theme.colors.border.card}cc`,
        ["--table-header-border-color" as any]: `${theme.colors.border.card}30`,
      }}
    >
      <TableHeader
        className="sticky top-0 z-0 select-none"
        style={{
          backgroundColor: theme.colors.background.card,
        }}
      >
        <TableRow>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.rank, color: theme.colors.text.body }}>
            順位
          </TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.score, color: theme.colors.text.body }}>
            Score
          </TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.clearRate, color: theme.colors.text.body }}>
            クリア率
          </TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.userName, color: theme.colors.text.body }}>
            名前
          </TableHead>

          <TableHead style={{ width: RANKING_COLUMN_WIDTH.kpm, color: theme.colors.text.body }}>
            kpm
          </TableHead>
          <TableHead style={{ maxWidth: RANKING_COLUMN_WIDTH.inputMode, color: theme.colors.text.body }}>
            モード
          </TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.updatedAt, color: theme.colors.text.body }}>
            時間
          </TableHead>
          <TableHead
            className="relative"
            style={{
              width: RANKING_COLUMN_WIDTH.clapCount,
              right: "0.25rem",
              top: "-0.125rem",
              color: theme.colors.text.body
            }}
          >
            <FaHandsClapping size={clapIconSize} />
          </TableHead>
          <TableHead
            style={{
              width: 0,
              padding: 0,
              border: "none",
            }}
          />
        </TableRow>
      </TableHeader>
      <TableBody suppressHydrationWarning>{props.children}</TableBody>
    </Table>
  );
};

export default RankingTable;
