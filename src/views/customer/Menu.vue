<template>
  <div class="menu-page">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <div class="container mx-auto px-4 py-4 flex items-center">
        <el-button 
          icon="ArrowLeft" 
          @click="goBackToMerchants"
          circle
          size="small"
          class="mr-3"
        />
        <div>
          <h1 class="text-xl font-bold text-gray-800">{{ currentMerchant?.name || '商家菜单' }}</h1>
          <p class="text-gray-600 text-sm">{{ currentMerchant?.description || '请选择商家查看菜单' }}</p>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <el-affix :offset="60">
      <div class="bg-white shadow-sm py-3">
        <div class="container mx-auto px-4">
          <el-scrollbar>
            <div class="flex space-x-2 pb-2">
              <el-tag
                :type="selectedCategory === '' ? 'danger' : 'info'"
                :effect="selectedCategory === '' ? 'dark' : 'light'"
                @click="selectedCategory = ''"
                class="cursor-pointer"
                size="large"
              >
                全部
              </el-tag>
              <el-tag
                v-for="category in categories"
                :key="category"
                :type="selectedCategory === category ? 'danger' : 'info'"
                :effect="selectedCategory === category ? 'dark' : 'light'"
                @click="selectedCategory = category"
                class="cursor-pointer"
                size="large"
              >
                {{ category }}
              </el-tag>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </el-affix>

    <!-- 商家菜单列表 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 加载状态 -->
      <div v-if="loading || merchantLoading" class="flex justify-center items-center py-12">
        <el-spinner size="large" />
        <el-text class="ml-2">加载中...</el-text>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <el-result icon="error" :title="error">
          <template #extra>
            <el-button type="primary" @click="fetchMenuData">重试</el-button>
          </template>
        </el-result>
      </div>
      
      <!-- 菜单内容 -->
      <div v-else-if="currentMerchant">
        <!-- 该商家的菜品网格 -->
        <el-row :gutter="16" class="menu-grid">
          <el-col
            v-for="(item, index) in filteredDishes"
            :key="`dish-${item?.id || index}`"
            :xs="24" :sm="12" :md="8" :lg="6" :xl="6"
            class="mb-4"
          >
            <el-card 
              class="menu-item-card"
              :body-style="{ padding: '0' }"
              shadow="hover"
              v-if="item && typeof item === 'object'"
            >
              <!-- 商品图片 -->
              <div class="relative h-48">
                <el-image
                  v-if="item.imageUrl || item.image"
                  :src="item.imageUrl || item.image"
                  :alt="item.name"
                  class="w-full h-full"
                  fit="cover"
                  :preview-src-list="[item.imageUrl || item.image]"
                  @error="handleImageError"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon size="60"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="image-slot">
                  <el-icon size="60"><Dish /></el-icon>
                </div>
                
                <!-- 售罄遮罩 -->
                <div v-if="item.status === 0 || !item.available" class="sold-out-overlay">
                  <el-tag type="danger" size="large">暂时售罄</el-tag>
                </div>
              </div>
              
              <!-- 商品信息 -->
              <div class="p-4">
                <el-text class="menu-item-name" size="large" tag="h3">{{ item.name }}</el-text>
                <el-text v-if="item.description" class="menu-item-desc" type="info" line-clamp="2">
                  {{ item.description }}
                </el-text>
                
                <div class="flex items-center justify-between mt-3">
                  <div class="price-section">
                    <el-text class="current-price" type="danger" size="large" tag="strong">
                      ￥{{ item.price }}
                    </el-text>
                    <el-text 
                      v-if="item.originalPrice && item.originalPrice > item.price" 
                      class="original-price ml-2" 
                      type="info" 
                      size="small"
                      tag="del"
                    >
                      ￥{{ item.originalPrice }}
                    </el-text>
                    <!-- 库存信息 -->
                    <div class="mt-1">
                      <el-text v-if="item.stock === 0" type="danger" size="small">
                        已售罄
                      </el-text>
                      <el-text v-else-if="item.stock > 0 && item.stock <= 10" type="warning" size="small">
                        仅剩{{ item.stock }}件
                      </el-text>
                      <el-text v-else-if="item.stock === -1" type="success" size="small">
                        库存充足
                      </el-text>
                    </div>
                  </div>
                  
                  <!-- 添加到购物车按钮 -->
                  <div v-if="item.status === 1 && (item.available !== false) && item.stock !== 0">
                    <!-- 数量控制 -->
                    <div v-if="getCartItemQuantity(item.id) > 0" class="quantity-control">
                      <el-button
                        @click="decreaseQuantity(item)"
                        :icon="Minus"
                        size="small"
                        circle
                      />
                      <el-text class="quantity-text">{{ getCartItemQuantity(item.id) }}</el-text>
                      <el-button
                        @click="increaseQuantity(item)"
                        :icon="Plus"
                        type="danger"
                        size="small"
                        circle
                        :disabled="item.stock !== -1 && getCartItemQuantity(item.id) >= item.stock"
                      />
                    </div>
                    
                    <!-- 添加按钮 -->
                    <el-button
                      v-else
                      @click="addToCart(item)"
                      type="danger"
                      size="small"
                      :icon="ShoppingCart"
                    >
                      加入购物车
                    </el-button>
                  </div>
                  
                  <el-text v-else-if="item.stock === 0" type="danger" size="small">
                    已售罄
                  </el-text>
                  
                  <el-text v-else type="info" size="small">
                    暂不可点
                  </el-text>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 商家无菜品时显示 -->
        <div v-if="filteredDishes.length === 0" class="text-center py-8">
          <el-empty description="该商家暂无商品" />
        </div>
      </div>
      
      <!-- 未选择商家时显示 -->
      <div v-else class="text-center py-12">
        <el-result icon="info" title="请选择商家" sub-title="请先选择一个商家查看其菜单">
          <template #extra>
            <el-button type="primary" @click="goBackToMerchants">选择商家</el-button>
          </template>
        </el-result>
      </div>
    </div>
    
    <!-- 购物车悬浮按钮 -->
    <el-backtop v-if="cartItemCount > 0" :right="20" :bottom="80">
      <router-link to="/customer/cart">
        <el-badge :value="cartItemCount" :max="99">
          <el-button 
            type="danger" 
            :icon="ShoppingCart" 
            circle 
            size="large"
            class="cart-float-btn"
          >
          </el-button>
        </el-badge>
      </router-link>
    </el-backtop>
    
    <!-- 购物车统计信息 -->
    <div v-if="cartItemCount > 0" class="cart-summary">
      <el-card class="cart-summary-card" shadow="always">
        <div class="flex items-center justify-between">
          <div class="cart-info">
            <el-text>已选 {{ cartItemCount }} 件商品</el-text>
            <el-text class="total-price" type="danger" size="large" tag="strong">
              合计：￥{{ cartTotal.toFixed(2) }}
            </el-text>
          </div>
          <router-link to="/customer/cart">
            <el-button type="danger" size="large">去结算</el-button>
          </router-link>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Picture, Dish, Minus, Plus, ShoppingCart, ArrowLeft } from '@element-plus/icons-vue';

