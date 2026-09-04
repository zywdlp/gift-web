import request from "@/utils/request";
import type { PageResult } from "@/api/common";
import type { RedeemOrderItem, RedeemOrderQueryParams } from "./types";
const BASE_URL = "/api/v1/redeem-orders";
const RedeemOrderAPI = {
  getPage(params?: RedeemOrderQueryParams) {
    return request<unknown, PageResult<RedeemOrderItem>>({ url: BASE_URL, method: "get", params });
  },
  ship(orderNo: string) {
    return request({ url: `${BASE_URL}/${orderNo}/ship`, method: "post" });
  },
};
export default RedeemOrderAPI;
export * from "./types";
