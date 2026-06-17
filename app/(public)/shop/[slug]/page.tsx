import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/shop/ProductDetail";
import type { Product, ProductVariant } from "@/types/product";

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getProduct(slug: string): Promise<{
  product: Product;
  variants: ProductVariant[];
} | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, category, base_price, stock, images, tags, is_customizable, is_new, created_at"
    )
    .eq("slug", slug)
    .single();

  if (error || !product) return null;

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, product_id, size, color, stock, price_delta")
    .eq("product_id", product.id)
    .order("price_delta", { ascending: true });

  return {
    product: product as Product,
    variants: (variants ?? []) as ProductVariant[],
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const result = await getProduct(slug);

  if (!result) notFound();

  const { product, variants } = result;

  return <ProductDetail product={product} variants={variants} />;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProduct(slug);

  if (!result) {
    return { title: "Product Not Found — NEPASET" };
  }

  const { product } = result;
  const image = product.images?.[0] ?? null;

  return {
    title: `${product.name} — NEPASET`,
    description: `Buy ${product.name} — customized apparel and accessories made in Nepal. Rs. ${product.base_price.toLocaleString("en-NP")}`,
    openGraph: image ? { images: [image] } : undefined,
  };
}