(function () {
  const el = {
    syncMode: document.getElementById("syncMode"),
    ownerHeaderStatus: document.getElementById("ownerHeaderStatus"),
    metricReservations: document.getElementById("metricReservations"),
    metricReservationsNote: document.getElementById("metricReservationsNote"),
    metricConfirmed: document.getElementById("metricConfirmed"),
    metricPending: document.getElementById("metricPending"),
    metricDeposits: document.getElementById("metricDeposits"),
    dashboardBadge: document.getElementById("dashboardBadge"),
    reservationTable: document.getElementById("reservationTable"),
    assistantBadge: document.getElementById("assistantBadge"),
    ownerQuestion: document.getElementById("ownerQuestion"),
    askOwnerBtn: document.getElementById("askOwnerBtn"),
    ownerAnswer: document.getElementById("ownerAnswer"),
    activityList: document.getElementById("activityList"),
    authBadge: document.getElementById("authBadge"),
    ownerEmail: document.getElementById("ownerEmail"),
    ownerPassword: document.getElementById("ownerPassword"),
    ownerLoginBtn: document.getElementById("ownerLoginBtn"),
    ownerLogoutBtn: document.getElementById("ownerLogoutBtn"),
    authMessage: document.getElementById("authMessage"),
  };

  let latestState = { reservations: [] };
  let ownerUnlocked = !window.DogeSync.isConfigured();
  let unsubscribeFromSync = null;

  function setPill(element, label, mode = "") {
    element.textContent = label;
    element.className = `state-pill ${mode}`;
  }

  function rowClass(status) {
    const lower = String(status).toLowerCase();
    if (lower.includes("confirm")) return "confirmed";
    if (lower.includes("pending")) return "pending";
    return "waiting";
  }

  function addActivity(title, body) {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
    el.activityList.prepend(item);
  }

  function lockOwnerView(message = "Sign in as restaurant owner to view reservation analytics.") {
    ownerUnlocked = false;
    latestState = { reservations: [] };
    el.metricReservations.textContent = "--";
    el.metricReservationsNote.textContent = "sign in required";
    el.metricConfirmed.textContent = "--";
    el.metricPending.textContent = "--";
    el.metricDeposits.textContent = "--";
    el.reservationTable.innerHTML = "";
    el.ownerAnswer.textContent = message;
    el.activityList.innerHTML = "";
    el.ownerHeaderStatus.textContent = "Locked";
    el.ownerQuestion.disabled = true;
    el.askOwnerBtn.disabled = true;
    setPill(el.dashboardBadge, "Locked");
    setPill(el.assistantBadge, "Locked");
  }

  function unlockOwnerView() {
    ownerUnlocked = true;
    el.ownerQuestion.disabled = false;
    el.askOwnerBtn.disabled = false;
    setPill(el.dashboardBadge, "Syncing", "pending");
    setPill(el.assistantBadge, "Ready");
    el.ownerHeaderStatus.textContent = "Syncing";
  }

  function renderTable(reservations) {
    el.reservationTable.innerHTML = "";
    reservations.forEach((reservation) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${reservation.id}</td>
        <td>${reservation.customer_name}</td>
        <td>${reservation.party_size}</td>
        <td>${reservation.reservation_time}</td>
        <td>${reservation.payment_status}</td>
        <td><span class="row-status ${rowClass(reservation.status)}">${reservation.status}</span></td>
        <td><code>${window.DogeSync.shortHash(reservation.tx_hash) || "--"}</code></td>
      `;
      el.reservationTable.appendChild(row);
    });
  }

  function renderMetrics(reservations) {
    const confirmed = reservations.filter((reservation) => reservation.status === "Confirmed");
    const pending = reservations.filter((reservation) => !["Verified", "Paid"].includes(reservation.payment_status));
    const verifiedTotal = confirmed.reduce((total, reservation) => total + Number(reservation.deposit_amount || 0), 0);
    el.metricReservations.textContent = String(reservations.length + 15);
    el.metricReservationsNote.textContent = reservations.some((item) => String(item.id).startsWith("DOGE-RSV-"))
      ? "+1 synced from customer dashboard"
      : "waiting for customer booking";
    el.metricConfirmed.textContent = String(confirmed.length);
    el.metricPending.textContent = String(pending.length);
    el.metricDeposits.textContent = `${verifiedTotal} USDC`;
  }

  function answerOwnerQuestion() {
    if (!ownerUnlocked) {
      el.ownerAnswer.textContent = "Please sign in as restaurant owner before asking operational questions.";
      return;
    }

    const question = el.ownerQuestion.value.toLowerCase();
    const reservations = latestState.reservations;
    const latest = [...reservations].reverse().find((item) => String(item.id).startsWith("DOGE-RSV-"));
    const confirmed = reservations.filter((reservation) => reservation.status === "Confirmed");
    const pending = reservations.filter((reservation) => reservation.status === "Pending");
    let answer = "I can answer reservations, pending payments, Mantle deposits, and available dinner status for this demo restaurant.";

    if (question.includes("reservation")) {
      answer = latest
        ? `You have ${reservations.length + 15} reservations today. The latest customer booking is ${latest.reservation_time} for ${latest.party_size} guests, status: ${latest.status}.`
        : `You have ${reservations.length + 15} reservations today. No new Doge booking has arrived yet.`;
    } else if (question.includes("payment") || question.includes("deposit") || question.includes("mantle")) {
      answer = latest && latest.payment_status === "Verified"
        ? `The latest Mantle deposit is verified. Proof: ${window.DogeSync.shortHash(latest.tx_hash)}.`
        : `${pending.length} reservation is still waiting for Mantle deposit verification.`;
    } else if (question.includes("sales") || question.includes("revenue")) {
      const total = confirmed.reduce((sum, item) => sum + Number(item.deposit_amount || 0), 0);
      answer = `Verified reservation deposits total ${total} USDC in this demo dashboard.`;
    } else if (question.includes("slot") || question.includes("available") || question.includes("8")) {
      answer = latest && latest.reservation_time === "8:00 PM"
        ? "8:00 PM is now held or confirmed by the synced Doge reservation."
        : "8:00 PM is still available for a 4-person reservation.";
    }

    el.ownerAnswer.textContent = answer;
    setPill(el.assistantBadge, "Answered", "verified");
    addActivity("Owner assistant answered", answer);
  }

  async function signInOwner() {
    const result = await window.DogeSync.signInOwner(el.ownerEmail.value.trim(), el.ownerPassword.value);
    el.authMessage.textContent = result.message;
    setPill(el.authBadge, result.ok ? "Signed in" : "Demo mode", result.ok ? "verified" : "");
    if (result.ok) startOwnerSync();
  }

  async function signOutOwner() {
    const result = await window.DogeSync.signOutOwner();
    el.authMessage.textContent = result.message;
    setPill(el.authBadge, "Signed out");
    if (unsubscribeFromSync) unsubscribeFromSync();
    unsubscribeFromSync = null;
    lockOwnerView("Signed out. Owner data is hidden.");
  }

  async function startOwnerSync() {
    if (unsubscribeFromSync) unsubscribeFromSync();
    unlockOwnerView();
    unsubscribeFromSync = await window.DogeSync.subscribe((syncState) => {
      if (!ownerUnlocked) return;
      const previousLatestId = latestState.reservations.at(-1)?.id;
      latestState = syncState;
      renderTable(syncState.reservations);
      renderMetrics(syncState.reservations);
      setPill(el.dashboardBadge, "Synced", "verified");
      el.ownerHeaderStatus.textContent = "Synced";

      const latest = syncState.reservations.at(-1);
      if (latest && latest.id !== previousLatestId) {
        addActivity("Reservation synced", `${latest.id} arrived for ${latest.party_size} guests at ${latest.reservation_time}.`);
      }
      if (latest && String(latest.id).startsWith("DOGE-RSV-")) {
        el.ownerAnswer.textContent = `You have ${syncState.reservations.length + 15} reservations today. Latest synced booking: ${latest.reservation_time} for ${latest.party_size} guests, status ${latest.status}.`;
      } else {
        el.ownerAnswer.textContent = `You have ${syncState.reservations.length + 15} reservations today. No new Doge booking has arrived yet.`;
      }
    });
  }

  el.askOwnerBtn.addEventListener("click", answerOwnerQuestion);
  el.ownerQuestion.addEventListener("keydown", (event) => {
    if (event.key === "Enter") answerOwnerQuestion();
  });
  el.ownerLoginBtn.addEventListener("click", signInOwner);
  el.ownerLogoutBtn.addEventListener("click", signOutOwner);

  el.syncMode.textContent = window.DogeSync.syncLabel();
  if (window.DogeSync.isConfigured()) {
    lockOwnerView();
    setPill(el.authBadge, "Sign in required", "pending");
    el.authMessage.textContent = "Use an owner Supabase Auth account to sign in.";
    window.DogeSync.getSession().then((session) => {
      if (!session) return;
      setPill(el.authBadge, "Signed in", "verified");
      el.authMessage.textContent = "Owner session restored.";
      startOwnerSync();
    });
  } else {
    setPill(el.authBadge, "Demo mode");
    el.authMessage.textContent = "Supabase is not configured, so local demo owner data is visible.";
    startOwnerSync();
  }
})();
