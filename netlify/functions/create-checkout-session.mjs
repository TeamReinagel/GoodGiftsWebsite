import Stripe from 'stripe';
import {
  findItem,
  isOrderingOpen,
  pickupDateFor,
  pickupLabel,
  orderWindow,
  MAX_QTY_PER_ITEM,
} from '../../shared/catalog.js';

// STRIPE_SECRET_KEY is set in Netlify (Site settings > Environment variables)
// or in a local .env for `netlify dev`. Use a test key (sk_test_...) until launch.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) {
    return json(500, { error: 'Checkout is not configured yet.' });
  }

  const now = new Date();
  if (!isOrderingOpen(now)) {
    return json(409, {
      error: 'Preorders are closed for this week. They reopen Friday evening after pickup.',
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid request.' });
  }

  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0 || items.length > 50) {
    return json(400, { error: 'Your cart is empty.' });
  }

  // Rebuild every line from the server-side catalog. Only id, option and
  // quantity come from the browser; names and prices never do.
  const lineItems = [];
  for (const entry of items) {
    const item = findItem(entry?.id);
    const quantity = Number(entry?.quantity);
    if (!item || item.status === 'Sold Out') {
      return json(400, { error: 'An item in your cart is no longer available.' });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      return json(400, { error: `Please choose between 1 and ${MAX_QTY_PER_ITEM} of each item.` });
    }
    let name = item.name;
    if (item.options) {
      if (!item.options.values.includes(entry?.option)) {
        return json(400, { error: `Please choose a ${item.options.label.toLowerCase()} for ${item.name}.` });
      }
      name = `${item.name} – ${entry.option}`;
    }
    lineItems.push({
      quantity,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.price * 100),
        tax_behavior: 'exclusive', // tax is added on top of the listed price
        product_data: {
          name,
          metadata: { catalog_id: item.id, option: entry?.option ?? '' },
          ...(item.taxCode ? { tax_code: item.taxCode } : {}),
        },
      },
    });
  }

  const origin = new URL(req.url).origin;
  const pickupDate = pickupDateFor(now);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      automatic_tax: { enabled: true },
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: 'pickup_name',
          label: { type: 'custom', custom: 'Name for pickup' },
          type: 'text',
        },
      ],
      custom_text: {
        submit: { message: `${orderWindow.pickupText} Your pickup date: ${pickupLabel(pickupDate)}.` },
      },
      metadata: { pickup_date: pickupDate, channel: 'website_preorder' },
      payment_intent_data: {
        description: `Preorder for pickup ${pickupLabel(pickupDate)}`,
        metadata: { pickup_date: pickupDate },
      },
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });
    return json(200, { url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err?.type, err?.code, err?.message);
    return json(502, { error: 'We could not start checkout. Please try again in a moment.' });
  }
};
