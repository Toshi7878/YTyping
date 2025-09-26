import { AnimatePresence, motion } from "framer-motion"
import type { HTMLAttributes } from "react"
import { Fragment, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useLyricsContainer } from "../../../_lib/atoms/read-atoms"
import {
  useCountState,
  useDisplayLinesState,
  useEnableNextLyricsOptionState,
  useMapState,
  useNextDisplayLineState,
} from "../../../_lib/atoms/state-atoms"
import "./lyrics-container.css"
import Skip from "./skip-display"

const LyricsContainer = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const enableNextLyricsOption = useEnableNextLyricsOptionState()

  return (
    <div id="lyrics-container" className={cn("relative mb-3 flex flex-col", className)} {...props}>
      <Lyrics />
      {enableNextLyricsOption && <NextLyrics />}
      <Skip className="absolute right-4 bottom-0.5 left-auto xl:right-auto xl:left-[-96px]" />
    </div>
  )
}

const Lyrics = () => {
  const { writeLyricsContainer } = useLyricsContainer()
  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const displayLines = useDisplayLinesState()

  useEffect(() => {
    if (lyricsContainerRef.current) {
      writeLyricsContainer(lyricsContainerRef.current)
    }
  }, [writeLyricsContainer])

  return (
    <div className="my-1 min-h-[7.5rem] leading-14" ref={lyricsContainerRef}>
      {displayLines.map((line, index) => (
        <div key={index}>
          <div className="shadow-layer">
            {line.map((chunk) => (
              <Fragment key={String(chunk.time)}>
                <span className="text-transparent">{chunk.word}</span>{" "}
              </Fragment>
            ))}
          </div>
          <div className="wipe-layer">
            {line.map((chunk) => (
              <Fragment key={String(chunk.time)}>
                <span style={index === displayLines.length - 1 ? INITIAL_WIPE_COLOR : COMPLETED_WIPE_COLOR}>
                  {chunk.word}
                </span>{" "}
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const COMPLETED_WIPE_COLOR = {
  background: "-webkit-linear-gradient(0deg, #ffa500 100%, white 0%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
}

const INITIAL_WIPE_COLOR = {
  background: "-webkit-linear-gradient(0deg, #fff 100%, white 0%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
}

const NextLyrics = () => {
  const nextDisplayLine = useNextDisplayLineState()
  const map = useMapState()
  const count = useCountState()

  const nextLine = map?.lines?.[count]
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
              <Fragment key={String(chunk.time)}>
                <span>{chunk.word}</span>{" "}
              </Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LyricsContainer
