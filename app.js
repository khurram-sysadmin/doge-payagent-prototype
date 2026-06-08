const state = {
  bookingId: "",
  txHash: "",
  step: 1,
};

const elements = {
  overallStatus: document.getElementById("overallStatus"),
  analyzeBtn: document.getElementById("analyzeBtn"),
  resetBtn: document.getElementById("resetBtn"),
  createReservationBtn: document.getElementById("createReservationBtn"),
  acceptSlotBtn: document.getElementById("acceptSlotBtn"),
  rejectSlotBtn: document.getElementById("rejectSlotBtn"),
  approvePaymentBtn: document.getElementById("approvePaymentBtn"),
  verifyPaymentBtn: document.getElementById("verifyPaymentBtn"),
  reservationStatus: document.getElementById("reservationStatus"),
  reservationSummary: document.getElementById("reservationSummary"),
  merchantDecision: document.getElementById("merchantDecision"),
  bookingId: document.getElementById("bookingId"),
  txHash: document.getElementById("txHash"),
  receiptBody: document.getElementById("receiptBody"),
  merchantFinalStatus: document.getElementById("merchantFinalStatus"),
  paymentFinalStatus: document.getElementById("paymentFinalStatus"),
  dogeReply: document.getElementById("dogeReply"),
  steps: Array.from(document.querySelectorAll(".step")),
};

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

function resetDemo() {
  state.bookingId = "";
  state.txHash = "";

  elements.overallStatus.textContent = "Demo ready";
  elements.createReservationBtn.disabled = true;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
  elements.approvePaymentBtn.disabled = true;
  elements.verifyPaymentBtn.disabled = true;

  elements.reservationStatus.textContent = "Waiting for user request";
  elements.reservationSummary.textContent = "Create a pending reservation to send it to the merchant dashboard.";
  elements.merchantDecision.textContent = "The merchant sees a normal reservation request. No crypto knowledge is required.";
  elements.bookingId.textContent = "Not created";
  elements.txHash.textContent = "No transaction yet";
  elements.receiptBody.textContent = "Complete the flow to generate a confirmed paid booking receipt.";
  elements.merchantFinalStatus.textContent = "Pending";
  elements.paymentFinalStatus.textContent = "Pending";
  elements.dogeReply.textContent = "Waiting";

  setStep(1);
}

elements.analyzeBtn.addEventListener("click", () => {
  elements.overallStatus.textContent = "Request analyzed";
  elements.createReservationBtn.disabled = false;
  elements.reservationStatus.textContent = "Details extracted";
  elements.reservationSummary.textContent = "Doge found Sakura Sushi Ginza in the supported Tokyo merchant set.";
  setStep(2);
});

elements.createReservationBtn.addEventListener("click", () => {
  state.bookingId = makeBookingId();
  elements.bookingId.textContent = state.bookingId;
  elements.overallStatus.textContent = "Pending merchant confirmation";
  elements.reservationStatus.textContent = "Pending merchant confirmation";
  elements.reservationSummary.textContent = `${state.bookingId}: Sakura Sushi Ginza, 2 guests, 7:30 PM, 12.00 token deposit.`;
  elements.acceptSlotBtn.disabled = false;
  elements.rejectSlotBtn.disabled = false;
  elements.createReservationBtn.disabled = true;
  setStep(3);
});

elements.rejectSlotBtn.addEventListener("click", () => {
  elements.overallStatus.textContent = "Alternative needed";
  elements.reservationStatus.textContent = "Slot rejected";
  elements.reservationSummary.textContent = "Doge suggests another time or restaurant and loops back to supported merchant search.";
  elements.merchantDecision.textContent = "Rejected by merchant. Try another supported Tokyo merchant or time slot.";
  elements.createReservationBtn.disabled = false;
  elements.acceptSlotBtn.disabled = true;
  elements.rejectSlotBtn.disabled = true;
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
  elements.overallStatus.textContent = "Booking confirmed";
  elements.reservationStatus.textContent = "Confirmed and paid";
  elements.reservationSummary.textContent = "The backend verified the Mantle transaction and updated the booking.";
  elements.verifyPaymentBtn.disabled = true;
  elements.merchantFinalStatus.textContent = "Paid reservation visible";
  elements.paymentFinalStatus.textContent = state.txHash;
  elements.dogeReply.textContent = "Your booking is confirmed";
  elements.receiptBody.textContent = `${state.bookingId} is confirmed for Sakura Sushi Ginza at 7:30 PM. Mantle payment proof is attached.`;
  setStep(5);
});

elements.resetBtn.addEventListener("click", resetDemo);

resetDemo();
