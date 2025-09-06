<template>
  <div class="orders-page p-6">
    <div class="container mx-auto">
      <!-- 页面标题和操作 -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">订单管理</h2>
        <button 
          @click="fetchOrders" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          :disabled="loading"
        >
          {{ loading ? '刷新中...' : '刷新订单' }}
        </button>
      </div>
      
      <!-- 订单统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-yellow-100 p-4 rounded-lg">
          <div class="text-2xl font-bold text-yellow-800">{{ pendingOrders.length }}</div>
          <div class="text-yellow-600">待处理订单</div>
        </div>
        <div class="bg-blue-100 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-800">{{ preparingOrders.length }}</div>
          <div class="text-blue-600">制作中订单</div>
        </div>
        <div class="bg-orange-100 p-4 rounded-lg">
          <div class="text-2xl font-bold text-orange-800">{{ readyOrders.length }}</div>
          <div class="text-orange-600">待取餐订单</div>
        </div>
        <div class="bg-green-100 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-800">{{ completedTodayOrders.length }}</div>
          <div class="text-green-600">今日完成</div>
        </div>
      </div>

      <!-- 订单列表 -->
      <div class="bg-white rounded-xl shadow overflow-hidden">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <!-- 订单表格 -->
        <div v-else-if="orderList.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-4 font-medium text-gray-700">订单号</th>
                <th class="p-4 font-medium text-gray-700">顾客信息</th>
                <th class="p-4 font-medium text-gray-700">菜品</th>
                <th class="p-4 font-medium text-gray-700">金额</th>
                <th class="p-4 font-medium text-gray-700">下单时间</th>
                <th class="p-4 font-medium text-gray-700">状态</th>
                <th class="p-4 font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="order in orderList"
                :key="order.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="p-4">
                  <div class="font-medium">#{{ order.id }}</div>
                </td>
                <td class="p-4">
                  <div>{{ order.customerInfo?.name || order.customer }}</div>
                  <div class="text-sm text-gray-500">{{ order.customerInfo?.phone || order.customerPhone }}</div>
                  <div v-if="order.deliveryAddress" class="text-xs text-gray-400 mt-1">
                    {{ order.deliveryAddress.address }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="space-y-1">
                    <div
                      v-for="item in order.items"
                      :key="item.name"
                      class="text-sm"
                    >
                      {{ item.name }} × {{ item.quantity }}
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <div class="font-medium">¥{{ (order.totalAmount || order.total).toFixed(2) }}</div>
                  <div v-if="order.deliveryFee" class="text-xs text-gray-500">
                    (含配送费 ¥{{ order.deliveryFee.toFixed(2) }})
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-sm">{{ formatTime(order.orderTime) }}</div>
                  <div v-if="order.estimatedTime" class="text-xs text-gray-500">
                    预计 {{ order.estimatedTime }} 分钟
                  </div>
                </td>
                <td class="p-4">
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
                </td>
                <td class="p-4">
                  <div class="flex space-x-2">
                    <button
                      v-if="canAdvanceStatus(order.status)"
                      @click="advanceOrderStatus(order)"
                      class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      {{ getNextStatusText(order.status) }}
                    </button>
                    <button
                      v-if="order.status === '待处理'"
                      @click="cancelOrder(order.id)"
                      class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      拒绝
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 空状态 -->
        <div v-else class="p-12 text-center">
          <span class="text-6xl mb-4 block">📋</span>
          <h3 class="text-lg font-medium text-gray-800 mb-2">暂无订单</h3>
          <p class="text-gray-600">等待顾客下单中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const loading = ref(false);
let refreshInterval = null;

// 状态流转映射
const statusFlow = {
  '待处理': '制作中',
  '制作中': '待取餐',
  '待取餐': '已完成'
};

// 计算属性
const orderList = computed(() => store.state.order.orderList);
const pendingOrders = computed(() => store.getters['order/pendingOrders']);
const preparingOrders = computed(() => store.getters['order/preparingOrders']);
const completedOrders = computed(() => store.getters['order/completedOrders']);

// 待取餐订单
const readyOrders = computed(() => 
  orderList.value.filter(order => order.status === '待取餐')
);

// 今日完成订单
const completedTodayOrders = computed(() => {
  const today = new Date().toDateString();
  return completedOrders.value.filter(order => 
    new Date(order.orderTime).toDateString() === today
  );
});

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

// 检查是否可以推进状态
const canAdvanceStatus = (status) => {
  return status !== '已完成' && status !== '已取消' && statusFlow[status];
};

// 获取下一步操作文本
const getNextStatusText = (status) => {
  const nextStatus = statusFlow[status];
  switch (nextStatus) {
    case '制作中':
      return '开始制作';
    case '待取餐':
      return '制作完成';
    case '已完成':
      return '确认取餐';
    default:
      return '下一步';
  }
};

// 推进订单状态
const advanceOrderStatus = async (order) => {
  const nextStatus = statusFlow[order.status];
  if (!nextStatus) return;

  try {
    await store.dispatch('order/updateOrderStatus', {
      orderId: order.id,
      status: nextStatus
    });
    store.dispatch('showSuccess', `订单 ${order.id} 状态已更新为: ${nextStatus}`);
  } catch (error) {
    store.dispatch('showError', '更新订单状态失败');
  }
};

// 取消/拒绝订单
const cancelOrder = async (orderId) => {
  if (!confirm('确定要拒绝这个订单吗？')) return;
  
  try {
    await store.dispatch('order/updateOrderStatus', {
      orderId,
      status: '已取消'
    });
    store.dispatch('showSuccess', '订单已拒绝');
  } catch (error) {
    store.dispatch('showError', '拒绝订单失败');
  }
};

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true;
    await store.dispatch('order/fetchOrderList');
  } catch (error) {
    store.dispatch('showError', '获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 组件挂载时的操作
onMounted(async () => {
  await fetchOrders();
  
  // 定时刷新订单 (30秒)
  refreshInterval = setInterval(() => {
    fetchOrders();
  }, 30000);
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>