<script>
import { setCallerArgs, getCallerArgs, mapRange } from '@/libs/utils';
import { inject, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import smarthomevitual from '@/components/smarthomevitual.vue';

const data = {
    name: 'Smart Home 4',
    description: 'Movie Time Setup - Introduce a switch to deactivate motion sensors while maintaining an override for continuous light.',
    availableGates: ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'],
    hideSubmit: false,
    timeLimit: 120,
    maxGateCount: 5
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
    logicCanvas.createInput().setLabel('A');
    logicCanvas.createInput().setLabel('S');
    logicCanvas.createOutput().setLabel('Light');

    setTimeout(() => {
        inputcb = sim.addLinkedSwitch("A", world.inputs[4].out(0));
        inputcb = sim.addLinkedSwitch("S", world.inputs[5].out(0));
        sim.linkLight(world.outputs[0].in(0));
        ['M1', 'M2', 'M3', 'M4', 'A', 'S'].forEach((label, i) => {
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
        [false, false],
        [false, true],
        [true, false],
        [true, true]
    ];

    const referenceFunc = (inputs) => {
        let [M1, M2, M3, M4, A, S] = inputs;
        let motionSensors = [M1, M2, M3, M4];
        let expectedOutput = S || (motionSensors.some((s) => s) && A);
        return expectedOutput;
    }

    for (let i = 0; i < switchCombination.length; i++) {
        let [A, S] = switchCombination[i];
        await smvitual.value.personCycleTest((data) => {
            let motionSensors = data.distances.map((d, i) => {
                return d < 450 / 2;
            });
            let circuitOutput = world.evaluateSync([...motionSensors, A, S])[0];
            let expectedOutput = referenceFunc([...motionSensors, A, S]);
            if (circuitOutput != expectedOutput) {
                passed = false;
                message = `Hmm... It seems like there's an issue with the system.${data.enoughMotion?" I was moving.":" I was siting still."}${A?" Motion Sensing was active.":" Motion Sensing was deactivated."}${S?" The light switch was on..":" The light switch was off"} The light should ${expectedOutput ? 'turn on' : 'stay off'
                    }. Can you double-check your configuration?`;
                return true;
            }
        }, pathFunc)
        if (!passed) break;
    }

    if (passed) {
        sim.personPrompt("Great job! The system is now working perfectly. Thank you for your help!");
    } else {
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
            <p> The homeowner enjoys watching movies in their living room and needs a way to deactivate the motion
                sensors during movie time. To address this, they’ve installed a new switch labeled <b>A</b> (for
                activation). </p>
            <p> Your task is to configure the system so that it behaves as follows: </p>
            <ul>
                <li>If switch <b>S</b> is ON, the light will remain ON continuously, regardless of the state of the
                    motion sensors or switch <b>A</b>.</li>
                <li>If switch <b>S</b> is OFF and switch <b>A</b> is ON, the motion sensors (M1, M2, M3, M4) will
                    control the light. The light should turn ON if any motion sensor detects motion and turn OFF only
                    when none of the sensors detect motion.</li>
                <li>If both switch <b>S</b> and switch <b>A</b> are OFF, the light will remain OFF, regardless of any
                    detected motion.</li>
            </ul>
            <p> Design and test the system to ensure it accommodates the homeowner's need for a distraction-free movie
                experience while preserving normal functionality in other scenarios! </p>
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