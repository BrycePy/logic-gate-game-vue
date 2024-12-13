<script>
import { setCallerArgs } from '@/libs/utils';
import { getCurrentInstance, inject, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef, watch } from 'vue';

</script>

<script setup>


const logicCanvas = inject('logicCanvas');
const world = logicCanvas.world;
const ttLevelData = inject('truthTableLevelData');

const inputs = ttLevelData.inputs;
const outputs = ttLevelData.outputs;
const actualOutputs = ref(ttLevelData.truthTable.map(testCase => [...testCase.outputs]));
const rttLevelData = reactive(ttLevelData);
const instance = getCurrentInstance();

// const levelVue = useTemplateRef('levelVue');
// levelVue.provide('parent', getCurrentInstance());

setCallerArgs(()=>{
    resetTableColor();
    actualOutputs.value = ttLevelData.truthTable.map(testCase => [...testCase.outputs]);
    console.log("reset", actualOutputs.value);
    instance.proxy.$forceUpdate();
})

onMounted(() => {
})

const run = async (testCaseIndex) => {
    let rowElement = $(".table-test-case").find('tbody tr').eq(testCaseIndex)
    rowElement.addClass('table-primary');

    let testCase = ttLevelData.truthTable[testCaseIndex];
    let inputs = testCase.inputs;
    let outputs = testCase.outputs;
    let result = await world.evaluate(inputs);
    result = result.map(output => output? 1: 0);
    let allMatch = true;
    result.forEach((actual, index) => {
        let expected = outputs[index];
        let cellElement = rowElement.find('td').eq(index + inputs.length);
        if(actual == expected){
            actualOutputs.value[testCaseIndex][index] = expected;
            cellElement.addClass('table-success');
        } else {
            actualOutputs.value[testCaseIndex][index] = `${expected} (got: ${actual})`;
            allMatch = false;
            cellElement.addClass('table-danger');
        }
    });

    rowElement.removeClass('table-primary');
    rowElement.removeClass('table-success');
    rowElement.removeClass('table-danger');
    if(allMatch){
        rowElement.addClass('table-success');
    } else {
        rowElement.addClass('table-danger');
    }

    console.log("result", inputs, outputs, result);
    return allMatch;
}

const onSubmit = async () => {
    resetTableColor();
    let allMatch = true;
    for(let i = 0; i < ttLevelData.truthTable.length; i++){
        if(!await run(i)){
            allMatch = false;
        }
    }
    return allMatch;
}

const resetTableColor = () => {
    $(".table-test-case").find('tr').removeClass('table-primary');
    $(".table-test-case").find('tr').removeClass('table-success');
    $(".table-test-case").find('tr').removeClass('table-danger');
    $(".table-test-case").find('td').removeClass('table-success');
    $(".table-test-case").find('td').removeClass('table-danger');
}

const handleTestClick = async (testCaseIndex, e) => {
    resetTableColor();
    actualOutputs.value = ttLevelData.truthTable.map(testCase => [...testCase.outputs]);
    await run(testCaseIndex)
}

defineExpose({
    onSubmit,
    onCreated: ttLevelData.onCreated
})

</script>

<template>
    <p>{{ ttLevelData.context }}</p>
    <!-- <data.template v-if="data.template" /> -->
    <ttLevelData v-if="ttLevelData.render" ref="levelVue"></ttLevelData>
    <div class="test-case-table-container" :class="ttLevelData.hideTruthTable?'tt-hide':''">
        <table class="table table-dark table-hover text-center table-striped table-test-case">
            <thead>
                <tr>
                    <th class="col-1 table-header-inputs" v-for="name in inputs">{{ name }}</th>
                    <th class="col-2 table-header-outputs" v-for="name in outputs">{{ name }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="testCase, i in rttLevelData.truthTable" class="table-test-case-row"
                    @click="(e) => { handleTestClick(i, e) }">
                    <td v-for="cell in testCase.inputs">{{ cell }}</td>
                    <td v-for="cell in actualOutputs[i] || testCase.outputs">{{ cell }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.tt-hide {
    display: none;
}

.table-test-case{
    margin: 0;
}

.test-case-table-container {
    margin-left: auto;
    margin-right: auto;
    /* width: 80%; */
    width: 100%;
    border-radius: 1em;
    padding: 0;
    overflow: hidden;
    /* transition: width 0.5s; */
}

td {
    text-wrap: nowrap;
}

.table-header-inputs {
    background-color: #1a2433;
    color: white;
}

.table-header-outputs {
    background-color: #1a2c33;
    color: white;
}

:global(.table-test-case-row td) {
    transition: background-color 0.5s;
}

</style>


<style scoped>
.table-primary {
    --bs-table-color: #fff;
    --bs-table-bg: #09367a;
    --bs-table-border-color: #32363d;
    --bs-table-striped-bg: #214b8a;
    --bs-table-striped-color: #fff;
    --bs-table-active-bg: #09367a;
    --bs-table-active-color: #fff;
    --bs-table-hover-bg: #183f7a;
    --bs-table-hover-color: #fff;
    color: var(--bs-table-color);
    border-color: var(--bs-table-border-color);
}

.table-success {
    --bs-table-color: #fff;
    --bs-table-bg: #275741;
    --bs-table-border-color: #353b38;
    --bs-table-striped-bg: #1b4432;
    --bs-table-striped-color: #fff;
    --bs-table-active-bg: #257752;
    --bs-table-active-color: #fff;
    --bs-table-hover-bg: #256146;
    --bs-table-hover-color: #fff;
    color: var(--bs-table-color);
    border-color: var(--bs-table-border-color);
}

.table-danger {
    --bs-table-color: #fff;
    --bs-table-bg: #5e3034;
    --bs-table-border-color: #352d2e;
    --bs-table-striped-bg: #552227;
    --bs-table-striped-color: #fff;
    --bs-table-active-bg: #5e3034;
    --bs-table-active-color: #fff;
    --bs-table-hover-bg: #6e373b;
    --bs-table-hover-color: #fff;
    color: var(--bs-table-color);
    border-color: var(--bs-table-border-color);
}
</style>