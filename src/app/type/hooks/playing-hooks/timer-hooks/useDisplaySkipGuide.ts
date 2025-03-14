import { skipAtom, useSetSkipAtom } from "@/app/type/atoms/stateAtoms";
import { useStore } from "jotai";

interface useDisplaySkipGuideProps {
  kana: string;
  lineConstantTime: number;
  lineRemainTime: number;
  isRetrySkip: boolean;
}

export const useDisplaySkipGuide = () => {
  const setSkip = useSetSkipAtom();
  const typeAtomStore = useStore();

  return ({ kana, lineConstantTime, lineRemainTime, isRetrySkip }: useDisplaySkipGuideProps) => {
    const SKIP_IN = 0.4; //ラインが切り替わり後、指定のtimeが経過したら表示
    const SKIP_OUT = 4; //ラインの残り時間が指定のtimeを切ったら非表示
    const SKIP_KEY = "Space";
    const IS_SKIP_DISPLAY =
      (!kana && lineConstantTime >= SKIP_IN && lineRemainTime >= SKIP_OUT) || isRetrySkip;

    //スキップ表示絶対条件 && 既に表示されているか
    const skip = typeAtomStore.get(skipAtom);

    if (IS_SKIP_DISPLAY) {
      if (!skip) {
        setSkip(SKIP_KEY as "Space");
      }
    } else if (skip) {
      setSkip("");
    }
  };
};
