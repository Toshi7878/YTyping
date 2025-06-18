"use client";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import ResultInnerCardBody from "./child/ResultCardBody";
import ResultInnerCardBodyWrapper from "./child/ResultCardBodyWrapper";
import ResultCardHeader from "./child/ResultCardHeader";
import { MapResultBadgesMobile } from "./child/child/MapResultBadgesLayout";

function ResultSkeletonCard() {
  return (
    <Card className="map-card-hover transition-shadow duration-300">
      <CardHeader className="mx-2 flex flex-row justify-between rounded-md py-3">
        <ResultCardHeader />
      </CardHeader>

      <ResultInnerCardBodyWrapper>
        <ResultInnerCardBody />
      </ResultInnerCardBodyWrapper>

      <CardFooter className="rounded-md pb-1">
        <MapResultBadgesMobile className="hidden md:flex" />
      </CardFooter>
    </Card>
  );
}

export default ResultSkeletonCard;
