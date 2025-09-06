<template>
  <div class="register-page min-h-screen flex items-center justify-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
    <el-card class="register-card" style="width: 400px">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-800">會員註冊</h1>
          <p class="text-gray-600 mt-2">創建您的外賣點餐帳戶</p>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="registerFormRef" label-width="0">
        <!-- 用戶類型選擇 -->
        <el-form-item>
          <el-text class="text-sm font-medium text-gray-700">註冊身份</el-text>
          <el-radio-group v-model="form.userType" class="mt-2">
            <el-radio value="customer">
              <el-icon><User /></el-icon>
              顧客
            </el-radio>
            <el-radio value="merchant">
              <el-icon><Shop /></el-icon>
              商家
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 用戶名 -->
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="請輸入用戶名（3-20位字母或數字）"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>

        <!-- 暱稱 -->
        <el-form-item prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="請輸入暱稱"
            prefix-icon="UserFilled"
            size="large"
            clearable
          />
        </el-form-item>

        <!-- 手機號 -->
        <el-form-item prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="請輸入手機號"
            prefix-icon="Phone"
            size="large"
            clearable
          />
        </el-form-item>

        <!-- 郵箱 -->
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="請輸入郵箱"
            prefix-icon="Message"
            size="large"
            clearable
          />
        </el-form-item>

        <!-- 密碼 -->
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="請輸入密碼（至少6位）"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <!-- 確認密碼 -->
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <!-- 商家專用字段 -->
        <template v-if="form.userType === 'merchant'">
          <!-- 商家名稱 -->
          <el-form-item prop="merchantName">
            <el-input
              v-model="form.merchantName"
              placeholder="請輸入商家名稱"
              prefix-icon="Shop"
              size="large"
              clearable
            />
          </el-form-item>

          <!-- 商家描述 -->
          <el-form-item prop="merchantDescription">
            <el-input
              v-model="form.merchantDescription"
              type="textarea"
              :rows="3"
              placeholder="請輸入商家描述"
              size="large"
            />
          </el-form-item>
        </template>

        <!-- 註冊按鈕 -->
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            style="width: 100%"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '註冊中...' : '註冊' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 登錄鏈接 -->
      <div class="text-center mt-4">
        <el-text type="info">已有帳戶？</el-text>
        <router-link to="/auth/login">
          <el-link type="primary" :underline="false">立即登錄</el-link>
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Shop, UserFilled, Phone, Message, Lock } from '@element-plus/icons-vue';

const store = useStore();
const router = useRouter();

const loading = ref(false);
const registerFormRef = ref();

const form = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: 'customer',
  merchantName: '',
  merchantDescription: ''
});

// 表單驗證規則
const rules = reactive({
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
    { min: 3, max: 20, message: '用戶名長度為3-20位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]+$/, message: '用戶名只能包含字母和數字', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '請輸入暱稱', trigger: 'blur' },
    { min: 2, max: 20, message: '暱稱長度為2-20位', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入手機號', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '請輸入正確的手機號格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入郵箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的郵箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請再次輸入密碼', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('兩次輸入的密碼不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  merchantName: [
    { 
      required: true, 
      message: '請輸入商家名稱', 
      trigger: 'blur' 
    },
    { 
      min: 2, 
      max: 50, 
      message: '商家名稱長度為2-50位', 
      trigger: 'blur' 
    }
  ],
  merchantDescription: [
    { 
      required: true, 
      message: '請輸入商家描述', 
      trigger: 'blur' 
    },
    { 
      max: 200, 
      message: '商家描述不能超過200字', 
      trigger: 'blur' 
    }
  ]
});

// 監聽用戶類型變化，動態調整驗證規則
watch(() => form.userType, (newType) => {
  // 重新驗證表單
  if (registerFormRef.value) {
    registerFormRef.value.validate();
  }
});

const handleRegister = async () => {
  // 驗證表單
  if (!registerFormRef.value) return;
  
  const valid = await registerFormRef.value.validate().catch(() => false);
  if (!valid) return;
  
  try {
    loading.value = true;
    
    // 構建註冊請求數據
    const registerData = {
      username: form.username,
      nickname: form.nickname,
      phone: form.phone,
      email: form.email,
      password: form.password,
      userType: form.userType
    };
    
    // 如果是商家，添加商家信息
    if (form.userType === 'merchant') {
      registerData.merchantInfo = {
        name: form.merchantName,
        description: form.merchantDescription
      };
    }
    
    console.log('開始註冊，請求數據:', registerData);
    
    // 調用註冊API
    const response = await store.dispatch('user/register', registerData);
    
    // 顯示成功消息
    ElMessage.success('註冊成功！請登錄您的帳戶');
    
    // 跳轉到登錄頁面
    router.push('/auth/login');
    
  } catch (error) {
    console.error('註冊失敗:', error);
    
    // 處理不同類型的錯誤
    let errorMessage = '註冊失敗，請重試';
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = '請求參數錯誤';
          break;
        case 409:
          errorMessage = '用戶名或手機號已存在';
          break;
        case 500:
          errorMessage = '服務器內部錯誤，請稍後重試';
          break;
        default:
          errorMessage = error.response.data?.msg || error.response.data?.message || '註冊失敗';
      }
    } else if (error.request) {
      errorMessage = '網絡連接失敗，請檢查網絡設置或後端服務';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // 顯示錯誤消息
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>