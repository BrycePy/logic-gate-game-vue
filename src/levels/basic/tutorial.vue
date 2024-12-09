<script>
import { inject, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import { hintCursor } from '@/main';
import { sleep } from '@/libs/utils';
import { LogicCanvas } from '@/libs/logicgate_front';
import { World } from '@/libs/logicgate_back';
import { FundamentalGate } from '@/libs/logicgate_back';

const data = {
    name: 'Tutorial',
    description: 'Learn the basics of logic gates and game mechanics',
    availableGates: ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'],
    hideSubmit: true,
    hideCanvas: true,
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
let textRef = useTemplateRef('textRef');

onMounted(async () => {
    hintCursor.clear();

    const text = async (t) => {
        textRef.value.innerText = t;
    }



    // await text(
    //     "Tap or click the AND button to place an AND gate on the canvas."
    // );
    // let addTest = await hintCursor.addGate("AND");
    // await text(
    //     "Right-click or drag the gate outside the canvas to remove it."
    // );
    // await hintCursor.removeGate(addTest);
    // await text("Next, add an OR gate to the canvas.");
    // let andGate = await hintCursor.addGate("AND");
    // await text("Drag the OR gate to the highlighted area to move it.");
    // await hintCursor.moveGate(andGate, 0.33, 0.3);
    // await text(
    //     "To connect gates, click or tap on the output terminal of one gate, then on the input terminal of another gate."
    // );
    // await hintCursor.addWire(in1.out(0), andGate.in(0));
    // await hintCursor.addWire(in2.out(0), andGate.in(1));
    // await hintCursor.addWire(andGate.out(0), out1.in(0));
    // await text("Click or tap on an input source to toggle it on or off.");
    // await hintCursor.toggleInput(in1);
    // await text("Add another OR gate to the canvas.");
    // let xorGate = await hintCursor.addGate("XOR");
    // await text("Move this OR gate to the highlighted area.");
    // await hintCursor.moveGate(xorGate, 0.33, 0.7);
    // await text("Connect the inputs to the new OR gate.");
    // await hintCursor.addWire(in3.out(0), xorGate.in(0));
    // await hintCursor.addWire(in4.out(0), xorGate.in(1));
    // await text(
    //     "To remove a connection, click or tap on both ends of the wire."
    // );
    // await hintCursor.removeWire(andGate.out(0), out1.in(0));
    // await text("Now add one more OR gate to complete the circuit.");
    // let orGate = await hintCursor.addGate("OR");
    // await text("Move the last OR gate to the highlighted area.");
    // await hintCursor.moveGate(orGate, 0.66, 0.5);
    // await text("Make the final connections.");
    // await hintCursor.addWire(andGate.out(0), orGate.in(0));
    // await hintCursor.addWire(xorGate.out(0), orGate.in(1));
    // await hintCursor.addWire(orGate.out(0), out1.in(0));
    // await logicCanvas.world.evaluate([1, 0, 0, 0]);
    // await text("Turn off M1. The light should go off.");
    // await hintCursor.toggleInput(in1);
    // await text(
    //     "At this point, if any of the inputs are active, the light should turn on. Lets try it out."
    // );
    // await hintCursor.toggleInput(in2);
    // await hintCursor.toggleInput(in4);
    // await hintCursor.toggleInput(in2);
    // await hintCursor.toggleInput(in4);
    // await text(
    //     "Congratulations! You've completed the tutorial. Feel free to experiment with the circuit now."
    // );
})

const onSkip = () => {
    hintCursor.skip();
}

onBeforeUnmount(() => {
    hintCursor.clear();
})

const onSubmit = () => {
    hintCursor.skip();
}

defineExpose({
    onSubmit,
})

</script>

<template>

</template>

<style scoped>
.gate-demo {
    width: 200px;
    height: 150px;
    border-radius: 1em;
    overflow: hidden;
}

.challenge {
    max-width: 800px;
}

</style>