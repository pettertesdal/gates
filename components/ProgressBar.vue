<template>
  <div v-if="hasProgress">
    <!-- Dynamically render progress bars for array values -->
    <div v-if="isArray" class="progress-container">
      <div 
        v-for="(progress, index) in progressNumber" 
        :key="index" 
        class="progress-bar"
        :class="getBarClass(index)"
      >
        <div class="filled-bar" :style="{ width: (progress || 0) + '%' }"></div>
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

// Props
const props = defineProps({
  progressNumber: {
    type: [Array, Number], // Accept either an array or a number
    default: () => [],
  },
});

// Computed properties
const isArray = computed(() => {
  return Array.isArray(props.progressNumber);
});

const hasProgress = computed(() => {
  return (
    (isArray.value && props.progressNumber.length > 0) ||
    (!isArray.value && props.progressNumber >= 0)
  );
});

// Dynamically assign bar classes based on index
const getBarClass = (index) => {
  const classes = ['preparation', 'delivery', 'extra-stage'];
  return classes[index] || 'extra-stage'; // Use `extra-stage` for bars beyond predefined classes
};
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

/* Extra stages color */
.extra-stage .filled-bar {
  background-color: #ffa500; /* Orange for extra stages */
}

/* Single progress bar color */
.single .filled-bar {
  background-color: #76c7c0;
}
</style>
