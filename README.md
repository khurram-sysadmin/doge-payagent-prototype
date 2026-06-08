# Doge PayAgent Prototype

Doge PayAgent is a hackathon prototype for booking supported Tokyo merchants and confirming deposits through Mantle payment proof.

The demo shows the realistic MVP flow:

```text
User request
-> Doge extracts booking details
-> Supported Tokyo merchant is selected
-> Merchant/admin confirms the slot
-> Customer approves Mantle deposit
-> Backend verifies payment proof
-> Booking becomes confirmed and paid
```

## Current Scope

- Supported Tokyo merchants only.
- No random restaurant automation.
- Merchant does not need to understand crypto.
- User manually approves the wallet transaction.
- Mantle is used as the deposit/payment proof layer.
- Slash/Card/Visa settlement is optional future work, not part of the MVP.

## Demo

Open `index.html` in a browser.

The prototype is static and has no required dependencies. It simulates the product flow so the team can submit a GitHub repository quickly and continue building after submission.

## What The Prototype Demonstrates

- Natural-language booking request intake.
- AI-style extraction of cuisine, city, time window, guest count, and deposit.
- Supported Tokyo merchant selection from a curated partner list.
- Merchant/admin dashboard acceptance or rejection.
- Mantle deposit payment request.
- User-approved wallet transaction simulation.
- Backend payment verification simulation.
- Confirmed paid booking receipt with booking ID, tx hash, timestamp, merchant, and deposit details.
- Downloadable receipt and copyable demo summary.

## Suggested GitHub Pages Setup

After uploading this folder to GitHub:

1. Go to repository Settings.
2. Open Pages.
3. Set source to `Deploy from a branch`.
4. Select the `main` branch and `/root`.
5. Save and use the generated GitHub Pages URL as the demo link.

## Next Build Steps

1. Replace demo extraction with the existing n8n/ElevenLabs workflow.
2. Add Supabase tables for merchants, reservations, and payments.
3. Add wallet connection with MetaMask or Reown AppKit.
4. Verify Mantle transactions with `viem` or `ethers`.
5. Add merchant authentication for the dashboard.
6. Replace simulated tx hashes with real Mantle transaction checks.
7. Generate a signed receipt or on-chain receipt record.

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
