import { useEffect, useRef } from "react";
import { setComboElement } from "../../../_lib/atoms/sub-status";

export const Combo = () => {
  const comboRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (comboRef.current) {
      setComboElement(comboRef.current);
    }
  }, []);

  return <span ref={comboRef}>0</span>;
};
