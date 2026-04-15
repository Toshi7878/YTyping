import { useStore } from "jotai";
import { uncontrolled } from "jotai-uncontrolled";
import { comboAtom } from "../../atoms/substatus";

export const Combo = () => {
  const store = useStore();
  return (
    <uncontrolled.span id="combo" atomStore={store}>
      {comboAtom}
    </uncontrolled.span>
  );
};
