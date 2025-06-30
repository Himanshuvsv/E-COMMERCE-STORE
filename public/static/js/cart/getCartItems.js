async function fetchCartItems() {
   try {
      const response = await fetch("http://127.0.0.1:5000/api/cart", {
         method: "GET",
         credentials: "include",
      });

      if (!response.ok) {
         throw new Error("Failed to fetch cart items");
      }

      const cartItems = await response.json();

      if (!cartItems || cartItems.length === 0) {
         document.querySelector(".cart-container").innerHTML =
            "<p>Your cart is empty.</p>";
         return;
      }

      const productDetailsContainer =
         document.querySelector(".product-details");
      productDetailsContainer.innerHTML = "<h2>Product Details</h2>";

      let totalOriginalPrice = 0;
      let totalDiscountedPrice = 0;

      cartItems.forEach((item) => {
         totalOriginalPrice += item.price * item.quantity;
         totalDiscountedPrice += item.price * item.quantity;

         const productCard = `
             <div class="product-card">
                <img src="http://127.0.0.1:5000/${item.image}" alt="${item.name}" />
                <div class="product-info">
                   <span class="mall-tag">Mall</span>
                   <h3>${item.name}</h3>
                   <p class="price">
                      ₹${item.price} <span class="original-price">₹${item.price}</span>
                   </p>
                   <p>All issue easy returns</p>
                   <p>Category: ${item.category} • Qty: ${item.quantity}</p>
                   <a href="#" class="remove" data-id="${item._id}">✖ REMOVE</a>
                </div>
             </div>
             <p class="sold-by">
                Sold by: Vendor <span class="free-delivery">Free Delivery</span>
             </p>`;

         productDetailsContainer.innerHTML += productCard;
      });

      document.querySelector(".price-details").innerHTML = `
          <h2>Price Details (${cartItems.length} Items)</h2>
          <p>Total Product Price <span class="price">+ ₹${totalOriginalPrice}</span></p>
          <hr />
          <p class="order-total">
             Order Total <span class="total">₹${totalDiscountedPrice}</span>
          </p>
          <button class="continue-btn">Continue</button>
          <div class="safety-info">
             <p>🛡 Your Safety, Our Priority</p>
             <p>We make sure that your package is safe at every point of contact.</p>
          </div>`;

      document.querySelectorAll(".remove").forEach((button) => {
         button.addEventListener("click", async (e) => {
            e.preventDefault();
            const productId = e.target.dataset.id;
            await removeCartItem(productId);
            fetchCartItems();
         });
      });
   } catch (error) {
      console.error("Error fetching cart items:", error);
   }
}

async function removeCartItem(productId) {
   try {
      const response = await fetch(
         `http://127.0.0.1:5000/api/cart/${productId}`,
         {
            method: "DELETE",
            credentials: "include",
         }
      );

      location.reload();

      if (!response.ok) {
         throw new Error("Failed to remove item from cart");
      }
   } catch (error) {
      console.error("Error removing cart item:", error);
   }
}

fetchCartItems();

