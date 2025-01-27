import { ResultCardInfo } from "@/app/timeline/ts/type";
import { Flex } from "@chakra-ui/react";
import ResultClapButton from "./child/ResultClapButton";
import ResultUserName from "./child/ResultUserName";

interface ResultCardHeaderProps {
  result?: ResultCardInfo;
}

const ResultCardHeader = ({ result }: ResultCardHeaderProps) => {
  return (
    <Flex alignItems="baseline" justifyContent="space-between">
      <ResultUserName result={result} />
      <ResultClapButton
        resultId={result?.id}
        clapCount={result?.clap_count}
        hasClap={result?.hasClap}
      />
    </Flex>
  );
};

export default ResultCardHeader;
