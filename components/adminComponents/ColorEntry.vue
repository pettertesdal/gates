<template>
    <div class="color-card">
        <div class="w50">{{ props.entryData.ID }}</div>
        <div class="w25 row">
            <div class="w50">{{ props.entryData.name }}</div>
            <div class="w50" :style="{backgroundColor: props.entryData.hex}"></div>
        </div>
        <div class="w25">{{ props.entryData.hex }}</div>
    </div>
</template>


<script setup>
const colorStore = useColorStore();

const props = defineProps({
    entryData: {
        type: Object,
        required: true
    }
});

</script>


<style>
.color-card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 5px;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: 6px;
}

.row {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 10px;
}

.w50 {
    width: 50%;
}

.w25 {
    width: 25%;
}

</style>