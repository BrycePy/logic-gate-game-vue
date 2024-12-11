import {
  LogicGateFunctionSpec,
  World,
  FundamentalGate,
  State,
  functionSpecIN,
  functionSpecOUT,
  Terminal,
} from "./logicgate_back.js";
import logicGateDefaultTemplate from "./logicgate_template.js";

import "@/assets/logicgate.css";

import { calculateIntersectionRatio, Throttle } from "./utils.js";
import LZString from "./lz-string.min.js";
import { event } from "jquery";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadTemplate = () => {
  let div = document.createElement("div");
  div.id = "logic-gate-default-template";
  div.style.display = "none";
  document.body.appendChild(div);
  div.innerHTML = logicGateDefaultTemplate;
};
loadTemplate();

const calculateOffset = (element, parent) => {
  let offset = { top: 0, left: 0 };
  if (!element) return offset;
  offset.top += $(element).offset().top;
  offset.left += $(element).offset().left;
  if (!parent) return offset;
  offset.top -= $(parent).offset().top;
  offset.left -= $(parent).offset().left;
  return offset;
};

function isInside(element1, element2) {
  let rect1 = element1.getBoundingClientRect();
  let rect2 = element2.getBoundingClientRect();
  return (
    rect1.top >= rect2.top &&
    rect1.left >= rect2.left &&
    rect1.bottom <= rect2.bottom &&
    rect1.right <= rect2.right
  );
}

// Handle User click/tap events. with throttling and double firing prevention.
let skipMouse = 0;
const onInteract = (element, callback, options) => {
  let lastCallAt = 0;
  const call = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type.includes("touch")) skipMouse = 3;
    if (event.type.includes("mouse") && skipMouse) {
      skipMouse--;
      return;
    }
    let now = Date.now();
    if (now - lastCallAt < 100) return;
    lastCallAt = now;
    callback(event);
  };
  ["mousedown", "touchstart"].forEach((event) => {
    element.addEventListener(event, call, options);
  });
};

const setUpTerminal = (terminal, lc) => {
  terminal.domElement.addEventListener("click", (event) => {
    event.stopPropagation();
    lc.world.makeConnection(terminal);
    lc.showConnectableTerminals();
  });

  terminal.domElement.draggable = true;
  terminal.domElement.addEventListener("dragstart", (event) => {
    event.dataTransfer.dropEffect = "link";
    event.dataTransfer.setData("text", "terminal");
    lc.world.clearSelection();
    lc.world.makeConnection(terminal);
    lc.showConnectableTerminals();
    // event.preventDefault();
  });

  terminal.domElement.addEventListener("dragend", (event) => {
    lc.world.clearSelection();
    lc.showConnectableTerminals();
  });

  terminal.domElement.addEventListener("dragover", (event) => {
    lc.mousePos = {
      x: event.clientX,
      y: event.clientY,
    };
    event.preventDefault();
  });

  terminal.domElement.addEventListener("drop", (event) => {
    if (event.dataTransfer.getData("text") !== "terminal") return;
    lc.world.makeConnection(terminal);
    lc.world.clearSelection();
    lc.showConnectableTerminals();
  });
}

class LogicCanvas {
  constructor(world, div, templateID, editable) {
    editable = editable === undefined ? true : editable;
    world.setDomElement(div);
    world.setParent(this);
    this.world = world;
    this.domElement = div;
    this.eventManager = this.world.eventManager;
    this.loadTemplate(templateID || "logic-gate-templates");

    $(div).addClass("logic-gate-div");

    this.canvas = document.createElement("canvas");
    this.domElement.appendChild(this.canvas);
    this.updateCanvas(true);
    this.clearCanvas();
    this.drawGrid();

    let throttle = new Throttle(100);
    this.onResize = () => {
      throttle.run(() => {
        this.updateCanvas();
        this.visualTick();
      });
    };
    window.addEventListener("resize", this.onResize);

    this.mousePos = { x: 0, y: 0 };
    this.onMouseMove = (event) => {
      let bounds = this.domElement.getBoundingClientRect();
      this.mousePos = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
    };
    this.onMouseLeave = (event) => {
      this.mousePos = { x: 0, y: 0 };
    }
    this.domElement.addEventListener("mousemove", this.onMouseMove, true);
    this.domElement.addEventListener("mouseleave", this.onMouseLeave, true);

    this.canvas.addEventListener("contextmenu", (event) => {
      console.log(this.exportAsStr());
    });

    // this.canvas.addEventListener("click", () => {
    //   this.world.clearSelection();
    //   this.showConnectableTerminals();
    // });

    this.slowVisualTick = setInterval(() => {
      this.visualTick();
    }, 100);

    this.eventManager.subscribe("TERMINAL_STATE_CHANGED", (terminal) => {
      if (terminal.state === State.ON) {
        $(terminal.domElement).addClass("logic-gate-terminal-on");
      } else {
        $(terminal.domElement).removeClass("logic-gate-terminal-on");
      }
    });

    if (editable) {
      this.createEditModeButton();
    }

    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleTrackerInterval = setInterval(() => {
      let canvasBounds = this.canvas.getBoundingClientRect();
      let scaleX = this.canvas.width / canvasBounds.width;
      let scaleY = this.canvas.height / canvasBounds.height;
      this.scaleX = scaleX;
      this.scaleY = scaleY;
    }, 1000 / 15);

    this.domElement.addEventListener("dragover", (event) => {
      let bounds = this.domElement.getBoundingClientRect();
      this.mousePos = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      event.preventDefault();
    });

    this.domElement.addEventListener("drop", (e) => {
      if (!e.dataTransfer.getData("gate")) return;
      let gate = e.dataTransfer.getData("gate");
      let rect = this.domElement.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      x -= 25;
      y -= 25;
      switch (gate) {
        case "IN":
          this.createInput();
          break;
        case "OUT":
          this.createOutput();
          break;
        default:
          this.createGate(gate, x, y);
          break;
      }
    });
  }

