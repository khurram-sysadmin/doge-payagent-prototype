const workflows = {
  restaurant: {
    type: "Restaurant Booking",
    title: "Tokyo sushi reservation",
    subtitle: "Doge finds a supported Tokyo restaurant, prepares the booking, then waits for approval before Mantle payment.",
    request: "Hi Doge, book sushi in Tokyo tonight from 7-9 PM for 2 people.",
    image: "https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
    credit: "Photo: Ryunosuke Kikuno / Unsplash",
    target: "Sakura Sushi Ginza",
    location: "Ginza, Tokyo",
    amount: "12.00 USDC",
    token: "USDC demo",
    recipient: "0x7a90...D0GE",
    intentTitle: "Book a table",
    itemsTitle: "Reservation packet",
    confidence: "96%",
    approval: "Merchant slot + wallet",
    readyStatus: "Slot ready",
    confirmedStatus: "Slot confirmed",
    proofStatus: "Reservation paid",
    prompt: "Restaurant booking is selected.",
    requestPrefix: "DOGE-TYO",
    details: [
      ["Cuisine", "Sushi"],
      ["Time", "7:00 PM - 9:00 PM"],
      ["Guests", "2"],
      ["Constraint", "Supported Tokyo merchant"],
      ["Confidence", "96%"],
      ["Payment gate", "Manual Mantle approval"],
    ],
    items: [
      { name: "Sakura Sushi Ginza", meta: "Ginza partner restaurant", price: "12.00 USDC" },
      { name: "Table for 2", meta: "Tonight, 7:30 PM preferred slot", price: "Reserved" },
      { name: "Deposit request", meta: "Held until user wallet approval", price: "Mantle" },
    ],
  },
  food: {
    type: "Food Order",
    title: "Prepared dinner delivery",
    subtitle: "Doge builds a takeout order from supported food partners, checks delivery details, and pauses before payment approval.",
    request: "Hi Doge, order ramen and gyoza for delivery near Shibuya around 8 PM.",
    image: "https://images.unsplash.com/photo-1752070182361-9fa562ed7f97?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
    credit: "Photo: JESHOOTS.COM / Unsplash",
    target: "Shibuya Ramen House",
    location: "Shibuya delivery zone",
    amount: "18.40 USDC",
    token: "USDC demo",
    recipient: "0x4b18...TYO1",
    intentTitle: "Order food",
    itemsTitle: "Food basket",
    confidence: "94%",
    approval: "Order total + wallet",
    readyStatus: "Order ready",
    confirmedStatus: "Kitchen accepted",
    proofStatus: "Delivery paid",
    prompt: "Food order flow is selected.",
    requestPrefix: "DOGE-FD",
    details: [
      ["Cuisine", "Ramen"],
      ["Delivery ETA", "35-45 min"],
      ["Items", "2 dishes"],
      ["Constraint", "Supported food partner"],
      ["Confidence", "94%"],
      ["Payment gate", "Manual Mantle approval"],
    ],
    items: [
      { name: "Tonkotsu ramen", meta: "No extra spice, regular size", price: "11.20 USDC" },
      { name: "Gyoza set", meta: "6 pieces with dipping sauce", price: "5.20 USDC" },
      { name: "Delivery and service", meta: "Shibuya area handoff", price: "2.00 USDC" },
    ],
  },
  shopping: {
    type: "Shopping Cart",
    title: "Amazon-style cart preparation",
    subtitle: "Doge assembles a shopping cart from product preferences, summarizes cost and seller data, then waits for user approval.",
    request: "Hi Doge, prepare a shopping cart with wireless headphones and a phone charger under 80 dollars.",
    image: "https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
    credit: "Photo: Roberto Cortese / Unsplash",
    target: "Electronics cart",
    location: "Online marketplace",
    amount: "76.80 USDC",
    token: "USDC demo",
    recipient: "0x91c2...CART",
    intentTitle: "Prepare cart",
    itemsTitle: "Shopping basket",
    confidence: "91%",
    approval: "Cart review + wallet",
    readyStatus: "Cart ready",
    confirmedStatus: "Cart locked",
    proofStatus: "Checkout paid",
    prompt: "Shopping cart flow is selected.",
    requestPrefix: "DOGE-CART",
    details: [
      ["Category", "Electronics"],
      ["Budget", "Under 80 USD"],
      ["Items", "2 products"],
      ["Constraint", "Amazon-style demo"],
      ["Confidence", "91%"],
      ["Payment gate", "Manual Mantle approval"],
    ],
    items: [
      { name: "Wireless headphones", meta: "High-rated compact model", price: "49.90 USDC" },
      { name: "USB-C fast charger", meta: "30W charger with cable", price: "19.90 USDC" },
      { name: "Estimated tax/shipping", meta: "Demo checkout estimate", price: "7.00 USDC" },
    ],
  },
};

