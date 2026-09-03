import request from "@/utils/request";
import type { PageResult } from "@/api/common";
import type {
  CardSecretBatchItem,
  CardSecretQueryParams,
  GenerateCardSecretForm,
  GiftCardItem,
} from "./types";

const BASE_URL = "/api/v1/card-secrets";

const CardSecretAPI = {
  getPage(params?: CardSecretQueryParams) {
    return request<unknown, PageResult<CardSecretBatchItem>>({
      url: BASE_URL,
      method: "get",
      params,
    });
  },
  generate(data: GenerateCardSecretForm) {
    return request<unknown, CardSecretBatchItem>({
      url: `${BASE_URL}/generate`,
      method: "post",
      data,
    });
  },
  getCards(id: string, params?: Pick<CardSecretQueryParams, "pageNum" | "pageSize">) {
    return request<unknown, PageResult<GiftCardItem>>({
      url: `${BASE_URL}/${id}/cards`,
      method: "get",
      params,
    });
  },
  exportPrinting(id: string) {
    return request<unknown, Blob>({
      url: `${BASE_URL}/${id}/export-printing`,
      method: "post",
      responseType: "blob",
    });
  },
  exportQr(id: string) {
    return request<unknown, Blob>({
      url: `${BASE_URL}/${id}/export-qr`,
      method: "post",
      responseType: "blob",
    });
  },
};

export default CardSecretAPI;
export * from "./types";
