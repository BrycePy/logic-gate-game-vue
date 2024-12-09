import { TruthTableLevel } from "../levelbase";

const andLevel = new TruthTableLevel({
    name: "NAND 1",
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
    knownSolution: {"gates":[{"type":"IN","x":"0px","y":"108.333px","id":0,"state":[false],"isWorldInput":true,"isWorldOutput":false},{"type":"IN","x":"0px","y":"241.667px","id":1,"state":[false],"isWorldInput":true,"isWorldOutput":false},{"type":"OUT","x":"","y":"175px","id":2,"state":[true],"isWorldInput":false,"isWorldOutput":true},{"type":"AND","x":"126px","y":"175.016px","id":3,"state":[false,false,false],"isWorldInput":false,"isWorldOutput":false},{"type":"NOT","x":"229.75px","y":"175.766px","id":4,"state":[false,true],"isWorldInput":false,"isWorldOutput":false}],"wires":[{"t1":{"gateID":3,"terminalID":2},"t2":{"gateID":4,"terminalID":0},"state":false},{"t1":{"gateID":4,"terminalID":1},"t2":{"gateID":2,"terminalID":0},"state":true},{"t1":{"gateID":0,"terminalID":0},"t2":{"gateID":3,"terminalID":0},"state":false},{"t1":{"gateID":1,"terminalID":0},"t2":{"gateID":3,"terminalID":1},"state":false}],"canvasSize":{"width":400,"height":400}}
})

export default andLevel;