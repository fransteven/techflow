import { NextResponse } from "next/server";
import * as importCostService from "@/services/import-cost-service";

/**
 * API de Costeo de Importaciones — Consumible por LLMs
 * Retorna el historial de costeos de equipos importados desde EE.UU.
 * Incluye resumen estadístico para análisis financiero automatizado.
 * Protegido por API Key (header: x-api-key).
 */
export async function GET(request: Request) {
  try {
    // Seguridad: API Key
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.MARKETING_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 },
      );
    }

    // Query params opcionales para filtrar
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const productId = searchParams.get("productId") ?? undefined;
    const from = searchParams.get("from")
      ? new Date(searchParams.get("from")!)
      : undefined;
    const to = searchParams.get("to")
      ? new Date(searchParams.get("to")!)
      : undefined;
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "100", 10),
      100,
    );

    const [records, stats] = await Promise.all([
      importCostService.getImportCosts({ status, productId, from, to }),
      importCostService.getImportCostStats(),
    ]);

    const limitedRecords = records.slice(0, limit);

    // Transformación LLM-friendly con campos calculados
    const data = limitedRecords.map((r) => {
      const catalogPrice = parseFloat(r.catalogPrice ?? "0");
      const totalCost = parseFloat(r.totalCostPesos ?? "0");
      const estimatedMargin = catalogPrice > 0 ? catalogPrice - totalCost : null;
      const estimatedMarginPct =
        catalogPrice > 0 && totalCost > 0
          ? ((estimatedMargin! / catalogPrice) * 100).toFixed(2)
          : null;

      return {
        id: r.id,
        product: r.productName,
        condition: r.condition,
        provider: r.provider ?? null,
        status: r.status,
        purchaseDate: r.purchaseDate?.toISOString().split("T")[0],
        costs: {
          baseUsdCost: parseFloat(r.baseUsdCost ?? "0"),
          mastercardCommissionPesos: parseFloat(
            r.mastercardCommissionPesos ?? "0",
          ),
          casilleroPesos: parseFloat(r.casilleroPesos ?? "0"),
          productPesos: parseFloat(r.productPesos ?? "0"),
          customsTariffPesos: parseFloat(r.customsTariffPesos ?? "0"),
          totalCostPesos: totalCost,
        },
        rates: {
          mastercardDollarRate: r.mastercardDollarRate
            ? parseFloat(r.mastercardDollarRate)
            : null,
          casilleroTrm: parseFloat(r.casilleroTrm ?? "0"),
          productTrm: parseFloat(r.productTrm ?? "0"),
        },
        catalogPrice: catalogPrice > 0 ? catalogPrice : null,
        estimatedMargin,
        estimatedMarginPct: estimatedMarginPct
          ? parseFloat(estimatedMarginPct)
          : null,
        notes: r.notes ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalPurchasedRecords: stats.totalRecords,
        totalInvestedCOP: stats.totalInvestedCOP,
        avgProductTrm: parseFloat(stats.avgProductTrm.toFixed(2)),
        avgCasilleroTrm: parseFloat(stats.avgCasilleroTrm.toFixed(2)),
        pendingQuotes: stats.pendingQuotes,
      },
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Import Costs API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
