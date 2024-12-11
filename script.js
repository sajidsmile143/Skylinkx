// Sample product data
let products = [];
let currentPage = 1; // Current page number
let productsPerPage = 5; // Default products per page

// Elements for the modal
const modal = document.getElementById("product-modal");
const modalTitle = document.getElementById("modal-title");
const productName = document.getElementById("product-name");
const productCategory = document.getElementById("product-category");
const productPrice = document.getElementById("product-price");
const productRating = document.getElementById("product-rating");
const productImage = document.getElementById("product-image");
const productForm = document.getElementById("product-form");
const closeModalBtn = document.getElementById("close-modal");
const submitProductBtn = document.getElementById("submit-product");

// Table Body Element
const tableBody = document.getElementById("product-table-body");

// Open Modal for Adding Product
document.getElementById("add-product-btn").addEventListener("click", () => {
    // alert("clicked");
    modal.style.display = "flex";
    modalTitle.textContent = "Add Product";
    productForm.reset();
    submitProductBtn.textContent = "Add Product";
    submitProductBtn.onclick = addProduct;
});

// Close the Modal
closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
});
// Function to handle API calls using async/await
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error; // Re-throw to handle in the calling function
    }
} // Fetch Data from API
async function fetchData() {
    loader.style.display = "block"; // Show the loader
    // alert("fetching..");
    try {
        const data = await apiCall("https://fakestoreapi.com/products");

        products = data;

        renderProducts();
    } catch (err) {
        console.log(`Error fetching data`, err);
    } finally {
        loader.style.display = "none"; // Show the loader
    }
}
// // Fetch Data from API
// function fetchData() {
//     loader.style.display = "block"; // Show the loader
//     fetch("https://fakestoreapi.com/products")
//         .then((response) => response.json())
//         .then((data) => {
//             products = data; // Save data to the products array
//             renderProducts();
//             loader.style.display = "none";
//         })
//         .catch((error) => {
//             console.error("Error fetching data:", error);
//             loader.style.display = "none"; // Hide the loader in case of error
//         });
// }
const searchInput = document.getElementById("search-products");

