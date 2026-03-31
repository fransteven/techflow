import { NextResponse } from "next/server";
import { getProducts } from "@/services/product-service";

export async function GET(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.MARKETING_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeFilter = searchParams.get("active");

    if (activeFilter === "false") {
      return NextResponse.json([]);
    }

    const products = await getProducts();

    const response = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.categoryName ?? "Sin Categoría",
      price: Number(p.price),
      stock: p.stock,
      active: true,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
