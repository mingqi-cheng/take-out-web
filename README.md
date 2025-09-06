# 外卖点餐系统前端

这是一个基于 Vue 3 + Vite + Tailwind CSS 构建的外卖点餐系统前端应用，对接基于 Spring Cloud Alibaba 的微服务后端系统。

## 🚀 项目特性

### 核心功能
- **顾客端功能**
  - 浏览商家和菜品
  - 购物车管理
  - 在线下单和支付
  - 订单跟踪
  - 用户地址管理
  - 个人信息管理

- **商家端功能**
  - 商家信息管理
  - 菜品分类管理
  - 菜品管理
  - 订单处理
  - 销售统计
  - 营业状态控制

- **系统特性**
  - 响应式设计，支持移动端和桌面端
  - 实时订单状态更新
  - 统一的错误处理和用户反馈
  - 模块化的状态管理
  - 组件化开发

### 技术特性
- Vue 3 Composition API
- Vite 构建工具
- Tailwind CSS 样式框架
- Vuex 4 状态管理
- Vue Router 4 路由管理
- Axios HTTP 客户端
- 微服务架构对接

## 🏗️ 系统架构

### 前端架构
```
前端应用 (Vue 3)
├── 路由管理 (Vue Router)
├── 状态管理 (Vuex)
├── HTTP 请求 (Axios)
├── 样式框架 (Tailwind CSS)
└── 构建工具 (Vite)
```

### 后端对接
本前端应用对接基于 Spring Cloud Alibaba 的微服务后端：

```
前端应用 → API网关(8080) → 微服务集群
                           ├── 商家服务(8081)
                           ├── 消费者服务(8082)
                           └── 订单服务(8083)
```

### 状态管理模块
- `merchant` - 商家信息管理
- `category` - 菜品分类管理
- `dish` - 菜品信息管理
- `cart` - 购物车管理
- `order` - 订单管理
- `user` - 用户信息管理
- `address` - 用户地址管理
- `stats` - 统计数据管理
- `global` - 全局状态管理

## 📦 目录结构

```
src/
├── api/                 # API 接口定义
│   └── index.js        # 统一的 API 服务
├── components/         # 公共组件
│   └── Notification.vue
├── views/              # 页面组件
│   ├── auth/          # 认证相关页面
│   ├── customer/      # 顾客端页面
│   └── merchant/      # 商家端页面
├── router/            # 路由配置
├── store/             # Vuex 状态管理
├── App.vue            # 根组件
├── main.js            # 入口文件
└── style.css          # 全局样式
```

### 顾客端功能
- 📱 浏览菜单，查看菜品详情
- 🛒 购物车管理（添加、删除、修改数量）
- 📦 在线下单，实时状态更新
- 📋 查看订单历史
- 💰 实时计算总价

### 商家端功能
- 📊 订单管理（待处理、制作中、已完成）
- 🍔 菜单管理（添加、编辑、启用/禁用菜品）
- 📈 销售统计和数据分析
- ⚡ 订单状态实时更新
- 📱 响应式设计，支持多设备

## 🛠️ 技术架构

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **状态管理**: Vuex 4
- **路由管理**: Vue Router 4
- **HTTP 客户端**: Axios
- **开发模式**: 真实后端API集成

## 📁 项目结构

```
take-out/
├── src/
│   ├── api/                 # API 接口封装
│   │   └── index.js
│   ├── components/          # 公共组件
│   │   └── Notification.vue
│   ├── router/              # 路由配置
│   │   └── index.js
│   ├── store/               # Vuex 状态管理
│   │   └── index.js
│   ├── views/               # 页面组件
│   │   ├── customer/        # 顾客端页面
│   │   │   ├── Home.vue
│   │   │   ├── Menu.vue
│   │   │   └── Cart.vue
│   │   ├── merchant/        # 商家端页面
│   │   ├── auth/            # 认证页面
│   │   │   └── Login.vue
│   │   └── NotFound.vue
│   ├── App.vue              # 根组件
│   ├── main.js              # 入口文件
│   └── style.css            # 全局样式
├── .env.development         # 开发环境配置
├── .env.production          # 生产环境配置
├── index.html
├── package.json
├── tailwind.config.js       # Tailwind 配置
├── postcss.config.js        # PostCSS 配置
└── vite.config.js           # Vite 配置
```

## 🔧 开发环境搭建

### 前置要求
- Node.js (版本 16+)
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🎯 使用说明

### 顾客端使用
1. 点击顶部导航的"顾客端"按钮
2. 浏览菜单，选择心仪的菜品
3. 点击"加入购物车"添加商品
4. 在购物车中调整商品数量
5. 点击"下单"完成订单

### 商家端使用
1. 点击顶部导航的"商家端"按钮
2. 在"订单管理"标签页查看和处理订单
3. 点击"下一步"按钮更新订单状态
4. 在"菜单管理"标签页管理菜品
5. 在"统计报表"标签页查看销售数据

## 📊 后端集成

项目已准备好与你的后端API集成：
- 使用Axios进行HTTP请求
- 完整的API接口设计
- JWT token认证支持
- 错误处理和用户反馈
