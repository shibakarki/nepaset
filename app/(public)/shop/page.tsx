import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { CATEGORY_GROUPS, type Product, type ProductCategory } from "@/types/product";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Expand "apparel" / "accessories" group filters into raw category values */
function resolveCategories(filter: string | undefined): ProductCategory[] | null {
  if (!filter || filter === "all") return null;

  if (filter in CATEGORY_GROUPS) {
    return CATEGORY_GROUPS[filter] as ProductCategory[];
  }

  return [filter as ProductCategory];
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getProducts(
  categoryFilter: string | undefined,
  sort: string | undefined,
  searchFilter: string | undefined // ADDED: Search Query Filter
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, name, slug, category, base_price, images, tags, is_customizable, is_new, created_at");

  // Category Filtering
  const categories = resolveCategories(categoryFilter);
  if (categories) {
    query = query.in("category", categories);
  }

  // SEARCH FILTERING (Case-insensitive partial match on name)
  if (searchFilter && searchFilter.trim() !== "") {
    query = query.ilike("name", `%${searchFilter.trim()}%`);
  }

  // Sorting
  if (sort === "price_asc") {
    query = query.order("base_price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("base_price", { ascending: false });
  } else if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("[shop] Failed to fetch products:", error.message);
    return [];
  }

  return (data ?? []) as Product[];
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type SearchParams = {
  category?: string;
  sort?: string;
  search?: string; // ADDED: search key to parameters
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, sort, search } = await searchParams; // Grab search
  const products = await getProducts(category, sort, search); // Pass search

  // Dynamic header title based on active search or active category
  const pageTitle = search
    ? `Search: "${search}"`
    : !category || category === "all"
    ? "Shop"
    : category === "apparel"
    ? "Apparel"
    : category === "accessories"
    ? "Accessories"
    : category === "tshirt"
    ? "T-Shirts"
    : category === "shirt"
    ? "Shirts"
    : category === "phone-case"
    ? "Phone Cases"
    : "Earbuds";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-space text-3xl font-bold tracking-tight text-foreground mb-1">
          {pageTitle}
        </h1>
        <p className="text-sm text-muted">
          Customized for you, made in Nepal
        </p>
      </div>

      {/* Filters — client component, reads URL params */}
      <Suspense fallback={<FiltersSkeleton />}>
        <ShopFilters />
      </Suspense>

      {/* Results meta */}
      <p className="text-xs text-muted mb-5">
        {products.length} {products.length === 1 ? "product" : "products"}
        {category && category !== "all" && !search ? ` in ${pageTitle}` : ""}
      </p>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState category={pageTitle} isSearch={!!search} />
      )}
    </main>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FiltersSkeleton() {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-8 w-20 rounded-full bg-surface-2 animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState({ category, isSearch }: { category: string; isSearch?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4 border border-border/40">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <h2 className="font-space text-sm font-semibold text-foreground mb-1">
        No products found
      </h2>
      <p className="text-xs text-muted max-w-xs leading-relaxed">
        {isSearch
          ? "We couldn't find anything matching your search. Try checking your spelling or using different keywords."
          : `Nothing in ${category} yet — check back soon.`}
      </p>
    </div>
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, search } = await searchParams;
  
  const title = search
    ? `Results for "${search}" — NEPASET`
    : !category || category === "all"
    ? "Shop — NEPASET"
    : `${category.charAt(0).toUpperCase() + category.slice(1)} — NEPASET`;

  return {
    title,
    description:
      "Browse NEPASET's customized apparel and accessories — T-shirts, shirts, phone cases, and earbuds made for youth in Nepal.",
  };
}