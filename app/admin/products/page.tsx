import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, type Product } from "@/types/product";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

async function getProducts(search: string): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, name, slug, category, base_price, images, tags, is_customizable, is_new, created_at")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data } = await query;
  return (data ?? []) as Product[];
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getProducts(q ?? "");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
            Products
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {products.length} {products.length === 1 ? "product" : "products"} in catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="text-xs font-medium px-4 py-2.5 bg-[#0a0a0a] text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          + Add product
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-150 rounded-lg focus:outline-none focus:border-neutral-300"
          />
        </div>
      </form>

      {/* Table */}
      {products.length === 0 ? (
        <div className="border border-dashed border-neutral-200 rounded-xl p-16 text-center">
          <p className="text-sm text-neutral-400 mb-4">
            {q ? `No products matching "${q}"` : "No products yet."}
          </p>
          {!q && (
            <Link
              href="/admin/products/new"
              className="text-xs font-medium px-4 py-2 bg-[#0a0a0a] text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Add your first product
            </Link>
          )}
        </div>
      ) : (
        <div className="border border-neutral-150 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-150">
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Flags
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => {
                const firstImage = product.images?.[0] ?? null;
                return (
                  <tr
                    key={product.id}
                    className={[
                      "hover:bg-neutral-50 transition-colors",
                      i !== products.length - 1 ? "border-b border-neutral-150" : "",
                    ].join(" ")}
                  >
                    {/* Name + image */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-150 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {firstImage && firstImage.startsWith("http") ? (
  <Image
    src={firstImage}
    alt={product.name}
    width={36}
    height={36}
    className="object-cover"
  />
) : (
                            <span className="text-lg">
                              {product.category === "t-shirts" || product.category === "shirts"
                                ? "👕"
                                : product.category === "phone-cases"
                                ? "📱"
                                : "🎧"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#0a0a0a]">{product.name}</p>
                          <p className="text-[11px] text-neutral-400 font-mono">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {CATEGORY_LABELS[product.category]}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0a0a0a]">
                      Rs. {product.base_price.toLocaleString("en-NP")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {product.is_customizable && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0a0a0a] text-white">
                            CUSTOM
                          </span>
                        )}
                        {product.is_new && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/shop/${product.slug}`}
                          target="_blank"
                          className="text-[11px] text-neutral-400 hover:text-[#0a0a0a] transition-colors"
                        >
                          View ↗
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-[11px] font-medium text-[#0a0a0a] hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}