import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import store from './store/index.js';
import router from './router/index.js';
import { initializeBackendService } from './utils/backendService.js';
import { initializeAuthManager } from './utils/authManager.js';

// 引入Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 异步初始化应用
async function initializeApp() {
  // 检查后端服务状态
  console.log('🚀 正在初始化外卖点餐系统...');
  await initializeBackendService();
  
  const app = createApp(App);

  // 使用 Vuex 状态管理
  app.use(store);

  // 使用 Vue Router 路由
  app.use(router);

  // 使用 Element Plus
  app.use(ElementPlus);

  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }

  // 挂载应用
  app.mount('#app');
  
  // 初始化认证管理器（应用挂载后）
  initializeAuthManager();
  
  console.log('✅ 外卖点餐系统初始化完成');
}

// 启动应用
initializeApp().catch(error => {
  console.error('❌ 应用初始化失败:', error);
});
