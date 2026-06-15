const demoRestaurant = {
  name: "Sakura Sushi Tokyo",
  defaultDeposit: 12,
  slots: [
    { time: "6:30 PM", status: "open" },
    { time: "7:00 PM", status: "booked" },
    { time: "7:30 PM", status: "open" },
    { time: "8:00 PM", status: "open" },
    { time: "8:30 PM", status: "open" },
    { time: "9:00 PM", status: "open" },
    { time: "9:30 PM", status: "closed" },
    { time: "10:00 PM", status: "closed" },
  ],
};

const baseReservations = [
  { id: "TYO-1841", customer: "Aiko Tanaka", guests: 2, time: "6:30 PM", deposit: "Paid", status: "Confirmed" },
  { id: "TYO-1842", customer: "Kenji Sato", guests: 3, time: "7:00 PM", deposit: "Paid", status: "Confirmed" },
  { id: "TYO-1843", customer: "Mina Chen", guests: 2, time: "7:30 PM", deposit: "Waiting", status: "Pending" },
];

const state = {
  stage: "capture",
  requestId: "",
  txHash: "",
  selectedSlot: "",
  partySize: "--",
  reservationConfirmed: false,
  reservations: [...baseReservations],
  recognition: null,
  isListening: false,
};

const elements = {
  heroStatus: document.getElementById("heroStatus"),
  metricReservations: document.getElementById("metricReservations"),
  metricSlots: document.getElementById("metricSlots"),
  metricPayment: document.getElementById("metricPayment"),
  metricConfidence: document.getElementById("metricConfidence"),
  agentBadge: document.getElementById("agentBadge"),
  voiceBtn: document.getElementById("voiceBtn"),
  voiceStatus: document.getElementById("voiceStatus"),
  requestText: document.getElementById("requestText"),
  runAgentBtn: document.getElementById("runAgentBtn"),
  demoVoiceBtn: document.getElementById("demoVoiceBtn"),
  resetBtn: document.getElementById("resetBtn"),
  speakReplyToggle: document.getElementById("speakReplyToggle"),
  chatWindow: document.getElementById("chatWindow"),
  packetStatus: document.getElementById("packetStatus"),
  guestName: document.getElementById("guestName"),
  partySize: document.getElementById("partySize"),
  bookingDate: document.getElementById("bookingDate"),
  bookingTime: document.getElementById("bookingTime"),
  tableSlot: document.getElementById("tableSlot"),
  depositAmount: document.getElementById("depositAmount"),
  slotDecision: document.getElementById("slotDecision"),
  slotGrid: document.getElementById("slotGrid"),
  agentNote: document.getElementById("agentNote"),
  paymentBadge: document.getElementById("paymentBadge"),
  reservationId: document.getElementById("reservationId"),
  proofAmount: document.getElementById("proofAmount"),
  txHash: document.getElementById("txHash"),
  approvePaymentBtn: document.getElementById("approvePaymentBtn"),
  verifyPaymentBtn: document.getElementById("verifyPaymentBtn"),
  dashboardBadge: document.getElementById("dashboardBadge"),
  ownerQuestion: document.getElementById("ownerQuestion"),
  askOwnerBtn: document.getElementById("askOwnerBtn"),
  ownerAnswer: document.getElementById("ownerAnswer"),
  reservationTable: document.getElementById("reservationTable"),
  timelineBadge: document.getElementById("timelineBadge"),
  timeline: Array.from(document.querySelectorAll(".timeline-step")),
  activityList: document.getElementById("activityList"),
};

function makeReservationId() {
  return `DOGE-RSV-${Math.floor(1000 + Math.random() * 9000)}`;
}

function makeTxHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let index = 0; index < 64; index += 1) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
}

function classNameForStatus(status) {
  const lower = status.toLowerCase();
  if (lower.includes("confirm")) return "confirmed";
  if (lower.includes("pending")) return "pending";
  return "waiting";
}

function setPill(element, label, mode = "") {
  element.textContent = label;
  element.className = `state-pill ${mode}`;
}

