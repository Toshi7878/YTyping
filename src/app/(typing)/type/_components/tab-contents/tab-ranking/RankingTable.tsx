import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RANKING_COLUMN_WIDTH } from "@/app/(typing)/type/ts/const/consts";
import { FaHandsClapping } from "react-icons/fa6";
import { useEffect, useState } from "react";

interface RankingTableProps {
  children: React.ReactNode;
}

const RankingTable = (props: RankingTableProps) => {
  const [clapIconSize, setClapIconSize] = useState("1rem");

  useEffect(() => {
    const updateClapIconSize = () => {
      setClapIconSize(window.innerWidth < 768 ? "2rem" : "1rem");
    };

    updateClapIconSize();
    window.addEventListener("resize", updateClapIconSize);
    return () => window.removeEventListener("resize", updateClapIconSize);
  }, []);

  return (
    <Table
      className="ranking-table text-sm"
      style={{
        ["--table-border-color" as any]: `rgba(255, 255, 255, 0.8)`,
        ["--table-header-border-color" as any]: `rgba(255, 255, 255, 0.2)`,
      }}
    >
      <TableHeader
        className="sticky top-0 z-0 select-none bg-[#2b3035]"
      >
        <TableRow>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.rank }} className="text-white">
            順位
          </TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.score }} className="text-white">
            Score
          </TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.clearRate }} className="text-white">
            クリア率
          </TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.userName }} className="text-white">
            名前
          </TableHead>

          <TableHead style={{ width: RANKING_COLUMN_WIDTH.kpm }} className="text-white">
            kpm
          </TableHead>
          <TableHead style={{ maxWidth: RANKING_COLUMN_WIDTH.inputMode }} className="text-white">
            モード
          </TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.updatedAt }} className="text-white">
            時間
          </TableHead>
          <TableHead
            className="relative text-white"
            style={{
              width: RANKING_COLUMN_WIDTH.clapCount,
              right: "0.25rem",
              top: "-0.125rem",
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
