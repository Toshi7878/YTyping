"use client";
import { type RefObject, useEffect, useRef, useState } from "react";
import { useLineFailureCountState, writePracticeLineItems } from "@/app/(typing)/type/_lib/atoms/ref";
import {
  type BuiltMap,
  setLineResultSheet,
  setLineSelectIndex,
  useBuiltMapState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { moveSetLine } from "@/app/(typing)/type/_lib/playing/move-line";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Table, TableBody } from "@/components/ui/table/table";
import type { TypingLineResults } from "@/validator/result";
import { PracticeLineTableRow } from "./table-row";

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
    writePracticeLineItems(lineItemsRef.current);
  }, []);

  const handleItemClick = (lineIndex: number) => {
    if (!map) return;
    const seekCount = Math.max(0, map.typingLineIndexes[lineIndex - 1] ?? 0);
    moveSetLine(seekCount);
    setLineSelectIndex(lineIndex);
  };

  if (!width) return null;

  const sheetStyle = {
    width: `${(isHovered ? width + HOVER_EXTRA_WIDTH : width) + 30}px`,
    top: top || undefined,
    height: sheetHeightPx > 0 ? `${sheetHeightPx}px` : undefined,
    transition: "width 400ms ease-in-out",
  };

  return (
    <Sheet modal={false} open={true} onOpenChange={setLineResultSheet}>
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
          {map?.initialLineResults.map((_: TypingLineResults[number], index: number) => {
            const lineData = map.lines[index];
            if (!lineData?.kanaLyrics) return null;

            lineIndex++;

            return (
              <PracticeLineTableRow
                // biome-ignore lint/suspicious/noArrayIndexKey: <固定長配列なのでindex keyを許可>
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
