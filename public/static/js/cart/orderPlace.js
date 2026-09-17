document.addEventListener("click", function (event) {
   if (event.target.closest(".continue-btn")) {
      window.location.href = "payment.html";
   }
});