const store = useStore();
const route = useRoute();
const router = useRouter();

const selectedCategory = ref('');
const currentMerchant = ref(null);

// 计算属性
const dishList = computed(() => {
  // 确保返回的是数组
  const list = store.state.dish.dishList;
  console.log(store.state.dish)
  return Array.isArray(list) ? list : [];
});
const loading = computed(() => store.state.dish.loading);
const error = computed(() => store.state.dish.error);
const merchantList = computed(() => store.state.merchant.merchantList);
const merchantLoading = computed(() => store.state.merchant.loading);
const cartItems = computed(() => store.state.cart.items);
const cartItemCount = computed(() => store.getters['cart/cartItemCount']);
const cartTotal = computed(() => store.state.cart.total);

// 获取所有分类
const categories = computed(() => {
  // 确保 dishList.value 是数组
  const dishesArray = Array.isArray(dishList.value) ? dishList.value : [];
  // 从菜品中提取分类信息
  const categorySet = new Set();
  dishesArray.forEach(item => {
    if (item && item.categoryName) {
      categorySet.add(item.categoryName);
    }
  });
  return Array.from(categorySet);
});

// 过滤菜品（按分类）
const filteredDishes = computed(() => {
  // 确保 dishList.value 是数组
  console.log('dishList:', dishList);
  const dishesArray = Array.isArray(dishList.value) ? dishList.value : [];
  let dishes = dishesArray.filter(item => item && typeof item === 'object');
 
  if (selectedCategory.value) {
    dishes = dishes.filter(dish => 
      dish.categoryName === selectedCategory.value || 
      dish.category === selectedCategory.value
    );
  }
  
  return dishes;
});

