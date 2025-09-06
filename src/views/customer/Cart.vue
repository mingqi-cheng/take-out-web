<template>
  <div class="cart-page min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-6">
      <div class="max-w-4xl mx-auto">
        <!-- 页面标题 -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800">购物车</h1>
          <p class="text-gray-600 mt-1">{{ cartItems.length }}个商品</p>
        </div>

        <!-- 购物车内容 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 商品列表 -->
          <div class="lg:col-span-2">
            <!-- 空购物车状态 -->
            <div v-if="cartItems.length === 0" class="bg-white rounded-lg shadow-md p-8 text-center">
              <span class="text-6xl mb-4 block">🛒</span>
              <h3 class="text-lg font-medium text-gray-800 mb-2">购物车是空的</h3>
              <p class="text-gray-600 mb-6">去看看有什么好吃的吧！</p>
              <router-link
                to="/customer/menu"
                class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors inline-block"
              >
                去选购商品
              </router-link>
            </div>

            <!-- 商品卡片 -->
            <div v-else class="space-y-4">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
              >
                <!-- 商品图片 -->
                <div class="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  >
                  <div v-else class="flex items-center justify-center h-full text-gray-400">
                    <span class="text-2xl">🍽️</span>
                  </div>
                </div>

                <!-- 商品信息 -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-gray-800 truncate">{{ item.name }}</h3>
                  <p class="text-red-500 font-bold mt-1">¥{{ item.price }}</p>
                  <!-- 库存信息 -->
                  <div class="mt-1">
                    <span 
                      v-if="getItemStock(item.id) === 0" 
                      class="text-xs text-red-500 bg-red-50 px-1 py-0.5 rounded"
                    >
                      已售罄
                    </span>
                    <span 
                      v-else-if="getItemStock(item.id) > 0 && getItemStock(item.id) <= 10" 
                      class="text-xs text-orange-500 bg-orange-50 px-1 py-0.5 rounded"
                    >
                      仅剩{{ getItemStock(item.id) }}件
                    </span>
                    <span 
                      v-else-if="getItemStock(item.id) === -1" 
                      class="text-xs text-green-500 bg-green-50 px-1 py-0.5 rounded"
                    >
                      库存充足
                    </span>
                  </div>
                </div>

                <!-- 数量控制 -->
                <div class="flex items-center space-x-3">
                  <button
                    @click="decreaseQuantity(item)"
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    :disabled="loading"
                  >
                    -
                  </button>
                  <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                  <button
                    @click="increaseQuantity(item)"
                    class="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    :disabled="loading || (getItemStock(item.id) !== -1 && item.quantity >= getItemStock(item.id))"
                  >
                    +
                  </button>
                </div>

                <!-- 小计 -->
                <div class="text-right">
                  <p class="font-bold text-gray-800">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
                </div>

                <!-- 删除按钮 -->
                <button
                  @click="removeItem(item)"
                  class="text-gray-400 hover:text-red-500 transition-colors p-1"
                  :disabled="loading"
                >
                  ❌
                </button>
              </div>
            </div>
          </div>

          <!-- 订单摘要 -->
          <div v-if="cartItems.length > 0" class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 class="text-lg font-semibold mb-4">订单摘要</h3>
              
              <!-- 费用明细 -->
              <div class="space-y-3 mb-4">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">商品小计</span>
                  <span>¥{{ cartTotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">配送费</span>
                  <span>¥{{ deliveryFee.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">包装费</span>
                  <span>¥{{ packagingFee.toFixed(2) }}</span>
                </div>
                <div class="border-t pt-3 flex justify-between font-semibold">
                  <span>合计</span>
                  <span class="text-red-500">¥{{ totalAmount.toFixed(2) }}</span>
                </div>
              </div>

              <!-- 配送地址 -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">配送地址</span>
                  <button
                    @click="showAddressModal = true"
                    class="text-red-500 text-sm hover:text-red-600"
                  >
                    {{ selectedAddress ? '更改' : '选择' }}
                  </button>
                </div>
                <div v-if="selectedAddress" class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <p class="font-medium">{{ selectedAddress.name }} {{ selectedAddress.phone }}</p>
                  <p>{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</p>
                </div>
                <div v-else class="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
                  请选择配送地址
                </div>
              </div>

              <!-- 下单按钮 -->
              <button
                @click="checkout"
                :disabled="loading || !selectedAddress || cartItems.length === 0"
                class="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ loading ? '处理中...' : `结算 ¥${totalAmount.toFixed(2)}` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地址选择模态框 -->
    <div v-if="showAddressModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">选择配送地址</h3>
          <button @click="showAddressModal = false" class="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        
        <div class="space-y-3 max-h-60 overflow-y-auto">
          <div
            v-for="address in addresses"
            :key="address.id"
            @click="selectAddress(address)"
            :class="{
              'border-red-500 bg-red-50': selectedAddress?.id === address.id,
              'border-gray-200': selectedAddress?.id !== address.id
            }"
            class="border rounded-lg p-3 cursor-pointer hover:border-red-300 transition-colors"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-medium">{{ address.name }}</span>
              <span class="text-sm text-gray-500">{{ address.phone }}</span>
            </div>
            <p class="text-sm text-gray-600">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</p>
            <div v-if="address.isDefault" class="mt-1">
              <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">默认</span>
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex space-x-3">
          <button
            @click="showAddressModal = false"
            class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            @click="showAddressModal = false"
            class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
            :disabled="!selectedAddress"
          >
            确认
          </button>
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

// 响应式数据
const loading = ref(false);
const showAddressModal = ref(false);
const selectedAddress = ref(null);

// 计算属性
const cartItems = computed(() => store.state.cart.items);
const cartTotal = computed(() => store.state.cart.total);
const addresses = computed(() => store.state.address.addresses);

// 费用计算
const deliveryFee = computed(() => {
  return cartTotal.value >= 50 ? 0 : 6; // 满50免配送费
});

const packagingFee = computed(() => {
  return cartItems.value.length * 1; // 每件商品1元包装费
});

const totalAmount = computed(() => {
  return cartTotal.value + deliveryFee.value + packagingFee.value;
});

// 获取商品库存
const getItemStock = (itemId) => {
  const dish = store.state.dish.dishList.find(d => d.id === itemId);
  return dish ? dish.stock : -1;
};

// 增加商品数量
const increaseQuantity = async (item) => {
  // 检查库存
  const dish = store.state.dish.dishList.find(d => d.id === item.id);
  if (dish && dish.stock !== -1 && item.quantity >= dish.stock) {
    store.dispatch('showError', `库存不足，仅剩${dish.stock}件`);
    return;
  }
  
  try {
    loading.value = true;
    await store.dispatch('cart/updateCartItem', {
      id: item.id,
      quantity: item.quantity + 1
    });
  } catch (error) {
    store.dispatch('showError', error.message || '更新数量失败');
  } finally {
    loading.value = false;
  }
};

// 减少商品数量
const decreaseQuantity = async (item) => {
  if (item.quantity > 1) {
    try {
      loading.value = true;
      await store.dispatch('cart/updateCartItem', {
        id: item.id,
        quantity: item.quantity - 1
      });
    } catch (error) {
      store.dispatch('showError', '更新数量失败');
    } finally {
      loading.value = false;
    }
  } else {
    removeItem(item);
  }
};

// 移除商品
const removeItem = async (item) => {
  try {
    loading.value = true;
    await store.dispatch('cart/removeFromCart', item.id);
    store.dispatch('showSuccess', `${item.name} 已从购物车移除`);
  } catch (error) {
    store.dispatch('showError', '移除商品失败');
  } finally {
    loading.value = false;
  }
};

// 选择地址
const selectAddress = (address) => {
  selectedAddress.value = address;
};

// 结算
const checkout = async () => {
  if (!selectedAddress.value) {
    store.dispatch('showError', '请选择配送地址');
    return;
  }

  try {
    loading.value = true;
    
    const orderData = {
      items: cartItems.value.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      deliveryAddress: selectedAddress.value,
      totalAmount: totalAmount.value,
      deliveryFee: deliveryFee.value,
      packagingFee: packagingFee.value,
      remark: ''
    };

    const order = await store.dispatch('order/createOrder', orderData);
    
    store.dispatch('showSuccess', `订单创建成功！订单号：${order.id}`);
    router.push(`/customer/orders`);
    
  } catch (error) {
    store.dispatch('showError', '下单失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 处理图片错误
const handleImageError = (event) => {
  event.target.style.display = 'none';
};

// 组件挂载时获取地址列表
onMounted(async () => {
  try {
    await store.dispatch('address/fetchUserAddresses');
    // 设置默认地址
    const defaultAddr = store.getters['address/defaultAddress'];
    if (defaultAddr) {
      selectedAddress.value = defaultAddr;
    }
  } catch (error) {
    console.error('获取地址列表失败:', error);
  }
});
</script>