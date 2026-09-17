async function addToWishlist(productId) {
   try {
      const response = await fetch("/api/wishlist", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify({ productId }),
      });

      if (response.ok) {
         toast("Saved to your wishlist");
         return;
      }

      const errorText = await response.text();
      try {
         toastError(JSON.parse(errorText).msg || "Could not save to wishlist");
      } catch (parseError) {
         toastError(errorText || "Could not save to wishlist");
      }
   } catch (error) {
      toastError("Something went wrong. Please try again.");
   }
}
