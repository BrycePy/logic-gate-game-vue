<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import { onBeforeUnmount, onMounted } from 'vue';
import { mountApp, getCallerArgs } from '../libs/utils';
import WorldSelection from './WorldSelection.vue';
import { onBrowserBack } from '@/libs/utils';
import { idToLevel } from '@/levels/levels';
import { LogicCanvas } from '@/libs/logicgate_front';
import { World } from '@/libs/logicgate_back';
import { hintCursor } from '@/main';
import { sleep } from '../libs/utils';
import { Modal } from 'bootstrap';

import { inject } from 'vue';
import { setupLifecycleNotifier } from '../libs/utils';
import { eventManager } from '@/main';
setupLifecycleNotifier(eventManager, inject('uuid'));

const handleBack = ()=> {
    hintCursor.clear();
    mountApp(WorldSelection);
}

onBrowserBack(handleBack)

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

let logicCanvas, modal;
onMounted(async () => {
    let level = getLevel();
    if (!level) return;

    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + `#play?${level.id}`;
    window.history.pushState({}, '', newUrl);

    let targetDiv = document.querySelector('.logic-canvas-here');
    let world = new World();
    logicCanvas = new LogicCanvas(world, targetDiv);
    logicCanvas.startVisualTick();
    logicCanvas.startWorldTick(20);

    let in1 = logicCanvas.createInput();
    let in2 = logicCanvas.createInput();
    let out1 = logicCanvas.createOutput();
    let andGate = logicCanvas.createGate('AND');

    hintCursor.setCanvas(logicCanvas);

    // await hintCursor.moveGate(andGate, 100, 100);

    await hintCursor.addWire(in1.out(0), andGate.in(0));
    await hintCursor.addWire(in2.out(0), andGate.in(1));
    await hintCursor.addWire(andGate.out(0), out1.in(0));

    await sleep(1000);

    let submitBtn = document.getElementById('submit-btn');
    hintCursor.add({
        element: submitBtn,
        animation: 'click'
    });

    await new Promise((resolve) => {
        submitBtn.addEventListener('click', () => {
            hintCursor.next();
            resolve();
        }, { once: true });
    });

    modal = new Modal(document.getElementById('reviewPopup'));
    modal?.show();

    // await hintCursor.add({
    //     element: $('.back-button')[0],
    //     animation: 'click'
    // });
})

onBeforeUnmount(() => {
    console.log('logic canvas removed')
    logicCanvas.stopVisualTick();
    logicCanvas.stopWorldTick();
    logicCanvas.remove();

    modal?.hide();
})

</script>

<template>
    <div class="app-inner">
        <div class="back-button">
            <button class="btn btn-outline-secondary" @click="handleBack()">Back</button>
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
                    <button class="btn btn-primary" id="submit-btn">Submit</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" tabindex="-1" data-bs-backdrop="static" id="reviewPopup" data-bs-theme="dark">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Result</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <p>Modal body text goes here.</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary">World Selection</button>
            <button type="button" class="btn btn-primary">Restart</button>
            <button type="button" class="btn btn-primary">Next Level</button>
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