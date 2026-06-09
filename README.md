# Doge PayAgent Prototype

Doge PayAgent is a hackathon prototype for a voice AI commerce agent that prepares real-world actions and pauses before payment. The user can run three approval-gated flows: book a Tokyo restaurant, order food, or prepare an Amazon-style shopping cart.

The demo shows the realistic MVP flow:

```text
User request
-> Doge extracts commerce intent
-> Doge prepares the booking, order, or cart
-> User reviews target, amount, and recipient
-> Customer approves Mantle payment manually
-> Backend verifies Mantle payment proof
-> Request becomes confirmed and paid
```

## Current Scope

- Three demo workflows: Tokyo restaurant booking, food order, and shopping cart preparation.
- No automatic spending by the AI agent.
- No claim of direct Amazon, DoorDash, or random restaurant integration.
- User manually approves the wallet transaction.
- Mantle is used as the payment proof layer.
- Slash/Card/Visa settlement is optional future work, not part of the MVP.

## Demo

Open `index.html` in a browser.

The prototype is static and has no required dependencies. It simulates the product flow so the team can submit a GitHub repository quickly and continue building after submission.

## What The Prototype Demonstrates

- Natural-language commerce request intake.
- Browser microphone voice request demo with text fallback.
- AI-style extraction for restaurant booking, food delivery, and shopping cart scenarios.
- Real-world visual context for each workflow.
- Prepared item/booking/order packets before payment.
- Mantle payment request review.
- User-approved wallet transaction simulation.
- Backend payment verification simulation.
- Operations table with workflow, target, amount, approval state, proof, and status.
- Spoken booking updates using the browser speech engine when available.

## Suggested GitHub Pages Setup

After uploading this folder to GitHub:

1. Go to repository Settings.
2. Open Pages.
3. Set source to `Deploy from a branch`.
4. Select the `main` branch and `/root`.
5. Save and use the generated GitHub Pages URL as the demo link.

## Next Build Steps

1. Replace demo extraction with the existing n8n/ElevenLabs workflow.
2. Add Supabase tables for requests, merchants, carts, orders, and payments.
3. Add wallet connection with MetaMask or Reown AppKit.
4. Verify Mantle transactions with `viem` or `ethers`.
5. Add merchant/service authentication for the dashboard.
6. Replace simulated tx hashes with real Mantle transaction checks.
7. Generate signed receipts or on-chain receipt records.

## Repository Structure

```text
.
|-- index.html
|-- styles.css
|-- app.js
|-- docs/
|   |-- flow.md
|   |-- github-upload.md
|   |-- requirements.md
|-- README.md
```
