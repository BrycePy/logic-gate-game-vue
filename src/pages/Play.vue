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
import { inject } from 'vue'
import { useTemplateRef } from 'vue';

import { createApp } from 'vue';

const handleBack = ()=> {
    console.log('back')
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

const populateGateDeck = (logicCanvas, gates)=>{
    let gateDeck = document.querySelector('.logic-gate-deck');
    gates.forEach(gate => {
        let gateDiv = logicCanvas.getGateTemplate(gate);
        let clone = gateDiv.cloneNode(true);
        clone.classList.add('gate-deck-item');
        gateDeck.appendChild(clone);
        clone.addEventListener('click', async (e) => {
            let gateObj = logicCanvas.createGate(gate);
            let originalOffset = $(gateObj.domElement).offset();
            let cloneOffset = $(clone).offset();
            let gateObjOriginalTransition = gateObj.domElement.style.transition;
            let gateObjOriginalZIndex = gateObj.domElement.style.zIndex;
            let gateObjOriginalPointerEvents = gateObj.domElement.style.pointerEvents;
            gateObj.domElement.style.zIndex = 1000;
            gateObj.domElement.style.pointerEvents = 'none';
            $(gateObj.domElement).offset(cloneOffset);
            await sleep(30);
            gateObj.domElement.style.transition = 'top 0.2s, left 0.2s, transform 0.2s, opacity 0.2s';
            await sleep(30);
            $(gateObj.domElement).offset(originalOffset);
            await sleep(200);
            gateObj.domElement.style.transition = gateObjOriginalTransition;
            gateObj.domElement.style.zIndex = gateObjOriginalZIndex;
            gateObj.domElement.style.pointerEvents = gateObjOriginalPointerEvents;
        })
        clone.draggable = true;
        clone.ondragstart = (e) => {
            e.dataTransfer.setData('gate', gate);
        }
    });

    logicCanvas.domElement.ondragover = (e) => {
        e.preventDefault();
    }

    logicCanvas.domElement.ondrop = (e) => {
        let gate = e.dataTransfer.getData('gate');
        let rect = logicCanvas.domElement.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        x -= 25;
        y -= 25;
        logicCanvas.createGate(gate, x, y);
    }
}

let logicCanvas, modal;
let challengeApp;
let level = getLevel();

onMounted(async () => {
    if (!level) return;

    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + `#play?${level.id}`;
    window.history.pushState({}, '', newUrl);

    let targetDiv = document.querySelector('.logic-canvas-here');
    let world = new World();
    logicCanvas = new LogicCanvas(world, targetDiv);
    logicCanvas.startVisualTick();
    logicCanvas.startWorldTick(20);
    logicCanvas.world.enableAutoSleep();

    populateGateDeck(logicCanvas, level.availableGates || [
        'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'
    ]);


    challengeApp = createApp(level);
    challengeApp.provide('logicCanvas', logicCanvas);
    challengeApp.mount('#challenge');
})

onBeforeUnmount(() => {
    console.log('logic canvas removed')
    logicCanvas?.stopVisualTick();
    logicCanvas?.stopWorldTick();
    logicCanvas?.remove();

    challengeApp?.unmount();

    modal?.hide();
})

let undoState = null;
const handleUndo = async() => {
    if (!undoState) return;
    logicCanvas.load(undoState);
    undoState = null;
    let undobtn = document.querySelector('.undo-btn');
    undobtn.style.display = 'none';
}

const handleClear = async(e) => {
    let clearbtn = document.querySelector('.clear-btn');
    let undobtn = document.querySelector('.undo-btn');
    clearbtn.disabled = true;

    undoState = logicCanvas.export();
    logicCanvas.world.nonIOGates.forEach(gate => {
        gate.domElement.animate([
            {opacity: 1},
            {opacity: 0}
        ], {duration: 200}).onfinish = () => {
            gate.remove();
        }
    })
    await sleep(200);
    logicCanvas.world.wires.forEach((wire)=>{
        wire.remove();
    })
    
    await sleep(300);
    clearbtn.disabled = false;
    undobtn.style.display = 'block';

    logicCanvas.eventManager.onceMulti(
        ['GATE_CREATED', 'WIRE_CREATED', 'TERMINAL_STATE_CHANGED'],
        () => {
            let undoBtn = document.querySelector('.undo-btn');
            undoBtn.style.display = 'none';
        }
    )
}


const test = useTemplateRef('test');

const onSubmit = async()=>{
    let ref = test.value._vnode.component.exposed;
    console.log('submit', ref.onSubmit())
}

</script>

<template>
    <div class="app-inner">
        <div class="back-button">
            <button class="btn btn-outline-secondary" @click="handleBack()">Back</button>
        </div>

        <img class="logo" src="/logowhite.png" />
    
        <div class="d-flex justify-content-center m-1 logic-canvas-container">
            <div class="logic-canvas-here"></div>
            <div class="logic-gate-deck">
                <button class="btn btn-secondary clear-btn" @click="handleClear">Clear</button>
                <button class="btn btn-secondary undo-btn" @click="handleUndo">Undo</button>
            </div>
            <button class="btn btn-primary mt-0 mb-2" id="submit-btn" @click="onSubmit">Submit</button>
        </div>

        <div class="challenge-container">
            <div id="challenge" ref="test"></div>
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
    /* gap: 1em; */
}

.logic-canvas-here {
    display: block;
    width: 370px;
    height: 370px;
    border-radius: 2em;
    overflow: hidden;
}

.logic-gate-deck {
    gap: 0.5em;
    padding: 0.5em;
    scale: 0.7;
    background-color: rgba(100, 100, 100, 0.2);
    border-radius: 1em;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
}

.clear-btn {
    order: 1;
    margin-left: 2em;
}

.undo-btn {
    order: 2;
    display: none;
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
    padding: 0;
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