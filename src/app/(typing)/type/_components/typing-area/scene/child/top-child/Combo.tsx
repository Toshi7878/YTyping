import { useComboState } from "@/app/(typing)/type/atoms/stateAtoms";

const Combo = () => {
  const combo = useComboState();

  return <div>{combo}</div>;
};

export default Combo;
