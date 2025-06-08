"use client";
import { Card, CardContent } from "@/components/ui/card";

interface ActiveUserMapCardProps {
  children: React.ReactNode;
}

function ActiveUserMapCard({ children }: ActiveUserMapCardProps) {
  return (
    <Card className="bg-card transition-shadow duration-300 hover:shadow-lg">
      <CardContent className="text-muted-foreground bg-card flex h-full items-start rounded-md border-none p-0">
        {children}
      </CardContent>
    </Card>
  );
}

export default ActiveUserMapCard;
