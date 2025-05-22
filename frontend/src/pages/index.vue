<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LandingPage',

  data() {
    return {
      isMenuOpen: false,
      logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
      logoAlt: 'VC Logo',
      heroImageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      heroImageAlt: 'Futuristic digital interface',
      testimonialImageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      testimonialImageAlt: 'Jane Doe',
      logoFallbackText: 'VC',
      heroFallbackText: 'Futuristic Interface',
      logoLoaded: true,
      heroLoaded: true,
      testimonialImageLoaded: true,
      features: [
        {
          id: 1,
          title: 'Easy to Use',
          description: 'Our intuitive interface makes it simple to get started right away.',
          icon: 'mdi-check-circle-outline',
          illustration: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
          illustrationFailed: false
        },
        {
          id: 2,
          title: 'Secure',
          description: 'Your data is protected with enterprise-grade security measures.',
          icon: 'mdi-shield-check-outline',
          illustration: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
          illustrationFailed: false
        },
        {
          id: 3,
          title: 'Fast & Reliable',
          description: 'Experience lightning-fast performance with 99.9% uptime.',
          icon: 'mdi-rocket-launch-outline',
          illustration: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
          illustrationFailed: false
        },
        {
          id: 4,
          title: 'Smart Analytics',
          description: 'Gain valuable insights with our powerful analytics tools.',
          icon: 'mdi-chart-line',
          illustration: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg',
          illustrationFailed: false
        },
        {
          id: 5,
          title: 'Team Collaboration',
          description: 'Work together seamlessly with real-time collaboration features.',
          icon: 'mdi-account-group-outline',
          illustration: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg',
          illustrationFailed: false
        },
        {
          id: 6,
          title: 'Mobile Friendly',
          description: 'Access your work from anywhere on any device.',
          icon: 'mdi-cellphone-link',
          illustration: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg',
          illustrationFailed: false
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
      currentTestimonialIndex: 0,
      animationObserver: null,
      animatedElements: []
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
    },

    handleIllustrationError(event, featureId) {
      // Defensive check for valid event and featureId
      if (!event || !event.target || typeof featureId !== 'number') {
        console.error('Invalid parameters in handleIllustrationError');
        return;
      }

      try {
        // Hide the broken image
        event.target.style.display = 'none';

        // Find the feature and mark it
        const feature = this.features.find(f => f.id === featureId);
        if (feature) {
          feature.illustrationFailed = true;
        }

        // Show the icon instead
        const iconElement = event.target.parentElement.querySelector('.feature-icon');
        if (iconElement) {
          iconElement.style.display = 'block';
        }
      } catch (error) {
        console.error('Error handling illustration error:', error);
      }
    },

    initAnimations() {
      // Defensive check for browser support
      if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported in this browser');
        return;
      }

      try {
        // Create an observer for scroll-based animations
        this.animationObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
              // Optionally unobserve after animation is triggered
              this.animationObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });

        // Select elements to animate
        this.animatedElements = document.querySelectorAll('.animate-on-scroll');

        // Observe each element
        if (this.animatedElements.length) {
          this.animatedElements.forEach(el => {
            this.animationObserver.observe(el);
          });
        }
      } catch (error) {
        console.error('Error initializing animations:', error);
      }
    }
  },

  mounted() {
    // Initialize animations after component is mounted
    this.$nextTick(() => {
      this.initAnimations();
    });
  },

  beforeUnmount() {
    // Clean up observer when component is destroyed
    if (this.animationObserver) {
      this.animationObserver.disconnect();
    }
  },

  beforeRouteEnter(to, from, next) {
    // We'll allow access to the landing page regardless of auth status
    next()
  },
})
</script>

