<template>
  <div v-if="hasProgress">
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
  
    const classes = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
  
    return classes[index % classes.length]; // Cycle through the color classes
  
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
   
  /* Colors for the bars in multibar layout */
  
  .first .filled-bar {
  
    background-color: #ffae00; /* PO - Orange */
  
  }
   
  .second .filled-bar {
  
    background-color: #a7a7a7; /* Inspect/Disassembly - Grey */
  
  }
   
  .third .filled-bar {
  
    background-color: #000000; /* CVB - ?? */
  
  }
   
  .fourth .filled-bar {
  
    background-color: #f1f50c; /* Third Party - Yellow */
  
  }
   
  .fifth .filled-bar {
  
    background-color: #e000e0; /* Clean Start - Purple */
  
  }
   
  .sixth .filled-bar {
  
    background-color: #00e025; /* Assembly - Green */
  
  }
   
  .seventh .filled-bar {
  
    background-color: #e41b1b; /* Test - Red */
  
  }
   
  .eighth .filled-bar {
  
    background-color: #00771e; /* Delivery - Dark Green */
  
  }
   
  /* Single progress bar color */
  
  .single .filled-bar {
  
    background-color: #76c7c0;
  
  }
  </style>
  
   
