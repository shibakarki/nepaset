"use client";

type Props = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({ productId, productName }: Props) {
  async function handleDelete() {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-[11px] text-neutral-400 hover:text-red-500 transition-colors"
    >
      Delete
    </button>
  );
}