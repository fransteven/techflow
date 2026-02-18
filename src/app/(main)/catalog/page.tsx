import { getProductsAction } from "@/app/actions/product-actions";
import { CreateProductDialog } from "@/components/catalog/create-product-dialog";
import { ProductTable } from "@/components/catalog/product-table";

import { CreateCategoryDialog } from "@/components/catalog/create-category-dialog";

export default async function CatalogPage() {
  const { data: products } = await getProductsAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
          <p className="text-muted-foreground">
            Gestiona los productos y categorías disponibles en la tienda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateCategoryDialog />
          <CreateProductDialog />
        </div>
      </div>
      <ProductTable data={products || []} />
    </div>
  );
}
