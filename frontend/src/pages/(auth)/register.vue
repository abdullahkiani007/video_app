<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Create an Account</h1>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            v-model="form.first_name"
            required
            :disabled="isLoading"
            placeholder="Enter your first name"
          />
        </div>

        <div class="form-group">
          <label for="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            v-model="form.last_name"
            required
            :disabled="isLoading"
            placeholder="Enter your last name"
          />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            required
            :disabled="isLoading"
            placeholder="Choose a username"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            :disabled="isLoading"
            placeholder="Enter your email address"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            :disabled="isLoading"
            placeholder="Create a password"
            minlength="8"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            required
            :disabled="isLoading"
            placeholder="Confirm your password"
            minlength="8"
          />
        </div>

        <button
          type="submit"
          class="register-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading">Registering...</span>
          <span v-else>Register</span>
        </button>

        <div class="login-link">
          Already have an account? <router-link to="/login">Log in</router-link>
        </div>
      </form>
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
          this.$router.push('/chat');
        } else {
          // If registration succeeded but we're not authenticated yet,
          // we might need to log in explicitly
          this.error = 'Registration successful. Please log in.';
          this.$router.push('/login');
        }
      } catch (err) {
        console.log(err)
        // Display error from auth store or set a generic error
        this.error = this.authStore.error || 'Registration failed. Please try again.';
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.register-container {
  width: 100%;
  max-width: 450px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 24px;
  text-align: center;
  color: #333;
}

.error-message {
  padding: 10px;
  margin-bottom: 20px;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #4a90e2;
  outline: none;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.register-button:hover:not(:disabled) {
  background-color: #3a7bc8;
}

.register-button:disabled {
  background-color: #a0c3e8;
  cursor: not-allowed;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #4a90e2;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
