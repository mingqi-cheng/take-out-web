import { createRouter, createWebHistory } from 'vue-router';
import store from '../store/index.js';
import { authManager } from '../utils/authManager.js';
import { ElMessage } from 'element-plus';

// 导入页面组件
const CustomerHome = () => import('../views/customer/Home.vue');
const CustomerMenu = () => import('../views/customer/Menu.vue');
const CustomerMerchantSelect = () => import('../views/customer/MerchantSelect.vue');
const CustomerCart = () => import('../views/customer/Cart.vue');
const CustomerOrders = () => import('../views/customer/Orders.vue');
const CustomerProfile = () => import('../views/customer/Profile.vue');
const CustomerAddressManage = () => import('../views/customer/AddressManage.vue');

const MerchantDashboard = () => import('../views/merchant/Dashboard.vue');
const MerchantOrders = () => import('../views/merchant/Orders.vue');
const MerchantMenu = () => import('../views/merchant/Menu.vue');
const MerchantStats = () => import('../views/merchant/Stats.vue');

const Login = () => import('../views/auth/Login.vue');
const Register = () => import('../views/auth/Register.vue');
const SystemStatus = () => import('../views/SystemStatus.vue');
const TokenDemo = () => import('../views/TokenDemo.vue');
const LoginTest = () => import('../views/LoginTest.vue');
const TokenTest = () => import('../views/TokenTest.vue');
const DishTest = () => import('../views/DishTest.vue');
const DishDebug = () => import('../views/DishDebug.vue');
const DishApiTest = () => import('../views/DishApiTest.vue');
const NotFound = () => import('../views/NotFound.vue');

const routes = [
  {
    path: '/',
    redirect: '/customer'
  },
  
  // 顾客端路由
  {
    path: '/customer',
    name: 'Customer',
    component: CustomerHome,
    meta: { requiresAuth: false },
    children: [
      {
        path: '',
        redirect: '/customer/merchants'
      },
      {
        path: 'merchants',
        name: 'CustomerMerchantSelect',
        component: CustomerMerchantSelect,
        meta: { title: '选择商家' }
      },
      {
        path: 'menu',
        name: 'CustomerMenu',
        component: CustomerMenu,
        meta: { title: '菜单' }
      },
      {
        path: 'cart',
        name: 'CustomerCart',
        component: CustomerCart,
        meta: { title: '购物车', requiresAuth: true }
      },
      {
        path: 'orders',
        name: 'CustomerOrders',
        component: CustomerOrders,
        meta: { title: '我的订单', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'CustomerProfile',
        component: CustomerProfile,
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'address',
        name: 'CustomerAddressManage',
        component: CustomerAddressManage,
        meta: { title: '地址管理', requiresAuth: true }
      }
    ]
  },
  
  // 商家端路由
  {
    path: '/merchant',
    name: 'Merchant',
    component: MerchantDashboard,
    meta: { requiresAuth: true, userType: 'merchant' },
    children: [
      {
        path: '',
        redirect: '/merchant/orders'
      },
      {
        path: 'orders',
        name: 'MerchantOrders',
        component: MerchantOrders,
        meta: { title: '订单管理' }
      },
      {
        path: 'menu',
        name: 'MerchantMenu',
        component: MerchantMenu,
        meta: { title: '菜单管理' }
      },
      {
        path: 'stats',
        name: 'MerchantStats',
        component: MerchantStats,
        meta: { title: '统计报表' }
      }
    ]
  },
  
  // 认证路由
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { title: '登录', guest: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
        meta: { title: '注册', guest: true }
      }
    ]
  },
  
  // 系统状态页面
  {
    path: '/system-status',
    name: 'SystemStatus',
    component: SystemStatus,
    meta: { title: '系统状态' }
  },
  
  // Token认证演示页面
  {
    path: '/token-demo',
    name: 'TokenDemo',
    component: TokenDemo,
    meta: { title: 'Token认证演示' }
  },
  
  // 登录测试页面
  {
    path: '/login-test',
    name: 'LoginTest',
    component: LoginTest,
    meta: { title: '登录测试' }
  },
  
  // Token测试页面
  {
    path: '/token-test',
    name: 'TokenTest',
    component: TokenTest,
    meta: { title: 'Token测试' }
  },
  
  // 菜品API测试页面
  {
    path: '/dish-test',
    name: 'DishTest',
    component: DishTest,
    meta: { title: '菜品API测试' }
  },
  
  // 菜品调试页面
  {
    path: '/dish-debug',
    name: 'DishDebug',
    component: DishDebug,
    meta: { title: '菜品调试' }
  },
  
  // 菜品API测试页面
  {
    path: '/dish-api-test',
    name: 'DishApiTest',
    component: DishApiTest,
    meta: { title: '菜品API测试' }
  },
  
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面未找到' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 外卖点餐系统`;
  } else {
    document.title = '外卖点餐系统';
  }
  
  console.log(`🛤️ 路由守卫: ${from.path} -> ${to.path}`);
  
  // 检查认证状态
  const isAuthenticated = store.getters['user/isAuthenticated'];
  const userInfo = store.state.user.userInfo;
  
  console.log(`🔐 认证状态: ${isAuthenticated ? '已登录' : '未登录'}`);
  
  // 如果需要认证但用户未登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.warn('⚠️ 访问受限页面但未登录，重定向到登录页');
    ElMessage.warning('请先登录');
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath } // 保存目标路径，登录后可以重定向
    });
    return;
  }
  
  // 如果是游客页面但用户已登录
  if (to.meta.guest && isAuthenticated) {
    console.log('🔄 用户已登录，重定向到主页');
    // 根据用户类型重定向
    if (userInfo?.role === 2) { // 2-商家
      next('/merchant');
    } else { // 1-顾客
      next('/customer');
    }
    return;
  }
  
  // 检查用户类型权限
  if (to.meta.userType && userInfo) {
    const userType = userInfo.role === 2 ? 'merchant' : 'customer';
    if (to.meta.userType !== userType) {
      console.warn(`⚠️ 用户类型不匹配: 期望${to.meta.userType}, 实际${userType}`);
      ElMessage.error('没有权限访问该页面');
      // 用户类型不匹配，重定向到对应页面
      if (userInfo.role === 2) { // 商家
        next('/merchant');
      } else { // 顾客
        next('/customer');
      }
      return;
    }
  }
  
  // 检查token有效性（仅对已登录用户）
  if (isAuthenticated) {
    const tokenValid = store.dispatch('user/checkTokenValidity');
    if (!tokenValid) {
      console.warn('⚠️ Token已过期，执行登出');
      authManager.logout('登录已过期，请重新登录');
      next('/auth/login');
      return;
    }
  }
  
  console.log('✅ 路由守卫检查通过');
  next();
});

// 全局后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加页面访问统计等逻辑
  console.log(`Navigation: ${from.path} -> ${to.path}`);
});

export default router;