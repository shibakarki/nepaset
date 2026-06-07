"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Apparel", value: "apparel" },
  { label: "Accessories", value: "accessories" },
  { label: "T-Shirts", value: "tshirt" },
  { label: "Shirts", value: "shirt" },
  { label: "Phone Cases", value: "phone-case" },
  { label: "Earbuds", value: "earbuds" },
] as const;

const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
] as const;

export function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("category") ?? "all";
  const currentSort = searchParams.get("sort") ?? "";

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  function setFilter(value: string) {
    const qs = createQueryString({
      category: value === "all" ? "" : value,
    });
    router.push(`/shop${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function setSort(value: string) {
    const qs = createQueryString({ sort: value });
    router.push(`/shop${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      {FILTERS.map((f) => {
        const isActive =
          f.value === "all"
            ? !currentFilter || currentFilter === "all"
            : currentFilter === f.value;
        return (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={[
              "text-[12px] font-medium tracking-wide px-3.5 py-1.5 rounded-full border transition-all duration-150",
              isActive
                ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                : "bg-white text-neutral-500 border-neutral-150 hover:border-neutral-300 hover:text-[#0a0a0a]",
            ].join(" ")}
          >
            {f.label}
          </button>
        );
      })}

      {/* Sort — pushed to far right on larger screens */}
      <div className="ml-auto">
        <select
          value={currentSort}
          onChange={(e) => setSort(e.target.value)}
          className="text-[12px] text-neutral-500 border border-neutral-150 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-neutral-300 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
