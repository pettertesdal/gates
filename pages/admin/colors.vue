<template>
    <div v-if="admin">
        <h3>Color palette:</h3>

        <!-- List of colors -->
        <div v-if="notEmpty">
            <AdminComponentsColorPaletteDesc/>
            <div v-for="color in colors" :key="color.id">
                <AdminComponentsColorEntry :entryData="color"/>
            </div>
            <div class="bottom-spacer"/>
        </div>
        <div v-else>Color palette empty.</div>

        <!-- Add color button -->

    </div>
    <div v-else>This is an admin only page, please do not attempt to access it without being logged in as an admin.</div>

</template>

<script setup>
const authStore = useAuthStore();
const colorStore = useColorStore();

const admin = computed(() => authStore.isAdmin());
const colors = ref([]);
const notEmpty = computed(() => (colors.value.length>0))


onMounted(() => {
    fetchColors(); 
})

async function fetchColors() {
    await colorStore.fetchColors();
    colors.value = colorStore.getColors()
    console.log(colors.value)
}

</script>

<style>
.bottom-spacer {
    height: 50px;
}
</style>