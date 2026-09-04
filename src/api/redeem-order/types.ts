import type { BaseQueryParams } from "@/api/common";
export interface RedeemOrderItem {
  orderNo: string;
  cardNo: string;
  redeemerPhone: string;
  productName: string;
  recipient: string;
  phone: string;
  address: string;
  status: "PENDING_SHIPMENT" | "SHIPPED";
  createTime?: string;
  updateTime?: string;
}
export interface RedeemOrderQueryParams extends Partial<BaseQueryParams> {
  orderNo?: string;
  cardNo?: string;
  redeemerPhone?: string;
  productName?: string;
  status?: "PENDING_SHIPMENT" | "SHIPPED";
}
