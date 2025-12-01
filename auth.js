/**
 * Sistema de Autenticación GearSteed
 * Manejo de login, registro, sesión y carrito de compras
 */

// Configuración de la API
const API_URL = 'http://localhost:3000/api'; // Cambiar por tu URL de producción
const TOKEN_KEY = 'gearsteed_token';
const USER_KEY = 'gearsteed_user';
const CART_KEY = 'gearsteed_cart';
const SESSION_ID_KEY = 'gearsteed_session_id';

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Generar ID de sesión único para usuarios invitados
 */
function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Obtener o crear ID de sesión
 */
function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
}

/**
 * Iniciar sesión
 */
async function login(email, password, remember = false) {
    try {
        // Simulación de API (REEMPLAZAR CON LLAMADA REAL)
        // const response = await fetch(`${API_URL}/auth/login`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email, password, remember })
        // });
        // const data = await response.json();

        // SIMULACIÓN TEMPORAL (quitar cuando tengas backend)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
        
        // Simular respuesta exitosa
        const data = {
            success: true,
            token: 'fake_jwt_token_' + Date.now(),
            user: {
                id: 1,
                nombre: 'Juan',
                apellido: 'Pérez',
                email: email,
                telefono: '9671234567',
                tipo_usuario: 'cliente',
                avatar: null
            }
        };

        if (data.success) {
            // Guardar token y datos del usuario
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem(TOKEN_KEY, data.token);
            storage.setItem(USER_KEY, JSON.stringify(data.user));

            // Transferir carrito de sesión a usuario
            await transferCartToUser(data.user.id);

            // Emitir evento de login
            window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

            return { success: true, user: data.user };
        }

        return { success: false, message: data.message };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, message: 'Error de conexión' };
    }
}

/**
 * Registrar nuevo usuario
 */
async function register(userData) {
    try {
        // Simulación de API (REEMPLAZAR CON LLAMADA REAL)
        // const response = await fetch(`${API_URL}/auth/register`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(userData)
        // });
        // const data = await response.json();

        // SIMULACIÓN TEMPORAL
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const data = {
            success: true,
            message: 'Usuario registrado exitosamente',
            user: {
                id: Date.now(),
                ...userData,
                tipo_usuario: 'cliente',
                avatar: null
            }
        };

        if (data.success) {
            // Opcionalmente auto-login después del registro
            // await login(userData.email, userData.password, true);
            return { success: true, user: data.user };
        }

        return { success: false, message: data.message };
    } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, message: 'Error de conexión' };
    }
}

/**
 * Cerrar sesión
 */
function logout() {
    // Eliminar token y datos de usuario
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);

    // Mantener el carrito pero asociarlo a nueva sesión
    const sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);

    // Emitir evento de logout
    window.dispatchEvent(new CustomEvent('userLoggedOut'));

    // Redirigir a inicio
    window.location.href = 'index.html';
}

/**
 * Obtener usuario actual
 */
function getCurrentUser() {
    const userDataLocal = localStorage.getItem(USER_KEY);
    const userDataSession = sessionStorage.getItem(USER_KEY);
    
    const userData = userDataLocal || userDataSession;
    
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }
    return null;
}

/**
 * Verificar si el usuario está autenticado
 */
function isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    return !!token;
}

/**
 * Obtener token de autenticación
 */
function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

// ============================================
// FUNCIONES DEL CARRITO
// ============================================

/**
 * Obtener carrito actual
 */
function getCart() {
    const cartData = localStorage.getItem(CART_KEY);
    if (cartData) {
        try {
            return JSON.parse(cartData);
        } catch (e) {
            return [];
        }
    }
    return [];
}

/**
 * Guardar carrito
 */
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
}

/**
 * Agregar producto al carrito
 */
function addToCart(product) {
    const cart = getCart();
    
    // Normalizar el producto (aceptar tanto inglés como español)
    const normalizedProduct = {
        id: product.id,
        name: product.name || product.nombre,
        price: parseFloat(product.price || product.precio),
        image: product.image || product.imagen || 'img/placeholder.jpg',
        quantity: parseInt(product.quantity || product.cantidad || 1),
        sku: product.sku || ''
    };
    
    // Verificar si el producto ya existe
    const existingIndex = cart.findIndex(item => item.id === normalizedProduct.id);
    
    if (existingIndex > -1) {
        // Incrementar cantidad
        cart[existingIndex].quantity += normalizedProduct.quantity;
    } else {
        // Agregar nuevo producto con timestamp
        cart.push({
            ...normalizedProduct,
            agregado_en: new Date().toISOString()
        });
    }
    
    saveCart(cart);
    
    // Mostrar notificación
    showCartNotification(`✓ ${normalizedProduct.name} agregado al carrito`);
    
    return cart;
}

/**
 * Actualizar cantidad de producto en carrito
 */
