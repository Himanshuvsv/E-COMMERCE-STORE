async function deleteProduct(productId) {
   if (!confirm("Delete this product? This cannot be undone.")) return;

   try {
      const response = await fetch(`/api/products/${productId}`, {
         method: "DELETE",
         credentials: "include",
         headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete product");

      toast("Product deleted");
      if (window.fetchAndDisplayProducts) fetchAndDisplayProducts();
   } catch (error) {
      toastError("Could not delete the product");
   }
}
