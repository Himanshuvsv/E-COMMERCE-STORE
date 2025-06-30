async function deleteProduct(productId) {
   if (!confirm("Are you sure you want to delete this product?")) {
      return;
   }

   try {
      const deleteUrl = `http://127.0.0.1:5000/api/products/${productId}`;
      const response = await fetch(deleteUrl, {
         method: "DELETE",
         credentials: "include",
         headers: {
            "Content-Type": "application/json",
         },
      });

      if (!response.ok) {
         throw new Error(
            `Failed to delete product. Status: ${response.status}`
         );
      }

      alert("Product deleted successfully");
      location.reload()
      fetchAndDisplayProducts();
   } catch (error) {
      console.error("Error deleting product:", error);
   }
}
