# Prototype Requirements

## Required For Demo

- Static web demo in this repository.
- Three workflow tabs: restaurant booking, food order, and shopping cart.
- Browser microphone demo with text fallback.
- Simulated Doge intent extraction and request preparation.
- Real-world visual context for each workflow.
- User approval gate before payment.
- Simulated Mantle wallet transaction hash.
- Simulated backend verification of payment proof.
- Operations table with workflow, target, amount, approval, proof, and status.

## Required For Live MVP

- ElevenLabs or browser voice input.
- n8n workflow for intent detection and routing.
- LLM provider such as OpenRouter, OpenAI, or Anthropic.
- Supabase database.
- Mantle RPC provider.
- Wallet integration such as MetaMask or Reown AppKit.
- Payment verification service using `viem` or `ethers`.
- Hosted frontend such as GitHub Pages, Vercel, or Netlify.

## Optional Later

- Slash or other merchant payout rail.
- Real merchant or service accounts.
- Merchant/service authentication.
- Real-time notifications by email, SMS, or Slack.
- On-chain receipt contract.
- Fiat payout integration after the MVP proves demand.

## Suggested Tables

```text
requests
- id
- workflow_type
- customer_prompt
- target_name
- location
- amount
- status
- approval_status
- tx_hash

prepared_items
- id
- request_id
- item_name
- item_type
- quantity
- unit_price
- notes

payments
- id
- request_id
- chain
- token
- amount
- recipient
- tx_hash
- status
```
