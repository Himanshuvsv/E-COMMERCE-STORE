async function fetchWishlist() {
   const container = document.getElementById("wishlist-grid");
   if (!container) return;

   try {
      const response = await apiFetch("/api/wishlist/showMyWishlist", {
         method: "GET",
      });

      if (!response.ok) throw new Error("Failed to fetch wishlist items");

      const data = await response.json();
      displayWishlist(data.wishlistData || []);
   } catch (error) {
      container.innerHTML = emptyStateMarkup(
         "Could not load your wishlist",
         "Something went wrong. Try refreshing the page."
      );
      setResultCount(0);
   }
}

function displayWishlist(wishlist) {
   const container = document.getElementById("wishlist-grid");
   setResultCount(wishlist.length);

   if (!wishlist.length) {
      container.innerHTML = emptyStateMarkup(
         "Your wishlist is empty",
         "Save the pieces you like and they will show up here.",
         "Browse products",
         "./index2.html"
      );
      return;
   }

   container.innerHTML = wishlist
      .map((item) =>
         productCardMarkup(item.product, {
            wishlist: true,
            inWishlist: true,
            removeLabel: "Remove",
            wishlistItemId: item._id,
         })
      )
      .join("");
}

document.addEventListener("click", async (event) => {
   const remove = event.target.closest(".remove-wishlist");
   if (remove) {
      await removeFromWishlist(remove.dataset.wishlistId);
      return;
   }

   const fav = event.target.closest(".fav");
   if (fav) {
      const card = fav.closest(".pcard");
      const button = card ? card.querySelector(".remove-wishlist") : null;
      if (button) await removeFromWishlist(button.dataset.wishlistId);
   }
});

async function removeFromWishlist(wishlistItemId) {
   try {
      const response = await apiFetch(`/api/wishlist/${wishlistItemId}`, {
         method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove item");

      toast("Removed from your wishlist");
      fetchWishlist();
   } catch (error) {
      toastError("Could not remove that item");
   }
}

fetchWishlist();
