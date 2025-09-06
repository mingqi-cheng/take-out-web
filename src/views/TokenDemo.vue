<template>
  <div class="token-demo">
    <el-container>
      <!-- 头部 -->
      <el-header height="60px" class="demo-header">
        <div class="header-content">
          <h1>🔐 Token认证管理演示</h1>
          <el-button type="primary" @click="goBack">返回</el-button>
        </div>
      </el-header>

      <!-- 主要内容 -->
      <el-main>
        <div class="demo-content">
          <!-- Token状态监控 -->
          <TokenStatus />

          <!-- 功能演示区域 -->
          <el-row :gutter="20">
            <!-- 登录测试 -->
            <el-col :span="12">
              <el-card class="demo-card">
                <template #header>
                  <h3>🚪 登录测试</h3>
                </template>
                
                <div class="test-section">
                  <p class="description">测试登录功能，验证Token获取和存储</p>
                  
                  <div class="test-buttons">
                    <el-button 
                      type="primary" 
                      :loading="loginLoading" 
                      @click="testCustomerLogin"
                    >
                      顾客登录测试
                    </el-button>
                    <el-button 
                      type="success" 
                      :loading="loginLoading" 
                      @click="testMerchantLogin"
                    >
                      商家登录测试
                    </el-button>
                  </div>

                  <div class="login-info" v-if="lastLoginResult">
                    <el-alert :title="lastLoginResult" type="success" :closable="false" />
                  </div>
                </div>
              </el-card>
            </el-col>

            <!-- API请求测试 -->
            <el-col :span="12">
              <el-card class="demo-card">
                <template #header>
                  <h3>🌐 API权限测试</h3>
                </template>
                
                <div class="test-section">
                  <p class="description">测试API请求自动携带Token</p>
                  
                  <div class="test-buttons">
                    <el-button 
                      type="info" 
                      :loading="apiLoading" 
                      @click="testPublicAPI"
                    >
                      公开API（无需Token）
                    </el-button>
                    <el-button 
                      type="warning" 
                      :loading="apiLoading" 
                      @click="testProtectedAPI"
                    >
                      受保护API（需要Token）
                    </el-button>
                  </div>

                  <div class="api-result" v-if="lastAPIResult">
                    <el-alert 
                      :title="lastAPIResult.title" 
                      :type="lastAPIResult.type" 
                      :description="lastAPIResult.description"
                      :closable="false" 
                    />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- Token行为演示 -->
          <el-card class="demo-card full-width">
            <template #header>
              <h3>⚡ Token行为演示</h3>
            </template>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="behavior-item">
                  <h4>🔄 自动刷新检查</h4>
                  <p>Token状态每分钟自动检查，剩余时间实时更新</p>
                  <el-progress 
                    :percentage="tokenHealthPercentage" 
                    :color="tokenHealthColor"
                    :show-text="false"
                  />
                  <div class="progress-text">Token健康度: {{ tokenHealthPercentage }}%</div>
                </div>
              </el-col>
              
              <el-col :span="8">
                <div class="behavior-item">
                  <h4>⚠️ 过期预警</h4>
                  <p>Token过期前15分钟会弹出续期提醒</p>
                  <el-button 
                    size="small" 
                    type="warning" 
                    @click="simulateExpirationWarning"
                  >
                    模拟过期警告
                  </el-button>
                </div>
              </el-col>
              
              <el-col :span="8">
                <div class="behavior-item">
                  <h4>🚫 自动登出</h4>
                  <p>Token过期或401错误时自动登出并跳转</p>
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="simulateTokenExpiration"
                  >
                    模拟Token过期
                  </el-button>
                </div>
              </el-col>
            </el-row>
          </el-card>

          <!-- 实现说明 -->
          <el-card class="demo-card full-width">
            <template #header>
              <h3>📋 实现说明</h3>
            </template>
            
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Token获取">
                登录成功后，后端返回token、过期时间等信息，前端自动保存到localStorage
              </el-descriptions-item>
              <el-descriptions-item label="自动携带">
                所有需要权限的API请求，请求拦截器自动添加 Authorization: Bearer {token} 头部
              </el-descriptions-item>
              <el-descriptions-item label="权限判断">
                通过isPublicAPI函数智能识别公开API，只有需要权限的请求才携带token
              </el-descriptions-item>
              <el-descriptions-item label="过期处理">
                响应拦截器检测401错误，自动清除过期token并触发登出流程
              </el-descriptions-item>
              <el-descriptions-item label="状态监控">
                全局认证管理器每分钟检查token状态，提前预警和自动处理
              </el-descriptions-item>
              <el-descriptions-item label="用户体验">
                支持登录重定向、状态恢复、无感知的安全处理
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import TokenStatus from '../components/TokenStatus.vue';
import { userAPI, merchantAPI } from '../api/index.js';
import { authManager } from '../utils/authManager.js';

