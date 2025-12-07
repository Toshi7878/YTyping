import { useEffect, useRef } from "react";
import { setLineKpmElement, setLineRemainTimeElement } from "../../../_lib/atoms/sub-status";

export const LineRemainTimeAndKpm = () => {
  return (
    <div className="whitespace-nowrap">
      <LineKpm />
      <span className="ml-1 tracking-widest">kpm</span>
      <span className="mx-3">-</span>
      残り
      <LineRemainTime className="mr-1" />秒
    </div>
  );
};

const LineKpm = () => {
  const lineKpmRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (lineKpmRef.current) {
      setLineKpmElement(lineKpmRef.current);
    }
  }, []);

  return <span ref={lineKpmRef}>0</span>;
};

const LineRemainTime = ({ className }: { className: string }) => {
  const lineRemainTimeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (lineRemainTimeRef.current) {
      setLineRemainTimeElement(lineRemainTimeRef.current);
    }
  }, []);

  return <span className={className} ref={lineRemainTimeRef}></span>;
};
