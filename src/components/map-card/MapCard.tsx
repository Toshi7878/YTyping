"use client";
import { Card, CardContent } from "@/components/ui/card";

interface MapCardProps {
  children: React.ReactNode;
}

function MapCard({ children }: MapCardProps) {
  return (
    <Card variant="map">
      <CardContent className="flex items-start rounded-md border-0 p-0">{children}</CardContent>
    </Card>
  );
}

export default MapCard;
