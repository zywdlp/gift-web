<template>
  <div class="login-page">
    <div class="login-toolbar">
      <ThemeSwitch />
    </div>

    <div class="login-layout">
      <div class="login-brand">
        <div class="login-brand__header">
          <span class="login-brand__seal" aria-hidden="true">岩</span>
          <div class="login-brand__identity">
            <span class="login-brand__name">岩茶馆礼品管理系统</span>
            <span class="login-brand__subtitle">YANCHA GIFT MANAGEMENT</span>
          </div>
        </div>

        <div class="login-brand__hero">
          <div class="login-brand__main">
            <p class="login-brand__eyebrow">
              <span />
              岩茶礼赠运营中心
            </p>
            <h1 class="login-brand__title">
              让每一份岩茶礼赠
              <br />
              都有迹可循
            </h1>
            <p class="login-brand__desc">
              统一管理礼品、卡券与兑换订单，让选茶、发放和履约清楚衔接。
            </p>
          </div>
          <div class="login-brand__flow" aria-label="礼品管理流程">
            <div class="login-brand__flow-item">
              <span class="login-brand__flow-number">01</span>
              <div>
                <strong>礼品建档</strong>
                <span>维护茶礼与权益信息</span>
              </div>
            </div>
            <div class="login-brand__flow-item">
              <span class="login-brand__flow-number">02</span>
              <div>
                <strong>卡密管理</strong>
                <span>跟踪生成、发放与状态</span>
              </div>
            </div>
            <div class="login-brand__flow-item">
              <span class="login-brand__flow-number">03</span>
              <div>
                <strong>兑换履约</strong>
                <span>掌握订单与核销进度</span>
              </div>
            </div>
          </div>
        </div>
        <p class="login-brand__quote">一岩一味，以礼传心</p>
      </div>

      <div class="login-card">
        <div class="login-card__inner">
          <div class="login-card__form">
            <p class="login-card__eyebrow">管理员入口</p>
            <h2 class="login-card__title">登录管理系统</h2>
            <p class="login-card__desc">使用管理员账号继续</p>

            <el-form
              ref="loginFormRef"
              :model="loginFormData"
              :rules="loginRules"
              size="large"
              :validate-on-rule-change="false"
            >
              <label class="login-field-label" for="login-username">用户名</label>
              <el-form-item prop="username">
                <el-input
                  id="login-username"
                  v-model.trim="loginFormData.username"
                  placeholder="用户名"
                  :prefix-icon="UserIcon"
                />
              </el-form-item>

              <label class="login-field-label" for="login-password">密码</label>
              <el-tooltip :visible="isCapsLock" content="大写锁定已开启" placement="right">
                <el-form-item prop="password">
                  <el-input
                    id="login-password"
                    v-model.trim="loginFormData.password"
                    placeholder="密码"
                    type="password"
                    show-password
                    :prefix-icon="LockIcon"
                    @keyup="checkCapsLock"
                    @keyup.enter="handleLoginSubmit"
                  />
                </el-form-item>
              </el-tooltip>

              <label class="login-field-label" for="login-captcha">验证码</label>
              <el-form-item prop="captchaCode">
                <div class="captcha-row">
                  <el-input
                    id="login-captcha"
                    v-model.trim="loginFormData.captchaCode"
                    placeholder="验证码"
                    class="captcha-row__input"
                    @keyup.enter="handleLoginSubmit"
                  >
                    <template #prefix>
                      <span class="input-prefix-icon i-svg:security" />
                    </template>
                  </el-input>
                  <div class="captcha-img" @click="getCaptcha">
                    <el-icon v-if="codeLoading" class="is-loading" :size="16">
                      <Loading />
                    </el-icon>
                    <img v-else-if="captchaBase64" :src="captchaBase64" alt="验证码" />
                    <el-icon v-else :size="16"><Refresh /></el-icon>
                  </div>
                </div>
              </el-form-item>

              <div class="login-options">
                <el-checkbox v-model="loginFormData.rememberMe">记住我</el-checkbox>
              </div>

              <el-button
                :loading="loading"
                type="primary"
                size="large"
                class="login-btn"
                @click="handleLoginSubmit"
              >
                登录
              </el-button>
            </el-form>
          </div>
        </div>

        <div class="login-footer">岩茶馆礼品管理系统 · 内部运营平台</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "LoginPage", inheritAttrs: false });