const state = {
  activeFlow: "restaurant",
  stage: "capture",
  requestId: "",
  txHash: "",
  recognition: null,
  isListening: false,
  rows: {
    restaurant: { status: "Waiting", approval: "Not started", proof: "No proof" },
    food: { status: "Waiting", approval: "Not started", proof: "No proof" },
    shopping: { status: "Waiting", approval: "Not started", proof: "No proof" },
  },
};

const elements = {
  resetBtn: document.getElementById("resetBtn"),
  voiceBtn: document.getElementById("voiceBtn"),
  demoVoiceBtn: document.getElementById("demoVoiceBtn"),
  runAgentBtn: document.getElementById("runAgentBtn"),
  requestText: document.getElementById("requestText"),
  speakReplyToggle: document.getElementById("speakReplyToggle"),
  voiceHint: document.getElementById("voiceHint"),
  tabs: Array.from(document.querySelectorAll(".workflow-tab")),
  flowImage: document.getElementById("flowImage"),
  flowHero: document.querySelector(".workflow-hero"),
  flowType: document.getElementById("flowType"),
  flowTitle: document.getElementById("flowTitle"),
  flowSubtitle: document.getElementById("flowSubtitle"),
  imageCredit: document.getElementById("imageCredit"),
  summaryTarget: document.getElementById("summaryTarget"),
  summaryLocation: document.getElementById("summaryLocation"),
  summaryAmount: document.getElementById("summaryAmount"),
  summaryStatus: document.getElementById("summaryStatus"),
  intentTitle: document.getElementById("intentTitle"),
  itemsTitle: document.getElementById("itemsTitle"),
  intentGrid: document.getElementById("intentGrid"),
  preparedList: document.getElementById("preparedList"),
  confirmBtn: document.getElementById("confirmBtn"),
  approvePaymentBtn: document.getElementById("approvePaymentBtn"),
  verifyPaymentBtn: document.getElementById("verifyPaymentBtn"),
  paymentStatus: document.getElementById("paymentStatus"),
  requestId: document.getElementById("requestId"),
  paymentToken: document.getElementById("paymentToken"),
  paymentRecipient: document.getElementById("paymentRecipient"),
  paymentAmount: document.getElementById("paymentAmount"),
  txHash: document.getElementById("txHash"),
  agentState: document.getElementById("agentState"),
  timeline: Array.from(document.querySelectorAll(".timeline-step")),
  opsTable: document.getElementById("opsTable"),
  activityList: document.getElementById("activityList"),
};

function activeWorkflow() {
  return workflows[state.activeFlow];
}

