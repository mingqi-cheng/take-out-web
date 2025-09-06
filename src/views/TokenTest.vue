<template>
  <div class="token-test">
    <el-container>
      <el-header height="60px" class="test-header">
        <div class="header-content">
          <h1>🔐 Token携带测试</h1>
          <el-button type="primary" @click="goToLogin" v-if="!isAuthenticated">前往登录</el-button>
        </div>
      </el-header>

      <el-main>
        <div class="test-content">
          <el-card class="test-card">
            <template #header>
              <h3>Token状态</h3>
            </template>
            
            <el-descriptions :column="1" border>
              <el-descriptions-item label="认证状态">
                <el-tag :type="isAuthenticated ? 'success' : 'danger'">
                  {{ isAuthenticated ? '已认证' : '未认证' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Token" v-if="hasToken">
                <div class="token-display">
                  <span>{{ tokenPreview }}</span>
                  <el-button size="small" @click="copyToken">复制</el-button>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="过期时间" v-if="hasToken">
                {{ expiresAt }}
              </el-descriptions-item>
              <el-descriptions-item label="用户信息" v-if="userInfo">
                <div>
                  <div>用户名: {{ userInfo.username }}</div>
                  <div>昵称: {{ userInfo.nickname }}</div>
                  <div>角色: {{ userRoleText }}</div>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card class="test-card" style="margin-top: 20px;">
            <template #header>
              <h3>API测试</h3>
            </template>
            
            <div class="api-test-section">
              <h4>公开API（不需要Token）</h4>
              <div class="test-buttons">
                <el-button 
                  @click="testPublicAPI" 
                  :loading="publicAPILoading"
                  type="info"
                >
                  测试获取活跃商家
                </el-button>
              </div>
              <div class="test-result" v-if="publicAPIResult">
                <el-alert 
                  :title="publicAPIResult.title" 
                  :type="publicAPIResult.type" 
                  :description="publicAPIResult.description"
                  :closable="false"
                />
              </div>

              <h4>受保护API（需要Token）</h4>
              <div class="test-buttons">
                <el-button 
                  @click="testProtectedAPI" 
                  :loading="protectedAPILoading"
                  type="warning"
                  :disabled="!isAuthenticated"
                >
                  测试获取用户信息
                </el-button>
                <el-button 
                  @click="testCartAPI" 
                  :loading="cartAPILoading"
                  type="success"
                  :disabled="!isAuthenticated"
                >
                  测试购物车操作
                </el-button>
              </div>
              <div class="test-result" v-if="protectedAPIResult">
                <el-alert 
                  :title="protectedAPIResult.title" 
                  :type="protectedAPIResult.type" 
                  :description="protectedAPIResult.description"
                  :closable="false"
                />
              </div>
            </div>
          </el-card>

          <el-card class="test-card" style="margin-top: 20px;">
            <template #header>
              <h3>请求日志</h3>
            </template>
            
            <div class="log-section">
              <el-button @click="clearLogs" size="small">清空日志</el-button>
              <div class="logs" ref="logContainer">
                <div 
                  v-for="(log, index) in logs" 
                  :key="index" 
                  :class="['log-item', log.type]"
                >
                  <span class="timestamp">[{{ log.timestamp }}]</span>
                  <span class="message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { merchantAPI, userAPI, cartAPI } from '../api/index.js';

const store = useStore();
const router = useRouter();

const publicAPILoading = ref(false);
const protectedAPILoading = ref(false);
const cartAPILoading = ref(false);
const publicAPIResult = ref(null);
const protectedAPIResult = ref(null);
const logs = ref([]);

const logContainer = ref(null);

// 计算属性
const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
const userInfo = computed(() => store.state.user.userInfo);
const hasToken = computed(() => !!store.state.user.token);
const token = computed(() => store.state.user.token);
const tokenExpires = computed(() => store.state.user.tokenExpires);

const userRoleText = computed(() => store.getters['user/userRoleText']);
const tokenPreview = computed(() => {
  if (!token.value) return '无';
  return token.value.substring(0, 20) + '...';
});
const expiresAt = computed(() => {
  if (!tokenExpires.value) return '无';
  return new Date(parseInt(tokenExpires.value)).toLocaleString();
});

// 方法
const goToLogin = () => {
  router.push('/auth/login');
};

const copyToken = async () => {
  if (!token.value) {
    ElMessage.warning('没有可复制的Token');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(token.value);
    ElMessage.success('Token已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败: ' + error.message);
  }
};

const addLog = (message, type = 'info') => {
  const now = new Date();
  const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  
  logs.value.push({
    timestamp,
    message,
    type
  });
  
  // 滚动到底部
  setTimeout(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  }, 100);
};

const clearLogs = () => {
  logs.value = [];
};

const testPublicAPI = async () => {
  publicAPILoading.value = true;
  addLog('开始测试公开API - 获取活跃商家', 'info');
  
  try {
    const response = await merchantAPI.getActiveMerchants();
    addLog(`公开API调用成功，返回 ${response.data?.length || 0} 个商家`, 'success');
    
    publicAPIResult.value = {
      title: '公开API调用成功',
      type: 'success',
      description: `获取到 ${response.data?.length || 0} 个活跃商家`
    };
    
    ElMessage.success('公开API测试成功');
  } catch (error) {
    addLog(`公开API调用失败: ${error.message}`, 'error');
    
    publicAPIResult.value = {
      title: '公开API调用失败',
      type: 'error',
      description: error.message
    };
    
    ElMessage.error('公开API测试失败');
  } finally {
    publicAPILoading.value = false;
  }
};

const testProtectedAPI = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录');
    return;
  }
  
  protectedAPILoading.value = true;
  addLog('开始测试受保护API - 获取用户信息', 'info');
  
  try {
    const response = await userAPI.getUserInfo(userInfo.value.id);
    addLog('受保护API调用成功，已获取用户信息', 'success');
    
    protectedAPIResult.value = {
      title: '受保护API调用成功',
      type: 'success',
      description: `用户信息获取成功: ${response.data?.nickname || response.data?.username}`
    };
    
    ElMessage.success('受保护API测试成功');
  } catch (error) {
    addLog(`受保护API调用失败: ${error.message}`, 'error');
    
    protectedAPIResult.value = {
      title: '受保护API调用失败',
      type: 'error',
      description: error.message
    };
    
    ElMessage.error('受保护API测试失败');
  } finally {
    protectedAPILoading.value = false;
  }
};

