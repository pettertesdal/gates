import { ref, computed } from 'vue';
import { packProject } from '@/utils/packProject.js';
import { defineStore } from "pinia";


export const useProjectsStore = defineStore('projects', () => {
	// denne brukes hvis man vil hente et spesifikt object, må implementere metode for det da
	const project = ref();
	// listen av prosjekter
	const projects = ref([]);
	const index = ref (0)
	
	function getProjectById(projectId) {
		console.log(projectId)
		return projects.value.find(project => parseInt(project.id, 10) === projectId);
		
	}
	// Funksjon for å legge til et prosjekt i listen
	async function addProject(ID, title, progress, plannedDate, PODate, status, PEM, comment) {


        const requestBody = {
			ID: ID,
            title: title,
            progress: progress,
            plannedDate: plannedDate,
            PODate: PODate,
            status: status,
            PEM: PEM,
            comment: comment
        };

        try {
            const response = await $fetch('/projects', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            // Assuming successful response, add project to the store
            
            index.value++;
        } catch (error) {
            return createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                data: 'Failed to create project'
            });
        }
    }
	return { project, projects, getProjectById, addProject }
});
