async function fetchWishlist() {
   try {
      const response = await fetch(
         "http://127.0.0.1:5000/api/wishlist/showMyWishlist",
         {
            method: "GET",
            credentials: "include",
         }
      );

      if (!response.ok) throw new Error("Failed to fetch wishlist items");
      const data = await response.json();

      displayWishlist(data.wishlistData);
   } catch (error) {
      console.error("Error fetching wishlist:", error);
      document.querySelector(".product-grid").innerHTML =
         "<p class='wishlist-error'>Failed to load wishlist items.</p>";
   }
}

function displayWishlist(wishlist) {
   const container = document.querySelector(".product-grid");
   container.innerHTML = "";

   if (wishlist.length === 0) {
      container.innerHTML =
         "<p class='wishlist-message'>Your wishlist is empty.</p>";
      return;
   }

   wishlist.forEach((item) => {
      const product = item.product;
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      // Ensure correct image path
      const imageUrl = product.image.startsWith("/")
         ? `http://127.0.0.1:5000${product.image}`
         : product.image;

      productCard.innerHTML = `
            <div class="wishlist-header">
                <i class="fa-solid fa-heart wishlist-icon" data-product-id="${product._id}"></i>
                <span class="remove-icon" data-id="${item._id}">❌</span>
            </div>
            <img src="${imageUrl}" alt="${product.name}" class="product-img" />
            <p>${product.name}</p>
            <p><strong>&#8377;${product.price}</strong></p>
            <span class="rating">${product.averageRating} ★</span>
        `;

      container.appendChild(productCard);
   });

   // Attach event listeners to remove icons
   document.querySelectorAll(".remove-icon").forEach((icon) => {
      icon.addEventListener("click", async (event) => {
         const wishlistItemId = event.target.getAttribute("data-id");
         await removeFromWishlist(wishlistItemId);
      });
   });
}

async function removeFromWishlist(wishlistItemId) {
   try {
      const response = await fetch(
         `http://127.0.0.1:5000/api/wishlist/${wishlistItemId}`,
         {
            method: "DELETE",
            credentials: "include",
         }
      );

      if (!response.ok) {
         alert("failed to remove");
         throw new Error("Failed to remove item from wishlist");
      }
      fetchWishlist();
   } catch (error) {
      console.error("Error removing item:", error);
   }
}

fetchWishlist();
