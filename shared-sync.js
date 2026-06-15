(function () {
  const config = window.DOGE_SUPABASE_CONFIG || {};
  const restaurantId = config.restaurantId || "sakura-sushi-tokyo";
  const tableName = config.tableName || "reservations";
  const storageKey = `doge-payagent-state:${restaurantId}`;
  const channelName = `doge-payagent-channel:${restaurantId}`;

  const baseReservations = [
    {
      id: "TYO-1841",
      restaurant_id: restaurantId,
      customer_name: "Aiko Tanaka",
      party_size: 2,
      reservation_date: "Tonight",
      reservation_time: "6:30 PM",
      table_label: "Table B1",
      deposit_amount: 12,
      deposit_token: "USDC demo",
      payment_status: "Paid",
      status: "Confirmed",
      tx_hash: "0xpaid-demo-aiko",
      created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    },
    {
      id: "TYO-1842",
      restaurant_id: restaurantId,
      customer_name: "Kenji Sato",
      party_size: 3,
      reservation_date: "Tonight",
      reservation_time: "7:00 PM",
      table_label: "Table C2",
      deposit_amount: 12,
      deposit_token: "USDC demo",
      payment_status: "Paid",
      status: "Confirmed",
      tx_hash: "0xpaid-demo-kenji",
      created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    },
    {
      id: "TYO-1843",
      restaurant_id: restaurantId,
      customer_name: "Mina Chen",
      party_size: 2,
      reservation_date: "Tonight",
      reservation_time: "7:30 PM",
      table_label: "Table A2",
      deposit_amount: 12,
      deposit_token: "USDC demo",
      payment_status: "Waiting",
      status: "Pending",
      tx_hash: "",
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
  ];

  const fallbackChannel = "BroadcastChannel" in window ? new BroadcastChannel(channelName) : null;

  let clientPromise = null;
  let supabaseClient = null;
  let currentState = loadLocalState();
  const subscribers = new Set();

  function isConfigured() {
    return Boolean(config.url && config.anonKey && !config.url.includes("YOUR_"));
  }

  function createInitialState() {
    return {
      restaurant_id: restaurantId,
      updated_at: new Date().toISOString(),
      reservations: baseReservations,
    };
  }

  function loadLocalState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return createInitialState();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.reservations)) return createInitialState();
      return parsed;
    } catch (error) {
      return createInitialState();
    }
  }

  function saveLocalState(nextState, shouldBroadcast = true) {
    currentState = {
      ...nextState,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(currentState));
    if (shouldBroadcast && fallbackChannel) fallbackChannel.postMessage(currentState);
    notify();
  }

  function notify() {
    subscribers.forEach((callback) => callback(getState()));
  }

  function getState() {
    return JSON.parse(JSON.stringify(currentState));
  }

  function hasLocalDemoReservations() {
    return currentState.reservations.some((reservation) => String(reservation.id).startsWith("DOGE-RSV-"));
  }

  function mergeReservation(reservation) {
    const existing = currentState.reservations.filter((item) => item.id !== reservation.id);
    const nextReservation = {
      ...reservation,
      restaurant_id: restaurantId,
      updated_at: new Date().toISOString(),
    };
    return {
      ...currentState,
      reservations: [...existing, nextReservation].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))),
    };
  }

  function makeReservationId() {
    return `DOGE-RSV-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function makeTxHash() {
    const chars = "0123456789abcdef";
    let hash = "0x";
    for (let index = 0; index < 64; index += 1) hash += chars[Math.floor(Math.random() * chars.length)];
    return hash;
  }

  function shortHash(hash) {
    if (!hash) return "";
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  }

  function loadSupabaseScript() {
    if (!isConfigured()) return Promise.resolve(null);
    if (window.supabase) return Promise.resolve(window.supabase);
    if (clientPromise) return clientPromise;

    clientPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = () => resolve(window.supabase || null);
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });

    return clientPromise;
  }

  async function getClient() {
    if (supabaseClient) return supabaseClient;
    const supabaseNamespace = await loadSupabaseScript();
    if (!supabaseNamespace) return null;
    supabaseClient = supabaseNamespace.createClient(config.url, config.anonKey);
    return supabaseClient;
  }

  async function fetchRemote(options = {}) {
    const preserveLocalOnEmpty = options.preserveLocalOnEmpty !== false;
    const client = await getClient();
    if (!client) return getState();

    const { data, error } = await client
      .from(tableName)
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: true });

    if (error || !Array.isArray(data)) return getState();

    if (!data.length && preserveLocalOnEmpty && hasLocalDemoReservations()) {
      notify();
      return getState();
    }

    currentState = {
      restaurant_id: restaurantId,
      updated_at: new Date().toISOString(),
      reservations: data.length ? data : [],
    };
    notify();
    return getState();
  }

  async function upsertReservation(reservation) {
    const nextState = mergeReservation(reservation);
    saveLocalState(nextState);

    const client = await getClient();
    if (!client) return getState();

    await client.from(tableName).upsert({
      ...reservation,
      restaurant_id: restaurantId,
      updated_at: new Date().toISOString(),
    });

    return fetchRemote({ preserveLocalOnEmpty: true });
  }

  async function updateReservation(id, patch) {
    const existing = currentState.reservations.find((reservation) => reservation.id === id);
    if (!existing) return getState();
    const next = { ...existing, ...patch, updated_at: new Date().toISOString() };
    return upsertReservation(next);
  }

  async function resetDemo() {
    saveLocalState(createInitialState());
    const client = await getClient();
    if (!client) return getState();
    await client.from(tableName).delete().eq("restaurant_id", restaurantId).like("id", "DOGE-RSV-%");
    return fetchRemote();
  }

  async function subscribe(callback) {
    subscribers.add(callback);
    callback(getState());

    if (fallbackChannel) {
      fallbackChannel.onmessage = (event) => {
        if (!event.data || event.data.restaurant_id !== restaurantId) return;
        currentState = event.data;
        notify();
      };
    }

    window.addEventListener("storage", (event) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        currentState = JSON.parse(event.newValue);
        notify();
      } catch (error) {
        // Ignore malformed storage events.
      }
    });

    const client = await getClient();
    if (!client) return () => subscribers.delete(callback);

    await fetchRemote({ preserveLocalOnEmpty: true });
    client
      .channel(`reservations-${restaurantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: tableName, filter: `restaurant_id=eq.${restaurantId}` },
        () => fetchRemote()
      )
      .subscribe();

    return () => subscribers.delete(callback);
  }

  async function signInOwner(email, password) {
    const client = await getClient();
    if (!client) return { ok: false, message: "Supabase is not configured. Demo mode is active." };
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Owner signed in." };
  }

  async function signOutOwner() {
    const client = await getClient();
    if (!client) return { ok: true, message: "Demo mode signed out." };
    await client.auth.signOut();
    return { ok: true, message: "Owner signed out." };
  }

  async function getSession() {
    const client = await getClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session || null;
  }

  window.DogeSync = {
    restaurantId,
    isConfigured,
    getState,
    subscribe,
    refresh: fetchRemote,
    upsertReservation,
    updateReservation,
    resetDemo,
    makeReservationId,
    makeTxHash,
    shortHash,
    signInOwner,
    signOutOwner,
    getSession,
    syncLabel: () => (isConfigured() ? "Supabase Realtime" : "Local demo sync"),
  };
})();
