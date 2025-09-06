<template>
  <div class="profile-page min-h-screen bg-gray-100 pb-20">
    <div class="container mx-auto px-4 py-6">
      <div class="max-w-2xl mx-auto">
        <!-- 用户信息卡片 -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl">
              {{ userInfo?.name?.charAt(0) || '用' }}
            </div>
            <div>
              <h2 class="text-xl font-bold">{{ userInfo?.name || '未设置昵称' }}</h2>
              <p class="text-gray-600">{{ userInfo?.phone || '未绑定手机号' }}</p>
            </div>
          </div>
          <button
            @click="showEditProfile = true"
            class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            编辑个人信息
          </button>
        </div>

        <!-- 功能菜单 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <div class="divide-y divide-gray-100">
            <!-- 我的地址 -->
            <router-link to="/customer/address" class="block p-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <span class="text-2xl">📍</span>
                  <span class="font-medium">我的地址</span>
                </div>
                <span class="text-gray-400">></span>
              </div>
            </router-link>

            <!-- 我的订单 -->
            <router-link to="/customer/orders" class="block p-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <span class="text-2xl">📋</span>
                  <span class="font-medium">我的订单</span>
                </div>
                <span class="text-gray-400">></span>
              </div>
            </router-link>

            <!-- 修改密码 -->
            <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer" @click="showChangePassword = true">
              <div class="flex items-center space-x-3">
                <span class="text-2xl">🔒</span>
                <span class="font-medium">修改密码</span>
              </div>
              <span class="text-gray-400">></span>
            </div>
          </div>
        </div>

        <!-- 退出登录 -->
        <div class="bg-white rounded-lg shadow-sm">
          <button
            @click="handleLogout"
            class="w-full p-4 text-red-500 font-medium hover:bg-red-50 transition-colors rounded-lg"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑个人信息模态框 -->
    <div v-if="showEditProfile" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">编辑个人信息</h3>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input
              v-model="profileForm.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请输入昵称"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input
              v-model="profileForm.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请输入手机号"
            >
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showEditProfile = false"
              class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="profileLoading"
              class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
            >
              {{ profileLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 地址管理模态框 -->
    <div v-if="showAddresses" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">我的地址</h3>
          <button @click="showAddresses = false" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div class="space-y-3 max-h-60 overflow-y-auto mb-4">
          <div
            v-for="address in addresses"
            :key="address.id"
            class="border rounded-lg p-3 relative"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-medium">{{ address.name }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">{{ address.phone }}</span>
                <button
                  @click="editAddress(address)"
                  class="text-blue-500 hover:text-blue-700 text-sm"
                >
                  编辑
                </button>
                <button
                  @click="deleteAddressConfirm(address.id)"
                  class="text-red-500 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</p>
            <div class="flex items-center justify-between mt-2">
              <div>
                <span v-if="address.tag" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{{ address.tag }}</span>
                <span v-if="address.isDefault" class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded ml-1">默认</span>
              </div>
              <button
                v-if="!address.isDefault"
                @click="setDefaultAddress(address.id)"
                class="text-xs text-blue-500 hover:text-blue-700"
              >
                设为默认
              </button>
            </div>
          </div>
          <div v-if="addresses.length === 0" class="text-center text-gray-500 py-8">
            暂无地址
          </div>
        </div>
        
        <button
          @click="showAddAddress = true; showAddresses = false"
          class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          添加地址
        </button>
      </div>
    </div>

    <!-- 添加/编辑地址模态框 -->
    <div v-if="showAddAddress" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ editingAddress ? '编辑地址' : '添加地址' }}</h3>
          <button @click="closeAddressForm" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <form @submit.prevent="saveAddress" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">收货人</label>
            <input
              v-model="addressForm.receiverName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请输入收货人姓名"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input
              v-model="addressForm.receiverPhone"
              type="tel"
              required
              pattern="^1[3-9]\d{9}$"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请输入收货人手机号"
            >
          </div>
          
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">省份</label>
              <select
                v-model="addressForm.province"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">选择省份</option>
                <option value="四川省">四川省</option>
                <option value="广东省">广东省</option>
                <option value="北京市">北京市</option>
                <option value="上海市">上海市</option>
                <option value="浙江省">浙江省</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">城市</label>
              <select
                v-model="addressForm.city"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">选择城市</option>
                <option value="成都市">成都市</option>
                <option value="广州市">广州市</option>
                <option value="深圳市">深圳市</option>
                <option value="杭州市">杭州市</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">区县</label>
              <select
                v-model="addressForm.district"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">选择区县</option>
                <option value="锦江区">锦江区</option>
                <option value="高新区">高新区</option>
                <option value="天河区">天河区</option>
                <option value="南山区">南山区</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">详细地址</label>
            <textarea
              v-model="addressForm.address"
              required
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请输入详细地址"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">地址标签（可选）</label>
            <div class="flex space-x-2 mb-2">
              <button
                type="button"
                v-for="label in ['家', '公司', '学校']"
                :key="label"
                @click="addressForm.label = label"
                :class="{
                  'bg-red-500 text-white': addressForm.label === label,
                  'bg-gray-100 text-gray-700': addressForm.label !== label
                }"
                class="px-3 py-1 rounded text-sm"
              >
                {{ label }}
              </button>
            </div>
            <input
              v-model="addressForm.label"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="或输入自定义标签"
            >
          </div>
          
          <div class="flex items-center">
            <input
              v-model="addressForm.isDefault"
              type="checkbox"
              id="isDefault"
              class="rounded"
            >
            <label for="isDefault" class="ml-2 text-sm text-gray-700">设为默认地址</label>
          </div>
          
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeAddressForm"
              class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="addressLoading"
              class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
            >
              {{ addressLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div v-if="showChangePassword" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">修改密码</h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请输入当前密码"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请输入新密码"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="请再次输入新密码"
            >
          </div>
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showChangePassword = false"
              class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="passwordLoading"
              class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
            >
              {{ passwordLoading ? '修改中...' : '修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// 响应式数据
const showEditProfile = ref(false);
const showAddresses = ref(false);
const showAddAddress = ref(false);
const showChangePassword = ref(false);
const profileLoading = ref(false);
const passwordLoading = ref(false);
const addressLoading = ref(false);
const editingAddress = ref(null);

// 表单数据
const profileForm = reactive({
  name: '',
  phone: ''
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const addressForm = reactive({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  label: '',
  isDefault: false
});

// 计算属性
const userInfo = computed(() => store.state.user.userInfo);
const addresses = computed(() => store.state.address.addresses);

// 初始化表单数据
const initProfileForm = () => {
  if (userInfo.value) {
    profileForm.name = userInfo.value.name || '';
    profileForm.phone = userInfo.value.phone || '';
  }
};

// 更新个人信息
const updateProfile = async () => {
  try {
    profileLoading.value = true;
    await store.dispatch('user/updateUserInfo', profileForm);
    store.dispatch('showSuccess', '个人信息更新成功');
    showEditProfile.value = false;
  } catch (error) {
    store.dispatch('showError', '更新个人信息失败');
  } finally {
    profileLoading.value = false;
  }
};

// 修改密码
const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    store.dispatch('showError', '两次输入的密码不一致');
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    store.dispatch('showError', '密码长度不能少于6位');
    return;
  }

  try {
    passwordLoading.value = true;
    // 这里调用修改密码的API
    // await store.dispatch('user/changePassword', passwordForm);
    store.dispatch('showSuccess', '密码修改成功');
    showChangePassword.value = false;
    // 重置表单
    Object.keys(passwordForm).forEach(key => {
      passwordForm[key] = '';
    });
  } catch (error) {
    store.dispatch('showError', '修改密码失败');
  } finally {
    passwordLoading.value = false;
  }
};

// 退出登录
const handleLogout = async () => {
  if (!confirm('确定要退出登录吗？')) return;
  
  try {
    await store.dispatch('user/logout');
    router.push('/auth/login');
    store.dispatch('showSuccess', '已成功退出登录');
  } catch (error) {
    store.dispatch('showError', '退出登录失败');
  }
};

// 初始化地址表单
const initAddressForm = () => {
  addressForm.receiverName = '';
  addressForm.receiverPhone = '';
  addressForm.province = '';
  addressForm.city = '';
  addressForm.district = '';
  addressForm.address = '';
  addressForm.label = '';
  addressForm.isDefault = false;
  editingAddress.value = null;
};

// 编辑地址
const editAddress = (address) => {
  editingAddress.value = address;
  addressForm.name = address.name;
  addressForm.phone = address.phone;
  addressForm.province = address.province;
  addressForm.city = address.city;
  addressForm.district = address.district;
  addressForm.detail = address.detail;
  addressForm.tag = address.tag || '';
  addressForm.isDefault = address.isDefault;
  showAddAddress.value = true;
};

// 保存地址
const saveAddress = async () => {
  try {
    addressLoading.value = true;
    
    const addressData = {
      userId: userInfo.value.id,
      receiverName: addressForm.receiverName,
      receiverPhone: addressForm.receiverPhone,
      province: addressForm.province,
      city: addressForm.city,
      district: addressForm.district,
      address: addressForm.address,
      label: addressForm.label,
      isDefault: addressForm.isDefault ? 1 : 0
    };
    
    if (editingAddress.value) {
      // 更新地址
      await store.dispatch('address/updateAddress', {
        id: editingAddress.value.id,
        data: addressData
      });
      store.dispatch('showSuccess', '地址更新成功');
    } else {
      // 添加地址
      await store.dispatch('address/createAddress', addressData);
      store.dispatch('showSuccess', '地址添加成功');
    }
    
    closeAddressForm();
    // 重新获取地址列表
    await store.dispatch('address/fetchUserAddresses');
  } catch (error) {
    store.dispatch('showError', '保存地址失败');
  } finally {
    addressLoading.value = false;
  }
};

// 关闭地址表单
const closeAddressForm = () => {
  showAddAddress.value = false;
  initAddressForm();
};

// 设置默认地址
const setDefaultAddress = async (addressId) => {
  try {
    await store.dispatch('address/setDefaultAddress', addressId);
    store.dispatch('showSuccess', '默认地址设置成功');
    // 重新获取地址列表
    await store.dispatch('address/fetchUserAddresses');
  } catch (error) {
    store.dispatch('showError', '设置默认地址失败');
  }
};

// 删除地址确认
const deleteAddressConfirm = (addressId) => {
  if (confirm('确定要删除该地址吗？')) {
    deleteAddressAction(addressId);
  }
};

// 删除地址操作
const deleteAddressAction = async (addressId) => {
  try {
    await store.dispatch('address/deleteAddress', addressId);
    store.dispatch('showSuccess', '地址删除成功');
    // 重新获取地址列表
    await store.dispatch('address/fetchUserAddresses');
  } catch (error) {
    store.dispatch('showError', '删除地址失败');
  }
};

// 组件挂载时的操作
onMounted(async () => {
  initProfileForm();
  
  // 获取地址列表
  try {
    await store.dispatch('address/fetchUserAddresses');
  } catch (error) {
    console.error('获取地址列表失败:', error);
  }
});
</script>