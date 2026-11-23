<script>
  import { addToCart } from '../cart.js';

  export let product;

  let option = product.options ? product.options.values[0] : null;
  let added = false;
  let timer;

  function add() {
    addToCart(product.id, option, 1);
    added = true;
    clearTimeout(timer);
    timer = setTimeout(() => (added = false), 1500);
  }
</script>

<div class="product-card">
  <img class="product-image" src={product.imageUrl || '/logo.png'} alt={product.name} />
  <div class="product-info">
    <h3 class="product-name">{product.name}</h3>
    <p class="product-price">${product.price}</p>
    {#if product.status === 'Sold Out'}
      <p class="product-status sold-out">Sold Out</p>
    {:else if product.status === 'New'}
      <p class="product-status new">New!</p>
    {:else}
      <p class="product-status available">In Stock</p>
    {/if}

    {#if product.status !== 'Sold Out'}
      {#if product.options}
        <label class="option">
          <span>{product.options.label}</span>
          <select bind:value={option}>
            {#each product.options.values as value}
              <option {value}>{value}</option>
            {/each}
          </select>
        </label>
      {/if}
      <button class="add-button" on:click={add}>{added ? 'Added ✓' : 'Add to cart'}</button>
    {/if}

    {#if product.detailsPage}
      <a href={product.detailsPage} class="details-link">Learn More</a>
    {/if}
  </div>
</div>

<style>
  .product-card {
    border: 0px;
    border-radius: 4px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .product-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 50%;
  }

  .product-info {
    padding: 0.5rem;
    text-align: center;
  }

  .product-name {
    margin: 0.5rem 0;
  }

  .product-price {
    margin: 0;
    font-weight: bold;
  }

  .product-status {
    margin: 0.5rem 0;
    font-size: 0.875rem;
    font-weight: bold;
  }

  .sold-out {
    color: #ff6b6b;
  }

  .available {
    color: #51cf66;
  }

  .new {
    color: #339af0;
  }

  .option {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }

  .option select {
    padding: 0.25rem;
  }

  .add-button,
  .details-link {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.4rem 0.9rem;
    background-color: #4a744c;
    color: white;
    border: none;
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .details-link {
    padding: 0.25rem 0.75rem;
    margin-left: 0.25rem;
  }

  .add-button:hover,
  .details-link:hover {
    background-color: #3a5d3b;
  }
</style>
