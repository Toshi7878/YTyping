"use client";
import CustomMapCard from "@/components/custom-ui/CustomMapCard";
import { ThemeColors } from "@/types";
import { CardFooter, CardHeader, Flex, useBreakpointValue, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { ResultCardInfo } from "../../ts/type";
import { MapResultBadgesMobile } from "./child/child/MapResultBadgesLayout";
import ResultClapButton from "./child/child/ResultClapButton";
import ResultUserName from "./child/child/ResultUserName";
import ResultInnerCardBody from "./child/ResultInnerCardBody";

interface ResultCardProps {
  result: ResultCardInfo;
}

function ResultCard(props: ResultCardProps) {
  const { result } = props;
  const { data: session } = useSession();

  const theme: ThemeColors = useTheme();
  const showBadges = useBreakpointValue({ base: false, md: true }, { ssr: false });

  return (
    <CustomMapCard>
      <CardHeader bg={theme.colors.background.card} borderRadius="md" mx={2} py={3}>
        <Flex alignItems="baseline" justifyContent="space-between">
          <ResultUserName result={result} />

          {session?.user.name ? (
            <ResultClapButton
              resultId={result.id}
              clapCount={result.clapCount}
              hasClap={result.hasClap}
            />
          ) : null}
        </Flex>
      </CardHeader>
      <ResultInnerCardBody result={result} />
      <CardFooter bg={theme.colors.background.card} borderRadius="md" pb={1}>
        {!showBadges && <MapResultBadgesMobile props={result} />}
      </CardFooter>
    </CustomMapCard>
  );
}

export default ResultCard;
