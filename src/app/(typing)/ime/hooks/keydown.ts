import { useInputTextarea } from "../atom/refAtoms";

export const useKeydown = () => {
  const { readInputTextarea } = useInputTextarea();

  return (event: KeyboardEvent) => {
    const key = event.key;

    switch (key) {
      case "Tab":
        event.preventDefault();
        readInputTextarea().focus();
        break;
    }
  };
};
