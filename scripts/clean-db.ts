import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../src/db";

async function main() {
  console.log(
    "Iniciando limpieza de la base de datos (purgado de datos transaccionales)...",
  );

  try {
    // Ejecutamos TRUNCATE en las tablas operativas con CASCADE
    // Nos aseguramos de NO incluir user, session, account y verification
    // Las tablas a truncar son: sale_details, sales, inventory_movements, reservations, expenses, product_items, products, categories, expense_categories
    await db.execute(
      sql`TRUNCATE TABLE sale_details, sales, inventory_movements, reservations, expenses, product_items, products, categories, expense_categories CASCADE;`,
    );

    console.log(
      "✅ Purga completada exitosamente. Las tablas operativas han sido vaciadas preservando la integridad referencial y las tablas de autenticación.",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la limpieza de la base de datos:", error);
    process.exit(1);
  }
}

main();
