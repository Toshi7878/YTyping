"use client";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
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
    <Card className="map-card-hover transition-shadow duration-300">
      <CardHeader className="mx-2 rounded-md py-3">
        <ResultCardHeader result={result} />
      </CardHeader>

      <ResultInnerCardBodyWrapper result={result}>
        <ResultInnerCardBody result={result} />
      </ResultInnerCardBodyWrapper>

      <CardFooter className="rounded-md pb-1">
        <MapResultBadgesMobile result={result} className="hidden md:flex" />
      </CardFooter>
    </Card>
  );
}

export default ResultCard;
