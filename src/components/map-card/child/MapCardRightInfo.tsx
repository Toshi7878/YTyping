"use client";

interface MapCardProps {
  children: React.ReactNode;
}
function MapCardRightInfo({ children }: MapCardProps) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden text-xs sm:text-sm md:text-base lg:text-lg">
      {children}
    </div>
  );
}

export default MapCardRightInfo;
