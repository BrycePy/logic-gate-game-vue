<script setup>
import { sleep } from '@/libs/utils';
import { onBeforeUnmount } from 'vue';

let ended = false;
let previousPosition = { x: 0, y: 0 };
async function personCycleTest(callback, transformFunction) {
  let personElement = document.getElementById("living-room-person-1");
  const cycleEvery = 100;
  for (let tick = 0; tick < 1; tick += 1 / cycleEvery) {
    // await sleep(1000 / 40);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (ended) {
      return;
    }
    let personContainer = document.getElementById("living-room-1");
    let containerWidth = $(personContainer).width();
    let containerHeight = $(personContainer).height();
    let rawX, rawY;
    if (transformFunction) {
      [rawX, rawY] = transformFunction(tick);
    } else {
      rawX = Math.sin(tick * Math.PI * 2) * 0.4 + 0.5;
      rawY = Math.cos(tick * Math.PI * 2) * 0.4 + 0.5;
    }

    let dx = Math.abs(rawX - previousPosition.x);
    let dy = Math.abs(rawY - previousPosition.y);
    let enoughMovement = dx > 0.01 || dy > 0.01;
    previousPosition = { x: rawX, y: rawY };

    let x = rawX * containerWidth;
    let y = rawY * containerHeight;
    personElement.style.left = x + "px";
    personElement.style.top = y + "px";
    let sensorsElement = document.getElementsByClassName("living-room-motion-sensor");
    let distances = [];
    for (let i = 0; i < sensorsElement.length; i++) {
      let sensorElement = sensorsElement[i];
      // let sensorOffset = $(sensorElement).offset();
      // let personOffset = $(personElement).offset();
      let sensorOffset = {
        left: parseFloat(sensorElement.style.left),
        top: parseFloat(sensorElement.style.top)
      }
      let personOffset = {
        left: parseFloat(personElement.style.left),
        top: parseFloat(personElement.style.top)
      }
      let dx = sensorOffset.left - personOffset.left;
      let dy = sensorOffset.top - personOffset.top;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 450 / 2 && enoughMovement) {
        sensorElement.classList.remove("sensor-deactivated");
      } else {
        sensorElement.classList.add("sensor-deactivated");
      }
      distances.push(distance);
    }
    if (callback && callback({
      person: { x, y },
      distances: enoughMovement ? distances : distances.map(() => 10000),
      enoughMovement
    })) {
      return;
    }
  }
}

function lightOn() {
  let livingRoom = document.querySelector(".living-room");
  livingRoom.classList.remove("light-off");
}

function lightOff() {
  let livingRoom = document.querySelector(".living-room");
  livingRoom.classList.add("light-off");
}

function addMotionSensor(x, y) {
  let livingRoom = document.querySelector(".living-room");
  let sensor = document.createElement("div");
  if (x < 0) {
    x += $(livingRoom).width();
    x -= 30;
  }
  if (y < 0) {
    y += $(livingRoom).height();
    y -= 30;
  }
  sensor.style.left = x + "px";
  sensor.style.top = y + "px";
  sensor.classList.add("living-room-motion-sensor");
  livingRoom.appendChild(sensor);
}

let switches = [];
function addSwitch(label, callback) {
  let switchContainer = document.querySelector(".switch-container");
  let switchElement = document.createElement("div");
  switchElement.classList.add("labeled-switch");
  switchElement.innerHTML = `
    <label>${label}</label>
    <label class="switch">
      <input type="checkbox" checked>
      <span class="slider round"></span>
    </label>
  `;
  switchContainer.appendChild(switchElement);
  switches.push(switchElement);

  let input = switchElement.querySelector("input");
  input.addEventListener("click", () => {
    if (callback) {
      callback(input.checked);
    }
  });
  return input;
}

function addLinkedSwitch(label, terminal) {
  let inputcb = addSwitch(label, (checked) => {
    terminal.setState(checked);
  });
  terminal.world.eventManager.subscribe('TERMINAL_STATE_CHANGED', (t) => {
    if (t === terminal) {
      inputcb.checked = t.getState();
    }
  });
  inputcb.checked = terminal.getState();
  return inputcb;
}

function linkLight(terminal) {
  if (terminal.getState()) {
    lightOn();
  } else {
    lightOff();
  }
  terminal.world.eventManager.subscribe('TERMINAL_STATE_CHANGED', (t) => {
    if (t === terminal) {
      if (t.getState()) {
        lightOn();
      } else {
        lightOff();
      }
    }
  });
}

function personPrompt(text){
  let personElement = document.getElementById("living-room-person-1");
  personElement.style.zIndex = 100;
  $(personElement).tooltip('dispose');
  if(!text) return;
  let boundary = document.querySelector(".app-outer");
  $(personElement).tooltip({
    title: text,
    trigger: 'manual hover toggle',
    placement: 'top',
    animation: true,
    boundary: boundary
  });
  $(personElement).tooltip('show');
}

onBeforeUnmount(() => {
  ended = true;
});

defineExpose({
  personCycleTest,
  lightOn,
  lightOff,
  addMotionSensor,
  addSwitch,
  addLinkedSwitch,
  linkLight,
  personPrompt
})


</script>

<template>
  <div class="module-container">
    <div class="living-room-container" id="living-room-1">
      <div class="living-room light-off">LIVING ROOM
        <div class="living-room-person" id="living-room-person-1">P</div>
      </div>
    </div>

    <div class="switch-container"></div>
  </div>
</template>

<style scoped>
.module-container {
  display: flex;
  gap: 1em;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 500px) {
  .module-container {
    flex-direction: column;
  }
}

.switch-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

:global(.labeled-switch) {
  display: flex;
  flex-grow: 1;
  gap: 0.5em;
  align-items: center;
  font-size: large;
  justify-content: right;
}
</style>

<style scope>
.living-room-container {
  position: relative;
  width: 400px;
  height: 300px;
  /* padding: 30px; */
  margin: 0;
  overflow: hidden;
  /* transform: scale(2); */
  flex-shrink: 0;
}

.living-room {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid black;
  border-radius: 20px;
  line-height: 300px;
  text-align: center;
  font-size: 50px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  transition: background-color 0.2s;
}

.light-off {
  background-color: rgba(200, 200, 200, 0.5) !important;
}

.living-room-person {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* transition: left 0.01s, top 0.01s; */
}

.living-room-motion-sensor::before,
.living-room-person::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  color: black;
}

.living-room-motion-sensor::before {
  width: 450px;
  height: 450px;
  background-color: rgba(0, 0, 0, 0.1);
  border: 1px solid black;
}

.living-room-motion-sensor,
.living-room-person {
  position: absolute;
  text-align: center;
  line-height: 30px;
  width: 30px;
  height: 30px;
  border: 1px solid black;
  font-size: 17px;
  z-index: 10;
}

.living-room-motion-sensor,
.living-room-person {
  background-color: rgba(255, 255, 255);
}

.sensor-deactivated {
  background-color: rgba(50, 50, 50);
}


.living-room-motion-sensor,
.living-room-person {
  border-radius: 50%;
}
</style>

<style scope>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .2s;
  transition: .2s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .2s;
  transition: .2s;
}

input:checked+.slider {
  background-color: #2196F3;
}

input:focus+.slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>