function speak(message) {
  if (!elements.speakReplyToggle.checked || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function addChat(role, message) {
  const bubble = document.createElement("div");
  bubble.className = `chat-message ${role}`;
  bubble.textContent = message;
  elements.chatWindow.appendChild(bubble);
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
}

function addActivity(title, body) {
  const item = document.createElement("div");
  item.className = "activity-item";
  item.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
  elements.activityList.prepend(item);
}

function parseReservation(text) {
  const partyMatch = text.match(/(?:for\s+)?(\d+)\s*(?:people|guests|person|pax)?/i);
  const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(pm|am)/i);
  const partySize = partyMatch ? Number(partyMatch[1]) : 2;
  const hour = timeMatch ? Number(timeMatch[1]) : 8;
  const minute = timeMatch && timeMatch[2] ? timeMatch[2] : "00";
  const meridiem = timeMatch ? timeMatch[3].toUpperCase() : "PM";
  const time = `${hour}:${minute} ${meridiem}`;
  return { partySize, time };
}

function normalizeTimeForSlot(time) {
  return time.replace(/\s+/g, " ").trim().toUpperCase();
}

function chooseSlot(preferredTime) {
  const normalized = normalizeTimeForSlot(preferredTime);
  const direct = demoRestaurant.slots.find((slot) => normalizeTimeForSlot(slot.time) === normalized && slot.status === "open");
  if (direct) return direct.time;
  const nextOpen = demoRestaurant.slots.find((slot) => slot.status === "open");
  return nextOpen ? nextOpen.time : "";
}

function setStage(stage) {
  state.stage = stage;
  const order = ["capture", "extract", "availability", "deposit", "verify", "confirm"];
  const activeIndex = order.indexOf(stage);

  elements.timeline.forEach((step) => {
    const stepIndex = order.indexOf(step.dataset.step);
    step.classList.toggle("complete", activeIndex > stepIndex);
    step.classList.toggle("active", activeIndex === stepIndex);
  });

  const labels = {
    capture: ["Ready", ""],
    extract: ["Extracting", "pending"],
    availability: ["Slot found", "pending"],
    deposit: ["Payment needed", "pending"],
    verify: ["Verifying", "pending"],
    confirm: ["Confirmed", "verified"],
  };
  const [label, mode] = labels[stage];
  setPill(elements.timelineBadge, label, mode);
}

function renderSlots() {
  elements.slotGrid.innerHTML = "";
  demoRestaurant.slots.forEach((slot) => {
    const isSelected = slot.status === "open" && slot.time === state.selectedSlot;
    const statusLabel = isSelected && state.reservationConfirmed
      ? "confirmed"
      : isSelected && state.requestId
        ? "held"
        : slot.status;
    const node = document.createElement("div");
    node.className = `slot ${isSelected ? "selected" : ""} ${slot.status !== "open" ? "closed" : ""}`;
    node.innerHTML = `<strong>${slot.time}</strong><span>${statusLabel}</span>`;
    elements.slotGrid.appendChild(node);
  });
}

function renderReservations() {
  elements.reservationTable.innerHTML = "";
  state.reservations.forEach((reservation) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${reservation.id}</td>
      <td>${reservation.customer}</td>
      <td>${reservation.guests}</td>
      <td>${reservation.time}</td>
      <td>${reservation.deposit}</td>
      <td><span class="row-status ${classNameForStatus(reservation.status)}">${reservation.status}</span></td>
    `;
    elements.reservationTable.appendChild(row);
  });
}

function updateMetrics() {
  const openSlots = demoRestaurant.slots.filter((slot) => slot.status === "open").length - (state.reservationConfirmed ? 1 : 0);
  elements.metricSlots.textContent = openSlots;
  elements.metricReservations.textContent = state.reservationConfirmed ? "19" : "18";
}

function updateButtons() {
  elements.approvePaymentBtn.disabled = state.stage !== "deposit";
  elements.verifyPaymentBtn.disabled = state.stage !== "verify";
}

function runAgent() {
  const request = elements.requestText.value.trim();
  if (!request) return;

  const parsed = parseReservation(request);
  const slot = chooseSlot(parsed.time);
  state.requestId = makeReservationId();
  state.selectedSlot = slot;
  state.partySize = parsed.partySize;
  state.txHash = "";
  state.reservationConfirmed = false;
  state.reservations = [...baseReservations, {
    id: state.requestId,
    customer: "Muhammad",
    guests: parsed.partySize,
    time: slot,
    deposit: "Waiting",
    status: "Pending",
  }];

  addChat("user", request);
  addChat("agent", `I found ${slot} for ${parsed.partySize} guests at ${demoRestaurant.name}. A ${demoRestaurant.defaultDeposit} USDC Mantle deposit is required before confirmation.`);

  elements.partySize.textContent = `${parsed.partySize} guests`;
  elements.bookingTime.textContent = slot;
  elements.tableSlot.textContent = "Table A4";
  elements.depositAmount.textContent = `${demoRestaurant.defaultDeposit} USDC`;
  elements.proofAmount.textContent = `${demoRestaurant.defaultDeposit} USDC`;
  elements.reservationId.textContent = state.requestId;
  elements.txHash.textContent = "No transaction yet";
  elements.slotDecision.textContent = `${slot} available`;
  elements.agentNote.textContent = "Pending reservation created. Customer must approve the Mantle deposit before the restaurant sees it as confirmed.";
  elements.heroStatus.textContent = "Pending Mantle deposit";
  elements.metricPayment.textContent = "Pending";
  elements.metricConfidence.textContent = "97%";
  elements.ownerAnswer.textContent = "You have 18 reservations today. 1 new reservation is pending Mantle deposit approval.";

  setPill(elements.agentBadge, "Prepared", "pending");
  setPill(elements.packetStatus, "Slot ready", "pending");
  setPill(elements.paymentBadge, "Awaiting approval", "pending");
  setStage("deposit");
  renderSlots();
  renderReservations();
  updateMetrics();
  updateButtons();
  addActivity("Reservation prepared", `${state.requestId} created for ${parsed.partySize} guests at ${slot}.`);
  speak(`I found a table at ${slot}. Please approve the Mantle deposit to confirm your reservation.`);
}

function approvePayment() {
  state.txHash = makeTxHash();
  elements.txHash.textContent = state.txHash;
  elements.metricPayment.textContent = "Submitted";
  elements.heroStatus.textContent = "Mantle transaction submitted";
  setPill(elements.paymentBadge, "Tx submitted", "pending");
  setPill(elements.agentBadge, "Verifying", "pending");
  setStage("verify");
  updateButtons();
  addChat("agent", "Mantle transaction submitted. I am ready to verify the payment proof and confirm the booking.");
  addActivity("Wallet approval submitted", `${demoRestaurant.defaultDeposit} USDC transaction sent on Mantle.`);
  speak("Mantle transaction submitted. Verify the proof to complete the booking.");
}

function verifyPayment() {
  const shortHash = `${state.txHash.slice(0, 8)}...${state.txHash.slice(-6)}`;
  state.reservationConfirmed = true;
  state.reservations = state.reservations.map((reservation) => {
    if (reservation.id !== state.requestId) return reservation;
    return { ...reservation, deposit: "Verified", status: "Confirmed" };
  });

  elements.metricPayment.textContent = "Verified";
  elements.heroStatus.textContent = "Reservation confirmed";
  elements.agentNote.textContent = `Confirmed. Mantle proof ${shortHash} is attached to the reservation record.`;
  elements.slotDecision.textContent = "Reservation confirmed";
  elements.ownerAnswer.textContent = "You have 19 reservations today. The newest confirmed booking is DOGE's 8:00 PM table for 4.";
  setPill(elements.paymentBadge, "Verified", "verified");
  setPill(elements.agentBadge, "Confirmed", "verified");
  setPill(elements.packetStatus, "Confirmed", "verified");
  setPill(elements.dashboardBadge, "Updated", "verified");
  setStage("confirm");
  renderSlots();
  renderReservations();
  updateMetrics();
  updateButtons();
  addChat("agent", `Your booking is confirmed for ${state.partySize} guests at ${state.selectedSlot}. Payment proof ${shortHash} is saved.`);
  addActivity("Restaurant dashboard updated", `${state.requestId} is confirmed and paid with Mantle proof ${shortHash}.`);
  speak("Your reservation is confirmed. The restaurant dashboard has been updated.");
}

function resetDemo() {
  state.stage = "capture";
  state.requestId = "";
  state.txHash = "";
  state.selectedSlot = "";
  state.partySize = "--";
  state.reservationConfirmed = false;
  state.reservations = [...baseReservations];

  elements.requestText.value = "Hi Doge, book a table for 4 people tonight at 8 PM.";
  elements.chatWindow.innerHTML = "";
  elements.partySize.textContent = "--";
  elements.bookingDate.textContent = "Tonight";
  elements.bookingTime.textContent = "--";
  elements.tableSlot.textContent = "--";
  elements.depositAmount.textContent = "12 USDC";
  elements.reservationId.textContent = "Not created";
  elements.txHash.textContent = "No transaction yet";
  elements.slotDecision.textContent = "Waiting for request";
  elements.agentNote.textContent = "Doge will only confirm the reservation after the customer approves the Mantle deposit.";
  elements.heroStatus.textContent = "Ready for customer request";
  elements.metricPayment.textContent = "Waiting";
  elements.metricConfidence.textContent = "--";

  setPill(elements.agentBadge, "Idle");
  setPill(elements.packetStatus, "Not created");
  setPill(elements.paymentBadge, "Waiting");
  setPill(elements.dashboardBadge, "Live");
  setStage("capture");
  renderSlots();
  renderReservations();
  updateMetrics();
  updateButtons();
  addActivity("Demo reset", "Reservation flow is ready for a new customer request.");
}

function setVoiceState(label, listening = false) {
  state.isListening = listening;
  elements.voiceStatus.textContent = label;
  elements.voiceBtn.classList.toggle("listening", listening);
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  state.recognition = new SpeechRecognition();
  state.recognition.lang = "en-US";
  state.recognition.interimResults = true;
  state.recognition.continuous = false;

  state.recognition.onstart = () => {
    setVoiceState("Listening for reservation request...", true);
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
      runAgent();
    }
  };

  state.recognition.onerror = () => {
    setVoiceState("Microphone unavailable. Use Demo Voice or type the request.", false);
    addActivity("Microphone issue", "Speech recognition was not available in this browser session.");
  };

  state.recognition.onend = () => {
    if (state.isListening) setVoiceState("Click the mic or use the demo request.", false);
  };
}

function answerOwnerQuestion() {
  const question = elements.ownerQuestion.value.toLowerCase();
  let answer = "I can answer reservations, open slots, deposits, and today's dashboard status for the demo restaurant.";

  if (question.includes("reservation")) {
    answer = state.reservationConfirmed
      ? "You have 19 reservations today. The newest confirmed booking is DOGE's 8:00 PM table for 4."
      : "You have 18 reservations today. 1 reservation is pending deposit and 7 dinner slots remain open.";
  } else if (question.includes("payment") || question.includes("deposit") || question.includes("mantle")) {
    answer = state.reservationConfirmed
      ? "Mantle deposit is verified for the latest booking. The transaction proof is attached to the reservation."
      : "No new Mantle deposit has been verified yet. The latest reservation is waiting for customer approval.";
  } else if (question.includes("slot") || question.includes("available") || question.includes("8")) {
    answer = state.reservationConfirmed
      ? "8:00 PM is now booked for 4 guests. The next open slot is 8:30 PM."
      : "8:00 PM is available and can hold a 4-person reservation.";
  } else if (question.includes("sales") || question.includes("revenue")) {
    answer = state.reservationConfirmed
      ? "Today's confirmed reservation deposits are up by 12 USDC after the latest Mantle payment."
      : "Today's reservation deposit total has not changed yet because the new booking is not paid.";
  }

  elements.ownerAnswer.textContent = answer;
  addActivity("Owner agent answered", answer);
}

elements.runAgentBtn.addEventListener("click", runAgent);
elements.demoVoiceBtn.addEventListener("click", () => {
  elements.requestText.value = "Hi Doge, book a table for 4 people tonight at 8 PM.";
  setVoiceState("Demo voice captured", false);
  runAgent();
});
elements.voiceBtn.addEventListener("click", () => {
  if (!state.recognition) {
    setVoiceState("Demo mode: browser microphone is unavailable.", false);
    runAgent();
    return;
  }

  if (state.isListening) {
    state.recognition.stop();
    setVoiceState("Click the mic or use the demo request.", false);
    return;
  }

  state.recognition.start();
});
elements.approvePaymentBtn.addEventListener("click", approvePayment);
elements.verifyPaymentBtn.addEventListener("click", verifyPayment);
elements.resetBtn.addEventListener("click", resetDemo);
elements.askOwnerBtn.addEventListener("click", answerOwnerQuestion);
elements.ownerQuestion.addEventListener("keydown", (event) => {
  if (event.key === "Enter") answerOwnerQuestion();
});

initSpeechRecognition();
resetDemo();
addChat("agent", "Welcome to Sakura Sushi Tokyo. Tell me your party size and preferred time, and I will prepare the reservation.");
