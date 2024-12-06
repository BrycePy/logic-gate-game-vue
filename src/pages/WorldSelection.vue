<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import worlds from '@/levels/levels';
import '../assets/main.css';
import { onBeforeUnmount, onMounted } from 'vue';
import { mountApp, getCallerArgs } from '../libs/utils';
import MainMenu from '../pages/MainMenu.vue';
import Play from '../pages/Play.vue';
import { onBrowserBack } from '@/libs/utils';
import { idToLevel } from '@/levels/levels';
import { hintCursor } from '@/main';

onBrowserBack(()=>{
    mountApp(MainMenu);
})

onMounted(() => {
    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + '#world-selection';
    window.history.pushState({}, '', newUrl);

    // const startBtn = $('.go-to-play')[0];
    // hintCursor.clear();
    // hintCursor.add({
    //     element: startBtn,
    //     animation: 'click'
    // });
})

onBeforeUnmount(()=>{
    // $('.wsimg').remove();
})

const handlePlay = (level) => {
    // console.log(world, level);
    mountApp(Play, level.id);
}

</script>

<template>
    <div class="app-inner">
        <div class="back-button">
            <button class="btn btn-outline-secondary" @click="mountApp(MainMenu)">Back</button>
        </div>
    
        <img class="logo wsimg" src="/logowhite.png" />
    
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
                                        <img src="../assets/star-fill.svg" alt="star" class="star wsimg" />
                                        <img src="../assets/star-fill.svg" alt="star" class="star wsimg" />
                                        <img src="../assets/star.svg" alt="star" class="star wsimg" />
                                    </div>
                                </h5>
                                <p class="card-text">{{ level.description }}</p>
                                <button class="btn btn-primary go-to-play float-right" @click="handlePlay(level)">Start</button>
                            </div>
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
    width: 300px;
    margin-left: auto;
    margin-right: auto;
}

@media (min-width: 600px) {
    .logo {
        width: 500px;
        margin-top: 2em;
    }
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
</style>
