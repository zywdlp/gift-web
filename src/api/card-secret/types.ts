import type { BaseQueryParams } from "@/api/common";

export interface CardSecretQueryParams extends Partial<BaseQueryParams> {
  pageNum?: number;
  pageSize?: number;
  keywords?: string;
}

export interface CardSecretBatchItem {
  id: string;
  batchNo: string;
  quantity: number;
  remark?: string | null;
  createBy?: string | null;
  operatorName?: string;
  createTime?: string;
}

export interface GenerateCardSecretForm {
  requestId: string;
  quantity: number;
  remark?: string;
}

export interface GiftCardItem {
  id: string;
  cardNo: string;
  batchId: string;
  pin?: string;
  qrToken?: string;
  createTime?: string;
  batchNo?: string;
  productId?: string | null;
  productName?: string;
  status?: "UNBOUND" | "ACTIVE";
  expiryAt?: string | null;
  boundAt?: string | null;
  bindRemark?: string | null;
}

export interface GiftCardQueryParams extends Partial<BaseQueryParams> {
  pageNum?: number;
  pageSize?: number;
  cardNo?: string;
  batchNo?: string;
  productName?: string;
  status?: "UNBOUND" | "ACTIVE";
}

export interface BindGiftCardsForm {
  cardIds: string[];
  productId: string;
  expiryAt: string;
  remark?: string;
}
