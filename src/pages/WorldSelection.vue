<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import worlds from '@/levels/levels';
import '../assets/main.css';
import { onMounted } from 'vue';
import { mountApp, getCallerArgs } from '../libs/utils';
import MainMenu from '../pages/MainMenu.vue';
import Play from '../pages/Play.vue';
import { onBrowserBack } from '@/libs/utils';
import { idToLevel } from '@/levels/levels';

onBrowserBack(()=>{
    mountApp(MainMenu);
})

onMounted(() => {
    window.history.pushState({}, '', '/world-selection');
})

const handlePlay = (world, level) => {
    console.log(world, level);
    mountApp(Play, level.id);
}

</script>

<template>
    <!-- back button -->
    <div class="back-button">
        <button class="btn btn-outline-secondary" @click="mountApp(MainMenu)">Back</button>
    </div>

    <img class="logo" src="/logowhite.png" />

    <div id="world-selection" class="world-selection-container" data-bs-theme="dark">
        <div v-for="world in worlds" class="world">
            <h1 class="world-title">{{ world.name }}</h1>
            <div class="level-container">
                <div v-for="level in world.levels" class="level">
                    <div class="card" style="width: 18rem;">
                        <!-- <img class="card-img-top" src="..." alt="Card image cap"> -->
                        <div class="card-body">
                            <h5 class="card-title">{{ level.name }}
                                <div class="star-container">
                                    <img src="../assets/star-fill.svg" alt="star" class="star" />
                                    <img src="../assets/star-fill.svg" alt="star" class="star" />
                                    <img src="../assets/star.svg" alt="star" class="star" />
                                </div>
                            </h5>
                            <p class="card-text">{{ level.description }}</p>
                            <button href="#" class="btn btn-primary go-to-play" @click="handlePlay(world, level)">Go
                                somewhere</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.back-button {
    position: absolute;
    top: 0;
    left: 0;
    padding: 1em;
}

.logo {
    display: block;
    height: 200px;
    margin-left: auto;
    margin-right: auto;
}

.world-title {
    margin-top: 0.3;
    text-align: center;
    color: white;
}

.world-selection-container {
    margin-top: 1em;
    display: flex;
    flex-direction: column;
    row-gap: 2em;
}

.star {
    height: 1em;
    margin-left: 0.2em;
}

.star-container {
    display: inline-block;
    position: absolute;
    right: 1em;
}

.world {
    padding: 1em;
    border: 1px solid #666;
    border-radius: 1em;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    background-color: rgba(0, 0, 0, 0.5);
}

.level-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    /* align-items: left; */
    justify-content: center;
    margin: 1em;
    padding: 1em;
    gap: 2em;
}
</style>

<style scoped>
header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
}

@media (min-width: 1024px) {
    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.animated-bg-spin {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    animation: spin 200s linear infinite;
    filter: blur(10px);
    z-index: -1;
}

.animated-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
    transform: scale(5);
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
    fill: white;
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
