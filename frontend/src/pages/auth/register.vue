<template>
  <div class="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-xl">
      <!-- Logo -->
      <div class="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center shadow-lg overflow-hidden">
        <!-- Logo fallback text -->
        <div class="text-white font-bold text-xl">YA</div>
      </div>

      <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
        Create an Account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-400">
        Join us today and start your journey
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
      <div class="bg-gray-800 py-6 px-4 shadow-xl sm:rounded-lg sm:px-8 border border-gray-700">
        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-200 text-sm">
          {{ error }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Name Fields Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- First Name Field -->
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-300">
                First Name
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="mdi mdi-account-outline text-gray-500"></i>
                </div>
                <input
                  id="first_name"
                  v-model="form.first_name"
                  type="text"
                  required
                  placeholder="First name"
                  :disabled="isLoading"
                  class="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-white text-sm"
                />
              </div>
            </div>

            <!-- Last Name Field -->
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-300">
                Last Name
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="mdi mdi-account-outline text-gray-500"></i>
                </div>
                <input
                  id="last_name"
                  v-model="form.last_name"
                  type="text"
                  required
                  placeholder="Last name"
                  :disabled="isLoading"
                  class="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-white text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-300">
              Username
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="mdi mdi-at text-gray-500"></i>
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                placeholder="Choose a username"
                :disabled="isLoading"
                class="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-white text-sm"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300">
              Email
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="mdi mdi-email-outline text-gray-500"></i>
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="Enter your email address"
                :disabled="isLoading"
                class="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-white text-sm"
              />
            </div>
          </div>

          <!-- Password Fields Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="mdi mdi-lock-outline text-gray-500"></i>
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  required
                  placeholder="Create a password"
                  minlength="8"
                  :disabled="isLoading"
                  class="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-white text-sm"
                />
              </div>
              <p class="mt-1 text-xs text-gray-400">Min 8 characters</p>
            </div>

            <!-- Confirm Password Field -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="mdi mdi-lock-check-outline text-gray-500"></i>
                </div>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm password"
                  minlength="8"
                  :disabled="isLoading"
                  class="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-white text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span :class="{ 'opacity-0': isLoading }">Register</span>
            </button>
          </div>

          <!-- Login Link -->
          <div class="text-center mt-6">
            <p class="text-sm text-gray-400">
              Already have an account?
              <router-link to="/login" class="font-medium text-green-500 hover:text-green-400 transition-colors">
                Log in
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'RegisterPage',

  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      error: null
    };
  },

  computed: {
    authStore() {
      return useAuthStore();
    },

    isLoading() {
      return this.authStore.isLoading;
    },

    isFormValid() {
      return (
        this.form.first_name.trim() !== '' &&
        this.form.last_name.trim() !== '' &&
        this.form.username.trim() !== '' &&
        this.form.email.trim() !== '' &&
        this.form.password.trim() !== '' &&
        this.form.password === this.form.confirmPassword &&
        this.form.password.length >= 8
      );
    }
  },

  methods: {
    async handleRegister() {
      if (!this.isFormValid) {
        return;
      }

      // Clear previous errors
      this.error = null;

      // Validate passwords match
      if (this.form.password !== this.form.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      try {
        // Call register method from auth store
        await this.authStore.register({
          username: this.form.username.trim(),
          first_name: this.form.first_name.trim(),
          last_name: this.form.last_name.trim(),
          password: this.form.password,
          password2: this.form.confirmPassword,
          email: this.form.email.trim()
        });

        // Make sure we're authenticated before redirecting
        if (this.authStore.isAuthenticated) {
          // Registration successful, redirect to dashboard or home
          try {
            await this.$router.push('/chat');
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback navigation
            window.location.href = '/chat';
          }
        } else {
          // If registration succeeded but we're not authenticated yet,
          // we might need to log in explicitly
          this.error = 'Registration successful. Please log in.';
          try {
            await this.$router.push('/login');
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback navigation
            window.location.href = '/login';
          }
        }
      } catch (err) {
        console.error('Registration error:', err);
        // Display error from auth store or set a generic error
        this.error = this.authStore.error || 'Registration failed. Please try again.';
      }
    }
  }
}
</script>