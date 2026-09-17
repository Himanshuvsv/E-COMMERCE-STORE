async function fetchUser() {
   const nameNode = document.getElementById("username");
   if (!nameNode) return;

   try {
      const response = await apiFetch("/api/users/showMe", {
         method: "GET",
         headers: { "Content-Type": "application/json" },
      });

      const currentdata = await response.json();
      if (!response.ok) {
         throw new Error("Failed to fetch user");
      }

      nameNode.textContent = currentdata.user.name || "User";
   } catch (error) {
      /* Navbar may not be injected yet; shell/adminShell retry after load. */
   }
}

window.fetchUser = fetchUser;
fetchUser();
