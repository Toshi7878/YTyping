import { useGameUtilityReferenceParams } from "../../atoms/refAtoms";

export const useToggleLineList = () => {
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  return () => {
    const { lineResultdrawerClosure: drawerClosure } = readGameUtilRefParams();

    if (!drawerClosure) {
      return;
    }

    const { isOpen, onOpen, onClose } = drawerClosure;
    if (!isOpen) {
      onOpen();
    } else {
      onClose();
    }
  };
};
