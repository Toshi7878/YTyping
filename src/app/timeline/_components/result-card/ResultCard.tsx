"use client";
import CustomMapCard from "@/components/custom-ui/CustomMapCard";
import { CardFooter, CardHeader } from "@chakra-ui/react";
import { ResultCardInfo } from "../../ts/type";
import { MapResultBadgesMobile } from "./child/child/MapResultBadgesLayout";
import ResultInnerCardBody from "./child/ResultCardBody";
import ResultInnerCardBodyWrapper from "./child/ResultCardBodyWrapper";
import ResultCardHeader from "./child/ResultCardHeader";

interface ResultCardProps {
  result: ResultCardInfo;
}

function ResultCard(props: ResultCardProps) {
  const { result } = props;

  return (
    <CustomMapCard>
      <CardHeader borderRadius="md" mx={2} py={3}>
        <ResultCardHeader result={result} />
      </CardHeader>
      <ResultInnerCardBodyWrapper result={result}>
        <ResultInnerCardBody result={result} />
      </ResultInnerCardBodyWrapper>
      <CardFooter borderRadius="md" pb={1}>
        <MapResultBadgesMobile result={result} display={{ base: "flex", md: "none" }} />
      </CardFooter>
    </CustomMapCard>
  );
}

export default ResultCard;
