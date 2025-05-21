<template>
  <div class="min-h-screen min-w-screen flex justify-center items-center">
    <div class="max-w-lg w-full">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout',
  created() {
    if (!this.$route.path.includes('/auth')) {
      console.warn('Auth layout loaded for non-auth route:', this.$route.path);
    }
  }
}
</script>

<style>
</style>
