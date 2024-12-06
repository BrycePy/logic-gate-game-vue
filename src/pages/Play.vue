<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import { onBeforeUnmount, onMounted } from 'vue';
import { mountApp, getCallerArgs, setCallerArgs } from '../libs/utils';
import WorldSelection from './WorldSelection.vue';
import { onBrowserBack } from '@/libs/utils';
import { idToLevel } from '@/levels/levels';
import { LogicCanvas } from '@/libs/logicgate_front';
import { World } from '@/libs/logicgate_back';
import { hintCursor } from '@/main';
import { sleep } from '../libs/utils';
import { Modal } from 'bootstrap';

import { createApp } from 'vue';

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
    // console.log(callerLevelID, urlLevelID)
    let level = idToLevel[levelID];
    if (!level) {
        mountApp(WorldSelection);
        return;
    }
    return level;
}

const populateGateDeck = (logicCanvas)=>{
    let gateDeck = document.querySelector('.logic-gate-deck');
    let gates = ['AND', 'OR', 'NOT', 'NAND', 'XOR'];
    gates.forEach(gate => {
        let gateDiv = logicCanvas.getGateTemplate(gate);
        let clone = gateDiv.cloneNode(true);
        clone.classList.add('gate-deck-item');
        gateDeck.appendChild(clone);
    });
}

let logicCanvas, modal;
let challengeApp;
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

    populateGateDeck(logicCanvas);
    // populateGateDeck(logicCanvas);

    // console.log(level);
    challengeApp = createApp(level)
    setCallerArgs({
        logicCanvas,
    })
    challengeApp.mount('#challenge');

    // let in1 = logicCanvas.createInput();
    // let in2 = logicCanvas.createInput();
    // let out1 = logicCanvas.createOutput();
    // let andGate = logicCanvas.createGate('AND');

    // hintCursor.setCanvas(logicCanvas);
    // await hintCursor.addWire(in1.out(0), andGate.in(0));
    // await hintCursor.addWire(in2.out(0), andGate.in(1));
    // await hintCursor.addWire(andGate.out(0), out1.in(0));
    // await sleep(1000);

    // let submitBtn = document.getElementById('submit-btn');
    // hintCursor.add({
    //     element: submitBtn,
    //     animation: 'click'
    // });

    // await new Promise((resolve) => {
    //     submitBtn.addEventListener('click', () => {
    //         hintCursor.next();
    //         resolve();
    //     }, { once: true });
    // });

    // modal = new Modal(document.getElementById('reviewPopup'));
    // modal?.show();
})

onBeforeUnmount(() => {
    console.log('logic canvas removed')
    logicCanvas?.stopVisualTick();
    logicCanvas?.stopWorldTick();
    logicCanvas?.remove();

    challengeApp?.unmount();

    modal?.hide();
})
</script>

<template>
    <div class="app-inner">
        <div class="back-button">
            <button class="btn btn-outline-secondary" @click="handleBack()">Back</button>
        </div>

        <img class="logo" src="/logowhite.png" />
    
        <div class="d-flex justify-content-center m-1 logic-canvas-container">
            <div class="logic-canvas-here"></div>
            <div class="logic-gate-deck"></div>
        </div>

        <div class="challenge-container">
            <div id="challenge"></div>
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

.logo {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 5em;
}

.logic-canvas-container{
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    align-items: center;
    gap: 1em;
}

.logic-canvas-here {
    display: block;
    width: 300px;
    height: 300px;
}

.logic-gate-deck {
    gap: 0.5em;
    padding: 0.5em;

    background-color: rgba(100, 100, 100, 0.2);
    border-radius: 1em;

    overflow-x: auto;
    text-wrap: nowrap;
    white-space: nowrap;
}

.gate-deck-item {
    display: inline-block;
}

.challenge-container {
    padding: 1em;
    border: 1px solid #111;
}



@media (min-width: 600px) {
    .logic-canvas-here {
        width: 400px;
        height: 400px;
    }
}

@media (min-width: 1024px) {
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
    width: 100%;
    max-width: 1800px;
    margin: 1em;
    padding: 2em;
    padding-top: 5em;
    gap: 2em;
    font-weight: normal;

    border: 1px solid #666;
    border-radius: 1em;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    background-color: rgba(0, 0, 0, 0.5);
}

@media (min-width: 1400px) {
    .app-inner {
        display: grid;
        grid-template-columns: 1fr auto;
    }

    .logic-canvas-container {
        order: 1;
    }

    .challenge-container {
        order: 0;
    }
}
</style>