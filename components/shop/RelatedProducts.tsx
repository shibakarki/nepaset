import Link from "next/link";
import Image from "next/image";
import { CATEGORY_LABELS, type Product } from "@/types/product";

type Props = {
  products: Product[];
};

export function RelatedProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="mt-20 pt-12 border-t border-neutral-150">
      <h2 className="font-space text-lg font-medium text-[#0a0a0a] tracking-tight mb-6">
        You may also like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => {
          const firstImage = product.images?.[0] ?? null;
          return (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group block"
            >
              <div className="border border-border rounded-xl overflow-hidden bg-surface hover:border-border transition-colors duration-150 shadow-sm">
                <div className="relative aspect-square w-full bg-neutral-50 flex items-center justify-center">
                  {firstImage ? (
                    <Image
                      src={firstImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <span className="text-4xl select-none">
                      {product.category === "tshirt" || product.category === "shirt"
                        ? "👕"
                        : product.category === "phone-case"
                        ? "📱"
                        : "🎧"}
                    </span>
                  )}
                  {product.is_customizable && (
                    <span className="absolute top-2 left-2 text-[10px] font-medium tracking-widest bg-[#0a0a0a] text-white px-2 py-0.5 rounded-full">
                      CUSTOM
                    </span>
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  <p className="text-[10px] uppercase tracking-[0.06em] text-muted mb-1">
                    {CATEGORY_LABELS[product.category]}
                  </p>
                  <p className="text-[13px] font-medium text-foreground leading-snug mb-1 truncate">
                    {product.name}
                  </p>
                  <p className="text-[12px] text-muted">
                    Rs. {product.base_price.toLocaleString("en-NP")}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
