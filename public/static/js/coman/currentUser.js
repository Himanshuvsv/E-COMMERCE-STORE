async function fetchUser() {
   try {
      const response = await fetch("http://127.0.0.1:5000/api/users/showMe", {
         method: "GET",
         credentials: "include",
         headers: { "Content-Type": "application/json" },
      });

      const currentdata = await response.json();
      if (!response.ok) {
         throw new Error("Failed to fetch user");
      }

      document.getElementById("username").textContent =
         currentdata.user.name || "User";
   } catch (error) {
      console.error("Error fetching user:", error);
   }
}
fetchUser();
