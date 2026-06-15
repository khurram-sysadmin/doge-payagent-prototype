(function () {
  const restaurant = {
    name: "Sakura Sushi Tokyo",
    deposit: 12,
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

  const state = {
    activeReservationId: "",
    selectedSlot: "",
    recognition: null,
    isListening: false,
  };

  const el = {
    syncMode: document.getElementById("syncMode"),
    customerHeaderStatus: document.getElementById("customerHeaderStatus"),
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
    customerStatusBadge: document.getElementById("customerStatusBadge"),
    customerReservationSummary: document.getElementById("customerReservationSummary"),
    customerPaymentSummary: document.getElementById("customerPaymentSummary"),
  };

  function setPill(element, label, mode = "") {
    element.textContent = label;
    element.className = `state-pill ${mode}`;
  }

  function speak(message) {
    if (!el.speakReplyToggle.checked || !("speechSynthesis" in window)) return;
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
    el.chatWindow.appendChild(bubble);
    el.chatWindow.scrollTop = el.chatWindow.scrollHeight;
  }

  function parseReservation(text) {
    const partyMatch = text.match(/(?:for\s+)?(\d+)\s*(?:people|guests|person|pax)?/i);
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(pm|am)/i);
    const partySize = partyMatch ? Number(partyMatch[1]) : 2;
    const hour = timeMatch ? Number(timeMatch[1]) : 8;
    const minute = timeMatch && timeMatch[2] ? timeMatch[2] : "00";
    const meridiem = timeMatch ? timeMatch[3].toUpperCase() : "PM";
    return { partySize, time: `${hour}:${minute} ${meridiem}` };
  }

  function normalizeTime(time) {
    return String(time).replace(/\s+/g, " ").trim().toUpperCase();
  }

  function chooseSlot(preferredTime, reservations) {
    const confirmedTimes = new Set(
      reservations
        .filter((reservation) => ["Confirmed", "Pending"].includes(reservation.status))
        .map((reservation) => normalizeTime(reservation.reservation_time))
    );
    const normalized = normalizeTime(preferredTime);
    const direct = restaurant.slots.find((slot) => normalizeTime(slot.time) === normalized && slot.status === "open" && !confirmedTimes.has(normalizeTime(slot.time)));
    if (direct) return direct.time;
    const nextOpen = restaurant.slots.find((slot) => slot.status === "open" && !confirmedTimes.has(normalizeTime(slot.time)));
    return nextOpen ? nextOpen.time : "";
  }

  function renderSlots(reservations = []) {
    const bookedTimes = new Map();
    reservations.forEach((reservation) => {
      bookedTimes.set(normalizeTime(reservation.reservation_time), reservation.status);
    });

    el.slotGrid.innerHTML = "";
    restaurant.slots.forEach((slot) => {
      const statusFromReservation = bookedTimes.get(normalizeTime(slot.time));
      const isSelected = slot.time === state.selectedSlot;
      const status = statusFromReservation === "Confirmed"
        ? "confirmed"
        : statusFromReservation === "Pending"
          ? "held"
          : slot.status;
      const node = document.createElement("div");
      node.className = `slot ${isSelected ? "selected" : ""} ${slot.status !== "open" || statusFromReservation ? "closed" : ""}`;
      node.innerHTML = `<strong>${slot.time}</strong><span>${status}</span>`;
      el.slotGrid.appendChild(node);
    });
  }

  function renderReservation(reservation) {
    if (!reservation) return;
    state.activeReservationId = reservation.id;
    state.selectedSlot = reservation.reservation_time;
    el.partySize.textContent = `${reservation.party_size} guests`;
    el.bookingDate.textContent = reservation.reservation_date || "Tonight";
    el.bookingTime.textContent = reservation.reservation_time;
    el.tableSlot.textContent = reservation.table_label || "Table A4";
    el.depositAmount.textContent = `${reservation.deposit_amount} ${reservation.deposit_token.replace(" demo", "")}`;
    el.proofAmount.textContent = `${reservation.deposit_amount} ${reservation.deposit_token.replace(" demo", "")}`;
    el.reservationId.textContent = reservation.id;
    el.txHash.textContent = reservation.tx_hash || "No transaction yet";
    el.customerReservationSummary.textContent = `${reservation.party_size} guests at ${reservation.reservation_time}`;
    el.customerPaymentSummary.textContent = reservation.payment_status;

    if (reservation.status === "Confirmed") {
      setPill(el.agentBadge, "Confirmed", "verified");
      setPill(el.packetStatus, "Confirmed", "verified");
      setPill(el.paymentBadge, "Verified", "verified");
      setPill(el.customerStatusBadge, "Confirmed", "verified");
      el.customerHeaderStatus.textContent = "Reservation confirmed";
      el.slotDecision.textContent = "Reservation confirmed";
      el.agentNote.textContent = `Confirmed. Mantle proof ${window.DogeSync.shortHash(reservation.tx_hash)} is attached to your reservation.`;
      el.approvePaymentBtn.disabled = true;
      el.verifyPaymentBtn.disabled = true;
    } else {
      setPill(el.agentBadge, "Prepared", "pending");
      setPill(el.packetStatus, "Slot ready", "pending");
      setPill(el.paymentBadge, reservation.payment_status === "Submitted" ? "Tx submitted" : "Awaiting approval", "pending");
      setPill(el.customerStatusBadge, "Pending", "pending");
      el.customerHeaderStatus.textContent = "Reservation pending";
      el.slotDecision.textContent = `${reservation.reservation_time} available`;
      el.agentNote.textContent = "Pending reservation created. Approve the Mantle deposit to confirm.";
      el.approvePaymentBtn.disabled = reservation.payment_status !== "Waiting";
      el.verifyPaymentBtn.disabled = reservation.payment_status !== "Submitted";
    }
  }

  async function runAgent() {
    const request = el.requestText.value.trim();
    if (!request) return;

    const current = window.DogeSync.getState();
    const parsed = parseReservation(request);
    const slot = chooseSlot(parsed.time, current.reservations);
    const reservation = {
      id: window.DogeSync.makeReservationId(),
      restaurant_id: window.DogeSync.restaurantId,
      customer_name: "Muhammad",
      party_size: parsed.partySize,
      reservation_date: "Tonight",
      reservation_time: slot,
      table_label: "Table A4",
      deposit_amount: restaurant.deposit,
      deposit_token: "USDC demo",
      payment_status: "Waiting",
      status: "Pending",
      tx_hash: "",
      source: "customer_dashboard",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addChat("user", request);
    addChat("agent", `I found ${slot} for ${parsed.partySize} guests at ${restaurant.name}. A ${restaurant.deposit} USDC Mantle deposit is required before confirmation.`);
    await window.DogeSync.upsertReservation(reservation);
    renderReservation(reservation);
    speak(`I found a table at ${slot}. Please approve the Mantle deposit to confirm your reservation.`);
  }

  async function approvePayment() {
    if (!state.activeReservationId) return;
    const txHash = window.DogeSync.makeTxHash();
    await window.DogeSync.updateReservation(state.activeReservationId, {
      payment_status: "Submitted",
      tx_hash: txHash,
    });
    addChat("agent", "Mantle transaction submitted. I am ready to verify the payment proof and confirm the booking.");
    speak("Mantle transaction submitted. Verify the proof to complete the booking.");
  }

  async function verifyPayment() {
    if (!state.activeReservationId) return;
    await window.DogeSync.updateReservation(state.activeReservationId, {
      payment_status: "Verified",
      status: "Confirmed",
    });
    const reservation = window.DogeSync.getState().reservations.find((item) => item.id === state.activeReservationId);
    addChat("agent", `Your booking is confirmed for ${reservation.party_size} guests at ${reservation.reservation_time}.`);
    speak("Your reservation is confirmed. The restaurant dashboard has been updated.");
  }

  async function resetDemo() {
    await window.DogeSync.resetDemo();
    state.activeReservationId = "";
    state.selectedSlot = "";
    el.chatWindow.innerHTML = "";
    el.requestText.value = "Hi Doge, book a table for 4 people tonight at 8 PM.";
    el.partySize.textContent = "--";
    el.bookingDate.textContent = "Tonight";
    el.bookingTime.textContent = "--";
    el.tableSlot.textContent = "--";
    el.reservationId.textContent = "Not created";
    el.txHash.textContent = "No transaction yet";
    el.slotDecision.textContent = "Waiting for request";
    el.agentNote.textContent = "Doge will only confirm the reservation after you approve the Mantle deposit.";
    el.customerReservationSummary.textContent = "Not created";
    el.customerPaymentSummary.textContent = "Waiting";
    setPill(el.agentBadge, "Idle");
    setPill(el.packetStatus, "Not created");
    setPill(el.paymentBadge, "Waiting");
    setPill(el.customerStatusBadge, "No active booking");
    el.customerHeaderStatus.textContent = "Ready";
    el.approvePaymentBtn.disabled = true;
    el.verifyPaymentBtn.disabled = true;
    addChat("agent", "Welcome to Sakura Sushi Tokyo. Tell me your party size and preferred time.");
  }

  function setVoiceState(label, listening = false) {
    state.isListening = listening;
    el.voiceStatus.textContent = label;
    el.voiceBtn.classList.toggle("listening", listening);
  }

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    state.recognition = new SpeechRecognition();
    state.recognition.lang = "en-US";
    state.recognition.interimResults = true;
    state.recognition.continuous = false;
    state.recognition.onstart = () => setVoiceState("Listening for reservation request...", true);
    state.recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(" ");
      el.requestText.value = transcript;
      if (event.results[event.results.length - 1].isFinal) {
        setVoiceState("Voice captured", false);
        runAgent();
      }
    };
    state.recognition.onerror = () => setVoiceState("Microphone unavailable. Use Demo Voice or type the request.", false);
    state.recognition.onend = () => {
      if (state.isListening) setVoiceState("Click the mic or use the demo request.", false);
    };
  }

  el.runAgentBtn.addEventListener("click", runAgent);
  el.demoVoiceBtn.addEventListener("click", () => {
    el.requestText.value = "Hi Doge, book a table for 4 people tonight at 8 PM.";
    setVoiceState("Demo voice captured", false);
    runAgent();
  });
  el.voiceBtn.addEventListener("click", () => {
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
  el.approvePaymentBtn.addEventListener("click", approvePayment);
  el.verifyPaymentBtn.addEventListener("click", verifyPayment);
  el.resetBtn.addEventListener("click", resetDemo);

  el.syncMode.textContent = window.DogeSync.syncLabel();
  initSpeechRecognition();
  window.DogeSync.subscribe((syncState) => {
    renderSlots(syncState.reservations);
    if (!state.activeReservationId) return;
    const reservation = syncState.reservations.find((item) => item.id === state.activeReservationId);
    renderReservation(reservation);
  });
  renderSlots(window.DogeSync.getState().reservations);
  addChat("agent", "Welcome to Sakura Sushi Tokyo. Tell me your party size and preferred time.");
})();