  createEditModeButton() {
    let newDiv = document.createElement("div");
    newDiv.classList.add("logic-gate-edit-mode-button");
    newDiv.innerHTML = "Edit Mode: Wiring";
    this.domElement.appendChild(newDiv);

    this.moveMode = false;
    newDiv.addEventListener("click", () => {
      this.moveMode = !this.moveMode;
      if (this.moveMode) {
        newDiv.innerHTML = "Edit Mode: Moving";
        $(this.domElement).addClass("logic-gate-move-mode");
        this.eventManager.publish("CANVAS_EDIT_MODE_CHANGED", "MOVING");
      } else {
        newDiv.innerHTML = "Edit Mode: Wiring";
        $(this.domElement).removeClass("logic-gate-move-mode");
        this.eventManager.publish("CANVAS_EDIT_MODE_CHANGED", "WIRING");
      }
    });
  }

  showingModeSelector() {
    return !matchMedia("(pointer:fine)").matches;
  }

  updateCanvas(first) {
    // console.log("updateCanvas");
    if (!first) {
      let xScale = this.domElement.clientWidth / this.canvas.width;
      let yScale = this.domElement.clientHeight / this.canvas.height;
      if (xScale !== 1 || yScale !== 1) {
        this.world.gates.forEach((gate) => {
          let x = parseInt(gate.domElement.style.left) * xScale;
          let y = parseInt(gate.domElement.style.top) * yScale;
          gate.domElement.style.left = x + "px";
          gate.domElement.style.top = y + "px";
        });
      }
    }
    this.canvas.width = this.domElement.clientWidth;
    this.canvas.height = this.domElement.clientHeight;
    this.canvas.style.width = this.domElement.clientWidth + "px";
    this.canvas.style.height = this.domElement.clientHeight + "px";
    $(this.canvas).addClass("logic-gate-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.arrangeIOGates();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    let ctx = this.ctx;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    let x = 0;
    while (x < this.canvas.width) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      x += 20;
    }
    let y = 0;
    while (y < this.canvas.height) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      y += 20;
    }
    ctx.stroke();
  }

  drawWires() {
    let ctx = this.ctx;
    let floatingTerminals = this.world.terminals.map((t) => t);

    // console.log(scaleX, scaleY);

    this.world.wires.forEach((wire) => {
      let terminal1 = wire.terminalSrc;
      let terminal2 = wire.terminalSink;

      floatingTerminals = floatingTerminals.filter(
        (t) => t !== terminal1 && t !== terminal2
      );

      let jqTerminal1 = $(terminal1.domElement);
      let jqTerminal2 = $(terminal2.domElement);

      let srcPos = calculateOffset(terminal1.domElement, this.domElement);
      let sinkPos = calculateOffset(terminal2.domElement, this.domElement);

      srcPos.top += jqTerminal1.height() / 2 / this.scaleY;
      srcPos.left += jqTerminal1.width() / 2 / this.scaleX;
      sinkPos.top += jqTerminal2.height() / 2 / this.scaleY;
      sinkPos.left += jqTerminal2.width() / 2 / this.scaleX;

      let xMid = (srcPos.left + sinkPos.left) / 2;
      let yMid = (srcPos.top + sinkPos.top) / 2;
      let xDiff = Math.abs(srcPos.left - sinkPos.left);

      ctx.beginPath();
      ctx.strokeStyle = wire.state === State.ON ? "white" : "#0096d2";
      ctx.lineWidth = 2 / this.scaleX;

      const drawCases = {
        "self-connecting": () => {
          let yOffset = 50 / this.scaleY;
          let xOffset = 30 / this.scaleX;
          let bridgeY;
          if (sinkPos.top > srcPos.top) {
            bridgeY = srcPos.top - yOffset;
          } else {
            bridgeY = srcPos.top + yOffset;
          }
          ctx.moveTo(srcPos.left, srcPos.top);
          ctx.lineTo(srcPos.left + xOffset, srcPos.top);
          ctx.lineTo(srcPos.left + xOffset, bridgeY);
          ctx.lineTo(sinkPos.left - xOffset, bridgeY);
          ctx.lineTo(sinkPos.left - xOffset, sinkPos.top);
          ctx.lineTo(sinkPos.left, sinkPos.top);
        },
        "src-right-of-sink": () => {
          let yOffset = 30 / this.scaleY;
          let xOffset = 30 / this.scaleX;
          ctx.moveTo(srcPos.left, srcPos.top);
          ctx.lineTo(srcPos.left + xOffset, srcPos.top);
          if (srcPos.top < sinkPos.top) {
            ctx.lineTo(srcPos.left + xOffset, srcPos.top + yOffset);
            ctx.lineTo(sinkPos.left - xOffset, sinkPos.top - yOffset);
            ctx.lineTo(sinkPos.left - xOffset, sinkPos.top);
            ctx.lineTo(sinkPos.left, sinkPos.top);
          } else {
            ctx.lineTo(srcPos.left + xOffset, srcPos.top - yOffset);
            ctx.lineTo(sinkPos.left - xOffset, sinkPos.top + yOffset);
            ctx.lineTo(sinkPos.left - xOffset, sinkPos.top);
            ctx.lineTo(sinkPos.left, sinkPos.top);
          }
        },
        "default-grid": () => {
          ctx.moveTo(srcPos.left, srcPos.top);
          ctx.lineTo(xMid, srcPos.top);
          ctx.lineTo(xMid, sinkPos.top);
          ctx.lineTo(sinkPos.left, sinkPos.top);
        },
        "default-steep": () => {
          ctx.moveTo(srcPos.left, srcPos.top);
          ctx.lineTo(srcPos.left + xDiff * 0.3, srcPos.top);
          ctx.lineTo(sinkPos.left - xDiff * 0.3, sinkPos.top);
          ctx.lineTo(sinkPos.left, sinkPos.top);
        },
        default: () => {
          ctx.moveTo(srcPos.left, srcPos.top);
          ctx.lineTo(sinkPos.left, sinkPos.top);
        },
      };

      let dx = sinkPos.left - srcPos.left;
      let dy = Math.abs(srcPos.top - sinkPos.top);
      dx *= this.scaleX;
      dy *= this.scaleY;
      let srcRightOfSink = srcPos.left > sinkPos.left;
      let sameParent = terminal1.parent === terminal2.parent;

      if (sameParent || (srcRightOfSink && dy < 70)) {
        drawCases["self-connecting"]();
      } else if (dx < 50 && dy > 70) {
        drawCases["src-right-of-sink"]();
      } else {
        let slope;
        if (dx == 0) {
          slope = 999;
        } else {
          slope = Math.abs(dy / dx);
        }
        if (slope > 0.5) {
          drawCases["default-steep"]();
        } else {
          drawCases["default-steep"]();
          // drawCases["default"]();
        }
      }
      ctx.stroke();
    });

    if (!skipMouse && this.world.previousTerminal && this.mousePos?.x) {
      // if(true && this.world.previousTerminal){
      let terminal = this.world.previousTerminal;
      let pos = calculateOffset(terminal.domElement, this.domElement);
      let jqTerminal = $(terminal.domElement);
      pos.top += jqTerminal.height() / 2;
      pos.left += jqTerminal.width() / 2;
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.moveTo(pos.left, pos.top);
      ctx.lineTo(this.mousePos.x, this.mousePos.y);
      ctx.stroke();
    }

    floatingTerminals.forEach((terminal) => {
      let pos = calculateOffset(terminal.domElement, this.domElement);
      let jqTerminal = $(terminal.domElement);
      pos.top += jqTerminal.height() / 2 / this.scaleY;
      pos.left += jqTerminal.width() / 2 / this.scaleX;
      ctx.beginPath();
      ctx.strokeStyle = terminal.state ? "white" : "#0096d2";
      ctx.lineWidth = 3 / this.scaleX;
      ctx.moveTo(pos.left, pos.top);
      let length = 15 / this.scaleX;
      if (terminal.isSource) {
        ctx.lineTo(pos.left + length, pos.top);
      } else {
        ctx.lineTo(pos.left - length, pos.top);
      }
      ctx.stroke();
    });
  }

  drawIndicators() {
    let size = this.indicatorSize || 10;
    let ctx = this.ctx;
    ctx.fillStyle = this.world.isStable() ? "#4f4" : "#f44";
    ctx.fillRect(0, size, size, size);

    ctx.fillStyle = this.world.tickCount % 2 === 0 ? "#fff" : "#ccc";
    ctx.fillRect(size, 0, size, size);

    // ctx.fillStyle = this.world.previousTerminal ? "#fff" : "#ccc";
    // ctx.fillRect(20, 0, 10, 10);

    // ctx.fillStyle = skipMouse ? "#fff" : "#ccc";
    // ctx.fillRect(30, 0, 10, 10);
  }

  createGateElement(template, functionSpec, x, y, draggable, removeable) {
    x = x || 0.5;
    y = y || 0.5;

    if (x >= 0 && x <= 1) {
      x = x * this.domElement.clientWidth;
    }
    if (y >= 0 && y <= 1) {
      y = y * this.domElement.clientHeight;
    }

    draggable = draggable === undefined ? true : draggable;
    removeable = removeable === undefined ? true : removeable;
    let clone = template.cloneNode(true);
    $(clone).removeClass("logic-gate-div-relative");
    $(clone).addClass("logic-gate-div-absolute");
    clone.style.left = `${x}px`;
    clone.style.top = `${y}px`;
    this.domElement.appendChild(clone);

    let gate = this.world.createLogicGate(functionSpec);
    gate.setDomElement(clone);
    gate._removeable = removeable;
    gate._draggable = draggable;

    function moveToOrigin() {
      gate.domElement.style.transition = "all 0.1s";
      gate.domElement.style.left = x + "px";
      gate.domElement.style.top = y + "px";
      setTimeout(() => {
        gate.domElement.style.transition = "";
      }, 500);
    }

    let __draggable_toggled = false;
    gate._makeDraggable = () => {
      if (__draggable_toggled) return;
      __draggable_toggled = true;
      $(clone).draggable({
        handle: ".logic-gate-body",
        distance: 15,
        start: () => {
          this.eventManager.publish("CANVAS_GATE_MOVE_START", gate);
        },
        stop: () => {
          this.eventManager.publish("CANVAS_GATE_MOVE_END", gate);
          let onCanvas = isInside(gate.domElement, this.domElement);
          let removeable = gate._removeable;
          if (!onCanvas) {
            if (removeable) {
              gate.remove();
            } else {
              moveToOrigin();
            }
          }
          let gateType = gate.funcSpec.name;
  
          let unknownGates = this.world.gates;
          unknownGates = unknownGates.filter(
            (g) => g._removeable && g !== gate
          );
          unknownGates = unknownGates.filter(
            (g) => g.funcSpec.inputCount === gate.funcSpec.inputCount
          );
          unknownGates = unknownGates.filter(
            (g) => g.funcSpec.outputCount === gate.funcSpec.outputCount
          );
          let irs = unknownGates.map((g) => {
            return {
              gate: g,
              intersectionRatio: calculateIntersectionRatio(
                g.domElement,
                gate.domElement
              ),
            };
          });
          irs = irs.filter((ir) => ir.intersectionRatio > 0.5);
          if (irs.length > 0) {
            let target = irs[0].gate;
            this.replaceGate(target, gate);
          }
        },
      });
      $(clone).find(".logic-gate-body").addClass("logic-gate-body-active");
      this.eventManager.once("GATE_REMOVED", (g) => {
        $(clone).draggable("destroy");
      }, (g)=> g === gate);
    }

    if (draggable) {
      gate._makeDraggable();
    }

    gate.domElement.addEventListener("contextmenu", (event) => {
      if (!gate._removeable) return;
      this.eventManager.publish("CANVAS_GATE_REMOVED", gate);
      event.preventDefault();
      gate.remove();
    });

    let inputsContainer = $(clone).find(".logic-gate-input-terminal")[0];
    let outputsContainer = $(clone).find(".logic-gate-output-terminal")[0];

    let inputsTerminals = $(inputsContainer).children();
    let outputsTerminals = $(outputsContainer).children();

    if (inputsTerminals.length !== functionSpec.inputCount) {
      throw new Error("Input count does not match");
    }
    if (outputsTerminals.length !== functionSpec.outputCount) {
      throw new Error("Output count does not match");
    }

    gate.setLabel = (text) => {
      let div = gate.domElement;
      let label = $(div).find(".logic-gate-label")[0];
      label.innerText = text;
    };

    gate.getLabel = () => {
      let div = gate.domElement;
      let label = $(div).find(".logic-gate-label")[0];
      return label.innerText;
    };

    gate.inputTerminals.forEach((terminal, i) => {
      terminal.setDomElement(inputsTerminals[i]);
    });
    gate.outputTerminals.forEach((terminal, i) => {
      terminal.setDomElement(outputsTerminals[i]);
    });

    gate.terminals().forEach((terminal) => {
      setUpTerminal(terminal, this);
    });

    this.eventManager.publish("CANVAS_GATE_CREATED", gate);
    return gate;
  }

  replaceGate(gate, newGate) {
    let wiresFrom = gate.terminals().map((t) => {
      return this.world.getWiresByTerminal(t).map((w) => {
        return t.isSource ? w.terminalSink : w.terminalSrc;
      });
    });
    newGate.domElement.style.left = gate.domElement.style.left;
    newGate.domElement.style.top = gate.domElement.style.top;
    gate.remove();
    this.world.clearSelection();
    wiresFrom.forEach((toTerminals, i) => {
      toTerminals.forEach((toTerminal) => {
        this.world.makeConnection(toTerminal);
        this.world.makeConnection(newGate.terminals()[i]);
      });
    });
    this.eventManager.publish("CANVAS_GATE_REPLACED", {
      oldGate: gate,
      newGate: newGate,
    });
  }

  showConnectableTerminals() {
    let selectedTerminal = this.world?.previousTerminal;
    let selectedIsSource = selectedTerminal?.isSource;

    if (selectedTerminal) {
      selectedTerminal.domElement.classList.add("logic-gate-terminal-selected");
      selectedTerminal.relatedTerminals.forEach((terminal) => {
        let jqTerminal = $(terminal.domElement);
        jqTerminal.addClass("logic-gate-terminal-removeable");
      });
      if (!selectedIsSource && selectedTerminal.relatedTerminals.length > 0)
        return;
      this.world.terminals.forEach((terminal) => {
        if (selectedIsSource !== terminal.isSource) {
          let jqTerminal = $(terminal.domElement);
          jqTerminal.addClass("logic-gate-terminal-connectable");
        }
      });
      this.world.wires.forEach((wire) => {
        $(wire.terminalSink.domElement).removeClass(
          "logic-gate-terminal-connectable"
        );
      });
    } else {
      this.world?.terminals.forEach((terminal) => {
        let jqTerminal = $(terminal.domElement);
        jqTerminal.removeClass("logic-gate-terminal-connectable");
        jqTerminal.removeClass("logic-gate-terminal-removeable");
        jqTerminal.removeClass("logic-gate-terminal-selected");
      });
    }
  }

  createInput(template) {
    template = template || this.templates["IN"];
    let gate = this.createGateElement(
      template,
      functionSpecIN,
      0,
      100,
      false,
      false
    );
    this.world.addInputGate(gate);

    let togglePad = $(gate.domElement).find(".logic-gate-body")[0];
    onInteract(togglePad, () => {
      gate.out(0).toggle();
    });

    this.arrangeIOGates();
    return gate;
  }

  createOutput(template) {
    template = template || this.templates["OUT"];
    let gate = this.createGateElement(
      template,
      functionSpecOUT,
      500,
      100,
      false,
      false
    );
    this.world.addOutputGate(gate);
    this.arrangeIOGates();
    return gate;
  }

  removeInput() {
    let input = this.world.inputs.pop();
    input.remove();
    this.arrangeIOGates();
  }

  removeOutput() {
    let output = this.world.outputs.pop();
    output.remove();
    this.arrangeIOGates();
  }

  arrangeIOGates() {
    let worldInputs = this.world.inputs;
    let worldOutputs = this.world.outputs;
    {
      let stepSize = this.canvas.height / (worldInputs.length + 1);
      let yOffset = stepSize - 25;
      worldInputs.forEach((gate) => {
        gate.domElement.style.left = "0px";
        gate.domElement.style.right = "";
        gate.domElement.style.top = `${yOffset}px`;
        yOffset += stepSize;
      });
    }
    {
      let stepSize = this.canvas.height / (worldOutputs.length + 1);
      let yOffset = stepSize - 25;
      worldOutputs.forEach((gate) => {
        gate.domElement.style.right = "0px";
        gate.domElement.style.left = "";
        gate.domElement.style.top = `${yOffset}px`;
        yOffset += stepSize;
      });
    }
  }

  connect(terminal1, terminal2) {
    this.world.clearSelection();
    this.world.makeConnection(terminal1);
    return this.world.makeConnection(terminal2);
  }

  linkWorld(otherWorld, x, y) {
    let otherCanvas = otherWorld.parent;
    let clone = this.templates["WORLD"].cloneNode(true);
    let inputsContainer = $(clone).find(".logic-gate-input-terminal")[0];
    let outputsContainer = $(clone).find(".logic-gate-output-terminal")[0];

    let terminalTemp = document.createElement("div");
    terminalTemp.classList.add("logic-gate-terminal");

    otherWorld.inputs.forEach((i) => {
      inputsContainer.appendChild(terminalTemp.cloneNode(true));
    });

    otherWorld.outputs.forEach((i) => {
      outputsContainer.appendChild(terminalTemp.cloneNode(true));
    });

    let maxTerminalCount = Math.max(
      otherWorld.inputs.length,
      otherWorld.outputs.length
    );
    let extraHeight = (maxTerminalCount - 3) * 20;
    if (extraHeight > 0) {
      let currentHeight = $(clone).height();
      $(clone).height(currentHeight + extraHeight);
    }

    terminalTemp.remove();
    terminalTemp = null;

    let functionSpecWORLD = new LogicGateFunctionSpec(
      "WORLD",
      () => {},
      otherWorld.inputs.length,
      otherWorld.outputs.length
    );
    let gate = this.createGateElement(
      clone,
      functionSpecWORLD,
      x,
      y,
      true,
      false
    );
    gate._linkedWorld = otherWorld;

    let linkFunction = () => {
      otherWorld.inputs.forEach((inputGate, i) => {
        inputGate.outputTerminals[0].setState(gate.inputTerminals[i].state);
      });
      otherWorld.outputs.forEach((outputGate, i) => {
        gate.outputTerminals[i].setState(outputGate.inputTerminals[0].state);
      });
      otherWorld.tick();
      if (!otherWorld.isStable()) {
        this.world.notifyInstability();
      }
    };
    functionSpecWORLD.func = linkFunction;

    // gate.domElement.addEventListener("contextmenu", (event) => {
    //   gate.remove();
    // });

    this.eventManager.subscribe("GATE_REMOVED", (g)=>{
      if(g === gate){
        otherCanvas.remove();
      }
    })

    let gateTerminalPair = [];

    gate.inputTerminals.forEach((terminal, i) => {
      gateTerminalPair.push([otherWorld.inputs[i], terminal]);
    });

    gate.outputTerminals.forEach((terminal, i) => {
      gateTerminalPair.push([otherWorld.outputs[i], terminal]);
    });

    otherWorld.eventManager.subscribe("GATE_REMOVED", (otherWorldRemovedGate) => {
      let currentPair = gateTerminalPair.find((pair) => pair[0] === otherWorldRemovedGate);
      gateTerminalPair = gateTerminalPair.filter((pair) => pair !== currentPair);
      if(!currentPair) return;
      let terminal = currentPair[1];
      terminal.remove();
    });

    otherWorld.eventManager.subscribe("GATE_INPUT_ADDED", (newInputGate)=>{
      let terminalDom = document.createElement("div");
      terminalDom.classList.add("logic-gate-terminal");
      let gateInputsDom = $(gate.domElement).find(".logic-gate-input-terminal")[0];
      gateInputsDom.appendChild(terminalDom);
      let terminal = new Terminal(gate.world, gate, false);
      terminal.setDomElement(terminalDom);
      gate.inputTerminals.push(terminal);
      setUpTerminal(terminal, this);
      gateTerminalPair.push([newInputGate, terminal]);
    });

    otherWorld.eventManager.subscribe("GATE_OUTPUT_ADDED", (newOutputGate)=>{
      let terminalDom = document.createElement("div");
      terminalDom.classList.add("logic-gate-terminal");
      let gateOutputsDom = $(gate.domElement).find(".logic-gate-output-terminal")[0];
      gateOutputsDom.appendChild(terminalDom);
      let terminal = new Terminal(gate.world, gate, true);
      terminal.setDomElement(terminalDom);
      gate.outputTerminals.push(terminal);
      setUpTerminal(terminal, this);
      gateTerminalPair.push([newOutputGate, terminal]);
    });

    otherWorld.eventManager.subscribe("WORLD_TERMINAL_SELECTED", (otherTerminal) => {
      this.world.clearSelection();
      this.showConnectableTerminals();
      if(!otherTerminal) return; 
      let otherGate = otherTerminal.parent;
      let pair = gateTerminalPair.find((pair) => pair[0] === otherGate);
      if (!pair) return;
      let terminal = pair[1];
      this.world.previousTerminal = terminal;
      this.showConnectableTerminals();
    })

    this.eventManager.subscribe("WORLD_TERMINAL_SELECTED", (terminal) => {
      otherWorld.clearSelection();
      otherCanvas.showConnectableTerminals();
      if(!terminal) return;
      let pair = gateTerminalPair.find((pair) => pair[1] === terminal);
      if (!pair) return;
      let otherGate = pair[0];
      otherWorld.previousTerminal = otherGate.terminals()[0];
      otherCanvas.showConnectableTerminals();
    });

    this.eventManager.publish("CANVAS_WORLD_LINKED", gate);
    otherWorld.eventManager.setUpstreamEventManager(this.eventManager);

    inputsContainer = null;
    outputsContainer = null;

    return gate;
  }

  worldTick() {
    this.world.tick();
  }

  visualTick() {
    this.clearCanvas();
    this.drawGrid();
    this.drawIndicators();
    this.ctx.scale(this.scaleX, this.scaleY);
    this.drawWires();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  startVisualTick() {
    clearInterval(this.slowVisualTick);
    this.visualTickRunning = true;
    const visualTick = () => {
      if (!this.visualTickRunning) return;
      this.visualTick();
      requestAnimationFrame(visualTick);
    };
    requestAnimationFrame(visualTick);
  }

  stopVisualTick() {
    clearInterval(this.slowVisualTick);
    this.slowVisualTick = setInterval(() => {
      this.visualTick();
    }, 100);
    this.visualTickRunning = false;
  }

  startWorldTick(tickPerSecond) {
    tickPerSecond = tickPerSecond || 60;
    if (this.worldTickInterval) {
      clearInterval(this.worldTickInterval);
    }
    this.worldTickInterval = setInterval(() => {
      this.worldTick();
    }, 1000 / tickPerSecond);
  }

  stopWorldTick() {
    clearInterval(this.worldTickInterval);
  }

  loadTemplate(id) {
    let parentDom = $(`#${id}`)[0];
    let class_name_mapping = {
      NOT: "logic-not-template",
      AND: "logic-and-template",
      NAND: "logic-nand-template",
      OR: "logic-or-template",
      NOR: "logic-nor-template",
      XOR: "logic-xor-template",
      XNOR: "logic-xnor-template",
      UNKNOWN: "logic-unknown-template",
      UNKNOWN1: "logic-unknown1-template",
      IN: "logic-in-template",
      OUT: "logic-out-template",
      WORLD: "logic-world-template",
    };
    let result = {};
    for (const [key, value] of Object.entries(class_name_mapping)) {
      result[key] = $(parentDom).find(`.${value}`)[0];
    }
    this.templates = result;
    return result;
  }

  getGateTemplate(gateType) {
    return this.templates[gateType];
  }

  createGate(fundamentalGateType, x, y, draggable, removeable) {
    this.world.clearSelection();
    this.showConnectableTerminals();
    if (x === undefined) x = this.domElement.clientWidth / 2 - 25;
    if (y === undefined) y = this.domElement.clientHeight / 2 - 25;

    if (FundamentalGate[fundamentalGateType] === undefined) {
      console.error("Invalid fundamental gate type");
      return;
    }
    let gateTemplate = this.templates[fundamentalGateType];
    let gateFuncSpec = FundamentalGate[fundamentalGateType].functionSpec;
    let gate = this.createGateElement(
      gateTemplate,
      gateFuncSpec,
      x,
      y,
      draggable,
      removeable
    );
    return gate;
  }

  showWireFrame(e) {
    e = e === undefined ? this.domElement : e;
    let children = $(e).children();
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      $(child).addClass("show-wireframe");
      this.showWireFrame(child);
    }
  }

  hideWireFrame(e) {
    e = e === undefined ? this.domElement : e;
    let children = $(e).find(".show-wireframe");
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      $(child).removeClass("show-wireframe");
    }
  }

  async evaluate(inputs) {
    return await this.world.evaluate(inputs);
  }

  export(compressed) {
    let worldData = this.world.export();

    let gateExport = [];
    worldData.gates.forEach((gate, i) => {
      gate._exportID = i;
      if (gate.funcSpec.name === "WORLD") {
        gateExport.push({
          type: gate.funcSpec.name,
          x: gate.domElement.style.left,
          y: gate.domElement.style.top,
          id: gate._exportID,
          state: gate.getState(),
          worldExport: gate._linkedWorld.parent.export(),
          canvasSize: {
            width: gate._linkedWorld.domElement.clientWidth,
            height: gate._linkedWorld.domElement.clientHeight,
          },
          // label: gate.getLabel(),
        });
      } else if (gate.isFundamental()) {
        gateExport.push({
          type: gate.funcSpec.name,
          x: gate.domElement.style.left,
          y: gate.domElement.style.top,
          id: gate._exportID,
          state: gate.getState(),
          isWorldInput: this.world.inputs.includes(gate),
          isWorldOutput: this.world.outputs.includes(gate),
          // label: gate.getLabel(),
        });
      } else {
        console.error("Unknown gate type");
        return;
      }
    });

    let wireExport = [];
    worldData.wires.forEach((wire) => {
      let terminal1 = wire.terminalSrc;
      let terminal2 = wire.terminalSink;
      let gate1 = terminal1.parent;
      let gate2 = terminal2.parent;
      let terminal1ID = gate1.terminals().indexOf(terminal1);
      let terminal2ID = gate2.terminals().indexOf(terminal2);
      wireExport.push({
        t1: { gateID: gate1._exportID, terminalID: terminal1ID },
        t2: { gateID: gate2._exportID, terminalID: terminal2ID },
        state: wire.state,
      });
    });
    let data = {
      gates: gateExport,
      wires: wireExport,
      canvasSize: {
        width: this.domElement.clientWidth,
        height: this.domElement.clientHeight,
      },
    };

    if(compressed){
      return LZString.compressToBase64(JSON.stringify(data));
    }

    return data;
  }

  _load(data, otherWorldDivContainer) {
    // this.domElement.style.width = data.canvasSize.width + "px";
    // this.domElement.style.height = data.canvasSize.height + "px";
    this.updateCanvas();

    let xScale = this.domElement.clientWidth / data.canvasSize.width;
    let yScale = this.domElement.clientHeight / data.canvasSize.height;
    // console.log(xScale, yScale);

    this.clear();
    let gates = {};
    data.gates.forEach((gateData) => {
      if (gateData.type === "WORLD") {
        let world = new World();
        let div = document.createElement("div");
        div.style.width = gateData.canvasSize.width + "px";
        div.style.height = gateData.canvasSize.height + "px";
        otherWorldDivContainer && otherWorldDivContainer.appendChild(div);
        let canvas = new LogicCanvas(world, div);
        canvas.eventManager.setUpstreamEventManager(this.eventManager);
        canvas.load(gateData.worldExport, otherWorldDivContainer);
        let x = parseInt(gateData.x) * xScale;
        let y = parseInt(gateData.y) * yScale;
        let gate = this.linkWorld(world, x, y);
        gates[gateData.id] = gate;
        gates[gateData.id].setState(gateData.state);
        // gateData.label && gate.setLabel(gateData.label);
      } else if (FundamentalGate[gateData.type] !== undefined) {
        let x = parseInt(gateData.x) * xScale;
        let y = parseInt(gateData.y) * yScale;
        let gate;
        if (gateData.isWorldInput) {
          gate = this.createInput();
        } else if (gateData.isWorldOutput) {
          gate = this.createOutput();
        } else {
          gate = this.createGate(gateData.type, x, y);
        }
        gates[gateData.id] = gate;
        gates[gateData.id].setState(gateData.state);
        // gateData.label && gate.setLabel(gateData.label);
      } else {
        console.error("Unknown gate type", gateData);
        return;
      }
    });
    data.wires.forEach((wireData) => {
      let terminal1 =
        gates[wireData.t1.gateID].terminals()[wireData.t1.terminalID];
      let terminal2 =
        gates[wireData.t2.gateID].terminals()[wireData.t2.terminalID];
      let wire = this.connect(terminal1, terminal2);
      wire.setState(wireData.state);
    });
    this.visualTick();
  }

  exportAsStr() {
    return LZString.compressToBase64(JSON.stringify(this.export()));
  }

  load(str, otherWorldDivContainer) {
    let data = str;
    if (typeof str === "string") {
      try {
        data = JSON.parse(str);
        console.log("Data is string");
      } catch (e) {
        data = JSON.parse(LZString.decompressFromBase64(str));
        console.log("Data is compressed string");
      }
    }else{
      console.log("Data is object");
    }
    try{
      this._load(data, otherWorldDivContainer);
    }catch(e){
      console.error("Error loading data", e);
      console.error("Data", data);
      this.clear();
    }
  }

  clone() {
    let data = this.export();
    let newDiv = this.domElement.cloneNode(false);
    let newCanvas = new LogicCanvas(new World(), newDiv);
    newCanvas.load(data);
    return newCanvas;
  }

  clear(keepIO) {
    if (keepIO) {
      this.world.gates.forEach((gate) => {
        let isInput = this.world.inputs.includes(gate);
        let isOutput = this.world.outputs.includes(gate);
        let isIO = isInput || isOutput;
        if (isIO) return;
        gate.remove();
      });
      this.world.wires.forEach((wire) => {
        wire.remove();
      });
    } else {
      this.world.clear();
    }
  }

  remove() {
    this.clear();
    clearInterval(this.scaleTrackerInterval);
    window.removeEventListener("resize", this.onResize);
    this.stopVisualTick();
    this.stopWorldTick();
    this.visualTickRunning = false;
    clearInterval(this.slowVisualTick);
    this.domElement.remove();
    this.world.remove();
    this.eventManager.publish("CANVAS_REMOVED", this);
  }

  importAsGate(data, x, y, otherWorldDivContainer) {
    if (data instanceof LogicCanvas) {
      data = data.export();
    }
    let newDiv = document.createElement("div");
    newDiv.style.width = "100px";
    newDiv.style.height = "100px";
    otherWorldDivContainer && otherWorldDivContainer.appendChild(newDiv);
    let newWorld = new World();
    let newCanvas = new LogicCanvas(newWorld, newDiv);
    newCanvas.eventManager.setUpstreamEventManager(this.eventManager);
    newCanvas.load(data, otherWorldDivContainer);
    x = x || 0.5;
    y = y || 0.5;
    let gate = this.linkWorld(newCanvas.world, x, y);

    return gate;
  }
}

console.log("logicgate_front.js loaded");

export default LogicCanvas;
export { LogicCanvas, calculateOffset, isInside, onInteract, sleep };
