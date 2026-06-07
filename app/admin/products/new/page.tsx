import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
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
          Add product
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Fill in the details and add variants below.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
