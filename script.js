// === DARK MODE TOGGLE ===
const toggleButtons = document.querySelectorAll(".darkModeToggle");
const currentMode = localStorage.getItem("darkMode");

function setDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
        toggleButtons.forEach(btn => btn.textContent = "☀️");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "disabled");
        toggleButtons.forEach(btn => btn.textContent = "🌙");
    }
}
setDarkMode(currentMode === "enabled");
toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark-mode");
        setDarkMode(!isDark);
    });
});

// === PRODUCT DATA ===
const products = [
    { id: 1, name: "Smartphone", price: 25000, category: "electronics", img: "images/redmi.png" },
    { id: 2, name: "Laptop", price: 70000, category: "electronics", img: "images/hp-laptop.jpg" },
    { id: 9, name: "Wireless Earbuds", price: 3500, category: "electronics", img: "images/earbuds.jpg" },
    { id: 10, name: "Smartwatch", price: 5500, category: "electronics", img: "images/smartwatch.jpg" },
    { id: 3, name: "T-Shirt", price: 1200, category: "clothing", img: "images/tshirt.jpeg" },
    { id: 4, name: "Jeans", price: 2500, category: "clothing", img: "images/mens-jeans.jpg" },
    { id: 11, name: "Shorts", price: 3200, category: "clothing", img: "images/shorts.jpg" },
    { id: 12, name: "Sneakers", price: 4800, category: "clothing", img: "images/sneakers.jpg" },
    { id: 5, name: "Toy Car", price: 800, category: "toys", img: "images/toy-car.jpg" },
    { id: 6, name: "Stuffed Animal", price: 1500, category: "toys", img: "images/stuffed-animal.jpg" },
    { id: 13, name: "Lego Set", price: 2200, category: "toys", img: "images/lego-set.jpg" },
    { id: 14, name: "Remote Control Drone", price: 6700, category: "toys", img: "images/drone.jpg" },
    { id: 7, name: "Gaming Mouse", price: 3000, category: "gaming", img: "images/mouse.jpg" },
    { id: 8, name: "Gaming Keyboard", price: 4500, category: "gaming", img: "images/keyboard.jpg" },
    { id: 15, name: "Gaming Chair", price: 15000, category: "gaming", img: "images/gaming-chair.jpg" },
    { id: 16, name: "PS5 Controller", price: 8500, category: "gaming", img: "images/ps5-controller.jpeg" },
    { id: 101, name: "Samsung S20 Ultra", price: 90999, category: "electronics", img: "images/samsung.jpg" },
    { id: 102, name: "Men's Kurta", price: 3999, category: "clothing", img: "images/mens-kurta.jpg" },
    { id: 103, name: "Gaming Mouse RGB", price: 2199, category: "gaming", img: "images/gaming-mouse-rgb.png" },
];

// === CART STORAGE PER USER ===
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("tezbuy_user")) || JSON.parse(sessionStorage.getItem("tezbuy_user"));
}

function getCartKey() {
    const user = getCurrentUser();
    return user ? `cart_${user.email}` : "cart_guest";
}

let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];

function saveCart() {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach(el => el.textContent = count);
}

function addToCart(productId) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartCount();

    const toast = document.getElementById("addCartToast");
    if (toast) {
        toast.textContent = `✅ ${product.name} added to cart`;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2500);
    }
}

// === PRODUCT DISPLAY ===
let currentPage = 1;
const itemsPerPage = 8;
let currentCategory = "all";

function filterProducts(category = "all", resetPage = true) {
    const list = document.getElementById("product-list");
    const search = document.getElementById("search-input")?.value.toLowerCase() || "";
    const maxPrice = parseInt(document.getElementById("priceRange")?.value) || 100000;

    if (!list) return;
    if (resetPage) currentPage = 1;
    currentCategory = category;

    const filtered = products.filter(p =>
        (category === "all" || p.category === category) &&
        p.name.toLowerCase().includes(search) &&
        p.price <= maxPrice
    );

    list.innerHTML = "";
    filtered.slice(0, currentPage * itemsPerPage).forEach(p => {
        list.innerHTML += `
        <div class="col-6 col-sm-6 col-md-4 col-lg-3">
          <div class="card product-card text-white h-100 shadow-sm" onclick="viewDetails(${p.id})" style="cursor:pointer">
            <div class="ratio ratio-1x1">
              <img src="${p.img}" class="card-img-top object-fit-cover" alt="${p.name}">
            </div>
            <div class="card-body d-flex flex-column">
              <h6 class="card-title">${p.name}</h6>
              <p class="mb-1"><strong>Rs.</strong> ${p.price.toLocaleString()}</p>
              <button class="btn btn-custom btn-sm mt-auto" onclick="event.stopPropagation(); addToCart(${p.id})">
                Add to Cart
              </button>
            </div>
          </div>
        </div>`;
    });

    const seeMoreBtn = document.getElementById("seeMoreBtn");
    if (seeMoreBtn)
        seeMoreBtn.style.display = filtered.length > currentPage * itemsPerPage ? "inline-block" : "none";
}

