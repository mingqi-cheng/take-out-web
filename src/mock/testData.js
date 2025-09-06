// 测试数据模拟
// 这个文件用于在后端服务未启动时提供测试数据

export const mockMerchants = [
  {
    id: 1,
    userId: 2,
    name: "美味小厨",
    description: "正宗川菜，地道口味",
    phone: "0731-12345678",
    address: "四川省成都市锦江区春熙路123号",
    latitude: 30.6586,
    longitude: 104.0647,
    coverImage: null,
    businessHours: "09:00-22:00",
    deliveryFee: 5.00,
    minOrderAmount: 20.00,
    avgDeliveryTime: 30,
    rating: 4.8,
    salesVolume: 1250,
    status: 1,
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z"
  },
  {
    id: 2,
    userId: 3,
    name: "港式茶餐厅",
    description: "正宗港式茶餐厅，粤菜精品",
    phone: "020-87654321",
    address: "广东省广州市天河区珠江新城456号",
    latitude: 23.1291,
    longitude: 113.2644,
    coverImage: null,
    businessHours: "10:00-23:00",
    deliveryFee: 8.00,
    minOrderAmount: 30.00,
    avgDeliveryTime: 35,
    rating: 4.6,
    salesVolume: 980,
    status: 1,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T14:00:00Z"
  }
];

export const mockCategories = [
  { id: 1, merchantId: 1, name: "主食", description: "各种主食类菜品", sortOrder: 1, status: 1 },
  { id: 2, merchantId: 1, name: "配菜", description: "美味配菜", sortOrder: 2, status: 1 },
  { id: 3, merchantId: 1, name: "汤类", description: "温暖的汤品", sortOrder: 3, status: 1 },
  { id: 4, merchantId: 1, name: "饮品", description: "各种饮料", sortOrder: 4, status: 1 },
  { id: 5, merchantId: 2, name: "茶餐", description: "港式茶餐", sortOrder: 1, status: 1 },
  { id: 6, merchantId: 2, name: "点心", description: "精美点心", sortOrder: 2, status: 1 },
  { id: 7, merchantId: 2, name: "饮品", description: "港式饮品", sortOrder: 3, status: 1 }
];

export const mockDishes = [
  {
    id: 1,
    merchantId: 1,
    categoryId: 1,
    name: "宫保鸡丁",
    description: "经典川菜，鸡肉鲜嫩，花生酥脆，口感丰富",
    imageUrl: null,
    price: 28.00,
    originalPrice: 32.00,
    unit: "份",
    stock: 15, // 有限库存
    salesCount: 156,
    rating: 4.8,
    isRecommended: 1,
    status: 1,
    categoryName: "主食"
  },
  {
    id: 2,
    merchantId: 1,
    categoryId: 1,
    name: "麻婆豆腐",
    description: "正宗川味，豆腐嫩滑，麻辣鲜香",
    imageUrl: null,
    price: 18.00,
    originalPrice: null,
    unit: "份",
    stock: 0, // 已售罄
    salesCount: 89,
    rating: 4.6,
    isRecommended: 0,
    status: 1,
    categoryName: "主食"
  },
  {
    id: 3,
    merchantId: 1,
    categoryId: 2,
    name: "蒜蓉西兰花",
    description: "新鲜西兰花，蒜香浓郁，清爽不油腻",
    imageUrl: null,
    price: 15.00,
    originalPrice: null,
    unit: "份",
    stock: 3, // 库存较少
    salesCount: 67,
    rating: 4.5,
    isRecommended: 0,
    status: 1,
    categoryName: "配菜"
  },
  {
    id: 4,
    merchantId: 1,
    categoryId: 3,
    name: "酸辣汤",
    description: "开胃酸辣汤，温暖你的胃",
    imageUrl: null,
    price: 12.00,
    originalPrice: null,
    unit: "份",
    stock: -1, // 无限库存
    salesCount: 45,
    rating: 4.3,
    isRecommended: 0,
    status: 1,
    categoryName: "汤类"
  },
  {
    id: 5,
    merchantId: 1,
    categoryId: 4,
    name: "鲜榨橙汁",
    description: "新鲜橙子现榨，维C丰富",
    imageUrl: null,
    price: 15.00,
    originalPrice: null,
    unit: "杯",
    stock: 8, // 有限库存
    salesCount: 78,
    rating: 4.7,
    isRecommended: 1,
    status: 1,
    categoryName: "饮品"
  },
  {
    id: 6,
    merchantId: 2,
    categoryId: 5,
    name: "叉烧包",
    description: "港式经典，叉烧香甜，包子松软",
    imageUrl: null,
    price: 20.00,
    originalPrice: null,
    unit: "笼",
    stock: 1, // 仅剩1份
    salesCount: 134,
    rating: 4.9,
    isRecommended: 1,
    status: 1,
    categoryName: "茶餐"
  },
  {
    id: 7,
    merchantId: 2,
    categoryId: 5,
    name: "港式烧鹅",
    description: "皮脆肉嫩，香味浓郁的经典港式烧鹅",
    imageUrl: null,
    price: 38.00,
    originalPrice: 42.00,
    unit: "份",
    stock: -1, // 无限库存
    salesCount: 89,
    rating: 4.8,
    isRecommended: 1,
    status: 1,
    categoryName: "茶餐"
  },
  {
    id: 8,
    merchantId: 2,
    categoryId: 6,
    name: "流沙包",
    description: "咸蛋黄流沙馅，一口爆浆",
    imageUrl: null,
    price: 18.00,
    originalPrice: null,
    unit: "笼",
    stock: 5, // 有限库存
    salesCount: 56,
    rating: 4.6,
    isRecommended: 0,
    status: 1,
    categoryName: "点心"
  },
  {
    id: 9,
    merchantId: 2,
    categoryId: 7,
    name: "港式奶茶",
    description: "正宗港式奶茶，茶香浓郁，奶味醇厚",
    imageUrl: null,
    price: 12.00,
    originalPrice: null,
    unit: "杯",
    stock: -1, // 无限库存
    salesCount: 112,
    rating: 4.7,
    isRecommended: 1,
    status: 1,
    categoryName: "饮品"
  }
];

