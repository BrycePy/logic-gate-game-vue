import Tutorial from "@/pages/Tutorial.vue";
import andLevel from "./basic/letsmakenand1";
import nothingLevel from "./basic/nothing.vue";
import SmartHomeDev from "./smarthome/smarthomedev.vue";
import SmartHome1 from "./smarthome/smarthome1.vue";
import SmartHome2 from "./smarthome/smarthome2.vue";
import SmartHome3 from "./smarthome/smarthome3.vue";
import SmartHome4 from "./smarthome/smarthome4.vue";
import random2in from "./basic/random2in.vue";
import random3in from "./basic/random3in.vue";

console.log("vue",nothingLevel);

// name: 'Tutorial',
// description: 'Learn the basics of logic gates and game mechanics',

const worlds = [
    {name: "Basic", description: "Basic level", levels: [
        {name: "Tutorial", description: "Learn the basics of logic gates and game mechanics", goToPage: Tutorial},
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
    {name: "Intermediate", description: "Intermediate level", levels: [
        random2in,
        random3in,
    ]},
    {name: "Others", description: "Advanced level", levels: [
        {name: "Level 4", description: "Level 4Level 1Level 1Level 1Level 1Level 1Level 1"},
        {name: "Level 5", description: "Level 5Level 2Level 2Level 2Level 2Level 2Level 2"},
        {name: "Level 6", description: "Level 6Level 3Level 3Level 3Level 3Level 3Level 3"},
        {name: "Level 6", description: "Level 6Level 3Level 3Level 3Level 3Level 3Level 3"},
        {name: "Level 6", description: "Level 6Level 3Level 3Level 3Level 3Level 3Level 3"},
    ]},
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

