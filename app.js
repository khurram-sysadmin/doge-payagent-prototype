const merchants = [
  {
    id: "sakura-sushi-ginza",
    name: "Sakura Sushi Ginza",
    area: "Ginza",
    cuisine: "Sushi",
    slot: "7:30 PM",
    deposit: "12.00",
    token: "Supported stable token",
    recipient: "0x7a90...D0GE",
    description: "Premium sushi partner with a 7:30 PM table for 2.",
  },
  {
    id: "shibuya-ramen-house",
    name: "Shibuya Ramen House",
    area: "Shibuya",
    cuisine: "Ramen",
    slot: "8:00 PM",
    deposit: "8.00",
    token: "Supported stable token",
    recipient: "0x4b18...TYO1",
    description: "Fast casual Tokyo partner with evening availability.",
  },
  {
    id: "asakusa-izakaya-lab",
    name: "Asakusa Izakaya Lab",
    area: "Asakusa",
    cuisine: "Izakaya",
    slot: "7:45 PM",
    deposit: "10.00",
    token: "Supported stable token",
    recipient: "0x91c2...TYO2",
    description: "Group-friendly partner for local service booking demos.",
  },
];

const state = {
  bookingId: "",
  txHash: "",
  timestamp: "",
  step: 1,
  selectedMerchantId: merchants[0].id,
  recognition: null,
  isListening: false,
  extracted: {
    cuisine: "Sushi",
    city: "Tokyo",
    time: "7:00 PM - 9:00 PM",
    guests: "2",
  },
};

const elements = {
  overallStatus: document.getElementById("overallStatus"),
  requestText: document.getElementById("requestText"),
  voiceBtn: document.getElementById("voiceBtn"),
  demoVoiceBtn: document.getElementById("demoVoiceBtn"),
  voiceStatus: document.getElementById("voiceStatus"),
  voiceOrb: document.getElementById("voiceOrb"),
  speakReplyToggle: document.getElementById("speakReplyToggle"),
  analyzeBtn: document.getElementById("analyzeBtn"),
  resetBtn: document.getElementById("resetBtn"),
  createReservationBtn: document.getElementById("createReservationBtn"),
  acceptSlotBtn: document.getElementById("acceptSlotBtn"),
  rejectSlotBtn: document.getElementById("rejectSlotBtn"),
  approvePaymentBtn: document.getElementById("approvePaymentBtn"),
  verifyPaymentBtn: document.getElementById("verifyPaymentBtn"),
  downloadReceiptBtn: document.getElementById("downloadReceiptBtn"),
  copySummaryBtn: document.getElementById("copySummaryBtn"),
  merchantList: document.getElementById("merchantList"),
  merchantCount: document.getElementById("merchantCount"),
  intentConfidence: document.getElementById("intentConfidence"),
  detailCuisine: document.getElementById("detailCuisine"),
  detailCity: document.getElementById("detailCity"),
  detailTime: document.getElementById("detailTime"),
  detailGuests: document.getElementById("detailGuests"),
  detailDeposit: document.getElementById("detailDeposit"),
  selectedMerchantName: document.getElementById("selectedMerchantName"),
  selectedMerchantDescription: document.getElementById("selectedMerchantDescription"),
  selectedMerchantArea: document.getElementById("selectedMerchantArea"),
  selectedMerchantSlot: document.getElementById("selectedMerchantSlot"),
  selectedMerchantDeposit: document.getElementById("selectedMerchantDeposit"),
  agentState: document.getElementById("agentState"),
  agentSteps: Array.from(document.querySelectorAll(".rail-step")),
  eventFeed: document.getElementById("eventFeed"),
  reservationStatus: document.getElementById("reservationStatus"),
  reservationSummary: document.getElementById("reservationSummary"),
  merchantDecision: document.getElementById("merchantDecision"),
  bookingId: document.getElementById("bookingId"),
  paymentDeposit: document.getElementById("paymentDeposit"),
  paymentToken: document.getElementById("paymentToken"),
  paymentNetwork: document.getElementById("paymentNetwork"),
  paymentRecipient: document.getElementById("paymentRecipient"),
  txHash: document.getElementById("txHash"),
  receiptState: document.getElementById("receiptState"),
  receiptBody: document.getElementById("receiptBody"),
  merchantFinalStatus: document.getElementById("merchantFinalStatus"),
  paymentFinalStatus: document.getElementById("paymentFinalStatus"),
  dogeReply: document.getElementById("dogeReply"),
  ladderSteps: Array.from(document.querySelectorAll(".ladder-step")),
};

