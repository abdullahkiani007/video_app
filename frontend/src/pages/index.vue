<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LandingPage',

  data() {
    return {
      isMenuOpen: false,
      logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
      logoAlt: 'YourApp Logo',
      heroImageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      heroImageAlt: 'Team collaborating on a project',
      testimonialImageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      testimonialImageAlt: 'Jane Doe',
      logoFallbackText: 'YourApp',
      heroFallbackText: 'Platform Visualization',
      logoLoaded: true,
      heroLoaded: true,
      testimonialImageLoaded: true,
      features: [
        {
          id: 1,
          title: 'Easy to Use',
          description: 'Our intuitive interface makes it simple to get started right away.',
          icon: 'mdi-check-circle-outline'
        },
        {
          id: 2,
          title: 'Secure',
          description: 'Your data is protected with enterprise-grade security measures.',
          icon: 'mdi-shield-check-outline'
        },
        {
          id: 3,
          title: 'Fast & Reliable',
          description: 'Experience lightning-fast performance with 99.9% uptime.',
          icon: 'mdi-rocket-launch-outline'
        },
        {
          id: 4,
          title: 'Smart Analytics',
          description: 'Gain valuable insights with our powerful analytics tools.',
          icon: 'mdi-chart-line'
        },
        {
          id: 5,
          title: 'Team Collaboration',
          description: 'Work together seamlessly with real-time collaboration features.',
          icon: 'mdi-account-group-outline'
        },
        {
          id: 6,
          title: 'Mobile Friendly',
          description: 'Access your work from anywhere on any device.',
          icon: 'mdi-cellphone-link'
        }
      ],
      testimonials: [
        {
          id: 1,
          text: "This platform has completely transformed how our team works. We've increased productivity by 35% since implementing it.",
          name: "Jane Doe",
          position: "Product Manager, Acme Inc.",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
          id: 2,
          text: "The collaboration features are outstanding. We've cut our meeting time in half and improved our project delivery.",
          name: "John Smith",
          position: "CTO, TechStart",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
          id: 3,
          text: "Customer support is exceptional. Any time we've had questions, the team has been responsive and helpful.",
          name: "Emily Chen",
          position: "Operations Director, Global Solutions",
          avatar: "https://randomuser.me/api/portraits/women/68.jpg"
        }
      ],
      currentTestimonialIndex: 0
    }
  },

  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },

    navigateTo(path) {
      // Defensive check to ensure path is a string
      if (typeof path !== 'string') {
        console.error('Invalid navigation path')
        return
      }

      try {
        this.$router.push(path)
      } catch (error) {
        console.error('Navigation error:', error)
      }
    },

    handleImageError(event, type) {
      // More robust image error handling with type parameter
      if (!event || !event.target) {
        console.error('Invalid event in handleImageError')
        return
      }

      console.warn(`Image failed to load: ${type}`)

      // Update loading state based on image type
      if (type === 'logo') {
        this.logoLoaded = false
        // Apply fallback styling to container
        const container = event.target.closest('.navbar-brand, .footer-brand')
        if (container) {
          container.classList.add('text-fallback')
        }
      } else if (type === 'hero') {
        this.heroLoaded = false
      } else if (type === 'testimonial') {
        this.testimonialImageLoaded = false
      }

      // Hide the broken image
      event.target.style.display = 'none'
    },

    changeTestimonial(direction) {
      // Defensive check for valid direction
      if (typeof direction !== 'string' || (direction !== 'next' && direction !== 'prev')) {
        console.error('Invalid direction for testimonial change');
        return;
      }

      const totalTestimonials = this.testimonials.length;

      // Defensive check for empty testimonials array
      if (!totalTestimonials) {
        console.warn('No testimonials available');
        return;
      }

      if (direction === 'next') {
        this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % totalTestimonials;
      } else {
        this.currentTestimonialIndex = (this.currentTestimonialIndex - 1 + totalTestimonials) % totalTestimonials;
      }
    }
  },

  beforeRouteEnter(to, from, next) {
    // We'll allow access to the landing page regardless of auth status
    next()
  },
})
</script>

