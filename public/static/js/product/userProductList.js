const store = {
   products: [],
   wishlist: new Map(),
   category: "",
   query: "",
   sort: "featured",
};

async function fetchProducts() {
   store.category = "";
   await loadProducts();
}

async function fetchProductsByCategory(category) {
   store.category = category || "";
   syncChips();
   await loadProducts();
}

async function loadProducts() {
   const container = document.getElementById("product-container");
   if (!container) return;

   try {
      const url = store.category
         ? `/api/products?category=${encodeURIComponent(store.category)}`
         : "/api/products";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      store.products = data.products || [];
      store.wishlist = await fetchWishlistItems();
      renderProducts();
   } catch (error) {
      container.innerHTML = emptyStateMarkup(
         "Could not load products",
         "Something went wrong while reaching the store. Try again in a moment."
      );
      setResultCount(0);
   }
}

async function fetchWishlistItems() {
   try {
      const response = await fetch("/api/wishlist/showMyWishlist", {
         method: "GET",
         credentials: "include",
      });
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
      return new Map();
   }
}

function visibleProducts() {
   const query = store.query.trim().toLowerCase();

   let list = store.products.filter((product) => {
      if (!query) return true;
      return (
         String(product.name || "").toLowerCase().includes(query) ||
         String(product.description || "").toLowerCase().includes(query)
      );
   });

   if (store.sort === "low") {
      list = list.slice().sort((a, b) => a.price - b.price);
   } else if (store.sort === "high") {
      list = list.slice().sort((a, b) => b.price - a.price);
   } else if (store.sort === "rating") {
      list = list
         .slice()
         .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
   }

   return list;
}

function renderProducts() {
   const container = document.getElementById("product-container");
   if (!container) return;

   const list = visibleProducts();
   setResultCount(list.length);

   if (!list.length) {
      container.innerHTML = emptyStateMarkup(
         "No products found",
         "Try a different category or clear your search to see everything."
      );
      return;
   }

   container.innerHTML = list
      .map((product) =>
         productCardMarkup(product, {
            wishlist: true,
            inWishlist: store.wishlist.has(product._id),
         })
      )
      .join("");
}

// Kept for the category links that still live in the nav markup.
function displayProducts(products, wishlist) {
   store.products = products || [];
   store.wishlist = wishlist || new Map();
   renderProducts();
}

function syncChips() {
   document.querySelectorAll("#chips .chip").forEach((chip) => {
      const isOn = (chip.dataset.cat || "") === store.category;
      chip.setAttribute("aria-pressed", isOn ? "true" : "false");
   });
}

document.addEventListener("DOMContentLoaded", () => {
   const chips = document.getElementById("chips");
   if (chips) {
      chips.addEventListener("click", (event) => {
         const chip = event.target.closest(".chip");
         if (!chip) return;
         fetchProductsByCategory(chip.dataset.cat || "");
      });
   }

   const sort = document.getElementById("sort");
   if (sort) {
      sort.addEventListener("change", (event) => {
         store.sort = event.target.value;
         renderProducts();
      });
   }
});

// The header search lives in the injected navbar, so it is bound by delegation.
let searchTimer = null;
document.addEventListener("input", (event) => {
   if (event.target.id !== "searchInput") return;
   clearTimeout(searchTimer);
   searchTimer = setTimeout(() => {
      store.query = event.target.value;
      renderProducts();
   }, 180);
});

document.addEventListener("click", async (event) => {
   const fav = event.target.closest(".fav");
   if (fav) {
      await toggleWishlist(fav.dataset.productId, fav);
      return;
   }

   const review = event.target.closest(".review-link");
   if (review) openReviewPopup(review.dataset.productId);
});

async function toggleWishlist(productId, favElement) {
   try {
      const wishlistMap = await fetchWishlistItems();
      const wishlistId = wishlistMap.get(productId);

      if (wishlistId) {
         const response = await fetch(`/api/wishlist/${wishlistId}`, {
            method: "DELETE",
            credentials: "include",
         });

         if (!response.ok) {
            toastError("Could not remove from wishlist");
            return;
         }

         favElement.setAttribute("aria-pressed", "false");
         store.wishlist.delete(productId);
         toast("Removed from your wishlist");
         return;
      }

      const response = await fetch("/api/wishlist", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
         toastError("Could not add to wishlist");
         return;
      }

      favElement.setAttribute("aria-pressed", "true");
      store.wishlist.set(productId, true);
      toast("Saved to your wishlist");
   } catch (error) {
      toastError("Something went wrong. Please try again.");
   }
}

async function openReviewPopup(productId) {
   if (!productId) return;

   try {
      const response = await fetch(`/api/reviews/product/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      displayReviewsPopup(data.reviews || []);
   } catch (error) {
      toastError("Could not load reviews");
   }
}

function displayReviewsPopup(reviews) {
   const existing = document.getElementById("review-modal");
   if (existing) existing.remove();

   const modal = document.createElement("div");
   modal.className = "modal is-on";
   modal.id = "review-modal";
   modal.innerHTML = `
      <div class="modal__panel" role="dialog" aria-modal="true" aria-label="Product reviews">
         <div class="modal__head">
            <h2 class="modal__title">Reviews</h2>
            <button class="modal__close" type="button" aria-label="Close">&times;</button>
         </div>
         <div class="rows">
            ${
               reviews.length
                  ? reviews
                       .map(
                          (review) => `
                  <div class="row" style="flex-direction:column;align-items:flex-start;gap:6px">
                     <strong style="font-size:15px">${escapeHtml(review.title)}</strong>
                     <span class="muted" style="font-size:13px">${"★".repeat(
                        review.rating
                     )}${"☆".repeat(Math.max(0, 5 - review.rating))}</span>
                     <p style="margin:0;font-size:14px;color:var(--ink-2)">${escapeHtml(
                        review.comment
                     )}</p>
                     <span class="muted" style="font-size:12.5px">${escapeHtml(
                        review.user ? review.user.name : "Customer"
                     )}</span>
                  </div>`
                       )
                       .join("")
                  : '<p class="muted" style="margin:0">No reviews yet for this product.</p>'
            }
         </div>
      </div>`;

   document.body.appendChild(modal);

   modal.querySelector(".modal__close").addEventListener("click", () => {
      modal.remove();
   });
   modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.remove();
   });
}

loadProducts();
