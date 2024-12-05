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

const transitionDuration = 250;
let currentApp = null;
let appContainer = $("#app")[0];
let callerArgs = null;
appContainer.style.opacity = 0;
appContainer.style.transition = "opacity " + transitionDuration + "ms";
const mountApp = async (appVue, data) => {
  if (currentApp) {
    appContainer.style.opacity = 0;
    await sleep(transitionDuration);
    let waitForUnmount = eventManager.wait("beforeUnmount");
    currentApp.unmount();
    await waitForUnmount;
  }
  callerArgs = data;
  currentApp = createApp(appVue);
  let waitForMounted = eventManager.wait("mounted");
  currentApp.mount("#app");
  await waitForMounted;
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
    eventManager.publish("mounted", data);
  });
  onBeforeUnmount(() => {
    eventManager.publish("beforeUnmount", data);
  });
}

export { setupLifecycleNotifier };