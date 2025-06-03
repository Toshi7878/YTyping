import { useGameUtilityReferenceParams } from "@/app/(typing)/type/atoms/refAtoms";
import { useSceneState, useSetTypingStatusRank } from "@/app/(typing)/type/atoms/stateAtoms";
import { useMapRankingQueries } from "@/util/global-hooks/queries/mapRanking.queries";
import { Box, Spinner } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RankingTable from "../RankingTable";
import RankingTr from "./child/RankingTr";

const RankingList = () => {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scene = useSceneState();
  const { id: mapId } = useParams();

  const { data, error, isPending } = useMapRankingQueries.getMapRanking({ mapId: mapId as string });
  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const setTypingStatusRank = useSetTypingStatusRank();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu !== null &&
        !event
          .composedPath()
          .some(
            (el) =>
              (el as HTMLElement).className?.includes("cursor-pointer") ||
              (el as HTMLElement).tagName === "BUTTON" ||
              (el as HTMLElement).tagName === "A",
          )
      ) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    return () => {
      setShowMenu(null);
      setHoveredIndex(null);
    };
  }, []);

  useEffect(() => {
    const scores = data
      ? data.map((result: (typeof data)[number]) => result.status?.score).filter((score) => score !== undefined)
      : [];

    writeGameUtilRefParams({
      rankingScores: scores,
    });

    setTypingStatusRank(scores.length + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    const userId = Number(session?.user?.id);

    if (scene === "play" && data) {
      for (let i = 0; i < data.length; i++) {
        if (userId === Number(data[i].user_id)) {
          writeGameUtilRefParams({
            myBestScore: data[i].status!.score,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, data]);

  if (isPending) {
    return (
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
        <Spinner size="lg" />
      </Box>
    );
  }
  if (error) return <div>Error loading data</div>;

  if (!data) return null;

  return (
    <RankingTable>
      {data &&
        data.map((user: (typeof data)[number], index: number) => {
          if (!user.status) return null;

          const romaType = user.status!.roma_type;
          const kanaType = user.status!.kana_type;
          const flickType = user.status!.flick_type;

          const englishType = user.status!.english_type;
          const numType = user.status!.num_type;
          const symbolType = user.status!.symbol_type;
          const spaceType = user.status!.space_type;
          const type = romaType + kanaType + flickType + englishType + numType + symbolType + spaceType;
          const handleShowMenu = () => {
            if (showMenu === index) {
              setShowMenu(null);
            } else {
              setShowMenu(index);
            }
          };

          return (
            <RankingTr
              key={user.user_id}
              result={user}
              index={index}
              rank={index + 1}
              type={type}
              romaType={romaType}
              kanaType={kanaType}
              flickType={flickType}
              isHighlighted={showMenu === index}
              isHovered={hoveredIndex === index}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              setHoveredIndex={setHoveredIndex}
              handleShowMenu={handleShowMenu}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
    </RankingTable>
  );
};

export default RankingList;
