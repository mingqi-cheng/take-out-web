<template>
  <div class="not-found-page min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <div class="text-6xl mb-4">🤔</div>
      <h1 class="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p class="text-xl text-gray-600 mb-6">页面未找到</p>
      <p class="text-gray-500 mb-8">抱歉，您访问的页面不存在或已被移除。</p>
      
      <div class="space-x-4">
        <router-link
          to="/customer"
          class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors inline-block"
        >
          返回首页
        </router-link>
        <button
          @click="$router.go(-1)"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
        >
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404 页面组件
</script>