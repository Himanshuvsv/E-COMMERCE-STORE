const statusTone = {
   delivered: "badge--ok",
   shipped: "badge--ok",
   processing: "badge--warn",
   pending: "badge--warn",
   canceled: "badge--danger",
   failed: "badge--danger",
};

document.addEventListener("DOMContentLoaded", () => {
   const chips = document.getElementById("statusChips");
   if (chips) {
      chips.addEventListener("click", (event) => {
         const chip = event.target.closest(".chip");
         if (!chip) return;

         document.querySelectorAll("#statusChips .chip").forEach((item) => {
            item.setAttribute(
               "aria-pressed",
               item === chip ? "true" : "false"
            );
         });
         fetchOrders(chip.dataset.status);
      });
   }

   const search = document.getElementById("searchOrder");
   if (search) {
      let timer = null;
      search.addEventListener("input", (event) => {
         clearTimeout(timer);
         const value = event.target.value.trim();
         timer = setTimeout(() => {
            if (value) searchOrders(value);
            else fetchOrders("all");
         }, 260);
      });
   }

   fetchOrders("all");
   fetchOrderCounts();
});

async function fetchOrderCounts() {
   try {
      const response = await apiFetch("/api/orders");
      const data = await response.json();
      if (!data.orderStatusCounts) return;

      const counts = data.orderStatusCounts;
      document.getElementById("allCount").textContent = data.numberOfOrders || 0;
      document.getElementById("pendingCount").textContent = counts.pending || 0;
      document.getElementById("processingCount").textContent =
         counts.processing || 0;
      document.getElementById("shippedCount").textContent = counts.shipped || 0;
      document.getElementById("canceledCount").textContent =
         counts.canceled || 0;
      document.getElementById("deliveredCount").textContent =
         counts.delivered || 0;
   } catch (error) {
      /* counts are decorative, keep the zeros */
   }
}

async function fetchOrders(status = "all") {
   try {
      const url =
         status && status !== "all"
            ? `/api/orders?status=${encodeURIComponent(status)}`
            : "/api/orders";

      const response = await apiFetch(url, {
         method: "GET",
         headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      displayOrders(data.orders || []);
   } catch (error) {
      const body = document.getElementById("orderTable");
      if (body) {
         body.innerHTML =
            '<tr><td class="table__empty" colspan="8">Could not load orders.</td></tr>';
      }
   }
}

function displayOrders(orders) {
   const body = document.getElementById("orderTable");
   if (!body) return;

   if (!orders.length) {
      body.innerHTML =
         '<tr><td class="table__empty" colspan="8">No orders to show.</td></tr>';
      return;
   }

   body.innerHTML = orders
      .map((order) => {
         const items = order.orderItems || [];
         const thumbs = items
            .slice(0, 3)
            .map(
               (item) =>
                  `<img src="${item.image}" alt="${item.name}" style="width:34px;height:34px">`
            )
            .join("");

         return `
         <tr>
            <td data-label="Order"><span class="muted" style="font-size:12.5px">${order._id.slice(
               0,
               8
            )}</span></td>
            <td data-label="Customer"><strong style="color:var(--ink)">${
               order.user ? order.user.name : "—"
            }</strong></td>
            <td data-label="Items">
               <span style="display:inline-flex;align-items:center;gap:6px">
                  ${thumbs}
                  <span class="muted" style="font-size:12.5px">${items.length} item${
            items.length === 1 ? "" : "s"
         }</span>
               </span>
            </td>
            <td data-label="Date">${new Date(
               order.createdAt
            ).toLocaleDateString("en-GB", {
               day: "numeric",
               month: "short",
               year: "numeric",
            })}</td>
            <td data-label="Total">$${Number(order.total).toFixed(2)}</td>
            <td data-label="Payment">${order.paymentStatus || "—"}</td>
            <td data-label="Status">
               <span class="badge ${
                  statusTone[order.status] || ""
               }">${order.status}</span>
            </td>
            <td data-label="Actions">
               <span class="actions">
                  <button class="btn btn--ghost btn--sm" type="button"
                     onclick="openEditOrder('${order._id}', '${order.status}')">Edit</button>
                  <button class="btn btn--danger btn--sm" type="button"
                     onclick="deleteOrder('${order._id}')">Delete</button>
               </span>
            </td>
         </tr>`;
      })
      .join("");
}

function openEditOrder(orderId, currentStatus) {
   const existing = document.getElementById("edit-order-modal");
   if (existing) existing.remove();

   const options = ["pending", "processing", "shipped", "delivered", "canceled"]
      .map(
         (status) =>
            `<option value="${status}" ${
               status === currentStatus ? "selected" : ""
            }>${status.charAt(0).toUpperCase() + status.slice(1)}</option>`
      )
      .join("");

   const modal = document.createElement("div");
   modal.className = "modal is-on";
   modal.id = "edit-order-modal";
   modal.innerHTML = `
      <div class="modal__panel" role="dialog" aria-modal="true" aria-label="Edit order">
         <div class="modal__head">
            <h2 class="modal__title">Update order status</h2>
            <button class="modal__close" type="button" aria-label="Close">&times;</button>
         </div>
         <p class="muted" style="margin:0 0 16px;font-size:13.5px">Order ${orderId}</p>
         <div class="field">
            <label for="orderStatus">Status</label>
            <select id="orderStatus">${options}</select>
         </div>
         <div class="modal__foot">
            <button class="btn btn--ghost" type="button" data-close>Cancel</button>
            <button class="btn" type="button" id="saveOrder">Save</button>
         </div>
      </div>`;

   document.body.appendChild(modal);

   function close() {
      modal.remove();
   }

   modal.querySelector(".modal__close").addEventListener("click", close);
   modal.querySelector("[data-close]").addEventListener("click", close);
   modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
   });
   modal.querySelector("#saveOrder").addEventListener("click", () => {
      updateOrder(orderId, modal);
   });
}

async function updateOrder(orderId, modal) {
   const status = modal.querySelector("#orderStatus").value;

   try {
      const response = await apiFetch(`/api/orders/${orderId}`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error("Update failed");

      modal.remove();
      toast("Order updated");
      fetchOrders("all");
      fetchOrderCounts();
   } catch (error) {
      toastError("Could not update the order");
   }
}

async function deleteOrder(orderId) {
   if (!confirm("Delete this order? This cannot be undone.")) return;

   try {
      const response = await apiFetch(`/api/orders/${orderId}`, {
         method: "DELETE",
         headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Delete failed");

      toast("Order deleted");
      fetchOrders("all");
      fetchOrderCounts();
   } catch (error) {
      toastError("Could not delete the order");
   }
}

async function searchOrders(query) {
   try {
      const isObjectId = /^[a-fA-F0-9-]{8,}$/.test(query);
      const url = isObjectId
         ? `/api/orders?orderId=${encodeURIComponent(query)}`
         : `/api/orders?name=${encodeURIComponent(query)}`;

      const response = await apiFetch(url, {
         method: "GET",
         headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      displayOrders(data.orders || []);
   } catch (error) {
      toastError("Search failed");
   }
}
