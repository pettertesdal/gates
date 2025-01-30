import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { objectEntries } from '@vueuse/core';

export const useColorStore = defineStore('colors', () => {
    const colors = ref([]);

    async function fetchColors() {
        try {
            const response = await $fetch('/colors', {
                method: 'GET'
            });
            const data = response.data;
            console.log()
            const colorsArray = Object.values(data).map(color => ({
                ID: color.ID,
                name: color.name,
                hex: color.hex
            }));
            colors.value = colorsArray;

        } catch (error) {
            console.error('Error fetching colors', error)
        }
    }

    function getColors() {
        return colors.value;
    }

    return{
        colors,
        fetchColors,
        getColors
    }
})