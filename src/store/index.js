import { createStore } from 'vuex';
import { 
  merchantAPI, 
  dishAPI, 
  categoryAPI, 
  orderAPI, 
  userAPI, 
  addressAPI, 
  statsAPI, 
  cartAPI 
} from '../api/index.js';

// 商家模块
const merchant = {
  namespaced: true,
  state: {
    merchantInfo: null,
    merchantList: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_MERCHANT_INFO(state, merchantInfo) {
      state.merchantInfo = merchantInfo;
    },
    SET_MERCHANT_LIST(state, merchantList) {
      state.merchantList = merchantList;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    UPDATE_MERCHANT(state, updatedMerchant) {
      const index = state.merchantList.findIndex(m => m.id === updatedMerchant.id);
      if (index !== -1) {
        state.merchantList.splice(index, 1, updatedMerchant);
      }
      if (state.merchantInfo && state.merchantInfo.id === updatedMerchant.id) {
        state.merchantInfo = updatedMerchant;
      }
    }
  },
  actions: {
    async fetchMerchantList({ commit }, params = {}) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await merchantAPI.getMerchantList(params);
        commit('SET_MERCHANT_LIST', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchActiveMerchants({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await merchantAPI.getActiveMerchants();
        commit('SET_MERCHANT_LIST', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchMerchantDetail({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        const response = await merchantAPI.getMerchantDetail(id);
        commit('SET_MERCHANT_INFO', response.data || response);
        return response.data || response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchMerchantByUserId({ commit }, userId) {
      try {
        commit('SET_LOADING', true);
        const response = await merchantAPI.getMerchantByUserId(userId);
        commit('SET_MERCHANT_INFO', response.data || response);
        return response.data || response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async updateMerchant({ commit }, { id, data }) {
      try {
        const response = await merchantAPI.updateMerchant(id, data);
        commit('UPDATE_MERCHANT', response.data || response);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  },
  getters: {
    activeMerchants: (state) => {
      return state.merchantList.filter(m => m.status === 1);
    }
  }
};

// 菜品分类模块
const category = {
  namespaced: true,
  state: {
    categories: [],
    currentCategory: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    SET_CURRENT_CATEGORY(state, category) {
      state.currentCategory = category;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_CATEGORY(state, category) {
      state.categories.push(category);
    },
    UPDATE_CATEGORY(state, updatedCategory) {
      const index = state.categories.findIndex(c => c.id === updatedCategory.id);
      if (index !== -1) {
        state.categories.splice(index, 1, updatedCategory);
      }
    },
    DELETE_CATEGORY(state, categoryId) {
      const index = state.categories.findIndex(c => c.id === categoryId);
      if (index !== -1) {
        state.categories.splice(index, 1);
      }
    }
  },
  actions: {
    async fetchMerchantCategories({ commit }, merchantId) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await categoryAPI.getMerchantCategories(merchantId);
        commit('SET_CATEGORIES', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async createCategory({ commit }, data) {
      try {
        const response = await categoryAPI.createCategory(data);
        commit('ADD_CATEGORY', response.data || response);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async updateCategory({ commit }, { id, data }) {
      try {
        const response = await categoryAPI.updateCategory(id, data);
        commit('UPDATE_CATEGORY', response.data || response);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async deleteCategory({ commit }, id) {
      try {
        await categoryAPI.deleteCategory(id);
        commit('DELETE_CATEGORY', id);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  }
};

// 菜品模块（重命名从menu）
const dish = {
  namespaced: true,
  state: {
    dishList: [],
    currentDish: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_DISH_LIST(state, dishList) {
      // 确保 dishList 是数组
      state.dishList = Array.isArray(dishList) ? dishList : [];
    },
    SET_CURRENT_DISH(state, dish) {
      state.currentDish = dish;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    UPDATE_DISH(state, updatedDish) {
      const index = state.dishList.findIndex(dish => dish.id === updatedDish.id);
      if (index !== -1) {
        state.dishList.splice(index, 1, updatedDish);
      }
    },
    ADD_DISH(state, newDish) {
      state.dishList.push(newDish);
    },
    DELETE_DISH(state, dishId) {
      const index = state.dishList.findIndex(dish => dish.id === dishId);
      if (index !== -1) {
        state.dishList.splice(index, 1);
      }
    }
  },
  actions: {
    async fetchDishList({ commit }, params = {}) {
      // 确保merchantId参数存在
      if (!params.merchantId) {
        commit('SET_ERROR', 'merchantId参数是必需的');
        throw new Error('merchantId参数是必需的');
      }
      
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await dishAPI.getDishList(params);
        console.log( response.data || response);
        commit('SET_DISH_LIST', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async searchDishes({ commit }, params = {}) {
      // 确保merchantId参数存在
      if (!params.merchantId) {
        commit('SET_ERROR', 'merchantId参数是必需的');
        throw new Error('merchantId参数是必需的');
      }
      
      try {
        commit('SET_LOADING', true);
        const response = await dishAPI.searchDishes(params);
        commit('SET_DISH_LIST', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchRecommendedDishes({ commit }, merchantId) {
      // 确保merchantId参数存在
      if (!merchantId) {
        commit('SET_ERROR', 'merchantId参数是必需的');
        throw new Error('merchantId参数是必需的');
      }
      
      try {
        const response = await dishAPI.getRecommendedDishes(merchantId);
        return response.data || response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async fetchDishDetail({ commit }, id) {
      try {
        commit('SET_LOADING', true);
        const response = await dishAPI.getDishDetail(id);
        commit('SET_CURRENT_DISH', response.data || response);
        return response.data || response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async updateDish({ commit }, { id, data }) {
      try {
        const response = await dishAPI.updateDish(id, data);
        commit('UPDATE_DISH', response.data || response);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async createDish({ commit }, data) {
      try {
        const response = await dishAPI.createDish(data);
        commit('ADD_DISH', response.data || response);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async deleteDish({ commit }, id) {
      try {
        await dishAPI.deleteDish(id);
        commit('DELETE_DISH', id);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async updateDishStatus({ commit }, { id, status }) {
      try {
        const response = await dishAPI.updateDishStatus(id, status);
        commit('UPDATE_DISH', response.data || response);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  },
  getters: {
    dishByCategory: (state) => (categoryId) => {
      if (!categoryId) return state.dishList;
      return state.dishList.filter(dish => dish.categoryId === categoryId);
    },
    availableDishes: (state) => {
      return state.dishList.filter(dish => dish.status === 1);
    },
    recommendedDishes: (state) => {
      return state.dishList.filter(dish => dish.isRecommended === 1);
    }
  }
};

// 购物车模块
const cart = {
  namespaced: true,
  state: {
    items: [],
    total: 0,
    loading: false
  },
  mutations: {
    SET_CART_ITEMS(state, items) {
      state.items = items;
      state.total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    ADD_TO_CART(state, item) {
      const existingItem = state.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity || 1;
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 });
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    UPDATE_CART_ITEM(state, { id, quantity }) {
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.quantity = quantity;
        if (quantity <= 0) {
          const index = state.items.findIndex(i => i.id === id);
          state.items.splice(index, 1);
        }
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    REMOVE_FROM_CART(state, itemId) {
      const index = state.items.findIndex(i => i.id === itemId);
      if (index !== -1) {
        state.items.splice(index, 1);
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    CLEAR_CART(state) {
      state.items = [];
      state.total = 0;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    }
  },
  actions: {
    async fetchCart({ commit, rootState }) {
      try {
        commit('SET_LOADING', true);
        const userId = rootState.user.userInfo?.id;
        const response = await cartAPI.getCart(userId);
        commit('SET_CART_ITEMS', response.data || response.items || []);
      } catch (error) {
        console.error('获取购物车失败:', error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async addToCart({ commit, rootState }, item) {
      // 检查库存
      const dish = rootState.dish.dishList.find(d => d.id === item.id);
      if (dish && dish.stock !== -1 && dish.stock <= 0) {
        throw new Error('商品已售罄');
      }
      
      // 检查当前购物车中的数量是否超过库存
      const existingItem = rootState.cart.items.find(i => i.id === item.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newQuantity = currentQuantity + (item.quantity || 1);
      
      if (dish && dish.stock !== -1 && newQuantity > dish.stock) {
        throw new Error(`库存不足，仅剩${dish.stock}件`);
      }
      
      try {
        const userId = rootState.user.userInfo?.id;
        await cartAPI.addToCart(item, userId);
        commit('ADD_TO_CART', item);
      } catch (error) {
        console.error('添加到购物车失败:', error);
        // 如果后端失败，仍然更新本地状态
        commit('ADD_TO_CART', item);
      }
    },
    async updateCartItem({ commit, rootState }, { id, quantity }) {
      // 检查库存
      const dish = rootState.dish.dishList.find(d => d.id === id);
      if (dish && dish.stock !== -1 && quantity > dish.stock) {
        throw new Error(`库存不足，仅剩${dish.stock}件`);
      }
      
      try {
        const userId = rootState.user.userInfo?.id;
        await cartAPI.updateCartItem(id, quantity, userId);
        commit('UPDATE_CART_ITEM', { id, quantity });
      } catch (error) {
        console.error('更新购物车失败:', error);
        commit('UPDATE_CART_ITEM', { id, quantity });
      }
    },
    async removeFromCart({ commit, rootState }, itemId) {
      try {
        const userId = rootState.user.userInfo?.id;
        await cartAPI.removeFromCart(itemId, userId);
        commit('REMOVE_FROM_CART', itemId);
      } catch (error) {
        console.error('删除购物车商品失败:', error);
        commit('REMOVE_FROM_CART', itemId);
      }
    },
    async clearCart({ commit, rootState }) {
      try {
        const userId = rootState.user.userInfo?.id;
        await cartAPI.clearCart(userId);
        commit('CLEAR_CART');
      } catch (error) {
        console.error('清空购物车失败:', error);
        commit('CLEAR_CART');
      }
    }
  },
  getters: {
    cartItemCount: (state) => {
      return state.items.reduce((count, item) => count + item.quantity, 0);
    },
    cartIsEmpty: (state) => {
      return state.items.length === 0;
    }
  }
};

// 订单模块
const order = {
  namespaced: true,
  state: {
    orderList: [],
    currentOrder: null,
    orderHistory: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_ORDER_LIST(state, orders) {
      state.orderList = orders;
    },
    SET_CURRENT_ORDER(state, order) {
      state.currentOrder = order;
    },
    SET_ORDER_HISTORY(state, history) {
      state.orderHistory = history;
    },
    ADD_ORDER(state, order) {
      state.orderList.unshift(order);
      state.orderHistory.unshift(order);
    },
    UPDATE_ORDER_STATUS(state, { orderId, status }) {
      const order = state.orderList.find(o => o.id === orderId);
      if (order) {
        order.status = status;
      }
      const historyOrder = state.orderHistory.find(o => o.id === orderId);
      if (historyOrder) {
        historyOrder.status = status;
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async createOrder({ commit, dispatch }, orderData) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await orderAPI.createOrder(orderData);
        const order = response.data || response;
        commit('ADD_ORDER', order);
        // 下单成功后清空购物车
        dispatch('cart/clearCart', null, { root: true });
        return order;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchOrderList({ commit }, params = {}) {
      try {
        commit('SET_LOADING', true);
        const response = await orderAPI.getOrderList(params);
        commit('SET_ORDER_LIST', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchUserOrders({ commit }, userId) {
      try {
        commit('SET_LOADING', true);
        const response = await orderAPI.getUserOrders(userId);
        commit('SET_ORDER_HISTORY', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async updateOrderStatus({ commit }, { orderId, status }) {
      try {
        await orderAPI.updateOrderStatus(orderId, status);
        commit('UPDATE_ORDER_STATUS', { orderId, status });
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async fetchOrderDetail({ commit }, orderId) {
      try {
        commit('SET_LOADING', true);
        const response = await orderAPI.getOrderDetail(orderId);
        commit('SET_CURRENT_ORDER', response.data || response);
        return response.data || response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  getters: {
    pendingOrders: (state) => {
      return state.orderList.filter(order => order.status === '待处理');
    },
    preparingOrders: (state) => {
      return state.orderList.filter(order => order.status === '制作中');
    },
    completedOrders: (state) => {
      return state.orderList.filter(order => order.status === '已完成');
    },
    orderById: (state) => (id) => {
      return state.orderList.find(order => order.id === id);
    }
  }
};

// 用户模块
const user = {
  namespaced: true,
  state: {
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    token: localStorage.getItem('token') || null,
    tokenExpires: localStorage.getItem('token_expires') || null,
    isLoggedIn: false,
    loading: false,
    error: null
  },
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
      state.isLoggedIn = !!userInfo && !!state.token;
      
      // 保存到本地存储
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        localStorage.removeItem('userInfo');
      }
    },
    SET_TOKEN(state, { token, expires }) {
      state.token = token;
      state.tokenExpires = expires;
      state.isLoggedIn = !!token && !!state.userInfo;
      
      // 保存到本地存储
      if (token) {
        localStorage.setItem('token', token);
        if (expires) {
          localStorage.setItem('token_expires', expires.toString());
        }
        console.log('✅ Token已保存，过期时间:', expires ? new Date(expires).toLocaleString() : '未设置');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('token_expires');
        console.log('🗑️ Token已清除');
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    LOGOUT(state) {
      console.log('🚪 执行用户登出');
      state.userInfo = null;
      state.token = null;
      state.tokenExpires = null;
      state.isLoggedIn = false;
      
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('token_expires');
      localStorage.removeItem('userInfo');
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        console.log('🚀 开始登录，请求数据:', { account: credentials.account });
        
        // 调用登录API
        const response = await userAPI.login(credentials);
        console.log('🎉 登录API响应:', response);
        
        // 处理登录响应数据
        const responseData = response.data || response;
        let userData, token, expires;
        
        // 检查是否有嵌套的data对象（新后端结构）
        const loginData = responseData.data || responseData;
        
        if (loginData.token) {
          // 后端返回了token（正常情况）
          userData = loginData.userInfo || loginData.user || loginData;
          token = loginData.token;
          // 使用expiresAt而不是expires
          expires = loginData.expiresAt || loginData.expires || (Date.now() + 24 * 60 * 60 * 1000); // 默认24小时
          console.log('✅ 从后端获取到token');
        } else {
          // 兼容旧版本或模拟数据
          userData = responseData;
          token = `user_${userData.id}_${Date.now()}`; // 生成临时token
          expires = Date.now() + 24 * 60 * 60 * 1000; // 24小时
          console.log('⚠️ 后端未返回token，生成临时token');
        }
        
        console.log('👤 用户信息:', userData);
        console.log('🔐 Token信息:', { token: token.substring(0, 20) + '...', expires: new Date(expires).toLocaleString() });
        
        // 保存用户信息和token
        commit('SET_USER_INFO', userData);
        commit('SET_TOKEN', { token, expires });
        
        return response;
      } catch (error) {
        console.error('❌ 登录失败:', error);
        commit('SET_ERROR', error.message || '登录失败');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await userAPI.register(userData);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchUserInfo({ commit, state }) {
      try {
        if (!state.userInfo?.id) return;
        commit('SET_LOADING', true);
        const response = await userAPI.getUserInfo(state.userInfo.id);
        commit('SET_USER_INFO', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        commit('LOGOUT');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async updateUserInfo({ commit, state }, userData) {
      try {
        commit('SET_LOADING', true);
        const response = await userAPI.updateUserInfo(state.userInfo.id, userData);
        commit('SET_USER_INFO', response.data || response);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async changePassword({ commit, state }, { oldPassword, newPassword }) {
      try {
        commit('SET_LOADING', true);
        const response = await userAPI.changePassword(state.userInfo.id, oldPassword, newPassword);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    logout({ commit }) {
      commit('LOGOUT');
    },
    
    // 检查token是否有效
    checkTokenValidity({ commit, state }) {
      if (!state.token || !state.tokenExpires) {
        console.warn('⚠️ 没有token或过期时间');
        commit('LOGOUT');
        return false;
      }
      
      const now = Date.now();
      const expires = parseInt(state.tokenExpires);
      
      if (now >= expires) {
        console.warn('⚠️ Token已过期');
        commit('LOGOUT');
        return false;
      }
      
      // 检查是否即将过期（半小时内）
      const halfHour = 30 * 60 * 1000;
      if (expires - now < halfHour) {
        console.warn('⚠️ Token即将过期，建议刷新');
        // 可以在这里触发token刷新逻辑
      }
      
      return true;
    },
    
    // 初始化用户状态（应用启动时调用）
    initializeAuth({ commit, dispatch, state }) {
      console.log('🔄 初始化用户认证状态');
      
      // 检查本地存储的用户信息
      const storedUserInfo = localStorage.getItem('userInfo');
      const storedToken = localStorage.getItem('token');
      const storedExpires = localStorage.getItem('token_expires');
      
      if (storedUserInfo && storedToken && storedExpires) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          commit('SET_USER_INFO', userInfo);
          commit('SET_TOKEN', { token: storedToken, expires: parseInt(storedExpires) });
          
          // 检查token是否有效
          if (!dispatch('checkTokenValidity')) {
            console.log('⚠️ 本地token已过期，清除存储');
            return false;
          }
          
          console.log('✅ 用户状态恢复成功:', {
            user: userInfo.nickname || userInfo.username,
            role: userInfo.role === 1 ? '顾客' : '商家',
            expires: new Date(parseInt(storedExpires)).toLocaleString()
          });
          
          return true;
        } catch (error) {
          console.error('❌ 用户状态恢复失败:', error);
          commit('LOGOUT');
          return false;
        }
      }
      
      console.log('🌑 无有本地用户状态');
      return false;
    }
  },
  getters: {
    isAuthenticated: (state) => {
      return !!state.token && !!state.userInfo && !!state.tokenExpires && 
             Date.now() < parseInt(state.tokenExpires);
    },
    isTokenExpired: (state) => {
      if (!state.tokenExpires) return true;
      return Date.now() >= parseInt(state.tokenExpires);
    },
    tokenExpiresIn: (state) => {
      if (!state.tokenExpires) return 0;
      const expires = parseInt(state.tokenExpires);
      const remaining = expires - Date.now();
      return remaining > 0 ? remaining : 0;
    },
    tokenExpiresAt: (state) => {
      if (!state.tokenExpires) return null;
      return new Date(parseInt(state.tokenExpires));
    },
    isCustomer: (state) => {
      return state.userInfo?.role === 1;
    },
    isMerchant: (state) => {
      return state.userInfo?.role === 2;
    },
    isAdmin: (state) => {
      return state.userInfo?.role === 3;
    },
    userDisplayName: (state) => {
      return state.userInfo?.nickname || state.userInfo?.username || '未知用户';
    },
    userRoleText: (state) => {
      const roleMap = { 1: '顾客', 2: '商家', 3: '管理员' };
      return roleMap[state.userInfo?.role] || '未知';
    }
  }
};

// 用户地址模块
const address = {
  namespaced: true,
  state: {
    addresses: [],
    defaultAddress: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_ADDRESSES(state, addresses) {
      state.addresses = addresses;
      state.defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
    },
    ADD_ADDRESS(state, address) {
      state.addresses.push(address);
      if (address.isDefault) {
        state.defaultAddress = address;
      }
    },
    UPDATE_ADDRESS(state, updatedAddress) {
      const index = state.addresses.findIndex(addr => addr.id === updatedAddress.id);
      if (index !== -1) {
        state.addresses.splice(index, 1, updatedAddress);
      }
      if (updatedAddress.isDefault) {
        state.defaultAddress = updatedAddress;
      }
    },
    DELETE_ADDRESS(state, addressId) {
      const index = state.addresses.findIndex(addr => addr.id === addressId);
      if (index !== -1) {
        state.addresses.splice(index, 1);
      }
      // 如果删除的是默认地址，重新设置默认地址
      if (state.defaultAddress && state.defaultAddress.id === addressId) {
        state.defaultAddress = state.addresses.find(addr => addr.isDefault) || state.addresses[0] || null;
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchUserAddresses({ commit, rootState }) {
      try {
        commit('SET_LOADING', true);
        const userId = rootState.user.userInfo?.id;
        if (!userId) return;
        const response = await addressAPI.getUserAddresses(userId);
        commit('SET_ADDRESSES', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async createAddress({ commit }, addressData) {
      try {
        const response = await addressAPI.createAddress(addressData);
        commit('ADD_ADDRESS', response.data || response);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async updateAddress({ commit }, { id, data }) {
      try {
        const response = await addressAPI.updateAddress(id, data);
        commit('UPDATE_ADDRESS', response.data || response);
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async setDefaultAddress({ commit, rootState }, id) {
      try {
        const userId = rootState.user.userInfo?.id;
        if (!userId) throw new Error('用户未登录');
        const response = await addressAPI.setDefaultAddress(id, userId);
        // 重新获取地址列表以更新默认地址状态
        await commit('address/fetchUserAddresses', null, { root: true });
        return response;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async deleteAddress({ commit, rootState }, id) {
      try {
        const userId = rootState.user.userInfo?.id;
        if (!userId) throw new Error('用户未登录');
        await addressAPI.deleteAddress(id, userId);
        commit('DELETE_ADDRESS', id);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  },
  getters: {
    defaultAddress: (state) => {
      return state.defaultAddress;
    }
  }
};

// 统计模块（商家端）
const stats = {
  namespaced: true,
  state: {
    salesStats: {},
    orderStats: {},
    menuRanking: [],
    revenueTrend: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_SALES_STATS(state, stats) {
      state.salesStats = stats;
    },
    SET_ORDER_STATS(state, stats) {
      state.orderStats = stats;
    },
    SET_MENU_RANKING(state, ranking) {
      state.menuRanking = ranking;
    },
    SET_REVENUE_TREND(state, trend) {
      state.revenueTrend = trend;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchSalesStats({ commit }, params = {}) {
      try {
        commit('SET_LOADING', true);
        const response = await statsAPI.getSalesStats(params);
        commit('SET_SALES_STATS', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchOrderStats({ commit }, params = {}) {
      try {
        commit('SET_LOADING', true);
        const response = await statsAPI.getOrderStats(params);
        commit('SET_ORDER_STATS', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchMenuRanking({ commit }, params = {}) {
      try {
        const response = await statsAPI.getMenuRanking(params);
        commit('SET_MENU_RANKING', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    async fetchRevenueTrend({ commit }, params = {}) {
      try {
        const response = await statsAPI.getRevenueTrend(params);
        commit('SET_REVENUE_TREND', response.data || response);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  }
};

// 全局状态
const global = {
  namespaced: true,
  state: {
    loading: false,
    error: null,
    notification: null
  },
  mutations: {
    SET_GLOBAL_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_GLOBAL_ERROR(state, error) {
      state.error = error;
    },
    SET_NOTIFICATION(state, notification) {
      state.notification = notification;
    },
    CLEAR_NOTIFICATION(state) {
      state.notification = null;
    }
  },
  actions: {
    showNotification({ commit }, { type, message, duration = 3000 }) {
      commit('SET_NOTIFICATION', { type, message });
      setTimeout(() => {
        commit('CLEAR_NOTIFICATION');
      }, duration);
    },
    showSuccess({ dispatch }, message) {
      dispatch('showNotification', { type: 'success', message });
    },
    showError({ dispatch }, message) {
      dispatch('showNotification', { type: 'error', message });
    },
    showWarning({ dispatch }, message) {
      dispatch('showNotification', { type: 'warning', message });
    }
  }
};

// 创建 store
const store = createStore({
  modules: {
    merchant,
    category,
    dish,
    cart,
    order,
    user,
    address,
    stats,
    global
  },
  // 添加根级别的 actions，使通知功能可以直接调用
  actions: {
    showSuccess({ dispatch }, message) {
      dispatch('global/showSuccess', message);
    },
    showError({ dispatch }, message) {
      dispatch('global/showError', message);
    },
    showWarning({ dispatch }, message) {
      dispatch('global/showWarning', message);
    },
    showNotification({ dispatch }, payload) {
      dispatch('global/showNotification', payload);
    }
  }
});

export default store;