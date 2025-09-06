<template>
  <div class="dish-test-page">
    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <span>菜品API测试</span>
        </div>
      </template>
      
      <div class="test-content">
        <el-button type="primary" @click="testDishAPI" :loading="loading">
          测试菜品API访问
        </el-button>
        
        <div class="result-section mt-4" v-if="result">
          <el-text>测试结果：</el-text>
          <pre>{{ result }}</pre>
        </div>
        
        <div class="error-section mt-4" v-if="error">
          <el-text type="danger">错误信息：</el-text>
          <pre>{{ error }}</pre>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { dishAPI } from '../api/index.js';

const loading = ref(false);
const result = ref(null);
const error = ref(null);

const testDishAPI = async () => {
  loading.value = true;
  result.value = null;
  error.value = null;
  
  try {
    console.log('开始测试菜品API访问...');
    const response = await dishAPI.getDishList();
    result.value = JSON.stringify(response, null, 2);
    console.log('菜品API访问成功:', response);
  } catch (err) {
    error.value = JSON.stringify(err, null, 2);
    console.error('菜品API访问失败:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.dish-test-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.test-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.test-content {
  padding: 20px 0;
}

.result-section pre,
.error-section pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}
</style>