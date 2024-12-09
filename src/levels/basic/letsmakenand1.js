import { TruthTableLevel } from "../levelbase";

const andLevel = new TruthTableLevel({
    name: "Lets Make NAND 1",
    description: "Create a NAND gate using AND and NOT gates",
    inputs: [
        "A",
        "B"
    ],
    outputs: [
        "OUT"
    ],
    availableGates: ["AND", "NOT"],
    truthTable: [
        {inputs: [0, 0], outputs: [1]},
        {inputs: [0, 1], outputs: [1]},
        {inputs: [1, 0], outputs: [1]},
        {inputs: [1, 1], outputs: [0]}
    ],
    maxGateCount: 2,
    timeLimit: 3 * 60,
})

export default andLevel;