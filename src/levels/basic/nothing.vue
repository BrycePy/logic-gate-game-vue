<script>
import { TruthTableLevel } from "../levelbase";
// import TestTemplate from "./testTemplate.vue";

const nothingLevel = new TruthTableLevel({
    name: "Nothing",
    description: "Just connect the input to the output",
    inputs: [
        "IN"
    ],
    outputs: [
        "OUT"
    ],
    availableGates: ["AND", "NOT"],
    truthTable: [
        {inputs: [0], outputs: [0]},
        {inputs: [1], outputs: [1]}
    ],
    maxGateCount: 0,
    timeLimit: 60,
    onCreated: (logicCanvas)=>{
        // let world = logicCanvas.world;
        // let in1 = world.inputs[0];
        // let out1 = world.outputs[0];
        // console.log(in1, out1);
        // world.makeConnection(in1.out(0))
        // world.makeConnection(out1.in(0))
    },
})

export default nothingLevel;
</script>

<template>
    <div>
        <h1>Test Template</h1>
    </div>
</template>