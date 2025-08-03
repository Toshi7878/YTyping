import { useGameUtilityReferenceParams, useSetLineResultDrawer } from "../../atoms/refAtoms";

export const useToggleLineList = () => {
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  const setLineResultDrawer = useSetLineResultDrawer();
  return () => {
    const { lineResultdrawerClosure: drawerClosure } = readGameUtilRefParams();

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