<template>
  <div class="landing-page bg-gray-900 text-white">
    <!-- Hero Section -->
    <section class="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 z-0"></div>
      <div class="container mx-auto px-4 relative z-10">
        <div class="flex flex-col md:flex-row items-center gap-12">
          <div class="w-full md:w-1/2 text-center md:text-left">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
              Welcome to a Better Way to Work
            </h1>
            <p class="text-lg md:text-xl text-gray-300 mb-8">
              Streamline your workflow, collaborate seamlessly, and achieve more with our powerful platform.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                class="px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white font-medium hover:shadow-lg transition-all duration-300"
                @click="navigateTo('/register')"
                aria-label="Get started with a free account"
              >
                Get Started — It's Free
              </button>
              <button
                class="px-6 py-3 rounded-full bg-gray-800 border border-gray-700 text-green-400 font-medium hover:bg-gray-700 transition-all duration-300"
                @click="navigateTo('/demo')"
                aria-label="Watch a product demonstration"
              >
                Watch Demo
              </button>
            </div>
          </div>
          <div class="w-full md:w-1/2">
            <div class="relative rounded-xl overflow-hidden shadow-2xl shadow-green-900/20">
              <img
                v-if="heroLoaded"
                :src="heroImageUrl"
                :alt="heroImageAlt"
                class="w-full h-auto transform hover:scale-105 transition-transform duration-700"
                @error="(e) => handleImageError(e, 'hero')"
              />
              <div v-else class="bg-gray-800 w-full h-64 flex flex-col items-center justify-center">
                <div class="text-4xl text-gray-600 mb-2">
                  <i class="mdi mdi-image-outline"></i>
                </div>
                <p class="text-gray-500">{{ heroFallbackText }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 md:py-24 bg-gray-800">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-white">Why Choose Us</h2>
        <p class="text-xl text-gray-400 text-center max-w-3xl mx-auto mb-16">
          Powerful features designed to boost your productivity
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            :key="feature.id"
            class="bg-gray-900 rounded-xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/10 hover:-translate-y-1"
          >
            <div class="text-green-500 text-4xl mb-6">
              <i :class="feature.icon"></i>
            </div>
            <h3 class="text-xl font-bold mb-4 text-white">{{ feature.title }}</h3>
            <p class="text-gray-400">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="py-16 md:py-24 bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-white">What Our Users Say</h2>
        <p class="text-xl text-gray-400 text-center max-w-3xl mx-auto mb-16">
          Join thousands of satisfied customers worldwide
        </p>

        <div class="relative max-w-4xl mx-auto">
          <button
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 text-green-500 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
            @click="changeTestimonial('prev')"
            aria-label="Previous testimonial"
          >
            <i class="mdi mdi-chevron-left text-2xl"></i>
          </button>

          <div class="bg-gray-800 rounded-2xl p-8 md:p-10 border border-gray-700 shadow-xl">
            <p class="text-xl md:text-2xl text-gray-300 italic mb-8 relative">
              <span class="absolute -top-6 -left-2 text-6xl text-green-500/20">"</span>
              {{ testimonials[currentTestimonialIndex].text }}
              <span class="absolute -bottom-10 -right-2 text-6xl text-green-500/20">"</span>
            </p>
            <div class="flex items-center">
              <img
                :src="testimonials[currentTestimonialIndex].avatar"
                :alt="testimonials[currentTestimonialIndex].name"
                class="w-14 h-14 rounded-full border-2 border-green-500 object-cover mr-4"
                @error="(e) => handleImageError(e, 'testimonial')"
              />
              <div>
                <h4 class="font-bold text-white">{{ testimonials[currentTestimonialIndex].name }}</h4>
                <p class="text-gray-400">{{ testimonials[currentTestimonialIndex].position }}</p>
              </div>
            </div>
          </div>

          <button
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 text-green-500 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
            @click="changeTestimonial('next')"
            aria-label="Next testimonial"
          >
            <i class="mdi mdi-chevron-right text-2xl"></i>
          </button>
        </div>

        <div class="flex justify-center mt-8 space-x-2">
          <button
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.id"
            class="w-3 h-3 rounded-full transition-all duration-300"
            :class="index === currentTestimonialIndex ? 'bg-green-500 scale-125' : 'bg-gray-700 hover:bg-gray-600'"
            @click="currentTestimonialIndex = index"
            :aria-label="`Go to testimonial ${index + 1}`"
          ></button>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 md:py-24 bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div class="p-6 rounded-xl bg-gray-900 border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h3 class="text-3xl md:text-4xl font-bold text-green-500 mb-2">10,000+</h3>
            <p class="text-gray-400">Active Users</p>
          </div>
          <div class="p-6 rounded-xl bg-gray-900 border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h3 class="text-3xl md:text-4xl font-bold text-green-500 mb-2">99.9%</h3>
            <p class="text-gray-400">Uptime</p>
          </div>
          <div class="p-6 rounded-xl bg-gray-900 border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h3 class="text-3xl md:text-4xl font-bold text-green-500 mb-2">50+</h3>
            <p class="text-gray-400">Integrations</p>
          </div>
          <div class="p-6 rounded-xl bg-gray-900 border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h3 class="text-3xl md:text-4xl font-bold text-green-500 mb-2">24/7</h3>
            <p class="text-gray-400">Support</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Get Started?</h2>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of satisfied users today.</p>
        <button
          class="px-8 py-4 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white font-medium text-lg hover:shadow-lg hover:shadow-green-900/20 transition-all duration-300 transform hover:-translate-y-1"
          @click="navigateTo('/register')"
          aria-label="Create your free account"
        >
          Create Free Account
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="pt-16 pb-8 bg-gray-900 border-t border-gray-800">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div class="flex items-center mb-4">
              <div class="h-10 w-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center shadow-lg overflow-hidden mr-3">
                <img
                  v-if="logoLoaded"
                  :src="logoUrl"
                  :alt="logoAlt"
                  class="h-6 w-auto filter brightness-0 invert"
                  @error="(e) => handleImageError(e, 'logo')"
                />
                <div v-else class="text-white font-bold text-sm">{{ logoFallbackText }}</div>
              </div>
              <h3 class="text-xl font-bold text-white">YourApp</h3>
            </div>
            <p class="text-gray-400 mb-6">Making work better since 2023.</p>
            <div class="flex space-x-4">
              <a href="#" aria-label="Facebook" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-colors">
                <i class="mdi mdi-facebook text-xl"></i>
              </a>
              <a href="#" aria-label="Twitter" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-colors">
                <i class="mdi mdi-twitter text-xl"></i>
              </a>
              <a href="#" aria-label="LinkedIn" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-colors">
                <i class="mdi mdi-linkedin text-xl"></i>
              </a>
              <a href="#" aria-label="Instagram" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-colors">
                <i class="mdi mdi-instagram text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 class="text-lg font-bold text-white mb-4">Product</h4>
            <ul class="space-y-2">
              <li><a href="#features" class="text-gray-400 hover:text-green-500 transition-colors">Features</a></li>
              <li><a href="#pricing" class="text-gray-400 hover:text-green-500 transition-colors">Pricing</a></li>
              <li><a href="#integrations" class="text-gray-400 hover:text-green-500 transition-colors">Integrations</a></li>
              <li><a href="#roadmap" class="text-gray-400 hover:text-green-500 transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-bold text-white mb-4">Company</h4>
            <ul class="space-y-2">
              <li><a href="#about" class="text-gray-400 hover:text-green-500 transition-colors">About Us</a></li>
              <li><a href="#careers" class="text-gray-400 hover:text-green-500 transition-colors">Careers</a></li>
              <li><a href="#contact" class="text-gray-400 hover:text-green-500 transition-colors">Contact</a></li>
              <li><a href="#press" class="text-gray-400 hover:text-green-500 transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-bold text-white mb-4">Resources</h4>
            <ul class="space-y-2">
              <li><a href="#blog" class="text-gray-400 hover:text-green-500 transition-colors">Blog</a></li>
              <li><a href="#help" class="text-gray-400 hover:text-green-500 transition-colors">Help Center</a></li>
              <li><a href="#community" class="text-gray-400 hover:text-green-500 transition-colors">Community</a></li>
              <li><a href="#webinars" class="text-gray-400 hover:text-green-500 transition-colors">Webinars</a></li>
            </ul>
          </div>
        </div>

        <div class="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-500 mb-4 md:mb-0">© 2023 YourApp. All rights reserved.</p>
          <div class="flex space-x-6">
            <a href="/terms" class="text-gray-500 hover:text-green-500 transition-colors">Terms of Service</a>
            <a href="/privacy" class="text-gray-500 hover:text-green-500 transition-colors">Privacy Policy</a>
            <a href="/cookies" class="text-gray-500 hover:text-green-500 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
