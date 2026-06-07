import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product, ProductVariant } from "@/types/product";

async function getProduct(id: string) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) return null;

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("size", { ascending: true });

  return {
    product: product as Product,
    variants: (variants ?? []) as ProductVariant[],
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProduct(id);

  if (!result) notFound();

  const { product, variants } = result;

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="text-xs text-neutral-400 hover:text-[#0a0a0a] transition-colors flex items-center gap-1.5 mb-4"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Products
        </Link>
        <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
          Edit product
        </h1>
        <p className="text-sm text-neutral-400 mt-1 font-mono">{product.slug}</p>
      </div>

      <ProductForm product={product} variants={variants} />
    </div>
  );
}
