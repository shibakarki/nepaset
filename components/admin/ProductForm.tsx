"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS, type Product, type ProductCategory, type ProductVariant } from "@/types/product";

type Props = {
  product?: Product;
  variants?: ProductVariant[];
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const COLORS = ["Black", "White", "Navy", "Grey", "Red", "Green", "Blue", "Yellow", "Pink"];

type VariantRow = Omit<ProductVariant, "id" | "product_id"> & { id?: string; _key: string };

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function ProductForm({ product, variants = [] }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? "tshirt"
  );
  const [basePrice, setBasePrice] = useState(String(product?.base_price ?? ""));
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [isCustomizable, setIsCustomizable] = useState(product?.is_customizable ?? true);
  const [isNew, setIsNew] = useState(product?.is_new ?? true);
  const [imageUrls, setImageUrls] = useState((product?.images ?? []).join("\n"));

  const [variantRows, setVariantRows] = useState<VariantRow[]>(
    variants.map((v) => ({ ...v, _key: v.id }))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from name
  function handleNameChange(val: string) {
    setName(val);
    if (!isEdit) setSlug(slugify(val));
  }

  // Variants
  function addVariant() {
    setVariantRows((prev) => [
      ...prev,
      {
        _key: Math.random().toString(36).slice(2),
        size: null,
        color: null,
        stock: 10,
        price_delta: 0,
      },
    ]);
  }

  function updateVariant(key: string, field: keyof VariantRow, value: string | number | null) {
    setVariantRows((prev) =>
      prev.map((v) => (v._key === key ? { ...v, [field]: value } : v))
    );
  }

  function removeVariant(key: string) {
    setVariantRows((prev) => prev.filter((v) => v._key !== key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      const images = imageUrls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        category,
        base_price: Number(basePrice),
        images,
        tags: tagList,
        is_customizable: isCustomizable,
        is_new: isNew,
      };

      let productId = product?.id;

      if (isEdit && productId) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", productId);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (insertError) throw new Error(JSON.stringify(insertError));
        productId = data.id;
      }

      // Upsert variants
      if (variantRows.length > 0 && productId) {
        const variantPayload = variantRows.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          product_id: productId,
          size: v.size || null,
          color: v.color || null,
          stock: Number(v.stock),
          price_delta: Number(v.price_delta),
        }));

        const { error: variantError } = await supabase
          .from("product_variants")
          .upsert(variantPayload, { onConflict: "id" });

        if (variantError) throw variantError;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

const hasApparel = category === "tshirt" || category === "shirt";
  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Basic info */}
      <section>
        <h2 className="font-space text-sm font-medium text-[#0a0a0a] mb-4">
          Basic info
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">Product name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="e.g. Classic Tee"
              className="w-full border border-neutral-150 rounded-lg px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-300"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="classic-tee"
              className="w-full border border-neutral-150 rounded-lg px-3 py-2 text-sm text-[#0a0a0a] font-mono focus:outline-none focus:border-neutral-300"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              URL: /shop/{slug || "…"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full border border-neutral-150 rounded-lg px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-300 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1.5">
                Base price (Rs.)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                min="0"
                placeholder="799"
                className="w-full border border-neutral-150 rounded-lg px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">
              Tags{" "}
              <span className="text-neutral-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="student, casual, nepal"
              className="w-full border border-neutral-150 rounded-lg px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-300"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">
              Image URLs{" "}
              <span className="text-neutral-400">(one per line)</span>
            </label>
            <textarea
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              rows={3}
              placeholder="https://..."
              className="w-full border border-neutral-150 rounded-lg px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-300 font-mono resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCustomizable}
                onChange={(e) => setIsCustomizable(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 accent-[#0a0a0a]"
              />
              <span className="text-sm text-[#0a0a0a]">Customizable</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 accent-[#0a0a0a]"
              />
              <span className="text-sm text-[#0a0a0a]">Mark as new</span>
            </label>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-neutral-150" />

      {/* Variants */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-space text-sm font-medium text-[#0a0a0a]">
              Variants
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Add size/color combinations and stock levels.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="text-xs font-medium px-3 py-1.5 border border-neutral-150 rounded-lg hover:border-neutral-300 text-[#0a0a0a] transition-colors"
          >
            + Add variant
          </button>
        </div>

        {variantRows.length === 0 ? (
          <div className="border border-dashed border-neutral-200 rounded-xl p-8 text-center">
            <p className="text-xs text-neutral-400">
              No variants yet. Add one above.
            </p>
          </div>
        ) : (
          <div className="border border-neutral-150 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-150">
                  {hasApparel && (
                    <th className="text-left px-3 py-2.5 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                      Size
                    </th>
                  )}
                  <th className="text-left px-3 py-2.5 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                    Color
                  </th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                    Stock
                  </th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                    +Price (Rs.)
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {variantRows.map((v, i) => (
                  <tr
                    key={v._key}
                    className={i !== variantRows.length - 1 ? "border-b border-neutral-150" : ""}
                  >
                    {hasApparel && (
                      <td className="px-3 py-2">
                        <select
                          value={v.size ?? ""}
                          onChange={(e) =>
                            updateVariant(v._key, "size", e.target.value || null)
                          }
                          className="w-full border border-neutral-150 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-300"
                        >
                          <option value="">—</option>
                          {SIZES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <select
                        value={v.color ?? ""}
                        onChange={(e) =>
                          updateVariant(v._key, "color", e.target.value || null)
                        }
                        className="w-full border border-neutral-150 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-300"
                      >
                        <option value="">—</option>
                        {COLORS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={v.stock}
                        min="0"
                        onChange={(e) =>
                          updateVariant(v._key, "stock", Number(e.target.value))
                        }
                        className="w-full border border-neutral-150 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neutral-300"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={v.price_delta}
                        onChange={(e) =>
                          updateVariant(v._key, "price_delta", Number(e.target.value))
                        }
                        className="w-full border border-neutral-150 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neutral-300"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeVariant(v._key)}
                        className="text-neutral-300 hover:text-red-400 transition-colors"
                        aria-label="Remove variant"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-5 py-2.5 border border-neutral-150 text-sm font-medium rounded-lg text-neutral-600 hover:border-neutral-300 hover:text-[#0a0a0a] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
