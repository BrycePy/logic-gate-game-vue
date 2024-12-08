<script>
import { setCallerArgs, getCallerArgs, mapRange } from '@/libs/utils';
import { inject, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import smarthomevitual from '@/components/smarthomevitual.vue';

const data = {
    name: 'Smart Home 1',
    description: 'Basic Motion Control - Set up a single motion sensor to automate the lighting system.',
    availableGates: ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'],
    hideSubmit: false,
    timeLimit: 60,
    maxGateCount: 0
}

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
    sim.addMotionSensor(10, 10);

    logicCanvas.createInput().setLabel('M1');
    logicCanvas.createOutput().setLabel('Light');

    setTimeout(() => {
        sim.linkLight(world.outputs[0].in(0));
        ['M1'].forEach((label, i) => {
            logicCanvas.world.gates[i].setLabel(label);
        });
    }, 1000);

})

onBeforeUnmount(()=>{
    sim.personPrompt();
})


const onSubmit = async () => {
    sim.personPrompt();
    $('#submit-btn').prop('disabled', true);
    let passed = true;
    let message;

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
    })

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
                Welcome to your first Smart Home Challenge! The homeowner has installed a single motion sensor (M1) in their living room to automate their lighting system. They want the light to turn on automatically whenever motion is detected and turn off when no motion is detected.
            </p>
            <p>
                Your task is to configure the system so that the motion sensor (M1) controls the light:
            </p>
            <ul>
                <li>When M1 detects motion, the light should turn on.</li>
                <li>When M1 stops detecting motion, the light should turn off.</li>
            </ul>
            <p>
                Set up and test the system to ensure it works as expected!
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