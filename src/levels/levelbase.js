class LevelBase {
    constructor(data) {
        this.name = data.name;
        this.description = data.description;
        this.inputs = data.inputs;
        this.outputs = data.outputs;
        this.availableGates = data.availableGates;
        this.maxGateCount = data.maxGateCount;
        this.timeLimit = data.timeLimit;
        this.onCreated = data.onCreated;
        this.onSubmit = data.onSubmit;
        this.oracles = data.oracles;

        this.initialCanvas = data.initialState;
        this.knownSolution = data.knownSolution;
        this.hints = data.hints;
        // this.template = data.template;

        if(data.name === undefined) {
            throw new Error("Level must have a name");
        }
        if(data.description === undefined) {
            throw new Error("Level must have a description");
        }
    }

    onCreated() {
    }

    async onSubmit() {
        return true;
    }
}
export { LevelBase };

class TruthTableLevel extends LevelBase {
    constructor(data) {
        super(data);
        this.truthTableFn = data.truthTable;
        this.truthTable;

        if(typeof this.truthTableFn !== 'function'){
            this.truthTableFn = ()=>data.truthTable;
        }else{
            this.truthTableFn = this.truthTableFn;
        }
        this.calculateTruthTable();
    }

    calculateTruthTable() {
        this.truthTable = this.truthTableFn();
        this.truthTable = this.truthTable.map(row=>{
            let inputs = row.inputs.map(input=>input?1:0);
            let outputs = row.outputs.map(output=>output?1:0);
            return {inputs, outputs};
        })
    }
}
export { TruthTableLevel };
