import { useSession } from "next-auth/react";
import { useMapCreatorIdState } from "../atoms/stateAtoms";

const useHasEditPermission = () => {
  const { data: session } = useSession();
  const mapCreatorId = useMapCreatorIdState();

  const myUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  return (myUserId && (!mapCreatorId || Number(myUserId) === mapCreatorId)) || isAdmin;
};

export default useHasEditPermission;
