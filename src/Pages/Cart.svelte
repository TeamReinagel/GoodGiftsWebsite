<script>
  import StandardPageLayout from '../Elements/StandardPageLayout.svelte';
  import Container from '../Elements/Container.svelte';
  import { cart, cartSubtotal, setQuantity } from '../cart.js';
  import { findItem, isOrderingOpen, pickupDateFor, pickupLabel, orderWindow, MAX_QTY_PER_ITEM } from '../../shared/catalog.js';

  const open = isOrderingOpen();
  const pickupDate = pickupLabel(pickupDateFor());
  let loading = false;
  let error = '';

  $: lines = $cart.map((l) => ({ ...l, item: findItem(l.id) })).filter((l) => l.item);

  async function checkout() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: $cart.map(({ id, option, quantity }) => ({ id, option, quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout is unavailable right now.');
      window.location.href = data.url;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  }
</script>

<StandardPageLayout>
  <Container>
    <div class="cart">
      <h1>Your Cart</h1>

      {#if lines.length === 0}
        <p>Your cart is empty.</p>
        <a class="button" href="/#products">Shop products</a>
      {:else}
        <ul>
          {#each lines as line (line.id + (line.option ?? ''))}
            <li>
              <div class="name">
                <strong>{line.item.name}</strong>
                {#if line.option}<span class="opt">{line.item.options.label}: {line.option}</span>{/if}
              </div>
              <div class="qty">
                <button aria-label="Remove one" on:click={() => setQuantity(line.id, line.option, line.quantity - 1)}>−</button>
                <span>{line.quantity}</span>
                <button aria-label="Add one" disabled={line.quantity >= MAX_QTY_PER_ITEM} on:click={() => setQuantity(line.id, line.option, line.quantity + 1)}>+</button>
              </div>
              <div class="price">${(line.item.price * line.quantity).toFixed(2)}</div>
            </li>
          {/each}
        </ul>

        <p class="subtotal">Subtotal: <strong>${$cartSubtotal.toFixed(2)}</strong> <span class="note">(sales tax added at checkout)</span></p>

        {#if open}
          <p class="pickup">{orderWindow.pickupText}<br />Your pickup date: <strong>{pickupDate}</strong>. Preorders close Wednesday at 8 PM.</p>
          <button class="button" on:click={checkout} disabled={loading}>
            {loading ? 'Opening secure checkout…' : 'Check out'}
          </button>
        {:else}
          <p class="closed">Preorders for this week closed Wednesday at 8 PM. They reopen Friday evening after pickup. Your cart will be saved.</p>
        {/if}

        {#if error}<p class="error" role="alert">{error}</p>{/if}
      {/if}
    </div>
  </Container>
</StandardPageLayout>

<style>
  .cart {
    max-width: 640px;
    margin: 0 auto;
    padding: 2rem 1rem;
    min-height: 50vh;
  }
  h1 {
    color: var(--alternate-color);
    text-align: center;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 1rem;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #c7a17a;
  }
  .name {
    display: flex;
    flex-direction: column;
  }
  .opt,
  .note {
    font-size: 0.85rem;
    opacity: 0.8;
  }
  .qty {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .qty button {
    width: 2rem;
    height: 2rem;
    cursor: pointer;
  }
  .price {
    min-width: 4.5rem;
    text-align: right;
  }
  .subtotal {
    text-align: right;
    margin-top: 1rem;
  }
  .pickup,
  .closed {
    margin: 1.5rem 0;
    line-height: 1.5;
  }
  .closed,
  .error {
    color: #b03a2e;
  }
  .button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #4a744c;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    text-decoration: none;
    cursor: pointer;
  }
  .button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
</style>
