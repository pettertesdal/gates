<template>
  <div v-if="hasProgress">
    <div v-if="isArray" class="progress-container">
      <div
        v-for="(progress, index) in progressNumber"
        :key="index"
        class="progress-bar"
        :style="{ flex: getStageWeight(index) }"
      >
        <!-- Shadow Label (Faded, disappears under progress) -->
        <span class="shadow-label">{{ getStageName(index) }}</span>

        <!-- Filled Bar -->
        <div
          class="filled-bar"
          :style="{ width: (progress || 0) + '%', backgroundColor: getStageColor(index) }"
        >
          <!-- Filled Label (Appears inside the progress bar) -->
          <span class="filled-label">{{ getStageName(index) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="progress-bar single">
      <span class="shadow-label">{{ singleStageName }}</span>
      <div class="filled-bar" :style="{ width: progressNumber + '%', backgroundColor: stageColor }">
        <span class="filled-label">{{ singleStageName }}</span>
      </div>
    </div>
  </div>

  <div v-else>
    <span>No progress data available</span>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useStageStore } from '@/stores/stages';

const props = defineProps({
  projectID: { type: String, required: true },
  progressNumber: { type: [Array, Number], default: () => [] },
});

const stagesStore = useStageStore();
const projectStages = ref([]);

const fetchStages = async () => {
  if (!props.projectID) return;
  try {
    projectStages.value = await stagesStore.getStagesByID(props.projectID);
  } catch (error) {
    console.error("Failed to fetch project stages:", error);
  }
};

onMounted(fetchStages);
watch(() => props.projectID, fetchStages, { immediate: true });

const isArray = computed(() => Array.isArray(props.progressNumber));
const hasProgress = computed(() => (isArray.value && props.progressNumber.length > 0) || (!isArray.value && props.progressNumber >= 0));

const stageColor = computed(() => projectStages.value.length > 0 ? projectStages.value[0].hex : '#76c7c0');
const singleStageName = computed(() => projectStages.value.length > 0 ? projectStages.value[0].name : '');

const getStageColor = (index) => projectStages.value[index]?.hex || '#76c7c0';
const getStageName = (index) => projectStages.value[index]?.name || '';
const getStageWeight = (index) => projectStages.value[index]?.weight || 1;
</script>

<style scoped>
.progress-container {
  display: flex;
  gap: 5px;
  width: 100%;
}

.progress-bar {
  background-color: #e0e0e0;
  height: 25px;
  border-radius: 5px;
  border: 1px solid #b0b0b0;
  overflow: hidden;
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filled-bar {
  height: 100%;
  border-radius: 5px;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0%;
  transition: width 0.5s ease-in-out;
  z-index: 2;
}

/* Shadowed label (fades as bar fills over it) */
.shadow-label {
  position: absolute;
  color: rgba(0, 0, 0, 0.3);
  font-weight: bold;
  z-index: 1;
  transition: opacity 0.3s ease-out;
  white-space: nowrap;
}

/* Filled label (becomes visible inside progress) */
.filled-label {
  color: white;
  font-weight: bold;
  position: absolute;
  z-index: 3;
  white-space: nowrap;
  transition: opacity 0.3s ease-in;
}

/* Ensure filled label is hidden until bar reaches it */
.filled-bar .filled-label {
  opacity: 0;
}

/* Make filled label visible when inside the filled bar */
.filled-bar {
  position: relative;
}

.filled-bar .filled-label {
  opacity: 1;
  transition: opacity 0.3s ease-in;
}
</style>
