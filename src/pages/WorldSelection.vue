<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import worlds, { allLevels } from '@/levels/levels';
import '../assets/main.css';
import { onBeforeUnmount, onMounted } from 'vue';
import { mountApp, getCallerArgs } from '../libs/utils';
import MainMenu from '../pages/MainMenu.vue';
import Play from '../pages/Play.vue';
import { onBrowserBack } from '@/libs/utils';
import { idToLevel } from '@/levels/levels';
import { hintCursor } from '@/main';
import userData from '@/UserData';

const callerData = getCallerArgs();
const fromLevelID = callerData?.currentLevelID;
const toLevelID = callerData?.nextLevelID;

onBrowserBack(()=>{
    mountApp(MainMenu);
})

onMounted(() => {
    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + '#world-selection';
    window.history.pushState({}, '', newUrl);

    hintCursor.clear();
    if(!userData.getAttempt('Basic.Tutorial', 'stars')){
        const startBtn = $('.go-to-play')[0];
        hintCursor.add({
            element: startBtn,
            animation: 'click'
        });
    }

    if(fromLevelID){
        const level = idToLevel[fromLevelID];
        const nextLevel = idToLevel[toLevelID];
        let levelCard = $('#card-'+level?.cardID);
        let nextLevelCard = $('#card-'+nextLevel?.cardID);
        let halfScreen = window.innerHeight / 4;
        $('html, body').animate({
            scrollTop: levelCard.offset().top - halfScreen
        }, 100);
        let originalColor = $(levelCard).css('background-color');
        if(nextLevel){
            setTimeout(()=>{
                $('html, body').animate({
                    scrollTop: nextLevelCard.offset().top - halfScreen
                }, 100);
            }, 1000)
        }else{
            $(levelCard).animate({
                backgroundColor: 'rgba(200, 200, 200, 0.5)'
            }, 1000, ()=>{
                $(levelCard).animate({
                    backgroundColor: originalColor
                }, 5000);
            });
        }
    }

    allLevels.forEach(level => {
        if(userData.getAttempt(level.id, 'animate_world_select')){
            userData.setAttempt(level.id, 'animate_world_select', false);
        }
    })
})

onBeforeUnmount(()=>{
    hintCursor.clear();
})

const handlePlay = (level) => {
    if(level.goToPage){
        mountApp(level.goToPage);
    }else{
        $("html, body").animate({ scrollTop: 0 }, 10);
        mountApp(Play, level.id);
    }
}

</script>

<template>
<div class="app-container">
    <div class="back-button">
        <button class="btn btn-outline-secondary" @click="mountApp(MainMenu)">Back</button>
    </div>
    <div class="app-inner">
        <img class="logo wsimg" src="/logowhite.png" />
    
        <div id="world-selection" class="world-selection-container" data-bs-theme="dark">
            <div v-for="world in worlds" class="world">
                <h1 class="world-title">{{ world.name }}</h1>
                <div class="level-container">
                    <div v-for="level in world.levels" class="level">
                        <div class="card" style="width: 18rem;" :id="'card-'+level.cardID">
                            <!-- <img class="card-img-top" src="..." alt="Card image cap"> -->
                            <div class="card-body">
                                <h5 class="card-title">{{ level.name }}
                                    <div class="star-container" :class="userData.getAttempt(level.id, 'animate_world_select')?'star-animate':''">
                                        <div class="star-spin" v-for="star in (userData.getAttempt(level.id, 'stars') || [false, false, false])">
                                            <img v-if="star" src="../assets/star-fill.svg" alt="star" class="star result-star result-star-fill" />
                                            <img v-else src="../assets/star.svg" alt="star" class="star result-star" />
                                        </div>
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
</div>
</template>

<style scoped>
.app-container {
    position: relative;
    width: 100%;
    max-width: 1500px;
    padding: 1em;
}

.back-button {
    position: absolute;
    top: 0;
    left: 0;
    padding: 1em;
    z-index: 100;
}

.logo {
    display: block;
    width: 300px;
    margin-left: auto;
    margin-right: auto;
}

@keyframes stamp {
    0% {
        opacity: 0;
        transform: scale(5);
    }
    100% {
        opacity: 1;
        transform: scale(1);
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

.star-animate {
    animation: stamp 2s;
}

.star-animate div:nth-child(1) .result-star-fill {
    animation: spin 2s;
}

.star-animate div:nth-child(2) .result-star-fill {
    animation: spin 3s;
}

.star-animate div:nth-child(3) .result-star-fill {
    animation: spin 4s;
}

@media (min-width: 600px) {
    .logo {
        width: 300px;
        /* margin-top: 2em; */
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
    padding-bottom: 5em;
}

.star {
    height: 1em;
    margin-left: 0.2em;
}

.star-container {
    display: flex;
    position: absolute;
    right: 1em;
    top: 0.6em;
    gap: 0.2em;
}

.world {
    padding: 1em;
    border: 1px solid #666;
    border-radius: 2em;
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
</style>
