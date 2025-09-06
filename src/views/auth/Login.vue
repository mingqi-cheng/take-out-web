<template>
  <div class="login-page min-h-screen flex items-center justify-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
    <el-card class="login-card" style="width: 400px">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-800">🍔 外卖点餐系统</h1>
          <p class="text-gray-600 mt-2">登录您的账户</p>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="loginFormRef" label-width="0">
        <!-- 用户类型选择 -->
        <el-form-item>
          <el-text class="text-sm font-medium text-gray-700">登录身份</el-text>
          <el-radio-group v-model="form.userType" class="mt-2">
            <el-radio value="customer">
              <el-icon><User /></el-icon>
              顾客
            </el-radio>
            <el-radio value="merchant">
              <el-icon><Shop /></el-icon>
              商家
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 用户名/手机号 -->
        <el-form-item prop="account">
          <el-input
            v-model="form.account"
            placeholder="请输入用户名或手机号"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <!-- 记住我 -->
        <el-form-item>
          <div class="flex items-center justify-between w-full">
            <el-checkbox v-model="form.remember">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <!-- 快捷测试登录 -->
        <el-form-item>
          <el-alert
            title="快速测试登录"
            type="info"
            :closable="false"
            style="margin-bottom: 10px"
          />
          <div class="flex gap-2">
            <el-button 
              type="info"
              size="small"
              style="flex: 1"
              @click="quickLogin('customer')"
            >
              <el-icon><User /></el-icon>
              顾客测试
            </el-button>
            <el-button 
              type="success"
              size="small"
              style="flex: 1"
              @click="quickLogin('merchant')"
            >
              <el-icon><Shop /></el-icon>
              商家测试
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <!-- 注册链接 -->
      <div class="text-center mt-4">
        <el-text type="info">还没有账户？</el-text>
        <router-link to="/auth/register">
          <el-link type="primary" :underline="false">立即注册</el-link>
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Shop, Lock } from '@element-plus/icons-vue';

const store = useStore();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const loginFormRef = ref();

const form = reactive({
  account: '',
  password: '',
  userType: 'customer',
  remember: false
});

// 表单验证规则
const rules = reactive({
  account: [
    { required: true, message: '请输入用户名或手机号', trigger: 'blur' },
    { min: 3, message: '用户名至少3位字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
});

const handleLogin = async () => {
  // 验证表单
  if (!loginFormRef.value) return;
  
  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) return;
  
  try {
    loading.value = true;
    
    // 构建登录请求数据
    const loginRequestData = {
      account: form.account,
      password: form.password
    };
    
    console.log('开始登录，请求数据:', loginRequestData);
    
    // 调用真实的登录API
    const response = await store.dispatch('user/login', loginRequestData);
    
    // 检查用户角色是否匹配选择的登录身份
    const responseData = response.data || response;
    // 处理嵌套的数据结构
    const loginResponseData = responseData.data || responseData;
    const userInfo = loginResponseData.userInfo || loginResponseData.user || loginResponseData;
    const userRole = userInfo?.role;
    const expectedRole = form.userType === 'customer' ? 1 : 2; // 1-顾客, 2-商家
    
    if (userRole !== expectedRole) {
      const roleText = form.userType === 'customer' ? '顾客' : '商家';
      throw new Error(`该账户不是${roleText}账户，请检查登录身份选择`);
    }
    
    // 如果选择记住我
    if (form.remember) {
      localStorage.setItem('remember_login', 'true');
    } else {
      localStorage.removeItem('remember_login');
    }
    
    // 显示成功消息
    ElMessage.success('登录成功！');
    
    // 处理登录成功后的重定向
    const redirect = route.query.redirect;
    let targetPath;
    
    if (redirect && redirect !== '/auth/login') {
      // 如果有重定向路径，使用重定向路径
      targetPath = redirect;
      console.log('使用重定向路径:', targetPath);
    } else {
      // 否则根据用户角色跳转到默认页面
      if (userRole === 2) { // 商家
        targetPath = '/merchant';
      } else { // 顾客
        targetPath = '/customer/menu';
      }
      console.log('使用默认路径:', targetPath);
    }
    
    // 跳转到目标页面
    router.push(targetPath);
    
  } catch (error) {
    console.error('登录失败:', error);
    
    // 处理不同类型的错误
    let errorMessage = '登录失败，请重试';
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = '用户名或密码错误';
          break;
        case 403:
          errorMessage = '账户已被禁用';
          break;
        case 404:
          errorMessage = '用户不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误，请稍后重试';
          break;
        default:
          errorMessage = error.response.data?.msg || error.response.data?.message || '登录失败';
      }
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查网络设置或后端服务';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // 显示错误消息
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

// 快捷登录功能
const quickLogin = (userType) => {
  if (userType === 'customer') {
    form.account = 'customer001';
    form.password = '123456';
    form.userType = 'customer';
  } else {
    form.account = 'merchant001';
    form.password = '123456';
    form.userType = 'merchant';
  }
  
  // 自动提交表单
  handleLogin();
};
</script>