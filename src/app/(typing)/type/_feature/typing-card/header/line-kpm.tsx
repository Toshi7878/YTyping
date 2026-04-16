import { atom, type ExtractAtomValue } from "jotai";
import { uncontrolled } from "jotai-uncontrolled";
import { store } from "../../atoms/store";

const lineKpmAtom = atom(0);

const lineKpmFormatAtom = atom((get) => {
  const lineKpm = get(lineKpmAtom);
  return lineKpm.toFixed(0);
});

export const getLineKpm = () => store.get(lineKpmAtom);
export const setLineKpm = (value: ExtractAtomValue<typeof lineKpmAtom>) => store.set(lineKpmAtom, value);

export const LineKpm = () => {
  return (
    <uncontrolled.span id="line_kpm" className="tabular-nums" atomStore={store}>
      {lineKpmFormatAtom}
    </uncontrolled.span>
  );
};
