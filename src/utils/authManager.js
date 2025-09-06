import { ElMessage, ElMessageBox } from 'element-plus';
import store from '../store/index.js';
import router from '../router/index.js';

/**
 * 全局认证管理器
 * 处理token验证、自动登出、权限检查等
 */
class AuthManager {
  constructor() {
    this.checkInterval = null;
    this.warningShown = false;
    this.setupEventListeners();
  }

  /**
   * 初始化认证管理器
   */
  initialize() {
    console.log('🔐 初始化认证管理器');
    
    // 恢复用户登录状态
    const isAuthenticated = store.dispatch('user/initializeAuth');
    
    // 启动token检查定时器
    this.startTokenCheck();
    
    return isAuthenticated;
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听token过期事件
    window.addEventListener('token-expired', this.handleTokenExpired.bind(this));
    
    // 监听认证过期事件
    window.addEventListener('auth-expired', this.handleAuthExpired.bind(this));
    
    // 监听权限不足事件
    window.addEventListener('auth-forbidden', this.handleAuthForbidden.bind(this));
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * 启动token检查定时器
   */
  startTokenCheck() {
    // 每分钟检查一次token状态
    this.checkInterval = setInterval(() => {
      this.checkTokenStatus();
    }, 60 * 1000);
    
    console.log('⏰ Token检查定时器已启动');
  }

  /**
   * 停止token检查定时器
   */
  stopTokenCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏹️ Token检查定时器已停止');
    }
  }

  /**
   * 检查token状态
   */
  checkTokenStatus() {
    const isValid = store.dispatch('user/checkTokenValidity');
    
    if (!isValid) {
      this.handleTokenExpired();
      return;
    }
    
    // 检查是否即将过期（15分钟内）
    const expiresIn = store.getters['user/tokenExpiresIn'];
    const fifteenMinutes = 15 * 60 * 1000;
    
    if (expiresIn > 0 && expiresIn < fifteenMinutes && !this.warningShown) {
      this.showExpirationWarning(Math.ceil(expiresIn / 60000));
    }
  }

  /**
   * 显示token即将过期警告
   */
  async showExpirationWarning(minutesLeft) {
    this.warningShown = true;
    
    try {
      await ElMessageBox.confirm(
        `您的登录状态将在 ${minutesLeft} 分钟后过期，是否继续当前会话？`,
        '登录状态即将过期',
        {
          confirmButtonText: '继续会话',
          cancelButtonText: '重新登录',
          type: 'warning',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              // 这里可以添加刷新token的逻辑
              ElMessage.success('会话已延续');
              this.warningShown = false;
            } else {
              this.logout();
            }
            done();
          }
        }
      );
    } catch (error) {
      // 用户取消或关闭对话框，执行登出
      this.logout();
    }
  }

  /**
   * 处理token过期事件
   */
  handleTokenExpired() {
    console.warn('⚠️ Token已过期，执行自动登出');
    this.logout('登录已过期，请重新登录');
  }

  /**
   * 处理认证过期事件
   */
  handleAuthExpired(event) {
    console.warn('⚠️ 认证已过期:', event.detail);
    ElMessage.error(event.detail.message || '登录已过期，请重新登录');
    this.logout();
  }

  /**
   * 处理权限不足事件
   */
  handleAuthForbidden(event) {
    console.warn('⚠️ 权限不足:', event.detail);
    ElMessage.error(event.detail.message || '没有权限访问该资源');
  }

  /**
   * 处理页面可见性变化
   */
  handleVisibilityChange() {
    if (!document.hidden) {
      // 页面重新可见时检查token状态
      console.log('👁️ 页面重新可见，检查认证状态');
      this.checkTokenStatus();
    }
  }

  /**
   * 执行登出操作
   */
  logout(message = '已退出登录') {
    console.log('🚪 执行登出操作');
    
    // 清除定时器
    this.stopTokenCheck();
    this.warningShown = false;
    
    // 清除Vuex状态
    store.dispatch('user/logout');
    
    // 显示消息
    ElMessage.info(message);
    
    // 跳转到登录页
    if (router.currentRoute.value.path !== '/auth/login') {
      router.push('/auth/login');
    }
  }

  /**
   * 检查当前路由是否需要认证
   */
  requiresAuth(route) {
    return route.meta?.requiresAuth === true;
  }

  /**
   * 检查用户是否有权限访问路由
   */
  hasPermission(route) {
    const userInfo = store.state.user.userInfo;
    if (!userInfo) return false;
    
    const requiredRole = route.meta?.userType;
    if (!requiredRole) return true;
    
    const userRole = userInfo.role === 2 ? 'merchant' : 'customer';
    return userRole === requiredRole;
  }

  /**
   * 销毁认证管理器
   */
  destroy() {
    console.log('💥 销毁认证管理器');
    this.stopTokenCheck();
    
    // 移除事件监听器
    window.removeEventListener('token-expired', this.handleTokenExpired);
    window.removeEventListener('auth-expired', this.handleAuthExpired);
    window.removeEventListener('auth-forbidden', this.handleAuthForbidden);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// 创建全局实例
export const authManager = new AuthManager();

// 初始化函数
export const initializeAuthManager = () => {
  return authManager.initialize();
};