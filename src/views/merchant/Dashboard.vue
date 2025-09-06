<template>
  <div class="merchant-layout">
    <!-- 顶部导航 -->
    <header class="bg-blue-600 text-white sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-bold">🏪 商家管理后台</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- 统计信息 -->
            <div class="hidden md:flex space-x-6 text-sm">
              <div>今日订单：{{ todayStats.orders }}</div>
              <div>今日收入：¥{{ todayStats.revenue.toFixed(2) }}</div>
            </div>
            
            <!-- 用户菜单 -->
            <div class="relative">
              <button @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                <span>{{ userInfo?.name || '商家' }}</span>
                <span>👤</span>
              </button>
              <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button 
                  @click="handleLogout" 
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 导航标签 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4">
        <div class="flex space-x-8">
          <router-link 
            to="/merchant/orders" 
            class="py-4 px-2 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            active-class="border-blue-500 text-blue-600"
          >
            订单管理
          </router-link>
          <router-link 
            to="/merchant/menu" 
            class="py-4 px-2 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            active-class="border-blue-500 text-blue-600"
          >
            菜单管理
          </router-link>
          <router-link 
            to="/merchant/stats" 
            class="py-4 px-2 border-b-2 border-transparent hover:border-blue-500 transition-colors"
            active-class="border-blue-500 text-blue-600"
          >
            统计报表
          </router-link>
        </div>
      </div>
    </nav>
    
    <!-- 主要内容区域 -->
    <main class="min-h-screen bg-gray-100">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();
const showUserMenu = ref(false);

// 计算属性
const userInfo = computed(() => store.state.user.userInfo);
const todayStats = computed(() => ({
  orders: store.state.stats.orderStats.todayCount || 0,
  revenue: store.state.stats.salesStats.todayRevenue || 0
}));

// 处理登出
const handleLogout = async () => {
  try {
    await store.dispatch('user/logout');
    showUserMenu.value = false;
    router.push('/auth/login');
    store.dispatch('showSuccess', '已成功退出登录');
  } catch (error) {
    store.dispatch('showError', '退出登录失败');
  }
};

// 组件挂载时的操作
onMounted(async () => {
  // 获取统计数据
  try {
    await Promise.all([
      store.dispatch('stats/fetchOrderStats'),
      store.dispatch('stats/fetchSalesStats')
    ]);
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
});
</script>

<style scoped>
.router-link-active {
  color: #2563eb;
  border-color: #2563eb;
}
</style>