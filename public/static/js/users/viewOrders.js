async function loadNavbar() {
   try {
      const response = await fetch("navbar.html");
      const navbarHTML = await response.text();
      document.getElementById("navbar-container").innerHTML = navbarHTML;
   } catch (error) {}
}
loadNavbar();

document.addEventListener("DOMContentLoaded", async function () {
   const totalOrdersElement = document.getElementById("total-orders");
   const ordersContainer = document.getElementById("orders-container");

   if (!totalOrdersElement || !ordersContainer) {
      return;
   }

   async function fetchOrders() {
      try {
         const response = await fetch(
            "http://127.0.0.1:5000/api/orders/showAllMyOrders",
            {
               method: "GET",
               credentials: "include",
               headers: { "Content-Type": "application/json" },
            }
         );
         if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

         const data = await response.json();
         const { TotalOrders, orders } = data;

         if (!Array.isArray(orders)) throw new Error("Invalid API response.");

         totalOrdersElement.textContent = `Total Orders: ${TotalOrders}`;
         displayOrders(orders);
      } catch (error) {
         ordersContainer.innerHTML = `<p class="error-message">Failed to load orders.</p>`;
      }
   }

   function displayOrders(orders) {
      ordersContainer.innerHTML = "";
      if (orders.length === 0) {
         ordersContainer.innerHTML = `<p>No orders found.</p>`;
         return;
      }
      orders.forEach((order) => {
         const orderElement = document.createElement("div");
         orderElement.classList.add("order");
         if (order.status.toLowerCase() === "canceled") {
            orderElement.classList.add("canceled");
         }
         const paymentStatus = order.paymentStatus || "Pending";

         let orderDetails = `
                <h2>Order #${order._id}</h2>
                <p>Status: <strong>${order.status}</strong></p>
                <p>Placed on: ${new Date(
                   order.createdAt
                ).toLocaleDateString()}</p>
                <p>Total: ₹${order.total.toFixed(2)}</p>
                <p>Payment Status: <span class="payment-status ${paymentStatus.toLowerCase()}">${paymentStatus}</span></p>
                <div class="order-items">
                    ${order.orderItems
                       .map(
                          (item) => `
                        <div class="order-item">
                            <img src="http://127.0.0.1:5000${
                               item.image
                            }" onerror="this.onerror=null; this.src='placeholder.jpg';" alt="${
                             item.name
                          }" width="100">
                            <div>
                                <p><strong>${item.name}</strong></p>
                                <p>Category: ${item.category}</p>
                                <p>Quantity: ${item.quantity}</p>
                                <p>Price: ₹${item.price.toFixed(2)}</p>
                                <div class="review-stars" data-product-id="${
                                   item.product
                                }">
                                    ${[1, 2, 3, 4, 5]
                                       .map(
                                          (star) =>
                                             `<span class="star" data-rating="${star}">&#9733;</span>`
                                       )
                                       .join("")}
                                </div>
                            </div>
                        </div>`
                       )
                       .join("")}
                </div>
            `;
         if (order.status.toLowerCase() !== "canceled") {
            orderDetails += `<button class="cancel-btn" data-order-id="${order._id}">Cancel Order</button>`;
         }
         orderDetails += `<button class="track-btn" onclick= "alert('tracking data is not available in this time')">Track Order</button>`;
         orderElement.innerHTML = orderDetails;
         ordersContainer.appendChild(orderElement);
      });
   }

   document.addEventListener("click", async function (event) {
      if (event.target.classList.contains("cancel-btn")) {
         const orderId = event.target.getAttribute("data-order-id");

         if (!orderId) {
            return;
         }

         cancelOrder(orderId, event.target);
      }
   });

   async function cancelOrder(orderId, button) {
      if (!confirm("Are you sure you want to cancel this order?")) return;

      try {
         const response = await fetch(
            `http://127.0.0.1:5000/api/orders/cancelOrder/${orderId}`,
            {
               method: "POST",
               credentials: "include",
               headers: { "Content-Type": "application/json" },
            }
         );

         const data = await response.json();
         if (!response.ok) {
            alert(data.error);
            return;
         }

         alert("Order cancelled successfully.");
         button.textContent = "Cancelled";
         button.disabled = true;
         button.classList.add("disabled");

         const orderElement = button.closest(".order");
         const statusElement = orderElement.querySelector("p strong");
         if (statusElement) {
            statusElement.textContent = "canceled";
         }

         orderElement.classList.add("canceled");

         try {
            const refundResponse = await fetch(
               `http://127.0.0.1:5000/api/payment/payment-refund/${orderId}`,
               {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
               }
            );

            if (!refundResponse.ok) {
               return;
            }
         } catch (refundError) {
            alert("Error processing refund. Please try again.");
         }
      } catch (error) {
         alert("Error cancelling order. Please try again.");
      }
   }

   function trackOrder(orderId) {
      alert(`Tracking details for Order #${orderId} are not available yet.`);
   }

   document.addEventListener("click", function (event) {
      if (event.target.classList.contains("star")) {
         const productId =
            event.target.closest(".review-stars").dataset.productId;
         const rating = event.target.dataset.rating;
         openReviewPopup(productId, rating);
      }
   });

   function openReviewPopup(productId, rating) {
      const popupHtml = `
            <div class="review-popup-overlay"></div>
            <div class="review-popup">
                <h3>Leave a Review</h3>
                <p>Rating: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}</p>
                <input type="text" id="review-title" placeholder="Review Title">
                <textarea id="review-comment" placeholder="Write your review..."></textarea>
                <button id="submit-review-btn" data-product-id="${productId}" data-rating="${rating}">Submit Review</button>
                <button id="cancel-review-btn">Cancel</button>
            </div>
        `;
      const popupContainer = document.createElement("div");
      popupContainer.classList.add("popup-container");
      popupContainer.innerHTML = popupHtml;
      document.body.appendChild(popupContainer);
   }

   document.addEventListener("click", async function (event) {
      if (event.target.id === "submit-review-btn") {
         const productId = event.target.dataset.productId;
         const rating = event.target.dataset.rating;
         const title = document.getElementById("review-title").value.trim();
         const comment = document.getElementById("review-comment").value.trim();

         if (!title || !comment) {
            alert("Please fill all fields.");
            return;
         }

         try {
            const response = await fetch(
               "http://127.0.0.1:5000/api/reviews/createReview",
               {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                     product: productId,
                     rating: Number(rating),
                     title,
                     comment,
                  }),
               }
            );

            if (response.ok) {
               alert("Review submitted successfully!");
               closeReviewPopup();
            } else {
               alert("You already submitted a review for this product.");
            }
         } catch (error) {
            alert();
         }
      }

      if (event.target.id === "cancel-review-btn") {
         closeReviewPopup();
      }
   });

   function closeReviewPopup() {
      document.querySelector(".popup-container")?.remove();
   }

   function trackOrder(orderId) {
      alert(`Tracking details for Order #${orderId} are not available yet.`);
   }

   fetchOrders();
});

