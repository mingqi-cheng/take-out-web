<template>
  <div class="menu-page p-6">
    <div class="container mx-auto">
      <!-- 页面标题和操作 -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">菜单管理</h2>
        <button 
          @click="showAddModal = true"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          添加菜品
        </button>
      </div>

      <!-- 菜单列表 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="item in menuList"
          :key="item.id"
          class="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <!-- 菜品图片 -->
          <div class="h-48 bg-gray-200 relative">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            >
            <div v-else class="flex items-center justify-center h-full text-gray-400">
              <span class="text-4xl">🍽️</span>
            </div>
            
            <!-- 可用状态切换 -->
            <div class="absolute top-2 right-2">
              <button
                @click="toggleAvailability(item)"
                :class="{
                  'bg-green-500': item.available,
                  'bg-gray-500': !item.available
                }"
                class="text-white text-xs px-2 py-1 rounded"
              >
                {{ item.available ? '在售' : '停售' }}
              </button>
            </div>
          </div>

          <!-- 菜品信息 -->
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-1">{{ item.name }}</h3>
            <p v-if="item.description" class="text-gray-600 text-sm mb-2 line-clamp-2">
              {{ item.description }}
            </p>
            <div class="flex items-center justify-between mb-3">
              <span class="text-red-500 font-bold text-lg">¥{{ item.price }}</span>
              <span v-if="item.category" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {{ item.category }}
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="flex space-x-2">
              <button
                @click="editItem(item)"
                class="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors text-sm"
              >
                编辑
              </button>
              <button
                @click="deleteItem(item.id)"
                class="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && menuList.length === 0" class="text-center py-12">
        <span class="text-6xl mb-4 block">🍽️</span>
        <h3 class="text-lg font-medium text-gray-800 mb-2">暂无菜品</h3>
        <p class="text-gray-600 mb-6">开始添加您的第一个菜品吧！</p>
        <button
          @click="showAddModal = true"
          class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          添加菜品
        </button>
      </div>
    </div>

    <!-- 添加/编辑菜品模态框 -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditModal ? '编辑菜品' : '添加菜品' }}
        </h3>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">菜品名称</label>
            <input
              v-model="menuForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入菜品名称"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">菜品描述</label>
            <textarea
              v-model="menuForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入菜品描述"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">价格</label>
            <input
              v-model.number="menuForm.price"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入价格"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <input
              v-model="menuForm.category"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入分类（如：主食、饮品等）"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">图片链接</label>
            <input
              v-model="menuForm.image"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入图片链接"
            >
          </div>

          <div class="flex items-center">
            <input
              v-model="menuForm.available"
              type="checkbox"
              id="available"
              class="form-checkbox h-4 w-4 text-blue-500"
            >
            <label for="available" class="ml-2 text-sm text-gray-700">立即上架</label>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="formLoading"
              class="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            >
              {{ formLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

// 响应式数据
const loading = ref(false);
const formLoading = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingItem = ref(null);

// 表单数据
const menuForm = reactive({
  name: '',
  description: '',
  price: 0,
  category: '',
  image: '',
  available: true
});

// 计算属性
const menuList = computed(() => store.state.menu.menuList);

// 重置表单
const resetForm = () => {
  Object.keys(menuForm).forEach(key => {
    if (key === 'available') {
      menuForm[key] = true;
    } else if (key === 'price') {
      menuForm[key] = 0;
    } else {
      menuForm[key] = '';
    }
  });
};

// 关闭模态框
const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingItem.value = null;
  resetForm();
};

// 编辑菜品
const editItem = (item) => {
  editingItem.value = item;
  Object.keys(menuForm).forEach(key => {
    menuForm[key] = item[key] || (key === 'available' ? true : key === 'price' ? 0 : '');
  });
  showEditModal.value = true;
};

// 提交表单
const submitForm = async () => {
  try {
    formLoading.value = true;
    
    if (showEditModal.value && editingItem.value) {
      // 编辑菜品
      await store.dispatch('menu/updateMenuItem', {
        id: editingItem.value.id,
        data: { ...menuForm }
      });
      store.dispatch('showSuccess', '菜品更新成功');
    } else {
      // 添加菜品
      await store.dispatch('menu/createMenuItem', { ...menuForm });
      store.dispatch('showSuccess', '菜品添加成功');
    }
    
    closeModal();
  } catch (error) {
    store.dispatch('showError', showEditModal.value ? '菜品更新失败' : '菜品添加失败');
  } finally {
    formLoading.value = false;
  }
};

// 切换可用状态
const toggleAvailability = async (item) => {
  try {
    await store.dispatch('menu/updateMenuStatus', {
      id: item.id,
      status: !item.available
    });
    store.dispatch('showSuccess', `${item.name} 已${item.available ? '停售' : '上架'}`);
  } catch (error) {
    store.dispatch('showError', '更新菜品状态失败');
  }
};

// 删除菜品
const deleteItem = async (itemId) => {
  if (!confirm('确定要删除这个菜品吗？')) return;
  
  try {
    await store.dispatch('menu/deleteMenuItem', itemId);
    store.dispatch('showSuccess', '菜品删除成功');
  } catch (error) {
    store.dispatch('showError', '菜品删除失败');
  }
};

// 处理图片错误
const handleImageError = (event) => {
  event.target.style.display = 'none';
};

// 获取菜单数据
const fetchMenu = async () => {
  try {
    loading.value = true;
    await store.dispatch('menu/fetchMenuList');
  } catch (error) {
    store.dispatch('showError', '获取菜单失败');
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchMenu();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>