// 获取购物车中商品的数量
const getCartItemQuantity = (itemId) => {
  if (!itemId) return 0;
  const cartItem = cartItems.value.find(item => item && item.id === itemId);
  return cartItem ? cartItem.quantity : 0;
};

// 返回商家选择页面
const goBackToMerchants = () => {
  router.push('/customer/merchants');
};

// 加载菜单数据
const fetchMenuData = async (merchantId) => {
  if (!merchantId) return;
  
  try {
    // 获取商家信息
    const merchant = merchantList.value.find(m => m && m.id === merchantId);
    if (merchant) {
      currentMerchant.value = merchant;
    }
    
    // 获取该商家的菜品
    await store.dispatch('dish/fetchDishList', {
      merchantId: merchantId
    });
  } catch (error) {
    console.error('获取菜单数据失败:', error);
    ElMessage.error('获取菜单数据失败');
  }
};

// 添加到购物车
const addToCart = async (item) => {
  // 检查参数
  if (!item || !item.id) {
    ElMessage.error('商品信息不完整');
    return;
  }
  
  // 检查库存
  if (item.stock === 0) {
    ElMessage.error('商品已售罄');
    return;
  }
  
  try {
    await store.dispatch('cart/addToCart', {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.imageUrl || item.image,
      quantity: 1
    });
    ElMessage.success(`${item.name} 已加入购物车`);
  } catch (error) {
    ElMessage.error(error.message || '加入购物车失败');
    console.error('添加到购物车失败:', error);
  }
};

// 增加数量
const increaseQuantity = async (item) => {
  // 检查参数
  if (!item || !item.id) {
    ElMessage.error('商品信息不完整');
    return;
  }
  
  // 检查库存
  const currentQuantity = getCartItemQuantity(item.id);
  if (item.stock !== -1 && currentQuantity >= item.stock) {
    ElMessage.error(`库存不足，仅剩${item.stock}件`);
    return;
  }
  
  try {
    await store.dispatch('cart/updateCartItem', {
      id: item.id,
      quantity: currentQuantity + 1
    });
  } catch (error) {
    ElMessage.error(error.message || '更新数量失败');
    console.error('增加数量失败:', error);
  }
};

// 减少数量
const decreaseQuantity = async (item) => {
  // 检查参数
  if (!item || !item.id) {
    ElMessage.error('商品信息不完整');
    return;
  }
  
  try {
    const currentQuantity = getCartItemQuantity(item.id);
    if (currentQuantity > 1) {
      await store.dispatch('cart/updateCartItem', {
        id: item.id,
        quantity: currentQuantity - 1
      });
    } else {
      await store.dispatch('cart/removeFromCart', item.id);
    }
  } catch (error) {
    ElMessage.error('更新数量失败');
    console.error('减少数量失败:', error);
  }
};

// 图片加载错误处理
const handleImageError = (e) => {
  console.log('图片加载失败:', e);
};

// 监听路由参数变化
watch(
  () => route.query.merchantId,
  (newMerchantId) => {
    if (newMerchantId) {
      fetchMenuData(parseInt(newMerchantId));
    }
  },
  { immediate: true }
);

// 组件挂载时确保商家列表已加载
onMounted(async () => {
  if (merchantList.value.length === 0) {
    await store.dispatch('merchant/fetchActiveMerchants');
  }
});
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
}

/* 菜品卡片 */
.menu-item-card {
  height: 100%;
  transition: transform 0.2s ease;
  border-radius: 8px;
}

.menu-item-card:hover {
  transform: translateY(-2px);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.sold-out-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-item-name {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.menu-item-desc {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
}

.price-section {
  display: flex;
  align-items: center;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
}

.original-price {
  text-decoration: line-through;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-text {
  min-width: 20px;
  text-align: center;
  font-weight: 600;
}

.cart-float-btn {
  font-size: 20px;
}

.cart-summary {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 12px;
  background: transparent;
}

.cart-summary-card {
  border-radius: 12px;
}

.cart-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.total-price {
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-summary {
    padding: 8px;
  }
  
  .menu-grid .el-col {
    margin-bottom: 12px;
  }
  
  .merchant-meta {
    font-size: 12px;
  }
  
  .merchant-name {
    font-size: 18px;
  }
  
  .merchant-description {
    font-size: 13px;
  }
}
</style>