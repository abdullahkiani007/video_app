<template>
  <div class="user-list-container p-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-3 flex items-center text-gray-800 dark:text-gray-200">
        <div class="mr-2 p-1 bg-green-100 dark:bg-green-900 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
          </svg>
        </div>
        Online Users <span class="ml-2 px-2 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">{{ onlineCount }}</span>
      </h3>
      <ul v-if="onlineUsers.length" class="space-y-2">
        <li v-for="user in onlineUsers" :key="user.id" class="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150">
          <span class="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
          <span class="text-gray-700 dark:text-gray-300 font-medium">{{ user.username }}</span>
          <span v-if="isUserTyping(user.id)" class="ml-2 text-gray-500 text-xs italic">
            typing<span class="typing-animation">...</span>
          </span>
        </li>
      </ul>
      <p v-else class="text-gray-500 dark:text-gray-400 italic text-sm">No users currently online</p>
    </div>

    <div class="border-t dark:border-gray-700 pt-4">
      <h3 class="text-lg font-semibold mb-3 flex items-center text-gray-800 dark:text-gray-200">
        <div class="mr-2 p-1 bg-blue-100 dark:bg-blue-900 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </div>
        All Users <span class="ml-2 px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">{{ users.length }}</span>
      </h3>
      <ul v-if="users.length" class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
        <li v-for="user in users" :key="user.id" class="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150">
          <span class="w-3 h-3 rounded-full mr-3"
                :class="user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'"></span>
          <span class="text-gray-700 dark:text-gray-300" :class="{'font-medium': user.isOnline}">{{ user.username }}</span>
        </li>
      </ul>
      <p v-else class="text-gray-500 dark:text-gray-400 italic text-sm">No users available</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  props: {
    users: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      typingUsers: {},
      typingTimeouts: {}
    };
  },
  computed: {
    onlineUsers() {
      return this.users.filter(user => user.isOnline || false);
    },
    onlineCount() {
      return this.onlineUsers.length || 0;
    }
  },
  methods: {
    isUserTyping(userId) {
      // Safely check if user is typing
      return userId && this.typingUsers[userId] === true;
    },
    userStartedTyping(userId) {
      if (!userId) return;

      // Clear any existing timeout for this user
      if (this.typingTimeouts[userId]) {
        clearTimeout(this.typingTimeouts[userId]);
      }

      // Set typing status
      this.$set(this.typingUsers, userId, true);

      // Set timeout to clear typing status after 3 seconds
      this.typingTimeouts[userId] = setTimeout(() => {
        this.$set(this.typingUsers, userId, false);
      }, 3000);
    },
    userStoppedTyping(userId) {
      if (!userId) return;

      // Clear any existing timeout
      if (this.typingTimeouts[userId]) {
        clearTimeout(this.typingTimeouts[userId]);
      }

      // Clear typing status
      this.$set(this.typingUsers, userId, false);
    }
  },
  beforeDestroy() {
    // Clean up all timeouts when component is destroyed
    Object.values(this.typingTimeouts).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
  }
}
</script>

<style scoped>
.user-list-container {
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-list-container:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}

@media (prefers-color-scheme: dark) {
  .custom-scrollbar {
    scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.5);
  }
}

.typing-animation {
  display: inline-block;
  animation: typingDots 1.4s infinite;
}

@keyframes typingDots {
  0%, 20% { opacity: 0; }
  40% { opacity: 1; }
  60% { opacity: 1; }
  80%, 100% { opacity: 0; }
}
</style>