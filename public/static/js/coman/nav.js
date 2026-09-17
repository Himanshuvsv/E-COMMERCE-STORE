/* Header behaviour: mobile drawer, dropdown menus, active link marking. */

(function () {
   var scrim = null;
   var openPanel = null;

   function getScrim() {
      if (scrim && document.body.contains(scrim)) return scrim;

      scrim = document.createElement("div");
      scrim.className = "scrim";
      document.body.appendChild(scrim);
      scrim.addEventListener("click", closePanel);
      return scrim;
   }

   function openPanelEl(el) {
      if (!el) return;
      openPanel = el;
      el.classList.add("is-open");
      getScrim().classList.add("is-on");
      document.body.style.overflow = "hidden";
   }

   function closePanel() {
      if (openPanel) openPanel.classList.remove("is-open");
      openPanel = null;
      if (scrim) scrim.classList.remove("is-on");
      document.body.style.overflow = "";
   }

   function closeMenus(except) {
      document.querySelectorAll(".menu.is-open").forEach(function (menu) {
         if (menu !== except) menu.classList.remove("is-open");
      });
   }

   function markActive() {
      var here = location.pathname.split("/").pop() || "index.html";

      document
         .querySelectorAll(".nav a, .drawer a, .sidebar a")
         .forEach(function (link) {
            var href = (link.getAttribute("href") || "")
               .split("/")
               .pop()
               .split("?")[0];
            if (!href || href === "#") return;
            if (href !== here) return;

            if (link.closest(".nav")) {
               link.setAttribute("aria-current", "page");
            } else {
               link.classList.add("is-active");
            }
         });
   }

   document.addEventListener("click", function (event) {
      var toggle = event.target.closest("[data-panel]");
      if (toggle) {
         event.preventDefault();
         var target = document.querySelector(toggle.getAttribute("data-panel"));
         if (target && target === openPanel) closePanel();
         else {
            closePanel();
            openPanelEl(target);
         }
         return;
      }

      if (event.target.closest("[data-panel-close]")) {
         event.preventDefault();
         closePanel();
         return;
      }

      var menuBtn = event.target.closest(".menu__btn");
      if (menuBtn) {
         event.preventDefault();
         var menu = menuBtn.closest(".menu");
         var wasOpen = menu.classList.contains("is-open");
         closeMenus(menu);
         menu.classList.toggle("is-open", !wasOpen);
         return;
      }

      if (!event.target.closest(".menu")) closeMenus();

      if (event.target.closest(".drawer a")) closePanel();
   });

   document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      closeMenus();
      closePanel();
   });

   var lastWidth = window.innerWidth;
   window.addEventListener("resize", function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      closePanel();
      closeMenus();
   });

   window.markActiveNav = markActive;
   window.closeNavPanel = closePanel;

   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", markActive);
   } else {
      markActive();
   }
})();
