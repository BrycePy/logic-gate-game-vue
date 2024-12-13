<script>

</script>

<script setup>
import { onBrowserBack, sleep } from '@/libs/utils';
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { LogicCanvas } from '@/libs/logicgate_front';
import { World } from '@/libs/logicgate_back';
import { setTitle } from '@/main';
import WorldSelection from '@/pages/WorldSelection.vue';
import { mountApp } from '@/libs/utils';
import { populateGateDeck } from './Play.vue';

const handleBack = () => {
    console.log('back')
    $("html, body").animate({ scrollTop: 0 }, 10);
    mountApp(WorldSelection);
}


onBrowserBack(handleBack)


let logicCanvas;

const deleteCanvasWindow = (logicCanvas) => {
    let windowed = logicCanvas?.domElement?.classList.contains('logic-canvas-windowed');
    if (windowed) {
        logicCanvas.stopVisualTick();
        let domElement = logicCanvas.domElement;
        let parent = domElement.parentElement;
        $(parent).draggable('destroy');
        domElement.classList.remove('logic-canvas-windowed');
        parent.remove();
        return;
    }
}

const createCanvasWindow = (logicCanvas) => {
    let windowed = logicCanvas.domElement.classList.contains('logic-canvas-windowed');
    let appContainer = document.querySelector('.app-container');
    if (windowed) {
        let domElement = logicCanvas.domElement;
        let parent = domElement.parentElement;
        parent.remove();
        appContainer.appendChild(parent);
        return;
    }
    const template = `
            <div class="canvas-window-handle d-flex">
                <div class="canvas-window-title">Canvas Window</div>
                <label class="btn btn-primary btn-sm">
                    <input type="checkbox" class="minimize-cb">
                    <span>---</span>
                </label>
                <button class="btn btn-primary btn-sm close-btn">X</button>
            </div>
            <div class="logic-canvas-window-here"></div>
    `;
    let newDiv = document.createElement('div');
    newDiv.classList.add('canvas-window');
    newDiv.innerHTML = template;
    let logicCanvasWindow = newDiv.querySelector('.logic-canvas-window-here');
    logicCanvasWindow.replaceWith(logicCanvas.domElement);
    logicCanvas.domElement.style.width = "100%";
    logicCanvas.domElement.style.height = "100%";
    logicCanvas.domElement.classList.add('logic-canvas-windowed');
    logicCanvas.domElement.style.pointerEvents = 'auto';
    logicCanvas.domElement.classList.add('logic-canvas-window-here')
    logicCanvas.startVisualTick();
    appContainer.appendChild(newDiv);
    logicCanvas.updateCanvas();

    logicCanvas.eventManager.once("WORLD_PRE_REMOVE", () => {
        deleteCanvasWindow(logicCanvas);
    })

    let closeButton = newDiv.querySelector('.close-btn');
    closeButton.addEventListener('click', () => {
        deleteCanvasWindow(logicCanvas);
    }, { once: true });

    $(newDiv).draggable({
        handle: '.canvas-window-handle',
        containment: 'parent',
        start: (event, ui) => {
            console.log('start drag')
            $('.canvas-window').css('z-index', 9999);
            $(newDiv).css('z-index', 10000);
        },
    });

    return newDiv;
}

const linkedGateSetup = (linkedGate) => {
    let newWindowRef = { value: null };
    let otherWorld = linkedGate._linkedWorld;
    let otherLogicCanvas = otherWorld.parent;
    linkedGate.domElement.addEventListener('click', (event) => {
        let contextMenuDiv = document.querySelector('.linked-gate-context-menu');
        contextMenuDiv.style.top = `${event.clientY}px`;
        contextMenuDiv.style.left = `${event.clientX}px`;
        contextMenuDiv.classList.add('show');
        contextMenu.targetLogicCanvas = otherLogicCanvas;
        contextMenu.targetGate = linkedGate;
        contextMenu.newWindowRef = newWindowRef;
    })
    linkedGate.world.eventManager.once('GATE_PRE_REMOVE', (gate) => {
        deleteCanvasWindow(otherLogicCanvas);
    }, (g) => g === linkedGate);
    return linkedGate;
}

