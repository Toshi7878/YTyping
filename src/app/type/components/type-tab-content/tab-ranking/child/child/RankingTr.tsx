"use client";

import { useDownloadPlayDataJsonQuery } from "@/app/type/hooks/data-query/useDownloadResultJsonQuery";
import { RANKING_COLUMN_WIDTH } from "@/app/type/ts/const/consts";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import UpdateAtText from "@/components/custom-ui/UpdateAtText";
import ClapedText from "@/components/user-result-text/ClapedText";
import ClearRateText from "@/components/user-result-text/ClearRateText";
import RankText from "@/components/user-result-text/RankText";
import ResultToolTipText from "@/components/user-result-text/ResultToolTipText";
import { UserInputModeText } from "@/components/user-result-text/UserInputModeText";
import { useLocalClapServerActions } from "@/lib/global-hooks/useLocalClapServerActions";
import { RouterOutPuts } from "@/server/api/trpc";
import { ThemeColors } from "@/types";
import { Td, Tr, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { Dispatch, useEffect, useState } from "react";
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
  const { gameStateRef } = useRefs();
  const theme: ThemeColors = useTheme();
  const { data: session } = useSession();
  const userId = Number(session?.user.id);
  const { clapOptimisticState, toggleClapAction } = useLocalClapServerActions({
    hasClap: !!props.result.clap[0]?.isClaped,
    clapCount: props.result.clapCount,
  });
  const [replayId, setReplayId] = useState<number | null>(null);
  const { data, error, isLoading } = useDownloadPlayDataJsonQuery(replayId);

  useEffect(() => {
    if (userId === props.result.userId) {
      gameStateRef.current!.practice.hasMyRankingData = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPerfect = props.result.miss === 0 && props.result.lost === 0;
  const isKanaFlickTyped = props.kanaType > 0 || props.flickType > 0;
  const correctRate = ((props.type / (props.result.miss + props.type)) * 100).toFixed(1);

  return (
    <>
      <CustomToolTip
        tooltipLabel={
          <ResultToolTipText
            romaType={props.romaType}
            kanaType={props.kanaType}
            flickType={props.flickType}
            miss={props.result.miss}
            correctRate={correctRate}
            lost={props.result.lost}
            isPerfect={isPerfect}
            maxCombo={props.result.maxCombo}
            kpm={props.result.kpm}
            rkpm={props.result.rkpm}
            romaKpm={props.result.romaKpm}
            isKanaFlickTyped={isKanaFlickTyped}
            defaultSpeed={props.result.defaultSpeed}
            updatedAt={props.result.updatedAt}
          />
        }
        isOpen={(props.isHighlighted && window.innerWidth >= 768) || props.isHovered}
        placement="bottom-end"
      >
        <Tr
          _hover={{ backgroundColor: theme.colors.button.sub.hover }}
          backgroundColor={props.isHighlighted ? theme.colors.button.sub.hover : "transparent"}
          cursor="pointer"
          className={`${userId === props.result.userId ? "my-result" : ""}`}
          {...(userId === props.result.userId && {
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
          <Td width={RANKING_COLUMN_WIDTH.score}>{props.result.score}</Td>
          <Td width={RANKING_COLUMN_WIDTH.clearRate}>
            <ClearRateText clearRate={props.result.clearRate} isPerfect={isPerfect} />
          </Td>
          <Td
            width={RANKING_COLUMN_WIDTH.userName}
            isTruncated
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {props.result.user.name}
          </Td>

          <Td width={RANKING_COLUMN_WIDTH.kpm}>{props.result.kpm}</Td>
          <Td width={RANKING_COLUMN_WIDTH.inputMode}>
            <UserInputModeText
              kanaType={props.kanaType}
              romaType={props.romaType}
              flickType={props.flickType}
            />
          </Td>
          <Td width={RANKING_COLUMN_WIDTH.updatedAt}>
            <UpdateAtText updatedAt={props.result.updatedAt} />
          </Td>
          <Td width={RANKING_COLUMN_WIDTH.clapCount} alignItems="center">
            <ClapedText clapOptimisticState={clapOptimisticState} />
          </Td>
        </Tr>
      </CustomToolTip>
      {props.showMenu === props.index && (
        <RankingMenu
          resultId={props.result.id}
          userId={props.result.userId}
          resultUpdatedAt={props.result.updatedAt}
          name={props.result.user.name as string}
          setShowMenu={props.setShowMenu}
          setHoveredIndex={props.setHoveredIndex}
          clapOptimisticState={clapOptimisticState}
          toggleClapAction={toggleClapAction}
          setReplayId={setReplayId}
        />
      )}
    </>
  );
};

export default RankingTr;
