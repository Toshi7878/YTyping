import { useEffect, useState } from "react";

interface StatusUnderlineProps {
  children: React.ReactNode;
  label: string;
}

const StatusUnderline = ({ label, children }: StatusUnderlineProps) => {
  const [width, setWidth] = useState({ main: "159px", sub: "80px" });

  useEffect(() => {
    const updateWidth = () => {
      setWidth(
        window.innerWidth < 768
          ? { main: "250px", sub: "140px" }
          : { main: "159px", sub: "80px" }
      );
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const underlineWidth = label === "score" || label === "point" ? width.main : width.sub;

  return (
    <span className="status-underline relative">
      {children}
      <div 
        className="absolute bottom-0 left-0 h-0.5 bg-white"
        style={{ width: underlineWidth }}
      />
    </span>
  );
};

export default StatusUnderline;
