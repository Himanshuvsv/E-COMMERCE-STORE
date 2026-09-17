async function fetchCartItems() {
   const list = document.getElementById("cart-items");
   const summary = document.getElementById("cart-summary");
   if (!list || !summary) return;

   try {
      const response = await apiFetch("/api/cart", {
         method: "GET",
      });

      if (!response.ok) throw new Error("Failed to fetch cart items");

      const cartItems = await response.json();
      renderCart(Array.isArray(cartItems) ? cartItems : []);
   } catch (error) {
      list.innerHTML =
         '<div class="card muted">Could not load your cart. Try refreshing.</div>';
      summary.innerHTML = "";
   }
}

function renderCart(items) {
   const list = document.getElementById("cart-items");
   const summary = document.getElementById("cart-summary");

   if (!items.length) {
      list.innerHTML = `
         <div class="empty" style="grid-column:auto">
            <h3>Your cart is empty</h3>
            <p>Add a few pieces and they will show up here.</p>
            <a class="btn" href="./index2.html">Browse products</a>
         </div>`;
      summary.innerHTML = "";
      return;
   }

   const total = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
   );
   const units = items.reduce((sum, item) => sum + Number(item.quantity), 0);
   const delivery = total >= 250 ? 0 : 15;

   list.innerHTML = items
      .map(
         (item) => `
      <article class="cart-item">
         <img class="cart-item__shot" src="${item.image}" alt="${item.name}">
         <div class="cart-item__body">
            <h2 class="cart-item__name">${item.name}</h2>
            <p class="cart-item__meta">${item.category} · Qty ${
            item.quantity
         }</p>
            <p class="cart-item__meta">Free 30 day returns</p>
            <div class="cart-item__foot">
               <span class="price">$${(
                  Number(item.price) * Number(item.quantity)
               ).toFixed(2)}</span>
               <button class="cart-item__remove" type="button" data-remove="${
                  item._id
               }">Remove</button>
            </div>
         </div>
      </article>`
      )
      .join("");

   summary.innerHTML = `
      <div class="card__head">
         <div>
            <h2 class="card__title">Order summary</h2>
            <p class="card__sub">${units} item${units === 1 ? "" : "s"}</p>
         </div>
      </div>
      <div class="rows">
         <div class="row">
            <span class="row__key">Subtotal</span>
            <span class="row__val">$${total.toFixed(2)}</span>
         </div>
         <div class="row">
            <span class="row__key">Delivery</span>
            <span class="row__val">${
               delivery ? "$" + delivery.toFixed(2) : "Free"
            }</span>
         </div>
         <div class="row">
            <span class="row__key">Total</span>
            <span class="row__val price">$${(total + delivery).toFixed(2)}</span>
         </div>
      </div>
      <button class="btn btn--block continue-btn" type="button" style="margin-top:18px">
         Checkout
      </button>
      <p class="muted" style="font-size:12.5px;margin:14px 0 0">
         Your package is protected at every point of contact.
      </p>`;
}

document.addEventListener("click", async (event) => {
   const remove = event.target.closest("[data-remove]");
   if (!remove) return;

   await removeCartItem(remove.dataset.remove);
});

async function removeCartItem(productId) {
   try {
      const response = await apiFetch(`/api/cart/${productId}`, {
         method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove item from cart");

      toast("Removed from your cart");
      fetchCartItems();
      if (window.updateCartCount) window.updateCartCount();
   } catch (error) {
      toastError("Could not remove that item");
   }
}

fetchCartItems();
