import { Table, Tbody, Th, Thead, Tr, useTheme } from "@chakra-ui/react";

import { RANKING_COLUMN_WIDTH } from "@/app/type/ts/const/consts";
import { ThemeColors } from "@/types";
import { FaHandsClapping } from "react-icons/fa6";

interface RankingTableProps {
  children: React.ReactNode;
}

const RankingTable = (props: RankingTableProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Table
      variant="simple"
      className="ranking-table"
      size="sm"
      sx={{
        td: {
          border: "none",
          borderBottom: "1px",
          borderColor: `${theme.colors.border.card}cc`,
          paddingY: "0.6rem",
          fontSize: "1.13rem",
        },
        th: {
          borderBottom: "1px",
          borderColor: `${theme.colors.border.card}30`,
        },
      }}
    >
      <Thead
        position="sticky"
        top={0}
        zIndex={0}
        background={theme.colors.background.card}
        className="ranking-thead"
        style={{ userSelect: "none" }}
      >
        <Tr>
          <Th width={RANKING_COLUMN_WIDTH.rank} color={theme.colors.text.body}>
            順位
          </Th>
          <Th width={RANKING_COLUMN_WIDTH.score} color={theme.colors.text.body}>
            Score
          </Th>
          <Th width={RANKING_COLUMN_WIDTH.clearRate} color={theme.colors.text.body}>
            クリア率
          </Th>
          <Th width={RANKING_COLUMN_WIDTH.userName} color={theme.colors.text.body}>
            名前
          </Th>

          <Th width={RANKING_COLUMN_WIDTH.kpm} color={theme.colors.text.body}>
            kpm
          </Th>
          <Th width={RANKING_COLUMN_WIDTH.inputMode} color={theme.colors.text.body}>
            モード
          </Th>
          <Th width={RANKING_COLUMN_WIDTH.updatedAt} color={theme.colors.text.body}>
            時間
          </Th>
          <Th
            width={RANKING_COLUMN_WIDTH.clapCount}
            position="relative"
            right={1}
            top={-0.5}
            color={theme.colors.text.body}
          >
            <FaHandsClapping size={"1rem"} />
          </Th>
        </Tr>
      </Thead>
      <Tbody>{props.children}</Tbody>
    </Table>
  );
};

export default RankingTable;