onMounted(async () => {
    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + `#sandbox`;
    window.history.pushState({}, '', newUrl);

    setTitle(`Sandbox`);

    let targetDiv = document.querySelector('.logic-canvas-here');
    let world = new World();
    logicCanvas = new LogicCanvas(world, targetDiv);
    logicCanvas.startVisualTick();
    logicCanvas.startWorldTick(60);
    logicCanvas.world.enableAutoSleep();

    logicCanvas.eventManager.subscribeBubble('CANVAS_WORLD_LINKED', (info) => {
        let gate = info.data;
        if (gate.funcSpec.name === 'WORLD') {
            // console.log("WORLD GATE LINKED", gate);
            linkedGateSetup(gate);
        }
    })

    logicCanvas.createInput();
    logicCanvas.createInput();
    logicCanvas.createInput();
    logicCanvas.createOutput();
    logicCanvas.createOutput();
    logicCanvas.createOutput();


    populateGateDeck(logicCanvas, [
        "NOT", "AND", "OR", "NAND", "NOR", "XOR", "XNOR"
    ], "sandbox-gate-deck");

    let buffer = document.querySelector('.hidden-logic-canvas-buffer');

    const createDummyCanvas = () => {
        let newDiv = document.createElement('div');
        newDiv.style.width = "100px";
        newDiv.style.height = "100px";
        buffer.appendChild(newDiv);

        let newWorld = new World();
        let newCanvas = new LogicCanvas(newWorld, newDiv);

        newCanvas.createInput();
        newCanvas.createInput();
        newCanvas.createOutput();
        newCanvas.createOutput();
        return newCanvas;
    }

    let dummyCanvas1 = createDummyCanvas();
    let dummyCanvas2 = createDummyCanvas();

    logicCanvas.linkWorld(dummyCanvas1.world);
    dummyCanvas1.linkWorld(dummyCanvas2.world);

    $(".linked-gate-context-menu").on('mouseleave', () => {
        $(".linked-gate-context-menu").removeClass('show');
    })
})

onBeforeUnmount(() => {
    logicCanvas.stopVisualTick();
    logicCanvas.stopWorldTick();
    logicCanvas.remove();
    console.log('sandbox destroyed')

    $.ui.ddmanager.current = null;
})

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

const onLoadCanvas = () => {
    logicCanvas.clear();
    let data = prompt('Paste exported data here');
    let buffer = document.querySelector('.hidden-logic-canvas-buffer');
    logicCanvas.load(data, buffer);
}

const contextMenu = {
    targetLogicCanvas: null,
    newWindowRef: null,
    targetGate: null,
    onDelete: () => {
        contextMenu.targetGate.remove();
        contextMenu.reset();
    },
    onSeeInside: () => {
        let newWindow = createCanvasWindow(contextMenu.targetLogicCanvas);
        contextMenu.newWindowRef.value = newWindow;
        contextMenu.reset();
    },
    onDuplicate: () => {
        let buffer = document.querySelector('.hidden-logic-canvas-buffer');
        let otherCanvas = contextMenu.targetLogicCanvas;
        let exportData = otherCanvas.export(true);
        logicCanvas.importAsGate(exportData, 0.5, 0.5, buffer);
        contextMenu.reset();
    },
    onCopy: () => {
        let otherCanvas = contextMenu.targetLogicCanvas;
        let exportData = otherCanvas.export(true);
        localStorage.setItem('copiedGate', exportData);
        contextMenu.reset();
    },
    reset: () => {
        $(".linked-gate-context-menu").removeClass('show');
        contextMenu.targetLogicCanvas = null;
        contextMenu.newWindowRef = null;
        contextMenu.targetGate = null;
    }
}

