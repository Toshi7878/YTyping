"use client";

interface MapCardProps {
  children: React.ReactNode;
}

function NotificationMapCardRightInfo({ children }: MapCardProps) {
  return (
    <div className="flex w-full flex-col justify-between overflow-hidden py-1 pl-3 text-xs sm:text-sm md:text-base lg:text-lg">
      {children}
    </div>
  );
}

export default NotificationMapCardRightInfo;
