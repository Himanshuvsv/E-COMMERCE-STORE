/* Shared product card markup used by the storefront, search and wishlist grids. */

function escapeHtml(value) {
   return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
}

function money(value) {
   const number = Number(value) || 0;
   return "$" + number.toFixed(2);
}

function starsMarkup(rating) {
   const filled = Math.round(Number(rating) || 0);
   let out = '<span class="stars" aria-hidden="true">';
   for (let i = 1; i <= 5; i++) {
      out +=
         '<svg viewBox="0 0 24 24" class="' +
         (i <= filled ? "on" : "") +
         '"><path d="m12 3.6 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.9l6.1-.7z"/></svg>';
   }
   return out + "</span>";
}

function productCardMarkup(product, options) {
   const opts = options || {};
   const id = product._id || product.id;
   const image = product.image || "./logo.jpeg";
   const description = product.description || "No description available.";
   const rating = Number(product.averageRating) || 0;
   const reviews = Number(product.numOfReviews) || 0;
   const lowStock = Number(product.inventory) > 0 && Number(product.inventory) <= 5;

   const favButton = opts.wishlist
      ? '<button class="fav" type="button" data-product-id="' +
        escapeHtml(id) +
        '" aria-pressed="' +
        (opts.inWishlist ? "true" : "false") +
        '" aria-label="Save to wishlist">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20z"/></svg>' +
        "</button>"
      : "";

   const removeButton = opts.removeLabel
      ? '<button class="btn btn--ghost btn--sm remove-wishlist" type="button" data-wishlist-id="' +
        escapeHtml(opts.wishlistItemId) +
        '">' +
        escapeHtml(opts.removeLabel) +
        "</button>"
      : "";

   const addButton = opts.hideAdd
      ? ""
      : '<button class="btn btn--outline btn--sm add-to-cart" type="button" data-product-id="' +
        escapeHtml(id) +
        '">Add to cart</button>';

   return (
      '<li class="pcard" data-id="' +
      escapeHtml(id) +
      '" data-name="' +
      escapeHtml(product.name) +
      '" data-price="' +
      escapeHtml(Number(product.price) || 0) +
      '" data-image="' +
      escapeHtml(image) +
      '" data-category="' +
      escapeHtml(product.category || "") +
      '" data-description="' +
      escapeHtml(description) +
      '">' +
      '<div class="shot">' +
      '<img src="' +
      escapeHtml(image) +
      '" alt="' +
      escapeHtml(product.name) +
      '" loading="lazy">' +
      (lowStock ? '<span class="badge badge--warn">Low stock</span>' : "") +
      favButton +
      "</div>" +
      '<div class="pcard__body">' +
      '<span class="cat">' +
      escapeHtml(product.category || "Furniture") +
      "</span>" +
      '<h3 class="name">' +
      escapeHtml(product.name) +
      "</h3>" +
      '<p class="desc">' +
      escapeHtml(description) +
      "</p>" +
      '<button class="rate review-link" type="button" data-product-id="' +
      escapeHtml(id) +
      '">' +
      starsMarkup(rating) +
      "<span>" +
      (reviews
         ? rating.toFixed(1) + " · " + reviews + (reviews === 1 ? " review" : " reviews")
         : "No reviews yet") +
      "</span>" +
      "</button>" +
      "</div>" +
      '<div class="buy">' +
      '<span class="price">' +
      money(product.price) +
      "</span>" +
      '<span class="actions">' +
      addButton +
      removeButton +
      "</span>" +
      "</div>" +
      "</li>"
   );
}

function emptyStateMarkup(title, message, actionLabel, actionHref) {
   return (
      '<li class="empty"><h3>' +
      escapeHtml(title) +
      "</h3><p>" +
      escapeHtml(message) +
      "</p>" +
      (actionLabel
         ? '<a class="btn" href="' + escapeHtml(actionHref || "#") + '">' + escapeHtml(actionLabel) + "</a>"
         : "") +
      "</li>"
   );
}

function setResultCount(count) {
   const node = document.getElementById("resultCount");
   if (!node) return;
   node.textContent = count + (count === 1 ? " item" : " items");
}
