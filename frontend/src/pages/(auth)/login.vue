<template>
  <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
    {{ t('Sign In') }}
  </h2>
  <BaseForm
    :submit-label="t('Sign In')"
    @submit="onSubmit"
  >
    <FormKit
      v-model="model.username"
      type="text"
      :label="t('Username')"
      :placeholder="t('Enter your username')"
      validation="required"
      validation-visibility="dirty"
    />

    <FormKit
      v-model="model.password"
      type="password"
      :label="t('Password')"
      :placeholder="t('Enter your password')"
      validation="required"
      validation-visibility="dirty"
      :classes="{
        outer: 'w-full',
        input: 'w-full',
      }"
    />
  </BaseForm>
</template>

<script lang="ts">
import {error, success} from '@/components/common/NotificationPlugin'
import router from '@/router/router'
import {useAuthStore} from '@/stores/auth'

export default {
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
      return this.$t(key)
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
        const result = await authStore.login({
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
}
</script>

<style>
</style>
