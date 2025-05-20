<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Chat header -->
    <div class="px-4 py-3 bg-gray-50 border-b flex items-center">
      <h3 class="font-medium text-gray-800">Chat</h3>
      <div class="ml-auto text-xs text-gray-500">
        {{ messages.length }} messages
      </div>
    </div>

    <!-- Messages area with explicit height constraints -->
    <div
      class="flex-grow overflow-y-auto p-3 bg-white"
      ref="messagesContainer"
      style="height: calc(100% - 60px);"
    >
      <div v-if="!messages || messages.length === 0" class="flex items-center justify-center h-full">
        <div class="text-gray-500 italic text-center">
          No messages yet. Start the conversation!
        </div>
      </div>

      <div
        v-for="(message, index) in messages"
        :key="index"
        class="mb-4 max-w-[85%]"
        :class="[
          message.sender_username === currentUser ? 'ml-auto' : 'mr-auto'
        ]"
      >
        <div class="flex flex-col">
          <div class="text-xs text-gray-500 mb-1"
               :class="[message.sender_username === currentUser ? 'text-right' : 'text-left']">
            {{ message.sender_username || 'User' }}
          </div>
          <div
            class="p-3 rounded-lg"
            :class="[
              message.sender_username === currentUser ?
              'bg-blue-500 text-white rounded-tr-none' :
              'bg-gray-100 text-gray-800 rounded-tl-none'
            ]"
          >
            <div class="text-sm break-words">{{ message.content || '' }}</div>
          </div>
          <div class="text-xs text-gray-500 mt-1"
               :class="[message.sender_username === currentUser ? 'text-right' : 'text-left']">
            {{ formatTime(message.created_at) }}
          </div>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="typingUsers && typingUsers.length > 0" class="text-xs text-gray-500 italic mt-2 ml-2">
        <span v-if="typingUsers.length === 1">
          {{ typingUsers[0] }} is typing...
        </span>
        <span v-else-if="typingUsers.length === 2">
          {{ typingUsers[0] }} and {{ typingUsers[1] }} are typing...
        </span>
        <span v-else>
          {{ typingUsers.slice(0, 2).join(', ') }} and {{ typingUsers.length - 2 }} more are typing...
        </span>
      </div>
    </div>

    <!-- Message input with fixed height -->
    <div class="border-t p-2 bg-white" style="height: 60px;">
      <form @submit.prevent="sendMessage" class="flex h-full">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 border rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxlength="1000"
        />
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          :disabled="!newMessage.trim()"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatArea',
  props: {
    messages: {
      type: Array,
      required: true,
      default: () => []
    },
    currentUser: {
      type: String,
      default: ''
    },
    // Add new props for typing indicators
    typingUsers: {
      type: Array,
      default: () => []
    },
    // Support both currentUser and currentUserId for flexibility
    currentUserId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      newMessage: '',
      typingTimeout: null
    }
  },
  computed: {
    // Use either currentUser or currentUserId based on what's provided
    effectiveCurrentUser() {
      return this.currentUser || this.currentUserId || '';
    }
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    },
    newMessage(val) {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      if (val.trim().length > 0) {
        this.$emit('typing', true);

        this.typingTimeout = setTimeout(() => {
          this.$emit('typing', false);
        }, 2000);
      } else {
        this.$emit('typing', false);
      }
    }
  },
  mounted() {
    this.scrollToBottom();
    // Add resize event listener to handle layout changes
    window.addEventListener('resize', this.scrollToBottom);

    // Force scroll to bottom on initial render
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  },
  beforeUnmount() {
    // Clean up event listener
    window.removeEventListener('resize', this.scrollToBottom);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.$emit('typing', false);
    }
  },
  methods: {
    sendMessage() {
      if (!this.newMessage.trim()) return;

      try {
        this.$emit('send-message', this.newMessage.trim());
        this.newMessage = '';
        // Scroll to bottom after sending
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    scrollToBottom() {
      try {
        const container = this.$refs.messagesContainer;
        if (container) {
          // Force scroll to bottom
          container.scrollTop = container.scrollHeight + 1000;

          // Double-check with a slight delay to ensure it worked
          setTimeout(() => {
            container.scrollTop = container.scrollHeight + 1000;
          }, 50);
        }
      } catch (error) {
        console.error('Error scrolling to bottom:', error);
      }
    },
    formatTime(timestamp) {
      try {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '';
      }
    }
  }
}
</script>

<style scoped>
/* Ensure scrolling works properly */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

/* Custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>