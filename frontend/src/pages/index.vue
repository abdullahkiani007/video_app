<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LandingPage',

  data() {
    return {
      isMenuOpen: false,
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
        }
      ]
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
    }
  },

  beforeRouteEnter(to, from, next) {
    // We'll allow access to the landing page regardless of auth status
    next()
  },
})
</script>

<template>
  <div class="landing-page">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <img src="/logo.svg" alt="Logo" class="logo" />
          <h1 class="company-name">YourApp</h1>

          <!-- Mobile menu button -->
          <button
            class="menu-toggle"
            @click="toggleMenu"
            aria-label="Toggle navigation menu"
          >
            <span class="icon" :class="{ 'open': isMenuOpen }">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
          <div class="navbar-end">
            <a href="#features" class="navbar-item">Features</a>
            <a href="#about" class="navbar-item">About</a>
            <a href="#contact" class="navbar-item">Contact</a>
            <div class="navbar-buttons">
              <button
                class="btn btn-outline"
                @click="navigateTo('/login')"
                aria-label="Log in to your account"
              >
                Log In
              </button>
              <button
                class="btn btn-primary"
                @click="navigateTo('/register')"
                aria-label="Create a new account"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Welcome to a Better Way to Work</h1>
          <p class="hero-subtitle">
            Streamline your workflow, collaborate seamlessly, and achieve more with our powerful platform.
          </p>
          <div class="hero-buttons">
            <button
              class="btn btn-primary btn-lg"
              @click="navigateTo('/register')"
              aria-label="Get started with a free account"
            >
              Get Started — It's Free
            </button>
            <button
              class="btn btn-outline btn-lg"
              @click="navigateTo('/demo')"
              aria-label="Watch a product demonstration"
            >
              Watch Demo
            </button>
          </div>
        </div>
        <div class="hero-image">
          <img src="/hero-image.svg" alt="Platform demonstration" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Why Choose Us</h2>
        <div class="features-grid">
          <div
            v-for="feature in features"
            :key="feature.id"
            class="feature-card"
          >
            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials">
      <div class="container">
        <h2 class="section-title">What Our Users Say</h2>
        <div class="testimonial-card">
          <p class="testimonial-text">
            "This platform has completely transformed how our team works. We've increased productivity by 35% since implementing it."
          </p>
          <div class="testimonial-author">
            <img src="/testimonial-1.jpg" alt="Jane Doe" class="testimonial-avatar" />
            <div class="testimonial-info">
              <h4 class="testimonial-name">Jane Doe</h4>
              <p class="testimonial-position">Product Manager, Acme Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2 class="cta-title">Ready to Get Started?</h2>
        <p class="cta-text">Join thousands of satisfied users today.</p>
        <button
          class="btn btn-primary btn-lg"
          @click="navigateTo('/register')"
          aria-label="Create your free account"
        >
          Create Free Account
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <img src="/logo.svg" alt="Logo" class="logo" />
            <h3 class="company-name">YourApp</h3>
            <p class="company-description">
              Making work better since 2023.
            </p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h4 class="footer-heading">Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#integrations">Integrations</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4 class="footer-heading">Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4 class="footer-heading">Resources</h4>
              <ul>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#community">Community</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="copyright">© 2023 YourApp. All rights reserved.</p>
          <div class="footer-legal">
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Base Styles */
:root {
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --secondary-color: #f9fafb;
  --text-color: #1f2937;
  --text-light: #6b7280;
  --border-color: #e5e7eb;
  --white: #ffffff;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --radius: 8px;
  --transition: all 0.3s ease;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-color);
}

p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-light);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  outline: none;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--white);
}

.btn-primary:hover, .btn-primary:focus {
  background-color: var(--primary-hover);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.btn-outline:hover, .btn-outline:focus {
  background-color: var(--secondary-color);
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Navbar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--white);
  box-shadow: var(--shadow);
  padding: 1rem 0;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  height: 2rem;
  width: auto;
}

.company-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.navbar-menu {
  display: flex;
  align-items: center;
}

.navbar-end {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar-item {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.navbar-item:hover {
  color: var(--primary-color);
}

.navbar-buttons {
  display: flex;
  gap: 0.75rem;
  margin-left: 1rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
}

/* Hero Section */
.hero {
  padding: 5rem 0;
  background-color: var(--secondary-color);
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

/* Features Section */
.features {
  padding: 5rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.25rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1.25rem;
}

.feature-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* Testimonials Section */
.testimonials {
  padding: 5rem 0;
  background-color: var(--secondary-color);
}

.testimonial-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 2.5rem;
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.testimonial-text {
  font-size: 1.25rem;
  font-style: italic;
  margin-bottom: 2rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.testimonial-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-name {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

/* CTA Section */
.cta {
  padding: 5rem 0;
  text-align: center;
  background-color: var(--primary-color);
}

.cta-title {
  font-size: 2.5rem;
  color: var(--white);
  margin-bottom: 1rem;
}

.cta-text {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.cta .btn-primary {
  background-color: var(--white);
  color: var(--primary-color);
}

.cta .btn-primary:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Footer */
.footer {
  padding: 5rem 0 2rem;
  background-color: var(--text-color);
  color: var(--white);
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-brand .logo {
  margin-bottom: 1rem;
}

.company-name {
  color: var(--white);
  margin-bottom: 0.75rem;
}

.company-description {
  color: rgba(255, 255, 255, 0.7);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer-heading {
  color: var(--white);
  margin-bottom: 1.25rem;
  font-size: 1.125rem;
}

.footer-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-column li {
  margin-bottom: 0.75rem;
}

.footer-column a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: var(--transition);
}

.footer-column a:hover {
  color: var(--white);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.copyright {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.footer-legal {
  display: flex;
  gap: 1.5rem;
}

.footer-legal a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.875rem;
  transition: var(--transition);
}

.footer-legal a:hover {
  color: var(--white);
}

/* Responsive Styles */
@media (max-width: 992px) {
  .hero .container {
    grid-template-columns: 1fr;
  }

  .hero-image {
    order: -1;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
    margin-left: auto;
  }

  .navbar-menu {
    position: fixed;
    top: 4rem;
    left: 0;
    right: 0;
    background-color: var(--white);
    padding: 1.5rem;
    box-shadow: var(--shadow);
    flex-direction: column;
    align-items: flex-start;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: var(--transition);
  }

  .navbar-menu.is-active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .navbar-end {
    flex-direction: column;
    width: 100%;
  }

  .navbar-buttons {
    margin-top: 1rem;
    margin-left: 0;
    width: 100%;
  }

  .navbar-buttons .btn {
    flex: 1;
  }

  .hero-title {
    font-size: 2.25rem;
  }

  .section-title {
    font-size: 1.875rem;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

/* Menu Toggle Icon Animation */
.icon {
  position: relative;
  width: 24px;
  height: 20px;
}

.icon span {
  position: absolute;
  height: 2px;
  width: 100%;
  background-color: var(--text-color);
  border-radius: 2px;
  left: 0;
  transition: var(--transition);
}

.icon span:nth-child(1) {
  top: 0;
}

.icon span:nth-child(2) {
  top: 9px;
}

.icon span:nth-child(3) {
  top: 18px;
}

.icon.open span:nth-child(1) {
  transform: rotate(45deg);
  top: 9px;
}

.icon.open span:nth-child(2) {
  opacity: 0;
}

.icon.open span:nth-child(3) {
  transform: rotate(-45deg);
  top: 9px;
}
</style>
