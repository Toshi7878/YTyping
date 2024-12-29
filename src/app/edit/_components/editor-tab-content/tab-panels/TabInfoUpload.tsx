import { Card, CardBody, HStack, Stack, useTheme } from "@chakra-ui/react";

import { useCreatorIdAtom, useVideoIdAtom } from "@/app/edit/edit-atom/editAtom";
import { useGetGeminiMapInfoQuery } from "@/app/edit/hooks/query/useGetGeminiMapInfoQuery";
import { useUploadMap } from "@/app/edit/hooks/useUploadMap";
import { INITIAL_SERVER_ACTIONS_STATE } from "@/app/edit/ts/const/editDefaultValues";
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
  const mapCreatorId = useCreatorIdAtom();
  const theme: ThemeColors = useTheme();
  const searchParams = useSearchParams();
  const isNewCreate = !!searchParams.get("new");
  const videoId = useVideoIdAtom();
  const { id: mapId } = useParams();
  const { isLoading } = useGetGeminiMapInfoQuery(videoId);
  const upload = useUploadMap();

  const [state, formAction] = useFormState(upload, INITIAL_SERVER_ACTIONS_STATE);

  const myUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "admin";
  const isDisplayUploadButton =
    (myUserId && (!mapCreatorId || Number(myUserId) === mapCreatorId)) || isAdmin;

  return (
    <Card
      variant="filled"
      bg={theme.colors.background.card}
      boxShadow="lg"
      color={theme.colors.text.body}
    >
      <CardBody>
        <Stack display="flex" flexDirection="column" gap="6">
          <InfoInputForm isGeminiLoading={isLoading && isNewCreate} />
          <InfoTag isGeminiLoading={isLoading} />
          <HStack justifyContent="space-between">
            {isDisplayUploadButton ? (
              <form action={formAction}>
                <UploadButton state={state} />
                {mapId ? <TypeLinkButton /> : ""}
              </form>
            ) : mapId ? (
              <TypeLinkButton />
            ) : (
              ""
            )}
            <PreviewTimeInput />
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default TabInfoUpload;
