import { defineStore } from 'pinia'
import axios from 'axios'
import api from '@/services/api'
import userService from '@/services/userService'
import chatService from '@/services/chatService'

interface User {
  id: string
  email: string
  username?: string
  // Add other user properties as needed
}

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterCredentials extends LoginCredentials {
  username: string
  first_name: string
  last_name: string
  password: string
  password2: string
  email: string
  // Add other registration fields as needed
}

export const useAuthStore = defineStore('auth', {
  // State
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    isLoading: false,
    error: null as string | null,
    API_URL: import.meta.env.VITE_API_URL || '/api'
  }),

  // Getters
  getters: {
    isAuthenticated(state) {
      return !!state.accessToken && !!state.user
    }
  },

  // Actions
  actions: {
    // Initialize state from localStorage if available
    initializeFromStorage() {
      try {
        const savedToken = localStorage.getItem('access')
        const savedUser = localStorage.getItem('user')

        if (savedToken) {
          this.accessToken = savedToken
          // Set auth header for future requests when app initializes
          axios.defaults.headers.common['Authorization'] = `Token ${savedToken}`
        }
        if (savedUser) {
          try {
            this.user = JSON.parse(savedUser)
          } catch (e) {
            console.error('Failed to parse saved user data:', e)
            // Clear invalid data
            localStorage.removeItem('user')
          }
        }
      } catch (e) {
        console.error('Error accessing localStorage:', e)
        // Continue without saved auth - might be in private browsing mode
      }
    },

    async login(credentials: LoginCredentials) {
      if (!credentials?.username || !credentials?.password) {
        throw new Error('Username and password are required')
      }

      this.isLoading = true
      this.error = null

      try {
        let response = await userService.login(credentials)

        // Validate response - Django typically returns token and user data
        if (!response?.data?.access || !response?.data?.refresh) {
          throw new Error('Invalid response from server')
        }

        // Set tokens in state
        this.accessToken = response.data.access
        this.refreshToken = response.data.refresh
        console.log("accessToken " , this.accessToken)
        console.log("refreshToken " , this.refreshToken)

        //slight delay to ensure tokens are set
        setTimeout(async () => {},1000);
          // Fetch user profile data


          // Save to localStorage for persistence
          try {
            localStorage.setItem('refresh', this.refreshToken || '')
            localStorage.setItem('access', this.accessToken || '')
          } catch (e) {
            console.warn('Failed to save auth data to localStorage:', e)
          }

          // Save user to global state
          let userResponse = await userService.getProfile()

          this.user = userResponse.data
          localStorage.setItem('user', JSON.stringify(this.user))
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`

        return this.user
      } catch (e: any) {
        // Handle Django-specific error responses
        let errorMessage = 'Authentication failed. Please try again.'

        if (e.response?.data) {
          // Django REST framework typically returns errors in this format
          if (typeof e.response.data === 'string') {
            errorMessage = e.response.data
          } else if (e.response.data.non_field_errors) {
            errorMessage = e.response.data.non_field_errors.join(', ')
          } else if (e.response.data.detail) {
            errorMessage = e.response.data.detail
          } else if (e.response.data.error) {
            errorMessage = e.response.data.error
          }
        } else if (e instanceof Error) {
          errorMessage = e.message
        }

        this.error = errorMessage
        throw new Error(errorMessage)
      } finally {
        this.isLoading = false
      }
    },

    async register(credentials: RegisterCredentials) {
      if (!credentials?.email || !credentials?.password || !credentials?.username) {
        throw new Error('Name, email and password are required')
      }

      this.isLoading = true
      this.error = null

      try {
        let response;

        // Django registration endpoint
        response = await userService.register({
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
          password2: credentials.password2
        })

        console.log("response " , response)

        // Validate response - update this validation to match your actual response
        if (response.status !== 201) {
          console.log("response.status " , response.status)
          console.log("response", response)
          throw new Error('Invalid response from server')
        }

        // Set state
        this.accessToken = response.data.access
        this.refreshToken = response.data.refresh
        this.user = response.data.user

        // Save to localStorage
        try {
          localStorage.setItem('access', this.accessToken || '')
          localStorage.setItem('refresh', this.refreshToken || '')
          localStorage.setItem('user', JSON.stringify(this.user))
        } catch (e) {
          console.warn('Failed to save auth data to localStorage:', e)
        }

        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`

        return this.user
      } catch (e: any) {
        // Handle Django-specific error responses
        let errorMessage = 'Registration failed. Please try again.'

        if (e.response?.data) {
          // Django REST framework validation errors
          if (typeof e.response.data === 'string') {
            errorMessage = e.response.data
          } else if (e.response.data.email) {
            errorMessage = `Email: ${e.response.data.email.join(', ')}`
          } else if (e.response.data.password) {
            errorMessage = `Password: ${e.response.data.password.join(', ')}`
          } else if (e.response.data.name) {
            errorMessage = `Name: ${e.response.data.name.join(', ')}`
          } else if (e.response.data.non_field_errors) {
            errorMessage = e.response.data.non_field_errors.join(', ')
          }
        } else if (e instanceof Error) {
          errorMessage = e.message
        }

        this.error = errorMessage
        throw new Error(errorMessage)
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      // Clear state
      this.user = null
      this.accessToken = null

      // Clear localStorage
      try {
        localStorage.removeItem('access')
        localStorage.removeItem('user')
      } catch (e) {
        console.warn('Failed to clear localStorage:', e)
      }

      // Clear auth header
      delete axios.defaults.headers.common['Authorization']
    },

    async checkAuth() {
      if (!this.accessToken) return false

      try {
        // Django user verification endpoint
        const response = await axios.get(`${this.API_URL}/me/`, {
          headers: {
            'Authorization': `Token ${this.accessToken}`
          }
        })

        if (response?.data) {
          this.user = response.data
          return true
          } else {
            // If server doesn't recognize token, logout
            this.logout()
          return false
        }
      } catch (e) {
        console.error('Auth check failed:', e)
        // If request fails, assume token is invalid
        this.logout()
        return false
      }
    }
  }
})

// Call initializeFromStorage when the store is created
useAuthStore().initializeFromStorage()