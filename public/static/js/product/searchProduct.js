const searchProduct = async () => {
   const searchInput = document.getElementById("searchInput").value.trim();
   if (!searchInput) {
      alert("Please enter a product ID or name to search.");
      return;
   }
   const isHexadecimal = /^[0-9a-fA-F]{24}$/.test(searchInput);

   let url = "";
   if (isHexadecimal) {
      url = `http://127.0.0.1:5000/api/products?id=${searchInput}`;
      console.log(url);
   } else {
      url = `http://127.0.0.1:5000/api/products?name=${encodeURIComponent(
         searchInput
      )}`;
   }

   try {
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error("Product not found");
      }

      const data = await response.json();
      if (isHexadecimal) {
         displayProductInTable(data.products[0]);
      } else {
         displayProductsInTable(data.products);
      }
   } catch (error) {
      alert(error.message);
   }
};

const displayProductsInTable = (products) => {
   const tableBody = document.getElementById("productTable");
   tableBody.innerHTML = "";

   if (!products || products.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8">No products found</td></tr>';
      return;
   }

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
      tableBody.appendChild(row);
   });
};

const displayProductInTable = (product) => {
   const tableBody = document.getElementById("productTable");
   tableBody.innerHTML = "";

   if (!product) {
      tableBody.innerHTML = '<tr><td colspan="8">No product found</td></tr>';
      return;
   }

   const row = document.createElement("tr");
   row.innerHTML = `
      <td id="productId">${product._id}</td>
      <td id="productName">${product.name}</td>
      <td id="productPrice">$${product.price}</td>
      <td id="productCategory">${product.category}</td>
      <td><img src="http://127.0.0.1:5000/${product.image}" alt="${product.name}" height="60px" width="60px"></td>
      <td id="productCompany">${product.company}</td>
      <td id="productInventory">${product.inventory}</td>
      <td class="actions">
         <button class="edit" onclick="editProduct('${product._id}')">Edit</button>
         <button class="delete" onclick="deleteProduct('${product._id}')">Delete</button>
      </td>
   `;
   tableBody.appendChild(row);
};
