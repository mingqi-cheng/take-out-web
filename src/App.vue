<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import Notification from './components/Notification.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();

// 计算属性
const globalLoading = computed(() => store.state.global.loading);

// 是否显示演示导航栏
const showDemoNav = computed(() => {
  // 不在登录、注册、404页面时显示
  const hiddenPaths = ['/auth/login', '/auth/register', '/404'];
  return !hiddenPaths.includes(route.path);
});

// 导航方法
const goToTokenDemo = () => {
  router.push('/token-demo');
};

const goToLoginTest = () => {
  router.push('/login-test');
};

const goToLogin = () => {
  router.push('/auth/login');
};

const goToTokenTest = () => {
  router.push('/token-test');
};

const goToDishTest = () => {
  router.push('/dish-test');
};

const goToDishDebug = () => {
  router.push('/dish-debug');
};

const goToDishApiTest = () => {
  router.push('/dish-api-test');
};

const goToMerchantSelect = () => {
  router.push('/customer/merchants');
};

// 组件挂载时初始化
onMounted(async () => {
  // 如果有token，试图获取用户信息
  if (store.state.user.token) {
    try {
      await store.dispatch('user/fetchUserInfo');
    } catch (error) {
      console.error('初始化用户信息失败:', error);
    }
  }
});
</script>

<template>
  <div id="app">
    <!-- 简单导航栏 -->
    <div class="demo-nav" v-if="showDemoNav">
      <div class="nav-content">
        <span>🍴 外卖点餐系统</span>
        <div class="nav-buttons">
          <el-button 
            size="small" 
            type="primary" 
            @click="goToTokenDemo"
            v-if="$route.path !== '/token-demo'"
          >
            🔐 Token认证演示
          </el-button>
          <el-button 
            size="small" 
            type="success" 
            @click="goToLoginTest"
            v-if="$route.path !== '/login-test'"
          >
            🧪 登录测试
          </el-button>
          <el-button 
            size="small" 
            type="warning" 
            @click="goToTokenTest"
            v-if="$route.path !== '/token-test'"
          >
            🔍 Token测试
          </el-button>
          <el-button 
            size="small" 
            type="info" 
            @click="goToDishTest"
            v-if="$route.path !== '/dish-test'"
          >
            🍽️ 菜品API测试
          </el-button>
          <el-button 
            size="small" 
            type="info" 
            @click="goToDishDebug"
            v-if="$route.path !== '/dish-debug'"
          >
            🐞 菜品调试
          </el-button>
          <el-button 
            size="small" 
            type="info" 
            @click="goToDishApiTest"
            v-if="$route.path !== '/dish-api-test'"
          >
            🔧 菜品API测试
          </el-button>
          <el-button 
            size="small" 
            type="info" 
            @click="goToMerchantSelect"
            v-if="$route.path !== '/customer/merchants'"
          >
            🏪 商家选择
          </el-button>
          <el-button 
            size="small" 
            type="info" 
            @click="goToLogin"
            v-if="$route.path !== '/auth/login'"
          >
            🚃 登录页面
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 路由视图 -->
    <router-view />
    
    <!-- 全局通知 -->
    <Notification />
    
    <!-- 全局加载遮罩 -->
    <div 
      v-if="globalLoading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e4e7ed;
  z-index: 1000;
  display: flex;
  align-items: center;
}

.nav-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

/* 为有导航栏的页面添加顶部边距 */
:deep(.demo-content),
:deep(.login-page) {
  padding-top: 60px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}
</style>