function selectedMerchant() {
  return merchants.find((merchant) => merchant.id === state.selectedMerchantId) || merchants[0];
}

function addEvent(title, body) {
  const item = document.createElement("div");
  item.className = "feed-item";
  item.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
  elements.eventFeed.prepend(item);
}

function speak(message) {
  if (!elements.speakReplyToggle.checked || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function setVoiceState(status, listening = false) {
  state.isListening = listening;
  elements.voiceStatus.textContent = status;
  elements.voiceOrb.classList.toggle("listening", listening);
  elements.voiceBtn.textContent = listening ? "Listening..." : "Start Voice Request";
}

function setAgentStage(stage) {
  const order = ["voice", "intent", "merchant", "approval", "payment"];
  const currentIndex = order.indexOf(stage);
  elements.agentSteps.forEach((step) => {
    const stepIndex = order.indexOf(step.dataset.agentStep);
    step.classList.toggle("complete", currentIndex > stepIndex);
    step.classList.toggle("active", currentIndex === stepIndex);
  });
}

function setBookingStep(step) {
  state.step = step;
  elements.ladderSteps.forEach((item) => {
    const itemStep = Number(item.dataset.step);
    item.classList.toggle("complete", itemStep < step);
    item.classList.toggle("active", itemStep === step);
  });
}

function makeBookingId() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `DOGE-TYO-${suffix}`;
}

function makeTxHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let index = 0; index < 64; index += 1) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function parseRequest(text) {
  const lower = text.toLowerCase();
  const cuisine = lower.includes("ramen")
    ? "Ramen"
    : lower.includes("izakaya")
      ? "Izakaya"
      : lower.includes("sushi")
        ? "Sushi"
        : "Any supported cuisine";

  const guestsMatch = lower.match(/for\s+(\d+)\s*(people|guests|person)?/);
  const guests = guestsMatch ? guestsMatch[1] : "2";

  return {
    cuisine,
    city: "Tokyo",
    time: "7:00 PM - 9:00 PM",
    guests,
  };
}

function rankMerchant(extracted) {
  const match = merchants.find((merchant) => merchant.cuisine === extracted.cuisine);
  return match ? match.id : merchants[0].id;
}

function renderMerchants() {
  elements.merchantCount.textContent = `${merchants.length} partners`;
  elements.merchantList.innerHTML = "";

  merchants.forEach((merchant) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "merchant-option";
    option.classList.toggle("selected", merchant.id === state.selectedMerchantId);
    option.innerHTML = `
      <strong>${merchant.name}</strong>
      <span>${merchant.area} | ${merchant.cuisine} | ${merchant.slot}</span>
      <em>${merchant.deposit} token deposit</em>
    `;
    option.addEventListener("click", () => {
      state.selectedMerchantId = merchant.id;
      updateMerchantDisplay();
      renderMerchants();
      if (state.step >= 1 && !state.bookingId) {
        elements.createReservationBtn.disabled = false;
      }
      addEvent("Merchant selected", `${merchant.name} is now the active booking target.`);
    });
    elements.merchantList.appendChild(option);
  });
}

function updateExtractedDetails() {
  const merchant = selectedMerchant();
  elements.detailCuisine.textContent = state.extracted.cuisine;
  elements.detailCity.textContent = state.extracted.city;
  elements.detailTime.textContent = state.extracted.time;
  elements.detailGuests.textContent = state.extracted.guests;
  elements.detailDeposit.textContent = `${merchant.deposit} ${merchant.token}`;
}

