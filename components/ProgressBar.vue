<template>
  <div v-if="hasProgress">
    <div v-if="isArray" class="progress-container">
      <div
        v-for="(progress, index) in progressNumber"
        :key="index"
        class="progress-bar"
        :class="getBarClass(index)"
      >
        <!-- Shadow Label (Fades under filled bar) -->
        <span class="shadow-label">
          {{ getStageName(index) }}
        </span>

        <!-- Filled Bar -->
        <div class="filled-bar" :style="{ width: (progress || 0) + '%' }">
          <span class="filled-label">
            {{ getStageName(index) }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="progress-bar single">
      <span class="shadow-label">
        {{ getStageName(0) }}
      </span>
      <div class="filled-bar" :style="{ width: progressNumber + '%' }">
        <span class="filled-label">
          {{ getStageName(0) }}
        </span>
      </div>
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
const isArray = computed(() => Array.isArray(props.progressNumber));

const hasProgress = computed(() => (
  (isArray.value && props.progressNumber.length > 0) ||
  (!isArray.value && props.progressNumber >= 0)
));

// Dynamically assign bar classes based on index
const getBarClass = (index) => {
  const classes = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
  return classes[index % classes.length]; // Cycle through the color classes
};

// Stage names
const getStageName = (index) => {
  const stageNames = ['RFQ/PO', 'INS/DIS', 'CVB', '3P', 'CS', 'ASMB', 'TEST', 'DEL'];
  return stageNames[index % stageNames.length]; // Cycle through the names
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
  height: 30px;
  border-radius: 5px;
  border: 1px solid #b0b0b0; /* Outline */
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Shadow label (Unfilled bar text) */
.shadow-label {
  position: absolute;
  color: rgba(0, 0, 0, 0.3); /* Dark but faded */
  font-weight: bold;
  z-index: 1; /* Behind the filled bar */
}

/* Filled bar */
.filled-bar {
  height: 100%;
  border-radius: 5px;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0%; /* Default to 0 width */
  transition: width 0.5s ease-in-out;
  z-index: 2; /* Above shadow label */
}

/* Filled text label (Only appears in filled part) */
.filled-label {
  color: white;
  font-weight: bold;
  position: absolute;
  z-index: 3; /* On top of filled bar */
  opacity: 1; /* Fully visible */
}

/* Colors for the bars */
.first .filled-bar { background-color: #ff
