import { Card, CardBody, Flex, HStack, Stack, useTheme, useToast } from "@chakra-ui/react";

import {
  useMapCreatorIdState,
  useSetGeminiTagsState,
  useSetMapInfoState,
  useVideoIdState,
} from "@/app/edit/atoms/stateAtoms";
import { useUploadMap } from "@/app/edit/hooks/utils/useUploadMap";
import { INITIAL_SERVER_ACTIONS_STATE } from "@/app/edit/ts/const/editDefaultValues";
import { ThemeColors } from "@/types";
import { useGenerateMapInfoQuery } from "@/util/global-hooks/query/edit/useGenerateMapInfoQuery";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import InfoInputForm from "./tab-info-child/InfoInputFrom";
import InfoTag from "./tab-info-child/InfoTag";
import PreviewTimeInput from "./tab-info-child/PreviewTimeInput";
import TypeLinkButton from "./tab-info-child/TypeLinkButton";
import UploadButton from "./tab-info-child/UploadButton";

const TabInfoUpload = () => {
  const toast = useCustomToast();
  const { data: session } = useSession();
  const mapCreatorId = useMapCreatorIdState();
  const theme: ThemeColors = useTheme();
  const searchParams = useSearchParams();
  const isNewCreate = !!searchParams.get("new");
  const videoId = useVideoIdState();
  const { id: mapId } = useParams();
  const { data: mapInfoData, isFetching, error } = useGenerateMapInfoQuery({ videoId });
  const chakraToast = useToast();

  const setGeminiTags = useSetGeminiTagsState();
  const setMapInfo = useSetMapInfoState();

  useEffect(() => {
    if (error) {
      toast({ type: "error", title: error.message });
    }
  }, [error, toast]);

  useEffect(() => {
    if (mapInfoData) {
      const { title, artistName, source, otherTags } = mapInfoData;

      if (isNewCreate) {
        setMapInfo({ title, artistName, source });
      }

      setGeminiTags(otherTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInfoData]);

  const upload = useUploadMap();

  const [state, formAction] = useFormState(upload, INITIAL_SERVER_ACTIONS_STATE);

  const myUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const isDisplayUploadButton = (myUserId && (!mapCreatorId || Number(myUserId) === mapCreatorId)) || isAdmin;

  useEffect(() => {
    if (!isDisplayUploadButton) {
      const existingToast = chakraToast.isActive("login-required-toast");
      if (!existingToast) {
        toast({
          type: "warning",
          title: "編集保存権限がないため譜面の更新はできません",
          duration: 100000,
          size: "sm",
          isClosable: false, // ユーザーが閉じられないようにする
          id: "login-required-toast", // 重複表示を防ぐためのID
        });
      }
    }
  }, [chakraToast, isDisplayUploadButton, toast]);

  return (
    <Card variant="filled" bg={theme.colors.background.card} boxShadow="lg" color={theme.colors.text.body}>
      <CardBody>
        <Stack display="flex" flexDirection="column" gap="6">
          <InfoInputForm isGeminiLoading={isFetching && isNewCreate} />
          <InfoTag isGeminiLoading={isFetching} />
          <HStack justifyContent="space-between">
            {isDisplayUploadButton ? (
              <Flex
                as={"form"}
                action={formAction}
                gap={4}
                alignItems="baseline"
                flexDirection={{ base: "column", lg: "row" }}
              >
                <UploadButton state={state} />
                {mapId ? <TypeLinkButton /> : ""}
              </Flex>
            ) : (
              mapId && <TypeLinkButton />
            )}
            <PreviewTimeInput />
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default TabInfoUpload;
