<template>
  <div
    class="fixed top-0 left-0 h-full bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-40 shadow-lg flex flex-col"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    :style="isOpen ? { width: `${width}px` } : {}"
  >
    <!-- Sidebar header with user profile -->
    <div class="p-4 border-b border-gray-700 flex items-center justify-between">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold mr-3">
          {{ username ? username.charAt(0).toUpperCase() : 'U' }}
        </div>
        <div>
          <h3 class="font-bold">{{ username }}</h3>
          <p class="text-sm text-gray-400">Online</p>
        </div>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-white focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Logout button -->
    <div class="px-4 py-2 border-b border-gray-700">
      <button
        @click="handleLogout"
        class="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="font-medium">Sign Out</span>
      </button>
    </div>

    <!-- Sidebar tabs -->
    <div class="flex border-b border-gray-700">
      <button
        @click="activeTab = 'users'"
        class="flex-1 py-3 text-center font-medium transition-colors"
        :class="activeTab === 'users' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'"
      >
        Users
      </button>
      <button
        @click="activeTab = 'chat'"
        class="flex-1 py-3 text-center font-medium transition-colors"
        :class="activeTab === 'chat' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'"
      >
        Chat
      </button>
    </div>

    <!-- Tab content -->
    <div class="flex-1 overflow-hidden relative">
      <!-- Users tab -->
      <div v-if="activeTab === 'users'" class="h-full overflow-y-auto p-4">
        <h2 class="text-xl font-bold mb-4">Online Users</h2>
        <UserList :users="users" :initial-width="width - 32" />
      </div>

      <!-- Chat tab -->
      <div v-if="activeTab === 'chat'" class="h-full flex flex-col">
        <ChatArea
          :messages="messages"
          :current-user="username"
          :typing-users="typingUsers"
          @send-message="$emit('send-message', $event)"
          @typing="$emit('typing', $event)"
          class="flex-1 overflow-y-auto"
        />
      </div>

      <!-- Resize handle -->
      <div
        class="absolute top-0 right-0 w-4 h-full cursor-ew-resize"
        @mousedown="$emit('start-resize', $event)"
      >
        <div class="w-1 h-full bg-gray-600 hover:bg-blue-500 mx-auto"></div>
      </div>
    </div>
  </div>
</template>

<script>
import UserList from '@/components/chat/UserList.vue';
import ChatArea from '@/components/chat/ChatArea.vue';

export default {
  name: 'Sidebar',
  components: {
    UserList,
    ChatArea
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 320
    },
    username: {
      type: String,
      required: true
    },
    users: {
      type: Array,
      default: () => []
    },
    messages: {
      type: Array,
      default: () => []
    },
    typingUsers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeTab: 'users'
    }
  },
  methods: {
    handleLogout() {
      // Confirm before logging out to prevent accidental clicks
      if (confirm('Are you sure you want to logout?')) {
        // Emit logout event to parent component
        this.$emit('logout');
      }
    }
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>