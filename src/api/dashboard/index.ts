import request from "@/utils/request";
import type { DashboardOverview } from "./types";

const DashboardAPI = {
  getOverview() {
    return request<unknown, DashboardOverview>({
      url: "/dashboard/overview",
      method: "get",
    });
  },
};

export default DashboardAPI;
export * from "./types";
