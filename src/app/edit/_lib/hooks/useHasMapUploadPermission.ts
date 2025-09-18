import { useTRPC } from "@/trpc/provider";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";

const useHasMapUploadPermission = () => {
  const { data: session } = useSession();
  const mapId = usePathname().split("/")[2];
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mapInfo = queryClient.getQueryData(trpc.map.getMapInfo.queryOptions({ mapId: Number(mapId) }).queryKey);

  const mapCreatorId = mapInfo?.creator.id;

  const searchParams = useSearchParams();

  const isNewCreate = !!searchParams.get("new");

  const myUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  return isNewCreate || (myUserId && (!mapCreatorId || Number(myUserId) === mapCreatorId)) || isAdmin;
};

export default useHasMapUploadPermission;
