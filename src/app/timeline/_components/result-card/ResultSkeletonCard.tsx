"use client";
import CustomMapCard from "@/components/custom-ui/CustomMapCard";
import { CardFooter, CardHeader } from "@chakra-ui/react";
import ResultInnerCardBody from "./child/ResultCardBody";
import ResultInnerCardBodyWrapper from "./child/ResultCardBodyWrapper";
import ResultCardHeader from "./child/ResultCardHeader";
import { MapResultBadgesMobile } from "./child/child/MapResultBadgesLayout";

function ResultSkeletonCard() {
  return (
    <CustomMapCard>
      <CardHeader borderRadius="md" mx={2} py={3}>
        <ResultCardHeader />
      </CardHeader>
      <ResultInnerCardBodyWrapper>
        <ResultInnerCardBody />
      </ResultInnerCardBodyWrapper>
      <CardFooter borderRadius="md" pb={1}>
        <MapResultBadgesMobile display={{ base: "flex", md: "none" }} />
      </CardFooter>
    </CustomMapCard>
  );
}

export default ResultSkeletonCard;
