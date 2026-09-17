const adminProducts = {
   all: [],
   category: "",
   query: "",
};

document.addEventListener("DOMContentLoaded", () => {
   const chips = document.getElementById("categoryChips");
   if (chips) {
      chips.addEventListener("click", (event) => {
         const chip = event.target.closest(".chip");
         if (!chip) return;
         adminProducts.category = chip.dataset.cat || "";
         document.querySelectorAll("#categoryChips .chip").forEach((item) => {
            item.setAttribute(
               "aria-pressed",
               (item.dataset.cat || "") === adminProducts.category
                  ? "true"
                  : "false"
            );
         });
         renderProductRows();
      });
   }

   const search = document.getElementById("searchInput");
   if (search) {
      let timer = null;
      search.addEventListener("input", (event) => {
         clearTimeout(timer);
         timer = setTimeout(() => {
            adminProducts.query = event.target.value;
            renderProductRows();
         }, 180);
      });
   }

   fetchAndDisplayProducts();
});

async function fetchAndDisplayProducts() {
   try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      adminProducts.all = data.products || [];

      const totalProducts = document.getElementById("totalProducts");
      const availableStock = document.getElementById("availableStock");
      if (totalProducts) {
         totalProducts.textContent =
            data.numberOfProducts ?? adminProducts.all.length;
      }
      if (availableStock) availableStock.textContent = data.totalStock ?? "—";

      renderProductRows();
   } catch (error) {
      const body = document.getElementById("productTable");
      if (body) {
         body.innerHTML =
            '<tr><td class="table__empty" colspan="6">Could not load products.</td></tr>';
      }
   }
}

function renderProductRows() {
   const body = document.getElementById("productTable");
   if (!body) return;

   const query = adminProducts.query.trim().toLowerCase();
   const rows = adminProducts.all.filter((product) => {
      if (adminProducts.category && product.category !== adminProducts.category) {
         return false;
      }
      if (!query) return true;
      return (
         String(product.name || "").toLowerCase().includes(query) ||
         String(product._id || "").toLowerCase().includes(query)
      );
   });

   if (!rows.length) {
      body.innerHTML =
         '<tr><td class="table__empty" colspan="6">No products match those filters.</td></tr>';
      return;
   }

   body.innerHTML = rows
      .map(
         (product) => `
      <tr>
         <td data-label="Product">
            <span class="cell-product">
               <img src="${product.image}" alt="${product.name}">
               <span>
                  <strong style="display:block;color:var(--ink)">${product.name}</strong>
                  <span class="muted" style="font-size:12px">${product._id.slice(
                     0,
                     8
                  )}</span>
               </span>
            </span>
         </td>
         <td data-label="Category">${product.category}</td>
         <td data-label="Company">${product.company || "—"}</td>
         <td data-label="Price">$${Number(product.price).toFixed(2)}</td>
         <td data-label="Stock">
            <span class="badge ${
               product.inventory > 5 ? "badge--ok" : "badge--warn"
            }">${product.inventory}</span>
         </td>
         <td data-label="Actions">
            <span class="actions">
               <button class="btn btn--ghost btn--sm" type="button" data-edit="${
                  product._id
               }">Edit</button>
               <button class="btn btn--danger btn--sm" type="button" data-delete="${
                  product._id
               }">Delete</button>
            </span>
         </td>
      </tr>`
      )
      .join("");
}

document.addEventListener("click", (event) => {
   const editBtn = event.target.closest("[data-edit]");
   if (editBtn) {
      const product = adminProducts.all.find(
         (item) => item._id === editBtn.dataset.edit
      );
      if (product) openEditProductModal(product);
      return;
   }

   const deleteBtn = event.target.closest("[data-delete]");
   if (deleteBtn) deleteProduct(deleteBtn.dataset.delete);
});

function openEditProductModal(product) {
   const existing = document.getElementById("edit-product-modal");
   if (existing) existing.remove();

   const modal = document.createElement("div");
   modal.className = "modal is-on";
   modal.id = "edit-product-modal";
   modal.innerHTML = `
      <div class="modal__panel" role="dialog" aria-modal="true" aria-label="Edit product" style="max-width:560px">
         <div class="modal__head">
            <h2 class="modal__title">Edit product</h2>
            <button class="modal__close" type="button" aria-label="Close">&times;</button>
         </div>

         <form id="editProductForm" class="form-grid" enctype="multipart/form-data">
            <div class="field form-grid--full">
               <label for="editName">Name</label>
               <input type="text" id="editName" value="${product.name}" required>
            </div>
            <div class="field">
               <label for="editPrice">Price</label>
               <input type="number" id="editPrice" step="0.01" value="${
                  product.price
               }" required>
            </div>
            <div class="field">
               <label for="editInventory">Inventory</label>
               <input type="number" id="editInventory" value="${
                  product.inventory
               }" required>
            </div>
            <div class="field">
               <label for="editCategory">Category</label>
               <select id="editCategory">
                  <option value="office">Office</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="bedroom">Bedroom</option>
               </select>
            </div>
            <div class="field">
               <label for="editCompany">Company</label>
               <select id="editCompany">
                  <option value="ikea">IKEA</option>
                  <option value="liddy">Liddy</option>
                  <option value="marcos">Marcos</option>
               </select>
            </div>
            <div class="field form-grid--full">
               <label for="editImage">Replace image</label>
               <input type="file" id="editImage" accept="image/*">
               <span class="field__hint">Leave empty to keep the current image.</span>
            </div>
         </form>

         <div class="modal__foot">
            <button class="btn btn--ghost" type="button" data-close>Cancel</button>
            <button class="btn" type="button" id="saveProduct">Save changes</button>
         </div>
      </div>`;

   document.body.appendChild(modal);
   modal.querySelector("#editCategory").value = product.category;
   modal.querySelector("#editCompany").value = product.company || "ikea";

   function close() {
      modal.remove();
   }

   modal.querySelector(".modal__close").addEventListener("click", close);
   modal.querySelector("[data-close]").addEventListener("click", close);
   modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
   });

   modal.querySelector("#saveProduct").addEventListener("click", () => {
      updateProduct(product._id, modal);
   });
}

async function updateProduct(id, modal) {
   const save = modal.querySelector("#saveProduct");
   const formData = new FormData();
   formData.append("name", modal.querySelector("#editName").value);
   formData.append("price", modal.querySelector("#editPrice").value);
   formData.append("category", modal.querySelector("#editCategory").value);
   formData.append("company", modal.querySelector("#editCompany").value);
   formData.append("inventory", modal.querySelector("#editInventory").value);

   const imageFile = modal.querySelector("#editImage").files[0];
   if (imageFile) formData.append("image", imageFile);

   save.disabled = true;
   save.classList.add("is-busy");

   try {
      const response = await apiFetch(`/api/products/${id}`, {
         method: "PATCH",
         body: formData,
      });

      if (!response.ok) throw new Error("Failed to update product");

      modal.remove();
      toast("Product updated");
      fetchAndDisplayProducts();
   } catch (error) {
      save.disabled = false;
      save.classList.remove("is-busy");
      toastError("Could not update the product");
   }
}
