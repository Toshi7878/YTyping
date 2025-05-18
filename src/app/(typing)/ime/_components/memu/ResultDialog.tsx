import CustomModalContent from "@/components/custom-ui/CustomModalContent";
import { ThemeColors } from "@/types";
import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useTheme,
} from "@chakra-ui/react";
import { useMapState, useStatusState, useWordResultsState } from "../../atom/stateAtoms";

const ResultStatus = () => {
  const status = useStatusState();
  const map = useMapState();
  const theme: ThemeColors = useTheme();

  const isPerfect = status.score === 1000;

  return (
    <section>
      <Flex
        mb={4}
        gap={4}
        justify="center"
        align="center"
        borderRadius="md"
        boxShadow="sm"
        p={4}
        border={`1px solid ${theme.colors.border.card}40`}
      >
        <Stat minW="120px" textAlign="center">
          <StatLabel fontSize="sm" fontWeight="semibold" color={theme.colors.text.header.normal}>
            スコア
          </StatLabel>
          <StatNumber
            fontSize="3xl"
            fontFamily="mono"
            fontWeight="bold"
            color={isPerfect ? theme.colors.semantic.perfect : theme.colors.text.body}
          >
            {status.score}{" "}
            <span style={{ fontSize: "1rem", color: theme.colors.text.header.normal, fontWeight: "normal" }}>
              / 1000
            </span>
          </StatNumber>
        </Stat>
        <Stat minW="120px" textAlign="center">
          <StatLabel fontSize="sm" fontWeight="semibold" color={theme.colors.text.header.normal}>
            タイプ数
          </StatLabel>
          <StatNumber
            fontSize="3xl"
            fontFamily="mono"
            fontWeight="bold"
            color={isPerfect ? theme.colors.semantic.perfect : theme.colors.text.body}
          >
            {status.typeCount}{" "}
            <span style={{ fontSize: "1rem", color: theme.colors.text.header.normal, fontWeight: "normal" }}>
              / {map?.totalNotes}
            </span>
          </StatNumber>
        </Stat>
      </Flex>
    </section>
  );
};

const TD_WIDTHS = {
  No: "5%",
  Evaluation: "5%",
  Input: "45%",
  Song: "45%",
};

const ResultWordsTable = () => {
  const wordResults = useWordResultsState();
  const map = useMapState();
  const status = useStatusState();

  return (
    <div className="rounded-lg border shadow-sm" style={{ maxHeight: "45vh", overflowY: "auto" }}>
      <Table variant="simple" size="sm">
        <Thead top="0" position="sticky" bg="background.body" py={4} zIndex="sticky">
          <Tr>
            <Th textAlign="center" width={TD_WIDTHS.No}>
              No.
            </Th>
            <Th textAlign="center" width={TD_WIDTHS.Evaluation}>
              判定
            </Th>
            <Th width={TD_WIDTHS.Input}>入力</Th>
            <Th width={TD_WIDTHS.Song}>歌詞</Th>
          </Tr>
        </Thead>
        <Tbody>
          {wordResults.map((result, index) => {
            const isJudged = status.wordIndex > index || (status.wordIndex === index && result.evaluation !== "Skip");

            return (
              <Tr key={index} className="[&>td]:py-3">
                <Td textAlign="center" className="font-mono" width={TD_WIDTHS.No}>
                  {index + 1}
                </Td>
                <Td textAlign="center" width={TD_WIDTHS.Evaluation}>
                  {isJudged ? <EvaluationText evaluation={result.evaluation} /> : "-"}
                </Td>
                <Td width={TD_WIDTHS.Input}>{result.input}</Td>
                <Td width={TD_WIDTHS.Song}>{result.evaluation !== "Great" && map?.textWords[index]}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
};

const EvaluationText = ({ evaluation }: { evaluation: string }) => {
  const theme: ThemeColors = useTheme();

  if (evaluation === "Great") {
    return (
      <Text className="outline-text" color={theme.colors.semantic.perfect}>
        Great!
      </Text>
    );
  }

  if (evaluation === "Good") {
    return (
      <Text className="outline-text" color={theme.colors.secondary.light}>
        Good
      </Text>
    );
  }

  if (evaluation === "None") {
    return (
      <Text className="outline-text" color={theme.colors.semantic.failure}>
        None
      </Text>
    );
  }

  return (
    <Text className="outline-text" color={theme.colors.text.body} opacity={0.6}>
      Skip
    </Text>
  );
};

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResultDialog = ({ isOpen, onClose }: ResultDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <CustomModalContent maxH="80vh" position="relative" bottom="2vh">
        <ModalHeader>採点結果</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ResultStatus />
          <ResultWordsTable />
        </ModalBody>
        <ModalFooter></ModalFooter>
      </CustomModalContent>
    </Modal>
  );
};

export default ResultDialog;
