/* Loads the admin header + sidebar partial and keeps the drawer in sync. */

(function () {
   async function boot() {
      const headerSlot = document.getElementById("admin-header");
      const sidebarSlot = document.getElementById("admin-sidebar");
      if (!headerSlot && !sidebarSlot) return;

      try {
         const response = await fetch("adminNav.html");
         const markup = await response.text();
         const parsed = new DOMParser().parseFromString(markup, "text/html");

         const header = parsed.querySelector("header.top");
         const sidebar = parsed.querySelector("aside.sidebar");

         if (headerSlot && header) headerSlot.replaceWith(header);
         if (sidebarSlot && sidebar) sidebarSlot.replaceWith(sidebar);
      } catch (error) {
         console.error("Failed to load adminNav.html", error);
         return;
      }

      if (window.markActiveNav) window.markActiveNav();
      if (window.fetchUser) window.fetchUser();

      // Drawer must close when the sidebar becomes part of the layout again.
      window.addEventListener("resize", function () {
         if (window.innerWidth >= 1024 && window.closeNavPanel) {
            window.closeNavPanel();
         }
      });

      document.dispatchEvent(new CustomEvent("adminshell:ready"));
   }

   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
   } else {
      boot();
   }
})();
