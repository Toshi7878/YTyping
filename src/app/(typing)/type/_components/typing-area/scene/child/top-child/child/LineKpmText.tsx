import { useLineKpmState } from "@/app/(typing)/type/atoms/stateAtoms";

const LineKpmText = () => {
  const displayLineKpm = useLineKpmState();

  return <span>{displayLineKpm.toFixed(0)}</span>;
};

export default LineKpmText;
