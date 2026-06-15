# Doge PayAgent Prototype

Doge PayAgent is a B2B restaurant AI agent prototype for the Mantle hackathon.

The current MVP focuses on one complete workflow instead of many incomplete features:

```text
Customer voice/chat request
-> Doge extracts reservation details
-> Restaurant availability is checked
-> Pending reservation is created
-> Customer approves Mantle deposit
-> Payment proof is verified
-> Restaurant dashboard updates
```

## Current Hackathon Scope

- Customer chatbot and browser voice demo.
- Restaurant reservation workflow.
- Restaurant owner dashboard update.
- Mantle deposit/payment proof simulation.
- Owner assistant questions for reservation/payment status.

Food ordering, cancellations, advanced analytics, inventory, multi-business support, and POS integrations are future roadmap items.

## Demo

Open `index.html` in a browser.

The prototype is static and has no required dependencies. It is designed for quick GitHub Pages deployment.

## What The Prototype Demonstrates

- Customer asks Doge to book a table.
- Browser microphone can capture a request when supported.
- Text fallback works immediately.
- Doge extracts party size and requested time.
- Doge checks a demo restaurant availability board.
- Doge creates a pending reservation.
- Customer approves a Mantle deposit.
- The app generates a simulated transaction hash.
- Backend verification is simulated.
- Reservation becomes confirmed.
- Restaurant dashboard updates with the confirmed paid booking.
- Owner assistant answers simple operational questions.

## Suggested GitHub Pages Setup

After uploading this folder to GitHub:

1. Go to repository Settings.
2. Open Pages.
3. Set source to `Deploy from a branch`.
4. Select the `main` branch and `/root`.
5. Save and use the generated GitHub Pages URL as the demo link.

## Next Build Steps

1. Replace simulated reservation logic with Supabase tables.
2. Connect the existing ElevenLabs/n8n voice workflow.
3. Add restaurant onboarding for menu, slots, rules, and FAQ data.
4. Add wallet connection with MetaMask or Reown AppKit.
5. Verify Mantle transactions with `viem` or `ethers`.
6. Store transaction proof against the reservation ID.
7. Add food ordering only after the reservation workflow is stable.

## Repository Structure

```text
.
|-- index.html
|-- styles.css
|-- app.js
|-- docs/
|-- README.md
```
