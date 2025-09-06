<template>
  <div class="orders-page min-h-screen bg-gray-100 pb-20">
    <div class="container mx-auto px-4 py-6">
      <div class="max-w-4xl mx-auto">
        <!-- 页面标题 -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800">我的订单</h1>
        </div>

        <!-- 订单状态筛选 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <div class="flex border-b">
            <button
              v-for="(status, key) in orderStatusTabs"
              :key="key"
              @click="activeTab = key"
              :class="{
                'text-red-500 border-b-2 border-red-500': activeTab === key,
                'text-gray-600': activeTab !== key
              }"
              class="flex-1 py-3 px-4 text-center font-medium"
            >
              {{ status }}
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>

        <!-- 订单列表 -->
        <div v-else-if="filteredOrders.length > 0" class="space-y-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <!-- 订单头部 -->
            <div class="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <span class="text-sm text-gray-600">订单号：</span>
                <span class="font-medium">{{ order.id }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="{
                    'text-yellow-600 bg-yellow-100': order.status === '待处理',
                    'text-blue-600 bg-blue-100': order.status === '制作中',
                    'text-orange-600 bg-orange-100': order.status === '待取餐',
                    'text-green-600 bg-green-100': order.status === '已完成',
                    'text-red-600 bg-red-100': order.status === '已取消'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ order.status }}
                </span>
              </div>
            </div>

            <!-- 订单内容 -->
            <div class="px-4 py-3">
              <!-- 商品列表 -->
              <div class="space-y-2 mb-3">
                <div
                  v-for="item in order.items"
                  :key="item.name"
                  class="flex justify-between items-center"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gray-200 rounded"></div>
                    <div>
                      <div class="font-medium">{{ item.name }}</div>
                      <div class="text-sm text-gray-500">¥{{ item.price }} × {{ item.quantity }}</div>
                    </div>
                  </div>
                  <div class="font-medium">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
                </div>
              </div>

              <!-- 订单信息 -->
              <div class="border-t pt-3 flex justify-between items-center">
                <div class="text-sm text-gray-600">
                  <div>下单时间：{{ formatTime(order.orderTime) }}</div>
                  <div v-if="order.deliveryAddress">
                    配送地址：{{ order.deliveryAddress.address }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-600">总计</div>
                  <div class="text-lg font-bold text-red-500">¥{{ order.totalAmount.toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <!-- 订单操作 -->
            <div class="px-4 py-3 border-t bg-gray-50 flex justify-end space-x-2">
              <button
                v-if="order.status === '待处理'"
                @click="cancelOrder(order.id)"
                class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                取消订单
              </button>
              <button
                v-if="order.status === '已完成'"
                @click="reorder(order)"
                class="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
              >
                再来一单
              </button>
              <button
                @click="viewOrderDetail(order.id)"
                class="px-4 py-2 text-sm text-red-500 border border-red-500 rounded hover:bg-red-50"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="bg-white rounded-lg shadow-sm p-8 text-center">
          <span class="text-6xl mb-4 block">📋</span>
          <h3 class="text-lg font-medium text-gray-800 mb-2">暂无订单</h3>
          <p class="text-gray-600 mb-6">{{ getEmptyMessage() }}</p>
          <router-link
            to="/customer/menu"
            class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors inline-block"
          >
            去点餐
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const activeTab = ref('all');
const loading = ref(false);

// 订单状态标签
const orderStatusTabs = {
  all: '全部',
  pending: '待处理',
  preparing: '制作中',
  ready: '待取餐',
  completed: '已完成',
  cancelled: '已取消'
};

// 状态映射
const statusMap = {
  pending: '待处理',
  preparing: '制作中',
  ready: '待取餐',
  completed: '已完成',
  cancelled: '已取消'
};

// 计算属性
const orderHistory = computed(() => store.state.order.orderHistory);
const userInfo = computed(() => store.state.user.userInfo);

// 过滤后的订单
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orderHistory.value;
  }
  const targetStatus = statusMap[activeTab.value];
  return orderHistory.value.filter(order => order.status === targetStatus);
});

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

// 获取空状态消息
const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'pending':
      return '您当前没有待处理的订单';
    case 'preparing':
      return '您当前没有制作中的订单';
    case 'ready':
      return '您当前没有待取餐的订单';
    case 'completed':
      return '您还没有完成的订单';
    case 'cancelled':
      return '您没有取消的订单';
    default:
      return '您还没有任何订单，快去点餐吧！';
  }
};

// 取消订单
const cancelOrder = async (orderId) => {
  if (!confirm('确定要取消这个订单吗？')) return;
  
  try {
    loading.value = true;
    await store.dispatch('order/updateOrderStatus', {
      orderId,
      status: '已取消'
    });
    store.dispatch('showSuccess', '订单已取消');
  } catch (error) {
    store.dispatch('showError', '取消订单失败');
  } finally {
    loading.value = false;
  }
};

// 再来一单
const reorder = async (order) => {
  try {
    // 将订单商品添加到购物车
    for (const item of order.items) {
      await store.dispatch('cart/addToCart', {
        id: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      });
    }
    store.dispatch('showSuccess', '商品已添加到购物车');
    router.push('/customer/cart');
  } catch (error) {
    store.dispatch('showError', '添加到购物车失败');
  }
};

// 查看订单详情
const viewOrderDetail = (orderId) => {
  // 这里可以跳转到订单详情页面或显示模态框
  console.log('查看订单详情:', orderId);
};

// 获取订单数据
const fetchOrders = async () => {
  if (!userInfo.value?.id) return;
  
  try {
    loading.value = true;
    await store.dispatch('order/fetchUserOrders', userInfo.value.id);
  } catch (error) {
    console.error('获取订单失败:', error);
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchOrders();
});
</script>