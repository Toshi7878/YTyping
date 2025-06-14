import { useLineRemainTimeState } from "@/app/(typing)/type/atoms/stateAtoms";

const LineRemainTimeText = () => {
  const displayLineRemainTime = useLineRemainTimeState();
  return <span>{displayLineRemainTime.toFixed(1)}</span>;
};

export default LineRemainTimeText;