function updateMerchantDisplay() {
  const merchant = selectedMerchant();
  elements.selectedMerchantName.textContent = merchant.name;
  elements.selectedMerchantDescription.textContent = merchant.description;
  elements.selectedMerchantArea.textContent = merchant.area;
  elements.selectedMerchantSlot.textContent = merchant.slot;
  elements.selectedMerchantDeposit.textContent = `${merchant.deposit} token`;
  elements.paymentDeposit.textContent = `${merchant.deposit} ${merchant.token}`;
  elements.paymentToken.textContent = merchant.token;
  elements.paymentNetwork.textContent = "Mantle";
  elements.paymentRecipient.textContent = merchant.recipient;
  updateExtractedDetails();
}

function receiptText() {
  const merchant = selectedMerchant();
  return [
    "Doge PayAgent Booking Receipt",
    "",
    `Booking ID: ${state.bookingId}`,
    `Merchant: ${merchant.name}`,
    `Area: ${merchant.area}, Tokyo`,
    `Cuisine: ${merchant.cuisine}`,
    `Guests: ${state.extracted.guests}`,
    `Time: ${merchant.slot}`,
    `Deposit: ${merchant.deposit} ${merchant.token}`,
    "Network: Mantle",
    `Recipient: ${merchant.recipient}`,
    `Transaction: ${state.txHash}`,
    `Timestamp: ${state.timestamp}`,
    "Status: Confirmed + Paid",
  ].join("\n");
}

function runAnalysis() {
  state.bookingId = "";
  state.txHash = "";
  state.timestamp = "";
  state.extracted = parseRequest(elements.requestText.value);
  state.selectedMerchantId = rankMerchant(state.extracted);

  elements.overallStatus.textContent = "Request analyzed";
  elements.agentState.textContent = "Matching";
  elements.intentConfidence.textContent = "96% confidence";
  elements.createReservationBtn.disabled = false;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
  elements.approvePaymentBtn.disabled = true;
  elements.verifyPaymentBtn.disabled = true;
  elements.downloadReceiptBtn.disabled = true;
  elements.copySummaryBtn.disabled = true;
  elements.reservationStatus.textContent = "Merchant match ready";
  elements.reservationSummary.textContent = `Doge selected ${selectedMerchant().name} from the supported Tokyo merchant network.`;
  elements.merchantDecision.textContent = "Ready to create a pending reservation for merchant review.";
  elements.bookingId.textContent = "Not created";
  elements.txHash.textContent = "No transaction yet";
  elements.merchantFinalStatus.textContent = "Pending";
  elements.paymentFinalStatus.textContent = "Pending";
  elements.dogeReply.textContent = "Waiting";
  elements.receiptState.textContent = "Pending";
  elements.receiptBody.textContent = "Complete the flow to generate a confirmed paid booking receipt.";

  updateMerchantDisplay();
  renderMerchants();
  setAgentStage("merchant");
  setBookingStep(1);
  addEvent("Intent extracted", `${state.extracted.cuisine}, ${state.extracted.guests} guests, ${state.extracted.time}.`);
  addEvent("Merchant matched", `${selectedMerchant().name} is available at ${selectedMerchant().slot}.`);
  speak(`I found ${selectedMerchant().name} in Tokyo. I can create a pending reservation for ${selectedMerchant().slot}.`);
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.voiceStatus.textContent = "Browser voice unsupported";
    elements.voiceBtn.disabled = true;
    addEvent("Voice fallback ready", "Use Demo Voice or type the request manually.");
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.lang = "en-US";
  state.recognition.interimResults = true;
  state.recognition.continuous = false;

  state.recognition.onstart = () => {
    setVoiceState("Listening", true);
    setAgentStage("voice");
    addEvent("Voice session started", "Listening for the customer booking request.");
  };

  state.recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ");
    elements.requestText.value = transcript;
    if (event.results[event.results.length - 1].isFinal) {
      addEvent("Voice captured", transcript);
      setVoiceState("Voice captured", false);
      runAnalysis();
    }
  };

  state.recognition.onerror = () => {
    setVoiceState("Voice error", false);
    addEvent("Microphone issue", "Use Demo Voice or type the request manually.");
  };

  state.recognition.onend = () => {
    if (state.isListening) setVoiceState("Voice captured", false);
  };
}

