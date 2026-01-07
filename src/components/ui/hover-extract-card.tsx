"use client";

import { HoverCard as HoverCardPrimitive, Slot as SlotPrimitive } from "radix-ui";
import type * as React from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, type CardWithContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type HoverExtractCtx = {
  openHover: () => void;
  closeHover: () => void;
  isOpen: boolean;
  cardWidth: number;
};

const HoverExtractContext = createContext<HoverExtractCtx | null>(null);

const useHoverExtract = () => {
  const ctx = useContext(HoverExtractContext);
  if (!ctx) throw new Error("HoverExtractCard components must be used within <HoverExtractCard>");
  return ctx;
};

interface HoverExtractCardProps {
  children: React.ReactNode;
  extractContent: React.ReactNode;
  cardHeader?: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
  variant?: React.ComponentProps<typeof CardWithContent>["variant"];
  ref?: React.ComponentProps<typeof CardWithContent>["ref"];
}

export const HoverExtractCard = ({
  children,
  extractContent,
  cardHeader,
  openDelay = 50,
  closeDelay = 40,
  variant,
  ref,
}: HoverExtractCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const openHover = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (isOpen) return;
    if (openTimerRef.current !== null) return;

    openTimerRef.current = window.setTimeout(() => {
      setIsOpen(true);
      openTimerRef.current = null;
    }, openDelay);
  };

  const closeHover = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeDelay <= 0) {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsOpen(false);
      return;
    }
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, closeDelay);
  };

  // open中だけ幅監視（負荷削減）
  useEffect(() => {
    if (!isOpen) return;
    const el = cardContentRef.current;
    if (!el) return;

    setCardWidth(el.clientWidth);

    const ro = new ResizeObserver(() => {
      setCardWidth(el.clientWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  // unmount 時にタイマー掃除
  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const ctxValue = useMemo<HoverExtractCtx>(() => ({ openHover, closeHover, isOpen, cardWidth }), [isOpen, cardWidth]);

  return (
    <HoverExtractContext.Provider value={ctxValue}>
      <Card ref={ref} variant={variant}>
        {cardHeader}
        <CardContent variant={variant} className={cn("relative", isOpen ? "z-50" : "")} ref={cardContentRef}>
          <HoverCardPrimitive.Root open={isOpen}>
            <HoverCardPrimitive.Trigger className="pointer-events-none absolute bottom-0 left-0 h-px w-px" />

            {isOpen && (
              <div className="pointer-events-none absolute bottom-0 left-0 z-10 size-full rounded-t-md border-primary-light border-x-2 border-t-2" />
            )}
            {children}
            <HoverCardPrimitive.Portal>
              <HoverCardPrimitive.Content
                avoidCollisions={false}
                align="start"
                side="bottom"
                sideOffset={-2}
                className="z-100 flex flex-col rounded-t-none rounded-b-lg border-primary-light border-x-2 border-t-0 border-b-2 bg-popover px-3 py-3 text-sm shadow-md outline-hidden"
                style={{ width: cardWidth }}
                onPointerEnter={openHover}
                onPointerLeave={closeHover}
              >
                {extractContent}
              </HoverCardPrimitive.Content>
            </HoverCardPrimitive.Portal>
          </HoverCardPrimitive.Root>
        </CardContent>
      </Card>
    </HoverExtractContext.Provider>
  );
};

export const HoverExtractCardTrigger = ({
  children,
  className,
  ...props
}: SlotPrimitive.SlotProps & { children: React.ReactNode }) => {
  const { openHover, closeHover } = useHoverExtract();
  return (
    <SlotPrimitive.Slot {...props} onPointerEnter={openHover} onPointerLeave={closeHover}>
      {children}
    </SlotPrimitive.Slot>
  );
};
