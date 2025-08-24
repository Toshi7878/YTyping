import { useTRPC } from "@/trpc/provider";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useSearchParams } from "next/navigation";

const useHasMapUploadPermission = () => {
  const { data: session } = useSession();
  const { id: mapId } = useParams<{ id: string }>();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mapCreatorId = queryClient.getQueryData(
    trpc.map.getMapInfo.queryOptions({ mapId: Number(mapId) }).queryKey,
  )?.creator_id;
  const isEditPage = usePathname().includes("/edit");

  const searchParams = useSearchParams();

  const isNewCreate = !!searchParams.get("new");

  const myUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  return isEditPage && (isNewCreate || (myUserId && (!mapCreatorId || Number(myUserId) === mapCreatorId)) || isAdmin);
};

export default useHasMapUploadPermission;
