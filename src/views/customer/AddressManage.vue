<template>
  <div class="address-manage-page min-h-screen bg-gray-100 pb-20">
    <div class="container mx-auto px-4 py-6">
      <div class="max-w-2xl mx-auto">
        <!-- 页面标题 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <button
              @click="$router.back()"
              class="text-gray-600 hover:text-gray-800"
            >
              ← 返回
            </button>
            <h1 class="text-xl font-bold">地址管理</h1>
          </div>
          <button
            @click="showAddAddress = true"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            添加地址
          </button>
        </div>

        <!-- 地址列表 -->
        <div class="space-y-4">
          <el-card
            v-for="address in addresses"
            :key="address.id"
            class="address-card"
            :class="{ 'default-address': address.isDefault }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="font-medium text-lg">{{ address.name }}</span>
                  <span class="text-gray-600">{{ address.phone }}</span>
                  <el-tag v-if="address.tag" type="info" size="small">{{ address.tag }}</el-tag>
                  <el-tag v-if="address.isDefault" type="danger" size="small">默认</el-tag>
                </div>
                <p class="text-gray-700 mb-3">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</p>
              </div>
              
              <div class="flex items-center space-x-2">
                <el-button
                  @click="editAddress(address)"
                  type="primary"
                  size="small"
                  plain
                >
                  编辑
                </el-button>
                <el-button
                  v-if="!address.isDefault"
                  @click="setDefaultAddress(address.id)"
                  size="small"
                  plain
                >
                  设为默认
                </el-button>
                <el-button
                  @click="deleteAddressConfirm(address.id)"
                  type="danger"
                  size="small"
                  plain
                >
                  删除
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- 空状态 -->
          <div v-if="addresses.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📍</div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">暂无收货地址</h3>
            <p class="text-gray-600 mb-6">添加收货地址，享受便捷配送服务</p>
            <el-button
              @click="showAddAddress = true"
              type="primary"
              size="large"
            >
              添加地址
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑地址对话框 -->
    <el-dialog
      v-model="showAddAddress"
      :title="editingAddress ? '编辑地址' : '添加地址'"
      width="90%"
      style="max-width: 500px"
      :before-close="closeAddressForm"
    >
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressRules"
        label-width="80px"
        @submit.prevent="saveAddress"
      >
        <el-form-item label="收货人" prop="name">
          <el-input
            v-model="addressForm.name"
            placeholder="请输入收货人姓名"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="addressForm.phone"
            placeholder="请输入收货人手机号"
          />
        </el-form-item>
        
        <el-form-item label="地区" prop="region">
          <div class="grid grid-cols-3 gap-2 w-full">
            <el-select
              v-model="addressForm.province"
              placeholder="省份"
              @change="onProvinceChange"
            >
              <el-option
                v-for="province in provinces"
                :key="province"
                :label="province"
                :value="province"
              />
            </el-select>
            <el-select
              v-model="addressForm.city"
              placeholder="城市"
              @change="onCityChange"
            >
              <el-option
                v-for="city in cities"
                :key="city"
                :label="city"
                :value="city"
              />
            </el-select>
            <el-select
              v-model="addressForm.district"
              placeholder="区县"
            >
              <el-option
                v-for="district in districts"
                :key="district"
                :label="district"
                :value="district"
              />
            </el-select>
          </div>
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="addressForm.detail"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="地址标签" prop="tag">
          <div class="flex flex-wrap gap-2 mb-2">
            <el-button
              v-for="label in ['家', '公司', '学校']"
              :key="label"
              @click="addressForm.tag = label"
              :type="addressForm.tag === label ? 'primary' : 'default'"
              size="small"
              plain
            >
              {{ label }}
            </el-button>
          </div>
          <el-input
            v-model="addressForm.tag"
            placeholder="或输入自定义标签"
            size="small"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">
            设为默认地址
          </el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <el-button @click="closeAddressForm">取消</el-button>
          <el-button
            type="primary"
            @click="saveAddress"
            :loading="addressLoading"
          >
            {{ addressLoading ? '保存中...' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import { provinces, cityMap, districtMap } from '../../utils/regionData.js';

const store = useStore();

// 响应式数据
const showAddAddress = ref(false);
const addressLoading = ref(false);
const editingAddress = ref(null);
const addressFormRef = ref(null);

// 地址表单数据
const addressForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  latitude: null,
  longitude: null,
  tag: '',
  isDefault: false
});

