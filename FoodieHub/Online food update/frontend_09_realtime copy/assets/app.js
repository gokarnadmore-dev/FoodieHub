/* ==========================================================
   FoodieHub — API connected layer
   ----------------------------------------------------------
   All data lives in the MongoDB backend and is accessed via
   REST API calls. This replaces the old localStorage layer.
   ========================================================== */

const API_BASE = "http://127.0.0.1:5000";


// Helper to get auth token
function getAuthToken() {
    return localStorage.getItem("fh_token") || null;
}

// Helper for standard fetch with JSON & Auth
async function apiFetch(endpoint, method = "GET", body = null, isFormData = false) {
    const headers = {};
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    const config = { method, headers };
    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    let res;
    try {
        res = await fetch(`${API_BASE}${endpoint}`, config);
    } catch (error) {
        throw new Error("Could not reach the backend. Make sure it is running on http://127.0.0.1:5000.");
    }
    const text = await res.text();

    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Server returned an invalid response. Please make sure the backend is running.");
        }
    }

    if (res.status === 401) {
        localStorage.removeItem("fh_token");
        throw new Error((data && data.message) || "Please login first");
    }

    if (!res.ok) throw new Error((data && data.message) || "API Error");
    return data;
}

/* ===================== USERS / AUTH ===================== */

async function getUsers() {
    // Only admins should really get all users, but assuming endpoint exists
    return await apiFetch("/api/users/all"); 
}

async function promoteUser(id) {
    return await apiFetch(`/api/users/promote/${id}`, "PUT");
}

async function deleteUser(id) {
    return await apiFetch(`/api/users/delete/${id}`, "DELETE");
}

async function registerUser({ name, email, password, contact }) {
    try {
        const data = await apiFetch("/auth/register", "POST", { name, email, password, contact });
        return { ok: true, user: data };
    } catch (err) {
        return { ok: false, message: err.message };
    }
}

async function loginUser(email, password) {
    try {
        const data = await apiFetch("/auth/login", "POST", { email, password });
        localStorage.setItem("fh_token", data.token);
        return { ok: true, user: data.user };
    } catch (err) {
        return { ok: false, message: err.message };
    }
}

function logoutUser() {
    localStorage.removeItem("fh_token");
    window.location.href = "login.html";
}

async function getProfile() {
    return await apiFetch("/api/users/profile");
}

async function updateProfile(data, isFormData = false) {
    return await apiFetch("/api/users/update", "PUT", data, isFormData);
}

function getSession() {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const payload = token.split(".")[1];
        const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return {
            id: claims.id,
            isAdmin: Boolean(claims.isAdmin)
        };
    } catch (e) {
        return null;
    }
}

function requireLogin() {
    const session = getSession();
    if (!session) {
        window.location.href = "login.html";
        return null;
    }
    return session;
}

function requireAdmin() {
    const session = getSession();
    if (!session || !session.isAdmin) {
        window.location.href = "adminlogin.html";
        return null;
    }
    return session;
}

/* ===================== PRODUCTS ===================== */

