import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { VariantSelector } from "@/components/shop/VariantSelector";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { CATEGORY_LABELS, type Product, type ProductVariant } from "@/types/product";

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getProduct(slug: string): Promise<{
  product: Product;
  variants: ProductVariant[];
} | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) return null;

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .order("size", { ascending: true });

  return {
    product: product as Product,
    variants: (variants ?? []) as ProductVariant[],
  };
}

async function getRelatedProducts(
  category: string,
  excludeId: string
): Promise<Product[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("id, name, slug, category, base_price, images, tags, is_customizable, is_new, created_at")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(4);

  return (data ?? []) as Product[];
}

// ─── Emoji fallback per category ──────────────────────────────────────────────

function categoryEmoji(category: string) {
  if (category === "tshirt" || category === "shirt") return "👕";
  if (category === "phone-case") return "📱";
  return "🎧";
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProduct(slug);

  if (!result) notFound();

  const { product, variants } = result;
  const related = await getRelatedProducts(product.category, product.id);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-8">
        <Link href="/shop" className="hover:text-[#0a0a0a] transition-colors">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-[#0a0a0a] transition-colors"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span>/</span>
        <span className="text-[#0a0a0a]">{product.name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left — gallery */}
        <ProductGallery
          images={product.images ?? []}
          productName={product.name}
          fallbackEmoji={categoryEmoji(product.category)}
        />

        {/* Right — product info */}
        <div className="flex flex-col">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">
              {CATEGORY_LABELS[product.category]}
            </span>
            {product.is_customizable && (
              <span className="text-[10px] font-medium tracking-widest bg-[#0a0a0a] text-white px-2 py-0.5 rounded-full">
                CUSTOM
              </span>
            )}
            {product.is_new && (
              <span className="text-[10px] font-medium tracking-widest bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">
                NEW
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="font-space text-3xl font-medium text-[#0a0a0a] tracking-tight leading-tight mb-4">
            {product.name}
          </h1>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-neutral-400 border border-neutral-150 rounded-full px-2.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-neutral-150 mb-6" />

          {/* Variants + Add to cart */}
          <VariantSelector
            variants={variants}
            basePrice={product.base_price}
          />

          {/* Custom order CTA */}
          {product.is_customizable && (
            <div className="mt-4 p-4 border border-neutral-150 rounded-xl bg-neutral-50">
              <p className="text-xs font-medium text-[#0a0a0a] mb-1">
                Want this customized?
              </p>
              <p className="text-xs text-neutral-400 mb-3">
                Add your name, logo, artwork, or group branding.
              </p>
              <Link
                href={`/customize?product=${product.slug}`}
                className="inline-block text-xs font-medium text-[#0a0a0a] border border-neutral-150 rounded-lg px-3 py-1.5 hover:border-neutral-300 transition-colors"
              >
                Request customization →
              </Link>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-neutral-150 mt-8 pt-6">
            <ProductDetails product={product} />
          </div>
        </div>
      </div>

      {/* Related products */}
      <RelatedProducts products={related} />
    </main>
  );
}

// ─── Product details accordion-style block ────────────────────────────────────

function ProductDetails({ product }: { product: Product }) {
  const details: { label: string; value: string }[] = [
    { label: "Category", value: CATEGORY_LABELS[product.category] },
    {
      label: "Customizable",
      value: product.is_customizable ? "Yes — submit a request" : "No",
    },
  ];

  return (
    <dl className="space-y-3">
      {details.map(({ label, value }) => (
        <div key={label} className="flex items-start justify-between gap-4">
          <dt className="text-xs text-neutral-400 shrink-0">{label}</dt>
          <dd className="text-xs text-[#0a0a0a] text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ─── Not found ────────────────────────────────────────────────────────────────

export { notFound };

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProduct(slug);

  if (!result) {
    return { title: "Product not found — NEPASET" };
  }

  const { product } = result;

  return {
    title: `${product.name} — NEPASET`,
    description: `${product.name} by NEPASET. ${
      product.is_customizable ? "Fully customizable. " : ""
    }Rs. ${product.base_price.toLocaleString("en-NP")}. Made for youth in Nepal.`,
    openGraph: {
      title: product.name,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}
