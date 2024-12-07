let logicGateDefaultTemplate = `
<div id="logic-gate-templates" class="">
  <h3>Logic Gates Preview</h3>
  <div class="logic-gate-div-relative logic-gate logic-and-template">
    <span class="logic-gate-label"></span>
    <img class="logic-gate-image" src="gate-and.png" alt="AND Gate" />
    <div class="logic-gate-input-terminal logic-gate-terminal-container">
    <div class="logic-gate-terminal"></div>
    <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-output-terminal logic-gate-terminal-container">
    <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-body"></div>
  </div>

  <div class="logic-gate-div-relative logic-gate logic-or-template">
    <span class="logic-gate-label"></span>
    <img class="logic-gate-image" src="gate-or.png" alt="OR Gate" />
    <div class="logic-gate-input-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-output-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-body"></div>
  </div>

  <div class="logic-gate-div-relative logic-gate logic-not-template">
    <span class="logic-gate-label"></span>
    <img class="logic-gate-image" src="gate-not.png" alt="NOT Gate" />
    <div class="logic-gate-input-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-output-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-body"></div>
  </div>

  <div class="logic-gate-div-relative logic-gate logic-xor-template">
    <span class="logic-gate-label"></span>
    <img class="logic-gate-image" src="gate-xor.png" alt="XOR Gate" />
    <div class="logic-gate-input-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-output-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-body"></div>
  </div>

  <div class="logic-gate-div-relative logic-gate logic-gate-long logic-nand-template">
    <span class="logic-gate-label"></span>
    <img class="logic-gate-image" src="gate-nand.png" alt="NAND Gate" />
    <div class="logic-gate-input-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-output-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-body"></div>
  </div>

  <div class="logic-gate-div-relative logic-gate logic-gate-long logic-nor-template">
    <span class="logic-gate-label"></span>
    <img class="logic-gate-image" src="gate-nor.png" alt="NOR Gate" />
    <div class="logic-gate-input-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-output-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-body"></div>
  </div>

  <div class="logic-gate-div-relative logic-gate logic-gate-long logic-nxor-template">
    <span class="logic-gate-label"></span>
    <img class="logic-gate-image" src="gate-nxor.png" alt="NXOR Gate" />
    <div class="logic-gate-input-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-output-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-body"></div>
  </div>

  <div class="logic-gate-div-relative logic-gate logic-in-template">
    <span class="logic-gate-label">IN</span>
    <div class="logic-gate-output-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-body"></div>
  </div>

  <div class="logic-gate-div-relative logic-gate logic-out-template">
    <span class="logic-gate-label">OUT</span>
    <div class="logic-gate-input-terminal logic-gate-terminal-container">
      <div class="logic-gate-terminal"></div>
    </div>
    <div class="logic-gate-body"></div>
  </div>

  <div class="logic-gate-div-relative logic-gate logic-world-template">
    <span class="logic-gate-label">USER</span>
    <div class="logic-gate-input-terminal logic-gate-terminal-container"></div>
    <div class="logic-gate-output-terminal logic-gate-terminal-container"></div>
    <div class="logic-gate-body"></div>
  </div>
</div>
`;

export default logicGateDefaultTemplate;
export { logicGateDefaultTemplate };