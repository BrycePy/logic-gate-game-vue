<script>
import { hintCursor } from "@/main";
import { TruthTableLevel } from "../levelbase";
// import TestTemplate from "./testTemplate.vue";

const latchLevel = new TruthTableLevel({
    name: "SR Latch",
    description: "",
    inputs: [
        "S",
        "R"
    ],
    outputs: [
        "Q",
        "Q'"
    ],
    availableGates: undefined,
    truthTable: [
        { inputs: [false, true], outputs: [true, false] },
        { inputs: [false, false], outputs: [true, false] },
        { inputs: [true, false], outputs: [false, true] },
        { inputs: [false, false], outputs: [false, true] },
        { inputs: [true, true], outputs: [false, false] },
      ],
    maxGateCount: 4,
    timeLimit: 300,
    oracles:[
      {text: "To build an SR Latch, start by adding two NOR gates.",
      previousState: "N4Ig5ghgLgpgziAXAbVFAngBxkkBJAORABoQAPXABkwtPVwEYAWBgOgDZ2B2GkkASwAmSSqThRoOFFABOAVxgBdUvzgB1APYyANoLwA7THKhJZCleq26A8saMnEAMwja4MAL7E0WKfiKkKRBBqWhB6IIBmSgAOVgj43hVhRAYxCVgkZDMlC00dPUNjU3kYXKtBWyh7JGdXDy8QDGxcawBVABU+QJA+cJBmNk4eUKEkACY0yUzat2UBS3yDaqcXNzL8yuXsz29moLbOgNxe3CjY+IjEgWSIyYyUGZz5vN0lopW69Zs7d+25gHd+DJ4Jk5gBjCD6ABuEDgAGV+AAvKSgQGCKAACyQ7EoohAGJg/DAGIcAFZce53EA=",
      action: async(logicCanvas)=>{
        let world = logicCanvas.world
        let norGates = world.gates.filter(gate => gate.funcSpec.name === "NOR")
        if(norGates.length == 0){
          let g1 = await hintCursor.addGate("NOR")
          await hintCursor.moveGate(g1, 0.5, 0.35)
          let g2 = await hintCursor.addGate("NOR")
          await hintCursor.moveGate(g2, 0.5, 0.65)
        }else if(norGates.length == 1){
          let g1 = norGates[0]
          await hintCursor.moveGate(g1, 0.5, 0.35)
          let g2 = await hintCursor.addGate("NOR")
          await hintCursor.moveGate(g2, 0.5, 0.65)
        }else{
          norGates.slice(2).forEach(gate => gate.remove())
          await hintCursor.moveGate(norGates[0], 0.5, 0.35)
          await hintCursor.moveGate(norGates[1], 0.5, 0.65)
        }
      }},
      {text: "Connect the output of the first NOR gate to the input of the second, and vice versa.",
      previousState: "N4Ig5ghgLgpgziAXAbVFAngBxkkBJAORABoQAPXABkwtPVwEYAWBgOgDZ2B2GkkASwAmSSqThRoOFFABOAVxgBdUvzgB1APYyANoLwA7THKhJZCleq26A8saMnEAMwja4MAL7E0WKfiKkKRBBqWhB6IIBmSgAOVgj43hVhRAYxCVgkZDMlC00dPUNjU3kYXKtBWyh7JGdXDy8QDGxcawBVABU+QJA+cJBmNk4eUKEkACY0yUzat2UBS3yDaqcXNzL8yuXsz29moLbOgNxe3CjY+IjEgWSIyYyUGZz5vN0lopW69Zs7d+2Gpt8BGsACUurgxlxLqE+gwAKwRViUBjsK6jRBMO5SZCPYg47JzVQvArLHHPcqbd6PHaNHy4IGgo5BCFMRFjWFXPpRSiIiIokbJWGY6arUp4koEhavQoOUmE8k/GUi9xzADu/Bk8EycwAxhB9AA3CBwADK/AAXlJQGrBFAABZIdiUUQgW0wfhgW0OWFO9zuIA===",
      action: async(logicCanvas)=>{
        let world = logicCanvas.world
        let norGates = world.gates.filter(gate => gate.funcSpec.name === "NOR")
        if(norGates.length < 2){
          let message = "You need to use two NOR gates. Try the previous hint."
          alert(message)
          return message
        }
        let g1 = norGates[0]
        let g2 = norGates[1]
        await hintCursor.addWire(g1.out(0), g2.in(0))
        await hintCursor.addWire(g2.out(0), g1.in(1))
      }},
      {text: "Connect the S input to the first NOR gate and the R input to the second NOR gate.",
      previousState: "N4Ig5ghgLgpgziAXAbVFAngBxkkBJAORABoQAPXABkwtPVwEYAWBgOgDZ2B2GkkASwAmSSqThRoOFFABOAVxgBdUvzgB1APYyANoLwA7THKhJZCleq26A8saMnEAMwja4MAL7E0WKfiKkKRBBqWhB6IIBmSgAOVgj43hVhRAYxCVgkZDMlC00dPUNjU3kYXKtBWyh7JGdXDy8QDGxcawBVABU+QJA+cJBmNk4eUKEkACY0yUzat2UBS3yDaqcXNzL8yuXsz29moLbOgNxe3CjY+IjEgWSIyYyUGZz5vN0lopW69Zs7d+2Gpt8BGsACUurgxlxLqE+gwAKxQvijRBMO5SZCPYgY7JzVQvArLDHPcqbd6PHaNHy4IGgo5BCFMK59KIhRHJWGozLZTGrUqPHELV6FByE3HEn7CnnuOYAd34MngmTQDCQoEgsDwABEkCjGjAZABbfj6Fya8aeRpjFXgSSmxDs3UGo0mrWISjm8RTRB/JVWtUwW322CO43aW1jc1QS2IVU2l06oOGkO2hju9JSMlzADGEH0ADcIHAAMr8ABeUlAssEUAAFkh2JRRCBqzB+GBqw5YQ33O4gA==",
      action: async(logicCanvas)=>{
        let world = logicCanvas.world
        let norGates = world.gates.filter(gate => gate.funcSpec.name === "NOR")
        if(norGates.length < 2){
          let message = "You need to use two NOR gates. Try the previous hint."
          alert(message)
          return message
        }
        let g1 = norGates[0]
        let g2 = norGates[1]
        let g1In = world.getWiresByTerminal(g1.in(0)).length? g1.in(1): g1.in(0)
        let g2In = world.getWiresByTerminal(g2.in(0)).length? g2.in(1): g2.in(0)
        await hintCursor.addWire(world.inputs[0].out(0), g1In)
        await hintCursor.addWire(world.inputs[1].out(0), g2In)
      }},
      {text: "Almost done! Connect the output of the first NOR gate to Q and the second to Q'.",
      previousState: "N4Ig5ghgLgpgziAXAbVFAngBxkkBJAORABoQAPXABkwtPVwEYAWBgOgDZ2B2GkkASwAmSSqThRoOFFABOAVxgBdUvzgB1APYyANoLwA7THKhJZCleq26A8saMnEAMwja4MAL7E0WKfiKkKRBBqWhB6IIBmSgAOVgj43hVhRAYxCVgkZDMlC00dPUNjU3kYXKtBWyh7JGdXDy8QDGxcawBVABU+QJA+cJBmNk4eUKEkACY0yUzat2UBS3yDaqcXNzL8yuXsz29moLbOgNxe3CjY+IjEgWSIyYyUGZz5vN0lopW69Zs7d+2Gpt8BGsACUurgxlxLqE+gwAKxQvijRBMO5SLIlYiPTGrJ6qF4FZZY57lTbvR47Ro+XBA0FHIIQphXPpREKI5Kw1HTHHEbLYupzPHlN4OImCjY/EU49xzADu/Bk8EyaAYSFAkFgeAAIkgUY0YDIALb8fQuLXjTyNMaq8CSM2IDl6w3G03axCUC3iKYfNwUqAqxBq22uh2wJ0m7R2sYWqBWgM2jWu3Who3hu0MD3pKTk/7+wMJkSkZPOiOu92F2N5mB2pP6lMukQZr1/ZXW9VV12pR11ksN8utoNIEO14tpxv3bZzADGEH0ADcIHAAMr8ABeUlAcsEUAAFkh2JRRCBtzB+GBtw5YQf3O4gA==",
      action: async(logicCanvas)=>{
        let world = logicCanvas.world
        let norGates = world.gates.filter(gate => gate.funcSpec.name === "NOR")
        if(norGates.length < 2){
          let message = "You need to use two NOR gates. Try previous hint."
          alert(message)
          return message
        }
        let g1 = norGates[0]
        let g2 = norGates[1]
        await hintCursor.addWire(g1.out(0), world.outputs[0].in(0))
        await hintCursor.addWire(g2.out(0), world.outputs[1].in(0))
      }},
    ]
})

