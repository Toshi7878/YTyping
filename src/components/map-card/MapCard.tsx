"use client";
import { Card, CardContent } from "@/components/ui/card";

interface MapCardProps {
  children: React.ReactNode;
}

function MapCard({ children }: MapCardProps) {
  return (
    <Card className="bg-card text-card-foreground map-card-hover py-0">
      <CardContent className="flex items-start rounded-md border-0 p-0">{children}</CardContent>
    </Card>
  );
}

export default MapCard;
