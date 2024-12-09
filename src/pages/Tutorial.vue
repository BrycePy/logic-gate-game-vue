<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import { h, onBeforeUnmount, onMounted } from 'vue';
import { mountApp, getCallerArgs, setCallerArgs, sleep, Throttle } from '../libs/utils';
import WorldSelection from './WorldSelection.vue';
import { onBrowserBack } from '@/libs/utils';
import { LogicCanvas } from '@/libs/logicgate_front';
import { World } from '@/libs/logicgate_back';
import { hintCursor } from '@/main';
import { FundamentalGate } from '@/libs/logicgate_back';
import { populateGateDeck } from './Play.vue';

const handleBack = () => {
    console.log('back')
    hintCursor.clear();
    mountApp(WorldSelection);
}

onBrowserBack(handleBack)


let logicCanvases = [];
let highlightUpdateInterval = null;
let in1Tracker = null;
let in2Tracker = null;
onMounted(async () => {
    console.log('mounted')
    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + `#tutorial`;
    window.history.pushState({}, '', newUrl);

    let gateTypes = ['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR', 'XNOR'];
    for (let gateType of gateTypes) {
        let demoDiv = document.querySelector(`.${gateType.toLowerCase()}-demo`);
        let world = new World();
        let logicCanvas = new LogicCanvas(world, demoDiv, null, false);
        logicCanvases.push(logicCanvas);
        logicCanvas.startVisualTick();
        logicCanvas.startWorldTick(10);
        logicCanvas.indicatorSize = 5;
        logicCanvas.world.enableAutoSleep()

        let functionSpec = FundamentalGate[gateType].functionSpec;
        console.log(functionSpec);

        for (let i = 0; i < functionSpec.inputCount; i++) {
            logicCanvas.createInput().setLabel(['A', 'B', 'C', 'D'][i]);
        }

        logicCanvas.createOutput().setLabel('OUT');

        let gate = logicCanvas.createGate(gateType);

        for (let i = 0; i < functionSpec.inputCount; i++) {
            let worldInput = logicCanvas.world.in[i];
            logicCanvas.world.makeConnection(worldInput.out(0));
            logicCanvas.world.makeConnection(gate.in(i));
        }

        let worldOutput = logicCanvas.world.out[0];
        logicCanvas.world.makeConnection(gate.out(0));
        logicCanvas.world.makeConnection(worldOutput.in(0));
    }

    {
        let logicCanvas = logicCanvases[0];
        hintCursor.clear();
        hintCursor.setCanvas(logicCanvas);

        in1Tracker = setInterval(() => {
            let rect = logicCanvas.world.in[0].domElement.getBoundingClientRect();
            if (rect.y + rect.height < 0) {
                clearInterval(in1Tracker);
                hintCursor.skip();
            }
        }, 100)
        in2Tracker = setInterval(() => {
            let rect = logicCanvas.world.in[1].domElement.getBoundingClientRect();
            if (rect.y + rect.height < 0) {
                clearInterval(in2Tracker);
                hintCursor.skip();
            }
        }, 100)

        await hintCursor.toggleInput(logicCanvas.world.in[0]);
        clearInterval(in1Tracker);
        await hintCursor.toggleInput(logicCanvas.world.in[1]);
        clearInterval(in2Tracker);
    }

    {
        let mainLogicCanvasDiv = document.querySelector('.main-logic-canvas');
        let world = new World();
        let logicCanvas = new LogicCanvas(world, mainLogicCanvasDiv);
        logicCanvases.push(logicCanvas);
        logicCanvas.startVisualTick();
        logicCanvas.startWorldTick(10);

        logicCanvas.createInput().setLabel('A');
        logicCanvas.createInput().setLabel('B');
        logicCanvas.createInput().setLabel('C');
        logicCanvas.createOutput().setLabel('OUT');

        // logicCanvas.

        populateGateDeck(logicCanvas, ['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR', 'XNOR']);

        let mechAddDiv = document.querySelector('.mech-add');
        let mechRemoveDiv = document.querySelector('.mech-remove');
        let mechMoveDiv = document.querySelector('.mech-move');
        let mechConnectDiv = document.querySelector('.mech-conneect');
        let mechToggleDiv = document.querySelector('.mech-toggle');
        let mechCompleteDiv = document.querySelector('.mech-complete-text');

        let target = null;
        let throttle = new Throttle(100);
        const updateHighlight = () => {
            throttle.run(() => {
                let highlightDiv = document.querySelector('.mech-current-step');
                if (target) {
                    let offset = $(target).offset();
                    $(highlightDiv).offset(offset);
                    highlightDiv.style.display = 'block';
                    highlightDiv.style.width = $(target).outerWidth() + 'px';
                    highlightDiv.style.height = $(target).outerHeight() + 'px';
                } else {
                    highlightDiv.style.display = 'none';
                }
            })
        }

        const highlight = (targetDiv) => {
            if (target) {
                target.classList.add('mech-complete');
            }
            target = targetDiv;
            updateHighlight();
        }

        highlightUpdateInterval = setInterval(updateHighlight, 100);

        hintCursor.setCanvas(logicCanvas);
        highlight(mechRemoveDiv);
        let gate = logicCanvas.createGate('AND');
        await hintCursor.removeGate(gate);

        highlight(mechAddDiv);
        gate = await hintCursor.addGate('AND');
        gate._removeable = false;

        await sleep(100);
        setTimeout(async () => {
            hintCursor.skip();
        }, 100);
        await hintCursor.moveGate(gate, 0.5, 0.8);

        highlight(mechMoveDiv);
        await hintCursor.moveGate(gate, 0.33, 0.33);

        highlight(mechConnectDiv);
        await hintCursor.addWire(logicCanvas.world.in[0].out(0), gate.in(0));
        await hintCursor.addWire(logicCanvas.world.in[1].out(0), gate.in(1));
        await hintCursor.addWire(gate.out(0), logicCanvas.world.out[0].in(0));

        highlight(mechToggleDiv);
        await hintCursor.toggleInput(logicCanvas.world.in[0]);
        await hintCursor.toggleInput(logicCanvas.world.in[1]);

        highlight(mechCompleteDiv);
        mechCompleteDiv.style.opacity = 1;
    }

})

