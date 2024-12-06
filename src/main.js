import { createApp, nextTick } from 'vue'
import EventManager from './libs/eventmanager';
import { sleep } from './libs/utils';
import { mountApp, getCallerArgs } from './libs/utils';
import MainMenu from './pages/MainMenu.vue'
import WorldSelection from './pages/WorldSelection.vue'
import Play from './pages/Play.vue'
import { LogicCanvasHint } from './libs/hintcursor';
import Nothing from './pages/nothing.vue';
import worlds from './levels/levels';

const mainEventManager = new EventManager();
export { mainEventManager as eventManager };

const hintCursor = new LogicCanvasHint();
export { hintCursor };

console.log(location)

let hash = document.location.hash;
if(hash.startsWith("#play")) {
  mountApp(Play);
}else if(hash.startsWith("#world-selection")) {
  mountApp(WorldSelection);
}else if(hash.startsWith("#smart-home-debug")) {
  mountApp(WorldSelection);
}else {
  mountApp(MainMenu);
}

// const testMemleak = async () => {
//   for(let i=0; i<10; i++) {
//     await mountApp(MainMenu);
//     await sleep(100);
//     await mountApp(WorldSelection);
//     await sleep(100);
//     await mountApp(Play, worlds[1].levels[0].id);
//     await sleep(100);
//   }
// }

// testMemleak();


// const testFlow = async () => {
//   // mountApp(MainMenu);
//   mountApp(WorldSelection);
//   // mountApp(Play)

// }
// testFlow();