export const mockOrders = [
  {
    id: 1,
    orderNo: "ORD202501151030001",
    userId: 1,
    merchantId: 1,
    merchantName: "美味小厨",
    addressId: 1,
    status: 2, // 2-待接单
    totalAmount: 61.00,
    deliveryFee: 5.00,
    actualAmount: 61.00,
    paymentStatus: 1, // 1-已支付
    paymentMethod: "WECHAT",
    deliveryAddress: "四川省成都市锦江区春熙路789号",
    deliveryPhone: "13900139001",
    deliveryName: "张三",
    remark: "少辣",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:35:00Z",
    items: [
      { id: 1, dishId: 1, dishName: "宫保鸡丁", price: 28.00, quantity: 1, subtotal: 28.00 },
      { id: 2, dishId: 2, dishName: "麻婆豆腐", price: 18.00, quantity: 1, subtotal: 18.00 },
      { id: 3, dishId: 5, dishName: "鲜榨橙汁", price: 15.00, quantity: 1, subtotal: 15.00 }
    ]
  }
];

export const mockUsers = [
  {
    id: 1,
    username: "customer001",
    phone: "13900139001",
    email: "customer@example.com",
    nickname: "张三",
    avatarUrl: null,
    gender: 1, // 1-男
    birthday: "1990-01-01",
    role: 1, // 顾客
    status: 1,
    lastLoginAt: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    username: "merchant001",
    phone: "13800138001",
    email: "merchant@example.com",
    nickname: "美味小厨老板",
    avatarUrl: null,
    gender: 1,
    birthday: "1985-05-15",
    role: 2, // 商家
    status: 1,
    lastLoginAt: "2024-01-15T08:00:00Z",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z"
  },
  {
    id: 3,
    username: "merchant002",
    phone: "13800138002",
    email: "merchant2@example.com",
    nickname: "港式茶餐厅老板",
    avatarUrl: null,
    gender: 2, // 2-女
    birthday: "1988-03-20",
    role: 2, // 商家
    status: 1,
    lastLoginAt: "2024-01-15T09:30:00Z",
    createdAt: "2024-01-01T09:30:00Z",
    updatedAt: "2024-01-15T09:30:00Z"
  }
];

// 用户地址模拟数据
export const mockAddresses = [
  {
    id: 1,
    userId: 1,
    name: "张三",
    phone: "13900139001",
    province: "四川省",
    city: "成都市",
    district: "锦江区",
    detail: "春熙路789号",
    latitude: 30.6586,
    longitude: 104.0647,
    isDefault: true,
    tag: "家",
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    userId: 1,
    name: "张三",
    phone: "13900139001",
    province: "四川省",
    city: "成都市",
    district: "高新区",
    detail: "天府软件园B区1号楼",
    latitude: 30.5619,
    longitude: 103.9772,
    isDefault: false,
    tag: "公司",
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z"
  }
];

// 如果后端服务未启动，可以使用这些模拟数据进行开发和测试