</script>

<template>
    <div class="wip-text">WIP</div>
    <button @click="debugExport" style="opacity: 0.1;"
        class="position-fixed bottom-0 start-50 m-3 translate-middle-x z-3">Export Canvas</button>
    <div class="app-container">
        <img class="logo" src="/logowhite.png" />
        <div class="back-button">
            <button class="btn btn-outline-secondary" @click="handleBack()">Back</button>
        </div>
        <div class="app-outer">
            <div class="logic-canvas-container">
                <div class="logic-canvas-here"></div>
                <div class="sandbox-gate-deck">
                    <div class="btn-container">
                        <div class="d-flex flex-column gap-1">
                            <button class="btn btn-primary">+ INPUT</button>
                            <button class="btn btn-primary">- INPUT</button>
                        </div>
                        <div class="d-flex flex-column gap-1">
                            <button class="btn btn-primary">+ OUTPUT</button>
                            <button class="btn btn-primary">- OUTPUT</button>
                        </div>
                        <button class="btn btn-primary">New Linked World</button>
                        <button class="btn btn-primary">Save</button>
                        <button class="btn btn-primary" @click="onLoadCanvas">Load</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="hidden-logic-canvas-buffer"></div>
    <div class="d-flex position-absolute flex-column gap-1 translate-middle linked-gate-context-menu">
        <button class="btn btn-primary" @click="contextMenu.onDelete">Delete</button>
        <button class="btn btn-primary" @click="contextMenu.onSeeInside">See Inside</button>
        <button class="btn btn-primary" @click="contextMenu.onDuplicate">Duplicate</button>
        <button class="btn btn-primary" @click="contextMenu.onCopy">Copy</button>
    </div>

</template>

<style scoped>
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

.logic-canvas-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0em;
    margin: 0em;
}

.logic-canvas-here {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 2em;
    overflow: hidden;
    z-index: 100;
}

.sandbox-gate-deck {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.1em;
}

.btn-container {
    order: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5em;
    flex-wrap: wrap;
}

.sandbox-gate-deck button {
    flex-grow: 0;
}

.hidden-logic-canvas-buffer {
    position: fixed;
    pointer-events: none;
    opacity: 0;
}
</style>

<style>
.linked-gate-context-menu {
    top: 10%;
    left: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 1em;
    border-radius: 1em;
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s;
}

.linked-gate-context-menu.show {
    opacity: 1;
    pointer-events: auto;
}

.canvas-window {
    position: fixed;
    top: 10%;
    right: 10%;
    width: 400px;
    height: 300px;
    background-color: rgba(0, 0, 0, 0);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    pointer-events: none;
}

.canvas-window-handle {
    width: 100%;
    background-color: blue;
    cursor: move;
    pointer-events: auto;
}

.canvas-window-title {
    flex-grow: 1;
    line-height: 2em;
    padding-left: 0.5em;
}

.minimize-cb {
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: auto;
}

.logic-canvas-window-here {
    width: 100%;
    flex-grow: 1;
    background-color: rgba(20, 20, 20, 0.7);
    transition: transform 0.5s;
    transform-origin: 50% 0%;
    pointer-events: auto;
}

.canvas-window:has(.minimize-cb:checked) .logic-canvas-window-here {
    transform: scale(1, 0);
}
</style>

<style scoped>
.app-container {
    position: relative;
    width: 100%;
    height: 100vh;
    padding: 1em;
    padding-top: 0%;
    color: "#ccc";
    display: flex;
    flex-direction: column;
}

.app-outer {
    border: 1px solid #666;
    border-radius: 2em;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 1em;
    flex-grow: 1;
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

.wip-text {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-20deg);
    font-size: 30vw;
    font-weight: bolder;
    opacity: 0.1;
    color: #ccc;
    z-index: 1000000;
    pointer-events: none;
}
</style>