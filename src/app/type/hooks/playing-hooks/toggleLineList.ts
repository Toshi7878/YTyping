import { usegameUtilityReferenceParams } from "../../atoms/refAtoms";

export const useToggleLineList = () => {
  const { readGameUtilRefParams } = usegameUtilityReferenceParams();
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
