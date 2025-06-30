async function fetchProducts() {
   try {
      const response = await fetch("http://127.0.0.1:5000/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      const wishlist = await fetchWishlistItems();
      displayProducts(data.products, wishlist);
   } catch (error) {
      document.getElementById("product-container").innerHTML =
         "<p class='product-error'>Failed to load products.</p>";
   }
}

async function fetchProductsByCategory(category) {
   try {
      const url = category
         ? `http://127.0.0.1:5000/api/products?category=${category}`
         : "http://127.0.0.1:5000/api/products";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      const wishlist = await fetchWishlistItems();
      displayProducts(data.products, wishlist);
   } catch (error) {
      document.getElementById("product-container").innerHTML =
         "<p class='product-error'>Failed to load products.</p>";
   }
}


document.addEventListener("DOMContentLoaded", () => {
   document.querySelectorAll(".category-link").forEach((categoryLink) => {
      categoryLink.addEventListener("click", (event) => {
         event.preventDefault();
         const category = event.target.getAttribute("data-category");
         fetchProductsByCategory(category);
      });
   });
});


async function fetchWishlistItems() {
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
      if (!data.wishlistData || !Array.isArray(data.wishlistData)) {
         return new Map();
      }
      const wishlistMap = new Map();
      data.wishlistData.forEach((item) => {
         if (item.product && item.product._id) {
            wishlistMap.set(item.product._id, item._id);
         }
      });

      return wishlistMap;
   } catch (error) {
      console.error("Error fetching wishlist items:", error);
      return new Map();
   }
}

function displayProducts(products, wishlist) {
   const container = document.getElementById("product-container");
   container.innerHTML = "";

   if (products.length === 0) {
      container.innerHTML = "<p class='product-message'>No products found.</p>";
      return;
   }

   products.forEach((product) => {
      const isInWishlist = wishlist.has(product._id);
      const heartIcon = isInWishlist ? "❤️" : "♡";
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
         <div class="product-item">
         <img src="http://127.0.0.1:5000/${product.image}" alt="${
         product.name
      }" class="product-image"/>
         <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${
               product.description || "No description available."
            }</p>
            <p class="product-category"><b>Category</b>: ${product.category}</p>
            <p class="product-description review-link" data-product-id="${
               product._id
            }">
               <strong>Reviews ⭐:</strong> ${product.numOfReviews}
            </p>
            <p class="product-description"><strong>Average Rating:</strong> ${"⭐".repeat(
               product.averageRating
            )}</p>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <button class="product-button">Add to Cart</button>
            <span class="wishlist-icon" data-product-id="${
               product._id
            }">${heartIcon}</span>
         </div>
      </div>`;
// ₹
      container.appendChild(productCard);
   });

   // Add event listeners for wishlist icons
   document.querySelectorAll(".wishlist-icon").forEach((icon) => {
      icon.addEventListener("click", async (event) => {
         const productId = event.currentTarget.getAttribute("data-product-id");
         await toggleWishlist(productId, event.currentTarget);
      });
   });

   // Add event listeners for reviews
   document.querySelectorAll(".review-link").forEach((link) => {
      link.addEventListener("click", async (event) => {
         const productId = event.currentTarget.getAttribute("data-product-id");
         if (!productId) return;
         openReviewPopup(productId);
      });
   });
}

async function toggleWishlist(productId, iconElement) {
   try {
      const wishlistMap = await fetchWishlistItems();
      const wishlistId = wishlistMap.get(productId);

      if (wishlistId) {
         // Remove from wishlist
         const response = await fetch(
            `http://127.0.0.1:5000/api/wishlist/${wishlistId}`,
            {
               method: "DELETE",
               credentials: "include",
            }
         );

         if (response.ok) {
            iconElement.textContent = "♡";
            alert("Removed from wishlist");
         } else {
            alert("Error: Failed to remove from wishlist");
         }
      } else {
         // Add to wishlist
         const response = await fetch("http://127.0.0.1:5000/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId }),
         });

         if (response.ok) {
            iconElement.textContent = "❤️";
            alert("Successfully added to wishlist!");
         } else {
            alert("Error: Failed to add to wishlist");
         }
      }
   } catch (error) {
      alert("An unexpected error occurred. Please try again later.");
   }
}

async function openReviewPopup(productId) {
   if (!productId) {
      alert("Error: Product ID is missing.");
      return;
   }
   try {
      const response = await fetch(
         `http://127.0.0.1:5000/api/reviews/product/${productId}`
      );
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      displayReviewsPopup(data.reviews);
   } catch (error) {
      alert("Failed to load reviews.");
   }
}

function displayReviewsPopup(reviews) {
   const overlay = document.createElement("div");
   overlay.classList.add("review-overlay");
   const popup = document.createElement("div");
   popup.classList.add("review-popup");
   popup.innerHTML = `
      <div class="review-popup-content">
         <span class="close-popup">&times;</span>
         <h2>Product Reviews</h2>
         <div class="review-list">
            ${
               reviews.length > 0
                  ? reviews
                       .map(
                          (review) => `
               <div class="review-item">
                  <p class="review-title">${review.title}</p>
                  <p class="review-rating">${"⭐".repeat(review.rating)}</p>
                  <p class="review-comment">${review.comment}</p>
                  <p class="review-user"><strong> By : ${
                     review.user.name
                  } </strong></p>
               </div>
               `
                       )
                       .join("")
                  : "<p>No reviews available.</p>"
            }
         </div>
      </div>
   `;
   overlay.appendChild(popup);
   document.body.appendChild(overlay);
   popup.querySelector(".close-popup").addEventListener("click", () => {
      overlay.remove();
   });
   overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.remove();
   });
}

fetchProducts();
