import interact from "interactjs";
import { CSSProperties, useEffect, useRef, useState } from "react";

type Partial<T> = {
  [P in keyof T]?: T[P];
};

const initPosition = {
  width: 500,
  height: 150,
  x: 1000,
  y: -100,
};

/**
 * HTML要素を動かせるようにする
 * 返り値で所得できるinteractRefと、interactStyleをそれぞれ対象となるHTML要素の
 * refとstyleに指定することで、そのHTML要素のリサイズと移動が可能になる
 * @param position HTML要素の初期座標と大きさ、指定されない場合はinitPositionで指定された値になる
 */
export function useInteractJS(position: Partial<typeof initPosition> = initPosition) {
  const [_position, setPosition] = useState({
    ...initPosition,
    ...position,
  });
  const [isEnabled, setEnable] = useState(true);

  const interactRef = useRef(null);
  let { x, y, width, height } = _position;

  const enable = () => {
    interact(interactRef.current as unknown as HTMLElement)
      .draggable({
        inertia: false,
        cursorChecker: (interacting) => {
          return interacting ? "move" : "pointer";
        },
      })
      .resizable({
        // resize from all edges and corners
        edges: { left: false, right: false, bottom: false, top: false },
        preserveAspectRatio: false,
        inertia: false,
      })
      .on("dragmove", (event) => {
        x += event.dx;
        y += event.dy;
        setPosition({
          width,
          height,
          x,
          y,
        });
      })
      .on("resizemove", (event) => {
        width = event.rect.width;
        height = event.rect.height;
        x += event.deltaRect.left;
        y += event.deltaRect.top;
        setPosition({
          x,
          y,
          width,
          height,
        });
      });
  };

  const disable = () => {
    if (interactRef.current) {
      interact(interactRef.current as unknown as HTMLElement).unset();
    }
  };

  useEffect(() => {
    if (isEnabled) {
      enable();
    } else {
      disable();
    }
    return disable;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

  return {
    ref: interactRef,
    style: {
      transform: `translate3D(${_position.x}px, ${_position.y}px, 0)`,
      width: _position.width + "px",
      height: _position.height + "px",
      position: "absolute" as CSSProperties["position"],
    },
    position: _position,
    isEnabled,
    enable: () => setEnable(true),
    disable: () => setEnable(false),
  };
}
