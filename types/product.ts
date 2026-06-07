export type ProductCategory = "tshirt" | "shirt" | "phone-case" | "earbuds";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  base_price: number;
  images: string[];
  tags: string[];
  is_customizable: boolean;
  is_new: boolean;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock: number;
  price_delta: number;
};

export const CATEGORY_LABELS: Record<string, string> = {
  tshirt: "T-Shirts",
  shirt: "Shirts",
  "phone-case": "Phone Cases",
  earbuds: "Earbuds",
};

export const CATEGORY_GROUPS: Record<string, string[]> = {
  apparel: ["tshirt", "shirt"],
  accessories: ["phone-case", "earbuds"],
};