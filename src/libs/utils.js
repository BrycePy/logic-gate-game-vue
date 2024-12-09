import { eventManager } from "@/main";
import { onMounted, onBeforeUnmount, onUnmounted } from "vue";
import { createApp } from "vue";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export { sleep };

const onBrowserBack = (callback) => {
  onMounted(() => {
    console.log("onMounted");
    window.addEventListener("popstate", callback, false);
  });
  onBeforeUnmount(() => {
    console.log("onBeforeUnmount");
    window.removeEventListener("popstate", callback, false);
  });
};

export { onBrowserBack };


const _mountApp = async (app) => {
  app.mount("#app");
  setTimeout(()=>{
    zoomOutMobile();
  }, 250)
};

const _unmountApp = async (app) => {
  let waitForUnmount = new Promise((resolve) => {
    app.onUnmount(resolve);
  });
  app.unmount();
  await waitForUnmount;
};

const transitionDuration = 250;
let currentApp = null;
let currentAppUUID = null;
let appContainer = $("#app")[0];
let callerArgs = null;
appContainer.style.opacity = 0;
appContainer.style.transition = "opacity " + transitionDuration + "ms";
const mountApp = async (appVue, data) => {
  if (currentApp) {
    appContainer.style.opacity = 0;
    await sleep(transitionDuration);
    await _unmountApp(currentApp);
  }
  callerArgs = data;
  currentApp = createApp(appVue);
  await _mountApp(currentApp);
  appContainer.style.opacity = 1;
};
const setCallerArgs = (data) => {
  callerArgs = data;
}
const getCallerArgs = () => {
  return callerArgs;
};
export { mountApp, getCallerArgs, setCallerArgs };

class Throttle {
  constructor(delayMS) {
    this.timer = Date.now();
    this.delay = delayMS;
    this.pending;
    this.callback;
  }
  run(callback) {
    this.callback = callback;
    if (this.pending) return;
    let now = Date.now();
    let diff = now - this.timer;
    let waitFor = this.delay - diff;
    if (waitFor <= 0) {
      this.callback();
      this.timer = Date.now();
    } else {
      this.pending = setTimeout(() => {
        this.callback();
        this.timer = Date.now();
        this.pending = undefined;
      }, waitFor);
    }
  }
}

export { Throttle };

const setupLifecycleNotifier = (eventManager, data) => {
  // onMounted(() => {
  //   console.log("mounted", data);
  //   eventManager.publish("mounted", data);
  // });
  // onUnmounted(() => {
  //   console.log("unmounted", data);
  //   eventManager.publish("unmounted", data);
  // });
}

export { setupLifecycleNotifier };

function zoomOutMobile() {
  var viewport = document.querySelector('meta[name="viewport"]');

  if ( viewport ) {
    viewport.content = "initial-scale=0.1";
    viewport.content = "width=500";
  }
}

export { zoomOutMobile };

function timeStrFromSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export { timeStrFromSeconds };

function calculateIntersectionRatio(element1, element2){
  let rect1 = element1.getBoundingClientRect();
  let rect2 = element2.getBoundingClientRect();
  let xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
  let yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
  let overlapArea = xOverlap * yOverlap;
  let area1 = rect1.width * rect1.height;
  let area2 = rect2.width * rect2.height;
  return overlapArea / Math.min(area1, area2);
}

export { calculateIntersectionRatio };

class Timer{
  constructor(){
    this.startTime = 0;
    this.elapsedTimeAtPause = 0;
    this.paused = false;
  }
  start(){
    if(this.paused){
      this.startTime = Date.now() - this.elapsedTimeAtPause;
      this.paused = false
    }else{
      this.startTime = this.startTime || Date.now();
    }
  }

  pause(){
    if(this.paused) return;
    this.elapsedTimeAtPause = Date.now() - this.startTime;
    this.paused = true;
  }

  set(timeElapsedSec){
    if(this.paused){
      this.elapsedTimeAtPause = timeElapsedSec * 1000;
    }else{
      this.startTime = Date.now() - timeElapsedSec * 1000;
    }
  }

  reset(){
    this.startTime = 0;
    this.elapsedTimeAtPause = 0;
    this.paused = false;
  }

  getElapsedTime(){
    if(this.paused){
      return this.elapsedTimeAtPause / 1000;
    }else{
      return (Date.now() - this.startTime) / 1000;
    }
  }

  getElapsedTimeStr(tSec){
    let t = tSec? tSec : this.getElapsedTime();
    let seconds = Math.floor(t);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export { Timer };


const mapRange = (value, low1, high1, low2, high2) => {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export { mapRange };