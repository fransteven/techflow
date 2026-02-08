"use client";

import { useEffect, useState } from "react";
import { Clock, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReservationCardProps {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  expiresAt: Date;
  status: "pending" | "ready";
}

export function ReservationCard({
  id,
  customerName,
  items,
  total,
  expiresAt,
  status,
}: ReservationCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("00:00:00");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <Card
      className={`overflow-hidden ${isExpired ? "opacity-60 grayscale" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Orden #{id.slice(0, 8)}
        </CardTitle>
        <Badge variant={status === "ready" ? "default" : "outline"}>
          {status === "ready" ? "Listo para retirar" : "Preparando"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{customerName}</div>
        <div className="text-xs text-muted-foreground mb-4">
          {items.join(", ")}
        </div>
        <div className="flex items-center space-x-2 text-sm font-medium text-destructive">
          <Clock className="h-4 w-4" />
          <span>Expira en: {timeLeft}</span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-3">
        <div className="flex w-full items-center justify-between">
          <span className="font-bold">{formatCurrency(total)}</span>
          <Button size="sm" disabled={isExpired}>
            <ShoppingBag className="mr-2 h-3 w-3" />
            Procesar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