async function getProducts() {
    try {
        return await apiFetch("/api/menu");
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function addProduct(productData) {
    return await apiFetch("/api/menu/create", "POST", productData);
}

async function deleteProduct(id) {
    return await apiFetch(`/api/menu/delete/${id}`, "DELETE");
}

async function updateProduct(id, productData) {
    return await apiFetch(`/api/menu/update/${id}`, "PUT", productData);
}

/* ===================== CART ===================== */

async function getCart() {
    try {
        const session = getSession();
        if(!session) return [];
        const res = await apiFetch("/api/cart");
        return res.items || [];
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function addToCart(foodId, quantity = 1) {
    return await apiFetch("/api/cart/add", "POST", { foodId, quantity });
}

async function updateCartQty(foodId, quantity) {
    if (quantity <= 0) {
        return await apiFetch(`/api/cart/remove/${foodId}`, "DELETE");
    }
    return await apiFetch(`/api/cart/update/${foodId}`, "PUT", { quantity });
}

async function removeFromCart(foodId) {
    return await apiFetch(`/api/cart/remove/${foodId}`, "DELETE");
}

async function clearCart() {
    return await apiFetch("/api/cart/clear", "DELETE");
}

function cartTotal(cartItems) {
    return (cartItems || []).reduce((sum, i) => sum + (i.price * i.quantity), 0);
}

function cartCount(cartItems) {
    return (cartItems || []).reduce((sum, i) => sum + i.quantity, 0);
}

async function fhMountCartBadge() {
    const link = document.querySelector('a[href="cart.html"]');
    if (!link) return;
    let badge = link.querySelector(".fh-cart-badge");
    if (!badge) {
        badge = document.createElement("span");
        badge.className = "fh-cart-badge";
        badge.style.cssText = "display:inline-block;min-width:18px;padding:0 5px;margin-left:6px;" +
            "border-radius:10px;background:#fff;color:#ff5722;font-size:12px;font-weight:bold;text-align:center;line-height:18px;";
        link.appendChild(badge);
    }
    const cart = await getCart();
    const count = cartCount(cart);
    badge.textContent = count > 0 ? count : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
}

/* ===================== ORDERS ===================== */

async function getOrders() {
    try {
        return await apiFetch("/api/order/admin/all"); 
    } catch(err) {
        console.error(err);
        return [];
    }
}

async function placeOrder(customerData) {
    const orderData = {
        name:          customerData.name || "",
        phone:         customerData.phone || "",
        address:       customerData.address,
        city:          customerData.city || "",
        pincode:       customerData.pincode || "",
        paymentMethod: customerData.paymentMethod || "COD",
        paymentReference: customerData.paymentReference || ""
    };
    return await apiFetch("/api/order/create", "POST", orderData);
}

async function updateOrderStatus(orderId, status) {
    return await apiFetch(`/api/order/status/${orderId}`, "PUT", { status });
}

async function deleteOrder(orderId) {
    // Note: The backend route is actually "cancel"
    return await apiFetch(`/api/order/cancel/${orderId}`, "PUT");
}

async function getMyOrders() {
    try {
        return await apiFetch("/api/order/my-orders");
    } catch(err) {
        console.error(err);
        return [];
    }
}

async function getCateringPackages() {
    try {
        return await apiFetch("/api/catering/packages");
    } catch (err) {
        return [];
    }
}

async function addCateringRequest(requestData) {
    return await apiFetch("/api/catering/requests", "POST", requestData);
}

async function getMyCateringRequests() {
    try {
        return await apiFetch("/api/catering/myrequests");
    } catch (err) {
        return [];
    }
}

async function getCateringRequests() {
    try {
        return await apiFetch("/api/catering/requests"); // admin
    } catch (err) {
        return [];
    }
}

async function cancelCateringRequest(id) {
    return await apiFetch(`/api/catering/requests/cancel/${id}`, "PUT");
}

/* ===================== SUGGESTIONS ===================== */
async function getSuggestions() {
    try {
        return await apiFetch("/api/suggestions");
    } catch(err) {
        return [];
    }
}

async function addSuggestion(suggestionData) {
    return await apiFetch("/api/suggestions", "POST", suggestionData);
}

async function approveSuggestion(id) {
    return await apiFetch(`/api/suggestions/approve/${id}`, "PUT");
}

async function rejectSuggestion(id) {
    return await apiFetch(`/api/suggestions/reject/${id}`, "PUT");
}

async function getReviews() {
    try {
        return await apiFetch("/api/reviews");
    } catch (err) {
        return [];
    }
}

/* ===================== REAL-TIME (Socket.IO) ===================== */
/*
   Requires the socket.io client script to be loaded on the page BEFORE
   this file, e.g.:
     <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
     <script src="assets/app.js"></script>

   connectSocket() opens one shared connection per page, authenticated
   with the same JWT used for REST calls. The server puts the socket in
   a private "user_<id>" room (and "admins" too, if isAdmin), so events
   only reach the people who should see them.
*/
let fhSocket = null;

function connectSocket() {
    if (fhSocket) return fhSocket;
    if (typeof io === "undefined") {
        console.warn("Socket.IO client not loaded on this page.");
        return null;
    }

    fhSocket = io(API_BASE, {
        auth: { token: getAuthToken() },
        transports: ["websocket", "polling"]
    });

    return fhSocket;
}

const fhNextPages = {
    "index.html": "login.html",
    "login.html": "register.html",
    "register.html": "menu.html",
    "menu.html": "cart.html",
    "cart.html": "checkout.html",
    "checkout.html": "history.html",
    "history.html": "feedback.html",
    "feedback.html": "profile.html",
    "profile.html": "logout.html",
    "logout.html": "login.html",
    "adminlogin.html": "admindashbord.html",
    "admindashbord.html": "admindashbordcatering.html",
    "admindashbordcatering.html": "adminfeedback.html",
    "adminfeedback.html": "users.html",
    "users.html": "products.html",
    "products.html": "adminlogin.html",
    "about.html": "login.html",
    "catering.html": "suggest item.html",
    "suggest item.html": "cart.html",
    "orders.html": "admindashbord.html"
};

function fhEnableEnterNavigation() {
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" || event.defaultPrevented) return;

        const target = event.target;
        const tagName = target?.tagName?.toLowerCase();

        // Let forms and controls keep their normal Enter behavior.
        if (["input", "textarea", "select", "button"].includes(tagName)) return;

        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        const nextPage = fhNextPages[currentPage];
        if (!nextPage) return;

        event.preventDefault();
        window.location.href = nextPage;
    });
}

function fhEnableLoginFieldNavigation() {
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");

    if (!emailField || !passwordField) return;

    emailField.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        passwordField.focus();
    });

    passwordField.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        const loginButton = document.querySelector("button[onclick=\"login()\"]");
        if (loginButton) loginButton.click();
    });
}

/* ===================== INIT ===================== */
window.addEventListener("DOMContentLoaded", () => {
    fhMountCartBadge();
    fhEnableEnterNavigation();
    fhEnableLoginFieldNavigation();
});