const testCartAPI = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录');
    return;
  }
  
  cartAPILoading.value = true;
  addLog('开始测试购物车API', 'info');
  
  try {
    // 尝试获取购物车数据
    const response = await cartAPI.getCart();
    addLog('购物车API调用成功', 'success');
    
    ElMessage.success('购物车API测试成功');
  } catch (error) {
    // 购物车API可能返回404（购物车为空）或其他错误
    if (error.response?.status === 404) {
      addLog('购物车API调用成功（购物车为空）', 'success');
      ElMessage.success('购物车API测试成功（购物车为空）');
    } else {
      addLog(`购物车API调用失败: ${error.message}`, 'error');
      ElMessage.error('购物车API测试失败');
    }
  } finally {
    cartAPILoading.value = false;
  }
};

// 监听API请求日志
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

onMounted(() => {
  // 拦截控制台日志
  console.log = function(...args) {
    originalLog.apply(console, args);
    if (args.some(arg => typeof arg === 'string' && (arg.includes('请求携带token') || arg.includes('后端 API 响应成功')))) {
      addLog(args.join(' '), 'info');
    }
  };
  
  console.warn = function(...args) {
    originalWarn.apply(console, args);
    if (args.some(arg => typeof arg === 'string' && arg.includes('请求需要权限但未token'))) {
      addLog(args.join(' '), 'warning');
    }
  };
  
  console.error = function(...args) {
    originalError.apply(console, args);
    if (args.some(arg => typeof arg === 'string' && arg.includes('后端 API 调用失败'))) {
      addLog(args.join(' '), 'error');
    }
  };
  
  addLog('Token测试页面已加载', 'info');
});

onUnmounted(() => {
  // 恢复原始控制台方法
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
});
</script>

<style scoped>
.token-test {
  min-height: 100vh;
  background: #f5f7fa;
}

.test-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-content h1 {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

.test-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.test-card {
  margin-bottom: 20px;
}

.token-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-test-section h4 {
  margin: 20px 0 10px 0;
  color: #606266;
}

.test-buttons {
  margin-bottom: 15px;
}

.test-buttons .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.test-result {
  margin-top: 10px;
}

.log-section {
  position: relative;
}

.logs {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  background: #fafafa;
  margin-top: 10px;
}

.log-item {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  font-size: 12px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-item.info {
  color: #409eff;
}

.log-item.success {
  color: #67c23a;
}

.log-item.warning {
  color: #e6a23c;
}

.log-item.error {
  color: #f56c6c;
}

.timestamp {
  margin-right: 10px;
  color: #909399;
}

.message {
  white-space: pre-wrap;
}
</style>