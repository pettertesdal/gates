import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useProjectsStore = defineStore('projects', () => {
    const project = ref();
    const projects = ref([]);
    const templateId = ref(null);
    const index = ref(0);
    const managerProjects = ref([]);
    const projectSorting = ref();
    const templateProjects = ref([])
    const allProjects = ref([])

    function toBoolean(value) {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'number') {
            return value !== 0;
        }

        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (["true", "1", "yes", "y"].includes(normalized)) {
                return true;
            }
            if (["false", "0", "no", "n"].includes(normalized)) {
                return false;
            }
        }

        return Boolean(value);
    }

    function mapProject(project) {
        if (!project) {
            return project;
        }

        return {
            id: project.ID,
            title: project.title,
            progress: project.progress,
            dividers: project.dividers,
            onTimeDate: project.onTimeDate,
            PEM: project.PEM,
            comment: project.comment,
            POdate: project.POdate,
            SFdate: project.SFdate,
            archive: toBoolean(project.archive),
            gates: project.gates,
            team: project.team,
            template: toBoolean(project.template)
        };
    }

    function normalizeProjectShape(project) {
        if (!project) {
            return project;
        }

        if (typeof project.id !== 'undefined') {
            return {
                ...project,
                archive: toBoolean(project.archive),
                template: toBoolean(project.template)
            };
        }

        return mapProject(project);
    }

    function setProjects(newProjects) {
        projects.value = newProjects.map(normalizeProjectShape);
        const templateProject = projects.value.find(project => project.template === true);
        if (templateProject) {
            templateId.value = templateProject.id;
        }
    }

    function setManagerProjects(newProjects) {
        managerProjects.value = newProjects.map(normalizeProjectShape);
    }

    async function fetchNonArchivedProjects() {
        try {
            const response = await $fetch('/projects', {
                method: 'GET'
            });
            const data = response.data;
            const projectsArray = Object.values(data).map(mapProject);

            setProjects(projectsArray);

        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    async function fetchAllProjects() {
        const authStore = useAuthStore();

        if (!authStore.isLoggedIn()) {
            return null;
        }

        try {
            const response = await $fetch('/projects', {
                method: 'GET'
            });
            const data = response.data;
            const projectsArray = Object.values(data).map(mapProject);

            setManagerProjects(projectsArray);
            allProjects.value = projectsArray.map(normalizeProjectShape);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    async function fetchTemplates() {
        const authStore = useAuthStore();

        if (!authStore.isLoggedIn()) {
            return null;
        }

        try {
            const response = await $fetch('/templates/', {
                method: 'GET'
            });
            const data = response.data;
            const templateArray = Object.values(data).map(x => ({
                ID: x.ID,
                title: x.title,
                team: x.team,
                template: x.template
            }))

            templateProjects.value = templateArray;

        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    async function fetchProjects() {
        const authStore = useAuthStore();
        const userTeam = authStore.getUserTeam();

        console.log("Fetching projects..")

        if (!authStore.isLoggedIn()) {
            return null;
        }

        try {
            const response = await $fetch('/projects/' + userTeam, {
                method: 'GET'
            });
            const data = response.data;
            const projectsArray = Object.values(data).map(mapProject);

            setProjects(projectsArray);
            sortProjects();

        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    async function updateOnTime(projectID, float) {
        if (isNaN(float)) {
            console.log("ERRRORFLOAT: " + float)
            console.error('Invalid float value:', float);
            return;
        }

        const today = new Date();
        const onTimeDate = new Date(today);
        onTimeDate.setDate(today.getDate() + float);

        if (isNaN(onTimeDate.getTime())) {
            console.error('Invalid onTimeDate:', onTimeDate);
            return;
        }

        try {
            await fetch(`/projects/onTimeDate/${projectID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectID: projectID,
                    onTimeDate: onTimeDate.toISOString().split('T')[0] // Format date to 'YYYY-MM-DD'
                })
            });

            // Update the local state in the store
            const projectIndex = projects.value.findIndex(project => project.id === projectID);
            if (projectIndex !== -1) {
                projects.value[projectIndex].onTimeDate = onTimeDate.toISOString().split('T')[0];
            }
        } catch (error) {
            console.error('Error updating project onTimeDate:', error);
        }
    }

    async function calculateWorkDuration(prosjektID) {
        const gateStore = useGatesStore();
        const taskStore = useTasksStore();
        let workDuration = 0;
        let filteredGates = gateStore.getProjectGates(prosjektID);
        for (const gate of filteredGates) {
            const maxDuration = taskStore.maxTaskWorkDuration(prosjektID, gate.ID);
            workDuration += maxDuration;
        }
        return workDuration;
    }

    async function calculateFloat(projectID) {
        const project = projects.value.find(project => project.id === String(projectID));
        if (!project) {
            console.log("PROJECTID ERROR WITH ID: " + projectID)
            return null;
        };

        // Fetch the SF date and work duration
        const sfDate = new Date(project.SFdate);
        const workDuration = await calculateWorkDuration(String(projectID));

        if (workDuration === 0) {
            return 0;
        }

        // Calculate the new date by subtracting the work duration (assuming workDuration is in days)
        const newDate = new Date(sfDate);
        newDate.setDate(sfDate.getDate() - workDuration);
        newDate.setHours(23, 59, 0, 0);

        const today = new Date();
        const diffTime = Math.abs(newDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (today > newDate) {
            return -diffDays+1;
        }
        return diffDays;
    }


    async function calculatePOFloat(projectID) {
        const project = projects.value.find(project => project.id === projectID);
        if (!project) return null;
    
        // Fetch the PO date and work duration
        const poDate = new Date(project.POdate);
        const workDuration = await calculateWorkDuration(String(projectID));
    
        if (workDuration === 0) {
            return 0;
        }
    
        // Calculate the new date by subtracting the work duration (assuming workDuration is in days)
        const newDate = new Date(poDate);
        newDate.setDate(poDate.getDate() - workDuration);
        newDate.setHours(23, 59, 0, 0);
    
        const today = new Date();
        const diffTime = Math.abs(newDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
        if (today > newDate) {
            return -diffDays + 1;
        }
        return diffDays;
    }

    async function updateProjectTitle(projectID, newTitle) {
        const projectIndex = projects.value.findIndex(project => project.id === projectID);
        if (projectIndex !== -1) {
            projects.value[projectIndex].title = newTitle;
        }

        try {
            await fetch(`/projects/title/${projectID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectID: projectID,
                    newTitle: newTitle
                })
            });
        } catch (error) {
            console.error('Error updating project title:', error);
        }
    }

    function getTemplate() {
        return templateId.value;
    }

    const filteredProjects = computed(() => {
        return projects.value.filter(project => !project.template);
    });


    function getProjects() {
        return filteredProjects.value;
    }

    function getTemplates() {
        return templateProjects.value;
    }

    function getManagerProjects() {
        return managerProjects.value;
    }

    function getAllprojects() {
        return allProjects.value;
    }

    function sortProjects(comparator) {
        if (comparator == undefined && projectSorting.value) {
            projects.value.sort(projectSorting.value)
            managerProjects.value.sort(projectSorting.value)
            
            return;
        } else if (comparator == undefined) {
            console.log("comparator is not undefined")
            projects.value.sort((a, b) => false ? a['SFdate'] - b['SFdate'] : a['SFdate'].localeCompare(b['SFdate']))
            managerProjects.value.sort((a, b) => false ? a['SFdate'] - b['SFdate'] : a['SFdate'].localeCompare(b['SFdate']))
            
            return;
        }
        projectSorting.value = comparator;
        projects.value.sort(comparator);
        managerProjects.value.sort(comparator)
    }

    function getPODate(projectID) {
        let pro;
        for (let i = 0; i < projects.value.length; i++) {
            if (projects.value[i].id === projectID) {
                pro = projects.value[i];
            }
        }
        return computed(() => {
            return pro.POdate;
        });
    }

    function getProjectById(projectId) {
        if (projects.value.find(project => project.id === projectId)) {
            return projects.value.find(project => project.id === projectId);
        } else {
            return managerProjects.value.find(project => project.id === projectId)
        }
    }

    function getSFDate(projectID) {
        let pro;
        for (let i = 0; i < projects.value.length; i++) {
            if (projects.value[i].id === projectID) {
                pro = projects.value[i];
            }
        }
        return pro.SFdate;
    }

    async function addProject(ID, copyID ,title, progress, plannedDate, PODate, status, PEM, comment) {
        const authStore = useAuthStore();
        const userTeam = authStore.getUserTeam();

        const requestBody = {
            ID: Number(copyID),
            title: title,
            progress: progress,
            plannedDate: plannedDate,
            PODate: PODate,
            status: status,
            PEM: PEM,
            comment: comment,
            team: userTeam,
            template: false
        };

        const admin = useCookie('admin');
        try {
            await $fetch('/projects', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'authentication': admin.value
                },
                body: JSON.stringify(requestBody)
            });

            this.fetchProjects();
            index.value++;
        } catch (error) {
            return createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                data: 'Failed to create project'
            });
        }
    }

    async function addTemplate(copyID ,title, team) {
        const authStore = useAuthStore();

        const requestBody = {
            ID: Number(copyID),
            title: title,
            progress: "progress",
            plannedDate: "3000-01-01",
            PODate: "3000-01-01",
            status: "status",
            PEM: "NONE",
            comment: "comment",
            team: team,
            template: 1
        };

        console.log("BODY: ",requestBody)

        const admin = useCookie('admin');
        try {
            await $fetch('/projects', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'authentication': admin.value
                },
                body: JSON.stringify(requestBody)
            });

            this.fetchProjects();
            index.value++;
        } catch (error) {
            return createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                data: 'Failed to create project'
            });
        }
    }

    async function deleteProject(deleteID) {
        if (Number(deleteID) === 1){
            throw new Error("Can not delete root project")
        }
        try {
            await $fetch(`/projects/${deleteID}`, {
                method: 'DELETE'
            });
            projects.value = projects.value.filter(project => project.id !== deleteID);
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    }

    async function updateProjectComment(projectID, newComment) {
        const projectIndex = projects.value.findIndex(project => project.id === projectID);
        if (projectIndex !== -1) {
            projects.value[projectIndex].comment = newComment;
        }

        try {
            await fetch(`/projects/comment/${projectID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectID: projectID,
                    newComment: newComment
                })
            });
        } catch (error) {
            console.error('Error updating project comment:', error);
        }
    }

    async function updatePODate(projectID, newPODate) {
        const projectIndex = projects.value.findIndex(project => project.id === projectID);
        if (projectIndex !== -1) {
            projects.value[projectIndex].POdate = newPODate;
        }

        try {
            await fetch(`/projects/POdate/${projectID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectID: projectID,
                    newPODate: newPODate
                })
            });
        } catch (error) {
            console.error('Error updating project POdate:', error);
        }
    }

    async function archiveProject(projectID) {
        const projectIndex = projects.value.findIndex(project => project.id === projectID);
        if (projectIndex !== -1) {
            // Toggle the archive status
            projects.value[projectIndex].archive = !projects.value[projectIndex].archive;

            try {
                await fetch(`/projects/archive/${projectID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        projectID: projectID,
                        archive: projects.value[projectIndex].archive
                    })
                });
            } catch (error) {
                console.error('Error updating project archive status:', error);
            }
        }
    }

    async function updateSFDate(projectID, newSFDate) {
        const projectIndex = projects.value.findIndex(project => project.id === projectID);
        if (projectIndex !== -1) {
            projects.value[projectIndex].SFdate = newSFDate;
        }

        try {
            await fetch(`/projects/SFdate/${projectID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectID: projectID,
                    newSFDate: newSFDate
                })
            });
        } catch (error) {
            console.error('Error updating project SFdate:', error);
        }
    }

    async function updatePEM(projectID, newPEM) {
        const projectIndex = projects.value.findIndex(project => project.id === projectID);
        if (projectIndex !== -1) {
            projects.value[projectIndex].PEM = newPEM;
        }

        try {
            await fetch(`/projects/PEM/${projectID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectID: projectID,
                    newPEM: newPEM
                })
            });
        } catch (error) {
            console.error('Error updating project PEM:', error);
        }
    }

    function clearStore() {
        setProjects([]);
        templateId.value = null;
    }

    return {
        getTemplate,
        filteredProjects,
        templateId,
        project,
        projects,
        managerProjects,
        getProjects,
        getTemplates,
        getProjectById,
        addProject,
        addTemplate,
        setProjects,
        fetchProjects,
        fetchTemplates,
        getPODate,
        deleteProject,
        getSFDate,
        getAllprojects,
        updateProjectTitle,
        updateProjectComment,
        updatePODate,
        updateSFDate,
        updatePEM,
        fetchNonArchivedProjects,
        archiveProject,
        calculateWorkDuration,
        updateOnTime,
        calculateFloat,
        calculatePOFloat,
        clearStore,
        sortProjects,
        fetchAllProjects,
        getManagerProjects,
        projectSorting
    };
});
