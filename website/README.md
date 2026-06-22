# Domain Scout AI landing site

Static website for GitHub + Cloudflare Pages. No build step is required.

## Before publishing

1. Confirm that `contact@vortixvpn.com` routes to a monitored inbox.
2. Review the product name, privacy policy and terms for your final business details.
3. Add the approved affiliate tracking links only after the affiliate network approves the account.
4. Do not claim exact domain availability or pricing outside the registrar checkout.

Search for remaining placeholders:

```powershell
rg "YOUR-DOMAIN|TODO" website
```

## Cloudflare Pages build settings

- Production branch: `main`
- Framework preset: `None`
- Build command: leave blank
- Build output directory: `website`
- Root directory: repository root

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the complete GitHub, Pages and custom-subdomain workflow.