// 表单验证规则
const addressRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { max: 50, message: '姓名长度不能超过50个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  district: [
    { required: true, message: '请选择区县', trigger: 'change' }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { max: 255, message: '详细地址不能超过255个字符', trigger: 'blur' }
  ],
  tag: [
    { max: 20, message: '地址标签不能超过20个字符', trigger: 'blur' }
  ]
};



const cities = computed(() => cityMap[addressForm.province] || []);
const districts = computed(() => districtMap[addressForm.city] || []);

// 计算属性
const addresses = computed(() => store.state.address.addresses);

// 省份变化
const onProvinceChange = () => {
  addressForm.city = '';
  addressForm.district = '';
};

// 城市变化
const onCityChange = () => {
  addressForm.district = '';
};

// 初始化地址表单
const initAddressForm = () => {
  addressForm.name = '';
  addressForm.phone = '';
  addressForm.province = '';
  addressForm.city = '';
  addressForm.district = '';
  addressForm.detail = '';
  addressForm.latitude = null;
  addressForm.longitude = null;
  addressForm.tag = '';
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
  addressForm.latitude = address.latitude;
  addressForm.longitude = address.longitude;
  addressForm.tag = address.tag || '';
  addressForm.isDefault = address.isDefault;
  showAddAddress.value = true;
};

// 保存地址
const saveAddress = async () => {
  try {
    // 表单验证
    if (!addressFormRef.value) return;
    await addressFormRef.value.validate();
    
    addressLoading.value = true;
    
    const addressData = {
      userId: store.state.user.userInfo.id,
      name: addressForm.name,
      phone: addressForm.phone,
      province: addressForm.province,
      city: addressForm.city,
      district: addressForm.district,
      detail: addressForm.detail,
      latitude: addressForm.latitude,
      longitude: addressForm.longitude,
      tag: addressForm.tag,
      isDefault: addressForm.isDefault
    };
    
    if (editingAddress.value) {
      // 更新地址
      await store.dispatch('address/updateAddress', {
        id: editingAddress.value.id,
        data: addressData
      });
      ElMessage.success('地址更新成功');
    } else {
      // 添加地址
      await store.dispatch('address/createAddress', addressData);
      ElMessage.success('地址添加成功');
    }
    
    closeAddressForm();
    // 重新获取地址列表
    await store.dispatch('address/fetchUserAddresses');
  } catch (error) {
    ElMessage.error('保存地址失败');
  } finally {
    addressLoading.value = false;
  }
};

// 关闭地址表单
const closeAddressForm = () => {
  showAddAddress.value = false;
  initAddressForm();
  if (addressFormRef.value) {
    addressFormRef.value.clearValidate();
  }
};

// 设置默认地址
const setDefaultAddress = async (addressId) => {
  try {
    await store.dispatch('address/setDefaultAddress', addressId);
    ElMessage.success('默认地址设置成功');
    // 重新获取地址列表
    await store.dispatch('address/fetchUserAddresses');
  } catch (error) {
    ElMessage.error('设置默认地址失败');
  }
};

// 删除地址确认
const deleteAddressConfirm = async (addressId) => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await deleteAddressAction(addressId);
  } catch (error) {
    // 用户取消删除
  }
};

// 删除地址操作
const deleteAddressAction = async (addressId) => {
  try {
    await store.dispatch('address/deleteAddress', addressId);
    ElMessage.success('地址删除成功');
    // 重新获取地址列表
    await store.dispatch('address/fetchUserAddresses');
  } catch (error) {
    ElMessage.error('删除地址失败');
  }
};

// 组件挂载时获取地址列表
onMounted(async () => {
  try {
    await store.dispatch('address/fetchUserAddresses');
  } catch (error) {
    console.error('获取地址列表失败:', error);
  }
});
</script>

<style scoped>
.address-card {
  transition: all 0.3s ease;
}

.address-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.default-address {
  border-color: #f56565;
}

.grid {
  display: grid;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gap-2 {
  gap: 0.5rem;
}
</style>