function makeRequestId(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function makeTxHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let index = 0; index < 64; index += 1) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function speak(message) {
  if (!elements.speakReplyToggle.checked || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function addActivity(title, body) {
  const item = document.createElement("div");
  item.className = "activity-item";
  item.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
  elements.activityList.prepend(item);
}

function rowClass(status) {
  if (status.includes("paid") || status.includes("accepted") || status.includes("confirmed")) return "ready";
  if (status.includes("Prepared") || status.includes("Wallet")) return "pending";
  return "waiting";
}

function renderOpsTable() {
  elements.opsTable.innerHTML = "";
  Object.entries(workflows).forEach(([id, flow]) => {
    const row = state.rows[id];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${id === state.activeFlow && state.requestId ? state.requestId : "--"}</td>
      <td>${flow.type}</td>
      <td>${flow.target}</td>
      <td>${flow.amount}</td>
      <td>${row.approval}</td>
      <td><code>${row.proof}</code></td>
      <td><span class="row-status ${rowClass(row.status)}">${row.status}</span></td>
    `;
    elements.opsTable.appendChild(tr);
  });
}

function renderIntent(flow) {
  elements.intentGrid.innerHTML = "";
  flow.details.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    elements.intentGrid.appendChild(item);
  });
}

function renderItems(flow) {
  elements.preparedList.innerHTML = "";
  flow.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "prepared-item";
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <em>${item.meta}</em>
      </div>
      <div class="prepared-price">${item.price}</div>
    `;
    elements.preparedList.appendChild(row);
  });
}

function setStage(stage) {
  state.stage = stage;
  const order = ["capture", "prepare", "confirm", "approve", "proof"];
  const index = order.indexOf(stage);

  elements.timeline.forEach((step) => {
    const stepIndex = order.indexOf(step.dataset.step);
    step.classList.toggle("complete", index > stepIndex);
    step.classList.toggle("active", index === stepIndex);
  });

  const labels = {
    capture: "Idle",
    prepare: "Preparing",
    confirm: "Confirming",
    approve: "Approval",
    proof: "Verified",
  };
  elements.agentState.textContent = labels[stage];
  elements.agentState.className = `state-pill ${stage === "proof" ? "verified" : stage === "capture" ? "" : "pending"}`;
}

function setPaymentState(label, className = "") {
  elements.paymentStatus.textContent = label;
  elements.paymentStatus.className = `state-pill ${className}`;
}

function updateButtons() {
  elements.confirmBtn.disabled = state.stage !== "prepare";
  elements.approvePaymentBtn.disabled = state.stage !== "confirm";
  elements.verifyPaymentBtn.disabled = state.stage !== "approve";
}

function updateFlowView(useTransition = false) {
  const flow = activeWorkflow();

  elements.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.flow === state.activeFlow);
  });

  if (useTransition) {
    elements.flowHero.classList.add("is-switching");
    window.setTimeout(() => elements.flowHero.classList.remove("is-switching"), 220);
  }

  elements.flowImage.src = flow.image;
  elements.flowImage.alt = `${flow.type} visual`;
  elements.flowType.textContent = flow.type;
  elements.flowTitle.textContent = flow.title;
  elements.flowSubtitle.textContent = flow.subtitle;
  elements.imageCredit.textContent = flow.credit;
  elements.voiceHint.textContent = flow.prompt;
  elements.requestText.value = flow.request;
  elements.summaryTarget.textContent = flow.target;
  elements.summaryLocation.textContent = flow.location;
  elements.summaryAmount.textContent = flow.amount;
  elements.summaryStatus.textContent = state.rows[state.activeFlow].status;
  elements.intentTitle.textContent = flow.intentTitle;
  elements.itemsTitle.textContent = flow.itemsTitle;
  elements.paymentToken.textContent = flow.token;
  elements.paymentRecipient.textContent = flow.recipient;
  elements.paymentAmount.textContent = flow.amount;

  renderIntent(flow);
  renderItems(flow);
  renderOpsTable();
  updateButtons();
}

function resetActiveFlow() {
  const flow = activeWorkflow();
  state.stage = "capture";
  state.requestId = "";
  state.txHash = "";
  state.rows[state.activeFlow] = {
    status: "Waiting",
    approval: "Not started",
    proof: "No proof",
  };
  elements.requestId.textContent = "Not created";
  elements.txHash.textContent = "No transaction yet";
  elements.summaryStatus.textContent = "Waiting";
  setPaymentState("Waiting");
  setStage("capture");
  updateButtons();
  renderOpsTable();
  addActivity("Flow reset", `${flow.type} is ready for a new request.`);
}

function runAgent() {
  const flow = activeWorkflow();
  state.requestId = makeRequestId(flow.requestPrefix);
  state.rows[state.activeFlow] = {
    status: "Prepared",
    approval: flow.approval,
    proof: "Awaiting user",
  };
  elements.requestId.textContent = state.requestId;
  elements.summaryStatus.textContent = flow.readyStatus;
  setPaymentState("Review required", "pending");
  setStage("prepare");
  updateButtons();
  renderOpsTable();
  addActivity("Agent prepared request", `${flow.target} is ready for user review. Amount: ${flow.amount}.`);
  speak(`I prepared ${flow.type.toLowerCase()} for ${flow.target}. Please review before payment.`);
}

