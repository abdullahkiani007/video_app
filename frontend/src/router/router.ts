import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

console.log("routes", routes);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes: [
    ...routes,
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/index.vue'),
      meta: {
        title: 'Home'
      }
    },

    {
      path: '/chat',
      name: 'ChatRoom',
      component: () => import('@/pages/chat-room.vue'),
      meta: {
        requiresAuth: true,
        title: 'Chat Room'
      }
    },

    // auth routes
    {
      path:'/login',
      name: "Login",
      component: () => import('@/pages/auth/login.vue'),
      meta:{
        requireAuth:false,
        title:"Login"
      }
    },
    {
      path:'/register',
      name: "Register",
      component: () => import('@/pages/auth/register.vue'),
      meta:{
        requireAuth:false,
        title:"Register"
      }
    }

  ],

  scrollBehavior: (to, from, savedPosition) => {
    // Return savedPosition if it exists (for back/forward navigation)
    if (savedPosition) {
      return savedPosition
    }

    // Scroll to hash if present
    if (to && to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }

    // Otherwise scroll to top
    return { left: 0, top: 0 }
  },
})

// Add navigation guard
router.beforeEach((to, from, next) => {
  // Set page title if available
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} | VC`
  }

  // Check for authentication - use a more secure approach
  const token = localStorage.getItem('access')
  const isAuthenticated = !!token && token.length > 0

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // Redirect to login with the intended destination
      next({
        path: '/login',
        query: { redirect: encodeURIComponent(to.fullPath) }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

// Global error handler for navigation failures
router.onError((error) => {
  console.error('Navigation error:', error)
  // Could redirect to error page or handle specific errors
})

export default router
