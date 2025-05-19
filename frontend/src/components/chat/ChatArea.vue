<template>
    <div class="flex flex-col h-full">
      <!-- Messages area -->
      <div class="flex-1 overflow-y-auto p-4" ref="messagesContainer">
        <div v-if="messages.length === 0" class="text-gray-500 italic text-center mt-4">
          No messages yet
        </div>
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="mb-2"
        >
          <div class="flex items-start">
            <div class="font-bold mr-2">{{ message.sender_username || 'User' }}:</div>
            <div>{{ message.content || '' }}</div>
          </div>
          <div class="text-xs text-gray-500">
            {{ formatTime(message.created_at) }}
          </div>
        </div>
      </div>

      <!-- Message input -->
      <div class="border-t p-2">
        <form @submit.prevent="sendMessage" class="flex">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type a message..."
            class="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      }
    },
    data() {
      return {
        newMessage: ''
      }
    },
    watch: {
      messages() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    mounted() {
      this.scrollToBottom();
    },
    methods: {
      sendMessage() {
        if (!this.newMessage.trim()) return;

        this.$emit('send-message', this.newMessage);
        this.newMessage = '';
      },
      scrollToBottom() {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
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