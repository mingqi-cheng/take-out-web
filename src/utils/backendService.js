import { checkBackendHealth } from '../api/index.js';

// 后端服务状态管理
class BackendService {
  constructor() {
    this.isHealthy = false;
    this.lastCheck = null;
    this.checkInterval = null;
  }

  // 初始化检查
  async initialize() {
    console.log('🔍 正在检查后端服务状态...');
    const health = await checkBackendHealth();
    this.isHealthy = health.status === 'healthy';
    this.lastCheck = new Date();
    
    if (this.isHealthy) {
      console.log('✅ 后端服务连接成功 - 所有数据将从后端API获取');
    } else {
      console.warn('⚠️ 后端服务不可用 - 请检查后端服务状态');
      console.warn('💡 提示: 请确保后端服务已启动并在以下地址运行:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api');
      
      if (import.meta.env.VITE_ENABLE_MOCK === 'true') {
        console.log('🔄 模拟数据模式已启用 - 将使用前端模拟数据');
      } else {
        console.error('❌ 模拟数据模式未启用 - 应用功能可能受限');
        console.log('💡 如需启用模拟数据模式，请设置环境变量 VITE_ENABLE_MOCK=true');
      }
    }
    
    return this.isHealthy;
  }

  // 定期健康检查
  startHealthCheck(interval = 60000) { // 默认1分钟检查一次
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      const previousStatus = this.isHealthy;
      const health = await checkBackendHealth();
      this.isHealthy = health.status === 'healthy';
      this.lastCheck = new Date();
      
      // 状态变化时通知
      if (previousStatus !== this.isHealthy) {
        if (this.isHealthy) {
          console.log('🎉 后端服务已恢复 - 切换到后端数据');
        } else {
          console.warn('⚠️ 后端服务连接丢失 - 切换到模拟数据模式');
        }
      }
    }, interval);
  }

  // 停止健康检查
  stopHealthCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // 获取服务状态
  getStatus() {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastCheck,
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
      mockEnabled: import.meta.env.VITE_ENABLE_MOCK === 'true'
    };
  }
}

// 创建全局实例
export const backendService = new BackendService();

// 自动初始化
export const initializeBackendService = async () => {
  const isHealthy = await backendService.initialize();
  
  // 只在开发环境启动定期检查
  if (import.meta.env.DEV) {
    backendService.startHealthCheck();
  }
  
  return isHealthy;
};