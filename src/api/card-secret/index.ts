import request from "@/utils/request";
import type { AxiosResponse } from "axios";
import type { PageResult } from "@/api/common";
import type {
  CardSecretBatchItem,
  CardSecretQueryParams,
  GenerateCardSecretForm,
  GiftCardItem,
  GiftCardQueryParams,
  BindGiftCardsForm,
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
  getCards(
    id: string,
    params?: Pick<CardSecretQueryParams, "pageNum" | "pageSize"> & { cardNo?: string }
  ) {
    return request<unknown, PageResult<GiftCardItem>>({
      url: `${BASE_URL}/${id}/cards`,
      method: "get",
      params,
    });
  },
  getGiftCardPage(params?: GiftCardQueryParams) {
    return request<unknown, PageResult<GiftCardItem>>({
      url: `${BASE_URL}/cards`,
      method: "get",
      params,
    });
  },
  bindGiftCards(data: BindGiftCardsForm) {
    return request<unknown, { count: number }>({
      url: `${BASE_URL}/cards/bind`,
      method: "post",
      data,
    });
  },
  exportPrinting(id: string) {
    return request<unknown, AxiosResponse<Blob>>({
      url: `${BASE_URL}/${id}/export-printing`,
      method: "post",
      responseType: "blob",
    });
  },
  exportQr(id: string) {
    return request<unknown, AxiosResponse<Blob>>({
      url: `${BASE_URL}/${id}/export-qr`,
      method: "post",
      responseType: "blob",
    });
  },
};

export default CardSecretAPI;
export * from "./types";