import { Lock, Loading, Refresh, User } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import AuthAPI from "@/api/auth";
import type { LoginRequest } from "@/api/auth";
import router from "@/router";
import { useUserStore } from "@/stores";
import { AuthStorage } from "@/utils/auth";
import ThemeSwitch from "@/components/ThemeSwitch/index.vue";

const userStore = useUserStore();
const route = useRoute();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const isCapsLock = ref(false);
const captchaBase64 = ref<string>();
const codeLoading = ref(false);

const UserIcon = markRaw(User);
const LockIcon = markRaw(Lock);

const loginFormData = ref<LoginRequest>({
  username: "",
  password: "",
  captchaId: "",
  captchaCode: "",
  rememberMe: AuthStorage.getRememberMe(),
});

const loginRules = computed(() => ({
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { min: 6, message: "密码不能少于6位", trigger: "blur" },
  ],
  captchaCode: [{ required: true, trigger: "blur", message: "请输入验证码" }],
}));

function getCaptcha() {
  codeLoading.value = true;
  AuthAPI.getCaptcha()
    .then((d) => {
      loginFormData.value.captchaId = d.captchaId;
      captchaBase64.value = d.captchaBase64;
    })
    .finally(() => (codeLoading.value = false));
}

async function handleLoginSubmit() {
  const valid = await loginFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    await userStore.login(loginFormData.value);
    const redirectPath = (route.query.redirect as string) || "/";
    await router.replace(decodeURIComponent(redirectPath));
  } catch (error) {
    console.error("登录后跳转失败:", error);
    getCaptcha();
  } finally {
    loading.value = false;
  }
}

