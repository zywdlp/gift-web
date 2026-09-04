<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form :inline="true" :model="params">
        <el-form-item label="批次号">
          <el-input
            v-model="params.keywords"
            clearable
            placeholder="请输入批次号"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="page-content" shadow="never">
      <div class="page-toolbar">
        <el-button type="primary" @click="openGenerateDialog">生成卡密</el-button>
        <el-button class="page-icon-btn" :loading="loading" @click="fetchData">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
      <div class="page-table-wrapper">
        <el-table v-loading="loading" :data="list" border class="page-table" height="100%">
          <el-table-column prop="batchNo" label="批次号" min-width="260" />
          <el-table-column prop="quantity" label="生成数量" width="120" align="right" />
          <el-table-column prop="createTime" label="生成时间" width="180" />
          <el-table-column prop="operatorName" label="操作人" width="140" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" min-width="260" show-overflow-tooltip />
          <el-table-column label="操作" fixed="right" width="330">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="primary" @click="openCards(row)">查看卡号</el-button>
                <el-button link type="primary" @click="exportPrinting(row)">制卡文件</el-button>
                <el-button link type="primary" @click="exportQr(row)">二维码数据</el-button>
              </div>
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

    <el-dialog v-model="generateVisible" title="生成卡密" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="生成数量" prop="quantity">
          <el-input-number
            v-model="form.quantity"
            class="form-control"
            :min="1"
            :max="5000"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="generateVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="generate">确认生成</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="cardsVisible"
      :title="`${currentBatchNo} - 卡号`"
      width="1000px"
      class="cards-dialog"
      destroy-on-close
    >
      <el-form :inline="true" :model="cardParams" class="cards-search">
        <el-form-item label="卡号">
          <el-input
            v-model="cardParams.cardNo"
            clearable
            placeholder="请输入卡号"
            @keyup.enter="searchCards"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchCards">查询</el-button>
          <el-button @click="resetCardSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="cards-table-wrapper">
        <el-table v-loading="cardsLoading" :data="cards" border height="430">
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="cardNo" label="卡号" width="180" />
          <el-table-column prop="pin" label="PIN" width="100" />
          <el-table-column
            prop="qrToken"
            label="二维码 Token"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column prop="createTime" label="生成时间" width="180" />
        </el-table>
      </div>
      <div class="dialog-pagination">
        <el-pagination
          v-model:current-page="cardParams.pageNum"
          :page-size="cardParams.pageSize"
          :total="cardTotal"
          layout="total, prev, pager, next"
          @current-change="fetchCards"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import CardSecretAPI, {
  type CardSecretBatchItem,
  type CardSecretQueryParams,
  type GenerateCardSecretForm,
  type GiftCardItem,
} from "@/api/card-secret";
import { downloadBlob } from "@/utils/download";

defineOptions({ name: "GiftBatch" });
const loading = ref(false);
const generating = ref(false);
const generateVisible = ref(false);
const cardsVisible = ref(false);
const cardsLoading = ref(false);
const formRef = ref<FormInstance>();
const list = ref<CardSecretBatchItem[]>([]);
const total = ref(0);
const cards = ref<GiftCardItem[]>([]);
const cardTotal = ref(0);
const currentBatchId = ref("");
const currentBatchNo = ref("");
const params = reactive<CardSecretQueryParams>({ pageNum: 1, pageSize: 10, keywords: "" });
const cardParams = reactive({ pageNum: 1, pageSize: 20, cardNo: "" });
const form = reactive<GenerateCardSecretForm>({ requestId: "", quantity: 100, remark: "" });
const rules: FormRules<GenerateCardSecretForm> = {
  quantity: [{ required: true, message: "请输入生成数量", trigger: "change" }],
};

async function fetchData() {
  loading.value = true;
  try {
    const result = await CardSecretAPI.getPage(params);
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
  params.keywords = "";
  search();
}
function sizeChange() {
  params.pageNum = 1;
  void fetchData();
}
function openGenerateDialog() {
  form.requestId = crypto.randomUUID();
  form.quantity = 100;
  form.remark = "";
  generateVisible.value = true;
}
async function generate() {
  if (
    !(await formRef.value?.validate().then(
      () => true,
      () => false
    ))
  )
    return;
  generating.value = true;
  try {
    await CardSecretAPI.generate(form);
    ElMessage.success("卡密生成成功");
    generateVisible.value = false;
    await fetchData();
  } finally {
    generating.value = false;
  }
}
function openCards(row: CardSecretBatchItem) {
  currentBatchId.value = row.id;
  currentBatchNo.value = row.batchNo;
  cardParams.pageNum = 1;
  cardParams.cardNo = "";
  cardsVisible.value = true;
  void fetchCards();
}
function searchCards() {
  cardParams.pageNum = 1;
  void fetchCards();
}
function resetCardSearch() {
  cardParams.cardNo = "";
  searchCards();
}
async function fetchCards() {
  if (!currentBatchId.value) return;
  cardsLoading.value = true;
  try {
    const result = await CardSecretAPI.getCards(currentBatchId.value, cardParams);
    cards.value = result.list || [];
    cardTotal.value = result.total || 0;
  } finally {
    cardsLoading.value = false;
  }
}
async function exportPrinting(row: CardSecretBatchItem) {
  try {
    await ElMessageBox.confirm(
      `确认导出批次“${row.batchNo}”的制卡文件吗？文件包含 PIN 明文。`,
      "导出确认",
      { type: "warning" }
    );
    downloadBlob(await CardSecretAPI.exportPrinting(row.id), `${row.batchNo}-制卡文件.xlsx`);
  } catch {
    /* 取消时不提示 */
  }
}
async function exportQr(row: CardSecretBatchItem) {
  try {
    await ElMessageBox.confirm(`确认导出批次“${row.batchNo}”的二维码数据吗？`, "导出确认", {
      type: "warning",
    });
    downloadBlob(await CardSecretAPI.exportQr(row.id), `${row.batchNo}-二维码数据.xlsx`);
  } catch {
    /* 取消时不提示 */
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
.pagination-wrapper,
.dialog-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
.table-actions {
  display: flex;
  gap: 14px;
  align-items: center;
  white-space: nowrap;
}
.cards-table-wrapper {
  overflow: auto;
}
.cards-search {
  margin-bottom: 12px;
}
.form-control {
  width: 100%;
}
:deep(.cards-dialog) {
  max-width: calc(100vw - 48px);
}
</style>
