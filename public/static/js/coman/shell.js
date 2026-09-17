/* Loads the shared header/footer partials, then wires up nav state. */

(function () {
   // innerHTML never runs <script> tags, so they are re-created by hand.
   function runScripts(el) {
      el.querySelectorAll("script").forEach((old) => {
         const fresh = document.createElement("script");
         if (old.src) fresh.src = old.src;
         else fresh.textContent = old.textContent;
         document.body.appendChild(fresh);
         old.remove();
      });
   }

   async function inject(el, file) {
      try {
         const response = await fetch(file);
         el.innerHTML = await response.text();
         runScripts(el);
      } catch (error) {
         console.error("Failed to load " + file, error);
      }
   }

   async function updateCartCount() {
      const badge = document.getElementById("cartCount");
      if (!badge) return;

      try {
         const response = await apiFetch("/api/cart");
         if (!response.ok) return;

         const items = await response.json();
         const count = Array.isArray(items)
            ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
            : 0;

         badge.textContent = count;
         badge.hidden = count === 0;
      } catch (error) {
         /* guest or offline: leave the badge hidden */
      }
   }

   async function boot() {
      const nav = document.getElementById("navbar-container");
      if (nav) await inject(nav, nav.dataset.src || "navbar.html");

      const footer = document.getElementById("footer-placeholder");
      if (footer) await inject(footer, "footer.html");

      const isGuest = (nav && nav.dataset.src) === "guestNav.html";
      if (isGuest && footer) {
         footer.querySelectorAll('a[href="./index2.html"]').forEach((link) => {
            link.href = "./index.html";
         });
         footer.querySelectorAll('a[href="./wishlist.html"], a[href="./cart.html"], a[href="./viewOrder.html"], a[href="./profile.html"], a[href="./paymentHistory.html"]').forEach((link) => {
            link.href = "./login.html";
         });
         footer.querySelectorAll('a[href="./contact.html"]').forEach((link) => {
            link.href = "./guestcontact.html";
         });
      }

      if (window.markActiveNav) window.markActiveNav();
      if (window.fetchUser) window.fetchUser();
      updateCartCount();
   }

   window.updateCartCount = updateCartCount;

   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
   } else {
      boot();
   }
})();
