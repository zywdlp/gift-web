import request from "@/utils/request";
import type { PageResult } from "@/api/common";
import type { ProductForm, ProductItem, ProductQueryParams, UploadImageResult } from "./types";

const PRODUCT_BASE_URL = "/api/v1/products";

const ProductAPI = {
  getPage(params?: ProductQueryParams) {
    return request<unknown, PageResult<ProductItem>>({
      url: PRODUCT_BASE_URL,
      method: "get",
      params,
    });
  },
  getFormData(id: string) {
    return request<unknown, ProductForm>({ url: `${PRODUCT_BASE_URL}/${id}`, method: "get" });
  },
  create(data: ProductForm) {
    return request({ url: PRODUCT_BASE_URL, method: "post", data });
  },
  update(id: string, data: ProductForm) {
    return request({ url: `${PRODUCT_BASE_URL}/${id}`, method: "put", data });
  },
  delete(id: string) {
    return request({ url: `${PRODUCT_BASE_URL}/${id}`, method: "delete" });
  },
  uploadImage(file: File) {
    const data = new FormData();
    data.append("file", file);
    return request<unknown, UploadImageResult>({
      url: `${PRODUCT_BASE_URL}/images`,
      method: "post",
      data,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteImage(url: string) {
    return request({ url: `${PRODUCT_BASE_URL}/images/file`, method: "delete", params: { url } });
  },
};

export default ProductAPI;
export * from "./types";
