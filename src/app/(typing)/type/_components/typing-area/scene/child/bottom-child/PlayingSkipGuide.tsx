import { useSkipState } from "@/app/(typing)/type/atoms/stateAtoms";

const PlayingSkipGuide = () => {
  const skip = useSkipState();

  return <div className="opacity-60">{skip ? `Type ${skip} key to Skip. ⏩` : ""}</div>;
};
export default PlayingSkipGuide;
