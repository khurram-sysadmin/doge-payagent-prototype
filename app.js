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
    description: "Curated Tokyo partner with a 7:30 PM table for 2.",
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
    description: "Casual supported merchant with quick evening availability.",
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
    description: "Demo partner for group-friendly local service bookings.",
  },
];

const state = {
  bookingId: "",
  txHash: "",
  timestamp: "",
  step: 1,
  selectedMerchantId: merchants[0].id,
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
  reservationStatus: document.getElementById("reservationStatus"),
  reservationSummary: document.getElementById("reservationSummary"),
  merchantDecision: document.getElementById("merchantDecision"),
  bookingId: document.getElementById("bookingId"),
  paymentDeposit: document.getElementById("paymentDeposit"),
  paymentToken: document.getElementById("paymentToken"),
  paymentNetwork: document.getElementById("paymentNetwork"),
  paymentRecipient: document.getElementById("paymentRecipient"),
  txHash: document.getElementById("txHash"),
  receiptBody: document.getElementById("receiptBody"),
  merchantFinalStatus: document.getElementById("merchantFinalStatus"),
  paymentFinalStatus: document.getElementById("paymentFinalStatus"),
  dogeReply: document.getElementById("dogeReply"),
  steps: Array.from(document.querySelectorAll(".step")),
};

function selectedMerchant() {
  return merchants.find((merchant) => merchant.id === state.selectedMerchantId) || merchants[0];
}

