<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import '../assets/main.css';
import { onMounted } from 'vue';
import { mountApp, getCallerArgs } from '../libs/utils';
import WorldSelection from '../pages/WorldSelection.vue';

onMounted(()=>{
    window.history.pushState({}, '', '/');

    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        mountApp(WorldSelection);
    }, { once: true });
})

</script>

<template>
    <!-- <main> -->
    <img alt="Vue logo" class="logo" src="/logowhite.png" />

    <button class="play-wrapper" id="start-btn">
        <img src="../assets/play.svg" class="play-btn" viewBox="0 0 16 16"></img>
    </button>
</template>

<style scoped>
header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
}

.logo {
    display: block;
    height: 200px;
    margin-left: auto;
    margin-right: auto;
}

@media (min-width: 1024px) {
    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}

.play-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    cursor: pointer;
    /* fill: white; */
    border: 3px solid white;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    transition: background-color 0.3s, width 0.3s, height 0.3s;
}

.play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-45%, -50%);
    width: 75px;
    height: 75px;
}

.play-wrapper:hover {
    background-color: rgba(0, 0, 0, 0.7);
    width: 110px;
    height: 110px;
}
</style>

