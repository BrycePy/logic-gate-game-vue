import { createApp, nextTick } from "vue";
import EventManager from "./libs/eventmanager";
import { sleep } from "./libs/utils";
import { mountApp, getCallerArgs } from "./libs/utils";
import MainMenu from "./pages/MainMenu.vue";
import WorldSelection from "./pages/WorldSelection.vue";
import Play from "./pages/Play.vue";
import { LogicCanvasHint } from "./libs/hintcursor";
import Nothing from "./pages/nothing.vue";
import worlds from "./levels/levels";
import "@/libs/jquery.ui.touch-punch.min.js";

const mainEventManager = new EventManager();
export { mainEventManager as eventManager };

const hintCursor = new LogicCanvasHint();
export { hintCursor };

console.log(location);

const leakBuffer = [];
const dummyLeak = () => {
  for (let i = 0; i < 20; i++) {
    let newDiv = document.createElement("div");
    newDiv.innerHTML = "dummy leak";
    leakBuffer.push(newDiv);
    document.body.appendChild(newDiv);
    newDiv.remove();
  }
};

const testMemleak = async () => {
  dummyLeak();
  for (let i = 0; i < 10; i++) {
    await mountApp(MainMenu);
    await sleep(100);
    await mountApp(WorldSelection);
    await sleep(100);
    await mountApp(Play, worlds[1].levels[0].id);
    await sleep(100);
  }
};

let hash = document.location.hash;
if (hash.startsWith("#play")) {
  mountApp(Play);
} else if (hash.startsWith("#world-selection")) {
  mountApp(WorldSelection);
} else if (hash.startsWith("#smart-home-debug")) {
  mountApp(WorldSelection);
} else if (hash.startsWith("#mem-leak-test")) {
  testMemleak();
} else {
  mountApp(MainMenu);
}

let showWireframeBtn = document.createElement("button");
showWireframeBtn.innerHTML = "Show Wireframe";
showWireframeBtn.style.position = "fixed";
showWireframeBtn.style.bottom = "10px";
showWireframeBtn.style.right = "10px";
showWireframeBtn.style.zIndex = "100";
showWireframeBtn.style.opacity = "0.2";
showWireframeBtn.addEventListener("click", () => {
  let newStyle = document.createElement("style");
  newStyle.innerHTML = `
    * {
      outline: rgba(255,0,0,0.3) dotted 1px;
    }
  `;
  document.documentElement.appendChild(newStyle);
  showWireframeBtn.remove();
});
document.body.appendChild(showWireframeBtn);

// window.addEventListener("dblclick", () => {
//   let newStyle = document.createElement("style");
//   newStyle.innerHTML = `
//     * {
//       outline: rgba(255,0,0,0.3) dotted 1px;
//     }
//   `;
//   document.documentElement.appendChild(newStyle);
// });

// testMemleak();

// const testFlow = async () => {
//   // mountApp(MainMenu);
//   mountApp(WorldSelection);
//   // mountApp(Play)

// }
// testFlow();
