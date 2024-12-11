<script>
import { setCallerArgs, getCallerArgs } from '@/libs/utils';
import { inject, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import smarthomevitual from '@/components/smarthomevitual.vue';

const data = {
    name: 'Smart Home Dev',
    description: 'For Testing Smart Home Levels',
    availableGates: ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'],
    hideSubmit: false
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
let smvitual = useTemplateRef('smvitual');

const onTerminalStateChanged = (terminal) => {
    let world = logicCanvas.world;
    if (terminal == world.outputs[0].in(0)) {
        if (terminal.getState()) {
            smvitual.value.lightOn();
        } else {
            smvitual.value.lightOff();
        }
    }
}

// smvitual.personCycleTest()
onMounted(async () => {
    // requestAnimationFrame(()=>{})
    let sim = smvitual.value;
    sim.addMotionSensor(10, 10);
    // sim.addMotionSensor(-10, 10);
    sim.addMotionSensor(10, -10);
    sim.addSwitch("Test1");
    sim.addSwitch("Test2");


    logicCanvas.createInput().setLabel('M1');
    logicCanvas.createInput().setLabel('M2');
    logicCanvas.createOutput().setLabel('Light');
    logicCanvas.createGate('AND', 100, 100);

    logicCanvas.eventManager.subscribe('TERMINAL_STATE_CHANGED', onTerminalStateChanged);
})

onBeforeUnmount(()=>{
    logicCanvas.eventManager.unsubscribe('TERMINAL_STATE_CHANGED', onTerminalStateChanged);
})


const onSubmit = async () => {
    $('#submit-btn').prop('disabled', true);
    await smvitual.value.personCycleTest((data) => {
        data.distances.forEach((d, i) => {
            if (d < 450 / 2) {
                logicCanvas.world.inputs[i].out(0).setState(true);
            } else {
                logicCanvas.world.inputs[i].out(0).setState(false);
            }
        })
    })
    $('#submit-btn').prop('disabled', false);
}

defineExpose({
    onSubmit,
})

</script>

<template>
    <div class="challenge">
        <p class="challenge-description">Description</p>

        <div class="mobile-scale">
            <smarthomevitual ref="smvitual" />
        </div>
    </div>
</template>

<style scoped>
@media screen and (max-width: 500px) {
    .mobile-scale {
        width: calc(400px * 0.7);
        transform-origin: 0 0;
        transform: scale(0.7);
    }
}
</style>