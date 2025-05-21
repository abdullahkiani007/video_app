<template>
  <div class="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo -->
      <div class="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center shadow-lg overflow-hidden">
        <!-- Replaced static logo with a fallback text -->
        <div class="text-white font-bold text-xl">YA</div>
      </div>

      <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
        {{ t('Sign In') }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-400">
        {{ t('Welcome back! Please enter your details') }}
      </p>
    </div>
    <p>https://984c-37-111-189-123.ngrok-free.app</p>
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-700">
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
                class="bg-gray-700 block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-white"
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
                class="bg-gray-700 block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-white"
              />
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                class="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-300">
                {{ t('Remember me') }}
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-green-500 hover:text-green-400">
                {{ t('Forgot your password?') }}
              </a>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 transition-all duration-300 relative overflow-hidden"
            >
              <span v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span :class="{ 'opacity-0': isLoading }">{{ t('Sign In') }}</span>
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-800 text-gray-400">{{ t('Or continue with') }}</span>
            </div>
          </div>

          <!-- Social Login Buttons -->
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div>
              <a href="#" class="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors">
                <i class="mdi mdi-google text-xl"></i>
              </a>
            </div>
            <div>
              <a href="#" class="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors">
                <i class="mdi mdi-github text-xl"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Sign Up Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-400">
            {{ t('Don\'t have an account?') }}
            <router-link to="/register" class="font-medium text-green-500 hover:text-green-400 transition-colors">
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
          await router.push('/chat')
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
</style>
