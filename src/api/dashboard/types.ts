export interface DashboardRecentOrder {
  orderNo: string;
  cardNo: string;
  productName: string;
  redeemerPhone: string;
  recipient: string;
  status: "PENDING_SHIPMENT" | "SHIPPED";
  createTime?: string;
}

export interface DashboardOverview {
  productTotal: number;
  cards: { total: number; unbound: number; active: number; redeemed: number; expired: number };
  orders: { total: number; pendingShipment: number; shipped: number };
  recentOrders: DashboardRecentOrder[];
  generatedAt: string;
}