searchInput.addEventListener("input", (event) => {
    const searchText = event.target.value.toLowerCase();
    const filteredProducts = products.filter((product) =>
        product.title.toLowerCase().includes(searchText)
    );
    renderProducts(filteredProducts); // Render only filtered products
});
//create dynamicaly row for Table
function createProductRow(product) {
    const rating = product.rating ? product.rating.rate : 0;
    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="product-list__table-cell">
            <img src="${product.image}" alt="${product.title}" class="product-list__image" />
        </td>
        <td class="product-list__table-cell">${product.title}</td>
        <td class="product-list__table-cell">${product.category}</td>
        <td class="product-list__table-cell">$${product.price}</td>
       
        <td class="product-list__table-cell">⭐️${rating}</td>
        <td class="product-list__table-cell">
            <button class="product-list__action-btn product-list__action-btn--edit" onclick="editProduct(${product.id})">
                <i class="fas fa-edit" title="Edit"></i>
            </button>
            <button class="product-list__action-btn product-list__action-btn--delete" onclick="deleteProduct(${product.id})">
                <i class="fas fa-trash-alt" title="Delete"></i>
            </button>
        </td>
    `;
    return row;
}
// Pagination change handler
document.getElementById("products-per-page").addEventListener("change", function (event) {
    productsPerPage = parseInt(event.target.value);
    currentPage = 1; // Reset to first page when changing items per page
    renderProducts(); // Re-render with new products per page
});

// Previous Page
document.getElementById("prev-page").addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
    }
});

// Next Page
document.getElementById("next-page").addEventListener("click", function () {
    const totalPages = Math.ceil(products.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
    }
});

// Function to calculate the products to show on the current page
function getPaginatedProducts() {
    const start = (currentPage - 1) * productsPerPage;
    const end = currentPage * productsPerPage;
    return products.slice(start, end);
}
// Render the products for the current page
function renderProducts(filteredProducts = products) {
    const paginatedProducts = getPaginatedProducts(filteredProducts);
    tableBody.innerHTML = ""; // Clear existing table rows

    paginatedProducts.forEach((product) => {
        const row = createProductRow(product);
        tableBody.appendChild(row);
    });

    updatePageInfo(filteredProducts.length);
}

// Update the page information (e.g., "Page 1 of 5")
function updatePageInfo(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;
}

function validateProductForm() {
    // Check if all fields are filled
    if (
        !productName.value.trim() ||
        !productCategory.value.trim() ||
        !productPrice.value.trim() ||
        !productRating.value.trim()
    ) {
        alert("All fields are required. Please fill in all the fields.");
        return false;
    }

    // Check if rating is a valid number between 1 and 5
    const ratingValue = parseFloat(productRating.value);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        alert("Invalid rating value. Please enter a number between 1 and 5.");
        return false;
    }

    // Validation passed
    return true;
}

// Add a new Product
async function addProduct(event) {
    event.preventDefault();
    // console.log("Adding new product...");

    // Show loader
    const loader = document.getElementById("loader");
    loader.style.display = "flex";
    if (!validateProductForm()) {
        loader.style.display = "none"; // Hide loader if validation fails
        return;
    }

    const file = productImage.files[0];
    const imageUrl = file ? URL.createObjectURL(file) : "https://via.placeholder.com/150"; // Default image if no file selected
    const ratingValue = parseFloat(productRating.value);
    const newProduct = {
        title: productName.value,
        category: productCategory.value,
        price: parseFloat(productPrice.value),
        rating: { rate: ratingValue }, // Store rating in an object
        image: imageUrl,
    };

    // console.log("Adding product with rating:", newProduct);
    try {
        const data = await apiCall("https://fakestoreapi.com/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newProduct),
        });
        console.log("Product added:", data);
        let res = data;
        res.rating = newProduct.rating;
        products.unshift(data);
        renderProducts();
        loader.style.display = "none";
        modal.style.display = "none";
    } catch (error) {
        console.log(`Error while adding product`, error);
    } finally {
        loader.style.display = "none";
    }
    // fetch("https://fakestoreapi.com/products", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(newProduct),
    // })
    //     .then((response) => response.json())
    //     .then((data) => {
    //         console.log("Product added:", data);
    //         let result = data;
    //         result.rating = newProduct.rating;

    //         products.unshift(data); // Add new product to the top
    //         renderProducts();
    //         modal.style.display = "none";
    //     })
    //     .catch((error) => console.error("Error adding product:", error))
    //     .finally(() => {
    //         loader.style.display = "none";
    //     });
}
// / Edit Product
async function editProduct(id) {
    const product = products.find((p) => p.id === id);
    modal.style.display = "flex";
    modalTitle.textContent = "Edit Product";
    productName.value = product.title;
    productCategory.value = product.category;
    productPrice.value = product.price;
    productRating.value = product.rating ? product.rating.rate : 0;
    productImage.value = "";
    submitProductBtn.textContent = "Update Product";

    submitProductBtn.onclick = async function (event) {
        event.preventDefault();
        // Validate form
        if (!validateProductForm()) {
            return;
        }

        const file = productImage.files[0];
        const imageUrl = file ? URL.createObjectURL(file) : product.image;

        const updatedRating = parseFloat(productRating.value);
        if (isNaN(updatedRating) || updatedRating < 1 || updatedRating > 5) {
            alert("Invalid rating value. Please enter a number between 1 and 5.");
            return;
        }

        product.rating = { rate: updatedRating };

        product.title = productName.value;
        product.category = productCategory.value;
        product.price = parseFloat(productPrice.value);
        product.image = imageUrl;

        const loader = document.getElementById("loader");
        loader.style.display = "flex";

        try {
            const data = await apiCall(`https://fakestoreapi.com/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(product),
            });
            console.log("Updated product data from API:", data);
            products = products.map((p) => (p.id === id ? { ...p, rating: product.rating } : p));

            renderProducts(); // Re-render the product list
            modal.style.display = "none"; // Close the modal
        } catch (error) {
            console.error("Error updating product:", error);
        } finally {
            loader.style.display = "none"; // Hide loader after completion
        }
    };
}

// Delete Product
async function deleteProduct(id) {
    // Show SweetAlert confirmation popup
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
    }).then(async (result) => {
        if (result.isConfirmed) {
            // If 'Yes' is clicked, delete the product
            try {
                const response = await fetch(`https://fakestoreapi.com/products/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete product.");
                }
                products = products.filter((p) => p.id !== id);
                renderProducts();
                Swal.fire("Deleted!", "The product has been deleted.", "success");
            } catch (error) {
                console.error("Error deleting product:", error);
                Swal.fire("Error!", "Failed to delete the product. Please try again.", "error");
            }
        } else {
            Swal.fire("Cancelled", "The product is safe :)", "info");
        }
    });
}

// Fetch initial product data
fetchData();
