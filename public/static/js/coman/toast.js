/* Bottom-center toast, replaces alert() across the storefront. */

(function () {
   var node = null;
   var textNode = null;
   var timer = null;

   function ensure() {
      if (node && document.body.contains(node)) return;

      node = document.createElement("div");
      node.className = "toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      node.innerHTML =
         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg><span></span>';
      document.body.appendChild(node);
      textNode = node.querySelector("span");
   }

   function toast(message, kind) {
      ensure();
      textNode.textContent = message;
      node.querySelector("svg").hidden = kind === "error";
      node.style.background = kind === "error" ? "#8c1e18" : "";

      requestAnimationFrame(function () {
         node.classList.add("is-on");
      });

      clearTimeout(timer);
      timer = setTimeout(function () {
         node.classList.remove("is-on");
      }, 2600);
   }

   window.toast = toast;
   window.toastError = function (message) {
      toast(message, "error");
   };
})();
