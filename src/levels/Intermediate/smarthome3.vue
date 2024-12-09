<script>
import { setCallerArgs, getCallerArgs, mapRange } from '@/libs/utils';
import { inject, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import smarthomevitual from '@/components/smarthomevitual.vue';

const data = {
    name: 'Smart Home 3',
    description: 'Override Mode - Add a switch to ensure the light stays on continuously when desired.',
    availableGates: ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'],
    hideSubmit: false,
    timeLimit: 60,
    maxGateCount: 4
};

export default {
    ...data,
    data() {
        return { ...data };
    }
}

</script>
<script setup>

let logicCanvas = inject('logicCanvas');
let world = logicCanvas.world;
let smvitual = useTemplateRef('smvitual');
let inputcb, sim;

onMounted(async () => {
    sim = smvitual.value;
    sim.addMotionSensor(10, 10); // M1
    sim.addMotionSensor(-10, 10); // M2
    sim.addMotionSensor(-10, -10); // M3
    sim.addMotionSensor(10, -10); // M4

    logicCanvas.createInput().setLabel('M1');
    logicCanvas.createInput().setLabel('M2');
    logicCanvas.createInput().setLabel('M3');
    logicCanvas.createInput().setLabel('M4');
    logicCanvas.createInput().setLabel('S');
    logicCanvas.createOutput().setLabel('Light');

    setTimeout(() => {
        inputcb = sim.addLinkedSwitch("S", world.inputs[4].out(0));
        sim.linkLight(world.outputs[0].in(0));
        ['M1', 'M2', 'M3', 'M4', 'S'].forEach((label, i) => {
            logicCanvas.world.gates[i].setLabel(label);
        });
    }, 1000);
})

onBeforeUnmount(() => {
    sim.personPrompt();
})


const onSubmit = async () => {
    sim.personPrompt();
    $('#submit-btn').prop('disabled', true);
    let passed = true;
    let message;

    const pathFunc = (p)=>{
        if(p < 0.25){
            return [0.5, mapRange(p, 0, 0.25, 0.2, 0.8)];
        }else if(p < 0.5){
            return [0.5, mapRange(p, 0.25, 0.5, 0.8, 0.8)];
        }else{
            p = mapRange(p, 0.5, 1, 0, 1);
            return [
                Math.sin(p * Math.PI * 2)*0.4 + 0.5,
                Math.cos(p * Math.PI * 2)*0.4 + 0.5
            ]
        }
    }

    const switchCombination = [
        [false],
        [true],
    ];

    const referenceFunc = (inputs) => {
        let [M1, M2, M3, M4, S] = inputs;
        let motionSensors = [M1, M2, M3, M4];
        let expectedOutput = S || (motionSensors.some((s) => s));
        return expectedOutput;
    }

    for(let i = 0; i < switchCombination.length; i++){
        let [S] = switchCombination[i];
        await smvitual.value.personCycleTest((data) => {
            let motionSensors = data.distances.map((d, i) => {
                return d < 450 / 2;
            });
            let circuitOutput = world.evaluateSync([...motionSensors, S])[0];
            let expectedOutput = referenceFunc([...motionSensors, S]);
            if (circuitOutput != expectedOutput) {
                passed = false;
                message = `Hmm... It seems like there's an issue with the system. The light should ${expectedOutput ? 'turn on' : 'stay off'
                    }.${data.enoughMovement?"":" I was sitting still."} Can you double-check your configuration?`;
                return true;
            }
        }, pathFunc)
        if(!passed) break;
    }

    if(passed){
        sim.personPrompt("Great job! The system is now working perfectly. Thank you for your help!");
    }else{
        sim.personPrompt(message);
    }

    $('#submit-btn').prop('disabled', false);
    return passed;
}

defineExpose({
    onSubmit,
})

</script>

<template>
    <div class="challenge">
        <div class="mobile-scale">
            <smarthomevitual ref="smvitual" />
        </div>
        <div class="story">
            <p>
                The homeowner has noticed an issue with their smart lighting system: the light sometimes turns off while they are sitting still in the living room because the motion sensors does not detect movement. To address this, they’ve installed a new switch labeled S.
            </p>
            <p>
                Your task is to update the circuit so that the light behaves as follows:
            </p>
            <ul>
                <li>If switch S is on, the light stays on continuously, regardless of motion.</li>
                <li>If switch S is off, the light only turns on when the motion sensors detects movement.</li>
            </ul>
            <p>
                Design and test the system to ensure it meets these requirements!
            </p>
        </div>
    </div>
</template>

<style scoped>
.story {
    margin-top: 20px;
    font-size: 1.2em;
}

@media screen and (max-width: 500px) {
    .mobile-scale {
        display: flex;
        width: 100%;
        height: calc(400px * 0.7);
        /* transform-origin: 0 0; */
        transform: scale(0.7);
        justify-content: center;
        align-items: center;
    }
}
</style>