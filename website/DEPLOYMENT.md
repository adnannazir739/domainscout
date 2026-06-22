# GitHub and Cloudflare Pages deployment

Production URL: `https://domainscout.vortixvpn.com`

## 1. Prepare the website

Confirm that `contact@vortixvpn.com` routes to a monitored inbox. Commit the source repository to a private or public GitHub repository. The included root `.gitignore` keeps `node_modules/`, installers, logs and local Cloudflare state out of GitHub.

### Push with Git

Create an empty GitHub repository without adding a README, then run these commands from `F:\premium domain search`:

```powershell
git init
git add .
git commit -m "Initial Domain Scout app and website"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the example GitHub URL with the HTTPS URL shown by your new repository. If Git asks you to authenticate, complete GitHub's browser/device sign-in. Do not upload `node_modules/` or `release/` manually.

## 2. Connect GitHub to Cloudflare Pages

1. Sign in to the Cloudflare dashboard.
2. Open **Workers & Pages**.
3. Select **Create application** → **Pages** → **Connect to Git**.
4. Authorize GitHub and select this repository.
5. Use these build settings:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: leave blank
   - Build output directory: `website`
   - Root directory: repository root
6. Select **Save and Deploy**.
7. Open the generated `PROJECT.pages.dev` address and verify every footer page.

Each push to `main` will deploy production. Other branches and pull requests receive preview URLs.

## 3. Attach your subdomain

Do this from the Pages project—do not create only a DNS record first.

1. Open the Pages project in Cloudflare.
2. Go to **Custom domains** → **Set up a custom domain**.
3. Enter the complete subdomain: `domainscout.vortixvpn.com`.
4. Confirm activation. If the domain is active in the same Cloudflare account, Cloudflare normally creates the required DNS record automatically.
5. If Cloudflare asks for manual DNS, create a proxied CNAME:
   - Type: `CNAME`
   - Name: `domainscout`
   - Target: `PROJECT.pages.dev`
   - Proxy status: Proxied
6. Wait until the Pages custom-domain screen says **Active**, then test HTTPS.

## 4. Use the URL in affiliate and Store profiles

Use the custom HTTPS URL as the promotional property. Link directly to:

- `/privacy.html` for the Microsoft Store privacy-policy URL
- `/support.html` for support
- `/affiliate-disclosure.html` for affiliate transparency
- `/terms.html` for terms

## 5. Safe affiliate integration

After approval, keep a copy of the exact link format supplied by the affiliate network. Do not paste affiliate-account passwords or payment credentials into the repository. Tracking links are not secrets, but they must follow the network’s deep-link and brand rules.

## 6. Final checks

- `contact@vortixvpn.com` reaches a monitored inbox.
- HTTPS works on the subdomain.
- Privacy, terms, support and disclosure pages open.
- Mobile navigation works.
- The affiliate description matches what the product actually does.
- Registrar buttons disclose the affiliate relationship before checkout.

## 7. Configure the support email with Cloudflare Email Routing

Skip this section if `contact@vortixvpn.com` already works through another mail provider.

1. In Cloudflare, open the `vortixvpn.com` zone.
2. Go to **Email** → **Email Routing** and enable Email Routing.
3. Add your real personal/business inbox as a destination and complete its verification email.
4. Create the custom address `contact@vortixvpn.com` and route it to that verified destination.
5. Send a test message from a different email account and confirm delivery.

Cloudflare Email Routing forwards incoming mail; it does not automatically provide an outgoing mailbox. Replies normally come from the destination address unless you configure a separate sending service.
