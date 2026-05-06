import { type PointerEventHandler, type RefObject, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseDraggablePositionOptions {
  activationDistance?: number;
}

interface UseDraggablePositionReturn extends Position {
  isDragging: boolean;
  wasDraggedRef: RefObject<boolean>;
  dragProps: {
    onPointerCancel: PointerEventHandler<HTMLElement>;
    onPointerDown: PointerEventHandler<HTMLElement>;
    onPointerMove: PointerEventHandler<HTMLElement>;
    onPointerUp: PointerEventHandler<HTMLElement>;
  };
}

export const useDraggablePosition = ({
  activationDistance = 5,
}: UseDraggablePositionOptions = {}): UseDraggablePositionReturn => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const wasDraggedRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const startRef = useRef({
    pointerX: 0,
    pointerY: 0,
    positionX: 0,
    positionY: 0,
  });

  const resetPointer = () => {
    activePointerIdRef.current = null;
    setIsDragging(false);
  };

  const onPointerDown: PointerEventHandler<HTMLElement> = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    wasDraggedRef.current = false;
    activePointerIdRef.current = event.pointerId;
    startRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      positionX: position.x,
      positionY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove: PointerEventHandler<HTMLElement> = (event) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    const deltaX = event.clientX - startRef.current.pointerX;
    const deltaY = event.clientY - startRef.current.pointerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (!wasDraggedRef.current && distance < activationDistance) return;

    wasDraggedRef.current = true;
    setIsDragging(true);
    setPosition({
      x: startRef.current.positionX + deltaX,
      y: startRef.current.positionY + deltaY,
    });
  };

  const onPointerUp: PointerEventHandler<HTMLElement> = (event) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetPointer();
  };

  const onPointerCancel: PointerEventHandler<HTMLElement> = (event) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    resetPointer();
  };

  return {
    ...position,
    isDragging,
    wasDraggedRef,
    dragProps: {
      onPointerCancel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
  };
};
