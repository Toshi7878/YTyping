import { AnimatePresence, motion } from "framer-motion";
import { HTMLAttributes, useEffect, useRef } from "react";
import { useLyricsContainer } from "../../../atom/refAtoms";
import {
  useCountState,
  useDisplayLinesState,
  useEnableNextLyricsOptionState,
  useMapState,
  useNextDisplayLineState,
} from "../../../atom/stateAtoms";
import { COMPLETED_WIPE_COLOR, INITIAL_WIPE_COLOR } from "../../../ts/const";
import "./lyrics-container.css";
import Skip from "./Skip";

const LyricsContainer = (props: HTMLAttributes<HTMLDivElement>) => {
  const enableNextLyricsOption = useEnableNextLyricsOptionState();

  return (
    <div id="lyrics-container" className="relative mb-2 flex flex-col" {...props}>
      <Lyrics />
      {enableNextLyricsOption && <NextLyrics />}
      <Skip className="absolute right-4 bottom-0.5 left-auto xl:right-auto xl:left-[-96px]" />
    </div>
  );
};

const Lyrics = () => {
  const { writeLyricsContainer } = useLyricsContainer();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const displayLines = useDisplayLinesState();

  useEffect(() => {
    if (lyricsContainerRef.current) {
      writeLyricsContainer(lyricsContainerRef.current);
    }
  }, [writeLyricsContainer]);

  return (
    <div className="my-1 min-h-[7.5rem]" ref={lyricsContainerRef}>
      {displayLines.map((line, index) => (
        <div key={index}>
          <div className="shadow-layer">
            {line.map((chunk) => (
              <>
                <span key={String(chunk.time)} className="text-transparent">
                  {chunk.word}
                </span>{" "}
              </>
            ))}
          </div>
          <div className="wipe-layer">
            {line.map((chunk) => (
              <>
                <span
                  key={String(chunk.time)}
                  style={index === displayLines.length - 1 ? INITIAL_WIPE_COLOR : COMPLETED_WIPE_COLOR}
                >
                  {chunk.word}
                </span>{" "}
              </>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const NextLyrics = () => {
  const nextDisplayLine = useNextDisplayLineState();
  const map = useMapState();
  const count = useCountState();

  const nextLine = map?.lines?.[count];
  return (
    <div id="next_lyrics" className="text-[60%] text-gray-400 select-none">
      {nextLine && <span>{`NEXT: `}</span>}
      <AnimatePresence>
        {nextDisplayLine.length > 0 && (
          <motion.div
            key="next-lyrics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: "inline" }}
          >
            {nextDisplayLine.map((chunk) => (
              <>
                <span key={String(chunk.time)}>{chunk.word}</span>{" "}
              </>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LyricsContainer;
