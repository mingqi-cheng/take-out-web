<template>
  <div class="dish-debug-page">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold mb-6">菜品数据调试页面</h1>
      
      <!-- 商家选择 -->
      <div class="mb-6">
        <el-select 
          v-model="selectedMerchantId" 
          placeholder="请选择商家" 
          @change="fetchDishes"
          clearable
        >
          <el-option
            v-for="merchant in merchants"
            :key="merchant.id"
            :label="merchant.name"
            :value="merchant.id"
          />
        </el-select>
        <el-button 
          type="primary" 
          @click="fetchMerchants" 
          class="ml-2"
          :loading="merchantLoading"
        >
          刷新商家列表
        </el-button>
      </div>
      
      <!-- 调试信息 -->
      <el-card class="mb-6">
        <h3 class="text-lg font-semibold mb-3">调试信息</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>选中商家ID:</strong> {{ selectedMerchantId }}</p>
            <p><strong>菜品列表长度:</strong> {{ dishList.length }}</p>
            <p><strong>加载状态:</strong> {{ loading ? '加载中' : '空闲' }}</p>
            <p><strong>错误信息:</strong> {{ error || '无' }}</p>
          </div>
          <div>
            <p><strong>商家列表长度:</strong> {{ merchants.length }}</p>
            <p><strong>商家加载状态:</strong> {{ merchantLoading ? '加载中' : '空闲' }}</p>
          </div>
        </div>
      </el-card>
      
      <!-- 菜品数据展示 -->
      <el-card>
        <h3 class="text-lg font-semibold mb-3">菜品数据</h3>
        <div v-if="loading" class="text-center py-8">
          <el-spinner size="large" />
          <p class="mt-2">正在加载菜品数据...</p>
        </div>
        <div v-else-if="error" class="text-center py-8 text-red-500">
          <p>加载失败: {{ error }}</p>
        </div>
        <div v-else-if="dishList.length === 0" class="text-center py-8">
          <p>暂无菜品数据</p>
        </div>
        <div v-else>
          <el-table :data="dishList" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="categoryName" label="分类" />
            <el-table-column prop="price" label="价格" />
            <el-table-column prop="stock" label="库存" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '上架' : '下架' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      
      <!-- 原始数据展示 -->
      <el-card class="mt-6">
        <h3 class="text-lg font-semibold mb-3">原始菜品数据</h3>
        <pre class="bg-gray-100 p-4 rounded max-h-96 overflow-auto">{{ JSON.stringify(dishList, null, 2) }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';

const store = useStore();

// 响应式数据
const selectedMerchantId = ref(null);

// 计算属性
const dishList = computed(() => store.state.dish.dishList);
const loading = computed(() => store.state.dish.loading);
const error = computed(() => store.state.dish.error);
const merchants = computed(() => store.state.merchant.merchantList);
const merchantLoading = computed(() => store.state.merchant.loading);

// 获取商家列表
const fetchMerchants = async () => {
  try {
    await store.dispatch('merchant/fetchActiveMerchants');
    ElMessage.success('商家列表刷新成功');
  } catch (err) {
    ElMessage.error('获取商家列表失败: ' + err.message);
    console.error('获取商家列表失败:', err);
  }
};

// 获取菜品列表
const fetchDishes = async (merchantId) => {
  if (!merchantId) {
    store.commit('dish/SET_DISH_LIST', []);
    return;
  }
  
  try {
    await store.dispatch('dish/fetchDishList', { merchantId });
    ElMessage.success('菜品数据获取成功');
  } catch (err) {
    ElMessage.error('获取菜品数据失败: ' + err.message);
    console.error('获取菜品数据失败:', err);
  }
};

// 组件挂载时加载商家列表
onMounted(() => {
  fetchMerchants();
});
</script>

<style scoped>
.dish-debug-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>