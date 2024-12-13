<script>
import { inject, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import smarthomevitual from '@/components/smarthomevitual.vue';

const data = {
    name: 'Smart Home 1',
    description: 'Basic Motion Control - Set up two motion sensors to collaboratively automate the lighting system.',
    availableGates: ['NOT', 'AND', 'OR'],
    inputs: ['M1', 'M2'],
    outputs: ['Light'],
    hideSubmit: false,
    timeLimit: 60,
    maxGateCount: 1
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
    sim.addMotionSensor(-10, 10);

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

    await smvitual.value.personCycleTest((data) => {
        let motionSensors = data.distances.map((d, i) => {
            return d < 450 / 2;
        });
        let circuitOutput = world.evaluateSync([...motionSensors])[0];
        let expectedOutput = motionSensors.some((s) => s);
        if (circuitOutput != expectedOutput) {
            passed = false;
            message = `Hmm... It seems like there's an issue with the system. The light should ${expectedOutput ? 'turn on' : 'stay off'
                }. Can you double-check your configuration?`;
            return true;
        }
    })

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
            <p>
                Welcome to your first Smart Home Challenge! The homeowner has installed two motion sensors (M1 and M2)
                in their living room to automate their lighting system. They want the light to turn on automatically
                whenever motion is detected by either sensor and turn off when no motion is detected by both sensors.
            </p>
            <p>
                Your task is to configure the system so that the motion sensors (M1 and M2) work together to control the
                light:
            </p>
            <ul>
                <li>When M1 or M2 detects motion, the light should turn on.</li>
                <li>When neither M1 nor M2 detects motion, the light should turn off.</li>
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