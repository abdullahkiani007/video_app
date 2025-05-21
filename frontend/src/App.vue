<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="shouldShowNavbar" />
    <main class="flex-1">
      <router-view></router-view>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { DEFAULT_APP_TITLE } from '@/modules/common/config'
import Navbar from '@/components/layout/Navbar.vue'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'App',
  components: {
    Navbar
  },
  data() {
    return {
      allowedRoutes: ['/', 'Login', 'Register']
    }
  },
  computed: {
    shouldShowNavbar(): boolean {
      // Safely check if route exists and has a name
      if (!this.$route || !this.$route.name) {
        return false
      }

      // Check if current route name is in the allowed routes array
      return this.allowedRoutes.includes(String(this.$route.name))
    }
  },
  created() {
    const authStore = useAuthStore()
    authStore.initializeFromStorage()
  },
  watch: {
    $route: {
      handler() {
        this.setTitle()
      },
      immediate: true,
    },
  },
  methods: {
    setTitle() {
      // Defensive check to ensure route has a name
      if (this.$route && this.$route.name) {
        document.title = `${String(this.$route.name)} - ${DEFAULT_APP_TITLE}`
      } else {
        document.title = DEFAULT_APP_TITLE
      }
    },
  },
})
</script>
