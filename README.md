# Doge PayAgent Prototype

Doge PayAgent is a B2B restaurant AI agent prototype for the Mantle hackathon.

The focused MVP now has two separate dashboards:

- `customer.html` for restaurant customers.
- `owner.html` for restaurant owners/staff.

The customer never sees owner analytics or controls. The owner never sees the customer booking interface.

## Current Hackathon Workflow

```text
Customer dashboard
-> Customer speaks/types reservation request
-> Doge extracts party size and time
-> Doge checks restaurant availability
-> Pending reservation is created
-> Customer approves Mantle deposit
-> Payment proof is verified
-> Owner dashboard updates
```

## Sync Model

The app supports two sync modes:

### 1. Local Demo Sync

Works immediately with no setup.

Open both pages in two tabs:

```text
customer.html
owner.html
```

When the customer creates/confirms a reservation, the owner dashboard updates through browser storage and `BroadcastChannel`.

### 2. Supabase Realtime Sync

Production-style setup.

1. Run `docs/supabase-two-dashboard-sync.sql` in Supabase SQL editor.
2. Create an owner user in Supabase Auth.
3. Insert that owner user's UUID into `restaurant_members`.
4. Enable Realtime for the `reservations` table.
5. Fill `supabase-config.js`:

```js
window.DOGE_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
  restaurantId: "sakura-sushi-tokyo",
  tableName: "reservations",
};
```

Never put a Supabase service-role key in frontend code or GitHub Pages.

## Authentication

Authentication is good and should be used for the owner dashboard.

For this MVP:

- Customer page is public.
- Owner page supports Supabase Auth login.
- Supabase Row Level Security controls owner access.
- Public customer insert/update policies are included only for the static hackathon demo.

For production, customer payment verification should move behind a backend endpoint or Supabase Edge Function.

## Demo Pages

Open:

```text
index.html
```

Then launch:

```text
customer.html
owner.html
```

## What The Prototype Demonstrates

- Separate customer and owner dashboards.
- Customer voice/chat reservation flow.
- AI-style reservation detail extraction.
- Availability slot selection.
- Mantle deposit approval simulation.
- Transaction hash / payment proof simulation.
- Owner dashboard live reservation queue.
- Owner assistant answering operational questions.
- Supabase-ready sync architecture with local fallback.

## Next Build Steps

1. Connect real Supabase project credentials.
2. Create owner Auth account and membership row.
3. Replace simulated Mantle tx hash with wallet connection.
4. Verify Mantle transactions with `viem` or `ethers`.
5. Move payment verification to a backend/Edge Function.
6. Add food ordering after reservation workflow is stable.

## Repository Structure

```text
.
|-- index.html
|-- customer.html
|-- owner.html
|-- styles.css
|-- supabase-config.js
|-- shared-sync.js
|-- customer.js
|-- owner.js
|-- docs/
|   |-- supabase-two-dashboard-sync.sql
|-- README.md
```
