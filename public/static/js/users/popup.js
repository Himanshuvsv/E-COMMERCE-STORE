/* Add-to-cart sheet: reads the product data off the card, no DOM text parsing. */

document.addEventListener("click", (event) => {
   const trigger = event.target.closest(".add-to-cart");
   if (!trigger) return;

   const card = trigger.closest(".pcard");
   if (!card) return;

   showCartPopup({
      id: card.dataset.id,
      name: card.dataset.name,
      price: Number(card.dataset.price) || 0,
      image: card.dataset.image,
      category: card.dataset.category,
      description: card.dataset.description,
   });
});

function showCartPopup(product) {
   const existing = document.getElementById("cart-popup");
   if (existing) existing.remove();

   const modal = document.createElement("div");
   modal.className = "modal is-on";
   modal.id = "cart-popup";
   modal.innerHTML = `
      <div class="modal__panel" role="dialog" aria-modal="true" aria-label="Add to cart">
         <div class="modal__head">
            <h2 class="modal__title">Add to cart</h2>
            <button class="modal__close" type="button" aria-label="Close">&times;</button>
         </div>

         <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:18px">
            <img src="${product.image}" alt="${product.name}"
               style="width:88px;height:88px;border-radius:10px;object-fit:cover;flex:none;border:1px solid var(--hair)">
            <div style="min-width:0">
               <p style="margin:0 0 4px;font-size:16px;font-weight:600">${product.name}</p>
               <p class="muted" style="margin:0 0 6px;font-size:13px">${product.category}</p>
               <p class="price" style="margin:0">$${product.price.toFixed(2)}</p>
            </div>
         </div>

         <div class="field">
            <label for="popup-quantity">Quantity</label>
            <input type="number" id="popup-quantity" min="1" value="1">
            <span class="field__hint" id="stock-message"></span>
         </div>

         <div class="row" style="margin-top:16px;border-top:1px solid var(--hair-2);border-bottom:0;padding-top:14px">
            <span class="row__key">Total</span>
            <span class="price" id="popup-total">$${product.price.toFixed(2)}</span>
         </div>

         <div class="modal__foot">
            <button class="btn btn--ghost" type="button" data-close>Cancel</button>
            <button class="btn" type="button" id="confirm-add">Add to cart</button>
         </div>
      </div>`;

   document.body.appendChild(modal);

   const quantity = modal.querySelector("#popup-quantity");
   const total = modal.querySelector("#popup-total");

   function close() {
      modal.remove();
   }

   quantity.addEventListener("input", () => {
      const count = Math.max(1, Number(quantity.value) || 1);
      total.textContent = "$" + (count * product.price).toFixed(2);
   });

   modal.querySelector(".modal__close").addEventListener("click", close);
   modal.querySelector("[data-close]").addEventListener("click", close);
   modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
   });

   modal.querySelector("#confirm-add").addEventListener("click", () => {
      addToCart(product, modal);
   });
}

async function addToCart(product, modal) {
   const quantityInput = modal.querySelector("#popup-quantity");
   const message = modal.querySelector("#stock-message");
   const confirm = modal.querySelector("#confirm-add");

   try {
      const productResponse = await fetch(`/api/products/${product.id}`);
      if (!productResponse.ok) throw new Error("Failed to fetch product");

      const productData = await productResponse.json();
      const available = productData.product.inventory;

      quantityInput.max = available;
      const quantity = parseInt(quantityInput.value, 10);

      if (!quantity || quantity <= 0) {
         message.textContent = "Enter a quantity of at least 1.";
         message.style.color = "var(--danger)";
         return;
      }

      if (quantity > available) {
         message.textContent = `Only ${available} left in stock.`;
         message.style.color = "var(--danger)";
         return;
      }

      message.textContent = "";
      confirm.classList.add("is-busy");
      confirm.disabled = true;

      const response = await apiFetch("/api/cart", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            productId: product.id,
            quantity,
            name: productData.product.name,
            description: productData.product.description,
            category: productData.product.category,
            price: productData.product.price,
            image: productData.product.image,
         }),
      });

      if (!response.ok) throw new Error("Failed to add product to cart");

      modal.remove();
      toast(`${product.name} added to your cart`);
      if (window.updateCartCount) window.updateCartCount();
   } catch (error) {
      confirm.classList.remove("is-busy");
      confirm.disabled = false;
      toastError("Could not add that to your cart");
   }
}
