<script>
const populateGateDeck = (logicCanvas, gates) => {
    // gates = [...gates, 'UNKNOWN', 'UNKNOWN1']
    let gateDeck = document.querySelector('.logic-gate-deck');
    gates.forEach(gate => {
        let gateDiv = logicCanvas.getGateTemplate(gate);
        let clone = gateDiv.cloneNode(true);
        clone.classList.add('gate-deck-item');
        clone.classList.add(`add-${gate.toLowerCase()}-btn`);


        let gateContainer = document.createElement('div');
        gateContainer.classList.add('gate-deck-item-container');
        gateContainer.appendChild(clone);

        let title = document.createElement('span');
        title.classList.add('gate-deck-item-title');
        title.innerText = gate;
        gateContainer.appendChild(title);

        let gateContainerScale = document.createElement('div');
        gateContainerScale.classList.add('gate-deck-item-scale');
        gateContainerScale.appendChild(gateContainer);
        gateDeck.appendChild(gateContainerScale);

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
        if (!e.dataTransfer.getData('gate')) return;
        let gate = e.dataTransfer.getData('gate');
        let rect = logicCanvas.domElement.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        x -= 25;
        y -= 25;
        logicCanvas.createGate(gate, x, y);
    }
}
export { populateGateDeck };
</script>

<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { mountApp, getCallerArgs, setCallerArgs, timeStrFromSeconds, Timer } from '../libs/utils';
import WorldSelection from './WorldSelection.vue';
import { onBrowserBack } from '@/libs/utils';
import { idToLevel } from '@/levels/levels';
import { LogicCanvas } from '@/libs/logicgate_front';
import { World } from '@/libs/logicgate_back';
import { hintCursor } from '@/main';
import { sleep } from '../libs/utils';
import { useTemplateRef } from 'vue';

import { createApp } from 'vue';
import { TruthTableLevel } from '@/levels/levelbase';
import truthtableleveltemplate from '@/components/truthtableleveltemplate.vue';
import Play from './Play.vue';
import userData from '@/UserData';

const handleBack = () => {
    console.log('back')
    hintCursor.clear();
    mountApp(WorldSelection, {
        currentLevelID: level?.id
    });
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

let logicCanvas, modal;
let challengeApp;
let level = getLevel();
let intersectionObserver;
let timer = new Timer();
let paintTimerInterval;

let resultModalData = ref([
    { star: true, text: 'Level Solved!' },
    { star: true, text: 'Time' },
    { star: false, text: '# of Gates' },
])

const paintTimer = () => {
    let userTimeStr = timer.getElapsedTimeStr();
    let timeLimitStr = level.timeLimit ? timer.getElapsedTimeStr(level.timeLimit) : '∞';
    let timerDiv = document.querySelector('.level-timer');
    let newText = `${userTimeStr} / ${timeLimitStr}`;
    if (timerDiv.innerText == newText) return;
    timerDiv.innerText = `${userTimeStr} / ${timeLimitStr}`;
}


const continueTimerOnUpdate = () => {
    let userModifyEvents = [
        'GATE_CREATED',
        'WIRE_CREATED',
        'GATE_REMOVED',
        'WIRE_REMOVED',
        'CANVAS_GATE_MOVE_START'
    ];
    logicCanvas.eventManager.onceMulti(userModifyEvents, () => {
        timer.start();
    })
}

onMounted(async () => {
    if (!level) return;

    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + `#play?${level.id}`;
    window.history.pushState({}, '', newUrl);

    if (!level.hideCanvas) {
        let targetDiv = document.querySelector('.logic-canvas-here');
        let world = new World();
        logicCanvas = new LogicCanvas(world, targetDiv);
        logicCanvas.startVisualTick();
        logicCanvas.startWorldTick(20);
        logicCanvas.world.enableAutoSleep();

        logicCanvas.clear();
        level.inputs?.forEach(input => {
            logicCanvas.createInput().setLabel(input);
        });
        level.outputs?.forEach(output => {
            logicCanvas.createOutput().setLabel(output);
        });

        paintTimerInterval = setInterval(paintTimer, 100);

        populateGateDeck(logicCanvas, level.availableGates || [
            'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'
        ]);

        const el = document.querySelector(".logic-canvas-container")
        const threshold = 0.99;
        const observer = new IntersectionObserver(
            ([e]) => {
                let state = e.intersectionRatio < threshold && e.boundingClientRect.y <= 10;
                e.target.classList.toggle("is-pinned", state)
            },
            { threshold: [threshold] }
        );
        observer.observe(el);
        intersectionObserver = observer;

        if (el.getBoundingClientRect().top <= 10) {
            el.classList.add("is-pinned");
        }

        $('[data-toggle="tooltip"]').tooltip();
    }

    if (level instanceof TruthTableLevel) {
        challengeApp = createApp(truthtableleveltemplate);
        challengeApp.provide('logicCanvas', logicCanvas);
        challengeApp.provide('truthTableLevelData', level);
        challengeApp.mount('#challenge');
    } else {
        challengeApp = createApp(level);
        challengeApp.provide('logicCanvas', logicCanvas);
        challengeApp.mount('#challenge');
    }

    if (level.onCreated) {
        setTimeout(() => {
            level.onCreated(logicCanvas);
        }, 200)
    }

    timer.start();

    let userAttemptCanvas = userData.getAttempt(level.id, 'canvas');
    let userAttemptTime = userData.getAttempt(level.id, 'time');
    if (userAttemptCanvas) {
        let savedInputCount = userAttemptCanvas.gates.filter(gate => gate.isWorldInput).length;
        let savedOutputCount = userAttemptCanvas.gates.filter(gate => gate.isWorldOutput).length;
        let currentInputCount = level.inputs.length;
        let currentOutputCount = level.outputs.length;
        if (savedInputCount != currentInputCount) return;
        if (savedOutputCount != currentOutputCount) return;
        setTimeout(() => {
            logicCanvas.load(userAttemptCanvas);
            level.inputs?.forEach((input, i) => {
                logicCanvas.world.inputs[i].setLabel(input);
            });
            level.outputs?.forEach((output, i) => {
                logicCanvas.world.outputs[i].setLabel(output);
            });
            timer.set(userAttemptTime);
            timer.pause();
            continueTimerOnUpdate();
        }, 500)
    }

    await sleep(500);
    $("html, body").animate({
        scrollTop: $("#challenge").offset().top - 350
    }, 100);
})

onBeforeUnmount(() => {
    $("#reviewPopup").modal('hide');
    clearInterval(paintTimerInterval);
    intersectionObserver?.disconnect();
    logicCanvas?.remove();
    console.log('logic canvas removed')
    challengeApp?.unmount();
    modal?.hide();
})

let undoState = null;
const handleUndo = async () => {
    if (!undoState) return;
    logicCanvas.load(undoState);
    timer.set(undoState.timeElapsed);
    undoState = null;
    let undobtn = document.querySelector('.undo-btn');
    undobtn.style.display = 'none';
}

const handleClear = async (e) => {
    let clearbtn = document.querySelector('.clear-btn');
    let undobtn = document.querySelector('.undo-btn');
    clearbtn.disabled = true;

    undoState = logicCanvas.export();
    undoState.timeElapsed = timer.getElapsedTime();
    handleRestart();
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

const onSubmit = async () => {
    let ref = test.value._vnode.component.exposed;
    timer.pause();
    let solved = await ref.onSubmit();
    if (solved) {
        resultModalData.value[0].star = false;
        resultModalData.value[1].star = false;
        resultModalData.value[2].star = false;

        let timeUser = timer.getElapsedTime();
        let timeUserStr = timer.getElapsedTimeStr();
        let timeLimitStr = level.timeLimit ? timer.getElapsedTimeStr(level.timeLimit) : '∞';
        resultModalData.value[1].text = `Time: ${timeUserStr} / ${timeLimitStr}`;
        let timeStar = level.timeLimit ? timeUser <= level.timeLimit : true;

        let gateCount = logicCanvas.world.nonIOGates.length;
        let gateLimit = level.maxGateCount == undefined ? "∞" : level.maxGateCount;
        resultModalData.value[2].text = `# of Gates: ${gateCount} / ${gateLimit}`;
        let gateStar = level.maxGateCount == undefined ? true : gateCount <= level.maxGateCount;

        userData.setAttempt(level.id, "stars", [true, timeStar, gateStar]);
        userData.setAttempt(level.id, "time", timeUser);
        userData.setAttempt(level.id, "canvas", logicCanvas.export());
        userData.setAttempt(level.id, "animate_world_select", true);

        continueTimerOnUpdate();

        $("#reviewPopup").modal('show');
        await sleep(200);
        resultModalData.value[0].star = true;
        await sleep(200);
        resultModalData.value[1].star = timeStar;
        await sleep(200);
        resultModalData.value[2].star = gateStar;
    } else {
        timer.start();
    }
}

const handleRestart = () => {
    $("#reviewPopup").modal('hide');
    logicCanvas.world.clearNonIO();
    timer.reset();
    timer.start();
}

const handleNextLevel = async () => {
    let nextLevel = level.next;
    mountApp(WorldSelection, {
        currentLevelID: level?.id,
        nextLevelID: nextLevel?.id
    });
    await sleep(2000)
    mountApp(Play, nextLevel?.id);
    $("html, body").animate({ scrollTop: 0 }, 100);
}

const debugExport = () => {
    if ($('#export-textarea').length) {
        $('#export-textarea').remove();
        return;
    }

    console.log('exporting canvas')
    let data = logicCanvas.exportAsStr();
    let textArea = document.createElement('textarea');
    textArea.id = 'export-textarea';
    textArea.value = data;
    textArea.style.position = 'fixed';
    textArea.style.width = '90%';
    textArea.style.height = '90%';
    textArea.style.zIndex = 1000;
    textArea.style.top = '5%';
    textArea.style.left = '5%';
    document.body.appendChild(textArea);
    textArea.select();
}

</script>

<template>
    <button @click="debugExport" style="opacity: 0.1;"
        class="position-fixed bottom-0 start-50 m-3 translate-middle-x z-3">Export Canvas</button>
    <div class="app-container">
        <img class="logo" src="/logowhite.png" />
        <div class="back-button">
            <button class="btn btn-outline-secondary" @click="handleBack()">Back</button>
        </div>
        <div class="app-outer">
            <h1 class="w-100 text-center">{{ level?.world?.name }} - {{ level?.name }}</h1>
            <div class="app-inner">
                <div class="d-flex justify-content-center m-1 logic-canvas-container">
                    <div class="logic-canvas-scale">
                        <div class="logic-canvas-here">
                            <div class="level-timer"></div>
                            <img src="@/assets/info-circle.svg"
                                class="canvas-info-icon position-absolute top-0 end-0 m-3 z-3" alt="info" />
                            <div class="canvas-info-tooltip position-absolute top-50 start-50 translate-middle">
                                <p><b>Adding a Gate:</b> Click or tap on a gate in the gate deck to add it to the
                                    canvas. Alternatively, drag the gate from the deck onto the canvas.</p>
                                <div class="logic-canvas-and-demo"></div>
                                <p><b>Removing a Gate:</b> Right-click on the gate or drag it outside the canvas to
                                    remove it.</p>
                                <p><b>Moving a Gate:</b> Drag the gate to reposition it on the canvas.</p>
                                <p><b>Adding or Removing a Wire:</b> Click or tap on a terminal of one gate, then on the
                                    terminal of another gate. You can also drag one terminal to another to connect or
                                    disconnect them.</p>
                            </div>
                        </div>
                    </div>
                    <div class="logic-gate-deck">
                        <div class="d-flex deck-btns flex-column justify-content-around">
                            <button class="btn btn-secondary clear-btn m-1" @click.prevent="handleClear">Clear</button>
                            <button class="btn btn-secondary undo-btn m-1" @click.prevent="handleUndo">Undo</button>
                        </div>
                    </div>
                    <button v-if="!level?.hideSubmit" class="btn btn-primary mt-0 mb-2" id="submit-btn"
                        @click="onSubmit">Submit</button>
                </div>

                <div class="challenge-container">
                    <h2>Challenge:</h2>
                    <div id="challenge" ref="test"></div>
                    <!-- <div class="testdummy"></div> -->
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
                    <div class="modal-body d-flex justify-content-around">
                        <div v-for="modal in resultModalData" class="d-flex flex-column align-items-center">
                            <img v-if="modal.star" src="../assets/star-fill.svg" alt="star"
                                class="star result-star result-star-fill" />
                            <img v-else src="../assets/star.svg" alt="star" class="star result-star" />
                            <p class="mt-3">{{ modal.text }}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="handleBack">World Selection</button>
                        <button type="button" class="btn btn-primary" @click="handleRestart">Restart</button>
                        <button type="button" class="btn btn-primary" @click="handleNextLevel">Next Level</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
:global(.tooltip) {
    --bs-tooltip-zindex: 1 !important;
}

.app-container {
    position: relative;
    width: 100%;
    max-width: 1800px;
    /* max-height: 100vh; */
    padding: 1em;
    padding-top: 0%;
    color: "#ccc";
}

.level-timer {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}

.canvas-info-icon {
    width: 1.5em;
    height: 1.5em;
    cursor: pointer;
}

.result-star {
    width: 3em;
    height: 3em;
}

@keyframes stamp {
    0% {
        transform: scale(2);
    }

    100% {
        transform: scale(1);
    }
}

.result-star-fill {
    animation: stamp 1s;
}

.canvas-info-tooltip {
    width: 90%;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 0.5em;
    border: 1px solid #888;
    padding: 0.5em;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s;
    z-index: 3000;
}

.canvas-info-icon:hover+.canvas-info-tooltip {
    opacity: 1;
}

.testdummy {
    height: 1000px;
    width: 300px;
    border: 1px solid red;
}

.back-button {
    position: absolute;
    top: 0;
    left: 0;
    padding: 1em;
    z-index: 100;
}

.logo {
    position: relative;
    display: block;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
}

/* @media (min-width: 600px) {
    @keyframes logo-anim {
        0% {
            width: 300px;
        }

        100% {
            width: 200px;
        }        
    }

    .logo {
        width: 200px;
        animation: logo-anim 1s;
    }
} */


.logic-canvas-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.logic-canvas-here {
    display: block;
    width: 370px;
    height: 370px;
    border-radius: 2em;
    overflow: hidden;
    z-index: 100;
}

:global(.logic-gate-deck) {
    /* height: 70%; */
    gap: 0.3em;
    padding: 0.5em;
    background-color: rgba(100, 100, 100, 0.2);
    border-radius: 1em;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    z-index: 10;
    margin: 1em;
    transform: scale(0.7, 0.7);
    /* transform-origin: 50% 0%;
    height: calc(70%); */
}

:global(.gate-deck-item-scale) {}

:global(.gate-deck-item-container) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0em;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 1em;
}

:global(.gate-deck-item-title) {
    display: block;
    font-size: 1em;
}

:global(.gate-deck-item) {}

.undo-btn {
    display: none;
}

.deck-btns {
    order: 1;
}

.challenge-container {
    padding: 1em;
    border: 1px solid #111;
    z-index: 1;
}

@media (min-width: 450px) {
    .logic-canvas-here {
        width: 400px;
        height: 400px;
    }
}

@media (min-width: 700px) {
    .logic-canvas-here {
        width: 600px;
        height: 500px;
    }
}
</style>

<style scoped>
@media screen and (max-width: 500px) {
    .app-container {
        margin-bottom: 10em;
    }

    .logic-canvas-container {
        position: sticky;
        top: calc(400px * -0.3);
    }

    .logic-gate-deck {
        width: calc(100%/0.7);
        transition: opacity 0.5s, transform 0.5s, height 0.5s;
    }

    .logic-canvas-scale {
        transition: transform 0.5s;
    }

    .logic-canvas-here {
        transition: background-color 0.5s;
    }

    #submit-btn {
        transition: transform 0.5s;
    }


    .is-pinned {
        z-index: 2 !important;
        background: none;
        pointer-events: none;
    }

    .is-pinned .logic-canvas-scale {
        transform: scale(0.7, 0.7);
        transform-origin: 50% 100%;
    }

    .is-pinned .logic-canvas-here {
        border: 1px solid #666;
        z-index: 1004 !important;
        background-color: rgba(50, 50, 50, 0.9);
        pointer-events: auto;
    }

    .is-pinned .logic-gate-deck {
        transform: translateY(-200px) scale(0.2, 0.2);
        opacity: 0;
        pointer-events: none;
        order: 2;
    }

    .is-pinned #submit-btn {
        transform: translateY(-20px);
        pointer-events: auto;
        order: 1;
        z-index: 1005;
    }

    .challenge-container {
        transition: transform 0.5s;
    }

    /* .is-pinned ~ .challenge-container {
        transform: translateY(-px);
    } */
}
</style>

<style scoped>
.app-outer {
    border: 1px solid #666;
    border-radius: 2em;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 1em;
}

.app-inner {
    display: grid;
    /* grid-template-columns: 1fr; */
    max-width: none;
    width: 100%;
    margin: 0;
    padding: 0;
    gap: 2em;
    font-weight: normal;
}

@media (min-width: 1400px) {
    .app-inner {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .logic-canvas-container {
        order: 0;
    }

    .challenge-container {
        order: 1;
        overflow: auto;
        height: 100vh;
        min-height: 700px;
        max-height: calc(100vh - 350px);
    }
}
</style>