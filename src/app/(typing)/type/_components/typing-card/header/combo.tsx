import { useComboState } from "../../../_lib/atoms/state-atoms";

export const Combo = () => {
  const combo = useComboState();

  return <div>{combo}</div>;
};