// === VIEW PRODUCT DETAILS ===
function viewDetails(id) {
    localStorage.setItem("selectedProductId", id);
    window.location.href = "product-details.html";
}

// === CART PAGE ===
function displayCartItems() {
    const container = document.getElementById("cart-items");
    const totalContainer = document.getElementById("cart-total");
    if (!container || !totalContainer) return;

    if (cart.length === 0) {
        container.innerHTML = "<p class='text-muted text-center'>Your cart is empty.</p>";
        totalContainer.textContent = "0";
        return;
    }

    container.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        container.innerHTML += `
        <div class="card mb-3 shadow-sm">
          <div class="card-body d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
              <img src="${item.img}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
              <div>
                <h6 class="mb-1">${item.name}</h6>
                <p class="mb-0 text-muted">Rs. ${item.price} x ${item.quantity}</p>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-success" onclick="changeQuantity(${item.id}, -1)">−</button>
              <span class="px-2">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-success" onclick="changeQuantity(${item.id}, 1)">+</button>
              <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
          </div>
        </div>`;
    });

    totalContainer.textContent = total.toLocaleString();
}

function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);

    saveCart();
    updateCartCount();
    displayCartItems();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartCount();
    displayCartItems();
}

// === ORDER SUMMARY ===
function showOrderSummary() {
    const container = document.getElementById("order-summary");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-muted">Your cart is empty.</p>`;
        return;
    }

    let total = 0;
    let html = '<ul class="list-group mb-3">';
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
          <div class="d-flex align-items-center gap-3">
            <img src="${item.img}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div>
              <strong>${item.name}</strong><br>
              <small class="text-muted">Qty: ${item.quantity} × Rs. ${item.price}</small>
            </div>
          </div>
          <strong class="text-success">Rs. ${subtotal.toLocaleString()}</strong>
        </li>`;
    });

    html += `
      <li class="list-group-item d-flex justify-content-between">
        <strong>Total</strong>
        <strong class="text-success">Rs. ${total.toLocaleString()}</strong>
      </li>
    </ul>`;
    container.innerHTML = html;
}

// === INIT ON LOAD ===
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    if (document.getElementById("order-summary")) showOrderSummary();
    if (document.getElementById("cart-items")) displayCartItems();
    if (document.getElementById("product-list")) {
        const urlParams = new URLSearchParams(window.location.search);
        const initialCategory = urlParams.get("category") || "all";
        filterProducts(initialCategory);
        document.querySelectorAll(".filter-btn").forEach(btn => {
            const btnCat = btn.dataset.category;
            if (btnCat === initialCategory) btn.classList.add("active");
            btn.addEventListener("click", () => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                filterProducts(btnCat);
            });
        });
        document.getElementById("search-input")?.addEventListener("input", () => filterProducts(currentCategory));
        document.getElementById("priceRange")?.addEventListener("input", (e) => {
            document.getElementById("priceRangeValue").textContent = e.target.value;
            filterProducts(currentCategory);
        });
        document.getElementById("seeMoreBtn")?.addEventListener("click", () => {
            currentPage++;
            filterProducts(currentCategory, false);
        });
    }
});

// === NAVBAR AUTH DROPDOWN (desktop + mobile) ===
document.addEventListener("DOMContentLoaded", () => {
    const desktopLink = document.querySelector("#authLink a");
    const mobileLink = document.querySelector("#authLinkMobile a");
    const user = getCurrentUser();

    if (user) {
        [desktopLink, mobileLink].forEach(link => {
            if (link) {
                link.textContent = `(${user.name})`;
                link.href = "#";
                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    document.getElementById("logoutToast").style.display = "block";
                });
            }
        });

        // Handle Toast Buttons
        const confirmBtn = document.getElementById("confirmLogoutBtn");
        const cancelBtn = document.getElementById("cancelLogoutBtn");

        confirmBtn.addEventListener("click", () => {
            localStorage.removeItem("tezbuy_user");
            sessionStorage.removeItem("tezbuy_user");
            localStorage.removeItem(getCartKey());
            window.location.href = "index.html";
        });

        cancelBtn.addEventListener("click", () => {
            document.getElementById("logoutToast").style.display = "none";
        });
    }
});