export default latchLevel;
</script>

<template>
    <div>
      <p>
        <b>What is an SR Latch?</b> - An SR (Set-Reset) Latch is a basic 
        sequential circuit used to store a single bit of information. Unlike 
        combinational circuits, it has memory, meaning its output depends not 
        only on the current inputs but also on its previous state.
        <br /><br />
        <b>Inputs:</b><br />
        <b>S (Set):</b> Sets the output to 1.<br />
        <b>R (Reset):</b> Resets the output to 0.<br />
        <br />
        <b>Outputs:</b><br />
        <b>Q:</b> Current state.<br />
        <b>Q':</b> Complement of Q.<br />
        <br />
        <img
          src="https://sub.allaboutcircuits.com/images/04173.png"
          class="diagram"
        ></img>
        <br />
        <b>Why is it important?</b> - SR Latches are fundamental building blocks 
        for flip-flops and memory elements in digital systems. They provide a 
        way to maintain a stable output state based on input and past conditions.
        <br /><br />
        <a
          href="https://en.wikipedia.org/wiki/Flip-flop_(electronics)#SR_NOR_latch"
            class="readmore"
        >
          Read More
        </a>
      </p>
    </div>
</template>

<!-- style={{textAlign: "right", display: "inline-block", width: "100%" -->

<style scoped>
.diagram {
    width: 400px;
    margin-left: auto;
    margin-right: auto;
    display: block;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 1em;
    padding: 0.5em;
    opacity: 0.8;
}

.readmore {
    text-align: right !important;
    display: inline-block;
    width: 100%;
}
</style>