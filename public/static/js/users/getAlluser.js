async function displayUsers() {
    try {
       const response = await fetch(
          "http://127.0.0.1:5000/api/users",
          {
             method: "GET",
             credentials: "include",
             headers: { "Content-Type": "application/json" },
          }
       );

       if (!response.ok) {
          throw new Error("Error fetching users");
       }

       const data = await response.json();
       if (!data || !data.users || data.users.length === 0) {
          throw new Error("No users available to fetch");
       }
       console.log("Data from API:", data);

       const customerTable =
          document.getElementById("customerTable");
       customerTable.innerHTML = "";
       data.users.forEach((user) => {
          const row = document.createElement("tr");
          const idCell = document.createElement("td");
          idCell.innerText = user._id;
          row.appendChild(idCell);
          const dateCell = document.createElement("td");
          const formattedDate = new Date(
             user.createdAt
          ).toLocaleDateString("en-GB", {
             weekday: "long",
             day: "numeric",
             month: "long",
             year: "numeric",
          });
          dateCell.innerText = formattedDate;
          row.appendChild(dateCell);
          const nameCell = document.createElement("td");
          nameCell.innerText = user.name;
          row.appendChild(nameCell);
          const emailCell = document.createElement("td");
          emailCell.innerText = user.email;
          row.appendChild(emailCell);
          const actionsCell = document.createElement("td");
          actionsCell.innerHTML = `
                 <button>🔍</button>
                 <button>✏️</button>
                 <button>🗑️</button>
             `;
          row.appendChild(actionsCell);
          customerTable.appendChild(row);
       });
    } catch (error) {
       console.error("Error:", error);
    }
 }
 displayUsers();