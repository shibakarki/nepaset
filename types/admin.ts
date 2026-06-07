export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type CustomRequestStatus = "new" | "reviewing" | "quoted" | "accepted" | "rejected";

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  custom_request: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  custom_design: string | null;
  products?: {
    name: string;
    slug: string;
    images: string[];
  };
};

export type AdminStats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  newCustomRequests: number;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-blue-50 text-blue-800 border-blue-200",
  processing: "bg-purple-50 text-purple-800 border-purple-200",
  shipped: "bg-teal-50 text-teal-800 border-teal-200",
  delivered: "bg-green-50 text-green-800 border-green-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};
