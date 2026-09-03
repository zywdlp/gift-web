import request from "@/utils/request";
import type {
  PasswordChangeForm,
  UserInfo,
  UserForm,
  UserProfile,
  UserProfileForm,
  UserQueryParams,
  UserItem,
} from "./types";
import type { OptionItem, PageResult } from "@/api/common";

const USER_BASE_URL = "/api/v1/users";

const UserAPI = {
  getInfo() {
    return request<unknown, UserInfo>({ url: `${USER_BASE_URL}/me`, method: "get" });
  },
  getProfile() {
    return request<unknown, UserProfile>({ url: `${USER_BASE_URL}/profile`, method: "get" });
  },
  updateProfile(data: UserProfileForm) {
    return request({ url: `${USER_BASE_URL}/profile`, method: "put", data });
  },
  changePassword(data: PasswordChangeForm) {
    return request({ url: `${USER_BASE_URL}/password`, method: "put", data });
  },
  getPage(queryParams: UserQueryParams) {
    return request<unknown, PageResult<UserItem>>({
      url: USER_BASE_URL,
      method: "get",
      params: queryParams,
    });
  },
  getFormData(userId: string) {
    return request<unknown, UserForm>({ url: `${USER_BASE_URL}/${userId}/form`, method: "get" });
  },
  create(data: UserForm) {
    return request({ url: USER_BASE_URL, method: "post", data });
  },
  update(id: string, data: UserForm) {
    return request({ url: `${USER_BASE_URL}/${id}`, method: "put", data });
  },
  /** 管理员重置其他用户的密码 */
  resetPassword(id: string, password: string) {
    return request({
      url: `${USER_BASE_URL}/${id}/password/reset`,
      method: "put",
      params: { password },
    });
  },
  deleteByIds(ids: string) {
    return request({ url: `${USER_BASE_URL}/${ids}`, method: "delete" });
  },
  getOptions() {
    return request<unknown, OptionItem[]>({ url: `${USER_BASE_URL}/options`, method: "get" });
  },
};

export default UserAPI;
export * from "./types";
