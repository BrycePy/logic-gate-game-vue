<script>
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';
</script>

<script setup>


const logicCanvas = inject('logicCanvas');
const world = logicCanvas.world;
const ttLevelData = inject('truthTableLevelData');

const inputs = ttLevelData.inputs;
const outputs = ttLevelData.outputs;
const tableHeader = [...inputs, ...outputs]
const actualOutputs = ref(ttLevelData.truthTable.map(testCase => [...testCase.outputs]));

onMounted(() => {
    logicCanvas.clear();
    ttLevelData.inputs.forEach(input => {
        logicCanvas.createInput().setLabel(input);
    });
    ttLevelData.outputs.forEach(output => {
        logicCanvas.createOutput().setLabel(output);
    });
})

const run = async (testCaseIndex) => {
    let testCase = ttLevelData.truthTable[testCaseIndex];
    let inputs = testCase.inputs;
    let outputs = testCase.outputs;
    let result = await world.evaluate(inputs);
    result = result.map(output => output? 1: 0);

    let allMatch = true;
    result.forEach((actual, index) => {
        let expected = outputs[index];
        if(actual == expected){
            actualOutputs.value[testCaseIndex][index] = expected;
        } else {
            actualOutputs.value[testCaseIndex][index] = `${expected} (got: ${actual})`;
            allMatch = false;
        }
    });

    if(allMatch){
        $(".table-test-case").find('tbody tr').eq(testCaseIndex).addClass('table-success');
    } else {
        $(".table-test-case").find('tbody tr').eq(testCaseIndex).addClass('table-danger');
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
}

const handleTestClick = async (testCaseIndex, e) => {
    let rowElement = e.target.parentElement;
    resetTableColor();
    ttLevelData.truthTable.forEach((tc, tcIndex) => {
        tc.outputs.forEach((output, index) => {
            actualOutputs.value[tcIndex][index] = output;
        });
    });
    
    rowElement.classList.toggle('table-primary');
    await run(testCaseIndex)
}

defineExpose({
    onSubmit,
    onCreated: ttLevelData.onCreated
})

</script>

<template>
    <p>{{ ttLevelData.description }}</p>
    <!-- <data.template v-if="data.template" /> -->
    <ttLevelData v-if="ttLevelData.render"></ttLevelData>
    <div class="test-case-table-container">
        <table class="table table-dark table-hover text-center table-striped table-test-case">
            <thead>
                <tr>
                    <th class="col-1" v-for="name in tableHeader">{{ name }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="testCase, i in ttLevelData.truthTable" class="table-test-case-row"
                    @click="(e) => { handleTestClick(i, e) }">
                    <td v-for="cell in testCase.inputs">{{ cell }}</td>
                    <td v-for="cell in actualOutputs[i]">{{ cell }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>

.table-test-case{
    margin: 0;
}

.test-case-table-container {
    margin-left: auto;
    margin-right: auto;
    width: 80%;
    border-radius: 1em;
    padding: 0;
    overflow: hidden;
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