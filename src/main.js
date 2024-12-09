import { createApp, nextTick } from "vue";
import EventManager from "./libs/eventmanager";
import { sleep } from "./libs/utils";
import { mountApp, getCallerArgs } from "./libs/utils";
import MainMenu from "./pages/MainMenu.vue";
import WorldSelection from "./pages/WorldSelection.vue";
import Play from "./pages/Play.vue";
import Tutorial from "./pages/Tutorial.vue";
import { LogicCanvasHint } from "./libs/hintcursor";
import worlds from "./levels/levels";
import "@/libs/jquery.ui.touch-punch.min.js";
import "drag-drop-touch";
import userData from "./UserData";

const mainEventManager = new EventManager();
export { mainEventManager as eventManager };

// const rootDiv = document.querySelector("#app");
const hintCursor = new LogicCanvasHint(undefined);
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
} else if (hash.startsWith("#tutorial")) {
  mountApp(Tutorial);
}else if (hash.startsWith("#mem-leak-test")) {
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
showWireframeBtn.style.opacity = "0.1";
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

let clearUserDataBtn = document.createElement("button");
clearUserDataBtn.innerHTML = "Clear User Data";
clearUserDataBtn.style.position = "fixed";
clearUserDataBtn.style.bottom = "10px";
clearUserDataBtn.style.left = "10px";
clearUserDataBtn.style.zIndex = "100";
clearUserDataBtn.style.opacity = "0.1";
clearUserDataBtn.addEventListener("click", () => {
  userData.clear();
});
document.body.appendChild(clearUserDataBtn);

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
