<template>
  <div class="flex justify-center space-x-4">
    <button
      v-if="!isInCall"
      @click="$emit('join-call')"
      class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
      Join Call
    </button>

    <button
      v-else
      @click="$emit('leave-call')"
      class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
      Leave Call
    </button>
  </div>
</template>

<script>
export default {
  name: 'CallControls',
  props: {
    isInCall: {
      type: Boolean,
      required: true,
      default: false
    }
  }
}
</script>