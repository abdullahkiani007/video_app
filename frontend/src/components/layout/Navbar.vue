<template>
  <nav class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-full px-2 py-2 backdrop-blur-md border border-gray-700 shadow-lg transition-all duration-300 max-w-5xl w-11/12"
       :class="[isScrolled ? 'bg-gray-900/90 shadow-green-900/20' : 'bg-gray-800/80']">
    <div class="flex items-center justify-between px-4">
      <!-- Logo and Brand -->
      <div class="flex items-center space-x-3">
        <div class="h-10 w-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center shadow-lg overflow-hidden">
          <img
            v-if="logoLoaded"
            :src="logoUrl"
            :alt="logoAlt"
            class="h-7 w-auto filter brightness-0 invert"
            @error="handleImageError($event, 'logo')"
          />
          <div v-else class="text-white font-bold text-sm">
            {{ logoFallbackText }}
          </div>
        </div>
        <router-link to="/" class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
          VideoConf<span class="opacity-80 font-semibold">App</span>
        </router-link>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="md:hidden flex items-center p-2 rounded-full bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-green-500"
        @click="toggleMenu"
        aria-label="Toggle menu"
      >
        <div class="relative w-5 h-5" :class="{ 'open': isMenuOpen }">
          <span class="absolute h-0.5 w-full bg-gradient-to-r from-green-500 to-green-400 rounded transform transition-all duration-300"
                :class="isMenuOpen ? 'top-2 rotate-45' : 'top-0'"></span>
          <span class="absolute h-0.5 w-full bg-gradient-to-r from-green-500 to-green-400 rounded transform transition-all duration-300 top-2"
                :class="isMenuOpen ? 'opacity-0 -translate-x-5' : 'opacity-100'"></span>
          <span class="absolute h-0.5 w-full bg-gradient-to-r from-green-500 to-green-400 rounded transform transition-all duration-300"
                :class="isMenuOpen ? 'top-2 -rotate-45' : 'top-4'"></span>
        </div>
      </button>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center space-x-1">
        <template v-if="isAuthenticated">
          <!-- Logged in navigation -->
          <router-link to="/chat" class="px-4 py-2 rounded-full text-green-400 hover:bg-gray-700 font-medium transition-colors">
            Chat Room
          </router-link>
          <button
            class="ml-2 px-4 py-2 rounded-full bg-gray-700 text-green-400 hover:bg-green-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 font-medium"
            @click="handleLogout"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <!-- Logged out navigation -->
          <a href="#features" class="px-3 py-2 rounded-full text-green-400 hover:bg-gray-700 font-medium transition-colors">
            Features
          </a>
          <a href="#testimonials" class="px-3 py-2 rounded-full text-green-400 hover:bg-gray-700 font-medium transition-colors">
            Testimonials
          </a>
          <a href="#pricing" class="px-3 py-2 rounded-full text-green-400 hover:bg-gray-700 font-medium transition-colors">
            Pricing
          </a>
          <div class="flex items-center ml-2">
            <router-link
              to="/login"
              class="px-4 py-2 rounded-full bg-gray-700 text-green-400 hover:bg-gray-600 shadow-sm hover:shadow-md transition-all duration-300 font-medium"
            >
              Log In
            </router-link>
            <router-link
              to="/register"
              class="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-lg transition-all duration-300 font-medium relative overflow-hidden"
            >
              <span>Sign Up</span>
              <span class="absolute top-0 -left-full w-8 h-full bg-white/20 transform rotate-12 transition-all duration-1000 animate-shine"></span>
            </router-link>
          </div>
        </template>
      </div>

      <!-- Mobile Menu (Overlay) -->
      <div
        v-if="isMenuOpen"
        class="md:hidden fixed inset-0 bg-gray-900/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center space-y-8 p-6 animate-fadeIn"
      >
        <template v-if="isAuthenticated">
          <router-link
            to="/chat"
            class="text-xl font-medium text-green-400 hover:text-green-300 transition-colors"
            @click="isMenuOpen = false"
          >
            Chat Room
          </router-link>
          <button
            class="w-64 px-6 py-3 rounded-full bg-gray-800 text-green-400 hover:bg-green-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 font-medium"
            @click="handleLogout"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <a
            href="#features"
            class="text-xl font-medium text-green-400 hover:text-green-300 transition-colors"
            @click="isMenuOpen = false"
          >
            Features
          </a>
          <a
            href="#testimonials"
            class="text-xl font-medium text-green-400 hover:text-green-300 transition-colors"
            @click="isMenuOpen = false"
          >
            Testimonials
          </a>
          <a
            href="#pricing"
            class="text-xl font-medium text-green-400 hover:text-green-300 transition-colors"
            @click="isMenuOpen = false"
          >
            Pricing
          </a>
          <div class="flex flex-col w-64 space-y-4 mt-4">
            <router-link
              to="/login"
              class="w-full px-6 py-3 rounded-full bg-gray-800 text-green-400 hover:bg-gray-700 text-center shadow-sm hover:shadow-md transition-all duration-300 font-medium"
              @click="isMenuOpen = false"
            >
              Log In
            </router-link>
            <router-link
              to="/register"
              class="w-full px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-center text-white shadow-sm hover:shadow-md transition-all font-medium"
              @click="isMenuOpen = false"
            >
              Sign Up
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { AuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'Navbar',

  data() {
    return {
      authStore: null as AuthStore | null,
      isMenuOpen: false,
      isScrolled: false,
      logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
      logoAlt: 'VideoConf App Logo',
      logoFallbackText: 'VC',
      logoLoaded: true,
      window: window // Store window reference for responsive checks
    }
  },

  computed: {
    isAuthenticated(): boolean {
      return this.authStore?.isAuthenticated || false
    }
  },

  mounted() {
    this.authStore = useAuthStore()
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('resize', this.handleResize)
    this.handleScroll() // Check initial scroll position
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleScroll() {
      // Use a try-catch to handle potential errors with window access
      try {
        this.isScrolled = window.scrollY > 20
      } catch (error) {
        console.error('Error accessing window.scrollY:', error)
        this.isScrolled = false
      }
    },

    handleResize() {
      // Close mobile menu if screen size changes to desktop
      try {
        if (window.innerWidth >= 768 && this.isMenuOpen) {
          this.isMenuOpen = false
          document.body.style.overflow = ''
        }
      } catch (error) {
        console.error('Error in resize handler:', error)
      }
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen

      // Prevent scrolling when menu is open
      try {
        if (this.isMenuOpen) {
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = ''
        }
      } catch (error) {
        console.error('Error toggling body overflow:', error)
      }
    },

    handleImageError(event: Event, type: string) {
      // Defensive check for event and target
      if (!event || !(event.target instanceof HTMLElement)) {
        console.error('Invalid event in handleImageError')
        return
      }

      console.warn(`Image failed to load: ${type}`)

      // Update loading state based on image type
      if (type === 'logo') {
        this.logoLoaded = false

        try {
          // Apply fallback styling to container
          const container = event.target.closest('.navbar-brand')
          if (container) {
            container.classList.add('text-fallback')
          }
        } catch (error) {
          console.error('Error applying fallback styles:', error)
        }
      }

      // Hide the broken image
      try {
        event.target.style.display = 'none'
      } catch (error) {
        console.error('Error hiding broken image:', error)
      }
    },

    async handleLogout(): Promise<void> {
      if (!this.authStore) {
        console.error('Auth store not available')
        return
      }

      try {
        await this.authStore.logout()

        // Close mobile menu if open
        if (this.isMenuOpen) {
          this.isMenuOpen = false
          document.body.style.overflow = ''
        }

        // Navigate to login page
        try {
          await this.$router.push('/login')
        } catch (navError) {
          console.error('Navigation error:', navError)
          // Fallback navigation
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  }
})
</script>

<style scoped>
/* Add Tailwind animation for shine effect */
@keyframes shine {
  100% {
    left: 100%;
  }
}

.animate-shine {
  animation: shine 3s infinite;
}

/* Add Tailwind animation for fade-in effect */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Custom color variables to match the requested colors */
:root {
  --dark-gray: #111827;
  --medium-green: #3BA34B;
}

/* Apply custom colors where Tailwind classes might not be specific enough */
.bg-gradient-to-r.from-green-600.to-green-500 {
  --tw-gradient-from: var(--medium-green);
  --tw-gradient-to: #34a853;
}

.text-green-400 {
  color: var(--medium-green);
}

.bg-gray-800\/80, .bg-gray-900\/90 {
  --tw-bg-opacity: 0.8;
  background-color: rgba(17, 24, 39, var(--tw-bg-opacity));
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .bg-gray-800\/80 {
    @apply bg-gray-900/80;
  }

  .bg-gray-700 {
    background-color: #1f2937;
  }

  .hover\:bg-gray-700:hover {
    background-color: #1f2937;
  }

  .text-green-400 {
    color: #4ade80;
  }

  .hover\:text-green-300:hover {
    color: #86efac;
  }
}
</style>