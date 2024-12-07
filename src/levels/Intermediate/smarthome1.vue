<script>
import { setCallerArgs, getCallerArgs } from '@/libs/utils';
import { onMounted, useTemplateRef } from 'vue';
import smarthomevitual from '@/components/smarthomevitual.vue';

const name = 'Smart Home 1';
const description = 'test';

export default {
    name,
    description,
    data() {
        return { name, description };
    }
}

</script>
<script setup>

let context = getCallerArgs();
let logicCanvas = context.logicCanvas;
// console.log(context);

let smvitual = useTemplateRef('smvitual');

// smvitual.personCycleTest()
onMounted(async () => {
    // requestAnimationFrame(()=>{})
    let sim = smvitual.value;
    sim.addMotionSensor(10, 10);
    sim.addMotionSensor(-10, 10);
    sim.addSwitch("Motion");
    sim.addSwitch("Light");


    logicCanvas.createInput();
    logicCanvas.createInput();
    logicCanvas.createInput();
    logicCanvas.createOutput();
    logicCanvas.createOutput();
    logicCanvas.createGate('AND', 100, 100);

})


const onSubmit = async()=>{
    $('#submit-btn').prop('disabled', true);
    await smvitual.value.personCycleTest((data)=>{
        // console.log('callback', data);
        if (data.distances.some(d => d < 450/2)) {
            smvitual.value.lightOn();
        } else {
            smvitual.value.lightOff();
        }
    })
    $('#submit-btn').prop('disabled', false);
}

</script>

<template>
    <div class="challenge">
        <h1 class="challenge-title">Challenge {{ name }}</h1>
        <p class="challenge-description">Description</p>

        <div class="mobile-scale">
            <smarthomevitual ref="smvitual"/>
        </div>

        <div class="challenge-buttons">
            <button class="btn btn-primary">Reset</button>
            <button class="btn btn-primary" id="submit-btn" @click="onSubmit">Submit</button>
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