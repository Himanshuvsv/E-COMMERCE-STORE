
document.addEventListener("DOMContentLoaded", async () => {
   const apiUrl = "http://127.0.0.1:5000/api/products";
   const productTable = document.getElementById("productTable");
   const tableContainer = document.querySelector(".container");
   const availableProducts = document.getElementById("totalProducts")
   const availableStock = document.getElementById("availableStock")

   async function fetchAndDisplayProducts() {
      try {
         const response = await fetch(apiUrl);
         if (!response.ok) throw new Error("Failed to fetch products");

         const data = await response.json();
         const products = data.products;
         productTable.innerHTML = "";
         availableProducts.innerHTML = `Available Products : ${data.numberOfProducts}`
         availableStock.innerHTML = `Total Stock : ${data.totalStock}`
         products.forEach((product) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                   <td>${product._id}</td>
                   <td>${product.name}</td>
                   <td>$${product.price}</td>
                   <td>${product.category}</td>
                   <td><img src="http://127.0.0.1:5000/${product.image}" alt="${product.name}" height="60px" width="60px"></td>
                   <td>${product.company}</td>
                   <td>${product.inventory}</td>
                   <td class="actions">
                       <button class="btn btn-edit" onclick="editProduct('${product._id}', '${product.name}', '${product.price}', '${product.category}', '${product.company}', '${product.inventory}', '${product.image}')">Edit</button>
                       <button class="btn btn-delete" onclick="deleteProduct('${product._id}')">Delete</button>
                   </td>
               `;
            productTable.appendChild(row);
         });
      } catch (error) {
         console.error("Error fetching products:", error);
      }
   }

   window.editProduct = (
      id,
      name,
      price,
      category,
      company,
      inventory,
      image
   ) => {
      tableContainer.innerHTML = `
           <form id="editProductForm" enctype="multipart/form-data">
               <h2>Edit Product</h2>
               
               <div class="form-group">
                   <label>ID:</label>
                   <input type="text" id="editId" value="${id}" disabled />
               </div>

               <div class="form-group">
                   <label>Name:</label>
                   <input type="text" id="editName" value="${name}" class="input-field" />
               </div>

               <div class="form-group">
                   <label>Price:</label>
                   <input type="number" id="editPrice" value="${price}" class="input-field" />
               </div>

               <div class="form-group">
                   <label>Category:</label>
                   <input type="text" id="editCategory" value="${category}" class="input-field" />
               </div>

               <div class="form-group">
                   <label>Company:</label>
                   <input type="text" id="editCompany" value="${company}" class="input-field" />
               </div>

               <div class="form-group">
                   <label>Inventory:</label>
                   <input type="number" id="editInventory" value="${inventory}" class="input-field" />
               </div>

               <div class="form-group">
                   <label>Image:</label>
                   <input type="file" id="editImage" class="input-field" value= "${image}"/>
               </div>
               
               <div class="button-group">
                   <button type="button" class="update-btn" onclick="updateProduct('${id}')">Update</button>
                   <button type="button" class="cancel-btn" onclick="cancelEdit()">Cancel</button>
               </div>
           </form>
       `;
   };

   window.updateProduct = async function (id) {
      const formData = new FormData();
      formData.append("name", document.getElementById("editName").value);
      formData.append("price", document.getElementById("editPrice").value);
      formData.append(
         "category",
         document.getElementById("editCategory").value
      );
      formData.append("company", document.getElementById("editCompany").value);
      formData.append(
         "inventory",
         document.getElementById("editInventory").value
      );
      const imageFile = document.getElementById("editImage").files[0];
      if (imageFile) {
         formData.append("image", imageFile);
      }

      try {
         const response = await fetch(
            `http://127.0.0.1:5000/api/products/${id}`,
            {
               method: "PATCH",
               credentials: "include",
               body: formData,
            }
         );

         if (!response.ok) {
            throw new Error("Failed to update product");
         }

         alert("Product updated successfully!");
         location.reload();
      } catch (error) {
         alert("Error updating product: " + error.message);
         console.error("Update error:", error);
      }
   };

   window.cancelEdit = () => {
      location.reload();
   };

   fetchAndDisplayProducts();
});
