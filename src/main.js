import { createApp, nextTick } from 'vue'
import EventManager from './libs/eventmanager';
import { sleep } from './libs/utils';

import { mountApp, getCallerArgs } from './libs/utils';

import MainMenu from './pages/MainMenu.vue'
import WorldSelection from './pages/WorldSelection.vue'
import Play from './pages/Play.vue'

const mainEventManager = new EventManager();
export { mainEventManager as eventManager };




let path = document.location.pathname;
if(path.startsWith("/play")) {
  mountApp(Play);
}else if(path.startsWith("/world-selection")) {
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