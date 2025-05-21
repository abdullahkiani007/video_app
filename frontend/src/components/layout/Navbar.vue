<template>
  <nav class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-full px-2 py-2 backdrop-blur-md border border-gray-800 shadow-lg transition-all duration-300 max-w-5xl w-11/12"
       :class="[isScrolled ? 'bg-gray-900/90 shadow-cyan-900/20' : 'bg-gray-800/80']">
    <div class="flex items-center justify-between px-4">
      <!-- Logo and Brand -->
      <div class="flex items-center space-x-3">
        <div class="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden group relative">
          <!-- Glowing effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <img
            v-if="logoLoaded"
            :src="logoUrl"
            :alt="logoAlt"
            class="h-7 w-auto filter brightness-0 invert relative z-10"
            @error="handleImageError($event, 'logo')"
          />
          <div v-else class="text-white font-bold text-sm relative z-10">
            {{ logoFallbackText }}
          </div>
        </div>
        <router-link to="/" class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-500 to-purple-400 bg-clip-text text-transparent">
          VideoConf<span class="opacity-80 font-semibold">App</span>
        </router-link>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="md:hidden flex items-center p-2 rounded-full bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        @click="toggleMenu"
        aria-label="Toggle menu"
        type="button"
      >
        <div class="relative w-5 h-5">
          <span class="absolute h-0.5 w-full bg-gradient-to-r from-cyan-500 to-purple-400 rounded transform transition-all duration-300"
                :class="isMenuOpen ? 'top-2 rotate-45' : 'top-0'"></span>
          <span class="absolute h-0.5 w-full bg-gradient-to-r from-cyan-500 to-purple-400 rounded transform transition-all duration-300 top-2"
                :class="isMenuOpen ? 'opacity-0 -translate-x-5' : 'opacity-100'"></span>
          <span class="absolute h-0.5 w-full bg-gradient-to-r from-cyan-500 to-purple-400 rounded transform transition-all duration-300"
                :class="isMenuOpen ? 'top-2 -rotate-45' : 'top-4'"></span>
        </div>
      </button>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center space-x-1">
        <template v-if="isAuthenticated">
          <!-- Logged in navigation -->
          <router-link to="/chat" class="px-4 py-2 rounded-full text-cyan-400 hover:bg-gray-700 font-medium transition-colors">
            Chat Room
          </router-link>
          <button
            class="ml-2 px-4 py-2 rounded-full bg-gray-700 text-cyan-400 hover:bg-purple-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 font-medium"
            @click="handleLogout"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <!-- Logged out navigation -->
          <a href="/#features" class="px-3 py-2 rounded-full text-cyan-400 hover:bg-gray-700 font-medium transition-colors">
            Features
          </a>
          <a href="/#testimonials" class="px-3 py-2 rounded-full text-cyan-400 hover:bg-gray-700 font-medium transition-colors">
            Testimonials
          </a>
          <a href="/#pricing" class="px-3 py-2 rounded-full text-cyan-400 hover:bg-gray-700 font-medium transition-colors">
            Pricing
          </a>
          <div class="flex items-center ml-2">
            <router-link
              to="/login"
              class="px-4 py-2 rounded-full bg-gray-700 text-cyan-400 hover:bg-gray-600 shadow-sm hover:shadow-md transition-all duration-300 font-medium"
            >
              Log In
            </router-link>
            <router-link
              to="/register"
              class="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300 font-medium relative overflow-hidden group"
            >
              <span class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span class="relative z-10">Sign Up</span>
              <span class="absolute top-0 -left-full w-8 h-full bg-white/20 transform rotate-12 transition-all duration-1000 animate-shine"></span>
            </router-link>
          </div>
        </template>
      </div>

      <!-- Mobile Menu (Overlay) -->
      <div
        v-show="isMenuOpen"
        class="md:hidden fixed inset-0 bg-gray-900/80 backdrop-blur-md z-40 flex flex-col items-center justify-center space-y-6 p-6 animate-fadeIn"
        style="height: 100vh; overflow-y: auto;"
      >
        <button
          class="absolute top-6 right-6 text-cyan-400 p-2 rounded-full bg-gray-800/90 hover:bg-gray-700/90 transition-colors"
          @click="closeMenu"
          aria-label="Close menu"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 w-11/12 max-w-md border border-gray-700/50 shadow-xl">
          <template v-if="isAuthenticated">
            <div class="flex flex-col items-center space-y-4">
              <router-link
                to="/chat"
                class="w-full px-4 py-3 rounded-full text-cyan-400 hover:bg-gray-700/80 font-medium transition-colors text-center"
                @click="closeMenu"
              >
                Chat Room
              </router-link>
              <button
                class="w-full px-6 py-3 rounded-full bg-gray-700/90 text-cyan-400 hover:bg-purple-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                @click="handleLogout"
              >
                Logout
              </button>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center space-y-4 mobile-menu-text">
              <a
                href="/#features"
                class="w-full px-4 py-3 rounded-full text-cyan-400 font-medium transition-colors text-center"
                @click="closeMenu"
              >
              <p class="mobile-menu-text">Features</p>
              </a>
              <a
                href="/#testimonials"
                class="w-full px-4 py-3 rounded-full text-cyan-400 font-medium transition-colors text-center"
                @click="closeMenu"
              >
                Testimonials
              </a>

              <div class="flex flex-col w-full space-y-4 mt-2">
                <router-link
                  to="/login"
                  class="w-full mobile-menu-button px-6 py-3 rounded-full bg-gray-700/90 text-cyan-400 hover:bg-gray-600/90 text-center shadow-sm hover:shadow-md transition-all duration-300 font-medium"
                  @click="closeMenu"
                >
                 <p class="mobile-menu-button">Log In</p>
                </router-link>
                <router-link
                  to="/register"
                  class="w-full px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-center text-white shadow-sm hover:shadow-lg transition-all duration-300 font-medium relative overflow-hidden group"
                  @click="closeMenu"
                >
                  <span class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span class="relative z-10">Sign Up</span>
                  <span class="absolute top-0 -left-full w-8 h-full bg-white/20 transform rotate-12 transition-all duration-1000 animate-shine"></span>
                </router-link>
              </div>
            </div>
          </template>
        </div>
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
      window: window, // Store window reference for responsive checks
      mediaQuery: null as MediaQueryList | null
    }
  },

  computed: {
    isAuthenticated(): boolean {
      return this.authStore?.isAuthenticated || false
    }
  },

  mounted() {
    this.authStore = useAuthStore()

    // Safely add event listeners with error handling
    try {
      window.addEventListener('scroll', this.handleScroll)
      window.addEventListener('resize', this.handleResize)

      // Add media query listener for responsive behavior
      this.mediaQuery = window.matchMedia('(min-width: 768px)')
      this.mediaQuery.addEventListener('change', this.handleMediaQueryChange)

      this.handleScroll() // Check initial scroll position
    } catch (error) {
      console.error('Error setting up event listeners:', error)
    }

    // Handle clicks outside the menu to close it
    document.addEventListener('click', this.handleOutsideClick)
  },

  beforeUnmount() {
    // Safely remove event listeners with error handling
    try {
      window.removeEventListener('scroll', this.handleScroll)
      window.removeEventListener('resize', this.handleResize)
      document.removeEventListener('click', this.handleOutsideClick)

      if (this.mediaQuery) {
        this.mediaQuery.removeEventListener('change', this.handleMediaQueryChange)
      }

      // Ensure body overflow is restored when component is unmounted
      document.body.style.overflow = ''
    } catch (error) {
      console.error('Error removing event listeners:', error)
    }
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

    handleMediaQueryChange(event: MediaQueryListEvent) {
      try {
        if (event.matches && this.isMenuOpen) {
          this.closeMenu()
        }
      } catch (error) {
        console.error('Error in media query handler:', error)
      }
    },

    closeMenu() {
      this.isMenuOpen = false
      try {
        document.body.style.overflow = ''
      } catch (error) {
        console.error('Error resetting body overflow:', error)
      }
    },

    toggleMenu(event: Event) {
      // Prevent event propagation to avoid immediate closing
      if (event) {
        event.stopPropagation()
      }

      this.isMenuOpen = !this.isMenuOpen

      // Prevent scrolling when menu is open
      try {
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : ''

        // Force layout recalculation to ensure menu expands properly
        if (this.isMenuOpen) {
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 10);
        }
      } catch (error) {
        console.error('Error toggling body overflow:', error)
      }
    },

    handleOutsideClick(event: MouseEvent) {
      // Only process if menu is open
      if (!this.isMenuOpen) return

      try {
        // Check if click is outside the menu toggle button and menu content
        const target = event.target as HTMLElement
        const isMenuButton = target.closest('button[aria-label="Toggle menu"]')
        const isMenuContent = target.closest('.animate-fadeIn')

        if (!isMenuButton && !isMenuContent) {
          this.closeMenu()
        }
      } catch (error) {
        console.error('Error in outside click handler:', error)
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
          this.closeMenu()
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

.mobile-menu-text > a {
  color: #22d3ee; /* cyan-400 */
}

.mobile-menu-button {
  color: #22d3ee; /* cyan-400 */
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

/* Custom color variables to match the requested colors */
:root {
  --dark-gray: #111827;
  --medium-cyan: #22d3ee;
  --medium-purple: #a855f7;
}

/* Apply custom colors where Tailwind classes might not be specific enough */
.bg-gradient-to-r.from-cyan-600.to-purple-600 {
  --tw-gradient-from: #0891b2;
  --tw-gradient-to: #9333ea;
}

.text-cyan-400 {
  color: var(--medium-cyan);
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

  .text-cyan-400 {
    color: #22d3ee;
  }

  .hover\:text-purple-300:hover {
    color: #d8b4fe;
  }
}
</style>