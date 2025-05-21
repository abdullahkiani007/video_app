<template>
  <div class="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
    <!-- Futuristic grid background -->
    <div class="absolute inset-0 z-0 opacity-10">
      <div class="grid-bg"></div>
    </div>
    <!-- Glowing orbs -->
    <div class="absolute top-20 left-20 w-64 h-64 rounded-full bg-cyan-500 opacity-10 blur-[100px]"></div>
    <div class="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-purple-500 opacity-10 blur-[100px]"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <!-- Logo -->
      <div class="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden relative group">
        <!-- Glowing effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <!-- Logo content -->
        <div class="text-white font-bold text-xl relative z-10">YA</div>
      </div>

      <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
        {{ t('Sign In') }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-400">
        {{ t('Welcome back! Please enter your details') }}
      </p>
    </div>
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="bg-gray-900 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-800 backdrop-blur-sm relative group">
        <!-- Glowing border on focus -->
        <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/30 to-purple-500/30 opacity-0 group-focus-within:opacity-100 blur-sm -z-10 transition-opacity duration-300"></div>

        <form class="space-y-6" @submit.prevent="onSubmit">
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-300">
              {{ t('Username') }}
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="mdi mdi-account-outline text-gray-500"></i>
              </div>
              <input
                id="username"
                v-model="model.username"
                type="text"
                required
                :placeholder="t('Enter your username')"
                :disabled="isLoading"
                class="bg-gray-800 block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-purple-500 text-white transition-colors duration-300"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-300">
              {{ t('Password') }}
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="mdi mdi-lock-outline text-gray-500"></i>
              </div>
              <input
                id="password"
                v-model="model.password"
                type="password"
                required
                :placeholder="t('Enter your password')"
                :disabled="isLoading"
                class="bg-gray-800 block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-purple-500 text-white transition-colors duration-300"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transition-all duration-300 relative overflow-hidden group"
            >
              <span class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-10">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span :class="{ 'opacity-0': isLoading }" class="relative z-10">{{ t('Sign In') }}</span>
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="my-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-700"></div>
            </div>
          </div>
        </div>

        <!-- Sign Up Link -->
        <div class="mt-10 text-center">
          <p class="text-sm text-gray-400 mt-4">
            {{ t('Don\'t have an account?') }}
            <router-link to="/register" class="font-medium text-cyan-500 hover:text-purple-400 transition-colors">
              {{ t('Sign up') }}
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { error, success } from '@/components/common/NotificationPlugin'
import router from '@/router/router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'LoginPage',

  data() {
    return {
      isLoading: false,
      model: {
        username: '',
        password: ''
      }
    }
  },

  methods: {
    t(key) {
      // Fallback translation function if i18n is not available
      return this.$t ? this.$t(key) : key
    },

    async onSubmit() {
      if (this.isLoading) {
        return // Prevent multiple submissions
      }

      try {
        this.isLoading = true

        const authStore = useAuthStore()

        // Validate inputs before submission
        if (!this.model.username || !this.model.password) {
          throw new Error(this.t('Username and password are required'))
        }

        // Call authentication service/API
        await authStore.login({
          username: this.model.username,
          password: this.model.password
        })

        // Handle successful login
        success(this.t('Login successful'))

        // Add a small delay to ensure store updates are processed
        await new Promise(resolve => setTimeout(resolve, 100))

        // Use more robust navigation with error handling
        try {
          await this.$router.push('/chat')
          console.log('Navigation to /chat initiated')
        } catch (navError) {
          console.error('Navigation error:', navError)
          window.location.href = '/chat'
          // Fallback navigation method
        }
      } catch (err) {
        // Handle login errors safely
        const errorMessage = err instanceof Error ? err.message : this.t('Login failed. Please try again.')
        error(errorMessage)
        console.error('Login error:', err)
      } finally {
        this.isLoading = false
      }
    }
  }
})
</script>

<style>
/* Futuristic grid background */
.grid-bg {
  background-image:
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  width: 100%;
  height: 100%;
}

/* Pulse animation for elements */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
  }
}

/* Floating animation for icons */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