function resetDemo() {
  state.bookingId = "";
  state.txHash = "";
  state.timestamp = "";
  state.selectedMerchantId = merchants[0].id;
  state.extracted = {
    cuisine: "Sushi",
    city: "Tokyo",
    time: "7:00 PM - 9:00 PM",
    guests: "2",
  };

  elements.requestText.value = "Hi Doge, book sushi in Tokyo tonight from 7-9 PM for 2 people.";
  elements.eventFeed.innerHTML = "";
  elements.overallStatus.textContent = "Ready";
  elements.agentState.textContent = "Idle";
  elements.intentConfidence.textContent = "92% confidence";
  elements.createReservationBtn.disabled = true;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
  elements.approvePaymentBtn.disabled = true;
  elements.verifyPaymentBtn.disabled = true;
  elements.downloadReceiptBtn.disabled = true;
  elements.copySummaryBtn.disabled = true;

  elements.reservationStatus.textContent = "Waiting for request";
  elements.reservationSummary.textContent = "Start with voice or text to create a supported merchant request.";
  elements.merchantDecision.textContent = "Merchant sees a normal booking request. No crypto knowledge is required.";
  elements.bookingId.textContent = "Not created";
  elements.txHash.textContent = "No transaction yet";
  elements.receiptState.textContent = "Pending";
  elements.receiptBody.textContent = "Complete the flow to generate a confirmed paid booking receipt.";
  elements.merchantFinalStatus.textContent = "Pending";
  elements.paymentFinalStatus.textContent = "Pending";
  elements.dogeReply.textContent = "Waiting";

  updateMerchantDisplay();
  renderMerchants();
  setVoiceState(state.recognition ? "Microphone ready" : "Voice fallback ready", false);
  setAgentStage("voice");
  setBookingStep(1);
  addEvent("System ready", "Voice, merchant, and Mantle proof panels are online.");
}

elements.voiceBtn.addEventListener("click", () => {
  if (!state.recognition) return;
  if (state.isListening) {
    state.recognition.stop();
    setVoiceState("Stopped", false);
    return;
  }
  state.recognition.start();
});

elements.demoVoiceBtn.addEventListener("click", () => {
  const demoRequest = "Hi Doge, book sushi in Tokyo tonight from 7 to 9 PM for 2 people.";
  elements.requestText.value = demoRequest;
  setVoiceState("Demo voice captured", false);
  setAgentStage("intent");
  addEvent("Demo voice captured", demoRequest);
  runAnalysis();
});

elements.analyzeBtn.addEventListener("click", runAnalysis);

elements.createReservationBtn.addEventListener("click", () => {
  const merchant = selectedMerchant();
  state.bookingId = makeBookingId();
  elements.bookingId.textContent = state.bookingId;
  elements.overallStatus.textContent = "Pending merchant";
  elements.agentState.textContent = "Merchant review";
  elements.reservationStatus.textContent = "Pending merchant confirmation";
  elements.reservationSummary.textContent = `${state.bookingId}: ${merchant.name}, ${state.extracted.guests} guests, ${merchant.slot}, ${merchant.deposit} token deposit.`;
  elements.merchantDecision.textContent = "Merchant/admin can accept this slot or reject it and trigger another search.";
  elements.acceptSlotBtn.disabled = false;
  elements.rejectSlotBtn.disabled = false;
  elements.createReservationBtn.disabled = true;
  setAgentStage("approval");
  setBookingStep(2);
  addEvent("Reservation request created", `${state.bookingId} sent to ${merchant.name}.`);
  speak(`I created a pending request for ${merchant.name}. Waiting for merchant confirmation.`);
});