const store = useStore();
const router = useRouter();

const loginLoading = ref(false);
const apiLoading = ref(false);
const lastLoginResult = ref('');
const lastAPIResult = ref(null);

// 计算Token健康度
const tokenHealthPercentage = computed(() => {
  const expiresIn = store.getters['user/tokenExpiresIn'];
  if (expiresIn <= 0) return 0;
  
  // 假设token有效期为24小时
  const totalTime = 24 * 60 * 60 * 1000;
  const percentage = Math.round((expiresIn / totalTime) * 100);
  return Math.min(percentage, 100);
});

const tokenHealthColor = computed(() => {
  const percentage = tokenHealthPercentage.value;
  if (percentage < 20) return '#F56C6C'; // 红色
  if (percentage < 50) return '#E6A23C'; // 橙色
  return '#67C23A'; // 绿色
});

// 测试顾客登录
const testCustomerLogin = async () => {
  loginLoading.value = true;
  try {
    const loginData = {
      account: 'customer001',
      password: '123456'
    };
    
    await store.dispatch('user/login', loginData);
    lastLoginResult.value = '顾客登录成功！Token已获取并保存';
    ElMessage.success('顾客登录测试成功');
  } catch (error) {
    ElMessage.error('顾客登录测试失败: ' + error.message);
    lastLoginResult.value = '';
  } finally {
    loginLoading.value = false;
  }
};

// 测试商家登录
const testMerchantLogin = async () => {
  loginLoading.value = true;
  try {
    const loginData = {
      account: 'merchant001',
      password: '123456'
    };
    
    await store.dispatch('user/login', loginData);
    lastLoginResult.value = '商家登录成功！Token已获取并保存';
    ElMessage.success('商家登录测试成功');
  } catch (error) {
    ElMessage.error('商家登录测试失败: ' + error.message);
    lastLoginResult.value = '';
  } finally {
    loginLoading.value = false;
  }
};

// 测试公开API
const testPublicAPI = async () => {
  apiLoading.value = true;
  try {
    const response = await merchantAPI.getActiveMerchants();
    lastAPIResult.value = {
      title: '公开API调用成功',
      type: 'success',
      description: `获取到 ${response.data?.length || 0} 个活跃商家，此API不需要Token`
    };
    ElMessage.success('公开API测试成功');
  } catch (error) {
    lastAPIResult.value = {
      title: '公开API调用失败',
      type: 'error',
      description: error.message
    };
    ElMessage.error('公开API测试失败');
  } finally {
    apiLoading.value = false;
  }
};

// 测试受保护API
const testProtectedAPI = async () => {
  if (!store.getters['user/isAuthenticated']) {
    ElMessage.warning('请先登录再测试受保护API');
    return;
  }
  
  apiLoading.value = true;
  try {
    const userInfo = store.state.user.userInfo;
    const response = await userAPI.getUserInfo(userInfo.id);
    lastAPIResult.value = {
      title: '受保护API调用成功',
      type: 'success',
      description: `获取用户信息成功，请求自动携带了Token`
    };
    ElMessage.success('受保护API测试成功');
  } catch (error) {
    lastAPIResult.value = {
      title: '受保护API调用失败',
      type: 'error',
      description: error.message
    };
    ElMessage.error('受保护API测试失败');
  } finally {
    apiLoading.value = false;
  }
};

// 模拟过期警告
const simulateExpirationWarning = async () => {
  try {
    await ElMessageBox.confirm(
      '您的登录状态将在 5 分钟后过期，是否继续当前会话？',
      '登录状态即将过期',
      {
        confirmButtonText: '继续会话',
        cancelButtonText: '重新登录',
        type: 'warning'
      }
    );
    ElMessage.success('用户选择继续会话');
  } catch (error) {
    ElMessage.info('用户选择重新登录');
  }
};

// 模拟Token过期
const simulateTokenExpiration = () => {
  // 触发token过期事件
  window.dispatchEvent(new CustomEvent('token-expired'));
  ElMessage.warning('模拟Token过期，将自动登出');
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  ElMessage.info('Token认证演示页面已加载，请测试各项功能');
});
</script>

<style scoped>
.token-demo {
  min-height: 100vh;
  background: #f5f7fa;
}

.demo-header {
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

.demo-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-card {
  margin-bottom: 20px;
}

.demo-card.full-width {
  width: 100%;
}

.test-section {
  text-align: center;
}

.description {
  color: #606266;
  margin-bottom: 16px;
}

.test-buttons {
  margin-bottom: 16px;
}

.test-buttons .el-button {
  margin: 0 8px 8px 0;
}

.login-info,
.api-result {
  margin-top: 16px;
}

.behavior-item {
  text-align: center;
  padding: 16px;
}

.behavior-item h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.behavior-item p {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
}

.progress-text {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>