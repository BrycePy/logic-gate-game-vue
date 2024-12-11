<script>
import { TruthTableLevel } from "../levelbase";
import { getCallerArgs } from "@/libs/utils";

const random2IN = new TruthTableLevel({
    name: "Random 3 inputs",
    description: "",
    inputs: [
        "A",
        "B",
        "C"
    ],
    outputs: [
        "OUT"
    ],
    // availableGates: ["AND", "NOT"],
    truthTable: ()=>{
        let tt = [];
        while(tt.length == 0){
            tt = [];
            for(let i=0; i<2**3; i++){
                let a = (i & 1) ? 1 : 0;
                let b = (i & 2) ? 1 : 0;
                let c = (i & 4) ? 1 : 0;
                let out = Math.random() > 0.5 ? 1 : 0;
                Math.random() > 0.2 && tt.push({inputs: [a, b, c], outputs: [out]});
            }
        }
        return tt;
    },
    maxGateCount: undefined,
    timeLimit: 60,
})
export default random2IN;
</script>

<script setup>
import { inject, getCurrentInstance, onMounted } from "vue";

let levelData = inject('truthTableLevelData');
let updateTruthTable = getCallerArgs();

const onRenew = () => {
    levelData.calculateTruthTable();
    updateTruthTable();
}

</script>

<template>
    <div>
        <h1>Random 3 inputs <button class="btn btn-secondary" @click="onRenew">Renew</button></h1>
    </div>
</template>