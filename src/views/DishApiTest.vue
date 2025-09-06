<template>
  <div class="dish-api-test">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold mb-6">菜品API测试</h1>
      
      <el-card class="mb-6">
        <h3 class="text-lg font-semibold mb-3">测试参数</h3>
        <div class="flex items-center gap-4">
          <el-input 
            v-model="merchantId" 
            placeholder="商家ID" 
            style="width: 200px"
          />
          <el-button 
            type="primary" 
            @click="testDishApi" 
            :loading="loading"
          >
            测试菜品API
          </el-button>
        </div>
      </el-card>
      
      <el-card>
        <h3 class="text-lg font-semibold mb-3">测试结果</h3>
        <div v-if="loading">
          <el-spinner />
          <p>正在测试...</p>
        </div>
        <div v-else-if="result">
          <pre class="bg-gray-100 p-4 rounded max-h-96 overflow-auto">{{ result }}</pre>
        </div>
        <div v-else>
          <p>点击按钮开始测试</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const merchantId = ref('1');
const loading = ref(false);
const result = ref(null);

const testDishApi = async () => {
  loading.value = true;
  result.value = null;
  
  try {
    // 直接调用API测试
    const response = await axios.get(`http://localhost:8080/api/dishes?merchantId=${merchantId.value}`);
    result.value = JSON.stringify(response.data, null, 2);
  } catch (error) {
    result.value = `API调用失败: ${error.message}\n${JSON.stringify(error.response?.data || {}, null, 2)}`;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.dish-api-test {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>