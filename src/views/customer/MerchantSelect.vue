<template>
  <div class="merchant-select-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold text-gray-800">选择商家</h1>
        <p class="text-gray-600 mt-1">请选择您要点餐的商家</p>
      </div>
    </div>

    <!-- 商家列表 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <el-spinner size="large" />
        <el-text class="ml-2">加载中...</el-text>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <el-result icon="error" :title="error">
          <template #extra>
            <el-button type="primary" @click="fetchMerchants">重试</el-button>
          </template>
        </el-result>
      </div>
      
      <!-- 商家列表 -->
      <div v-else>
        <!-- 搜索框 -->
        <div class="mb-6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商家名称"
            clearable
            size="large"
            :prefix-icon="Search"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        
        <!-- 商家网格 -->
        <el-row :gutter="20">
          <el-col
            v-for="merchant in filteredMerchants"
            :key="merchant.id"
            :xs="24" :sm="12" :md="8" :lg="6"
            class="mb-5"
          >
            <el-card 
              class="merchant-card cursor-pointer hover:shadow-lg transition-shadow"
              @click="selectMerchant(merchant)"
              shadow="hover"
            >
              <div class="merchant-card-content">
                <!-- 商家图片 -->
                <div class="merchant-image">
                  <el-image
                    v-if="merchant.logo"
                    :src="merchant.logo"
                    :alt="merchant.name"
                    class="w-full h-32 object-cover rounded-t-lg"
                    fit="cover"
                  >
                    <template #error>
                      <div class="image-slot">
                        <el-icon size="40"><Shop /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div v-else class="image-slot bg-gray-100 h-32 flex items-center justify-center rounded-t-lg">
                    <el-icon size="40"><Shop /></el-icon>
                  </div>
                </div>
                
                <!-- 商家信息 -->
                <div class="merchant-info p-4">
                  <h3 class="merchant-name font-bold text-lg mb-2 truncate">{{ merchant.name }}</h3>
                  <p class="merchant-description text-gray-600 text-sm mb-3 line-clamp-2">
                    {{ merchant.description || '暂无描述' }}
                  </p>
                  
                  <div class="merchant-meta text-xs text-gray-500">
                    <div class="flex items-center mb-1">
                      <el-rate 
                        v-model="merchant.rating" 
                        disabled 
                        size="small"
                        :max="5"
                      />
                      <span class="ml-1">{{ merchant.rating }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>月售{{ merchant.salesVolume || 0 }}单</span>
                      <span>起送￥{{ merchant.minOrderAmount || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 没有商家时显示 -->
        <div v-if="filteredMerchants.length === 0" class="text-center py-12">
          <el-empty description="暂无符合条件的商家" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, Shop } from '@element-plus/icons-vue';

const store = useStore();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const error = ref(null);
const searchKeyword = ref('');

// 计算属性
const merchantList = computed(() => store.state.merchant.merchantList);
const merchantLoading = computed(() => store.state.merchant.loading);

// 过滤商家列表
const filteredMerchants = computed(() => {
  if (!searchKeyword.value) {
    return merchantList.value.filter(merchant => merchant.status === 1);
  }
  
  const keyword = searchKeyword.value.toLowerCase();
  return merchantList.value.filter(merchant => 
    merchant.status === 1 &&
    (merchant.name.toLowerCase().includes(keyword) || 
     (merchant.description && merchant.description.toLowerCase().includes(keyword)))
  );
});

// 获取商家列表
const fetchMerchants = async () => {
  try {
    loading.value = true;
    error.value = null;
    await store.dispatch('merchant/fetchActiveMerchants');
  } catch (err) {
    error.value = '获取商家列表失败';
    console.error('获取商家列表失败:', err);
  } finally {
    loading.value = false;
  }
};

// 搜索商家
const handleSearch = () => {
  // 搜索逻辑已经在computed属性中实现
};

// 选择商家
const selectMerchant = (merchant) => {
  // 保存选中的商家到store
  store.commit('merchant/SET_MERCHANT_INFO', merchant);
  
  // 跳转到菜单页面，并传递商家ID
  router.push({
    name: 'CustomerMenu',
    query: { merchantId: merchant.id }
  });
};

// 组件挂载时加载数据
onMounted(() => {
  fetchMerchants();
});
</script>

<style scoped>
.merchant-select-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
}

.merchant-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.merchant-card:hover {
  transform: translateY(-4px);
}

.merchant-image {
  width: 100%;
  height: 128px;
  overflow: hidden;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  color: #909399;
}

.merchant-name {
  color: #303133;
}

.merchant-description {
  min-height: 40px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>