function updateCartQuantity(indexOrId, cantidad) {
    const cart = getCart();
    
    // Si es un número, es un índice directo
    if (typeof indexOrId === 'number') {
        if (cart[indexOrId]) {
            if (cantidad <= 0) {
                cart.splice(indexOrId, 1);
            } else {
                cart[indexOrId].quantity = parseInt(cantidad);
            }
            saveCart(cart);
        }
    } else {
        // Si es string, buscar por ID
        const index = cart.findIndex(item => item.id === indexOrId);
        if (index > -1) {
            if (cantidad <= 0) {
                cart.splice(index, 1);
            } else {
                cart[index].quantity = parseInt(cantidad);
            }
            saveCart(cart);
        }
    }
}

/**
 * Eliminar producto del carrito
 */
/**
 * Eliminar producto del carrito
 */
function removeFromCart(indexOrId) {
    let cart = getCart();
    
    // Si es un número, es un índice directo
    if (typeof indexOrId === 'number') {
        cart.splice(indexOrId, 1);
    } else {
        // Si es string, filtrar por ID
        cart = cart.filter(item => item.id !== indexOrId);
    }
    
    saveCart(cart);
    updateCartUI();
}

/**
 * Vaciar carrito
 */
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartUI();
}

/**
 * Obtener total del carrito
 */
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price || item.precio || 0);
        const quantity = parseInt(item.quantity || item.cantidad || 0);
        return total + (price * quantity);
    }, 0);
}

/**
 * Obtener cantidad total de productos
 */
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const quantity = parseInt(item.quantity || item.cantidad || 0);
        return total + quantity;
    }, 0);
}

/**
 * Transferir carrito de sesión a usuario logueado
 */
async function transferCartToUser(userId) {
    const cart = getCart();
    
    if (cart.length === 0) return;
    
    try {
        // Enviar carrito al servidor para asociarlo al usuario
        // const response = await fetch(`${API_URL}/carrito/transferir`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${getToken()}`
        //     },
        //     body: JSON.stringify({ cart, userId })
        // });
        
        // Simulación
        console.log('Carrito transferido a usuario:', userId, cart);
    } catch (error) {
        console.error('Error al transferir carrito:', error);
    }
}

/**
 * Actualizar UI del carrito en header
 */
function updateCartUI() {
    const cartCount = getCartItemCount();
    const cartBadges = document.querySelectorAll('.cart-count');
    
    cartBadges.forEach(badge => {
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? 'flex' : 'none';
    });
}

/**
 * Mostrar notificación de carrito
 */
function showCartNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// ACTUALIZACIÓN DE UI DE USUARIO
// ============================================

/**
 * Actualizar interfaz de usuario en el header
 */
function updateUserUI() {
    const user = getCurrentUser();
    const userButtons = document.querySelectorAll('.user-auth-section');
    
    userButtons.forEach(section => {
        if (user) {
            // Usuario logueado
            section.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-btn" onclick="toggleUserMenu()">
                        <i class="fas fa-user-circle"></i>
                        <span class="user-name">${user.nombre}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <a href="mi-cuenta.html" class="dropdown-item">
                            <i class="fas fa-user"></i>
                            <span>Mi Cuenta</span>
                        </a>
                        <a href="mis-ordenes.html" class="dropdown-item">
                            <i class="fas fa-shopping-bag"></i>
                            <span>Mis Órdenes</span>
                        </a>
                        <a href="mis-citas.html" class="dropdown-item">
                            <i class="fas fa-calendar"></i>
                            <span>Mis Citas</span>
                        </a>
                        <hr>
                        <button onclick="logout()" class="dropdown-item logout-btn">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Usuario no logueado
            section.innerHTML = `
                <a href="login.html" class="login-btn" title="Iniciar Sesión">
                    <i class="fas fa-user"></i>
                    <span>Ingresar</span>
                </a>
            `;
        }
    });
}

/**
 * Toggle del menú de usuario
 */
function toggleUserMenu() {
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
    const userDropdown = document.querySelector('.user-dropdown');
    const menu = document.getElementById('userDropdownMenu');
    
    if (menu && userDropdown && !userDropdown.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializar sistema de autenticación
 */
function initAuth() {
    // Actualizar UI de usuario
    updateUserUI();
    
    // Actualizar UI de carrito
    updateCartUI();
    
    // Obtener o crear sesión
    getSessionId();
}

// Ejecutar al cargar la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

// Escuchar eventos de login/logout
window.addEventListener('userLoggedIn', updateUserUI);
window.addEventListener('userLoggedOut', updateUserUI);

// ============================================
// PROTECCIÓN DE RUTAS
// ============================================

/**
 * Redirigir a login si no está autenticado
 */
function requireAuth() {
    if (!isAuthenticated()) {
        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${currentUrl}`;
        return false;
    }
    return true;
}

/**
 * Verificar si es administrador
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.tipo_usuario === 'administrador';
}

// Exportar funciones globalmente
if (typeof window !== 'undefined') {
    window.login = login;
    window.register = register;
    window.logout = logout;
    window.getCurrentUser = getCurrentUser;
    window.isAuthenticated = isAuthenticated;
    window.getToken = getToken;
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateCartQuantity = updateCartQuantity;
    window.clearCart = clearCart;
    window.getCart = getCart;
    window.getCartTotal = getCartTotal;
    window.getCartItemCount = getCartItemCount;
    window.requireAuth = requireAuth;
    window.isAdmin = isAdmin;
    window.toggleUserMenu = toggleUserMenu;
}
