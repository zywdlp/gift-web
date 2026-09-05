<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form :inline="true" :model="params">
        <el-form-item label="订单号">
          <el-input
            v-model="params.orderNo"
            clearable
            placeholder="请输入订单号"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="兑换卡号">
          <el-input
            v-model="params.cardNo"
            clearable
            placeholder="请输入兑换卡号"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="兑换人手机">
          <el-input
            v-model="params.redeemerPhone"
            clearable
            placeholder="请输入手机号"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="商品">
          <el-input
            v-model="params.productName"
            clearable
            placeholder="请输入商品名称"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="params.status" clearable placeholder="全部" style="width: 120px">
            <el-option label="待发货" value="PENDING_SHIPMENT" />
            <el-option label="已发货" value="SHIPPED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="page-content" shadow="never">
      <div class="page-toolbar">
        <span>订单列表</span>
        <el-button class="page-icon-btn" :loading="loading" @click="fetchData">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
      <div class="page-table-wrapper">
        <el-table v-loading="loading" :data="list" border class="page-table" height="100%">
          <el-table-column prop="orderNo" label="订单号" width="210" />
          <el-table-column prop="cardNo" label="兑换卡号" width="180" />
          <el-table-column prop="redeemerPhone" label="兑换人手机" width="130" />
          <el-table-column prop="productName" label="商品" min-width="140" />
          <el-table-column prop="recipient" label="收件人" width="100" />
          <el-table-column prop="phone" label="收货手机" width="130" />
          <el-table-column prop="address" label="收货地址" min-width="220" show-overflow-tooltip />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'SHIPPED' ? 'success' : 'warning'">
                {{ row.status === "SHIPPED" ? "已发货" : "待发货" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="兑换时间" width="180" />
          <el-table-column label="操作" fixed="right" width="110">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                :disabled="row.status === 'SHIPPED'"
                @click="confirmShip(row)"
              >
                确认发货
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="params.pageNum"
          v-model:page-size="params.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchData"
          @size-change="sizeChange"
        />
      </div>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import RedeemOrderAPI, {
  type RedeemOrderItem,
  type RedeemOrderQueryParams,
} from "@/api/redeem-order";
defineOptions({ name: "GiftOrder" });
const loading = ref(false);
const list = ref<RedeemOrderItem[]>([]);
const total = ref(0);
const params = reactive<RedeemOrderQueryParams>({
  pageNum: 1,
  pageSize: 10,
  orderNo: "",
  cardNo: "",
  redeemerPhone: "",
  productName: "",
});
async function fetchData() {
  loading.value = true;
  try {
    const result = await RedeemOrderAPI.getPage(params);
    list.value = result.list || [];
    total.value = result.total || 0;
  } finally {
    loading.value = false;
  }
}
function search() {
  params.pageNum = 1;
  void fetchData();
}
function reset() {
  Object.assign(params, {
    orderNo: "",
    cardNo: "",
    redeemerPhone: "",
    productName: "",
    status: undefined,
  });
  search();
}
function sizeChange() {
  params.pageNum = 1;
  void fetchData();
}
async function confirmShip(tableRow: unknown) {
  const row = tableRow as RedeemOrderItem;
  await ElMessageBox.confirm(`确认订单 ${row.orderNo} 已发货？`, "确认发货", { type: "warning" });
  await RedeemOrderAPI.ship(row.orderNo);
  ElMessage.success("已确认发货");
  await fetchData();
}
onMounted(fetchData);
</script>
<style scoped lang="scss">
.page-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
</style>
