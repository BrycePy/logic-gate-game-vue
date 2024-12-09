<script>
import { LevelBase } from '@/levels/levels';

class TruthTableLevel extends LevelBase {
    constructor(name, description, inputs, outputs, truthTable) {
        super(name, description);
        this.inputs = inputs;
        this.outputs = outputs;
        this.truthTable = truthTable;
    }
    get truthTable(){
        return this.truthTableFn();
    }
    set truthTable(value){
        if (typeof value !== 'function') {
            this.truthTableFn = ()=>value;
        }else{
            this.truthTableFn = value;
        }
    }
}

</script>


<template>
    <div></div>
</template>