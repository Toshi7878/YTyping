import { useStore } from "jotai";
import { drawerClosureAtom } from "../../atoms/stateAtoms";

export const useToggleLineList = () => {
  const typeAtomStore = useStore();
  return () => {
    const drawerClosure = typeAtomStore.get(drawerClosureAtom);

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
