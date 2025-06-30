
async function addToWishlist(productId) {
    try {
       const response = await fetch("http://127.0.0.1:5000/api/wishlist", {
          method: "POST",
          headers: {
             "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productId }),
       });
       if (response.ok) {
          const data = await response.json();
          alert("Successfully added to wishlist!");
       } else {
          const errorText = await response.text();
          try {
             const errorData = JSON.parse(errorText);
             alert(`Error: ${errorData["msg"]}`);
          } catch (e) {
             alert(`Error: ${errorText || "An unexpected error occurred"}`);
          }
       }
    } catch (error) {
       alert("An unexpected error occurred. Please try again later.");
    }
 }
 