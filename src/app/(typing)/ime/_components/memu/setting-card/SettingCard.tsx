import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { Card, CardBody, Divider, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, useTheme } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { Dispatch, useEffect, useRef } from "react";
import {
  useImeTypeOptionsState,
  useReadImeTypeOptions,
  useReadIsImeTypeOptionsEdited,
  useSetImetypeOptions,
  useSetMap,
} from "../../../atom/stateAtoms";
import { useParseImeMap } from "../../../hooks/parseImeMap";
import OptionCheckboxFormField from "./child/child/OptionCheckboxFormField";
import OptionInputFormField from "./child/child/OptionInputFormField";

interface SettingCardProps {
  isCardVisible: boolean;
  setIsCardVisible: Dispatch<boolean>;
}

const SettingCard = (props: SettingCardProps) => {
  const theme: ThemeColors = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const updateImeTypingOptions = clientApi.userTypingOption.updateImeTypeOptions.useMutation();
  const readIsImeTypeOptionsEdited = useReadIsImeTypeOptionsEdited();
  const readImeTypeOptions = useReadImeTypeOptions();
  const utils = clientApi.useUtils();
  const parseImeMap = useParseImeMap();
  const setMap = useSetMap();
  const { id: mapId } = useParams() as { id: string };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.parentElement?.id !== "option_icon" &&
        cardRef.current &&
        !cardRef.current.contains(target) &&
        target.closest("#reset-setting-modal-overlay") === null
      ) {
        props.setIsCardVisible(false);

        const isOptionEdited = readIsImeTypeOptionsEdited();
        if (isOptionEdited) {
          updateImeTypingOptions.mutate({ ...readImeTypeOptions() });
          const mapData = utils.map.getMap.getData({ mapId });

          if (mapData) {
            parseImeMap(mapData).then((map) => {
              setMap(map);
            });
          }
        }
      }
    };

    if (props.isCardVisible) {
      window.addEventListener("mousedown", handleClickOutside);
    } else {
      window.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isCardVisible]);

  const tabData = [
    {
      label: "メイン設定",
      content: <MainSettingTab />,
    },
  ];

  return (
    <>
      {props.isCardVisible && (
        <Card
          ref={cardRef}
          position="fixed"
          zIndex={4}
          width={"600px"}
          bg={theme.colors.background.body}
          color={theme.colors.text.body}
          border="1px"
          bottom={150}
          right={20}
          borderColor={theme.colors.border.card}
          fontSize={"lg"}
          boxShadow="lg"
          borderRadius="md"
          overflow="hidden"
        >
          <CardBody padding={4}>
            <Tabs variant="unstyled">
              <TabList mb={4} gap={2} display="flex" flexWrap="wrap">
                {tabData.map((tab, index) => (
                  <Tab
                    key={index}
                    _selected={{
                      bg: theme.colors.primary.main,
                      color: theme.colors.text.body,
                    }}
                    _hover={{
                      bg: theme.colors.primary.light,
                      color: theme.colors.text.body,
                    }}
                    fontSize="sm"
                    border={`1px solid ${theme.colors.border.card}`}
                    color={theme.colors.text.body}
                    rounded="md"
                    bg={theme.colors.background.card}
                  >
                    {tab.label}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {tabData.map((tab, index) => (
                  <TabPanel key={index} px={2}>
                    {tab.content}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      )}
    </>
  );
};

const SettingCardDivider = () => {
  const theme: ThemeColors = useTheme();
  return <Divider bg={theme.colors.text.body} my={4} />;
};

const MainSettingTab = () => {
  const userImeTypeOptions = useImeTypeOptionsState();
  const setUserImeTypeOptions = useSetImetypeOptions();

  return (
    <Flex flexDirection="column" gap={4}>
      <Flex flexDirection="column" gap={4}>
        <OptionInputFormField
          label={
            <OptionCheckboxFormField
              label="判定文字追加を有効化"
              name="enableAddSymbol"
              defaultChecked={userImeTypeOptions.enable_add_symbol}
              onChange={(e) => {
                setUserImeTypeOptions({
                  enable_add_symbol: e.target.checked,
                });
              }}
            />
          }
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            setUserImeTypeOptions({
              add_symbol_list: e.currentTarget.value,
            });
          }}
          value={userImeTypeOptions.add_symbol_list}
          name="addSymbol"
          isDisabled={!userImeTypeOptions.enable_add_symbol}
        />
      </Flex>
      <Flex>
        <OptionCheckboxFormField
          label="英語スペースを有効化"
          name="enableEngSpace"
          defaultChecked={userImeTypeOptions.enable_eng_space}
          onChange={(e) => {
            setUserImeTypeOptions({
              enable_eng_space: e.target.checked,
            });
          }}
        />
        <OptionCheckboxFormField
          label="英語大文字判定を有効化"
          name="enableEngUpperCase"
          defaultChecked={userImeTypeOptions.enable_eng_upper_case}
          onChange={(e) => {
            setUserImeTypeOptions({
              enable_eng_upper_case: e.target.checked,
            });
          }}
        />
      </Flex>

      <SettingCardDivider />

      <OptionCheckboxFormField
        label="次の歌詞を表示"
        name="enableNextLyrics"
        defaultChecked={userImeTypeOptions.enable_next_lyrics}
        onChange={(e) => {
          setUserImeTypeOptions({
            enable_next_lyrics: e.target.checked,
          });
        }}
      />
    </Flex>
  );
};

export default SettingCard;
