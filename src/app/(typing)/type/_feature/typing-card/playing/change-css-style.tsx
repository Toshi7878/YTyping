import { useBuiltMapState, useChangeCSSCountState } from "@/app/(typing)/type/_atoms/state";

export const ChangeCSS = () => {
  const map = useBuiltMapState();
  const changeCSSCount = useChangeCSSCountState();
  if (changeCSSCount === null) return null;

  const changeCSS = map?.lines[changeCSSCount]?.options?.changeCSS;
  if (!changeCSS) return;
  return <style>{changeCSS}</style>;
};
