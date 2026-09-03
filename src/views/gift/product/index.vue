<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="商品名称">
          <el-input
            v-model="queryParams.keywords"
            clearable
            placeholder="商品名称或简称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="page-content" shadow="never">
      <div class="page-toolbar">
        <el-button type="primary" @click="openDialog()">新增商品</el-button>
        <el-button class="page-icon-btn" @click="fetchData">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
      <div class="page-table-wrapper">
        <el-table v-loading="loading" :data="list" border class="page-table" height="100%">
          <el-table-column label="主图" width="100" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.coverImage"
                :src="imageUrl(row.coverImage)"
                fit="cover"
                class="cover-image"
                :preview-src-list="[imageUrl(row.coverImage)]"
                preview-teleported
              />
              <span v-else class="empty-image">暂无</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品名称" min-width="180" />
          <el-table-column prop="shortName" label="商品简称" min-width="140" />
          <el-table-column label="参考价值" width="130" align="right">
            <template #default="{ row }">
              {{ row.referenceValue == null ? "-" : `¥${row.referenceValue}` }}
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="180" />
          <el-table-column label="操作" fixed="right" width="160">
            <template #default="{ row }">
              <el-button link type="primary" @click="openDialog(row.id)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchData"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑商品' : '新增商品'"
      width="760px"
      class="product-dialog"
      destroy-on-close
      @closed="resetDialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="商品简称">
          <el-input v-model="form.shortName" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="参考价值">
          <el-input-number
            v-model="form.referenceValue"
            :min="0"
            :precision="2"
            :step="1"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="商品主图">
          <el-upload
            :http-request="uploadCover"
            :show-file-list="false"
            accept="image/jpeg,image/png,image/webp,image/gif"
          >
            <el-image
              v-if="form.coverImage"
              :src="imageUrl(form.coverImage)"
              fit="cover"
              class="upload-image"
            />
            <el-button v-else>上传主图</el-button>
          </el-upload>
          <el-button
            v-if="form.coverImage"
            link
            type="danger"
            class="remove-cover"
            @click="removeCover"
          >
            删除
          </el-button>
          <div class="form-tip">支持 JPG、PNG、WebP、GIF，单张不超过 5MB</div>
        </el-form-item>
        <el-form-item label="详情图片">
          <el-upload
            v-model:file-list="detailFileList"
            :http-request="uploadDetail"
            list-type="picture-card"
            accept="image/jpeg,image/png,image/webp,image/gif"
            :limit="10"
            :on-remove="removeDetail"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品详情">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="配送范围">
          <el-input
            v-model="form.deliveryScope"
            type="textarea"
            :rows="2"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="售后说明">
          <el-input
            v-model="form.afterSales"
            type="textarea"
            :rows="2"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
  type UploadRequestOptions,
  type UploadUserFile,
} from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import ProductAPI, {
  type ProductForm,
  type ProductItem,
  type ProductQueryParams,
} from "@/api/product";

defineOptions({ name: "GiftProduct" });

const loading = ref(false);
const submitting = ref(false);
const list = ref<ProductItem[]>([]);
const total = ref(0);
const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const detailFileList = ref<UploadUserFile[]>([]);
const uploadedDuringEdit = new Set<string>();
let saved = false;
const queryParams = reactive<ProductQueryParams>({ pageNum: 1, pageSize: 10, keywords: "" });
const form = reactive<ProductForm>({
  name: "",
  shortName: "",
  coverImage: "",
  detailImages: [],
  referenceValue: undefined,
  description: "",
  deliveryScope: "",
  afterSales: "",
});
const rules: FormRules<ProductForm> = {
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
};

function imageUrl(url: string) {
  return url;
}
async function fetchData() {
  loading.value = true;
  try {
    const result = await ProductAPI.getPage(queryParams);
    list.value = result.list;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}
function handleReset() {
  queryParams.keywords = "";
  handleQuery();
}
function handleSizeChange() {
  queryParams.pageNum = 1;
  fetchData();
}
function resetForm() {
  Object.assign(form, {
    id: undefined,
    name: "",
    shortName: "",
    coverImage: "",
    detailImages: [],
    referenceValue: undefined,
    description: "",
    deliveryScope: "",
    afterSales: "",
  });
  detailFileList.value = [];
  uploadedDuringEdit.clear();
  saved = false;
  formRef.value?.clearValidate();
}
async function openDialog(id?: string) {
  resetForm();
  if (id) {
    const data = await ProductAPI.getFormData(id);
    Object.assign(form, data, { detailImages: data.detailImages || [] });
    detailFileList.value = (data.detailImages || []).map((url) => ({
      name: url.split("/").pop() || "图片",
      url,
    }));
  }
  dialogVisible.value = true;
}
async function uploadCover(options: UploadRequestOptions) {
  try {
    const result = await ProductAPI.uploadImage(options.file);
    form.coverImage = result.url;
    uploadedDuringEdit.add(result.url);
    options.onSuccess(result);
  } catch (error) {
    options.onError(error as Error);
  }
}
async function uploadDetail(options: UploadRequestOptions) {
  try {
    const result = await ProductAPI.uploadImage(options.file);
    form.detailImages = [...(form.detailImages || []), result.url];
    uploadedDuringEdit.add(result.url);
    options.onSuccess(result);
  } catch (error) {
    options.onError(error as Error);
  }
}
function removeCover() {
  form.coverImage = "";
}
function removeDetail(file: UploadUserFile) {
  const url = file.url;
  if (!url) return;
  form.detailImages = (form.detailImages || []).filter((item) => item !== url);
}
async function handleSubmit() {
  const valid = await formRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;
  submitting.value = true;
  try {
    if (form.id) await ProductAPI.update(form.id, form);
    else await ProductAPI.create(form);
    saved = true;
    ElMessage.success("保存成功");
    dialogVisible.value = false;
    fetchData();
  } finally {
    submitting.value = false;
  }
}
async function resetDialog() {
  if (!saved) await Promise.all([...uploadedDuringEdit].map((url) => ProductAPI.deleteImage(url)));
  resetForm();
}
async function handleDelete(row: ProductItem) {
  try {
    await ElMessageBox.confirm(`确认删除商品“${row.name}”吗？`, "提示", { type: "warning" });
  } catch {
    return;
  }
  await ProductAPI.delete(row.id);
  ElMessage.success("删除成功");
  fetchData();
}
onMounted(fetchData);
</script>

<style scoped lang="scss">
.page-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.cover-image,
.upload-image {
  width: 64px;
  height: 64px;
  border-radius: 4px;
}
.upload-image {
  width: 100px;
  height: 100px;
}
.empty-image,
.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.remove-cover {
  margin-left: 12px;
}
.form-tip {
  margin-left: 12px;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
:deep(.product-dialog) {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 64px);
  margin: 32px auto;
}
:deep(.product-dialog .el-dialog__body) {
  min-height: 0;
  overflow-y: auto;
}
</style>
