"use client";

import { useGameUtilityReferenceParams } from "@/app/(typing)/type/atoms/refAtoms";
import { RANKING_COLUMN_WIDTH } from "@/app/(typing)/type/ts/const/consts";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import ClapedText from "@/components/share-components/text/ClapedText";
import ClearRateText from "@/components/share-components/text/ClearRateText";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import RankText from "@/components/share-components/text/RankText";
import ResultToolTipText from "@/components/share-components/text/ResultToolTipText";
import { UserInputModeText } from "@/components/share-components/text/UserInputModeText";
import { RouterOutPuts } from "@/server/api/trpc";
import { ThemeColors } from "@/types";
import { useLocalClapServerActions } from "@/util/global-hooks/useLocalClapServerActions";
import { Td, Tr, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { Dispatch, useEffect } from "react";
import RankingMenu from "./RankingMenu";

interface RankingTrProps {
  result: RouterOutPuts["ranking"]["getMapRanking"][number];
  index: number;
  rank: number;
  type: number;
  romaType: number;
  kanaType: number;
  flickType: number;
  isHighlighted: boolean;
  showMenu: number | null;
  setShowMenu: Dispatch<number | null>;
  setHoveredIndex: Dispatch<number | null>;
  isHovered: boolean;
  handleShowMenu: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const RankingTr = (props: RankingTrProps) => {
  const { result } = props;
  const { status } = result as { status: NonNullable<typeof result.status> };
  const theme: ThemeColors = useTheme();
  const { data: session } = useSession();
  const userId = Number(session?.user.id);
  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();

  const { clapOptimisticState, toggleClapAction } = useLocalClapServerActions({
    hasClap: !!result.claps[0]?.is_claped && !!session,
    clapCount: result.clap_count,
  });

  useEffect(() => {
    if (userId === result.user_id) {
      writeGameUtilRefParams({
        practiceMyResultId: result.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPerfect = status.miss === 0 && status.lost === 0;
  const isKanaFlickTyped = props.kanaType > 0 || props.flickType > 0;
  const correctRate = ((props.type / (status.miss + props.type)) * 100).toFixed(1);

  return (
    <>
      <CustomToolTip
        label={
          <ResultToolTipText
            romaType={props.romaType}
            kanaType={props.kanaType}
            flickType={props.flickType}
            englishType={result.status!.english_type}
            numType={result.status!.num_type}
            symbolType={result.status!.symbol_type}
            spaceType={result.status!.space_type}
            correctRate={correctRate}
            isPerfect={isPerfect}
            isKanaFlickTyped={isKanaFlickTyped}
            lost={status.lost}
            miss={status.miss}
            maxCombo={status.max_combo}
            kpm={status.kpm}
            rkpm={status.rkpm}
            romaKpm={status.roma_kpm}
            romaRkpm={status.roma_rkpm}
            defaultSpeed={status.default_speed}
            updatedAt={result.updated_at}
          />
        }
        isOpen={(props.isHighlighted && window.innerWidth >= 768) || props.isHovered}
        placement="bottom-end"
      >
        <Tr
          _hover={{ backgroundColor: theme.colors.button.sub.hover }}
          backgroundColor={props.isHighlighted ? theme.colors.button.sub.hover : "transparent"}
          cursor="pointer"
          className={`${userId === result.user_id ? "my-result" : ""}`}
          {...(userId === result.user_id && {
            color: theme.colors.secondary.main,
          })}
          zIndex={5}
          onClick={props.handleShowMenu}
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
        >
          <Td width={RANKING_COLUMN_WIDTH.rank}>
            <RankText rank={props.rank}>{`#${props.rank}`}</RankText>
          </Td>
          <Td width={RANKING_COLUMN_WIDTH.score}>{status.score}</Td>
          <Td width={RANKING_COLUMN_WIDTH.clearRate}>
            <ClearRateText clearRate={status.clear_rate} isPerfect={isPerfect} />
          </Td>
          <Td
            width={RANKING_COLUMN_WIDTH.userName}
            isTruncated
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {result.user.name}
          </Td>

          <Td width={RANKING_COLUMN_WIDTH.kpm}>{status.kpm}</Td>
          <Td width={RANKING_COLUMN_WIDTH.inputMode}>
            <UserInputModeText
              kanaType={props.kanaType}
              romaType={props.romaType}
              flickType={props.flickType}
              englishType={result.status!.english_type}
              symbolType={result.status!.symbol_type}
              numType={result.status!.num_type}
              spaceType={result.status!.space_type}
            />
          </Td>
          <Td width={RANKING_COLUMN_WIDTH.updatedAt}>
            <DateDistanceText date={new Date(result.updated_at)} />
          </Td>
          <Td width={RANKING_COLUMN_WIDTH.clapCount} alignItems="center">
            <ClapedText clapOptimisticState={clapOptimisticState} />
          </Td>
        </Tr>
      </CustomToolTip>
      {props.showMenu === props.index && (
        <RankingMenu
          resultId={result.id}
          userId={result.user_id}
          resultUpdatedAt={result.updated_at}
          name={result.user.name as string}
          setShowMenu={props.setShowMenu}
          setHoveredIndex={props.setHoveredIndex}
          clapOptimisticState={clapOptimisticState}
          toggleClapAction={toggleClapAction}
        />
      )}
    </>
  );
};

export default RankingTr;
