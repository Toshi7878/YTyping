"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LinkLoader = () => {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setProgress(60);
    setHidden(false);

    const timer = setTimeout(() => {
      setProgress(100);

      setTimeout(() => {
        setHidden(true);
        setProgress(0);
      }, 200);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={`h-[2px] bg-goldDark fixed top-0 left-0 transition-all duration-300 ${
        hidden ? "opacity-0 w-0" : "opacity-100 w-full z-[70]"
      }`}
      style={{
        width: `${progress}%`,
        transition: progress === 100 ? "none" : "width 0.3s ease-in-out",
      }}
    />
  );
};

export default LinkLoader;
