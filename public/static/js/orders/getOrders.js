document.addEventListener("DOMContentLoaded", function () {
   fetchOrders("all");
   fetchOrderCounts();
});

async function fetchOrderCounts() {
   try {
      const response = await fetch("http://127.0.0.1:5000/api/orders");
      const data = await response.json();

      if (data.orderStatusCounts) {
         document.getElementById("allCount").innerText = data.numberOfOrders;
         document.getElementById("pendingCount").innerText =
            data.orderStatusCounts.pending || 0;
         document.getElementById("processingCount").innerText =
            data.orderStatusCounts.processing || 0;
         document.getElementById("shippedCount").innerText =
            data.orderStatusCounts.shipped || 0;
         document.getElementById("canceledCount").innerText =
            data.orderStatusCounts.canceled || 0;
         document.getElementById("deliveredCount").innerText =
            data.orderStatusCounts.delivered || 0;
      }
   } catch (error) {
      console.error("Error fetching order counts:", error);
   }
}

async function fetchOrders(status = "all") {
   try {
      let url = "http://127.0.0.1:5000/api/orders";
      if (status !== "all") {
         url += `?status=${status}`;
      }

      const response = await fetch(url, {
         method: "GET",
         credentials: "include",
         headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      displayOrders(data.orders);
   } catch (error) {
      console.error("Error fetching orders:", error);
   }
}

function displayOrders(orders) {
   const orderTable = document.getElementById("orderTable");
   orderTable.innerHTML = "";

   orders.forEach((order) => {
      const row = document.createElement("tr");
      row.innerHTML = `
           <td>${order._id}</td>
           <td>${order.user.name}</td>
           <td>${order.orderItems.map((item) => item.name).join(", ")}</td>
           <td>${order.orderItems
              .map(
                 (item) =>
                    `<img src="${item.image}" width="50" alt="Product Image">`
              )
              .join(" ")}</td>
           <td>${new Date(order.createdAt).toLocaleDateString()}</td>
           <td>$${order.total.toFixed(2)}</td>
           <td>${order.paymentStatus}</td>
           <td>${order.status}</td>
           <td>
               <button class="btn btn-edit" onclick="openEditOrder('${
                  order._id
               }', '${order.status}')">Edit</button>
               <button class="btn btn-delete" onclick="deleteOrder('${
                  order._id
               }')">Delete</button>
           </td>
       `;
      orderTable.appendChild(row);
   });
}

document.querySelectorAll("button[id]").forEach((button) => {
   button.addEventListener("click", function () {
      fetchOrders(this.id);
   });
});

function openEditOrder(orderId, currentStatus) {
   const editContainer = document.getElementById("editOrderContainer");
   editContainer.innerHTML = `
       <div class="edit-popup">
           <h2>Edit Order: ${orderId}</h2>
           <label for="orderStatus">Change Status:</label>
           <select id="orderStatus">
               <option value="pending" ${
                  currentStatus === "pending" ? "selected" : ""
               }>Pending</option>
               <option value="processing" ${
                  currentStatus === "processing" ? "selected" : ""
               }>Processing</option>
               <option value="shipped" ${
                  currentStatus === "shipped" ? "selected" : ""
               }>Shipped</option>
               <option value="delivered" ${
                  currentStatus === "delivered" ? "selected" : ""
               }>Delivered</option>
           </select>
           <button onclick="updateOrder('${orderId}')">Update</button>
           <button onclick="cancelEdit()">Cancel</button>
       </div>
   `;
   editContainer.style.display = "block";
}

function cancelEdit() {
   document.getElementById("editOrderContainer").style.display = "none";
   fetchOrders("all");
}

function updateOrder(orderId) {
   const newStatus = document.getElementById("orderStatus").value;
   fetch(`http://127.0.0.1:5000/api/orders/${orderId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
   })
      .then((response) => response.json())
      .then((data) => {
         if (data.error) {
            alert(data.error);
         } else {
            alert("Order updated successfully");
            location.reload();
         }
      })
      .catch((error) => console.error("Error updating order:", error));
}

function deleteOrder(orderId) {
   if (confirm("Are you sure you want to delete this order?")) {
      fetch(`http://127.0.0.1:5000/api/orders/${orderId}`, {
         method: "DELETE",
         credentials: "include",
         headers: { "Content-Type": "application/json" },
      })
         .then((response) => response.json())
         .then((data) => {
            alert("Order deleted successfully");
            fetchOrders("all");
         })
         .catch((error) => console.error("Error deleting order:", error));
   }
}

document
   .getElementById("searchOrderButton")
   .addEventListener("click", function () {
      const searchValue = document.getElementById("searchOrder").value.trim();
      if (searchValue) {
         searchOrders(searchValue);
      }
   });

document
   .getElementById("searchOrder")
   .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
         document.getElementById("searchOrderButton").click();
      }
   });

async function searchOrders(query) {
   try {
      let url;
      const objectIdPattern = /^[a-fA-F0-9]{24}$/;

      if (objectIdPattern.test(query)) {
         url = `http://127.0.0.1:5000/api/orders?orderId=${query}`;
      } else {
         url = `http://127.0.0.1:5000/api/orders?name=${encodeURIComponent(
            query
         )}`;
      }

      const response = await fetch(url, {
         method: "GET",
         credentials: "include",
         headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      displayOrders(data.orders);
   } catch (error) {
      console.error("Error searching orders:", error);
   }
}
