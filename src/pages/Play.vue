<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import { onMounted } from 'vue';
import { mountApp, getCallerArgs } from '../libs/utils';
import WorldSelection from './WorldSelection.vue';
import { onBrowserBack } from '@/libs/utils';
import { idToLevel } from '@/levels/levels';
import { LogicCanvas } from '@/libs/logicgate_front';
import { World } from '@/libs/logicgate_back';

onBrowserBack(() => {
    console.log('back')
    mountApp(WorldSelection);
})

const getLevel = () => {
    let urlLevelID = window.location.hash.split('?')[1];
    urlLevelID = urlLevelID ? decodeURI(urlLevelID) : undefined;
    let callerLevelID = getCallerArgs();
    let levelID = urlLevelID || callerLevelID;
    console.log(callerLevelID, urlLevelID)
    let level = idToLevel[levelID];
    if (!level) {
        mountApp(WorldSelection);
        return;
    }
    return level;
}

onMounted(() => {
    let level = getLevel();
    if (!level) return;

    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + `#play?${level.id}`;
    window.history.pushState({}, '', newUrl);

    let targetDiv = document.querySelector('.logic-canvas-here');
    let world = new World();
    let logicCanvas = new LogicCanvas(world, targetDiv);
    logicCanvas.startVisualTick();
    logicCanvas.startWorldTick(20);
})

</script>

<template>
    <div class="app-inner">
        <div class="back-button">
            <button class="btn btn-outline-secondary" @click="mountApp(WorldSelection)">Back</button>
        </div>
    
        <div class="d-flex justify-content-center mt-5">
            <div class="logic-canvas-here"></div>
        </div>
        <div class="challenge-container">
            <div class="challenge">
                <h1 class="challenge-title">Challenge</h1>
                <p class="challenge-description">Description</p>
                <div class="challenge-buttons">
                    <button class="btn btn-primary">Reset</button>
                    <button class="btn btn-primary">Submit</button>
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

.logic-canvas-here {
    width: 300px;
    height: 300px;
}

@media (min-width: 600px) {
    .logic-canvas-here {
        width: 400px;
        height: 400px;
    }
}

@media (min-width: 1024px) {
    .back-button {
        padding: 0 1em;
    }

    .logic-canvas-here {
        width: 600px;
        height: 600px;
    }
}
</style>

<style scoped>
.app-inner {
    display: grid;
    grid-template-columns: 1fr;
    max-width: none;
    margin: 0 auto;
    padding: 1rem;
    gap: 2rem;
    font-weight: normal;
}

@media (min-width: 1024px) {
    .app-inner {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 0 2rem;
    }
}
</style>