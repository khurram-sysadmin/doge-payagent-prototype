# Doge PayAgent Flow

```mermaid
flowchart TD
  A["Customer request"] --> B["Doge extracts details"]
  B --> C["Search supported Tokyo merchants"]
  C --> D["Create pending reservation"]
  D --> E["Merchant dashboard review"]
  E --> F{"Slot accepted?"}
  F -- "No" --> G["Suggest another time or restaurant"]
  G --> C
  F -- "Yes" --> H["Create Mantle payment request"]
  H --> I["User approves wallet transaction"]
  I --> J["Backend verifies Mantle payment"]
  J --> K{"Payment verified?"}
  K -- "No" --> L["Keep booking pending"]
  L --> H
  K -- "Yes" --> M["Update booking: confirmed + paid"]
  M --> N["Merchant sees paid reservation"]
  M --> O["Generate payment proof receipt"]
  N --> P["Doge sends confirmation"]
  O --> P
```

## Product Boundary

This prototype intentionally avoids claiming that Doge can book or pay any random restaurant.

The MVP is:

```text
Supported Tokyo merchants
+ merchant/admin confirmation
+ user-approved Mantle deposit
+ backend payment verification
+ booking receipt
```
