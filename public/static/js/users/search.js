/* The header search filters the loaded grid; kept as a function for older markup. */

function searchProduct() {
   const input = document.getElementById("searchInput");
   if (!input) return;

   input.dispatchEvent(new Event("input", { bubbles: true }));
}