elements.rejectSlotBtn.addEventListener("click", () => {
  elements.overallStatus.textContent = "Alternative needed";
  elements.agentState.textContent = "Rematching";
  elements.reservationStatus.textContent = "Slot rejected";
  elements.reservationSummary.textContent = "Doge suggests another time or restaurant and loops back to supported merchant search.";
  elements.merchantDecision.textContent = "Rejected by merchant. Choose another supported Tokyo merchant or time slot.";
  elements.createReservationBtn.disabled = false;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
  elements.approvePaymentBtn.disabled = true;
  setAgentStage("merchant");
  setBookingStep(1);
  addEvent("Slot rejected", "Doge is ready to suggest another merchant or time.");
  speak("The merchant rejected that slot. I can suggest another supported Tokyo option.");
});

elements.acceptSlotBtn.addEventListener("click", () => {
  elements.overallStatus.textContent = "Slot accepted";
  elements.agentState.textContent = "Payment ready";
  elements.reservationStatus.textContent = "Slot accepted";
  elements.reservationSummary.textContent = "Merchant accepted the slot. Doge can now request a Mantle deposit.";
  elements.merchantDecision.textContent = "Accepted by merchant. Payment request is ready for user approval.";
  elements.approvePaymentBtn.disabled = false;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
  setAgentStage("payment");
  setBookingStep(3);
  addEvent("Merchant accepted", "Mantle deposit request is ready for manual user approval.");
  speak("The merchant accepted the slot. Please approve the Mantle deposit to confirm the booking.");
});

elements.approvePaymentBtn.addEventListener("click", () => {
  state.txHash = makeTxHash();
  elements.txHash.textContent = state.txHash;
  elements.overallStatus.textContent = "Wallet approved";
  elements.paymentFinalStatus.textContent = "Approval submitted";
  elements.verifyPaymentBtn.disabled = false;
  elements.approvePaymentBtn.disabled = true;
  addEvent("Wallet transaction approved", state.txHash);
  speak("Wallet approval submitted. I am ready to verify the Mantle transaction proof.");
});

elements.verifyPaymentBtn.addEventListener("click", () => {
  const merchant = selectedMerchant();
  state.timestamp = new Date().toISOString();
  elements.overallStatus.textContent = "Confirmed";
  elements.agentState.textContent = "Complete";
  elements.reservationStatus.textContent = "Confirmed and paid";
  elements.reservationSummary.textContent = "The backend verified the Mantle transaction and updated the booking.";
  elements.verifyPaymentBtn.disabled = true;
  elements.downloadReceiptBtn.disabled = false;
  elements.copySummaryBtn.disabled = false;
  elements.receiptState.textContent = "Confirmed";
  elements.merchantFinalStatus.textContent = "Paid reservation visible";
  elements.paymentFinalStatus.textContent = state.txHash;
  elements.dogeReply.textContent = "Your booking is confirmed";
  elements.receiptBody.textContent = `${state.bookingId} is confirmed for ${merchant.name} at ${merchant.slot}. Mantle payment proof is attached.`;
  setBookingStep(4);
  addEvent("Payment verified", `${merchant.deposit} ${merchant.token} verified on Mantle.`);
  addEvent("Booking confirmed", `${state.bookingId} is confirmed and paid.`);
  speak(`Your booking is confirmed. ${merchant.name}, ${merchant.slot}. Mantle payment proof is attached.`);
});

elements.downloadReceiptBtn.addEventListener("click", () => {
  const blob = new Blob([receiptText()], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.bookingId || "doge-payagent"}-receipt.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

elements.copySummaryBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(receiptText());
    elements.overallStatus.textContent = "Summary copied";
  } catch {
    elements.overallStatus.textContent = "Copy unavailable";
  }
});

elements.resetBtn.addEventListener("click", resetDemo);

initSpeechRecognition();
resetDemo();
