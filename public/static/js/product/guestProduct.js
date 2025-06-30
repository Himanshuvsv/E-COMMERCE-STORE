async function fetchProducts() {
    try {
       const response = await fetch("http://127.0.0.1:5000/api/products");
       if (!response.ok) throw new Error("Failed to fetch products");
 
       const data = await response.json();
       const wishlist = await fetchWishlistItems();
       displayProducts(data.products, wishlist);
    } catch (error) {
       document.getElementById("product-container").innerHTML =
          "<p class='product-error'>Failed to load products.</p>";
    }
 }
 
 async function fetchProductsByCategory(category) {
    try {
       const url = category
          ? `http://127.0.0.1:5000/api/products?category=${category}`
          : "http://127.0.0.1:5000/api/products";
 
       const response = await fetch(url);
       if (!response.ok) throw new Error("Failed to fetch products");
 
       const data = await response.json();
       const wishlist = await fetchWishlistItems();
       displayProducts(data.products, wishlist);
    } catch (error) {
       document.getElementById("product-container").innerHTML =
          "<p class='product-error'>Failed to load products.</p>";
    }
 }
 
 
 document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".category-link").forEach((categoryLink) => {
       categoryLink.addEventListener("click", (event) => {
          event.preventDefault();
          const category = event.target.getAttribute("data-category");
          fetchProductsByCategory(category);
       });
    });
 });
 
 
 async function fetchWishlistItems() {
    
 }
 
 function displayProducts(products, wishlist) {
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
             <p class="product-category"><b>Category</b>: ${product.category}</p>
             <p class="product-description review-link" data-product-id="${
                product._id
             }">
                <strong>Reviews ⭐:</strong> ${product.numOfReviews}
             </p>
             <p class="product-description"><strong>Average Rating:</strong> ${"⭐".repeat(
                product.averageRating
             )}</p>
             <p class="product-price">$${product.price.toFixed(2)}</p>
              <button class="product-button add-to-cart" data-product-id="${product._id}">Add to Cart</button>
          </div>
       </div>`;

       container.appendChild(productCard);
    });
 
    document.querySelectorAll(".review-link").forEach((link) => {
       link.addEventListener("click", async (event) => {
          const productId = event.currentTarget.getAttribute("data-product-id");
          if (!productId) return;
          openReviewPopup(productId);
       });
    });

    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", () => {
         window.location.href = "./login.html";
      });
  });
 }
 

 async function openReviewPopup(productId) {
    if (!productId) {
       alert("Error: Product ID is missing.");
       return;
    }
    try {
       const response = await fetch(
          `http://127.0.0.1:5000/api/reviews/product/${productId}`
       );
       if (!response.ok) throw new Error("Failed to fetch reviews");
       const data = await response.json();
       displayReviewsPopup(data.reviews);
    } catch (error) {
       alert("Failed to load reviews.");
    }
 }
 
 function displayReviewsPopup(reviews) {
    const overlay = document.createElement("div");
    overlay.classList.add("review-overlay");
    const popup = document.createElement("div");
    popup.classList.add("review-popup");
    popup.innerHTML = `
       <div class="review-popup-content">
          <span class="close-popup">&times;</span>
          <h2>Product Reviews</h2>
          <div class="review-list">
             ${
                reviews.length > 0
                   ? reviews
                        .map(
                           (review) => `
                <div class="review-item">
                   <p class="review-title">${review.title}</p>
                   <p class="review-rating">${"⭐".repeat(review.rating)}</p>
                   <p class="review-comment">${review.comment}</p>
                   <p class="review-user"><strong> By : ${
                      review.user.name
                   } </strong></p>
                </div>
                `
                        )
                        .join("")
                   : "<p>No reviews available.</p>"
             }
          </div>
       </div>
    `;
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    popup.querySelector(".close-popup").addEventListener("click", () => {
       overlay.remove();
    });
    overlay.addEventListener("click", (event) => {
       if (event.target === overlay) overlay.remove();
    });
 }
 
 fetchProducts();
 