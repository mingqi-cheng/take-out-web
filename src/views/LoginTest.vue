<template>
  <div class="login-test">
    <el-container>
      <el-header height="60px" class="test-header">
        <div class="header-content">
          <h1>🔐 登录功能测试</h1>
          <el-button type="primary" @click="goToLogin">前往登录页面</el-button>
        </div>
      </el-header>

      <el-main>
        <div class="test-content">
          <el-card class="test-card">
            <template #header>
              <h3>登录测试说明</h3>
            </template>
            
            <div class="test-instructions">
              <p>此页面用于测试登录功能是否正常工作：</p>
              <ol>
                <li>点击右上角"前往登录页面"按钮</li>
                <li>使用以下测试账号登录：
                  <ul>
                    <li><strong>顾客账号</strong>: mmmm111 / 123456</li>
                    <li><strong>商家账号</strong>: (请使用实际商家账号)</li>
                  </ul>
                </li>
                <li>登录成功后应自动跳转到相应主页</li>
                <li>如果未跳转，请检查控制台错误信息</li>
              </ol>
            </div>
            
            <div class="current-status">
              <h4>当前状态</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="认证状态">
                  <el-tag :type="isAuthenticated ? 'success' : 'danger'">
                    {{ isAuthenticated ? '已认证' : '未认证' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="用户信息" v-if="userInfo">
                  <div>
                    <div>用户名: {{ userInfo.username }}</div>
                    <div>昵称: {{ userInfo.nickname }}</div>
                    <div>角色: {{ userRoleText }}</div>
                  </div>
                </el-descriptions-item>
                <el-descriptions-item label="Token状态" v-if="hasToken">
                  <div>
                    <div>Token: {{ tokenPreview }}</div>
                    <div>过期时间: {{ expiresAt }}</div>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
              
              <div class="action-buttons" style="margin-top: 20px;">
                <el-button @click="refreshStatus">刷新状态</el-button>
                <el-button type="warning" @click="logout">手动登出</el-button>
              </div>
            </div>
          </el-card>
          
          <el-card class="test-card" style="margin-top: 20px;">
            <template #header>
              <h3>调试信息</h3>
            </template>
            
            <div class="debug-info">
              <el-button @click="showDebugInfo = !showDebugInfo">
                {{ showDebugInfo ? '隐藏' : '显示' }}详细信息
              </el-button>
              
              <div v-if="showDebugInfo" class="debug-details">
                <pre>{{ debugData }}</pre>
              </div>
            </div>
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
import { ElMessage } from 'element-plus';
import { authManager } from '../utils/authManager.js';

const store = useStore();
const router = useRouter();
const showDebugInfo = ref(false);

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

const debugData = computed(() => {
  return JSON.stringify({
    state: store.state.user,
    getters: {
      isAuthenticated: store.getters['user/isAuthenticated'],
      isTokenExpired: store.getters['user/isTokenExpired'],
      tokenExpiresIn: store.getters['user/tokenExpiresIn']
    }
  }, null, 2);
});

// 方法
const goToLogin = () => {
  router.push('/auth/login');
};

const refreshStatus = () => {
  store.dispatch('user/checkTokenValidity');
  ElMessage.success('状态已刷新');
};

const logout = () => {
  authManager.logout();
};

onMounted(() => {
  console.log('登录测试页面已加载');
});
</script>

<style scoped>
.login-test {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-card {
  margin-bottom: 20px;
}

.test-instructions ol {
  padding-left: 20px;
}

.test-instructions li {
  margin-bottom: 10px;
}

.test-instructions ul {
  padding-left: 20px;
  margin-top: 5px;
}

.current-status h4 {
  margin-top: 0;
}

.debug-details {
  margin-top: 10px;
}

.debug-details pre {
  background: #f4f4f5;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
  font-size: 12px;
}
</style>