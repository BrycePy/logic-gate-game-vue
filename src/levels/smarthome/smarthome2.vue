<script>
import { setCallerArgs, getCallerArgs, mapRange } from '@/libs/utils';
import { inject, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import smarthomevitual from '@/components/smarthomevitual.vue';

const data = {
    name: 'Smart Home 2',
    description: 'Comprehensive Coverage - Integrate multiple motion sensors for complete room coverage.',
    availableGates: ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'],
    inputs: ['M1', 'M2', 'M3', 'M4'],
    outputs: ['Light'],
    hideSubmit: false,
    timeLimit: 60,
    maxGateCount: 3
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
let sim;
let inputcb;

onMounted(async () => {
    sim = smvitual.value;
    sim.addMotionSensor(10, 10); // M1
    sim.addMotionSensor(-10, 10); // M2
    sim.addMotionSensor(-10, -10); // M3
    sim.addMotionSensor(10, -10); // M4

    // logicCanvas.createInput()
    // logicCanvas.createInput()
    // logicCanvas.createInput()
    // logicCanvas.createInput()
    // logicCanvas.createOutput()

    setTimeout(() => {
        sim.linkLight(world.outputs[0].in(0));
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
        if(p < 0.5){
            return [0.5, mapRange(p, 0, 0.5, 2, 0.8)];
        }else{
            p = mapRange(p, 0.5, 1, 0, 1);
            return [
                Math.sin(p * Math.PI * 2)*0.4 + 0.5,
                Math.cos(p * Math.PI * 2)*0.4 + 0.5
            ]
        }
    }

    await smvitual.value.personCycleTest((data) => {
        let motionSensors = data.distances.map((d, i) => {
            return d < 450 / 2;
        });
        let circuitOutput = world.evaluateSync([...motionSensors])[0];
        let expectedOutput = motionSensors.some((s) => s);
        if (circuitOutput != expectedOutput) {
            passed = false;
            message = `Hmm... It seems like there's an issue with the system. The light should ${
                expectedOutput ? 'turn on' : 'stay off'
            }. Can you double-check your configuration?`;
            return true;
        }
    }, pathFunc)

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
                In this challenge, the homeowner has expanded their living room's smart lighting system. The single motion sensor (M1) wasn't enough to cover the entire room, so they’ve installed four motion sensors (M1, M2, M3, and M4) to ensure complete coverage.
            </p>
            <p>
                Your task is to configure the system so that the light behaves as follows:
            </p>
            <ul>
                <li>The light should turn on if any one of the four motion sensors detects motion.</li>
                <li>The light should turn off only when none of the motion sensors detect motion.</li>
            </ul>
            <p>
                Design and test the system to ensure all sensors work together to control the light effectively!
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