function setStep(step) {
  state.step = step;
  elements.steps.forEach((item) => {
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

  const time = lower.includes("8")
    ? "7:00 PM - 9:00 PM"
    : lower.includes("7")
      ? "7:00 PM - 9:00 PM"
      : "Tonight";

  return {
    cuisine,
    city: lower.includes("tokyo") ? "Tokyo" : "Tokyo",
    time,
    guests,
  };
}

function rankMerchant(extracted) {
  const match = merchants.find((merchant) => merchant.cuisine === extracted.cuisine);
  return match ? match.id : merchants[0].id;
}

function renderMerchants() {
  elements.merchantCount.textContent = `${merchants.length} demo partners`;
  elements.merchantList.innerHTML = "";

  merchants.forEach((merchant) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "merchant-option";
    option.classList.toggle("selected", merchant.id === state.selectedMerchantId);
    option.innerHTML = `
      <strong>${merchant.name}</strong>
      <span>${merchant.area} | ${merchant.cuisine} | ${merchant.slot} | ${merchant.deposit} token deposit</span>
    `;
    option.addEventListener("click", () => {
      state.selectedMerchantId = merchant.id;
      updateMerchantDisplay();
      renderMerchants();
      if (state.step >= 2 && !state.bookingId) {
        elements.createReservationBtn.disabled = false;
      }
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
  elements.overallStatus.textContent = "Demo ready";
  elements.createReservationBtn.disabled = true;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
  elements.approvePaymentBtn.disabled = true;
  elements.verifyPaymentBtn.disabled = true;
  elements.downloadReceiptBtn.disabled = true;
  elements.copySummaryBtn.disabled = true;

  elements.reservationStatus.textContent = "Waiting for user request";
  elements.reservationSummary.textContent = "Create a pending reservation to send it to the merchant dashboard.";
  elements.merchantDecision.textContent = "The merchant sees a normal reservation request. No crypto knowledge is required.";
  elements.bookingId.textContent = "Not created";
  elements.txHash.textContent = "No transaction yet";
  elements.receiptBody.textContent = "Complete the flow to generate a confirmed paid booking receipt.";
  elements.merchantFinalStatus.textContent = "Pending";
  elements.paymentFinalStatus.textContent = "Pending";
  elements.dogeReply.textContent = "Waiting";

  updateMerchantDisplay();
  renderMerchants();
  setStep(1);
}

elements.analyzeBtn.addEventListener("click", () => {
  state.bookingId = "";
  state.txHash = "";
  state.timestamp = "";
  state.extracted = parseRequest(elements.requestText.value);
  state.selectedMerchantId = rankMerchant(state.extracted);

  elements.overallStatus.textContent = "Request analyzed";
  elements.createReservationBtn.disabled = false;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
  elements.approvePaymentBtn.disabled = true;
  elements.verifyPaymentBtn.disabled = true;
  elements.downloadReceiptBtn.disabled = true;
  elements.copySummaryBtn.disabled = true;
  elements.reservationStatus.textContent = "Details extracted";
  elements.reservationSummary.textContent = `Doge selected ${selectedMerchant().name} from the supported Tokyo merchant set.`;
  elements.merchantDecision.textContent = "Ready to create a pending reservation for merchant review.";
  elements.bookingId.textContent = "Not created";
  elements.txHash.textContent = "No transaction yet";
  elements.merchantFinalStatus.textContent = "Pending";
  elements.paymentFinalStatus.textContent = "Pending";
  elements.dogeReply.textContent = "Waiting";
  elements.receiptBody.textContent = "Complete the flow to generate a confirmed paid booking receipt.";

  updateMerchantDisplay();
  renderMerchants();
  setStep(2);
});

elements.createReservationBtn.addEventListener("click", () => {
  const merchant = selectedMerchant();
  state.bookingId = makeBookingId();
  elements.bookingId.textContent = state.bookingId;
  elements.overallStatus.textContent = "Pending merchant confirmation";
  elements.reservationStatus.textContent = "Pending merchant confirmation";
  elements.reservationSummary.textContent = `${state.bookingId}: ${merchant.name}, ${state.extracted.guests} guests, ${merchant.slot}, ${merchant.deposit} token deposit.`;
  elements.merchantDecision.textContent = "Merchant/admin can accept this slot or reject it and trigger another search.";
  elements.acceptSlotBtn.disabled = false;
  elements.rejectSlotBtn.disabled = false;
  elements.createReservationBtn.disabled = true;
  setStep(3);
});

elements.rejectSlotBtn.addEventListener("click", () => {
  elements.overallStatus.textContent = "Alternative needed";
  elements.reservationStatus.textContent = "Slot rejected";
  elements.reservationSummary.textContent = "Doge suggests another time or restaurant and loops back to supported merchant search.";
  elements.merchantDecision.textContent = "Rejected by merchant. Choose another supported Tokyo merchant or time slot.";
  elements.createReservationBtn.disabled = false;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
  elements.approvePaymentBtn.disabled = true;
  setStep(2);
});

elements.acceptSlotBtn.addEventListener("click", () => {
  elements.overallStatus.textContent = "Slot accepted";
  elements.reservationStatus.textContent = "Slot accepted";
  elements.reservationSummary.textContent = "Merchant accepted the slot. Doge can now request a Mantle deposit.";
  elements.merchantDecision.textContent = "Accepted by merchant. Payment request is ready for user approval.";
  elements.approvePaymentBtn.disabled = false;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
});

elements.approvePaymentBtn.addEventListener("click", () => {
  state.txHash = makeTxHash();
  elements.txHash.textContent = state.txHash;
  elements.overallStatus.textContent = "Wallet transaction approved";
  elements.paymentFinalStatus.textContent = "Approval submitted";
  elements.verifyPaymentBtn.disabled = false;
  elements.approvePaymentBtn.disabled = true;
  setStep(4);
});

elements.verifyPaymentBtn.addEventListener("click", () => {
  const merchant = selectedMerchant();
  state.timestamp = new Date().toISOString();
  elements.overallStatus.textContent = "Booking confirmed";
  elements.reservationStatus.textContent = "Confirmed and paid";
  elements.reservationSummary.textContent = "The backend verified the Mantle transaction and updated the booking.";
  elements.verifyPaymentBtn.disabled = true;
  elements.downloadReceiptBtn.disabled = false;
  elements.copySummaryBtn.disabled = false;
  elements.merchantFinalStatus.textContent = "Paid reservation visible";
  elements.paymentFinalStatus.textContent = state.txHash;
  elements.dogeReply.textContent = "Your booking is confirmed";
  elements.receiptBody.textContent = `${state.bookingId} is confirmed for ${merchant.name} at ${merchant.slot}. Mantle payment proof is attached.`;
  setStep(5);
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
  const summary = receiptText();
  try {
    await navigator.clipboard.writeText(summary);
    elements.overallStatus.textContent = "Summary copied";
  } catch {
    elements.overallStatus.textContent = "Copy unavailable";
  }
});

elements.resetBtn.addEventListener("click", resetDemo);

resetDemo();
