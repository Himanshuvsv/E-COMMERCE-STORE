const orderTone = {
   delivered: "badge--ok",
   shipped: "badge--ok",
   paid: "badge--ok",
   processing: "badge--warn",
   pending: "badge--warn",
   canceled: "badge--danger",
   failed: "badge--danger",
};

let myOrders = [];

document.addEventListener("DOMContentLoaded", () => {
   const container = document.getElementById("orders-container");
   if (!container) return;

   const search = document.getElementById("orderSearch");
   if (search) {
      let timer = null;
      search.addEventListener("input", () => {
         clearTimeout(timer);
         timer = setTimeout(renderMyOrders, 180);
      });
   }

   fetchMyOrders();
});

async function fetchMyOrders() {
   const container = document.getElementById("orders-container");

   try {
      const response = await apiFetch("/api/orders/showAllMyOrders", {
         method: "GET",
         headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to load orders");

      const data = await response.json();
      myOrders = Array.isArray(data.orders) ? data.orders : [];
      renderMyOrders();
   } catch (error) {
      container.innerHTML = `
         <div class="empty">
            <h3>Could not load your orders</h3>
            <p>Something went wrong. Try refreshing the page.</p>
         </div>`;
   }
}

function renderMyOrders() {
   const container = document.getElementById("orders-container");
   const counter = document.getElementById("total-orders");
   const query = (document.getElementById("orderSearch")?.value || "")
      .trim()
      .toLowerCase();

   const orders = myOrders.filter((order) => {
      if (!query) return true;
      if (String(order._id).toLowerCase().includes(query)) return true;
      return (order.orderItems || []).some((item) =>
         String(item.name || "").toLowerCase().includes(query)
      );
   });

   if (counter) {
      counter.textContent =
         orders.length + (orders.length === 1 ? " order" : " orders");
   }

   if (!orders.length) {
      container.innerHTML = `
         <div class="empty">
            <h3>No orders yet</h3>
            <p>When you place an order it will appear here.</p>
            <a class="btn" href="./index2.html">Start shopping</a>
         </div>`;
      return;
   }

   container.innerHTML = orders
      .map((order) => {
         const isCanceled = String(order.status).toLowerCase() === "canceled";
         const paymentStatus = order.paymentStatus || "pending";

         const items = (order.orderItems || [])
            .map(
               (item) => `
            <div class="order-item">
               <img src="${item.image}" alt="${item.name}"
                  onerror="this.onerror=null;this.src='./logo.jpeg'">
               <div class="order-item__body">
                  <p class="order-item__name">${item.name}</p>
                  <p class="order-item__meta">${item.category} · Qty ${
                  item.quantity
               }</p>
                  <p class="order-item__meta">$${Number(item.price).toFixed(
                     2
                  )}</p>
                  <div class="review-stars" data-product-id="${item.product}">
                     ${[1, 2, 3, 4, 5]
                        .map(
                           (star) =>
                              `<span class="star" data-rating="${star}" role="button" aria-label="Rate ${star} of 5">&#9733;</span>`
                        )
                        .join("")}
                  </div>
               </div>
            </div>`
            )
            .join("");

         return `
      <article class="order ${isCanceled ? "canceled" : ""}">
         <div class="order__head">
            <div>
               <p class="order__id">Order ${String(order._id).slice(0, 8)} · ${new Date(
            order.createdAt
         ).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
         })}</p>
               <p class="order__total">$${Number(order.total).toFixed(2)}</p>
            </div>
            <div class="order__badges">
               <span class="badge ${
                  orderTone[String(order.status).toLowerCase()] || ""
               }">${order.status}</span>
               <span class="badge ${
                  orderTone[String(paymentStatus).toLowerCase()] || ""
               }">${paymentStatus}</span>
            </div>
         </div>

         <div class="order__items">${items}</div>

         <div class="order__foot">
            ${
               isCanceled
                  ? '<button class="btn btn--ghost" type="button" disabled>Cancelled</button>'
                  : `<button class="btn btn--ghost cancel-btn" type="button" data-order-id="${order._id}">Cancel order</button>`
            }
            <button class="btn btn--ghost track-btn" type="button">Track order</button>
         </div>
      </article>`;
      })
      .join("");
}

document.addEventListener("click", async (event) => {
   if (event.target.closest(".track-btn")) {
      toast("Tracking is not available yet");
      return;
   }

   const cancel = event.target.closest(".cancel-btn");
   if (cancel) {
      await cancelOrder(cancel.dataset.orderId);
      return;
   }

   const star = event.target.closest(".star");
   if (star) {
      const group = star.closest(".review-stars");
      openReviewForm(group.dataset.productId, star.dataset.rating);
   }
});

async function cancelOrder(orderId) {
   if (!orderId) return;
   if (!confirm("Cancel this order?")) return;

   try {
      const response = await apiFetch(`/api/orders/cancelOrder/${orderId}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
         toastError(data.error || "Could not cancel the order");
         return;
      }

      toast("Order cancelled");

      try {
         await apiFetch(`/api/payment/payment-refund/${orderId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
         });
      } catch (refundError) {
         /* refund failures are reported by the payments page */
      }

      fetchMyOrders();
   } catch (error) {
      toastError("Could not cancel the order");
   }
}

function openReviewForm(productId, rating) {
   const existing = document.getElementById("review-form-modal");
   if (existing) existing.remove();

   const modal = document.createElement("div");
   modal.className = "modal is-on";
   modal.id = "review-form-modal";
   modal.innerHTML = `
      <div class="modal__panel" role="dialog" aria-modal="true" aria-label="Leave a review">
         <div class="modal__head">
            <h2 class="modal__title">Leave a review</h2>
            <button class="modal__close" type="button" data-close aria-label="Close">&times;</button>
         </div>
         <p class="muted" style="margin:0 0 16px;font-size:14px">
            Your rating: <span style="color:#D9930B;font-size:16px">${"★".repeat(
               rating
            )}${"☆".repeat(5 - rating)}</span>
         </p>
         <div class="auth-form">
            <div class="field">
               <label for="review-title">Title</label>
               <input type="text" id="review-title" placeholder="Sums it up in a few words">
            </div>
            <div class="field">
               <label for="review-comment">Review</label>
               <textarea id="review-comment" placeholder="What did you think?"></textarea>
            </div>
         </div>
         <div class="modal__foot">
            <button class="btn btn--ghost" type="button" data-close>Cancel</button>
            <button class="btn" type="button" id="submit-review-btn"
               data-product-id="${productId}" data-rating="${rating}">Submit review</button>
         </div>
      </div>`;

   document.body.appendChild(modal);

   modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-close]")) {
         modal.remove();
      }
   });

   modal
      .querySelector("#submit-review-btn")
      .addEventListener("click", () => submitReview(modal));
}

async function submitReview(modal) {
   const button = modal.querySelector("#submit-review-btn");
   const title = modal.querySelector("#review-title").value.trim();
   const comment = modal.querySelector("#review-comment").value.trim();

   if (!title || !comment) {
      toastError("Add a title and a review");
      return;
   }

   button.disabled = true;
   button.classList.add("is-busy");

   try {
      const response = await apiFetch("/api/reviews/createReview", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            product: button.dataset.productId,
            rating: Number(button.dataset.rating),
            title,
            comment,
         }),
      });

      if (!response.ok) {
         button.disabled = false;
         button.classList.remove("is-busy");
         toastError("You already reviewed this product");
         return;
      }

      modal.remove();
      toast("Thanks for the review");
   } catch (error) {
      button.disabled = false;
      button.classList.remove("is-busy");
      toastError("Could not submit your review");
   }
}
