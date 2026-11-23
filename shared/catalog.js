// Single source of truth for what the shop sells.
// The website shows these items, and the Netlify checkout function reads the
// SAME file to build the Stripe Checkout Session, so prices can't be changed
// from the browser.
//
// price:     whole US dollars (tax is added on top at checkout)
// options:   choices the customer must pick (scent, flavor). Leave out if none.
// taxCode:   Stripe product tax code (txcd_...). Pick it from Stripe's list:
//            https://docs.stripe.com/tax/tax-codes  (or `stripe tax_codes list`).
//            Leave null to use the default tax code in Stripe Dashboard > Tax > Settings.
// status:    'Available' | 'New' | 'Sold Out'  ('Sold Out' can't be ordered)

export const catalog = [
  {
    id: 'chicken-eggs',
    name: 'Free-Range Chicken Eggs (Dozen)',
    price: 6,
    imageUrl: '/chickenegg.jpg',
    status: 'Available',
    taxCode: null,
  },
  {
    id: 'duck-eggs',
    name: 'Free-Range Duck Eggs (Dozen)',
    price: 8,
    imageUrl: '/eggs.jpg',
    status: 'Available',
    taxCode: null,
  },
  {
    id: 'tallow-body-butter',
    name: 'Whipped Tallow Body Butter (4 oz)',
    price: 22,
    imageUrl: '/logo.png',
    status: 'New',
    options: { label: 'Scent', values: ['Vanilla', 'Sugar Plum Fairy'] },
    taxCode: null,
  },
  {
    id: 'sugar-scrub',
    name: 'Sugar Plum Fairy Sugar Scrub (4 oz)',
    price: 8,
    imageUrl: '/logo.png',
    status: 'New',
    taxCode: null,
  },
  {
    id: 'tallow-lip-balm',
    name: 'Vanilla Spice Tallow Lip Balm',
    price: 5,
    imageUrl: '/logo.png',
    status: 'New',
    taxCode: null,
  },
  {
    id: 'boo-boo-bag',
    name: 'Boo Boo Bag (Rice & Lavender)',
    price: 5,
    imageUrl: '/logo.png',
    status: 'New',
    taxCode: null,
  },
  {
    id: 'tallow-face-balm',
    name: 'Unscented Tallow Face Balm (2 oz)',
    price: 20,
    imageUrl: '/logo.png',
    status: 'New',
    taxCode: null,
  },
  {
    id: 'syrup-basic',
    name: 'Flavored Syrup (16 oz)',
    price: 12,
    imageUrl: '/logo.png',
    status: 'New',
    options: { label: 'Flavor', values: ['Vanilla Bean', 'Brown Sugar Cinnamon'] },
    taxCode: null,
  },
  {
    id: 'syrup-premium',
    name: 'Premium Flavored Syrup (16 oz)',
    price: 15,
    imageUrl: '/logo.png',
    status: 'New',
    options: { label: 'Flavor', values: ['Gingerbread Cookie', 'Pumpkin Pie'] },
    taxCode: null,
  },
];

export const MAX_QTY_PER_ITEM = 20;

// Weekly preorder window, in farm-local time (America/Chicago).
// Orders close Wednesday 8:00 PM and reopen after Friday pickup ends (8:30 PM).
// Set enabled: false to take orders any time.
export const orderWindow = {
  enabled: true,
  timeZone: 'America/Chicago',
  closes: { day: 3, hour: 20, minute: 0 }, // Wednesday 8:00 PM
  reopens: { day: 5, hour: 20, minute: 30 }, // Friday 8:30 PM
  pickupText: 'Pickup Friday 8:30 AM to 8:30 PM at the farm stand, 11717 Stage Coach Rd, Gravette, AR.',
};

export const findItem = (id) => catalog.find((item) => item.id === id);

// Returns the local weekday/hour/minute for `date` in the farm's time zone.
function localParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

// True when the weekly window is accepting orders at `date`.
export function isOrderingOpen(date = new Date(), window = orderWindow) {
  if (!window.enabled) return true;
  const { day, minutes } = localParts(date, window.timeZone);
  const now = day * 1440 + minutes;
  const closes = window.closes.day * 1440 + window.closes.hour * 60 + window.closes.minute;
  const reopens = window.reopens.day * 1440 + window.reopens.hour * 60 + window.reopens.minute;
  return !(now >= closes && now < reopens);
}

// The Friday pickup date (YYYY-MM-DD, farm-local) for an order placed at `date`.
export function pickupDateFor(date = new Date(), window = orderWindow) {
  const { day } = localParts(date, window.timeZone);
  // Days until the next Friday; an order placed after Friday's reopening goes to next week.
  let add = (5 - day + 7) % 7;
  if (day === 5 || day === 6) add = add === 0 ? 7 : add; // Fri (after reopen) or Sat → next Friday
  const target = new Date(date.getTime() + add * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: window.timeZone }).format(target);
}

// Friendly label for a YYYY-MM-DD pickup date, e.g. "Friday, November 27".
export function pickupLabel(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, d)));
}
