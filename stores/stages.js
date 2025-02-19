import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useStageStore = defineStore('stages', () => {
    const stages = ref([]);

    async function fetchStages() {
        //fetch stages
    }

    async function deleteStages(projectID) {
        //delete stages for a given project
    }

    async function add_stages() {
        //delete previous stages and add the new ones to the project.
    }

    function getStages() {
        return stages.value;
    }

    return {
        stages,
        fetchStages,
        deleteStages,
        getStages
    }
})