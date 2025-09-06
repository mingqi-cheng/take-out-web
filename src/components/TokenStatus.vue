<template>
  <div class="token-status">
    <el-card class="token-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>🔐 Token认证状态</span>
          <el-button 
            size="small" 
            type="primary" 
            :icon="Refresh" 
            @click="refreshStatus"
            :loading="refreshing"
          >
            刷新
          </el-button>
        </div>
      </template>

      <div class="status-content">
        <!-- 认证状态 -->
        <div class="status-row">
          <span class="label">认证状态:</span>
          <el-tag :type="tokenValid ? 'success' : 'danger'">
            {{ tokenValid ? '✅ 已认证' : '❌ 已过期' }}
          </el-tag>
        </div>

        <!-- 用户信息 -->
        <div class="status-row" v-if="userInfo">
          <span class="label">当前用户:</span>
          <span>{{ userDisplayName }} ({{ userRoleText }})</span>
        </div>

        <!-- Token详情 -->
        <div class="status-row" v-if="hasToken">
          <span class="label">Token:</span>
          <el-input
            v-model="maskedToken"
            readonly
            size="small"
            style="width: 250px"
          >
            <template #suffix>
              <el-button 
                text 
                size="small" 
                @click="copyToken"
                :icon="CopyDocument"
              />
            </template>
          </el-input>
        </div>

        <!-- 过期时间 -->
        <div class="status-row" v-if="hasToken">
          <span class="label">过期时间:</span>
          <span>{{ expiresAtText }}</span>
        </div>

        <!-- 剩余时间 -->
        <div class="status-row" v-if="hasToken">
          <span class="label">剩余时间:</span>
          <el-tag :type="remainingTimeType">{{ remainingTimeText }}</el-tag>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons" v-if="userInfo">
          <el-button 
            size="small" 
            type="warning" 
            @click="logout"
            :icon="SwitchButton"
          >
            手动登出
          </el-button>
          <el-button 
            size="small" 
            type="info" 
            @click="checkTokenValidity"
            :icon="Shield"
          >
            检查有效性
          </el-button>
        </div>

        <!-- 未登录状态 -->
        <div class="no-auth" v-if="!userInfo">
          <el-empty 
            description="未登录"
            :image-size="80"
          >
            <el-button type="primary" @click="goToLogin">前往登录</el-button>
          </el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Refresh, CopyDocument, SwitchButton, Shield } from '@element-plus/icons-vue';
import { authManager } from '../utils/authManager.js';

const store = useStore();
const router = useRouter();

const refreshing = ref(false);
const updateInterval = ref(null);

// 计算属性
const userInfo = computed(() => store.state.user.userInfo);
const token = computed(() => store.state.user.token);
const hasToken = computed(() => !!token.value);
const tokenValid = computed(() => store.getters['user/isAuthenticated']);
const tokenExpires = computed(() => store.state.user.tokenExpires);
const userDisplayName = computed(() => store.getters['user/userDisplayName']);
const userRoleText = computed(() => store.getters['user/userRoleText']);

// Token掩码显示
const maskedToken = computed(() => {
  if (!token.value) return '';
  const tokenStr = token.value;
  if (tokenStr.length <= 20) return tokenStr;
  return `${tokenStr.substring(0, 10)}...${tokenStr.substring(tokenStr.length - 10)}`;
});

// 过期时间文本
const expiresAtText = computed(() => {
  if (!tokenExpires.value) return '未设置';
  return new Date(parseInt(tokenExpires.value)).toLocaleString();
});

// 剩余时间
const remainingTime = computed(() => store.getters['user/tokenExpiresIn']);

const remainingTimeText = computed(() => {
  const remaining = remainingTime.value;
  if (remaining <= 0) return '已过期';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
});

const remainingTimeType = computed(() => {
  const remaining = remainingTime.value;
  if (remaining <= 0) return 'danger';
  if (remaining < 15 * 60 * 1000) return 'warning'; // 15分钟
  if (remaining < 60 * 60 * 1000) return 'info'; // 1小时
  return 'success';
});

// 方法
const refreshStatus = async () => {
  refreshing.value = true;
  try {
    // 强制检查token有效性
    const isValid = store.dispatch('user/checkTokenValidity');
    if (isValid) {
      ElMessage.success('Token状态检查完成');
    } else {
      ElMessage.warning('Token已过期');
    }
  } catch (error) {
    ElMessage.error('状态检查失败: ' + error.message);
  } finally {
    refreshing.value = false;
  }
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

const logout = () => {
  authManager.logout('手动登出');
};

const checkTokenValidity = () => {
  const isValid = store.dispatch('user/checkTokenValidity');
  if (isValid) {
    ElMessage.success('✅ Token有效');
  } else {
    ElMessage.error('❌ Token无效或已过期');
  }
};

const goToLogin = () => {
  router.push('/auth/login');
};

const startAutoRefresh = () => {
  // 每秒更新一次剩余时间显示
  updateInterval.value = setInterval(() => {
    // 触发响应式更新
    store.dispatch('user/checkTokenValidity');
  }, 1000);
};

const stopAutoRefresh = () => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
    updateInterval.value = null;
  }
};

onMounted(() => {
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
.token-status {
  margin: 20px 0;
}

.token-card {
  max-width: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-content {
  space-y: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.label {
  font-weight: 500;
  min-width: 80px;
  color: #606266;
}

.action-buttons {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 8px;
}

.no-auth {
  text-align: center;
  padding: 20px;
}
</style>