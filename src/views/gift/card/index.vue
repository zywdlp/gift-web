<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form :inline="true" :model="params">
        <el-form-item label="卡号">
          <el-input
            v-model="params.cardNo"
            clearable
            placeholder="请输入卡号"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="批次号">
          <el-input
            v-model="params.batchNo"
            clearable
            placeholder="请输入批次号"
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
            <el-option label="未绑定" value="UNBOUND" />
            <el-option label="可兑换" value="ACTIVE" />
            <el-option label="已过期" value="EXPIRED" />
            <el-option label="已兑换" value="REDEEMED" />
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
        <el-button type="primary" :disabled="!selectedCards.length" @click="openBindDialog()">
          绑定商品
        </el-button>
        <el-button class="page-icon-btn" :loading="loading" @click="fetchData">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
      <div class="page-table-wrapper">
        <el-table
          v-loading="loading"
          :data="list"
          border
          class="page-table"
          height="100%"
          @selection-change="selectedCards = $event"
        >
          <el-table-column type="selection" width="52" :selectable="canBind" />
          <el-table-column prop="cardNo" label="卡号" width="180" />
          <el-table-column prop="batchNo" label="批次号" min-width="210" />
          <el-table-column label="商品主图" width="100" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.productCoverImage"
                :src="row.productCoverImage"
                fit="cover"
                class="product-cover-image"
                :preview-src-list="[row.productCoverImage]"
                preview-teleported
              />
              <span v-else class="empty-product-image">暂无</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="productName"
            label="当前商品"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="statusType(row.displayStatus || row.status)">
                {{ statusLabel(row.displayStatus || row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="expiryAt" label="有效期" width="180" />
          <el-table-column prop="boundAt" label="绑定时间" width="180" />
          <el-table-column label="操作" fixed="right" width="110">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                :disabled="!canBind(row)"
                @click="openBindDialog([row])"
              >
                绑定商品
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
    <el-dialog
      v-model="bindVisible"
      title="绑定商品"
      width="500px"
      destroy-on-close
      @closed="resetBindForm"
    >
      <el-alert
        :title="`本次将绑定 ${bindForm.cardIds.length} 张礼品卡`"
        type="info"
        :closable="false"
        class="bind-count"
      />
      <el-form ref="bindFormRef" :model="bindForm" :rules="rules" label-width="88px">
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="bindForm.productId"
            filterable
            placeholder="请选择商品"
            class="form-control"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期" prop="expiryAt">
          <el-date-picker
            v-model="bindForm.expiryAt"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="请选择兑换截止时间"
            class="form-control"
            :disabled-date="disabledPastDate"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="bindForm.remark"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindVisible = false">取消</el-button>
        <el-button type="primary" :loading="binding" @click="bindProducts">确认绑定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import CardSecretAPI, {
  type BindGiftCardsForm,
  type GiftCardItem,
  type GiftCardQueryParams,
} from "@/api/card-secret";
import ProductAPI, { type ProductItem } from "@/api/product";
defineOptions({ name: "GiftCard" });
const loading = ref(false);
const binding = ref(false);
const bindVisible = ref(false);
const bindFormRef = ref<FormInstance>();
const list = ref<GiftCardItem[]>([]);
const selectedCards = ref<GiftCardItem[]>([]);
const products = ref<ProductItem[]>([]);
const total = ref(0);
const params = reactive<GiftCardQueryParams>({
  pageNum: 1,
  pageSize: 10,
  cardNo: "",
  batchNo: "",
  productName: "",
});
const bindForm = reactive<BindGiftCardsForm>({
  cardIds: [],
  productId: "",
  expiryAt: "",
  remark: "",
});
const rules: FormRules<BindGiftCardsForm> = {
  productId: [{ required: true, message: "请选择商品", trigger: "change" }],
  expiryAt: [{ required: true, message: "请选择有效期", trigger: "change" }],
};
function canBind(row: GiftCardItem) {
  return row.status === "UNBOUND" && !row.productId;
}
function statusLabel(status?: GiftCardItem["displayStatus"]) {
  const labels: Record<string, string> = {
    UNBOUND: "未绑定",
    ACTIVE: "可兑换",
    EXPIRED: "已过期",
    REDEEMED: "已兑换",
  };
  return labels[status || ""] || "-";
}
function statusType(status?: GiftCardItem["displayStatus"]) {
  const types: Record<string, "success" | "warning" | "info"> = {
    ACTIVE: "success",
    EXPIRED: "warning",
    REDEEMED: "info",
    UNBOUND: "info",
  };
  return types[status || ""] || "info";
}
function disabledPastDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}
async function fetchData() {
  loading.value = true;
  try {
    const result = await CardSecretAPI.getGiftCardPage(params);
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
  Object.assign(params, { cardNo: "", batchNo: "", productName: "", status: undefined });
  search();
}
function sizeChange() {
  params.pageNum = 1;
  void fetchData();
}
async function openBindDialog(cards = selectedCards.value) {
  bindForm.cardIds = cards.map((card) => card.id);
  bindVisible.value = true;
  if (!products.value.length) {
    const result = await ProductAPI.getPage({ pageNum: 1, pageSize: 100 });
    products.value = result.list || [];
  }
}
function resetBindForm() {
  bindForm.cardIds = [];
  bindForm.productId = "";
  bindForm.expiryAt = "";
  bindForm.remark = "";
}
async function bindProducts() {
  if (
    !(await bindFormRef.value?.validate().then(
      () => true,
      () => false
    ))
  )
    return;
  binding.value = true;
  try {
    const result = await CardSecretAPI.bindGiftCards(bindForm);
    ElMessage.success(`已成功绑定 ${result.count} 张礼品卡`);
    bindVisible.value = false;
    selectedCards.value = [];
    await fetchData();
  } finally {
    binding.value = false;
  }
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
.form-control {
  width: 100%;
}
:deep(.el-date-editor.form-control) {
  width: 100%;
}
.bind-count {
  margin-bottom: 18px;
}
.product-cover-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}
.empty-product-image {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
