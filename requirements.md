# Prototype Requirements

## Required For Demo

- Static web demo in this repository.
- Supported Tokyo merchant data with multiple selectable merchants.
- Simulated Doge intent extraction.
- Simulated merchant dashboard acceptance.
- Simulated Mantle wallet transaction hash.
- Booking receipt with payment proof.
- Downloadable receipt and copyable demo summary.

## Required For Live MVP

- ElevenLabs or browser voice input.
- n8n workflow for intent detection.
- LLM provider such as OpenRouter, OpenAI, or Anthropic.
- Supabase database.
- Mantle RPC provider.
- Wallet integration such as MetaMask or Reown AppKit.
- Payment verification service using `viem` or `ethers`.
- Hosted frontend such as GitHub Pages, Vercel, or Netlify.

## Optional Later

- Slash or other merchant payout rail.
- Real merchant accounts.
- Merchant authentication.
- Real-time notifications by email, SMS, or Slack.
- On-chain receipt contract.
- Slash or fiat payout integration after the MVP proves demand.

## Suggested Tables

```text
merchants
- id
- name
- city
- cuisine
- deposit_amount
- supported_token
- status

reservations
- id
- merchant_id
- customer_name
- party_size
- requested_time
- status
- payment_status
- tx_hash

payments
- id
- reservation_id
- chain
- token
- amount
- recipient
- tx_hash
- status
```
