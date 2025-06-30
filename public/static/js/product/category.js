document.addEventListener("DOMContentLoaded", function () {
   // Get buttons and table body
   const buttons = document.querySelectorAll("#bedroom, #kitchen, #office");
   const productTable = document.getElementById("productTable");

   // Function to fetch products
   async function fetchProducts(category) {
      try {
         const response = await fetch(
            `http://127.0.0.1:5000/api/products?category=${category}`
         );
         const data = await response.json();

         // Clear existing table rows
         productTable.innerHTML = "";

         // Populate table with new data
         data.products.forEach((product) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                    <td>${product._id}</td>
                    <td>${product.name}</td>
                    <td>$${product.price}</td>
                    <td>${product.category}</td>
                    <td><img class="product" src="${product.image}" alt="${product.name}" width="50"></td>
                    <td>${product.company}</td>
                    <td>${product.inventory}</td>
                    <td class="actions">
                        <button class="btn btn-edit" data-id="${product._id}">Edit</button>
                        <button class="btn btn-delete" data-id="${product._id}">Delete</button>
                    </td>
                `;
            productTable.appendChild(row);
         });
      } catch (error) {
         console.error("Error fetching products:", error);
      }
   }

   // Attach event listeners to buttons
   buttons.forEach((button) => {
      button.addEventListener("click", function () {
         fetchProducts(button.id);
      });
   });
});
