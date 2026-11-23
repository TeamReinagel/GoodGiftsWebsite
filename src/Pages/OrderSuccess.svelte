<script>
  import { onMount } from 'svelte';
  import StandardPageLayout from '../Elements/StandardPageLayout.svelte';
  import Container from '../Elements/Container.svelte';
  import { clearCart } from '../cart.js';
  import { orderWindow } from '../../shared/catalog.js';

  // Stripe only sends customers here after a successful payment.
  onMount(() => {
    if (new URLSearchParams(window.location.search).get('session_id')) clearCart();
  });
</script>

<StandardPageLayout>
  <Container>
    <div class="success-container">
      <h1>Thank you for your order!</h1>
      <p>Your payment went through, and a receipt is on its way to your email.</p>
      <p>{orderWindow.pickupText}</p>
      <div><a href="/" class="home-button">Back to Home</a></div>
    </div>
  </Container>
</StandardPageLayout>

<style>
  .success-container {
    text-align: center;
    padding: 3rem 1rem;
    max-width: 600px;
    margin: 0 auto;
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  h1 {
    color: var(--alternate-color);
    margin-bottom: 1rem;
  }
  p {
    color: var(--primary-color-light);
    font-size: 1.1rem;
    line-height: 1.6;
  }
  .home-button {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #4a744c;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
</style>