function checkCapsLock(event: KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

onMounted(() => getCaptcha());
</script>

<style lang="scss" scoped>
$primary: #5d87ff;
$bg: #f8fafc;
$text-primary: #273248;
$text-secondary: #667085;
$text-muted: #98a2b3;
$input-h: 44px;

.login-page {
  position: relative;
  display: flex;
  min-height: 100vh;
  overflow: auto;
  background: $bg;
}

.login-toolbar {
  position: fixed;
  top: 28px;
  right: 32px;
  z-index: 10;
  display: flex;
  gap: 12px;
  align-items: center;

  :deep(*) {
    cursor: pointer;
  }
}

.login-layout {
  display: flex;
  flex: 1;
  min-height: 100%;
}

.login-brand {
  position: relative;
  display: flex;
  flex: 0 0 65%;
  flex-direction: column;
  min-height: 100vh;
  padding: 28px 64px 48px;
  overflow: hidden;
  background: url("@/assets/images/login/bg.svg") center / cover no-repeat;
  animation: login-pane-in 0.36s ease-out both;

  &__header,
  &__hero {
    position: relative;
    z-index: 1;
  }

  &__header {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  &__logo {
    width: 42px;
    height: 42px;
  }

  &__identity {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  &__name {
    font-size: 24px;
    font-weight: 600;
    line-height: 1;
    color: $text-primary;
  }

  &__hero {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: min(720px, 100%);
    padding: 20px 0 88px;
  }

  &__main {
    width: 100%;
  }

  &__tag {
    gap: 8px;
    height: 28px;
    padding: 0 13px 0 11px;
    margin-bottom: 18px;
    font-weight: 700;
    color: $primary;
    background: rgba($primary, 0.035);
    border-color: rgba($primary, 0.14);

    :deep(.el-tag__content) {
      display: inline-flex;
      gap: 8px;
      align-items: center;
    }
  }

  &__tag-dot {
    display: inline-block;
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    background: $primary;
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba($primary, 0.12);
  }

  &__title {
    margin: 0 0 18px;
    font-size: 46px;
    font-weight: 800;
    line-height: 1.18;
    color: #222b3a;
    letter-spacing: 0;
  }

  &__desc {
    max-width: 560px;
    margin: 0;
    font-size: 16px;
    line-height: 1.75;
    color: $text-secondary;
  }

  &__features {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    max-width: 100%;
    margin-top: 28px;
  }

  &__feature {
    position: relative;
    display: inline-flex;
    gap: 8px;
    align-items: center;
    height: 28px;
    padding: 0 13px;
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
    background: transparent;

    &:first-child {
      padding-left: 0;
    }

    &:not(:last-child)::after {
      position: absolute;
      top: 7px;
      right: 0;
      width: 1px;
      height: 14px;
      content: "";
      background: rgba(39 50 72 / 12%);
    }
  }

  &__feature-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: $primary;
    background: rgba($primary, 0.08);
    border: 1px solid rgba($primary, 0.1);
    border-radius: 6px;
  }

  &__feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    color: $primary;
  }

  &__feature-text {
    line-height: 1;
    white-space: nowrap;
  }
}

.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 0 0 35%;
  flex-direction: column;
  align-items: center;
  padding: 0 0 32px;
  background: linear-gradient(135deg, #f8faff 0%, #fff 100%);
  animation: login-pane-in 0.36s ease-out 0.04s both;

  &__inner {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    max-width: 430px;
    padding: 0 20px;
  }

  &__form {
    width: 100%;
  }

  &__title {
    margin: 0 0 4px;
    font-size: 34px;
    font-weight: 750;
    line-height: 1.1;
    color: $text-primary;
    letter-spacing: 0;
  }

  &__desc {
    margin: 8px 0 24px;
    font-size: 14px;
    color: $text-muted;
  }
}

:deep(.el-form-item) {
  margin-bottom: 14px;
}

:deep(.el-input__wrapper) {
  height: $input-h;
}

.input-prefix-icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: var(--el-text-color-placeholder);
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-row__input {
  flex: 1;
  min-width: 0;
}

.captcha-img {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: $input-h;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  font-size: 14px;
  color: $text-secondary;

  &__link {
    font-weight: 500;
    color: $primary;
    cursor: pointer;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.8;
    }
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba($primary, 0.18);

  &:hover {
    box-shadow: 0 14px 28px rgba($primary, 0.22);
  }

  &:focus,
  &:focus-visible {
    outline: none;
  }
}

.login-footer {
  flex-shrink: 0;
  font-size: 12px;
  color: $text-muted;
}

.dark .login-page {
  background: #0b1020;
}

.dark .login-brand {
  background-image: url("@/assets/images/login/bg-dark.svg");

  &__name {
    color: rgb(255 255 255 / 86%);
  }

  &__tag {
    color: rgba($primary, 0.95);
    background: rgba($primary, 0.08);
    border-color: rgba($primary, 0.18);
  }

  &__title {
    color: rgb(255 255 255 / 90%);
  }

  &__desc {
    color: rgb(226 232 240 / 62%);
  }

  &__feature {
    color: rgb(255 255 255 / 76%);

    &:not(:last-child)::after {
      background: rgba(255 255 255 / 12%);
    }
  }

  &__feature-mark {
    background: rgba($primary, 0.15);
    border-color: rgba($primary, 0.18);
  }
}

.dark .login-card {
  background: linear-gradient(135deg, #111827, #0b1020);

  &__title {
    color: rgb(255 255 255 / 85%);
  }

  &__desc {
    color: rgb(255 255 255 / 30%);
  }
}

.dark .login-footer {
  color: rgb(255 255 255 / 15%);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@keyframes login-pane-in {
  from {
    opacity: 0;
    filter: blur(4px);
  }

  to {
    opacity: 1;
    filter: blur(0);
  }
}

@media (max-width: 1024px) {
  .login-layout {
    flex-direction: column;
  }

  .login-toolbar {
    position: absolute;
    top: 37px;
  }

  .login-brand {
    flex: none;
    height: auto;
    min-height: auto;
    padding: 28px 40px 0;
    background: #fff;

    &__hero {
      display: none;
    }
  }

  .dark .login-brand {
    background: #0b1020;
  }

  .login-card {
    flex: 1;
    justify-content: flex-start;
    padding: 96px 48px 0;
  }
}

@media (max-width: 640px) {
  .login-toolbar {
    top: 33px;
    right: 20px;
  }

  .login-brand {
    padding: 24px 0 0 24px;
  }

  .login-card {
    padding: 72px 24px 0;

    &__inner {
      width: 100%;
      padding: 0;
    }
  }
}

/* 岩茶馆登录首页 */
.login-page {
  --el-color-primary: #a85f35;
  --el-color-primary-light-3: #bd7f5a;
  --el-color-primary-light-5: #cfa087;
  --el-color-primary-light-7: #e3c7b8;
  --el-color-primary-light-9: #f7eee9;
  --el-color-primary-dark-2: #874725;
  font-family: "Noto Serif SC", "Songti SC", "Microsoft YaHei", sans-serif;
  background: #f4efe7;
}

.login-brand {
  flex-basis: 61%;
  padding: 38px 72px 44px;
  color: #f8f1e5;
  background:
    linear-gradient(118deg, rgba(29, 21, 16, 0.08), rgba(29, 21, 16, 0.72)),
    radial-gradient(circle at 18% 22%, rgba(185, 106, 58, 0.32), transparent 34%),
    linear-gradient(145deg, #493226 0%, #291f19 58%, #191512 100%);

  &::before,
  &::after {
    position: absolute;
    content: "";
    border: 1px solid rgba(238, 211, 172, 0.14);
    border-radius: 50%;
  }

  &::before {
    right: -14vw;
    bottom: -27vw;
    width: 58vw;
    height: 58vw;
    box-shadow:
      0 0 0 70px rgba(238, 211, 172, 0.035),
      0 0 0 150px rgba(238, 211, 172, 0.025),
      0 0 0 240px rgba(238, 211, 172, 0.018);
  }

  &::after {
    top: 18%;
    left: -170px;
    width: 360px;
    height: 360px;
  }

  &__header {
    gap: 13px;
  }

  &__seal {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    font-family: "STKaiti", "KaiTi", serif;
    font-size: 24px;
    color: #321f15;
    background: #d8a16f;
    border: 1px solid rgba(255, 238, 211, 0.64);
    box-shadow: inset 0 0 0 4px rgba(55, 31, 19, 0.12);
  }

  &__identity {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
  }

  &__name {
    font-size: 21px;
    font-weight: 700;
    color: #fff9ef;
    letter-spacing: 0.08em;
  }

  &__subtitle {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 9px;
    color: rgba(245, 225, 197, 0.58);
    letter-spacing: 0.18em;
  }

  &__hero {
    width: min(690px, 100%);
    padding: 32px 0 70px;
  }

  &__eyebrow {
    display: flex;
    gap: 12px;
    align-items: center;
    margin: 0 0 22px;
    font-size: 14px;
    font-weight: 600;
    color: #d9aa78;
    letter-spacing: 0.2em;

    span {
      width: 34px;
      height: 1px;
      background: #c98850;
    }
  }

  &__title {
    margin-bottom: 22px;
    font-family: "Noto Serif SC", "Songti SC", serif;
    font-size: clamp(42px, 4vw, 64px);
    font-weight: 700;
    line-height: 1.32;
    color: #fff8ed;
    letter-spacing: 0.04em;
    text-wrap: balance;
  }

  &__desc {
    max-width: 550px;
    font-size: 16px;
    line-height: 1.9;
    color: rgba(246, 232, 211, 0.68);
    letter-spacing: 0.03em;
  }

  &__flow {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    max-width: 670px;
    margin-top: 46px;
    border-top: 1px solid rgba(236, 211, 178, 0.18);
    border-bottom: 1px solid rgba(236, 211, 178, 0.18);
  }

  &__flow-item {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 20px 20px 20px 0;

    & + & {
      padding-left: 20px;
      border-left: 1px solid rgba(236, 211, 178, 0.18);
    }

    div {
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 0;
    }

    strong {
      font-size: 15px;
      color: #f9eee0;
      letter-spacing: 0.06em;
    }

    div > span {
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
      color: rgba(238, 220, 196, 0.52);
      white-space: nowrap;
    }
  }

  &__flow-number {
    font-family: Georgia, serif;
    font-size: 13px;
    font-style: italic;
    color: #c88750;
  }

  &__quote {
    position: relative;
    z-index: 1;
    margin: 0;
    font-family: "STKaiti", "KaiTi", serif;
    font-size: 14px;
    color: rgba(241, 220, 190, 0.42);
    letter-spacing: 0.32em;
  }
}

.login-card {
  flex-basis: 39%;
  padding-bottom: 30px;
  background:
    linear-gradient(rgba(255, 253, 249, 0.94), rgba(255, 253, 249, 0.94)),
    repeating-linear-gradient(0deg, transparent 0 4px, rgba(90, 64, 45, 0.025) 4px 5px);

  &__inner {
    max-width: 450px;
    padding: 0 34px;
  }

  &__form {
    padding-top: 6px;
  }

  &__eyebrow {
    margin: 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    color: #a85f35;
    letter-spacing: 0.22em;
  }

  &__title {
    font-family: "Noto Serif SC", "Songti SC", serif;
    font-size: 32px;
    color: #34261f;
    letter-spacing: 0.04em;
  }

  &__desc {
    margin: 10px 0 32px;
    font-size: 15px;
    color: #7d7068;
  }
}

.login-toolbar {
  :deep(.theme-switch) {
    color: #725e52;
  }
}

.login-field-label {
  display: block;
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #51433b;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  height: 46px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.74);
  border-radius: 3px;
  box-shadow: 0 0 0 1px #d9d0c8 inset;

  &:hover {
    box-shadow: 0 0 0 1px #bba99c inset;
  }

  &.is-focus {
    box-shadow: 0 0 0 1px #a85f35 inset;
  }
}

.captcha-img {
  height: 46px;
  background: rgba(255, 255, 255, 0.74);
  border-color: #d9d0c8;
  border-radius: 3px;
}

.login-options {
  margin-top: -2px;
  margin-bottom: 24px;
}

.login-btn {
  height: 48px;
  border-radius: 3px;
  box-shadow: 0 10px 24px rgba(119, 63, 31, 0.18);
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: 0 12px 26px rgba(119, 63, 31, 0.24);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid #a85f35;
    outline-offset: 3px;
  }
}

.login-footer {
  font-size: 12px;
  color: #a09389;
  letter-spacing: 0.08em;
}

.dark .login-page {
  --el-color-primary: #c47a4b;
  background: #171310;
}

.dark .login-brand {
  background:
    radial-gradient(circle at 18% 22%, rgba(170, 91, 48, 0.2), transparent 34%),
    linear-gradient(145deg, #39271e 0%, #211915 58%, #13100e 100%);

  &__name,
  &__title {
    color: #fff8ed;
  }
}

.dark .login-card {
  background: #1d1916;

  &__title {
    color: #f4e9dc;
  }

  &__desc {
    color: #a99b91;
  }
}

.dark .login-field-label {
  color: #d8c9bd;
}

.dark :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.035);
  box-shadow: 0 0 0 1px #4a4039 inset;
}

@media (max-width: 1024px) {
  .login-brand {
    flex: none;
    padding: 24px 40px;
    color: #f8f1e5;
    background: linear-gradient(135deg, #493226, #251c17);

    &__header {
      padding-right: 54px;
    }

    &__quote {
      display: none;
    }
  }

  .login-card {
    padding: 64px 48px 24px;
  }
}

@media (max-width: 640px) {
  .login-brand {
    padding: 20px 64px 20px 20px;

    &__seal {
      width: 40px;
      height: 40px;
      font-size: 21px;
    }

    &__name {
      font-size: 17px;
    }

    &__subtitle {
      display: none;
    }
  }

  .login-toolbar {
    top: 28px;
  }

  .login-card {
    padding: 52px 22px 22px;

    &__inner {
      padding: 0;
    }

    &__title {
      font-size: 28px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-brand,
  .login-card {
    animation: none;
  }

  .login-btn {
    transition: none;
  }
}
</style>
