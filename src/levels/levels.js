import smarthome1 from "./Intermediate/smarthome1.vue";
import Tutorial from "@/pages/Tutorial.vue";

class LevelBase {
    constructor(name, description) {
        this.name = name;
        this.description = description
    }

    onMounted() {
    }

    onSubmit() {
    }
}

// name: 'Tutorial',
// description: 'Learn the basics of logic gates and game mechanics',

const worlds = [
    {name: "Basic", description: "Basic level", levels: [
        {name: "Tutorial", description: "Learn the basics of logic gates and game mechanics", goToPage: Tutorial},
        {name: "Level 1", description: "Level 1Level 1Level 1Level 1Level 1Level 1Level 1"},
        {name: "Level 2", description: "Level 2Level 2Level 2Level 2Level 2Level 2Level 2"},
        {name: "Level 3", description: "Level 3Level 3Level 3Level 3Level 3Level 3Level 3"},
    ]},
    {name: "Intermediate", description: "Intermediate level", levels: [
        smarthome1
    ]},
    {name: "Advanced", description: "Advanced level", levels: [
        {name: "Level 4", description: "Level 4Level 1Level 1Level 1Level 1Level 1Level 1"},
        {name: "Level 5", description: "Level 5Level 2Level 2Level 2Level 2Level 2Level 2"},
        {name: "Level 6", description: "Level 6Level 3Level 3Level 3Level 3Level 3Level 3"},
        {name: "Level 6", description: "Level 6Level 3Level 3Level 3Level 3Level 3Level 3"},
        {name: "Level 6", description: "Level 6Level 3Level 3Level 3Level 3Level 3Level 3"},
    ]},
    {name: "Expert", description: "Expert level", levels: [
        {name: "Level 7", description: "Level 7Level 1Level 1Level 1Level 1Level 1Level 1"},
        {name: "Level 8", description: "Level 8Level 2Level 2Level 2Level 2Level 2Level 2"},
        {name: "Level 9", description: "Level 9Level 3Level 3Level 3Level 3Level 3Level 3"},
        {name: "Level 7", description: "Level 7Level 1Level 1Level 1Level 1Level 1Level 1"},
        {name: "Level 8", description: "Level 8Level 2Level 2Level 2Level 2Level 2Level 2"},
        {name: "Level 9", description: "Level 9Level 3Level 3Level 3Level 3Level 3Level 3"},
        {name: "Level 7", description: "Level 7Level 1Level 1Level 1Level 1Level 1Level 1"},
        {name: "Level 8", description: "Level 8Level 2Level 2Level 2Level 2Level 2Level 2"},
        {name: "Level 9", description: "Level 9Level 3Level 3Level 3Level 3Level 3Level 3"},
    ]},
]

const idToLevel = {};
worlds.forEach(world => {
    world.levels.forEach(level => {
        let id = `${world.name}.${level.name}`;
        level["world"] = world;
        level.id = id;
        idToLevel[id] = level;
    });
});


export default worlds;

export { idToLevel, LevelBase };

