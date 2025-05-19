<template>
  <div>
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Online Users ({{ onlineCount }})</h3>
      <ul class="space-y-2">
        <li v-for="user in onlineUsers" :key="user.id" class="flex items-center">
          <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          <span>{{ user.username }}</span>
        </li>
      </ul>
    </div>

    <div>
      <h3 class="text-lg font-semibold mb-2">All Users ({{ users.length }})</h3>
      <ul class="space-y-2">
        <li v-for="user in users" :key="user.id" class="flex items-center">
          <span class="w-2 h-2 rounded-full mr-2"
                :class="user.isOnline ? 'bg-green-500' : 'bg-gray-300'"></span>
          <span>{{ user.username }}</span>
        </li>
      </ul>
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
  computed: {
    onlineUsers() {
      return this.users.filter(user => user.isOnline);
    },
    onlineCount() {
      return this.onlineUsers.length;
    }
  }
}
</script>