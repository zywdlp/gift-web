<template>
  <div class="dashboard page-container">
    <el-card shadow="never" class="dashboard__welcome">
      <div class="dashboard__icon i-svg:homepage" />
      <div>
        <h1>欢迎使用{{ appConfig.title }}</h1>
        <p>请从左侧菜单进入用户、角色、菜单、部门或操作日志管理。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { appConfig } from "@/settings";

defineOptions({ name: "Dashboard" });
</script>

<style lang="scss" scoped>
.dashboard__welcome {
  display: flex;
  gap: 20px;
  align-items: center;
  min-height: 180px;
}

.dashboard__icon {
  width: 56px;
  height: 56px;
  color: var(--el-color-primary);
}

h1 {
  margin: 0 0 8px;
  font-size: 24px;
}

p {
  margin: 0;
  color: var(--el-text-color-secondary);
}
</style>
