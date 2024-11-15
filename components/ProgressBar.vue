<template>
  <div v-if="hasProgress">
    <!-- Check if it's an array, render two progress bars -->
    <div v-if="isArray" class="progress-container">
      <div class="progress-bar preparation">
        <div class="filled-bar" :style="{ width: (progressNumber[0] || 0) + '%' }"></div>
      </div>

      <div class="progress-bar delivery">
        <div class="filled-bar" :style="{ width: (progressNumber[1] || 0) + '%' }"></div>
      </div>
    </div>

    <!-- If it's a single value, render one progress bar -->
    <div v-else class="progress-bar single">
      <div class="filled-bar" :style="{ width: progressNumber + '%' }"></div>
    </div>
  </div>

  <div v-else>
    <span>No progress data available</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { toRefs } from 'vue';

// Props
defineProps({
  progressNumber: {
    type: [Array, Number], // Accept either an array or a number
    default: () => [],
  },
});

// Computed properties
const isArray = computed(() => {
  if (Array.isArray(progressNumber) && progressNumber.length === 1) {
    return false;
  }
  return Array.isArray(progressNumber);
});

const hasProgress = computed(() => {
  return (
    (isArray.value && progressNumber.length > 0) ||
    (!isArray.value && progressNumber >= 0)
  );
});
</script>

<style scoped>
.progress-container {
  display: flex;
  gap: 20px; /* Space between the bars */
}

.progress-bar {
  width: 100%;
  background-color: #e0e0e0;
  height: 20px;
  border-radius: 5px;
  border: 1px solid #b0b0b0; /* Outline */
  overflow: hidden;
  position: relative;
}

.filled-bar {
  height: 100%;
  border-radius: 5px;
}

/* Preparation phase color */
.preparation .filled-bar {
  background-color: #00a3e0;
}

/* Delivery phase color */
.delivery .filled-bar {
  background-color: #512d6d;
}

/* Single progress bar color */
.single .filled-bar {
  background-color: #76c7c0;
}
</style>
