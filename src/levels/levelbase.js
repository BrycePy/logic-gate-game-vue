class LevelBase {
    constructor(data) {
        this.name = data.name;
        this.description = data.description;
        this.availableGates = data.availableGates;
        this.maxGateCount = data.maxGateCount;
        this.timeLimit = data.timeLimit;
        this.onCreated = data.onCreated;
        this.onSubmit = data.onSubmit;

        if(!data.name) {
            throw new Error("Level must have a name");
        }
        if(!data.description) {
            throw new Error("Level must have a description");
        }
        if(!data.availableGates) {
            throw new Error("Level must have availableGates");
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
        this.inputs = data.inputs;
        this.outputs = data.outputs;
        this.truthTableFn = data.truthTable;

        if(typeof this.truthTableFn !== 'function'){
            this.truthTableFn = ()=>data.truthTable;
        }else{
            this.truthTableFn = this.truthTableFn;
        }
    }

    get truthTable() {
        console.log(this.truthTableFn());
        return this.truthTableFn();
    }
}
export { TruthTableLevel };
