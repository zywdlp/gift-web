<template>
  <div class="profile-page">
    <el-card shadow="never" class="profile-card">
      <template #header>
        <div class="profile-card__header">
          <span>个人中心</span>
          <el-button :loading="loading" @click="loadProfile">刷新</el-button>
        </div>
      </template>

      <div class="profile-summary">
        <el-avatar :size="72" :src="profile.avatar || undefined">{{ avatarText }}</el-avatar>
        <div>
          <h2>{{ profile.nickname || profile.username || "管理员" }}</h2>
          <p>
            {{ profile.username || "-" }} ·
            {{ profile.roleNames || profile.roles?.join(", ") || "-" }}
          </p>
        </div>
      </div>

      <el-descriptions :column="2" border class="profile-details">
        <el-descriptions-item label="手机号码">
          {{ profile.mobile || "未绑定" }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ profile.email || "未绑定" }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ profile.createTime || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="账号角色">{{ profile.roleNames || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="profile-card">
      <template #header>编辑资料</template>
      <el-form :model="profileForm" label-width="80px" class="profile-form">
        <el-form-item label="用户名">
          <el-input :model-value="profile.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname" maxlength="64" />
        </el-form-item>
        <el-form-item label="头像地址">
          <el-input v-model="profileForm.avatar" placeholder="可选，填写图片 URL" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="profileSaving" @click="saveProfile">
            保存资料
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="profile-card">
      <template #header>修改密码</template>
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
        class="profile-form"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            autocomplete="new-password"
            @keyup.enter="savePassword"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="passwordSaving" @click="savePassword">
            确认修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import UserAPI, {
  type PasswordChangeForm,
  type UserProfile,
  type UserProfileForm,
} from "@/api/system/user";
import { useUserStore } from "@/stores";

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const profileSaving = ref(false);
const passwordSaving = ref(false);
const passwordFormRef = ref<FormInstance>();
const profile = ref<UserProfile>({ roles: [], perms: [] });
const profileForm = reactive<UserProfileForm>({});
const passwordForm = reactive<PasswordChangeForm>({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const avatarText = computed(() =>
  (profile.value.nickname || profile.value.username || "管").slice(0, 1).toUpperCase()
);
const passwordRules: FormRules<PasswordChangeForm> = {
  oldPassword: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
  newPassword: [{ required: true, min: 6, message: "新密码至少 6 个字符", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (_rule, value, callback) =>
        value === passwordForm.newPassword
          ? callback()
          : callback(new Error("两次输入的密码不一致")),
      trigger: "blur",
    },
  ],
};

async function loadProfile() {
  loading.value = true;
  try {
    profile.value = await UserAPI.getProfile();
    Object.assign(profileForm, {
      nickname: profile.value.nickname || "",
      avatar: profile.value.avatar || "",
    });
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  profileSaving.value = true;
  try {
    await UserAPI.updateProfile(profileForm);
    await userStore.getUserInfo();
    await loadProfile();
    ElMessage.success("个人资料已保存");
  } finally {
    profileSaving.value = false;
  }
}

async function savePassword() {
  const valid = await passwordFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  passwordSaving.value = true;
  try {
    await UserAPI.changePassword(passwordForm);
    ElMessage.success("密码修改成功，请重新登录");
    await userStore.logout();
    router.push("/login");
  } finally {
    passwordSaving.value = false;
  }
}

onMounted(loadProfile);
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 16px;
  padding: 16px;
}
.profile-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.profile-summary {
  display: flex;
  gap: 16px;
  align-items: center;
}
.profile-summary h2 {
  margin: 0 0 6px;
  font-size: 20px;
}
.profile-summary p {
  margin: 0;
  color: var(--el-text-color-secondary);
}
.profile-details {
  margin-top: 20px;
}
.profile-form {
  max-width: 520px;
}
</style>
