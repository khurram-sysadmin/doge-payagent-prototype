# Doge PayAgent Flow

```mermaid
flowchart TD
  A["Customer voice/text request"] --> B["Doge extracts commerce intent"]
  B --> C{"Workflow type"}
  C -->|Restaurant| D["Prepare Tokyo restaurant booking"]
  C -->|Food| E["Prepare supported food order"]
  C -->|Shopping| F["Prepare Amazon-style shopping cart"]
  D --> G["Review target, amount, and recipient"]
  E --> G
  F --> G
  G --> H{"User approves payment?"}
  H -- "No" --> I["Keep request pending or cancel"]
  H -- "Yes" --> J["Create Mantle wallet transaction"]
  J --> K["Backend verifies Mantle proof"]
  K --> L{"Proof verified?"}
  L -- "No" --> I
  L -- "Yes" --> M["Mark request confirmed + paid"]
  M --> N["Show receipt, tx hash, and final status"]
```

## Product Boundary

This prototype intentionally avoids claiming that Doge can spend money automatically or integrate with every real-world merchant.

The MVP is:

```text
Voice or text request
+ Doge prepares a booking, order, or cart
+ user reviews the payment details
+ user manually approves Mantle payment
+ backend verifies transaction proof
+ confirmed paid result
```

## Demo Details

The current static app includes three approval-gated workflows:

```text
Tokyo restaurant booking
Food order preparation
Amazon-style shopping cart preparation
```

The Mantle transaction and backend verification are simulated in this version. The core safety boundary is explicit: Doge prepares the action, but the user approves every payment.
