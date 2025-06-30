async function searchProduct() {
   const searchInput = document.getElementById("searchInput").value.trim();
   let apiUrl = "http://127.0.0.1:5000/api/products";

   if (searchInput) {
      const nameRegex = searchInput
         .split(" ")
         .map((word) => `(?=.*${word})`)
         .join("");
      apiUrl += `?name=${encodeURIComponent(nameRegex)}`;
   }

   try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
         throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      if (!data || typeof data !== "object" || !Array.isArray(data.products)) {
         throw new Error("Invalid response format");
      }
      searchProducts(data.products);
   } catch (error) {
      alert("Error fetching products. Please try again later.");
   }
}

const searchProducts = (products) => {
   const container = document.getElementById("product-container");
   container.innerHTML = "";

   if (products.length === 0) {
      container.innerHTML = "<p class='product-message'>No products found.</p>";
      return;
   }

   products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
            <div class="product-item">
                <img src="http://127.0.0.1:5000/${product.image}" alt="${
         product.name
      }" class="product-image"/>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${
                       product.description || "No description available."
                    }</p>
                    <p class="product-description review-link" data-product-id="${
                       product.id
                    }">View Reviews (${product.numOfReviews || 0})</p>
                    <p class="product-description">Average Rating: ${"⭐".repeat(
                       product.averageRating
                    )}</p>
                    <p class="product-price">$${
                       product.price ? product.price.toFixed(2) : "0.00"
                    }</p>
                    <button class="product-button">Add to Cart</button>
                </div>
            </div>
        `;

      container.appendChild(productCard);
   });
};
