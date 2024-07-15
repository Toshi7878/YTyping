import React, { useEffect, useRef } from "react";
import Playing from "./scene/Playing";
import End from "./scene/End";
import { useAtom } from "jotai";
import { mapAtom, sceneAtom, tabIndexAtom } from "../../(atoms)/gameRenderAtoms";
import Ready from "./scene/Ready";
import { Box, Card } from "@chakra-ui/react";
import { TabStatusRef } from "../(tab)/tab/TabStatus";
import { LineResultObj, PlayingRef } from "../../(ts)/type";


export const Scene = () => {
  const [scene] = useAtom(sceneAtom);
  const [map] = useAtom(mapAtom);

  const [, setTabIndex] = useAtom(tabIndexAtom);
  const playingRef = useRef<PlayingRef>(null);

  useEffect(() => {
    if (scene === "playing") {
      setTabIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  if (scene === "ready") {
    return <Ready />;
  } else if (scene === "playing" && map) {
    return <Playing ref={playingRef} />;
  } else if (scene === "end") {
    return <End />;
  }
};

function SceneWrapper() {
  console.log("SceneWrapper");

  return (
    <Box className="w-full mt-4 overflow-hidden" height="calc(100vh - 425px)">
      <Card variant={"filled"} className="max-h-[95%]" bg="blue.100" boxShadow="lg">
        <Scene />
      </Card>
    </Box>
  );
}

export default SceneWrapper;