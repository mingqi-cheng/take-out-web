import axios from 'axios';

// 创建 axios 实例 - 通过网关访问后端服务
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 检查是否启用模拟数据模式
const isMockEnabled = import.meta.env.VITE_ENABLE_MOCK === 'true';

console.log('API配置信息:', {
  baseURL: api.defaults.baseURL,
  timeout: api.defaults.timeout,
  mockEnabled: isMockEnabled
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 获取token
    const token = localStorage.getItem('token');
    
    // 检查token是否过期
    const tokenExpires = localStorage.getItem('token_expires');
    if (token && tokenExpires) {
      const now = Date.now();
      if (now >= parseInt(tokenExpires)) {
        console.warn('Token已过期，清除本地存储');
        localStorage.removeItem('token');
        localStorage.removeItem('token_expires');
        // 可以在这里触发登出事件
        window.dispatchEvent(new CustomEvent('token-expired'));
        return config;
      }
    }
    
    // 为需要权限的请求添加token
    if (token && !isPublicAPI(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ 请求携带token:', config.url);
    } else if (!token && !isPublicAPI(config.url)) {
      console.warn('⚠️ 请求需要权限但未token:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 判断是否为公开API（不需要token）
function isPublicAPI(url) {
  const publicPaths = [
    '/users/login',
    '/users/register', 
    '/users/check/',
    '/merchants/active',
    '/merchants/',
    '/dishes',
    '/categories/'
  ];
  return publicPaths.some(path => url.includes(path));
}

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('后端 API 响应成功:', response.config.url, response.data);
    return response.data;
  },
  (error) => {
    console.error('后端 API 调用失败:', error.config?.url, error.message);
    
    // 统一错误处理
    if (error.response) {
      console.error('后端服务响应错误:', error.response.status, error.response.data);
      switch (error.response.status) {
        case 401:
          console.warn('用户未授权或token已过期，清除本地存储');
          // 清除本地存储
          localStorage.removeItem('token');
          localStorage.removeItem('token_expires');
          localStorage.removeItem('userInfo');
          
          // 触发全局事件，通知应用程序用户已登出
          window.dispatchEvent(new CustomEvent('auth-expired', {
            detail: { reason: 'token_expired', message: '登录已过期，请重新登录' }
          }));
          
          // 如果不在登录页面，则跳转到登录页
          if (!window.location.pathname.includes('/auth/login')) {
            // 延迟跳转，给用户时间看到错误信息
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 1000);
          }
          break;
        case 403:
          console.error('权限不足 - 用户无权访问该资源');
          window.dispatchEvent(new CustomEvent('auth-forbidden', {
            detail: { message: '没有权限访问该资源' }
          }));
          break;
        case 404:
          console.error('请求的资源不存在 - API接口未实现或路径错误');
          break;
        case 500:
          console.error('后端服务器内部错误');
          break;
        default:
          console.error(`后端请求失败: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('网络连接失败或后端服务未启动:', {
        message: error.message,
        baseURL: api.defaults.baseURL,
        suggestion: '请检查: 1.网络连接 2.后端服务状态 3.API地址配置'
      });
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 商家相关 API
export const merchantAPI = {
  // 创建商家
  createMerchant(data) {
    return api.post('/merchants', data);
  },

  // 更新商家信息
  updateMerchant(id, data) {
    return api.put(`/merchants/${id}`, data);
  },

  // 获取商家详情
  getMerchantDetail(id) {
    return api.get(`/merchants/${id}`);
  },

  // 根据用户ID获取商家
  getMerchantByUserId(userId) {
    return api.get(`/merchants/user/${userId}`);
  },

  // 分页查询商家
  async getMerchantList(params = {}) {
    try {
      const response = await api.get('/merchants', { params });
      console.log('从后端获取商家列表成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端商家API不可用，使用模拟数据:', error.message);
        const { mockMerchants } = await import('../mock/testData.js');
        return {
          code: 200,
          msg: '操作成功（模拟数据）',
          data: mockMerchants
        };
      }
      console.error('商家列表API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 获取所有营业中的商家
  async getActiveMerchants() {
    try {
      const response = await api.get('/merchants/active');
      console.log('从后端获取活跃商家成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端活跃商家API不可用，使用模拟数据:', error.message);
        const { mockMerchants } = await import('../mock/testData.js');
        return {
          code: 200,
          msg: '操作成功（模拟数据）',
          data: mockMerchants.filter(merchant => merchant.status === 1)
        };
      }
      console.error('活跃商家API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 更新商家状态
  updateMerchantStatus(id, status) {
    return api.patch(`/merchants/${id}/status?status=${status}`);
  },

  // 删除商家
  deleteMerchant(id) {
    return api.delete(`/merchants/${id}`);
  }
};

// 菜品分类相关 API
export const categoryAPI = {
  // 创建菜品分类
  createCategory(data) {
    return api.post('/categories', data);
  },

  // 更新菜品分类
  updateCategory(id, data) {
    return api.put(`/categories/${id}`, data);
  },

  // 获取分类详情
  getCategoryDetail(id) {
    return api.get(`/categories/${id}`);
  },

  // 获取商家的分类列表
  async getMerchantCategories(merchantId) {
    try {
      const response = await api.get(`/categories/merchant/${merchantId}`);
      console.log('从后端获取商家分类成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端分类API不可用，使用模拟数据:', error.message);
        const { mockCategories } = await import('../mock/testData.js');
        return {
          code: 200,
          msg: '操作成功（模拟数据）',
          data: mockCategories.filter(cat => cat.merchantId === parseInt(merchantId))
        };
      }
      console.error('商家分类API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 获取商家的启用分类
  async getMerchantActiveCategories(merchantId) {
    try {
      const response = await api.get(`/categories/merchant/${merchantId}/active`);
      console.log('从后端获取启用分类成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端启用分类API不可用，使用模拟数据:', error.message);
        const { mockCategories } = await import('../mock/testData.js');
        return {
          code: 200,
          msg: '操作成功（模拟数据）',
          data: mockCategories.filter(cat => 
            cat.merchantId === parseInt(merchantId) && cat.status === 1
          )
        };
      }
      console.error('启用分类API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 删除分类
  deleteCategory(id) {
    return api.delete(`/categories/${id}`);
  }
};

// 菜单相关 API - 新增的menuAPI
export const menuAPI = {
  // 获取商家菜单
  getMerchantMenu(merchantId) {
    return api.get(`/menus/merchant/${merchantId}`);
  },
  
  // 创建菜单
  createMenu(data) {
    return api.post('/menus', data);
  },
  
  // 更新菜单
  updateMenu(id, data) {
    return api.put(`/menus/${id}`, data);
  },
  
  // 删除菜单
  deleteMenu(id) {
    return api.delete(`/menus/${id}`);
  },
  
  // 更新菜单状态
  updateMenuStatus(id, status) {
    return api.patch(`/menus/${id}/status`, { status });
  }
};

// 菜品相关 API
export const dishAPI = {
  // 创建菜品
  createDish(data) {
    return api.post('/dishes', data);
  },

  // 更新菜品
  updateDish(id, data) {
    return api.put(`/dishes/${id}`, data);
  },

  // 获取菜品详情
  getDishDetail(id) {
    return api.get(`/dishes/${id}`);
  },

  // 分页查询菜品 - 修改为需要merchantId参数
  async getDishList(params = {}) {
    // 确保merchantId参数存在
    if (!params.merchantId) {
      throw new Error('merchantId参数是必需的');
    }
    
    try {
      const response = await api.get('/dishes', { params });
      console.log('从后端获取菜品列表成功');
       console.log(response);
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端菜品API不可用，使用模拟数据:', error.message);
        const { mockDishes } = await import('../mock/testData.js');
        const filteredDishes = mockDishes.filter(dish => {
          if (params.merchantId && dish.merchantId !== parseInt(params.merchantId)) {
            return false;
          }
          if (params.categoryId && dish.categoryId !== parseInt(params.categoryId)) {
            return false;
          }
          if (params.status !== undefined && dish.status !== parseInt(params.status)) {
            return false;
          }
          return true;
        });
        // 确保返回正确的格式
        return {
          code: 200,
          msg: '操作成功（模拟数据）',
          data: filteredDishes
        };
      }
      console.error('菜品列表API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 搜索菜品 - 修改为需要merchantId参数
  async searchDishes(params = {}) {
    // 确保merchantId参数存在
    if (!params.merchantId) {
      throw new Error('merchantId参数是必需的');
    }
    
    try {
      const response = await api.get('/dishes', { params });
      console.log('从后端搜索菜品成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端搜索菜品API不可用，使用模拟数据:', error.message);
        const { mockDishes } = await import('../mock/testData.js');
        const keyword = params.keyword?.toLowerCase() || '';
        const filteredDishes = mockDishes.filter(dish => 
          dish.merchantId === parseInt(params.merchantId) &&
          (dish.name.toLowerCase().includes(keyword) ||
          dish.description?.toLowerCase().includes(keyword))
        );
        // 确保返回正确的格式
        return {
          code: 200,
          msg: '操作成功（模拟数据）',
          data: filteredDishes
        };
      }
      console.error('搜索菜品API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 获取推荐菜品 - 修改路径和参数
  async getRecommendedDishes(merchantId) {
    try {
      const response = await api.get('/dishes/recommended', { params: { merchantId } });
      console.log('从后端获取推荐菜品成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端推荐菜品API不可用，使用模拟数据:', error.message);
        const { mockDishes } = await import('../mock/testData.js');
        return {
          code: 200,
          msg: '操作成功（模拟数据）',
          data: mockDishes.filter(dish => 
            dish.merchantId === merchantId && dish.isRecommended === 1
          )
        };
      }
      console.error('推荐菜品API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 更新菜品状态
  updateDishStatus(id, status) {
    return api.patch(`/dishes/${id}/status?status=${status}`);
  },

  // 删除菜品
  deleteDish(id) {
    return api.delete(`/dishes/${id}`);
  }
};

// 订单相关 API
export const orderAPI = {
  // 创建订单
  createOrder(data) {
    return api.post('/orders', data);
  },

  // 获取订单详情
  getOrderDetail(id) {
    return api.get(`/orders/${id}`);
  },

  // 根据订单号获取订单
  getOrderByNo(orderNo) {
    return api.get(`/orders/no/${orderNo}`);
  },

  // 分页查询订单
  getOrderList(params = {}) {
    return api.get('/orders', { params });
  },

  // 支付订单
  payOrder(id, data = {}) {
    return api.post(`/orders/${id}/pay`, data);
  },

  // 接单
  acceptOrder(id, data = {}) {
    return api.post(`/orders/${id}/accept`, data);
  },

  // 拒绝订单
  rejectOrder(id, data) {
    return api.post(`/orders/${id}/reject`, data);
  },

  // 开始配送
  startDelivery(id, data = {}) {
    return api.post(`/orders/${id}/deliver`, data);
  },

  // 完成订单
  completeOrder(id, data = {}) {
    return api.post(`/orders/${id}/complete`, data);
  },

  // 取消订单
  cancelOrder(id, data) {
    return api.post(`/orders/${id}/cancel`, data);
  },

  // 更新订单状态
  updateOrderStatus(id, status) {
    return api.patch(`/orders/${id}/status?status=${status}`);
  }
};

// 用户相关 API
export const userAPI = {
  // 用户注册
  async register(data) {
    try {
      const response = await api.post('/users/register', data);
      console.log('从后端注册成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端注册API不可用，使用模拟数据:', error.message);
        // 模拟注册成功响应
        return {
          code: 200,
          msg: '注册成功（模拟）',
          data: {
            id: Date.now(),
            username: data.username,
            nickname: data.nickname,
            phone: data.phone,
            email: data.email,
            role: data.userType === 'merchant' ? 2 : 1,
            status: 1,
            createdAt: new Date().toISOString()
          }
        };
      }
      console.error('注册API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 用户登录
  async login(data) {
    try {
      const response = await api.post('/users/login', data);
      console.log('从后端登录成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端登录API不可用，使用模拟数据:', error.message);
        // 模拟登录验证
        const mockUsers = {
          'customer001': { id: 1, username: 'customer001', nickname: '测试顾客', role: 1, status: 1 },
          'merchant001': { id: 2, username: 'merchant001', nickname: '测试商家', role: 2, status: 1 },
          '13900139001': { id: 1, username: 'customer001', nickname: '测试顾客', role: 1, status: 1 },
          '13800138001': { id: 2, username: 'merchant001', nickname: '测试商家', role: 2, status: 1 }
        };
        
        const mockUser = mockUsers[data.account];
        if (mockUser && data.password === '123456') {
          return {
            code: 200,
            msg: '登录成功（模拟）',
            data: {
              user: mockUser,
              token: `mock_token_${mockUser.id}_${Date.now()}`,
              expires: Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
            }
          };
        } else {
          throw new Error('用户名或密码错误（模拟模式）');
        }
      }
      console.error('登录API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 获取用户信息
  getUserInfo(id) {
    return api.get(`/users/${id}`);
  },

  // 更新用户信息
  updateUserInfo(id, data) {
    return api.put(`/users/${id}`, data);
  },

  // 修改密码
  changePassword(id, oldPassword, newPassword) {
    return api.put(`/users/${id}/password?oldPassword=${oldPassword}&newPassword=${newPassword}`);
  },

  // 更新用户状态
  updateUserStatus(id, status) {
    return api.patch(`/users/${id}/status?status=${status}`);
  },

  // 检查用户名是否存在
  checkUsername(username) {
    return api.get('/users/check/username', { params: { username } });
  },

  // 检查手机号是否存在
  checkPhone(phone) {
    return api.get('/users/check/phone', { params: { phone } });
  },

  // 检查邮箱是否存在
  checkEmail(email) {
    return api.get('/users/check/email', { params: { email } });
  }
};

// 用户地址相关 API
export const addressAPI = {
  // 创建用户地址
  async createAddress(data) {
    try {
      const response = await api.post('/addresses', data);
      console.log('从后端创建地址成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端地址创建API不可用，使用模拟数据:', error.message);
        const newId = Date.now();
        const newAddress = {
          id: newId,
          userId: data.userId,
          name: data.name,
          phone: data.phone,
          province: data.province,
          city: data.city,
          district: data.district,
          detail: data.detail,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          isDefault: data.isDefault || false,
          tag: data.tag || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { code: 200, msg: '地址创建成功（模拟）', data: newAddress };
      }
      console.error('地址创建API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 更新用户地址
  async updateAddress(id, data) {
    try {
      const response = await api.put(`/addresses/${id}`, data);
      console.log('从后端更新地址成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端地址更新API不可用，使用模拟数据:', error.message);
        const updatedAddress = {
          id: id,
          ...data,
          updatedAt: new Date().toISOString()
        };
        return { code: 200, msg: '地址更新成功（模拟）', data: updatedAddress };
      }
      console.error('地址更新API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 获取地址详情
  async getAddressDetail(id) {
    try {
      const response = await api.get(`/addresses/${id}`);
      console.log('从后端获取地址详情成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端地址详情API不可用，使用模拟数据:', error.message);
        const { mockAddresses } = await import('../mock/testData.js');
        const address = mockAddresses.find(addr => addr.id === id);
        if (address) {
          return { code: 200, msg: '操作成功（模拟）', data: address };
        }
        throw new Error('地址不存在');
      }
      console.error('地址详情API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 获取用户地址列表
  async getUserAddresses(userId) {
    try {
      const response = await api.get(`/addresses/user/${userId}`);
      console.log('从后端获取用户地址列表成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端用户地址列表API不可用，使用模拟数据:', error.message);
        const { mockAddresses } = await import('../mock/testData.js');
        const userAddresses = mockAddresses.filter(addr => addr.userId === userId)
          .sort((a, b) => {
            if (a.isDefault !== b.isDefault) {
              return b.isDefault - a.isDefault;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        return { code: 200, msg: '操作成功（模拟）', data: userAddresses };
      }
      console.error('用户地址列表API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 获取用户默认地址
  async getUserDefaultAddress(userId) {
    try {
      const response = await api.get(`/addresses/user/${userId}/default`);
      console.log('从后端获取用户默认地址成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端用户默认地址API不可用，使用模拟数据:', error.message);
        const { mockAddresses } = await import('../mock/testData.js');
        const defaultAddress = mockAddresses.find(addr => addr.userId === userId && addr.isDefault === 1);
        if (defaultAddress) {
          return { code: 200, msg: '操作成功（模拟）', data: defaultAddress };
        }
        throw new Error('未设置默认地址');
      }
      console.error('用户默认地址API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 设置默认地址
  async setDefaultAddress(id, userId) {
    try {
      const response = await api.put(`/addresses/${id}/default?userId=${userId}`);
      console.log('从后端设置默认地址成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端设置默认地址API不可用，使用模拟数据:', error.message);
        return { code: 200, msg: '默认地址设置成功（模拟）', data: null };
      }
      console.error('设置默认地址API调用失败，且未启用模拟模式');
      throw error;
    }
  },

  // 删除地址
  async deleteAddress(id, userId) {
    try {
      const response = await api.delete(`/addresses/${id}?userId=${userId}`);
      console.log('从后端删除地址成功');
      return response;
    } catch (error) {
      if (isMockEnabled) {
        console.warn('后端删除地址API不可用，使用模拟数据:', error.message);
        return { code: 200, msg: '地址删除成功（模拟）', data: null };
      }
      console.error('删除地址API调用失败，且未启用模拟模式');
      throw error;
    }
  }
};

// 统计相关 API（商家端）
export const statsAPI = {
  // 获取销售统计
  getSalesStats(params = {}) {
    return api.get('/stats/sales', { params });
  },

  // 获取订单统计
  getOrderStats(params = {}) {
    return api.get('/stats/orders', { params });
  },

  // 获取菜品销售排行
  getDishRanking(params = {}) {
    return api.get('/stats/dish-ranking', { params });
  },

  // 获取收入趋势
  getRevenueTrend(params = {}) {
    return api.get('/stats/revenue-trend', { params });
  }
};

// 购物车相关 API
export const cartAPI = {
  // 获取购物车
  async getCart(userId) {
    try {
      const response = await api.get('/cart', { params: { userId } });
      console.log('从后端获取购物车成功');
      return response;
    } catch (error) {
      console.error('获取购物车API调用失败:', error.message);
      throw error;
    }
  },

  // 添加到购物车
  async addToCart(data, userId) {
    try {
      const response = await api.post('/cart/items', data, { params: { userId } });
      console.log('添加到购物车成功');
      return response;
    } catch (error) {
      console.error('添加到购物车API调用失败:', error.message);
      throw error;
    }
  },

  // 更新购物车商品数量
  async updateCartItem(itemId, quantity, userId) {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity }, { params: { userId } });
      console.log('更新购物车商品数量成功');
      return response;
    } catch (error) {
      console.error('更新购物车商品数量API调用失败:', error.message);
      throw error;
    }
  },

  // 删除购物车商品
  async removeFromCart(itemId, userId) {
    try {
      const response = await api.delete(`/cart/items/${itemId}`, { params: { userId } });
      console.log('从购物车删除商品成功');
      return response;
    } catch (error) {
      console.error('从购物车删除商品API调用失败:', error.message);
      throw error;
    }
  },

  // 清空购物车
  async clearCart(userId) {
    try {
      const response = await api.delete('/cart', { params: { userId } });
      console.log('清空购物车成功');
      return response;
    } catch (error) {
      console.error('清空购物车API调用失败:', error.message);
      throw error;
    }
  }
};

// 工具函数 - 检查后端服务状态
export const checkBackendHealth = async () => {
  try {
    // 直接使用axios实例发送请求，绕过请求拦截器的token检查
    const response = await axios.get(`${api.defaults.baseURL}/health`, { timeout: 5000 });
    console.log('✅ 后端服务运行正常:', response.data);
    return { status: 'healthy', message: '后端服务连接正常', data: response.data };
  } catch (error) {
    console.warn('❌ 后端服务不可用:', {
      baseURL: api.defaults.baseURL,
      error: error.message,
      mockEnabled: isMockEnabled
    });
    return { 
      status: 'unavailable', 
      message: '后端服务不可用', 
      error: error.message,
      mockEnabled: isMockEnabled 
    };
  }
};

// 工具函数 - 生成订单号
export const generateOrderNo = () => {
  const now = new Date();
  const timestamp = now.getTime();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TO${timestamp}${random}`;
};

// 工具函数 - 格式化价格
export const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : '0.00';
};

// 工具函数 - 订单状态映射
export const orderStatusMap = {
  1: { text: '待付款', color: 'orange' },
  2: { text: '待接单', color: 'blue' },
  3: { text: '已接单', color: 'green' },
  4: { text: '配送中', color: 'purple' },
  5: { text: '已完成', color: 'gray' },
  6: { text: '已取消', color: 'red' }
};

// 工具函数 - 支付状态映射
export const paymentStatusMap = {
  0: { text: '未支付', color: 'red' },
  1: { text: '已支付', color: 'green' },
  2: { text: '已退款', color: 'orange' }
};

// 工具函数 - 用户角色映射
export const userRoleMap = {
  1: { text: '顾客', color: 'blue' },
  2: { text: '商家', color: 'green' },
  3: { text: '管理员', color: 'purple' }
};

// 导出 axios 实例供其他模块使用
export default api;
