const guestStore = {
   products: [],
   category: "",
   query: "",
   sort: "featured",
};

async function fetchProducts() {
   guestStore.category = "";
   await loadGuestProducts();
}

async function fetchProductsByCategory(category) {
   guestStore.category = category || "";
   syncGuestChips();
   await loadGuestProducts();
}

async function loadGuestProducts() {
   const container = document.getElementById("product-container");
   if (!container) return;

   try {
      const url = guestStore.category
         ? `/api/products?category=${encodeURIComponent(guestStore.category)}`
         : "/api/products";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      guestStore.products = data.products || [];
      renderGuestProducts();
   } catch (error) {
      container.innerHTML = emptyStateMarkup(
         "Could not load products",
         "Something went wrong while reaching the store. Try again in a moment."
      );
      setResultCount(0);
   }
}

function visibleGuestProducts() {
   const query = guestStore.query.trim().toLowerCase();

   let list = guestStore.products.filter((product) => {
      if (!query) return true;
      return (
         String(product.name || "").toLowerCase().includes(query) ||
         String(product.description || "").toLowerCase().includes(query)
      );
   });

   if (guestStore.sort === "low") {
      list = list.slice().sort((a, b) => a.price - b.price);
   } else if (guestStore.sort === "high") {
      list = list.slice().sort((a, b) => b.price - a.price);
   } else if (guestStore.sort === "rating") {
      list = list
         .slice()
         .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
   }

   return list;
}

function renderGuestProducts() {
   const container = document.getElementById("product-container");
   if (!container) return;

   const list = visibleGuestProducts();
   setResultCount(list.length);

   if (!list.length) {
      container.innerHTML = emptyStateMarkup(
         "No products found",
         "Try a different category or clear your search to see everything."
      );
      return;
   }

   container.innerHTML = list
      .map((product) => productCardMarkup(product))
      .join("");
}

function syncGuestChips() {
   document.querySelectorAll("#chips .chip").forEach((chip) => {
      const isOn = (chip.dataset.cat || "") === guestStore.category;
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
         guestStore.sort = event.target.value;
         renderGuestProducts();
      });
   }
});

let guestSearchTimer = null;
document.addEventListener("input", (event) => {
   if (event.target.id !== "searchInput") return;
   clearTimeout(guestSearchTimer);
   guestSearchTimer = setTimeout(() => {
      guestStore.query = event.target.value;
      renderGuestProducts();
   }, 180);
});

document.addEventListener("click", (event) => {
   if (event.target.closest(".add-to-cart")) {
      toast("Sign in to start a cart");
      setTimeout(() => {
         window.location.href = "./login.html";
      }, 700);
      return;
   }

   const review = event.target.closest(".review-link");
   if (review) openGuestReviewPopup(review.dataset.productId);
});

async function openGuestReviewPopup(productId) {
   if (!productId) return;

   try {
      const response = await fetch(`/api/reviews/product/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      showGuestReviews(data.reviews || []);
   } catch (error) {
      toastError("Could not load reviews");
   }
}

function showGuestReviews(reviews) {
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

loadGuestProducts();
