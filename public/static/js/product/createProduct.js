const form = document.getElementById("addProductForm");

form.addEventListener("submit", async (event) => {
   event.preventDefault();

   const submit = form.querySelector('button[type="submit"]');
   const formData = new FormData();

   formData.append("name", document.getElementById("name").value);
   formData.append("price", document.getElementById("price").value);
   formData.append("description", document.getElementById("description").value);
   formData.append("category", document.getElementById("category").value);
   formData.append("company", document.getElementById("company").value);
   formData.append("colors", document.getElementById("colors").value.split(","));
   formData.append("inventory", document.getElementById("inventory").value);
   formData.append("featured", document.getElementById("featured").checked);
   formData.append(
      "freeShipping",
      document.getElementById("freeShipping").checked
   );

   const imageInput = document.getElementById("image");
   if (imageInput.files[0]) formData.append("image", imageInput.files[0]);

   submit.disabled = true;
   submit.classList.add("is-busy");

   try {
      const response = await fetch("/api/products", {
         method: "POST",
         body: formData,
         credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
         form.reset();
         toast("Product added");
      } else {
         toastError(data.error || data.msg || "Could not add the product");
      }
   } catch (error) {
      toastError("Could not add the product");
   } finally {
      submit.disabled = false;
      submit.classList.remove("is-busy");
   }
});
