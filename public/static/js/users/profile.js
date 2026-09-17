/* Shared by profile.html and adminProfile.html. */

async function loadProfile() {
   try {
      const response = await fetch("/api/users/showMe", {
         method: "GET",
         credentials: "include",
         headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch user details");

      const user = data.user;
      if (!user) return;

      const set = (id, value) => {
         const node = document.getElementById(id);
         if (node) node.textContent = value;
      };

      set("profileName", user.name || "—");
      set("profileEmail", user.email || "—");
      set("profileRole", user.role === "admin" ? "Administrator" : "Customer");
      set("summaryName", user.name || "—");
      set("summaryEmail", user.email || "—");
      set("profileId", user.userId || user._id || "—");

      const badge = document.getElementById("profileRoleBadge");
      if (badge) {
         badge.textContent = user.role === "admin" ? "Admin" : "Customer";
         badge.className =
            "badge " + (user.role === "admin" ? "badge--ok" : "");
      }
   } catch (error) {
      toastError("Could not load your profile");
   }
}

function openProfileModal(id) {
   const modal = document.getElementById(id);
   if (modal) modal.classList.add("is-on");
}

function closeProfileModal(modal) {
   modal.classList.remove("is-on");
}

document.addEventListener("DOMContentLoaded", () => {
   loadProfile();

   document.querySelectorAll("[data-open-modal]").forEach((button) => {
      button.addEventListener("click", () => {
         openProfileModal(button.dataset.openModal);
      });
   });

   document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (event) => {
         if (event.target === modal || event.target.closest("[data-close]")) {
            closeProfileModal(modal);
         }
      });
   });

   const profileForm = document.getElementById("updateProfileForm");
   if (profileForm) {
      profileForm.addEventListener("submit", async (event) => {
         event.preventDefault();

         const formData = new FormData(profileForm);
         try {
            const response = await fetch("/api/users/updateUser", {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               credentials: "include",
               body: JSON.stringify({
                  name: formData.get("name"),
                  email: formData.get("email"),
               }),
            });

            if (!response.ok) throw new Error("Failed to update profile");

            closeProfileModal(document.getElementById("updateProfileModal"));
            toast("Profile updated");
            loadProfile();
         } catch (error) {
            toastError("Could not update your profile");
         }
      });
   }

   const passwordForm = document.getElementById("updatePasswordForm");
   if (passwordForm) {
      passwordForm.addEventListener("submit", async (event) => {
         event.preventDefault();

         const formData = new FormData(passwordForm);
         try {
            const response = await fetch("/api/users/updateUserPassword", {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               credentials: "include",
               body: JSON.stringify({
                  oldPassword: formData.get("oldPassword"),
                  newPassword: formData.get("newPassword"),
               }),
            });

            if (!response.ok) throw new Error("Failed to update password");

            passwordForm.reset();
            closeProfileModal(document.getElementById("updatePasswordModal"));
            toast("Password updated");
         } catch (error) {
            toastError("Could not update your password");
         }
      });
   }

   document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      document
         .querySelectorAll(".modal.is-on")
         .forEach((modal) => closeProfileModal(modal));
   });
});
