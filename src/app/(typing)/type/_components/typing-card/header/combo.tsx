import { useComboState } from "../../../_lib/atoms/state";

export const Combo = () => {
  const combo = useComboState();

  return <div>{combo}</div>;
};
