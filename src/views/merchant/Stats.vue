<template>
  <div class="stats-page p-6">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">统计报表</h2>
        <p class="text-gray-600 mt-1">查看店铺经营数据和分析报告</p>
      </div>

      <!-- 核心指标卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-500">
              📊
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ salesStats.todayRevenue?.toFixed(2) || '0.00' }}</div>
              <div class="text-gray-600">今日收入 (元)</div>
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span class="text-green-500">+{{ salesStats.growth || 0 }}%</span>
            <span class="text-gray-500 ml-1">较昨日</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-500">
              📋
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ orderStats.todayCount || 0 }}</div>
              <div class="text-gray-600">今日订单数</div>
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span class="text-blue-500">{{ orderStats.completedCount || 0 }}</span>
            <span class="text-gray-500 ml-1">已完成</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-500">
              💰
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">
                {{ orderStats.todayCount > 0 ? (salesStats.todayRevenue / orderStats.todayCount).toFixed(2) : '0.00' }}
              </div>
              <div class="text-gray-600">平均客单价 (元)</div>
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span class="text-gray-500">订单均价</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-500">
              ⏱️
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ orderStats.pendingCount || 0 }}</div>
              <div class="text-gray-600">待处理订单</div>
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span class="text-orange-500">{{ orderStats.preparingCount || 0 }}</span>
            <span class="text-gray-500 ml-1">制作中</span>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- 收入趋势图 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">收入趋势</h3>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <div class="text-4xl mb-2">📈</div>
              <div>图表组件待集成</div>
              <div class="text-sm mt-2">
                近7日收入：¥{{ salesStats.thisWeekRevenue?.toFixed(2) || '0.00' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 订单趋势图 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">订单趋势</h3>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <div class="text-4xl mb-2">📊</div>
              <div>图表组件待集成</div>
              <div class="text-sm mt-2">
                近7日订单：{{ orderStats.thisWeekCount || 0 }}单
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 热销商品排行 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 商品排行榜 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">热销商品 TOP 5</h3>
          <div v-if="menuRanking.length > 0" class="space-y-3">
            <div
              v-for="(item, index) in menuRanking.slice(0, 5)"
              :key="item.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  :class="{
                    'bg-yellow-500': index === 0,
                    'bg-gray-400': index === 1,
                    'bg-orange-500': index === 2,
                    'bg-blue-500': index > 2
                  }"
                  class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-sm text-gray-500">¥{{ item.price }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium">{{ item.salesCount || 0 }}份</div>
                <div class="text-sm text-gray-500">
                  ¥{{ (item.salesCount * item.price).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">🍽️</div>
            <div>暂无销售数据</div>
          </div>
        </div>

        <!-- 时段分析 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">订单时段分布</h3>
          <div class="space-y-3">
            <div v-for="period in timePeriods" :key="period.label" class="flex items-center justify-between">
              <span class="text-gray-700">{{ period.label }}</span>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    :style="{ width: `${period.percentage}%` }"
                    class="bg-blue-500 h-2 rounded-full"
                  ></div>
                </div>
                <span class="text-sm text-gray-600 w-12 text-right">{{ period.count }}单</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 刷新按钮 -->
      <div class="mt-8 text-center">
        <button
          @click="refreshStats"
          :disabled="loading"
          class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          {{ loading ? '刷新中...' : '刷新数据' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const loading = ref(false);

// 计算属性
const salesStats = computed(() => store.state.stats.salesStats);
const orderStats = computed(() => store.state.stats.orderStats);
const menuRanking = computed(() => store.state.stats.menuRanking);

// 模拟时段数据
const timePeriods = computed(() => {
  const totalOrders = orderStats.value.todayCount || 0;
  return [
    { label: '早餐 (7:00-10:00)', count: Math.floor(totalOrders * 0.15), percentage: 15 },
    { label: '午餐 (11:00-14:00)', count: Math.floor(totalOrders * 0.45), percentage: 45 },
    { label: '下午茶 (14:00-17:00)', count: Math.floor(totalOrders * 0.15), percentage: 15 },
    { label: '晚餐 (17:00-21:00)', count: Math.floor(totalOrders * 0.25), percentage: 25 }
  ];
});

// 刷新统计数据
const refreshStats = async () => {
  try {
    loading.value = true;
    await Promise.all([
      store.dispatch('stats/fetchSalesStats'),
      store.dispatch('stats/fetchOrderStats'),
      store.dispatch('stats/fetchMenuRanking')
    ]);
    store.dispatch('showSuccess', '数据已刷新');
  } catch (error) {
    store.dispatch('showError', '刷新数据失败');
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(async () => {
  await refreshStats();
});
</script>