<template>
  <div class="landing-page bg-gray-950 text-white relative overflow-hidden">
    <!-- <section class="py-16 md:py-24 relative overflow-hidden"> -->
      <!-- Remove the circuit pattern from here since it's now applied globally -->

      <!-- Futuristic background elements applied to entire page -->
      <div class="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div class="circuit-pattern"></div>
    </div>
    <div class="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>

    <!-- Hero Section -->
    <section class="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
      <div class="absolute inset-0  z-0"></div>
      <!-- Futuristic grid background -->
      <div class="absolute inset-0 z-0 opacity-10">
        <div class="grid-bg"></div>
      </div>
      <!-- Glowing orbs -->
      <div class="absolute top-20 left-20 w-64 h-64 rounded-full bg-blue-500 opacity-10 blur-[100px]"></div>
      <div class="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-purple-500 opacity-10 blur-[100px]"></div>

      <div class="container mx-auto px-4 relative z-10">
        <div class="flex flex-col md:flex-row items-center gap-12">
          <div class="w-full md:w-1/2 text-center md:text-left animate-on-scroll opacity-0 transition-all duration-1000 -translate-x-10">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              The Future of Work is Here
            </h1>
            <p class="text-lg md:text-xl text-gray-300 mb-8">
              Experience next-generation workflow optimization with AI-powered collaboration and quantum-speed processing.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                class="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 transform relative overflow-hidden group"
                @click="navigateTo('/register')"
                aria-label="Get started with a free account"
              >
                <span class="relative z-10">Get Started — It's Free</span>
                <span class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>
          <div class="w-full md:w-1/2 animate-on-scroll opacity-0 transition-all duration-1000 translate-x-10">
            <div class="relative rounded-xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-gray-800 backdrop-blur-sm">
              <img
                v-if="heroLoaded"
                :src="heroImageUrl"
                :alt="heroImageAlt"
                class="w-full h-auto transform hover:scale-105 transition-transform duration-700"
                @error="(e) => handleImageError(e, 'hero')"
              />
              <div v-else class="bg-gray-900 w-full h-64 flex flex-col items-center justify-center">
                <div class="text-4xl text-gray-600 mb-2">
                  <i class="mdi mdi-image-outline"></i>
                </div>
                <p class="text-gray-500">{{ heroFallbackText }}</p>
              </div>
              <!-- Holographic overlay effect -->
              <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section - Enhanced with illustrations -->
    <section id="features" class="py-16 md:py-24 relative">
      <!-- Futuristic accent elements -->
      <div class="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
      <div class="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-cyan-500"></div>

      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-white animate-on-scroll opacity-0 transition-all duration-700">Cutting-Edge Features</h2>
        <p class="text-xl text-gray-400 text-center max-w-3xl mx-auto mb-16 animate-on-scroll opacity-0 transition-all duration-700 delay-300">
          Advanced technology designed for tomorrow's challenges
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(feature, index) in features"
            :key="feature.id"
            class="p-6 rounded-xl bg-gray-950 border border-gray-800 hover:border-cyan-500 transition-all duration-300 animate-on-scroll opacity-0 transition-all duration-700 scale-95 relative group"
            :style="`transition-delay: ${index * 100}ms`"
          >
            <!-- Glowing effect on hover -->
            <div class="absolute inset-0 rounded-xl bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Feature Illustration -->
            <div class="flex justify-center mb-6 h-24 relative">
              <img
                v-if="feature.illustration"
                :src="feature.illustration"
                :alt="feature.title"
                class="h-20 w-20 object-contain transition-all duration-300 hover:scale-110 hover:rotate-3"
                @error="(e) => handleIllustrationError(e, feature.id)"
              />
              <div
                class="text-cyan-500 text-4xl feature-icon"
                :class="{'hidden': feature.illustration && !feature.illustrationFailed}"
              >
                <i :class="feature.icon"></i>
              </div>
            </div>
            <h3 class="text-xl font-bold mb-2 text-cyan-500 text-center">{{ feature.title }}</h3>
            <p class="text-gray-400 text-center">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="py-16 md:py-24  relative">
      <!-- Futuristic accent elements -->
      <div class="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
      <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-purple-500"></div>

      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-white animate-on-scroll opacity-0 transition-all duration-700">User Experiences</h2>
        <p class="text-xl text-gray-400 text-center max-w-3xl mx-auto mb-16 animate-on-scroll opacity-0 transition-all duration-700 delay-300">
          Join our global network of innovators
        </p>

        <div class="relative max-w-4xl mx-auto animate-on-scroll opacity-0 transition-all duration-1000 scale-95">
          <button
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 text-cyan-500 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
            @click="changeTestimonial('prev')"
            aria-label="Previous testimonial"
          >
            <i class="mdi mdi-chevron-left text-2xl"></i>
          </button>

          <div class="bg-gray-900 rounded-2xl p-8 md:p-10 border border-gray-800 shadow-xl backdrop-blur-sm relative">
            <!-- Glowing accent -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-t-2xl"></div>

            <p class="text-xl md:text-2xl text-gray-300 italic mb-8 relative">
              <span class="absolute -top-6 -left-2 text-6xl text-cyan-500/20">"</span>
              {{ testimonials[currentTestimonialIndex].text }}
              <span class="absolute -bottom-10 -right-2 text-6xl text-purple-500/20">"</span>
            </p>
            <div class="flex items-center">
              <div class="relative">
                <img
                  :src="testimonials[currentTestimonialIndex].avatar"
                  :alt="testimonials[currentTestimonialIndex].name"
                  class="w-14 h-14 rounded-full object-cover mr-4"
                  @error="(e) => handleImageError(e, 'testimonial')"
                />
                <!-- Glowing border effect -->
                <div class="absolute inset-0 rounded-full border-2 border-cyan-500 animate-pulse-slow"></div>
              </div>
              <div>
                <h4 class="font-bold text-white">{{ testimonials[currentTestimonialIndex].name }}</h4>
                <p class="text-gray-400">{{ testimonials[currentTestimonialIndex].position }}</p>
              </div>
            </div>
          </div>

          <button
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 text-cyan-500 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
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
            :class="index === currentTestimonialIndex ? 'bg-gradient-to-r from-cyan-500 to-purple-500 scale-125' : 'bg-gray-700 hover:bg-gray-600'"
            @click="currentTestimonialIndex = index"
            :aria-label="`Go to testimonial ${index + 1}`"
          ></button>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 md:py-24relative">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div class="p-6 rounded-xl bg-gray-950 border border-gray-800 hover:border-cyan-500 transition-all duration-300 animate-on-scroll opacity-0 transition-all duration-700 scale-95 relative group">
            <!-- Glowing effect on hover -->
            <div class="absolute inset-0 rounded-xl bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <h3 class="text-3xl md:text-4xl font-bold text-cyan-500 mb-2">10,000+</h3>
            <p class="text-gray-400">Active Users</p>
          </div>
          <div class="p-6 rounded-xl bg-gray-950 border border-gray-800 hover:border-purple-500 transition-all duration-300 animate-on-scroll opacity-0 transition-all duration-700 scale-95 delay-100 relative group">
            <!-- Glowing effect on hover -->
            <div class="absolute inset-0 rounded-xl bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <h3 class="text-3xl md:text-4xl font-bold text-purple-500 mb-2">99.9%</h3>
            <p class="text-gray-400">Uptime</p>
          </div>
          <div class="p-6 rounded-xl bg-gray-950 border border-gray-800 hover:border-cyan-500 transition-all duration-300 animate-on-scroll opacity-0 transition-all duration-700 scale-95 delay-200 relative group">
            <!-- Glowing effect on hover -->
            <div class="absolute inset-0 rounded-xl bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <h3 class="text-3xl md:text-4xl font-bold text-cyan-500 mb-2">50+</h3>
            <p class="text-gray-400">Integrations</p>
          </div>
          <div class="p-6 rounded-xl bg-gray-950 border border-gray-800 hover:border-purple-500 transition-all duration-300 animate-on-scroll opacity-0 transition-all duration-700 scale-95 delay-300 relative group">
            <!-- Glowing effect on hover -->
            <div class="absolute inset-0 rounded-xl bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <h3 class="text-3xl md:text-4xl font-bold text-purple-500 mb-2">24/7</h3>
            <p class="text-gray-400">Support</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-24 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden">
      <!-- Remove the circuit pattern from here since it's now applied globally -->
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>

      <div class="container mx-auto px-4 text-center relative z-10">
        <h2 class="text-3xl md:text-4xl font-bold mb-4 text-white animate-on-scroll opacity-0 transition-all duration-700">Ready to Experience the Future?</h2>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-on-scroll opacity-0 transition-all duration-700 delay-300">Join our network of innovators and shape tomorrow's digital landscape.</p>
        <button
          class="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-medium text-lg hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 animate-on-scroll opacity-0 transition-all duration-700 delay-500 relative group overflow-hidden"
          @click="navigateTo('/register')"
          aria-label="Create your free account"
        >
          <span class="relative z-10">Create Free Account</span>
          <span class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <!-- Glowing effect -->
          <span class="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-30 blur-xl group-hover:opacity-40 transition-opacity duration-300 -z-10"></span>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="pt-16 pb-8 bg-gray-950 border-t border-gray-800">
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
              <h3 class="text-xl font-bold text-white">VC</h3>
            </div>
            <p class="text-gray-400 mb-6">Making work better since 2023.</p>

          </div>

        </div>

        <div class="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-500 mb-4 md:mb-0">© 2023 VC. All rights reserved.</p>
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

<style scoped>
/* Animation styles */
.animate-on-scroll {
  transform: translateY(20px);
}

.animate-in {
  opacity: 1 !important;
  transform: translate(0, 0) scale(1) !important;
}

/* Pulse animation for CTA button */
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

/* Slower pulse for avatar borders */
@keyframes pulse-slow {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite;
}

/* Floating animation for feature icons */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.feature-icon {
  animation: float 3s ease-in-out infinite;
}

/* Futuristic grid background */
.grid-bg {
  background-image:
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  width: 100%;
  height: 100%;
}

/* Circuit pattern for page background */
.circuit-pattern {
  background-image: radial-gradient(rgba(139, 92, 246, 0.2) 2px, transparent 2px),
                    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 30px 30px, 50px 50px, 50px 50px;
  width: 100%;
  height: 100%;
}
</style>