function confirmPreparedRequest() {
  const flow = activeWorkflow();
  state.rows[state.activeFlow].status = flow.confirmedStatus;
  state.rows[state.activeFlow].approval = "Ready for wallet";
  elements.summaryStatus.textContent = flow.confirmedStatus;
  setPaymentState("Wallet approval", "pending");
  setStage("confirm");
  updateButtons();
  renderOpsTable();
  addActivity("Request confirmed", `${flow.target} is locked. Payment still requires user wallet approval.`);
  speak(`${flow.target} is confirmed. Payment is waiting for your Mantle approval.`);
}

function approvePayment() {
  const flow = activeWorkflow();
  state.txHash = makeTxHash();
  state.rows[state.activeFlow].status = "Wallet approved";
  state.rows[state.activeFlow].approval = "Approved";
  state.rows[state.activeFlow].proof = "Pending verify";
  elements.txHash.textContent = state.txHash;
  elements.summaryStatus.textContent = "Wallet approved";
  setPaymentState("Tx submitted", "pending");
  setStage("approve");
  updateButtons();
  renderOpsTable();
  addActivity("Mantle transaction submitted", `${flow.amount} approval created for ${flow.recipient}.`);
  speak("Mantle transaction submitted. Verifying the proof now keeps the request auditable.");
}

function verifyPayment() {
  const flow = activeWorkflow();
  const shortHash = `${state.txHash.slice(0, 8)}...${state.txHash.slice(-6)}`;
  state.rows[state.activeFlow].status = flow.proofStatus;
  state.rows[state.activeFlow].approval = "Approved";
  state.rows[state.activeFlow].proof = shortHash;
  elements.summaryStatus.textContent = flow.proofStatus;
  setPaymentState("Verified", "verified");
  setStage("proof");
  updateButtons();
  renderOpsTable();
  addActivity("Mantle proof verified", `${flow.type} completed with proof ${shortHash}.`);
  speak(`${flow.type} is complete. Mantle payment proof is verified.`);
}

function setVoiceState(label, listening = false) {
  state.isListening = listening;
  elements.voiceHint.textContent = label;
  elements.voiceBtn.classList.toggle("listening", listening);
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setVoiceState(activeWorkflow().prompt);
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.lang = "en-US";
  state.recognition.interimResults = true;
  state.recognition.continuous = false;

  state.recognition.onstart = () => {
    setVoiceState("Listening for your request...", true);
    setStage("capture");
    addActivity("Voice session started", "Browser microphone is listening.");
  };

  state.recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ");
    elements.requestText.value = transcript;

    if (event.results[event.results.length - 1].isFinal) {
      setVoiceState("Voice captured", false);
      addActivity("Voice captured", transcript);
      runAgent();
    }
  };

  state.recognition.onerror = () => {
    setVoiceState("Microphone unavailable. Demo voice still works.", false);
    addActivity("Microphone issue", "Use Demo Voice or edit the transcript.");
  };

  state.recognition.onend = () => {
    if (state.isListening) setVoiceState(activeWorkflow().prompt, false);
  };
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.activeFlow = tab.dataset.flow;
    state.stage = "capture";
    state.requestId = "";
    state.txHash = "";
    elements.requestId.textContent = "Not created";
    elements.txHash.textContent = "No transaction yet";
    setPaymentState("Waiting");
    setStage("capture");
    updateFlowView(true);
    addActivity("Workflow changed", `${activeWorkflow().type} selected.`);
  });
});

elements.voiceBtn.addEventListener("click", () => {
  if (!state.recognition) {
    setVoiceState("Demo voice captured", false);
    runAgent();
    return;
  }

  if (state.isListening) {
    state.recognition.stop();
    setVoiceState(activeWorkflow().prompt, false);
    return;
  }

  state.recognition.start();
});

elements.demoVoiceBtn.addEventListener("click", () => {
  const flow = activeWorkflow();
  elements.requestText.value = flow.request;
  setVoiceState("Demo voice captured", false);
  addActivity("Demo voice captured", flow.request);
  runAgent();
});

elements.runAgentBtn.addEventListener("click", runAgent);
elements.confirmBtn.addEventListener("click", confirmPreparedRequest);
elements.approvePaymentBtn.addEventListener("click", approvePayment);
elements.verifyPaymentBtn.addEventListener("click", verifyPayment);
elements.resetBtn.addEventListener("click", resetActiveFlow);

initSpeechRecognition();
updateFlowView();
setStage("capture");
setPaymentState("Waiting");
renderOpsTable();
addActivity("System ready", "Doge PayAgent is online with three approval-gated commerce flows.");
