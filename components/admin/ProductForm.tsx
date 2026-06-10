"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

type ImageEntry = {
  _key: string;
  url: string;
  uploading: boolean;
  error: string | null;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function isValidUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");
}

export function ProductForm({ product, variants = [] }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Product States
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "tshirt");
  const [basePrice, setBasePrice] = useState(String(product?.base_price ?? ""));
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [isCustomizable, setIsCustomizable] = useState(product?.is_customizable ?? true);
  const [isNew, setIsNew] = useState(product?.is_new ?? true);

  // Simple vs Variable state
  const [productType, setProductType] = useState<"simple" | "variable">(
    variants.length > 0 ? "variable" : "simple"
  );
  const [globalStock, setGlobalStock] = useState(String(product?.stock ?? "10"));

  // Auto-generator matrix options selected
  const [genSizes, setGenSizes] = useState<string[]>([]);
  const [genColors, setGenColors] = useState<string[]>([]);

  // Bulk Edit helper states
  const [bulkStock, setBulkStock] = useState("");
  const [bulkPriceDelta, setBulkPriceDelta] = useState("");

  // Images state
  const [images, setImages] = useState<ImageEntry[]>(
    (product?.images ?? []).map((url) => ({
      _key: Math.random().toString(36).slice(2),
      url,
      uploading: false,
      error: null,
    }))
  );

  // Variant Rows state
  const [variantRows, setVariantRows] = useState<VariantRow[]>(
    variants.map((v) => ({ ...v, _key: v.id }))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    if (!isEdit) setSlug(slugify(val));
  }

  // ── Image upload logic ───────────────────────────
  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const supabase = createClient();

    const newEntries: ImageEntry[] = Array.from(files).map((f) => ({
      _key: Math.random().toString(36).slice(2),
      url: "",
      uploading: true,
      error: null,
    }));

    setImages((prev) => [...prev, ...newEntries]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const entry = newEntries[i];
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setImages((prev) =>
          prev.map((img) =>
            img._key === entry._key
              ? { ...img, uploading: false, error: "Upload failed" }
              : img
          )
        );
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      setImages((prev) =>
        prev.map((img) =>
          img._key === entry._key
            ? { ...img, url: urlData.publicUrl, uploading: false }
            : img
        )
      );
    }
  }

  function removeImage(key: string) {
    setImages((prev) => prev.filter((img) => img._key !== key));
  }

  // ── Manual Variant Management ────────────────────
  function addVariant() {
    setVariantRows((prev) => [
      ...prev,
      { _key: Math.random().toString(36).slice(2), size: null, color: null, stock: 10, price_delta: 0 },
    ]);
  }

  function updateVariant(key: string, field: keyof VariantRow, value: string | number | null) {
    setVariantRows((prev) => prev.map((v) => (v._key === key ? { ...v, [field]: value } : v)));
  }

  function removeVariant(key: string) {
    setVariantRows((prev) => prev.filter((v) => v._key !== key));
  }

  // ── Cartesian Matrix Combination Generator ───────
  function handleGenerateCombinations() {
    if (genSizes.length === 0 && genColors.length === 0) {
      setError("Select at least one Size or Color above to generate combinations.");
      return;
    }
    setError(null);

    const hasApparel = category === "tshirt" || category === "shirt";
    const sizesToUse = hasApparel && genSizes.length > 0 ? genSizes : [null];
    const colorsToUse = genColors.length > 0 ? genColors : [null];

    const generatedRows: VariantRow[] = [];

    for (const size of sizesToUse) {
      for (const color of colorsToUse) {
        if (size === null && color === null) continue;

        // Check if this combination already exists in our active list to preserve stock/price delta
        const existing = variantRows.find((r) => r.size === size && r.color === color);
        if (existing) {
          generatedRows.push(existing);
        } else {
          generatedRows.push({
            _key: Math.random().toString(36).slice(2),
            size,
            color,
            stock: 10,
            price_delta: 0,
          });
        }
      }
    }

    setVariantRows(generatedRows);
  }

  // Toggle Matrix Option selections
  function toggleGenSize(size: string) {
    setGenSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  }

  function toggleGenColor(color: string) {
    setGenColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);
  }

  // ── Bulk Actions ─────────────────────────────────
  function applyBulkStock() {
    if (!bulkStock) return;
    const stockNum = Number(bulkStock);
    setVariantRows((prev) => prev.map((v) => ({ ...v, stock: stockNum })));
    setBulkStock("");
  }

  function applyBulkPriceDelta() {
    if (!bulkPriceDelta) return;
    const priceNum = Number(bulkPriceDelta);
    setVariantRows((prev) => prev.map((v) => ({ ...v, price_delta: priceNum })));
    setBulkPriceDelta("");
  }

  // ── Submit Form ──────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (images.some((img) => img.uploading)) {
      setError("Please wait for all images to finish uploading.");
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();

      const imageUrls = images
        .filter((img) => img.url && isValidUrl(img.url))
        .map((img) => img.url);

      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        category,
        base_price: Number(basePrice),
        images: imageUrls,
        tags: tagList,
        is_customizable: isCustomizable,
        is_new: isNew,
        // Simple product keeps global stock, Variable product zeroes global stock in products table
        stock: productType === "simple" ? Number(globalStock) : 0,
      };

      let productId = product?.id;

      if (isEdit && productId) {
        const { error: updateError } = await supabase.from("products").update(payload).eq("id", productId);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase.from("products").insert(payload).select("id").single();
        if (insertError) throw insertError;
        productId = data.id;
      }

      // If Product Type is "Variable", insert/upsert variants
      if (productType === "variable" && productId) {
        const variantPayload = variantRows.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          product_id: productId,
          size: v.size || null,
          color: v.color || null,
          stock: Number(v.stock),
          price_delta: Number(v.price_delta),
        }));

        // Upsert new/updated variants
        const { error: variantError } = await supabase
          .from("product_variants")
          .upsert(variantPayload, { onConflict: "id" });

        if (variantError) throw variantError;

        // Clean up: If we had variants that were manually removed from list during edit, delete them from DB
        const keptIds = variantRows.map((v) => v.id).filter(Boolean);
        if (isEdit && keptIds.length > 0) {
          await supabase
            .from("product_variants")
            .delete()
            .eq("product_id", productId)
            .not("id", "in", `(${keptIds.join(",")})`);
        } else if (isEdit && keptIds.length === 0 && variants.length > 0) {
          // If all variants were cleared out
          await supabase.from("product_variants").delete().eq("product_id", productId);
        }
      } else if (productType === "simple" && productId && isEdit) {
        // If switched back to simple, clear any pre-existing database variants
        await supabase.from("product_variants").delete().eq("product_id", productId);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const hasApparel = category === "tshirt" || category === "shirt";
  const uploadingCount = images.filter((img) => img.uploading).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl font-inter">

      {/* CARD 1: Basic info */}
      <section className="bg-white border border-neutral-150 rounded-xl p-6 space-y-5">
        <h2 className="font-space text-sm font-semibold text-[#0a0a0a] uppercase tracking-wider">
          Basic Details
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="e.g. Vintage Oversized Tee"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-900 placeholder:text-neutral-300 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="vintage-oversized-tee"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#0a0a0a] font-mono focus:outline-none focus:border-neutral-900 transition-colors"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Direct link: <span className="font-mono text-neutral-500">/shop/{slug || "…"}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-900 bg-white transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Base Price (Rs.)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                min="0"
                placeholder="1500"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Search Tags <span className="text-neutral-300">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="kathmandu, cotton, student"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-300"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCustomizable}
                onChange={(e) => setIsCustomizable(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 accent-[#0a0a0a]"
              />
              <span className="text-sm font-medium text-[#0a0a0a]">Customization enabled</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 accent-[#0a0a0a]"
              />
              <span className="text-sm font-medium text-[#0a0a0a]">Mark as New release</span>
            </label>
          </div>
        </div>
      </section>

      {/* CARD 2: Images Upload */}
      <section className="bg-white border border-neutral-150 rounded-xl p-6 space-y-4">
        <h2 className="font-space text-sm font-semibold text-[#0a0a0a] uppercase tracking-wider">
          Product Images
        </h2>

        <div>
          {/* Image grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {images.map((img) => (
                <div
                  key={img._key}
                  className="relative aspect-square rounded-xl border border-neutral-150 overflow-hidden bg-neutral-50 flex items-center justify-center group"
                >
                  {img.uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.15" />
                        <path d="M12 2a10 10 0 0110 10" />
                      </svg>
                    </div>
                  ) : img.error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 bg-red-50">
                      <span className="text-[9px] text-red-500 font-medium text-center">{img.error}</span>
                    </div>
                  ) : isValidUrl(img.url) ? (
                    <Image
                      src={img.url}
                      alt="Product preview"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="140px"
                    />
                  ) : null}

                  {/* Delete overlay */}
                  {!img.uploading && (
                    <button
                      type="button"
                      onClick={() => removeImage(img._key)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 shadow border border-neutral-200 rounded-full flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Remove image"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Drop Zone */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-neutral-300 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-150 group"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-150 border border-neutral-150">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <span className="text-xs font-semibold text-neutral-600 mt-1">Upload Product Images</span>
            <span className="text-[11px] text-neutral-400">Drag & drop or click to browse files (JPEG, PNG, WEBP)</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
        </div>
      </section>

      {/* CARD 3: Inventory & Variants System */}
      <section className="bg-white border border-neutral-150 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-150 pb-5">
          <div>
            <h2 className="font-space text-sm font-semibold text-[#0a0a0a] uppercase tracking-wider">
              Inventory & Options
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">Define how this product stock and size/color combinations are handled.</p>
          </div>

          {/* Segmented control for Type selection */}
          <div className="flex border border-neutral-200 rounded-lg p-1 bg-neutral-50 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setProductType("simple")}
              className={[
                "text-xs font-semibold px-4 py-1.5 rounded-md transition-all",
                productType === "simple"
                  ? "bg-white text-[#0a0a0a] shadow-sm font-bold"
                  : "text-neutral-400 hover:text-neutral-600"
              ].join(" ")}
            >
              Simple Product
            </button>
            <button
              type="button"
              onClick={() => setProductType("variable")}
              className={[
                "text-xs font-semibold px-4 py-1.5 rounded-md transition-all",
                productType === "variable"
                  ? "bg-white text-[#0a0a0a] shadow-sm font-bold"
                  : "text-neutral-400 hover:text-neutral-600"
              ].join(" ")}
            >
              Variable Product
            </button>
          </div>
        </div>

        {/* CONDITION A: Simple Product (Global stock field) */}
        {productType === "simple" && (
          <div className="max-w-xs animate-fadeIn">
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Product Stock Quantity</label>
            <input
              type="number"
              value={globalStock}
              onChange={(e) => setGlobalStock(e.target.value)}
              required
              min="0"
              placeholder="e.g. 20"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-900 transition-colors"
            />
            <p className="text-[11px] text-neutral-400 mt-1.5">This sets the global inventory count for this non-variant product.</p>
          </div>
        )}

        {/* CONDITION B: Variable Product (Variant generator & table) */}
        {productType === "variable" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 1. AUTO-COMBINATIONS MATRIX GENERATOR */}
            <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-150 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Bulk Variant Generator</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">Select multiple sizes/colors and click Generate to auto-build your variants matrix.</p>
              </div>

              <div className="space-y-3">
                {/* Sizes selector (if apparel) */}
                {hasApparel && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Select Sizes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SIZES.map((s) => {
                        const active = genSizes.includes(s);
                        return (
                          <button
                            type="button"
                            key={s}
                            onClick={() => toggleGenSize(s)}
                            className={[
                              "text-xs px-2.5 py-1 rounded-md border font-medium transition-colors",
                              active
                                ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                            ].join(" ")}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Colors selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Select Colors</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map((c) => {
                      const active = genColors.includes(c);
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() => toggleGenColor(c)}
                          className={[
                            "text-xs px-2.5 py-1 rounded-md border font-medium transition-colors",
                            active
                              ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                              : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                          ].join(" ")}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleGenerateCombinations}
                  className="text-xs font-semibold px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:border-neutral-800 text-[#0a0a0a] transition-all duration-150 hover:bg-neutral-50"
                >
                  Generate Combinations Matrix
                </button>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-xs font-medium px-3 py-2 text-[#0a0a0a] hover:underline"
                >
                  + Add Single Row Manually
                </button>
              </div>
            </div>

            {/* 2. BULK OPERATIONS DRAWER */}
            {variantRows.length > 0 && (
              <div className="flex flex-wrap gap-4 items-end bg-neutral-50 rounded-xl p-4 border border-neutral-150">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Bulk Apply Stock</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={bulkStock}
                      min="0"
                      placeholder="e.g. 15"
                      onChange={(e) => setBulkStock(e.target.value)}
                      className="w-24 border border-neutral-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-neutral-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={applyBulkStock}
                      className="text-xs font-semibold px-3 py-1 border border-neutral-300 hover:border-neutral-800 rounded-lg bg-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Bulk Price Delta</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={bulkPriceDelta}
                      placeholder="e.g. 200"
                      onChange={(e) => setBulkPriceDelta(e.target.value)}
                      className="w-24 border border-neutral-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-neutral-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={applyBulkPriceDelta}
                      className="text-xs font-semibold px-3 py-1 border border-neutral-300 hover:border-neutral-800 rounded-lg bg-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ACTIVE VARIANTS MATRIX LIST */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-widest">Active Combinations Table</h3>
                <span className="text-xs text-neutral-400 font-medium">{variantRows.length} active variants</span>
              </div>

              {variantRows.length === 0 ? (
                <div className="border border-dashed border-neutral-200 rounded-xl p-8 text-center bg-neutral-50/50">
                  <p className="text-xs text-neutral-400">No variants active. Generate combinations above or add a row manually.</p>
                </div>
              ) : (
                <div className="border border-neutral-150 rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-150 text-left">
                        {hasApparel && (
                          <th className="px-4 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Size</th>
                        )}
                        <th className="px-4 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Color</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Stock</th>
                        <th className="px-4 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Price Delta (Rs.)</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {variantRows.map((v, i) => (
                        <tr key={v._key} className={i !== variantRows.length - 1 ? "border-b border-neutral-150 hover:bg-neutral-50/30 transition-colors" : "hover:bg-neutral-50/30 transition-colors"}>
                          {hasApparel && (
                            <td className="px-4 py-2">
                              <select
                                value={v.size ?? ""}
                                onChange={(e) => updateVariant(v._key, "size", e.target.value || null)}
                                className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-900"
                              >
                                <option value="">—</option>
                                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          )}
                          <td className="px-4 py-2">
                            <select
                              value={v.color ?? ""}
                              onChange={(e) => updateVariant(v._key, "color", e.target.value || null)}
                              className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-900"
                            >
                              <option value="">—</option>
                              {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={v.stock}
                              min="0"
                              onChange={(e) => updateVariant(v._key, "stock", Number(e.target.value))}
                              className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-900"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={v.price_delta}
                              placeholder="0"
                              onChange={(e) => updateVariant(v._key, "price_delta", Number(e.target.value))}
                              className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-900"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeVariant(v._key)}
                              className="text-neutral-300 hover:text-red-500 transition-colors duration-150"
                              aria-label="Remove variant"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Error Output */}
      {error && (
        <p className="text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fadeIn">
          {error}
        </p>
      )}

      {/* Form Submission Controls */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploadingCount > 0}
          className="px-6 py-3 bg-[#0a0a0a] text-white text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 active:scale-[0.99] transition-all duration-150"
        >
          {saving ? "Saving Changes…" : uploadingCount > 0 ? `Uploading Image (${uploadingCount})…` : isEdit ? "Save Changes" : "Publish Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-3 border border-neutral-200 text-xs font-semibold rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-[#0a0a0a] transition-all duration-150"
        >
          Cancel
        </button>
      </div>

    </form>
  );
}