document.addEventListener("click", function (event) {
   if (event.target.matches(".continue-btn")) {
      openPaymentPage();
   }
});

function openPaymentPage() {
   window.location.href = "payment.html";
}

async function handlePaymentSuccess() {
   try {
      const response = await fetch("http://127.0.0.1:5000/api/cart", {
         credentials: "include",
      });

      if (!response.ok)
         throw new Error(`Failed to fetch cart: ${response.statusText}`);
   } catch (error) {
      alert(`An error occurred: ${error.message}`);
   }
}
