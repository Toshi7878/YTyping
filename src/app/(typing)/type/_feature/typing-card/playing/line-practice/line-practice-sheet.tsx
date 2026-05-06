"use client";
import { atom } from "jotai";
import { type RefObject, useEffect, useRef, useState } from "react";
import { type BuiltMap, useBuiltMapState } from "@/app/(typing)/type/_feature/atoms/built-map";
import { ScrollArea } from "@/ui/scroll-area";
import { Sheet, SheetContent } from "@/ui/sheet";
import { Table, TableBody } from "@/ui/table/table";
import type { TypingLineResult } from "@/validator/result/result";
import { setSelectLineIndex } from "../../../atoms/line-results";
import { store } from "../../../atoms/store";
import { useLineFailureCountState } from "../../../atoms/substatus";
import { moveSetLine } from "../move-line";
import { PracticeLineTableRow } from "./table-row";

const practiceLineElementsAtom = atom<HTMLElement[]>([]);
export const getPracticeLineElements = () => store.get(practiceLineElementsAtom);
const setPracticeLineElements = (elements: HTMLElement[]) => store.set(practiceLineElementsAtom, elements);

const HOVER_EXTRA_WIDTH = 200;

const LAYOUT_CALCULATE_DELAY_MS = 100;

export const PracticeLineSheet = () => {
  const { width, top, sheetHeightPx } = useSheetLayout();
  const [isHovered, setIsHovered] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useExternalWheelScroll(containerRef);

  const map = useBuiltMapState();
  const lineFailureCount = useLineFailureCountState();
  const lineItemsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    setPracticeLineElements(lineItemsRef.current);
  }, []);

  const handleItemClick = (lineIndex: number) => {
    if (!map) return;
    const seekCount = Math.max(0, map.typingLineIndexes[lineIndex - 1] ?? 0);
    moveSetLine(seekCount);
    setSelectLineIndex(lineIndex);
  };

  if (!width) return null;

  const sheetStyle = {
    width: `${(isHovered ? width + HOVER_EXTRA_WIDTH : width) + 30}px`,
    top: top || undefined,
    height: sheetHeightPx > 0 ? `${sheetHeightPx}px` : undefined,
    transition: "width 400ms ease-in-out",
  };

  return (
    <Sheet modal={false} open={true}>
      <SheetContent
        ref={sheetRef}
        hideCloseButton
        forceMount
        side="right"
        className="flex min-h-0 flex-col gap-0 rounded-l-sm border-y"
        style={sheetStyle}
        overlayClassName="bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div ref={containerRef} className="flex min-h-0 flex-1 flex-col">
          {lineFailureCount > 0 && <div className="shrink-0 text-failure">Failure Line: {lineFailureCount}</div>}
          <ScrollArea type="always" className="min-h-0 flex-1 overflow-hidden">
            <PracticeLineTable map={map} lineItemsRef={lineItemsRef} onRowClick={handleItemClick} />
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const PracticeLineTable = ({
  map,
  lineItemsRef,
  onRowClick,
}: {
  map: BuiltMap;
  lineItemsRef: RefObject<HTMLElement[]>;
  onRowClick: (lineIndex: number) => void;
}) => {
  let lineIndex = 0;

  return (
    <div className="min-h-full">
      <Table>
        <TableBody>
          {map?.initialLineResults.map((_: TypingLineResult, index: number) => {
            const lineData = map.lines[index];
            if (!lineData?.kanaLyrics) return null;

            lineIndex++;

            return (
              <PracticeLineTableRow
                // biome-ignore lint/suspicious/noArrayIndexKey: 配列の長さ・順序が不変のため安全
                key={index}
                count={index}
                lineIndex={lineIndex}
                itemsRef={lineItemsRef}
                lineData={lineData}
                onClick={onRowClick}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const useSheetLayout = () => {
  const [layout, setLayout] = useState({ width: 0, top: 0, sheetHeightPx: 0 });

  useEffect(() => {
    const container = document.getElementById("content_container");
    const topElement = document.querySelector<HTMLElement>("#tabs-area [role='tablist']");
    if (!container || !topElement) return;

    const calculate = () => {
      const top = topElement.getBoundingClientRect().bottom;
      const typingCard = document.getElementById("typing_card");
      const bottomEdge = typingCard?.getBoundingClientRect().bottom ?? window.innerHeight;
      setLayout({
        width: window.innerWidth - container.getBoundingClientRect().right,
        top,
        sheetHeightPx: Math.max(0, bottomEdge - top),
      });
    };

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const scheduleCalculate = () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = undefined;
        calculate();
      }, LAYOUT_CALCULATE_DELAY_MS);
    };

    const ro = new ResizeObserver(scheduleCalculate);
    ro.observe(container);
    const typingCard = document.getElementById("typing_card");
    if (typingCard) ro.observe(typingCard);
    window.addEventListener("resize", scheduleCalculate);
    scheduleCalculate();

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      ro.disconnect();
      window.removeEventListener("resize", scheduleCalculate);
    };
  }, []);

  return layout;
};

/**
 * ScrollArea 外でのホイール操作を viewport に転送するフック
 */
const useExternalWheelScroll = (containerRef: RefObject<HTMLDivElement | null>) => {
  const WHEEL_FACTOR = 0.8;

  useEffect(() => {
    const getViewport = () =>
      containerRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]') ?? null;

    const handleWheel = (e: WheelEvent) => {
      const viewport = getViewport();
      if (!viewport) return;
      if (viewport.contains(e.target as Node)) return;

      viewport.scrollBy({ top: e.deltaY * WHEEL_FACTOR, behavior: "instant" });
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [containerRef]);
};
