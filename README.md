# Domain Scout AI

A Windows desktop app that checks one core name across 50 domain extensions and discovers inexpensive, currently unregistered names with a local brandability engine.

## Run locally

```powershell
npm.cmd install
npm.cmd start
```

## Build the Windows installer

```powershell
npm.cmd run dist
```

The installer will be created in `release/`.

## How availability and prices work

- Registration is checked through DNS and directly against the TLD's authoritative RDAP service discovered from IANA. The app never treats an aggregator 404 as availability proof.
- Results are deliberately conservative: Registered, Likely available, or Unverified. Premium discovery only shows names with authoritative "not found" results; final purchase availability still requires a registrar API or checkout confirmation.
- The app does not display TLD baseline fees as exact domain prices. Exact registration and registry-premium pricing is shown as unknown until a registrar API confirms it.
- GoDaddy and Namecheap buttons open that domain's checkout/search page so the user can confirm the live quote before buying.
- “Premium” in this app means a high local brandability score among names that appear unregistered. It does not mean an expensive aftermarket listing.

RDAP is authoritative registration data but not a purchase guarantee. Always confirm at checkout.
