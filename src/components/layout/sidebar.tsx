"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Store,
  CalendarClock,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Menu,
  TrendingUp,
  Banknote,
  Smartphone,
  PiggyBank,
  PackageSearch,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Catálogo",
    href: "/catalog",
    icon: Package,
  },
  {
    title: "Inventario",
    href: "/inventory",
    icon: ClipboardList,
  },
  {
    title: "Punto de Venta",
    href: "/pos",
    icon: Store,
  },
  {
    title: "Apartados",
    href: "/layaways",
    icon: CalendarClock,
  },
  {
    title: "Peritaje iPhones",
    href: "/iphone-purchase-checklist",
    icon: Smartphone,
  },
  {
    title: "Ventas",
    href: "/sales",
    icon: TrendingUp,
  },
  {
    title: "Ganancias",
    href: "/profits",
    icon: PiggyBank,
  },
  {
    title: "Gastos",
    href: "/expenses",
    icon: Banknote,
  },
  {
    title: "Importaciones",
    href: "/import-costs",
    icon: PackageSearch,
  },
];

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

// Shared nav link — used in both desktop and mobile
function NavLink({
  item,
  isActive,
  collapsed,
  mobile,
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  collapsed?: boolean;
  mobile?: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.title : undefined}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? mobile || collapsed
            ? "bg-indigo-50 text-indigo-700 font-semibold rounded-lg"
            : "bg-indigo-50 text-indigo-700 font-semibold border-l-[3px] border-indigo-600 rounded-r-lg"
          : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50 rounded-lg",
        collapsed && "justify-center px-3",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0 bg-slate-50 border-r border-slate-200">
          {/* Mobile header */}
          <div className="px-5 py-6 border-b border-slate-200">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
                <Settings2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tighter text-indigo-600">
                TechFlow
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 pl-1">
              Gestión de Inventario
            </p>
          </div>

          {/* Mobile nav */}
          <div className="flex-1 py-4 px-3 space-y-0.5">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                item={item}
                isActive={pathname === item.href}
                mobile
              />
            ))}
          </div>

          {/* Mobile footer */}
          {user && (
            <div className="px-4 py-4 border-t border-slate-200 flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.image ?? ""} alt={user.name ?? "Usuario"} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden border-r border-slate-200 bg-slate-50 md:flex md:flex-col transition-all duration-300",
          isCollapsed ? "w-[64px]" : "w-[240px]",
          className,
        )}
      >
        {/* Desktop header */}
        <div
          className={cn(
            "flex items-center h-[72px] border-b border-slate-200 px-4",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {isCollapsed ? (
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Settings2 className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5">
                <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0">
                  <Settings2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-extrabold tracking-tighter text-indigo-600">
                  TechFlow
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 pl-0.5">
                Gestión de Inventario
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100",
              isCollapsed && "hidden",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
              className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Desktop nav */}
        <div className="flex-1 overflow-auto py-4 px-2 space-y-0.5">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              item={item}
              isActive={pathname === item.href}
              collapsed={isCollapsed}
            />
          ))}
        </div>

        {/* Desktop footer */}
        {user && (
          <div
            className={cn(
              "border-t border-slate-200 py-4",
              isCollapsed ? "px-2 flex justify-center" : "px-4",
            )}
          >
            {isCollapsed ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image ?? ""} alt={user.name ?? "Usuario"} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user.image ?? ""} alt={user.name ?? "Usuario"} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
