import request from "@/utils/request";
import type { DashboardOverview } from "./types";

const DashboardAPI = {
  getOverview() {
    return request<unknown, DashboardOverview>({
      url: "/api/v1/dashboard/overview",
      method: "get",
    });
  },
};

export default DashboardAPI;
export * from "./types";
