<template>
  <div class="dashboard page-container">
    <div class="dashboard__heading">
      <div>
        <h1>数据概览</h1>
        <p>查看礼品卡兑换与订单发货的整体进度</p>
      </div>
      <div class="dashboard__actions">
        <span v-if="overview" class="dashboard__time">更新于 {{ overview.generatedAt }}</span>
        <el-button :loading="loading" @click="fetchOverview">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    <el-row v-loading="loading" :gutter="16" class="dashboard__metrics">
      <el-col v-for="item in metrics" :key="item.label" :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-card__label">{{ item.label }}</div>
          <div class="metric-card__value">{{ item.value }}</div>
          <div class="metric-card__hint">{{ item.hint }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row v-loading="loading" :gutter="16" class="dashboard__summary">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="summary-card">
          <template #header><span>礼品卡状态</span></template>
          <div v-for="item in cardStatus" :key="item.label" class="status-row">
            <span>{{ item.label }}</span>
            <el-progress
              :percentage="item.percentage"
              :stroke-width="10"
              :color="item.color"
              :show-text="false"
            />
            <strong>{{ item.value }}</strong>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="summary-card">
          <template #header><span>订单履约</span></template>
          <div class="fulfillment">
            <div>
              <strong class="fulfillment__pending">
                {{ overview?.orders.pendingShipment || 0 }}
              </strong>
              <span>待发货</span>
            </div>
            <div>
              <strong class="fulfillment__shipped">{{ overview?.orders.shipped || 0 }}</strong>
              <span>已发货</span>
            </div>
          </div>
          <el-button class="fulfillment__button" type="primary" link @click="goToOrders">
            进入订单管理
          </el-button>
        </el-card>
      </el-col>
    </el-row>
    <el-card v-loading="loading" shadow="never" class="dashboard__orders">
      <template #header>
        <div class="card-header">
          <span>最近兑换订单</span>
          <el-button type="primary" link @click="goToOrders">查看全部</el-button>
        </div>
      </template>
      <el-table v-if="overview?.recentOrders.length" :data="overview.recentOrders" border>
        <el-table-column prop="orderNo" label="订单号" min-width="190" />
        <el-table-column prop="cardNo" label="兑换卡号" min-width="160" />
        <el-table-column prop="productName" label="商品" min-width="120" />
        <el-table-column prop="redeemerPhone" label="兑换人手机" width="130" />
        <el-table-column prop="recipient" label="收件人" width="100" />
        <el-table-column prop="createTime" label="兑换时间" width="180" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'SHIPPED' ? 'success' : 'warning'">
              {{ row.status === "SHIPPED" ? "已发货" : "待发货" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else-if="!loading" description="暂无兑换订单" :image-size="80" />
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { Refresh } from "@element-plus/icons-vue";
import DashboardAPI, { type DashboardOverview } from "@/api/dashboard";
defineOptions({ name: "Dashboard" });
const router = useRouter();
const loading = ref(false);
const overview = ref<DashboardOverview>();
const percent = (value: number) => {
  const total = overview.value?.cards.total || 0;
  return total ? Math.round((value / total) * 100) : 0;
};
const metrics = computed(() => [
  { label: "商品数量", value: overview.value?.productTotal || 0, hint: "当前可用于绑定的商品" },
  { label: "已生成礼品卡", value: overview.value?.cards.total || 0, hint: "累计生成的全部礼品卡" },
  { label: "可兑换礼品卡", value: overview.value?.cards.active || 0, hint: "已绑定且仍在有效期内" },
  {
    label: "待发货订单",
    value: overview.value?.orders.pendingShipment || 0,
    hint: "需要尽快处理的兑换订单",
  },
]);
const cardStatus = computed(() => [
  {
    label: "未绑定",
    value: overview.value?.cards.unbound || 0,
    percentage: percent(overview.value?.cards.unbound || 0),
    color: "#909399",
  },
  {
    label: "可兑换",
    value: overview.value?.cards.active || 0,
    percentage: percent(overview.value?.cards.active || 0),
    color: "#409eff",
  },
  {
    label: "已兑换",
    value: overview.value?.cards.redeemed || 0,
    percentage: percent(overview.value?.cards.redeemed || 0),
    color: "#67c23a",
  },
  {
    label: "已过期",
    value: overview.value?.cards.expired || 0,
    percentage: percent(overview.value?.cards.expired || 0),
    color: "#e6a23c",
  },
]);
async function fetchOverview() {
  loading.value = true;
  try {
    overview.value = await DashboardAPI.getOverview();
  } finally {
    loading.value = false;
  }
}
function goToOrders() {
  void router.push("/redeem-orders");
}
onMounted(fetchOverview);
</script>
<style scoped lang="scss">
.dashboard__heading,
.dashboard__actions,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dashboard__heading {
  margin-bottom: 18px;
}
h1 {
  margin: 0 0 6px;
  font-size: 24px;
}
p,
.dashboard__time,
.metric-card__hint {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.dashboard__actions {
  gap: 12px;
}
.dashboard__metrics,
.dashboard__summary {
  margin-bottom: 16px;
}
.metric-card {
  height: 142px;
}
.metric-card__label {
  color: var(--el-text-color-secondary);
}
.metric-card__value {
  margin: 14px 0 8px;
  font-size: 32px;
  font-weight: 600;
}
.summary-card {
  min-height: 244px;
}
.status-row {
  display: grid;
  grid-template-columns: 58px 1fr 44px;
  gap: 12px;
  align-items: center;
  margin: 14px 0;
  color: var(--el-text-color-regular);
}
.status-row strong {
  text-align: right;
}
.fulfillment {
  display: flex;
  justify-content: space-around;
  padding: 30px 0 24px;
  text-align: center;
}
.fulfillment div {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--el-text-color-secondary);
}
.fulfillment strong {
  font-size: 32px;
}
.fulfillment__pending {
  color: var(--el-color-warning);
}
.fulfillment__shipped {
  color: var(--el-color-success);
}
.fulfillment__button {
  display: block;
  margin: 0 auto;
}
.dashboard__orders :deep(.el-card__header) {
  padding: 14px 20px;
}
@media (max-width: 768px) {
  .dashboard__heading {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
