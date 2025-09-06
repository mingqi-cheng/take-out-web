<template>
  <div class="system-status-page">
    <div class="container mx-auto px-4 py-6">
      <el-card class="status-card">
        <template #header>
          <div class="card-header">
            <h2>🔍 系统状态监控</h2>
            <el-button @click="refreshStatus" :loading="checking">刷新状态</el-button>
          </div>
        </template>
        
        <!-- 后端服务状态 -->
        <div class="status-section">
          <h3>🌐 后端服务状态</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="metric-card" :class="{ 'healthy': status.isHealthy, 'unhealthy': !status.isHealthy }">
                <div class="metric-content">
                  <div class="metric-icon">
                    {{ status.isHealthy ? '✅' : '❌' }}
                  </div>
                  <div class="metric-info">
                    <div class="metric-title">服务状态</div>
                    <div class="metric-value">{{ status.isHealthy ? '运行正常' : '服务不可用' }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="metric-card">
                <div class="metric-content">
                  <div class="metric-icon">🔗</div>
                  <div class="metric-info">
                    <div class="metric-title">API地址</div>
                    <div class="metric-value">{{ status.baseURL }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" class="mt-4">
            <el-col :span="12">
              <el-card class="metric-card">
                <div class="metric-content">
                  <div class="metric-icon">⏰</div>
                  <div class="metric-info">
                    <div class="metric-title">最后检查</div>
                    <div class="metric-value">{{ formatTime(status.lastCheck) }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="metric-card" :class="{ 'mock-enabled': status.mockEnabled }">
                <div class="metric-content">
                  <div class="metric-icon">{{ status.mockEnabled ? '🔄' : '🚫' }}</div>
                  <div class="metric-info">
                    <div class="metric-title">模拟数据</div>
                    <div class="metric-value">{{ status.mockEnabled ? '已启用' : '已禁用' }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <!-- 数据获取状态 -->
        <div class="status-section">
          <h3>📊 数据获取状态</h3>
          <el-table :data="dataStatus" stripe>
            <el-table-column prop="module" label="模块" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : row.status === 'mock' ? 'warning' : 'danger'">
                  {{ row.status === 'success' ? '后端数据' : row.status === 'mock' ? '模拟数据' : '获取失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastUpdate" label="最后更新" />
            <el-table-column prop="count" label="数据量" />
          </el-table>
        </div>
        
        <!-- 系统建议 -->
        <div class="status-section">
          <h3>💡 系统建议</h3>
          <div v-if="!status.isHealthy" class="suggestions">
            <el-alert title="后端服务不可用" type="warning" :closable="false">
              <template #default>
                <div class="suggestion-list">
                  <p>请检查以下事项：</p>
                  <ul>
                    <li>确保后端服务已启动并运行在: <code>{{ status.baseURL }}</code></li>
                    <li>检查网络连接状态</li>
                    <li>验证Spring Boot应用是否正常启动</li>
                    <li>检查端口是否被占用或防火墙设置</li>
                  </ul>
                  <p v-if="!status.mockEnabled" style="color: #e6a23c; margin-top: 10px;">
                    💡 如需继续开发，可以设置环境变量 <code>VITE_ENABLE_MOCK=true</code> 启用模拟数据模式
                  </p>
                </div>
              </template>
            </el-alert>
          </div>
          <div v-else class="suggestions">
            <el-alert title="系统运行正常" type="success" :closable="false">
              <p>所有数据都将从后端API获取，系统运行状态良好。</p>
            </el-alert>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { backendService } from '../utils/backendService.js';

const store = useStore();
const checking = ref(false);

// 系统状态
const status = reactive({
  isHealthy: false,
  lastCheck: null,
  baseURL: '',
  mockEnabled: false
});

// 数据状态
const dataStatus = ref([
  { module: '商家数据', status: 'unknown', lastUpdate: '-', count: 0 },
  { module: '菜品数据', status: 'unknown', lastUpdate: '-', count: 0 },
  { module: '分类数据', status: 'unknown', lastUpdate: '-', count: 0 },
  { module: '地址数据', status: 'unknown', lastUpdate: '-', count: 0 }
]);

// 格式化时间
const formatTime = (time) => {
  if (!time) return '从未检查';
  return new Date(time).toLocaleString('zh-CN');
};

// 刷新状态
const refreshStatus = async () => {
  checking.value = true;
  try {
    // 获取后端服务状态
    const serviceStatus = backendService.getStatus();
    Object.assign(status, serviceStatus);
    
    // 检查各模块数据状态
    await checkDataModules();
  } catch (error) {
    console.error('刷新状态失败:', error);
  } finally {
    checking.value = false;
  }
};

// 检查数据模块状态
const checkDataModules = async () => {
  // 检查商家数据
  try {
    await store.dispatch('merchant/fetchActiveMerchants');
    const merchants = store.state.merchant.merchantList;
    dataStatus.value[0] = {
      module: '商家数据',
      status: 'success',
      lastUpdate: formatTime(new Date()),
      count: `${merchants.length} 个商家`
    };
  } catch (error) {
    dataStatus.value[0] = {
      module: '商家数据',
      status: status.mockEnabled ? 'mock' : 'error',
      lastUpdate: formatTime(new Date()),
      count: '获取失败'
    };
  }
  
  // 检查菜品数据
  try {
    await store.dispatch('dish/fetchDishList');
    const dishes = store.state.dish.dishList;
    dataStatus.value[1] = {
      module: '菜品数据',
      status: 'success',
      lastUpdate: formatTime(new Date()),
      count: `${dishes.length} 个菜品`
    };
  } catch (error) {
    dataStatus.value[1] = {
      module: '菜品数据',
      status: status.mockEnabled ? 'mock' : 'error',
      lastUpdate: formatTime(new Date()),
      count: '获取失败'
    };
  }
};

// 组件挂载时刷新状态
onMounted(() => {
  refreshStatus();
});
</script>

<style scoped>
.system-status-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.status-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.status-section {
  margin-bottom: 32px;
}

.status-section h3 {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 16px;
}

.metric-card {
  height: 100px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.metric-card.healthy {
  border-left: 4px solid #67c23a;
}

.metric-card.unhealthy {
  border-left: 4px solid #f56c6c;
}

.metric-card.mock-enabled {
  border-left: 4px solid #e6a23c;
}

.metric-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.metric-icon {
  font-size: 24px;
  margin-right: 16px;
}

.metric-info {
  flex: 1;
}

.metric-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  word-break: break-all;
}

.suggestions {
  margin-top: 16px;
}

.suggestion-list ul {
  margin: 8px 0;
  padding-left: 20px;
}

.suggestion-list li {
  margin: 4px 0;
}

.suggestion-list code {
  background: #f4f4f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.mt-4 {
  margin-top: 16px;
}
</style>