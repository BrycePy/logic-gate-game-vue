import Tutorial from "@/pages/Tutorial.vue";
import andLevel from "./basic/letsmakenand1";
import nothingLevel from "./basic/nothing.vue";
import SmartHomeDev from "./smarthome/smarthomedev.vue";
import SmartHome1 from "./smarthome/smarthome1.vue";
import SmartHome2 from "./smarthome/smarthome2.vue";
import SmartHome3 from "./smarthome/smarthome3.vue";
import SmartHome4 from "./smarthome/smarthome4.vue";

import SmartHome1NAND from "./smarthomenand/smarthome1.vue";
import SmartHome2NAND from "./smarthomenand/smarthome2.vue";
import SmartHome3NAND from "./smarthomenand/smarthome3.vue";
import SmartHome4NAND from "./smarthomenand/smarthome4.vue";

import random2in from "./others/random2in.vue";
import random3in from "./others/random3in.vue";
import fullAdderLevel from "./others/fulladder.vue";
import latchLevel from "./others/latch.vue";
import Sandbox from "@/pages/Sandbox.vue";

console.log("vue",nothingLevel);

// name: 'Tutorial',
// description: 'Learn the basics of logic gates and game mechanics',

const makeNANDOnly = (level) => {
    let newLevel = structuredClone(level);
    newLevel.availableGates = ["NAND"];
    newLevel.name = level.name + " (NAND ONLY)";
    return newLevel;
}

const worlds = [
    {name: "Basic", description: "Basic level", levels: [
        {name: "Tutorial", description: "Learn the basics of logic gates and game mechanics", goToPage: Tutorial},
        {name: "Sandbox", description: "Experiment with the circuit however you like", goToPage: Sandbox},
        nothingLevel,
        andLevel,
    ]},
    {name: "Smart Home", description: "smarthome level", levels: [
        // SmartHomeDev,
        SmartHome1,
        SmartHome2,
        SmartHome3,
        SmartHome4
    ]},
    {name: "Smart Home (NAND ONLY)", description: "smarthome level (NAND ONLY)", levels: [
        SmartHome1NAND,
        SmartHome2NAND,
        SmartHome3NAND,
        SmartHome4NAND
    ]},
    {name: "Others", description: "Others level", levels: [
        fullAdderLevel,
        latchLevel,
        random2in,
        random3in,
    ]}
]

const idToLevel = {};
let previousLevel;
worlds.forEach(world => {
    world.levels.forEach(level => {
        let id = `${world.name}.${level.name}`;
        level["world"] = world;
        level.id = id;
        level.cardID = id.replace(/\W/g, '-')
        idToLevel[id] = level;
        if (previousLevel) {
            previousLevel.next = level;
            level.previous = previousLevel;
        }
        previousLevel = level;
    });
});

const levelToId = {};
const allLevels = [];
Object.keys(idToLevel).forEach(id => {
    levelToId[idToLevel[id]] = id;
    allLevels.push(idToLevel[id]);
});

export default worlds;

export { idToLevel, allLevels, levelToId };