onBeforeUnmount(() => {
    clearInterval(highlightUpdateInterval);
    clearInterval(in1Tracker);
    clearInterval(in2Tracker);
    logicCanvases.forEach(logicCanvas => logicCanvas.remove());
})

</script>

<template>
    <div class="app-container">
        <img class="logo" src="/logowhite.png" />
        <div class="back-button">
            <button class="btn btn-outline-secondary" @click="handleBack()">Back</button>
        </div>
        <div class="app-outer">
            <div class="app-inner">
                <div class="challenge">
                    <h1>What is a Logic Gate?</h1>
                    <p>
                        A <strong>logic gate</strong> is a fundamental building block of digital circuits. It is an
                        electronic
                        device or circuit
                        that performs a basic logical operation on one or more input signals and produces a single
                        output signal.
                        Logic gates are based on <strong>Boolean algebra</strong>, a mathematical system of logic used
                        in computing
                        and electronics.
                    </p>

                    <h2>Common Types of Logic Gates:</h2>
                    <ul>
                        <li><strong>AND Gate:</strong> Outputs <code>1</code> (true) only if <em>all</em> inputs are
                            <code>1</code>.
                        </li>
                        <div class="and-demo gate-demo"></div>
                        <li><strong>OR Gate:</strong> Outputs <code>1</code> if <em>at least one</em> input is
                            <code>1</code>.
                        </li>
                        <div class="or-demo gate-demo"></div>
                        <li><strong>XOR Gate:</strong> Outputs <code>1</code> if <em>only one</em> of the inputs is
                            <code>1</code>.
                        </li>
                        <div class="xor-demo gate-demo"></div>
                        <li><strong>NOT Gate:</strong> Inverts the input signal </li>
                        <div class="not-demo gate-demo"></div>
                        <li><strong>NAND Gate:</strong> Outputs the opposite of an AND gate.</li>
                        <div class="nand-demo gate-demo"></div>
                        <li><strong>NOR Gate:</strong> Outputs the opposite of an OR gate.</li>
                        <div class="nor-demo gate-demo"></div>
                        <li><strong>XNOR Gate:</strong> Outputs the opposite of an XOR gate.</li>
                        <div class="xnor-demo gate-demo"></div>
                    </ul>

                    <h2>Why Are Logic Gates Important?</h2>
                    <ol>
                        <li>
                            <strong>Foundation of Digital Electronics:</strong>
                            <p>Logic gates are the basic components of digital circuits. They are used in designing
                                microprocessors,
                                memory devices, and control systems.</p>
                        </li>
                        <li>
                            <strong>Decision Making:</strong>
                            <p>Logic gates enable devices to make logical decisions by processing binary data (1s and
                                0s).</p>
                        </li>
                        <li>
                            <strong>Binary Operations:</strong>
                            <p>Since computers work in binary (0s and 1s), logic gates are essential for enabling
                                computers to
                                execute instructions.</p>
                        </li>
                    </ol>

                    <p>
                        Logic gates serve as the "brain" of digital systems, making them a cornerstone of modern
                        technology.
                    </p>

                    <h2>Game Mechanics</h2>
                    <div class="main-logic-canvas"></div>
                    <div class="logic-gate-deck"></div>
                    <div class="mech-current-step">
                        <div class="mech-current-step-highlighter"></div>
                        <button class="btn btn-primary skip-btn" @click="hintCursor.skip()">Skip</button>
                    </div>
                    <p class="mech-remove mech-demo"><b>Remove Gate:</b> Right-click or drag the gate outside the canvas
                    </p>
                    <p class="mech-add mech-demo"><b>Add Gate:</b> Click / Tap the gate you want to add from the gate
                        deck. You can also drag the
                        gate from the gate deck</p>
                    <p class="mech-move mech-demo"><b>Move Gate:</b> Drag the gate.</p>
                    <p class="mech-conneect mech-demo"><b>Connect Gates:</b> Click / Tap on the terminal of one gate,
                        then on the terminal
                        of another gate. Or drag one of the terminal to another terminal</p>
                    <p class="mech-toggle mech-demo"><b>Toggle Input:</b> Click / Tap on the input gate to toggle it on
                        or off</p>

                    <p class="mech-complete-text mech-demo"><b>Congratulations!</b> You've completed the tutorial. Feel
                        free to experiment with the circuit now.</p>

                    <button class="btn btn-secondary" @click="handleBack()">Go Back To World Selector</button>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.gate-demo {
    width: 300px;
    height: 160px;
    border-radius: 1em;
    overflow: hidden;
    margin-bottom: 1em;
}

