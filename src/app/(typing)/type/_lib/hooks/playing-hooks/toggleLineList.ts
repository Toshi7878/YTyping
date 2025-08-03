import { useReadGameUtilParams, useSetLineResultDrawer } from "../../atoms/stateAtoms";

export const useToggleLineList = () => {
  const setLineResultDrawer = useSetLineResultDrawer();
  const readGameStateUtils = useReadGameUtilParams();

  return () => {
    const { lineResultdrawerClosure: drawerClosure } = readGameStateUtils();

    if (!drawerClosure) {
      return;
    }

    if (!drawerClosure) {
      setLineResultDrawer(true);
    } else {
      setLineResultDrawer(false);
    }
  };
};
