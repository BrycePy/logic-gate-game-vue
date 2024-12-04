<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import { onMounted } from 'vue';
import { mountApp, getCallerArgs } from '../libs/utils';
import WorldSelection from './WorldSelection.vue';
import { onBrowserBack } from '@/libs/utils';
import { idToLevel } from '@/levels/levels';

onBrowserBack(()=>{
    console.log('back')
    mountApp(WorldSelection);
})

const getLevel = ()=>{
    let urlLevelID = window.location.search?.substring(1);
    urlLevelID = urlLevelID? decodeURI(urlLevelID): undefined;
    let callerLevelID = getCallerArgs();
    let levelID = urlLevelID || callerLevelID;
    console.log(callerLevelID, urlLevelID)
    let level = idToLevel[levelID];
    if(!level) {
        mountApp(WorldSelection);
        return;
    }
    return level;
}

onMounted(()=>{
    let level = getLevel();
    if(!level) return;
    
    window.history.pushState({}, '', `/play?${level.id}`);
})

</script>

<template>
    <img alt="Vue logo" class="logo" src="/logowhite.png" />
    <img alt="Vue logo" class="logo" src="/logowhite.png" />
    <button class="play-wrapper" id="start-btn">
        <img src="../assets/play.svg" class="play-btn" viewBox="0 0 16 16"></img>
    </button>
</template>

<style scoped>
#app {
  max-width: none;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
}

@media (min-width: 1024px) {
  #app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 2rem;
  }
}

</style>

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
