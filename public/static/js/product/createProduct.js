const form = document.getElementById("addProductForm");

form.addEventListener("submit", async (e) => {
   e.preventDefault();

   const formData = new FormData();

   // Get form data
   formData.append("name", document.getElementById("name").value);
   formData.append("price", document.getElementById("price").value);
   formData.append("description", document.getElementById("description").value);
   formData.append("category", document.getElementById("category").value);
   formData.append("company", document.getElementById("company").value);
   formData.append(
      "colors",
      document.getElementById("colors").value.split(",")
   );
   formData.append("inventory", document.getElementById("inventory").value);
   formData.append("featured", document.getElementById("featured").checked);
   formData.append(
      "freeShipping",
      document.getElementById("freeShipping").checked
   );

   // Handle image upload
   const imageInput = document.getElementById("image");
   if (imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
   }

   try {
      const response = await fetch("http://127.0.0.1:5000/api/products", {
         method: "POST",
         body: formData,
         credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
         alert("Product added successfully!");
         form.reset();
      } else {
         alert(data.error);
      }
   } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
   }
});
