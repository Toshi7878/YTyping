import { Card, CardBody, Flex, HStack, Stack, useTheme, useToast } from "@chakra-ui/react";

import { useSetGeminiTags, useSetMapInfo, useVideoIdState } from "@/app/edit/atoms/stateAtoms";
import useHasMapUploadPermission from "@/app/edit/hooks/useUserEditPermission";
import { useUploadMap } from "@/app/edit/hooks/utils/useUploadMap";
import { INITIAL_SERVER_ACTIONS_STATE } from "@/app/edit/ts/const/editDefaultValues";
import { ThemeColors } from "@/types";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useGeminiQueries } from "@/utils/queries/gemini.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import InfoInputForm from "./tab-info-child/InfoInputFrom";
import InfoTag from "./tab-info-child/InfoTag";
import PreviewTimeInput from "./tab-info-child/PreviewTimeInput";
import TypeLinkButton from "./tab-info-child/TypeLinkButton";
import UploadButton from "./tab-info-child/UploadButton";

export const NOT_EDIT_PERMISSION_TOAST_ID = "not-edit-permission-toast";

const TabInfoUpload = () => {
  const toast = useCustomToast();
  const theme: ThemeColors = useTheme();
  const searchParams = useSearchParams();
  const isNewCreate = !!searchParams.get("new");
  const videoId = useVideoIdState();
  const { id: mapId } = useParams();
  const isBackUp = searchParams.get("backup") === "true";
  const hasUploadPermission = useHasMapUploadPermission();
  const {
    data: mapInfoData,
    isFetching,
    error,
  } = useQuery(useGeminiQueries().generateMapInfo({ videoId }, { enabled: !isBackUp && hasUploadPermission }));
  const chakraToast = useToast();

  const setGeminiTags = useSetGeminiTags();
  const setMapInfo = useSetMapInfo();

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

  const [state, formAction] = useActionState(upload, INITIAL_SERVER_ACTIONS_STATE);

  useEffect(() => {
    if (!hasUploadPermission) {
      const existingToast = chakraToast.isActive(NOT_EDIT_PERMISSION_TOAST_ID);
      if (!existingToast) {
        toast({
          type: "warning",
          title: "編集保存権限がないため譜面の更新はできません",
          duration: null,
          size: "sm",
          isClosable: false,
          id: NOT_EDIT_PERMISSION_TOAST_ID,
        });
      } else {
        chakraToast.close(NOT_EDIT_PERMISSION_TOAST_ID);
      }
    }
  }, [chakraToast, hasUploadPermission, toast]);

  return (
    <Card variant="filled" bg={theme.colors.background.card} boxShadow="lg" color={theme.colors.text.body}>
      <CardBody>
        <Stack display="flex" flexDirection="column" gap="6">
          <InfoInputForm isGeminiLoading={isFetching && isNewCreate} />
          <InfoTag isGeminiLoading={isFetching} />
          <HStack justifyContent="space-between">
            {hasUploadPermission ? (
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
