<template>
  <div class="customer-layout">
    <!-- 顶部导航 -->
    <header class="bg-red-500 text-white sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-bold">🍔 外卖点餐</h1>
            <nav class="hidden md:flex space-x-6">
              <router-link 
                to="/customer/menu" 
                class="hover:text-red-200 transition-colors"
                active-class="text-red-200"
              >
                菜单
              </router-link>
              <router-link 
                to="/customer/orders" 
                class="hover:text-red-200 transition-colors"
                active-class="text-red-200"
                v-if="isAuthenticated"
              >
                我的订单
              </router-link>
            </nav>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- 购物车 -->
            <router-link 
              to="/customer/cart" 
              class="relative flex items-center hover:text-red-200 transition-colors"
            >
              <span class="text-lg">🛒</span>
              <span v-if="cartItemCount > 0" class="absolute -top-2 -right-2 bg-yellow-500 text-red-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {{ cartItemCount }}
              </span>
            </router-link>
            
            <!-- 用户菜单 -->
            <div v-if="isAuthenticated" class="relative">
              <button @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2 hover:text-red-200 transition-colors">
                <span>{{ userInfo?.name || '用户' }}</span>
                <span>👤</span>
              </button>
              <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <router-link 
                  to="/customer/profile" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  个人中心
                </router-link>
                <button 
                  @click="handleLogout" 
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  退出登录
                </button>
              </div>
            </div>
            
            <!-- 登录按钮 -->
            <router-link 
              v-else 
              to="/auth/login" 
              class="bg-white text-red-500 px-4 py-2 rounded hover:bg-red-50 transition-colors"
            >
              登录
            </router-link>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="min-h-screen bg-gray-100">
      <router-view />
    </main>
    
    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div class="flex">
        <router-link 
          to="/customer/menu" 
          class="flex-1 flex flex-col items-center py-2 text-gray-600 hover:text-red-500"
          active-class="text-red-500"
        >
          <span class="text-lg">🍽️</span>
          <span class="text-xs">菜单</span>
        </router-link>
        <router-link 
          to="/customer/cart" 
          class="flex-1 flex flex-col items-center py-2 text-gray-600 hover:text-red-500 relative"
          active-class="text-red-500"
        >
          <span class="text-lg">🛒</span>
          <span class="text-xs">购物车</span>
          <span v-if="cartItemCount > 0" class="absolute top-0 right-1/2 transform translate-x-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {{ cartItemCount }}
          </span>
        </router-link>
        <router-link 
          v-if="isAuthenticated"
          to="/customer/orders" 
          class="flex-1 flex flex-col items-center py-2 text-gray-600 hover:text-red-500"
          active-class="text-red-500"
        >
          <span class="text-lg">📋</span>
          <span class="text-xs">订单</span>
        </router-link>
        <router-link 
          v-if="isAuthenticated"
          to="/customer/profile" 
          class="flex-1 flex flex-col items-center py-2 text-gray-600 hover:text-red-500"
          active-class="text-red-500"
        >
          <span class="text-lg">👤</span>
          <span class="text-xs">我的</span>
        </router-link>
        <router-link 
          v-else
          to="/auth/login" 
          class="flex-1 flex flex-col items-center py-2 text-gray-600 hover:text-red-500"
        >
          <span class="text-lg">🔑</span>
          <span class="text-xs">登录</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();
const showUserMenu = ref(false);

// 计算属性
const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
const userInfo = computed(() => store.state.user.userInfo);
const cartItemCount = computed(() => store.getters['cart/cartItemCount']);

// 处理登出
const handleLogout = async () => {
  try {
    await store.dispatch('user/logout');
    showUserMenu.value = false;
    router.push('/customer/menu');
    store.dispatch('showSuccess', '已成功退出登录');
  } catch (error) {
    store.dispatch('showError', '退出登录失败');
  }
};

// 点击外部关闭用户菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false;
  }
};

// 组件挂载时的操作
onMounted(async () => {
  // 如果有token，尝试获取用户信息
  if (store.state.user.token && !userInfo.value) {
    try {
      await store.dispatch('user/fetchUserInfo');
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }
  
  // 获取购物车数据
  try {
    await store.dispatch('cart/fetchCart');
  } catch (error) {
    console.error('获取购物车失败:', error);
  }
  
  // 添加点击外部关闭菜单的事件监听
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.router-link-active {
  font-weight: 600;
}
</style>