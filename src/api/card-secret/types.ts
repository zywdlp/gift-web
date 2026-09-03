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
  pin: string;
  qrToken: string;
  createTime?: string;
}
