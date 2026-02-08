"use client";

import { ReservationCard } from "@/components/reservations/reservation-card";

// Mock data: Generate expiry times relative to now
const now = new Date();
const mockReservations = [
  {
    id: "ord_12345678",
    customerName: "Carlos Pérez",
    items: ["iPhone 15 Pro", "Funda Silicona"],
    total: 1249.98,
    expiresAt: new Date(now.getTime() + 1000 * 60 * 30), // 30 mins
    status: "ready" as const,
  },
  {
    id: "ord_87654321",
    customerName: "Ana García",
    items: ["MacBook Air M2"],
    total: 999.0,
    expiresAt: new Date(now.getTime() + 1000 * 60 * 120), // 2 hours
    status: "pending" as const,
  },
  {
    id: "ord_11223344",
    customerName: "Luis Rodríguez",
    items: ["Samsung S24 Ultra", "Cargador 45W"],
    total: 1349.98,
    expiresAt: new Date(now.getTime() + 1000 * 60 * 5), // 5 mins
    status: "ready" as const,
  },
  {
    id: "ord_55667788",
    customerName: "María López",
    items: ["AirPods Pro 2"],
    total: 249.0,
    expiresAt: new Date(now.getTime() - 1000 * 60 * 10), // Expired 10 mins ago
    status: "ready" as const,
  },
];

export default function ReservationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas Online</h1>
          <p className="text-muted-foreground">
            Gestiona los pedidos pendientes de retiro de la tienda online.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockReservations.map((res) => (
          <ReservationCard key={res.id} {...res} />
        ))}
      </div>
    </div>
  );
}
