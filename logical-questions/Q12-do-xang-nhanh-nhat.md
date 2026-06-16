# Q12 — Fastest Way to Fill Up at a Gas Station

**Skill:** Critical Thinking · Optimization &nbsp;|&nbsp; **Level:** Advanced

> *Write an optimised process for minimising time at a gas station. Identify the bottleneck, parallelise steps, state layout assumptions.*

---

## Assumptions

- Motorbike, standard gas station.
- Digital payment is available (mobile QR app) — not cash only.
- The desired amount is decided in advance (full tank or a fixed sum).

---

## Bottleneck analysis

Total time = `entering` + `waiting in queue` + `pumping` + `payment` + `leaving`

Which step takes the most time? **Payment** — especially cash with change. Which step cannot be shortened? **Pumping** — the pump runs at a fixed rate.

So the real problem is: **eliminate everything that happens sequentially but could be done in parallel with pumping**.

---

## Optimised process

### Before arriving

1. Open the payment app and select the payment method — do not do this while standing at the pump.
2. Scan from a distance for the least-busy pump before pulling in.

### At the station — parallelise

1. Pull up to the quiet pump, not the nearest one.
2. **State the amount / litres immediately** when the attendant asks — no hesitation.
3. While the pump is running: open the app, have the QR code or exact cash ready.
4. *(If you need to put on your helmet or retrieve items from storage — do it while pumping, not after.)*

### Payment and departure

1. Present the QR / cash the moment the nozzle is removed — do not wait for the attendant to prompt you.
2. Do not check the fuel gauge after paying — trust the attendant, save 5 seconds.
3. Leave immediately; do not block the pump while putting things away.

---

## Time saved

| Action | Before optimisation | After optimisation |
|--------|--------------------|--------------------|
| Choosing a pump | Pull up to nearest → wait | Scan from distance → go straight in |
| Stating the amount | Decide on the spot | Decide before arriving |
| Payment | Get wallet out after pumping ends | Prepare during pumping |
| Leaving the pump | Store items → then leave | Store items while attendant processes payment |

---

## Accepted trade-off

This process skips "checking the fuel gauge after payment" — accepting a small degree of trust in the attendant in exchange for 5–10 seconds. At an unfamiliar station, I would still check.
