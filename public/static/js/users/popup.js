document.addEventListener("DOMContentLoaded", () => {
   document.addEventListener("click", (event) => {
      if (event.target.classList.contains("product-button")) {
         const productCard = event.target.closest(".product-item");
         const productId =
            productCard.querySelector(".review-link").dataset.productId;
         const productName =
            productCard.querySelector(".product-title").textContent;
         const productCategory =
            productCard.querySelector(".product-category").textContent;
         const productPrice = parseFloat(
            productCard
               .querySelector(".product-price")
               .textContent.replace("$", "")
         );
         const productImage = productCard.querySelector(".product-image").src;
         const productDescription = productCard.querySelector(
            ".product-description"
         )
            ? productCard.querySelector(".product-description").textContent
            : "No description available";

         showPopup(
            productId,
            productName,
            productPrice,
            productImage,
            productDescription,
            productCategory
         );
      }
   });
});

function showPopup(
   productId,
   productName,
   productPrice,
   productImage,
   productDescription,
   productCategory,
   user
) {
   let popup = document.getElementById("cart-popup");
   if (!popup) {
      popup = document.createElement("div");
      popup.id = "cart-popup";
      popup.innerHTML = `
            <div class="popup-overlay"></div>
            <div class="popup-content">
                <span class="close-popup">&times;</span>
                <h3>${productName}</h3>
                <img src="${productImage}" alt="${productName}" class="popup-image">
                <p><strong>Description:</strong> ${productDescription}</p>
                <p><strong>Category:</strong> ${productCategory}</p>
                <p><strong>User:</strong> ${user}</p>
                <p>Price: $<span id="popup-price">${productPrice.toFixed(
                   2
                )}</span></p>
                <label for="quantity">Quantity:</label>
                <input type="number" id="popup-quantity" min="1" value="1">
                <p>Total: $<span id="popup-total">${productPrice.toFixed(
                   2
                )}</span></p>
                <p id="stock-message" style="color: red; font-weight: bold;"></p>
                <button id="confirm-add">Add to Cart</button>
            </div>
        `;
      document.body.appendChild(popup);
   }

   popup.style.display = "flex";
   document
      .getElementById("popup-quantity")
      .addEventListener("input", updateTotal);
   document
      .querySelector(".close-popup")
      .addEventListener(
         "click",
         () => ((popup.style.display = "none"), window.location.reload())
      );
   document
      .getElementById("confirm-add")
      .addEventListener("click", () => addToCart(productId));
}

function updateTotal() {
   const quantity = document.getElementById("popup-quantity").value;
   const price = parseFloat(document.getElementById("popup-price").textContent);
   document.getElementById("popup-total").textContent = (
      quantity * price
   ).toFixed(2);
}

async function addToCart(productId) {
   try {
      const productResponse = await fetch(
         `http://127.0.0.1:5000/api/products/${productId}`
      );
      if (!productResponse.ok)
         throw new Error("Failed to fetch product details");

      const productData = await productResponse.json();
      const availableInventory = productData.product.inventory;

      const quantityInput = document.getElementById("popup-quantity");
      let messageDiv = document.getElementById("stock-message");

      if (!messageDiv) {
         messageDiv = document.createElement("p");
         messageDiv.id = "stock-message";
         messageDiv.style.color = "red";
         messageDiv.style.fontWeight = "bold";
         quantityInput.parentNode.appendChild(messageDiv);
      }

      if (!quantityInput) {
         console.error("Error: Quantity input field not found.");
         return;
      }

      quantityInput.max = availableInventory;

      let quantity = parseInt(quantityInput.value);

      if (quantity > availableInventory || quantity <= 0) {
         messageDiv.innerHTML = `⚠️ Only ${availableInventory} items available!`;
         return;
      } else {
         messageDiv.innerHTML = "";
      }

      const productName = productData.product.name;
      const productDescription = productData.product.description;
      const productCategory = productData.product.category;
      const productPrice = productData.product.price;
      const productImage = productData.product.image;
      const response = await fetch("http://127.0.0.1:5000/api/cart", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify({
            productId,
            quantity,
            name: productName,
            description: productDescription,
            category: productCategory,
            price: productPrice,
            image: productImage,
         }),
      });

      if (!response.ok) throw new Error("Failed to add product to cart");

      alert("Product added to cart successfully!");
      document.getElementById("cart-popup").style.display = "none";
      window.location.reload();
   } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart.");
   }
}
