import type { BaseQueryParams } from "@/api/common";

export interface UserInfo {
  userId?: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  roles: string[];
  perms: string[];
}

export interface UserProfile extends UserInfo {
  createTime?: string;
  email?: string;
  gender?: number;
  mobile?: string;
  roleNames?: string;
}

export interface UserProfileForm {
  avatar?: string;
  gender?: number;
  nickname?: string;
}

export interface PasswordChangeForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserQueryParams extends BaseQueryParams {
  keywords?: string;
  status?: number;
  deptId?: string;
  createTime?: [string, string];
}

export interface UserItem {
  id: string;
  avatar?: string;
  createTime?: Date;
  deptName?: string;
  email?: string;
  gender?: number;
  mobile?: string;
  nickname?: string;
  roleNames?: string;
  status?: number;
  username?: string;
}

export interface UserForm {
  id?: string;
  avatar?: string;
  deptId?: string;
  email?: string;
  gender?: number;
  mobile?: string;
  nickname?: string;
  roleIds?: number[];
  status?: number;
  username?: string;
}
