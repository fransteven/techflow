"use client";

import { useRouter, usePathname } from "next/navigation";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthPickerProps {
  from?: string;
  to?: string;
}

export function MonthPicker({ from }: MonthPickerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => subMonths(now, i));

  const currentValue = from
    ? format(parseISO(from), "yyyy-MM", { locale: es })
    : format(now, "yyyy-MM", { locale: es });

  function handleChange(value: string) {
    const [year, month] = value.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    const newFrom = startOfMonth(date).toISOString();
    const newTo = endOfMonth(date).toISOString();
    router.push(`${pathname}?from=${newFrom}&to=${newTo}`);
  }

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {months.map((date) => {
          const value = format(date, "yyyy-MM");
          const label = format(date, "MMMM yyyy", { locale: es });
          return (
            <SelectItem key={value} value={value}>
              <span className="capitalize">{label}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
