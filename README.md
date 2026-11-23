# Good Gifts Homestead Website

---

## Installation Instructions & Running Locally

1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`

## Online preorders (Stripe Checkout)

Customers add items to a cart and pay on Stripe's hosted checkout page. Orders are for Friday pickup.

- **Products and prices:** `shared/catalog.js`. The website and the checkout function both read this file, so prices can't be changed from the browser.
- **Weekly cutoff:** also in `shared/catalog.js` (`orderWindow`). Orders close Wednesday 8 PM Central and reopen Friday 8:30 PM. Set `enabled: false` to take orders any time.
- **Checkout function:** `netlify/functions/create-checkout-session.mjs`.
- **Sales tax:** Stripe Tax (`automatic_tax`). Prices are shown before tax. Stripe only collects tax after you add your Arkansas registration in Stripe Dashboard > Tax > Registrations. Set each product's `taxCode` from [Stripe's tax code list](https://docs.stripe.com/tax/tax-codes), or set a default in Stripe Dashboard > Tax > Settings.
- **Order notifications:** turn on email for successful payments in Stripe Dashboard > Settings > Communication preferences. Each order shows the items, pickup name, phone and pickup date.

### Keys

Never commit keys. Use test keys (`sk_test_...`) until launch.

- **Netlify:** Site configuration > Environment variables > `STRIPE_SECRET_KEY`.
- **Local:** copy `.env.example` to `.env`, fill in your test key, then run `npx netlify dev`. Pay with test card `4242 4242 4242 4242`.
