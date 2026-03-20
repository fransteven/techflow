import {
  pgTable,
  text,
  timestamp,
  decimal,
  uuid,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { products, productItems } from "./inventory";

// --- Import Cost Tracking Schema ---
// Registro detallado del costo de traer equipos desde Estados Unidos

export const importCosts = pgTable("import_costs", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Dispositivo — FK al catálogo de productos para mantener consistencia
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),

  // Vínculo opcional al item serializado (se llena cuando el equipo llega al inventario)
  productItemId: uuid("product_item_id").references(() => productItems.id),

  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),

  // Condición del equipo según el proveedor
  // EXCELLENT, GOOD, FAIR son las más comunes; A-F permiten extensión futura
  condition: text("condition").notNull(), // EXCELLENT | GOOD | FAIR | A | B | C | D | F

  // Proveedor de origen (Amazon, eBay, Swappa, Back Market…)
  provider: text("provider"),

  // Estado del registro: cotización estimada vs compra real
  status: text("status").default("cotizacion").notNull(), // cotizacion | comprado

  // ----- Costo Base -----
  // Costo antes de impuestos en USD (precio en Amazon u otro proveedor)
  baseUsdCost: decimal("base_usd_cost", { precision: 10, scale: 2 }).notNull(),

  // ----- Comisión Mastercard Nu -----
  useMastercardNu: boolean("use_mastercard_nu").default(false).notNull(),
  // Tasa de la comisión (constante 0.0045, guardada para trazabilidad histórica)
  mastercardCommissionRate: decimal("mastercard_commission_rate", {
    precision: 6,
    scale: 4,
  }),
  // TRM que usó NuBank al momento de la transacción
  mastercardDollarRate: decimal("mastercard_dollar_rate", {
    precision: 12,
    scale: 4,
  }),
  // Comisión cobrada en pesos (baseUsdCost × rate × nuBankTrm)
  mastercardCommissionPesos: decimal("mastercard_commission_pesos", {
    precision: 12,
    scale: 2,
  }),

  // ----- Casillero -----
  // Valor en USD del casillero (normalmente 50 USD)
  casilleroUsdCost: decimal("casillero_usd_cost", {
    precision: 10,
    scale: 2,
  }).default("50.00").notNull(),
  // TRM al momento de pagar el casillero
  casilleroTrm: decimal("casillero_trm", { precision: 12, scale: 4 }).notNull(),
  // Pesos pagados por el casillero (casilleroUsdCost × casilleroTrm)
  casilleroPesos: decimal("casillero_pesos", { precision: 12, scale: 2 }).notNull(),

  // ----- Dólar del producto -----
  // TRM al momento de comprar el producto (puede diferir del casillero)
  productTrm: decimal("product_trm", { precision: 12, scale: 4 }).notNull(),
  // Pesos del producto (baseUsdCost × productTrm)
  productPesos: decimal("product_pesos", { precision: 12, scale: 2 }).notNull(),

  // ----- Aranceles DIAN -----
  // Impuestos de importación — 0 por defecto (franquicia personal hasta USD 200)
  customsTariffPesos: decimal("customs_tariff_pesos", {
    precision: 12,
    scale: 2,
  }).default("0.00").notNull(),

  // ----- Costo Total -----
  // CAMPO CLAVE: mastercardCommissionPesos + casilleroPesos + productPesos + customsTariffPesos
  totalCostPesos: decimal("total_cost_pesos", { precision: 12, scale: 2 }).notNull(),

  // Atributos dinámicos de la variante importada (storage, color, ram…)
  // Se infieren del template de la categoría del producto seleccionado
  specs: jsonb("specs"), // ej: { storage: "256GB", color: "Negro Titanio" }

  notes: text("notes"),

  userId: text("user_id")
    .references(() => user.id)
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
