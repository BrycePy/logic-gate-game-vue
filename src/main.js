import { createApp, nextTick } from 'vue'
import EventManager from './libs/eventmanager';
import { sleep } from './libs/utils';

import { mountApp, getCallerArgs } from './libs/utils';

import MainMenu from './pages/MainMenu.vue'
import WorldSelection from './pages/WorldSelection.vue'
import Play from './pages/Play.vue'

const mainEventManager = new EventManager();
export { mainEventManager as eventManager };

console.log(location)

let hash = document.location.hash;
if(hash.startsWith("#play")) {
  mountApp(Play);
}else if(hash.startsWith("#world-selection")) {
  mountApp(WorldSelection);
}else {
  mountApp(MainMenu);
}

// const testFlow = async () => {
//   // mountApp(MainMenu);
//   mountApp(WorldSelection);
//   // mountApp(Play)

// }
// testFlow();