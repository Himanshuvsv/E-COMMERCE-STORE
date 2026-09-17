let allCustomers = [];

async function displayUsers() {
   const body = document.getElementById("customerTable");
   if (!body) return;

   try {
      const response = await apiFetch("/api/users", {
         method: "GET",
         headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Error fetching users");

      const data = await response.json();
      allCustomers = data.users || [];
      renderCustomers();
   } catch (error) {
      body.innerHTML =
         '<tr><td class="table__empty" colspan="4">Could not load customers.</td></tr>';
   }
}

function renderCustomers() {
   const body = document.getElementById("customerTable");
   const count = document.getElementById("customerCount");
   const query = (document.getElementById("searchInput")?.value || "")
      .trim()
      .toLowerCase();

   const rows = allCustomers.filter((user) => {
      if (!query) return true;
      return (
         String(user.name || "").toLowerCase().includes(query) ||
         String(user.email || "").toLowerCase().includes(query)
      );
   });

   if (count) {
      count.textContent =
         rows.length + (rows.length === 1 ? " customer" : " customers");
   }

   if (!rows.length) {
      body.innerHTML =
         '<tr><td class="table__empty" colspan="4">No customers match that search.</td></tr>';
      return;
   }

   body.innerHTML = rows
      .map((user) => {
         const joined = new Date(user.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
         });

         return `
         <tr>
            <td data-label="Name"><strong style="color:var(--ink)">${
               user.name
            }</strong></td>
            <td data-label="Email">${user.email}</td>
            <td data-label="Joined">${joined}</td>
            <td data-label="Customer ID"><span class="muted" style="font-size:12.5px">${user._id}</span></td>
         </tr>`;
      })
      .join("");
}

document.addEventListener("DOMContentLoaded", () => {
   const search = document.getElementById("searchInput");
   if (search) {
      let timer = null;
      search.addEventListener("input", () => {
         clearTimeout(timer);
         timer = setTimeout(renderCustomers, 180);
      });
   }

   displayUsers();
});
