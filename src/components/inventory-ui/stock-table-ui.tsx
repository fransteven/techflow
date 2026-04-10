import {
  Search,
  Plus,
  Eye,
  MoreHorizontal,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Dummy data estático
const stockItems = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    sku: "IPH15PM-256-BLK",
    attributes: { storage: "256GB", color: "Negro Titanio" },
    stock: 12,
    cost: 4250000,
    status: "ok" as const,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    sku: "SGS24U-512-GRY",
    attributes: { storage: "512GB", color: "Titanium Gray" },
    stock: 8,
    cost: 5100000,
    status: "ok" as const,
  },
  {
    id: "3",
    name: "MacBook Air M3",
    sku: "MBA-M3-15-SLV",
    attributes: { size: '15"', color: "Plata" },
    stock: 3,
    cost: 6800000,
    status: "low" as const,
  },
  {
    id: "4",
    name: "AirPods Pro 2",
    sku: "APP2-USB-C",
    attributes: { connector: "USB-C" },
    stock: 45,
    cost: 950000,
    status: "ok" as const,
  },
  {
    id: "5",
    name: "iPad Pro 12.9 M2",
    sku: "IPDP-129-M2-256",
    attributes: { storage: "256GB", connectivity: "WiFi" },
    stock: 0,
    cost: 5200000,
    status: "out" as const,
  },
  {
    id: "6",
    name: "Apple Watch Ultra 2",
    sku: "AWU2-49-TI",
    attributes: { size: "49mm", material: "Titanio" },
    stock: 6,
    cost: 3450000,
    status: "ok" as const,
  },
  {
    id: "7",
    name: "Google Pixel 8 Pro",
    sku: "GP8P-256-OBS",
    attributes: { storage: "256GB", color: "Obsidian" },
    stock: 2,
    cost: 3800000,
    status: "low" as const,
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

type StockStatus = "ok" | "low" | "out";

interface StatusBadgeProps {
  status: StockStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    ok: {
      label: "Stock OK",
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    low: {
      label: "Bajo Stock",
      className:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    out: {
      label: "Sin Stock",
      className:
        "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20",
    },
  };

  const { label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

interface StockTableUIProps {
  onViewDetail?: (productId: string) => void;
}

export function StockTableUI({ onViewDetail }: StockTableUIProps) {
  return (
    <div className="bg-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header con búsqueda y acciones */}
      <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Listado de Inventario
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {stockItems.length} productos registrados
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Barra de búsqueda */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar producto..."
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-background border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* Botón primario */}
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Registrar Compra</span>
              <span className="sm:hidden">Agregar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                Stock
              </th>
              <th className="hidden md:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Costo Promedio
              </th>
              <th className="hidden sm:table-cell px-4 md:px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 md:px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {stockItems.map((item) => (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/30"
              >
                {/* Producto */}
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {Object.entries(item.attributes).map(([, value]) => (
                          <span
                            key={value}
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                          >
                            {value}
                          </span>
                        ))}
                        <span className="text-[10px] text-muted-foreground/60 font-mono">
                          {item.sku}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Stock */}
                <td className="px-4 md:px-6 py-4">
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      item.stock === 0
                        ? "text-slate-400"
                        : item.stock <= 3
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground"
                    }`}
                  >
                    {item.stock}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">uds</span>
                </td>

                {/* Costo */}
                <td className="hidden md:table-cell px-4 md:px-6 py-4">
                  <span className="text-sm text-muted-foreground font-medium">
                    {formatCurrency(item.cost)}
                  </span>
                </td>

                {/* Estado */}
                <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>

                {/* Acciones */}
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetail?.(item.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Más opciones"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con paginación */}
      <div className="px-4 md:px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium text-foreground">1–7</span> de{" "}
            <span className="font-medium text-foreground">7</span> productos
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg text-muted-foreground bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg text-foreground bg-background hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
