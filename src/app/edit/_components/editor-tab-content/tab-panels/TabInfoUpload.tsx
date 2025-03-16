import { Card, CardBody, Flex, HStack, Stack, useTheme } from "@chakra-ui/react";

import { useMapCreatorIdState, useVideoIdState } from "@/app/edit/atoms/stateAtoms";
import { useUploadMap } from "@/app/edit/hooks/useUploadMap";
import { INITIAL_SERVER_ACTIONS_STATE } from "@/app/edit/ts/const/editDefaultValues";
import { useGenerateMapInfoQuery } from "@/lib/global-hooks/query/edit/useGenerateMapInfoQuery";
import { ThemeColors } from "@/types";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import InfoInputForm from "./tab-info-child/InfoInputFrom";
import InfoTag from "./tab-info-child/InfoTag";
import PreviewTimeInput from "./tab-info-child/PreviewTimeInput";
import TypeLinkButton from "./tab-info-child/TypeLinkButton";
import UploadButton from "./tab-info-child/UploadButton";

const TabInfoUpload = () => {
  const { data: session } = useSession();
  const mapCreatorId = useMapCreatorIdState();
  const theme: ThemeColors = useTheme();
  const searchParams = useSearchParams();
  const isNewCreate = !!searchParams.get("new");
  const videoId = useVideoIdState();
  const { id: mapId } = useParams();
  const { isPending } = useGenerateMapInfoQuery(videoId);
  const upload = useUploadMap();

  const [state, formAction] = useFormState(upload, INITIAL_SERVER_ACTIONS_STATE);

  const myUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const isDisplayUploadButton = (myUserId && (!mapCreatorId || Number(myUserId) === mapCreatorId)) || isAdmin;

  return (
    <Card variant="filled" bg={theme.colors.background.card} boxShadow="lg" color={theme.colors.text.body}>
      <CardBody>
        <Stack display="flex" flexDirection="column" gap="6">
          <InfoInputForm isGeminiLoading={isPending && isNewCreate} />
          <InfoTag isGeminiLoading={isPending} />
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
