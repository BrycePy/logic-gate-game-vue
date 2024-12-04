import { onMounted, onBeforeUnmount } from "vue";
import { createApp } from "vue";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export { sleep };


const onBrowserBack = (callback) => {
    onMounted(()=>{
        console.log("onMounted");
        window.addEventListener("popstate", callback, false);
    })
    onBeforeUnmount(()=>{
        console.log("onBeforeUnmount");
        window.removeEventListener("popstate", callback, false);
    })
};

export { onBrowserBack };

let currentApp = null;
let appContainer = $("#app")[0];
let callerArgs = null;
appContainer.style.opacity = 0;
appContainer.style.transition = "opacity 0.2s";
const mountApp = async (appVue, data) => {
  if(currentApp) {
    appContainer.style.opacity = 0;
    await sleep(200);
    currentApp.unmount();
  }
  callerArgs = data;
  currentApp = createApp(appVue);
  currentApp.mount("#app");
  appContainer.style.opacity = 1;
}
const getCallerArgs = () => {
    return callerArgs;
}
export { mountApp, getCallerArgs };