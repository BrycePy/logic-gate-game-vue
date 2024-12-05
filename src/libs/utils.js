import { eventManager } from "@/main";
import { onMounted, onBeforeUnmount } from "vue";
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
  let uuid = Math.random().toString(36).substring(2);
  app.__logicGameAppUUID = uuid;
  app.provide("uuid", uuid);
  let waitForMounted = eventManager.wait("mounted", (data) => data === uuid);
  app.mount("#app");
  await waitForMounted;
};

const _unmountApp = async (app) => {
  let uuid = app.__logicGameAppUUID;
  let waitForUnmount = eventManager.wait("beforeUnmount", (data) => data === uuid);
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
const getCallerArgs = () => {
  return callerArgs;
};
export { mountApp, getCallerArgs };

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
  onMounted(() => {
    console.log("mounted", data);
    eventManager.publish("mounted", data);
  });
  onBeforeUnmount(() => {
    eventManager.publish("beforeUnmount", data);
  });
}

export { setupLifecycleNotifier };