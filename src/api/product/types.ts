export interface ProductQueryParams {
  pageNum?: number;
  pageSize?: number;
  keywords?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  shortName?: string | null;
  coverImage?: string | null;
  detailImages?: string[] | null;
  referenceValue?: string | number | null;
  description?: string | null;
  deliveryScope?: string | null;
  afterSales?: string | null;
  createTime?: string;
  updateTime?: string;
}

export interface ProductForm extends Omit<ProductItem, "id" | "createTime" | "updateTime"> {
  id?: string;
}

export interface UploadImageResult {
  url: string;
}
