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