.main-logic-canvas {
    width: 100%;
    height: 300px;
    border-radius: 1em;
    overflow: hidden;
}

.challenge {
    max-width: 800px;
    font-size: medium;
    padding: 0.5em;
}

.mech-demo {
    position: relative;
    z-index: 200;
    padding: 0.2em;
    transition: color 0.5s, font-size 0.5s;
}

.mech-complete {
    font-size: 0.7em;
    color: rgb(100, 200, 100);
}

.mech-current-step {
    position: absolute;
    transition: top 0.5s, left 0.5s, width 0.5s, height 0.5s;
}

.skip-btn {
    position: absolute;
    z-index: 1000;
    opacity: 0.5;
    right: 0;
    top: -40px;
}

.mech-current-step-highlighter {
    position: absolute;
    width: calc(100% + 1em);
    height: calc(100% + 0.5em);
    left: -0.5em;
    top: -0.25em;
    border-radius: 1em;
    background-color: rgba(100, 100, 50, 0.3);
}

.mech-complete-text {
    opacity: 0;
    transition: opacity 0.5s;
}

@media screen and (min-width: 500px) {
    .challenge {
        font-size: large;
    }
}
</style>

<style scoped>
.app-container {
    position: relative;
    width: 100%;
    max-width: 800px;
    padding: 1em;
    padding-top: 0%;
    color: "#ccc";
    padding-bottom: 10em;
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
    width: 300px;
    margin-left: auto;
    margin-right: auto;
}

.app-outer {
    border: 1px solid #666;
    border-radius: 2em;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 1em;
}

.app-inner {
    display: grid;
    grid-template-columns: 1fr;
    max-width: none;
    width: 100%;
    margin: 0;
    padding: 0;
    gap: 2em;
    font-weight: normal;
}

.gate-deck-item {
    display: inline-block;
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
    z-index: 10;
}

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
    font-size: 1.2em;
}
</style>