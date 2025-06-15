import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useMapCreatorIdState } from "../atoms/stateAtoms";

const useHasMapUploadPermission = () => {
  const { data: session } = useSession();
  const mapCreatorId = useMapCreatorIdState();
  const searchParams = useSearchParams();

  const isNewCreate = !!searchParams.get("new");

  const myUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  return isNewCreate || (myUserId && (!mapCreatorId || Number(myUserId) === mapCreatorId)) || isAdmin;
};

export default useHasMapUploadPermission;
