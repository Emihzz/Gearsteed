# 🛒 Guía de Implementación - E-Commerce GearSteed

## 📋 Resumen del Sistema

Has creado un **sistema completo de e-commerce** para refacciones con:

✅ **Carrito de compras** funcional  
✅ **Sistema de órdenes** con estados y tracking  
✅ **Gestión de usuarios** con login/registro  
✅ **Catálogo de refacciones** con categorías, marcas, stock  
✅ **Sistema de citas** para servicios  
✅ **Exhibición de vehículos** (solo para ver, NO comprar online)  
✅ **Cupones y promociones**  
✅ **Reseñas de productos**  

---

## 🗂️ Estructura de la Base de Datos

### **8 Módulos Principales:**

```
1. 👤 USUARIOS Y AUTENTICACIÓN
   ├── usuarios
   └── sesiones

2. 🔧 CATÁLOGO DE REFACCIONES
   ├── categorias_refacciones
   ├── marcas
   ├── refacciones
   ├── refacciones_imagenes
   └── resenas

3. 🛒 CARRITO DE COMPRAS
   ├── carrito
   └── lista_deseos

4. 📦 ÓRDENES Y VENTAS
   ├── ordenes
   ├── ordenes_detalle
   └── ordenes_historial

5. 📅 CITAS Y SERVICIOS
   └── citas

6. 🚗 VEHÍCULOS (Solo exhibición)
   ├── vehiculos
   └── vehiculos_consultas

7. 🎟️ CUPONES Y PROMOCIONES
   ├── cupones
   └── cupones_uso

8. ⚙️ OTROS
   ├── contactos
   └── configuracion
```

---

## 🚀 Instalación de la Base de Datos

### **Paso 1: Crear la Base de Datos**

```bash
# Opción A: Desde terminal
mysql -u root -p < database_ecommerce.sql

# Opción B: Desde phpMyAdmin
# - Crear base de datos "gearsteed"
# - Importar archivo database_ecommerce.sql

# Opción C: Desde MySQL Workbench
# - File → Run SQL Script
# - Seleccionar database_ecommerce.sql
```

### **Paso 2: Verificar la Instalación**

```sql
USE gearsteed;
SHOW TABLES;

-- Deberías ver 25+ tablas
-- Verificar datos iniciales:
SELECT * FROM categorias_refacciones;
SELECT * FROM marcas;
SELECT * FROM configuracion;
```

---

## 🏗️ Arquitectura del Sistema

### **Frontend (HTML/CSS/JS)**

```
├── index.html              → Página principal
├── vehiculos.html          → Exhibición de vehículos
├── refacciones.html        → Catálogo de refacciones (NUEVO)
├── producto.html           → Detalle de refacción (NUEVO)
├── carrito.html            → Carrito de compras (NUEVO)
├── checkout.html           → Proceso de compra (NUEVO)
├── citas.html              → Agendar citas (NUEVO)
├── login.html              → Login/Registro (NUEVO)
├── mi-cuenta.html          → Panel de usuario (NUEVO)
├── contactanos.html        → Formulario de contacto (YA EXISTE)
├── script.js               → Lógica del sitio
└── styles.css              → Estilos globales
```

### **Backend (Node.js + Express)**

```javascript
// Estructura sugerida
server/
├── config/
│   ├── database.js         → Conexión MySQL
│   └── config.js           → Variables de entorno
├── models/
│   ├── Usuario.js
│   ├── Refaccion.js
│   ├── Carrito.js
│   ├── Orden.js
│   ├── Cita.js
│   └── Vehiculo.js
├── controllers/
│   ├── authController.js   → Login, registro, JWT
│   ├── refaccionesController.js
│   ├── carritoController.js
│   ├── ordenesController.js
│   ├── citasController.js
│   └── vehiculosController.js
├── routes/
│   ├── auth.js
│   ├── refacciones.js
│   ├── carrito.js
│   ├── ordenes.js
│   ├── citas.js
│   └── vehiculos.js
├── middleware/
│   ├── auth.js             → Verificar JWT
│   └── validation.js       → Validar datos
├── utils/
│   ├── email.js            → Enviar emails
│   └── payment.js          → Integración pagos
└── server.js               → Punto de entrada
```

---

## 📝 Endpoints de API Sugeridos

### **🔐 Autenticación**

```javascript
POST   /api/auth/register          // Registrar usuario
POST   /api/auth/login             // Login
POST   /api/auth/logout            // Logout
POST   /api/auth/forgot-password   // Recuperar contraseña
GET    /api/auth/verify-email/:token  // Verificar email
GET    /api/auth/me                // Datos del usuario actual
```

### **🔧 Refacciones (Productos)**

```javascript
GET    /api/refacciones            // Listar refacciones (con filtros)
GET    /api/refacciones/:id        // Detalle de refacción
GET    /api/refacciones/slug/:slug // Detalle por slug
GET    /api/refacciones/buscar     // Búsqueda full-text
GET    /api/refacciones/destacadas // Productos destacados
GET    /api/refacciones/ofertas    // Productos en oferta
POST   /api/refacciones/:id/resena // Agregar reseña
GET    /api/refacciones/:id/resenas// Listar reseñas

// Filtros: ?categoria=motor&marca=bosch&precio_min=100&precio_max=500
```

### **🛒 Carrito de Compras**

```javascript
GET    /api/carrito                // Ver carrito actual
POST   /api/carrito/agregar        // Agregar producto
PUT    /api/carrito/:id/cantidad   // Actualizar cantidad
DELETE /api/carrito/:id            // Eliminar del carrito
DELETE /api/carrito                // Vaciar carrito
POST   /api/carrito/transferir     // Transferir carrito de sesión a usuario
```

### **📦 Órdenes**

```javascript
GET    /api/ordenes                // Listar órdenes del usuario
GET    /api/ordenes/:id            // Detalle de orden
POST   /api/ordenes/crear          // Crear orden desde carrito
POST   /api/ordenes/:id/confirmar-pago  // Confirmar pago
GET    /api/ordenes/:id/recibo     // Generar recibo PDF
POST   /api/ordenes/:id/cancelar   // Cancelar orden
```

### **📅 Citas**

```javascript
GET    /api/citas                  // Listar citas del usuario
GET    /api/citas/:id              // Detalle de cita
POST   /api/citas/crear            // Agendar cita
GET    /api/citas/disponibilidad   // Horarios disponibles
PUT    /api/citas/:id/cancelar     // Cancelar cita
```

### **🚗 Vehículos (Solo exhibición)**

```javascript
GET    /api/vehiculos              // Listar vehículos
GET    /api/vehiculos/:id          // Detalle de vehículo
GET    /api/vehiculos/slug/:slug   // Detalle por slug
POST   /api/vehiculos/:id/consulta // Solicitar información
POST   /api/vehiculos/:id/prueba-manejo  // Agendar prueba
```

### **🎟️ Cupones**

```javascript
POST   /api/cupones/validar        // Validar cupón
GET    /api/cupones/activos        // Cupones disponibles
```

### **👤 Usuario / Mi Cuenta**

```javascript
GET    /api/usuario/perfil         // Ver perfil
PUT    /api/usuario/perfil         // Actualizar perfil
GET    /api/usuario/ordenes        // Historial de órdenes
GET    /api/usuario/citas          // Historial de citas
GET    /api/usuario/lista-deseos   // Lista de deseos
POST   /api/usuario/lista-deseos   // Agregar a lista
DELETE /api/usuario/lista-deseos/:id  // Quitar de lista
```

---

## 💻 Ejemplo de Implementación Backend

### **1. Configuración de Base de Datos**

```javascript
// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'gearsteed',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
```

### **2. Modelo de Refacción**

```javascript
// models/Refaccion.js
const db = require('../config/database');

class Refaccion {
    // Listar refacciones con filtros
    static async listar(filtros = {}) {
        let query = `
            SELECT 
                r.*,
                c.nombre AS categoria_nombre,
                m.nombre AS marca_nombre
            FROM refacciones r
            LEFT JOIN categorias_refacciones c ON r.categoria_id = c.id
            LEFT JOIN marcas m ON r.marca_id = m.id
            WHERE r.estado = 'activo'
        `;
        
        const params = [];
        
        if (filtros.categoria) {
            query += ' AND c.slug = ?';
            params.push(filtros.categoria);
        }
        
        if (filtros.marca) {
            query += ' AND m.slug = ?';
            params.push(filtros.marca);
        }
        
        if (filtros.precio_min) {
            query += ' AND r.precio >= ?';
            params.push(filtros.precio_min);
        }
        
        if (filtros.precio_max) {
            query += ' AND r.precio <= ?';
            params.push(filtros.precio_max);
        }
        
        if (filtros.busqueda) {
            query += ' AND MATCH(r.nombre, r.descripcion_corta, r.palabras_clave) AGAINST(? IN NATURAL LANGUAGE MODE)';
            params.push(filtros.busqueda);
        }
        
        query += ' ORDER BY r.destacado DESC, r.ventas_totales DESC';
        query += ' LIMIT ? OFFSET ?';
        params.push(filtros.limit || 20, filtros.offset || 0);
        
        const [rows] = await db.execute(query, params);
        return rows;
    }
    
    // Obtener por ID
    static async obtenerPorId(id) {
        const [rows] = await db.execute(`
            SELECT 
                r.*,
                c.nombre AS categoria_nombre,
                c.slug AS categoria_slug,
                m.nombre AS marca_nombre,
                m.slug AS marca_slug
            FROM refacciones r
            LEFT JOIN categorias_refacciones c ON r.categoria_id = c.id
            LEFT JOIN marcas m ON r.marca_id = m.id
            WHERE r.id = ? AND r.estado = 'activo'
        `, [id]);
        
        if (rows.length === 0) return null;
        
        // Incrementar vistas
        await db.execute('UPDATE refacciones SET vistas = vistas + 1 WHERE id = ?', [id]);
        
        return rows[0];
    }
    
    // Verificar stock disponible
    static async verificarStock(id, cantidad) {
        const [rows] = await db.execute(
            'SELECT stock FROM refacciones WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) return false;
        return rows[0].stock >= cantidad;
    }
}

module.exports = Refaccion;
```

### **3. Controlador de Carrito**

```javascript
// controllers/carritoController.js
const db = require('../config/database');

exports.obtenerCarrito = async (req, res) => {
    try {
        const usuarioId = req.user ? req.user.id : null;
        const sessionId = req.session.id;
        
        const [items] = await db.execute(`
            SELECT 
                c.*,
                r.nombre,
                r.slug,
                r.imagen_principal,
                r.stock,
                r.precio AS precio_actual
            FROM carrito c
            INNER JOIN refacciones r ON c.refaccion_id = r.id
            WHERE ${usuarioId ? 'c.usuario_id = ?' : 'c.session_id = ?'}
        `, [usuarioId || sessionId]);
        
        const subtotal = items.reduce((sum, item) => 
            sum + (item.precio_unitario * item.cantidad), 0
        );
        
        res.json({
            success: true,
            items,
            subtotal,
            total_items: items.length
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error al obtener carrito' });
    }
};

exports.agregarAlCarrito = async (req, res) => {
    try {
        const { refaccion_id, cantidad = 1 } = req.body;
        const usuarioId = req.user ? req.user.id : null;
        const sessionId = req.session.id;
        
        // Verificar stock
        const [refaccion] = await db.execute(
            'SELECT precio, stock FROM refacciones WHERE id = ? AND estado = "activo"',
            [refaccion_id]
        );
        
        if (refaccion.length === 0) {
            return res.status(404).json({ success: false, error: 'Producto no encontrado' });
        }
        
        if (refaccion[0].stock < cantidad) {
            return res.status(400).json({ success: false, error: 'Stock insuficiente' });
        }
        
        // Verificar si ya existe en el carrito
        const [existe] = await db.execute(`
            SELECT id, cantidad FROM carrito 
            WHERE ${usuarioId ? 'usuario_id' : 'session_id'} = ? AND refaccion_id = ?
        `, [usuarioId || sessionId, refaccion_id]);
        
        if (existe.length > 0) {
            // Actualizar cantidad
            await db.execute(
                'UPDATE carrito SET cantidad = cantidad + ? WHERE id = ?',
                [cantidad, existe[0].id]
            );
        } else {
            // Insertar nuevo
            await db.execute(`
                INSERT INTO carrito (${usuarioId ? 'usuario_id' : 'session_id'}, refaccion_id, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            `, [usuarioId || sessionId, refaccion_id, cantidad, refaccion[0].precio]);
        }
        
        res.json({ success: true, message: 'Producto agregado al carrito' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error al agregar al carrito' });
    }
};

exports.actualizarCantidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;
        
        if (cantidad <= 0) {
            return res.status(400).json({ success: false, error: 'Cantidad inválida' });
        }
        
        // Verificar stock
        const [item] = await db.execute(`
            SELECT c.refaccion_id, r.stock
            FROM carrito c
            INNER JOIN refacciones r ON c.refaccion_id = r.id
            WHERE c.id = ?
        `, [id]);
        
        if (item.length === 0) {
            return res.status(404).json({ success: false, error: 'Item no encontrado' });
        }
        
        if (item[0].stock < cantidad) {
            return res.status(400).json({ 
                success: false, 
                error: 'Stock insuficiente',
                stock_disponible: item[0].stock
            });
        }
        
        await db.execute('UPDATE carrito SET cantidad = ? WHERE id = ?', [cantidad, id]);
        
        res.json({ success: true, message: 'Cantidad actualizada' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar cantidad' });
    }
};

exports.eliminarDelCarrito = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM carrito WHERE id = ?', [id]);
        res.json({ success: true, message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar del carrito' });
    }
};
```

### **4. Controlador de Órdenes**

```javascript
// controllers/ordenesController.js
const db = require('../config/database');

exports.crearOrden = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const usuarioId = req.user.id;
        const {
            envio_nombre,
            envio_telefono,
            envio_calle,
            envio_ciudad,
            envio_estado,
            envio_codigo_postal,
            metodo_pago,
            cupon_codigo
        } = req.body;
        
        // Obtener items del carrito
        const [items] = await connection.execute(`
            SELECT c.*, r.nombre, r.stock
            FROM carrito c
            INNER JOIN refacciones r ON c.refaccion_id = r.id
            WHERE c.usuario_id = ?
        `, [usuarioId]);
        
        if (items.length === 0) {
            throw new Error('El carrito está vacío');
        }
        
        // Verificar stock de todos los productos
        for (const item of items) {
            if (item.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para ${item.nombre}`);
            }
        }
        
        // Calcular totales
        const subtotal = items.reduce((sum, item) => 
            sum + (item.precio_unitario * item.cantidad), 0
        );
        
        let descuento = 0;
        // Validar cupón si existe
        if (cupon_codigo) {
            const [cupon] = await connection.execute(`
                SELECT * FROM cupones 
                WHERE codigo = ? AND activo = TRUE 
                AND fecha_inicio <= NOW() AND fecha_fin >= NOW()
            `, [cupon_codigo]);
            
            if (cupon.length > 0) {
                // Calcular descuento según tipo
                if (cupon[0].tipo === 'porcentaje') {
                    descuento = subtotal * (cupon[0].valor / 100);
                } else if (cupon[0].tipo === 'monto_fijo') {
                    descuento = cupon[0].valor;
                }
                
                // Aplicar límite si existe
                if (cupon[0].descuento_maximo && descuento > cupon[0].descuento_maximo) {
                    descuento = cupon[0].descuento_maximo;
                }
            }
        }
        
        const envio = subtotal >= 1000 ? 0 : 150; // Envío gratis desde $1000
        const impuestos = (subtotal - descuento + envio) * 0.16; // IVA 16%
        const total = subtotal - descuento + envio + impuestos;
        
        // Crear la orden
        const [resultOrden] = await connection.execute(`
            INSERT INTO ordenes (
                usuario_id, estado, estado_pago,
                subtotal, descuento, envio, impuestos, total,
                metodo_pago, cupon_codigo, cupon_descuento,
                envio_nombre, envio_telefono, envio_calle,
                envio_ciudad, envio_estado, envio_codigo_postal,
                ip_address, user_agent
            ) VALUES (?, 'pendiente', 'pendiente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            usuarioId, subtotal, descuento, envio, impuestos, total,
            metodo_pago, cupon_codigo || null, descuento,
            envio_nombre, envio_telefono, envio_calle,
            envio_ciudad, envio_estado, envio_codigo_postal,
            req.ip, req.get('user-agent')
        ]);
        
        const ordenId = resultOrden.insertId;
        
        // Insertar detalle de orden
        for (const item of items) {
            await connection.execute(`
                INSERT INTO ordenes_detalle (
                    orden_id, refaccion_id, nombre_producto, sku,
                    cantidad, precio_unitario, subtotal, total, imagen_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                ordenId,
                item.refaccion_id,
                item.nombre,
                '', // SKU se puede obtener de la tabla refacciones
                item.cantidad,
                item.precio_unitario,
                item.precio_unitario * item.cantidad,
                item.precio_unitario * item.cantidad,
                item.imagen_principal
            ]);
        }
        
        // Vaciar carrito
        await connection.execute('DELETE FROM carrito WHERE usuario_id = ?', [usuarioId]);
        
        // Si hay cupón, registrar su uso
        if (cupon_codigo && descuento > 0) {
            const [cupon] = await connection.execute(
                'SELECT id FROM cupones WHERE codigo = ?',
                [cupon_codigo]
            );
            
            if (cupon.length > 0) {
                await connection.execute(`
                    INSERT INTO cupones_uso (cupon_id, usuario_id, orden_id, descuento_aplicado)
                    VALUES (?, ?, ?, ?)
                `, [cupon[0].id, usuarioId, ordenId, descuento]);
                
                await connection.execute(
                    'UPDATE cupones SET usos_totales = usos_totales + 1 WHERE id = ?',
                    [cupon[0].id]
                );
            }
        }
        
        await connection.commit();
        
        // Obtener número de orden generado por trigger
        const [orden] = await connection.execute(
            'SELECT numero_orden FROM ordenes WHERE id = ?',
            [ordenId]
        );
        
        res.json({
            success: true,
            message: 'Orden creada exitosamente',
            orden_id: ordenId,
            numero_orden: orden[0].numero_orden,
            total
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Error al crear la orden' 
        });
    } finally {
        connection.release();
    }
};
```

---

## 🎨 Páginas Frontend a Crear

### **1. Catálogo de Refacciones (`refacciones.html`)**

```html
<!-- Estructura básica -->
<div class="catalogo-container">
    <!-- Sidebar con filtros -->
    <aside class="filtros-sidebar">
        <h3>Filtrar por:</h3>
        
        <!-- Categorías -->
        <div class="filtro-grupo">
            <h4>Categoría</h4>
            <div id="categorias-list"></div>
        </div>
        
        <!-- Marcas -->
        <div class="filtro-grupo">
            <h4>Marca</h4>
            <div id="marcas-list"></div>
        </div>
        
        <!-- Rango de precio -->
        <div class="filtro-grupo">
            <h4>Precio</h4>
            <input type="range" id="precio-min" min="0" max="10000">
            <input type="range" id="precio-max" min="0" max="10000">
        </div>
    </aside>
    
    <!-- Grid de productos -->
    <main class="productos-grid">
        <div class="productos-header">
            <h1>Refacciones</h1>
            <select id="ordenar">
                <option value="relevancia">Más relevantes</option>
                <option value="precio_asc">Precio: Menor a mayor</option>
                <option value="precio_desc">Precio: Mayor a menor</option>
                <option value="ventas">Más vendidos</option>
            </select>
        </div>
        
        <div id="productos-lista" class="productos-grid-items">
            <!-- Los productos se cargan aquí con JS -->
        </div>
        
        <div class="paginacion">
            <!-- Controles de paginación -->
        </div>
    </main>
</div>
```

### **2. Carrito de Compras (`carrito.html`)**

```html
<div class="carrito-container">
    <h1>🛒 Mi Carrito</h1>
    
    <div class="carrito-contenido">
        <!-- Items del carrito -->
        <div class="carrito-items" id="carrito-items">
            <!-- Se llenan con JS -->
        </div>
        
        <!-- Resumen de compra -->
        <aside class="carrito-resumen">
            <h3>Resumen de compra</h3>
            
            <div class="resumen-linea">
                <span>Subtotal:</span>
                <span id="subtotal">$0.00</span>
            </div>
            
            <div class="resumen-linea">
                <span>Envío:</span>
                <span id="envio">$150.00</span>
            </div>
            
            <div class="resumen-linea">
                <span>Descuento:</span>
                <span id="descuento" class="texto-verde">-$0.00</span>
            </div>
            
            <div class="resumen-linea cupon">
                <input type="text" id="cupon-input" placeholder="Código de cupón">
                <button onclick="aplicarCupon()">Aplicar</button>
            </div>
            
            <div class="resumen-total">
                <span>Total:</span>
                <span id="total">$0.00</span>
            </div>
            
            <button class="btn btn-primary btn-block" onclick="irACheckout()">
                Proceder al pago
            </button>
            
            <a href="refacciones.html" class="btn-seguir-comprando">
                ← Seguir comprando
            </button>
        </aside>
    </div>
</div>

<script>
async function cargarCarrito() {
    try {
        const response = await fetch('/api/carrito', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderizarCarrito(data.items);
            actualizarResumen(data.subtotal);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderizarCarrito(items) {
    const container = document.getElementById('carrito-items');
    
    if (items.length === 0) {
        container.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="carrito-item" data-id="${item.id}">
            <img src="${item.imagen_principal}" alt="${item.nombre}">
            <div class="item-info">
                <h4>${item.nombre}</h4>
                <p class="item-precio">$${item.precio_unitario.toFixed(2)}</p>
            </div>
            <div class="item-cantidad">
                <button onclick="cambiarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                <input type="number" value="${item.cantidad}" min="1" 
                       onchange="cambiarCantidad(${item.id}, this.value)">
                <button onclick="cambiarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
            </div>
            <p class="item-subtotal">$${(item.precio_unitario * item.cantidad).toFixed(2)}</p>
            <button class="btn-eliminar" onclick="eliminarItem(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

async function cambiarCantidad(itemId, nuevaCantidad) {
    if (nuevaCantidad <= 0) return;
    
    try {
        const response = await fetch(`/api/carrito/${itemId}/cantidad`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ cantidad: nuevaCantidad })
        });
        
        if (response.ok) {
            cargarCarrito(); // Recargar
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarItem(itemId) {
    if (!confirm('¿Eliminar este producto del carrito?')) return;
    
    try {
        const response = await fetch(`/api/carrito/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            cargarCarrito();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', cargarCarrito);
</script>
```

### **3. Agendar Cita (`citas.html`)**

```html
<div class="cita-container">
    <h1>📅 Agendar Cita de Servicio</h1>
    
    <form id="form-cita" onsubmit="agendarCita(event)">
        <!-- Información del cliente -->
        <section class="form-section">
            <h3>Información de Contacto</h3>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Nombre Completo *</label>
                    <input type="text" name="nombre_cliente" required>
                </div>
                
                <div class="form-group">
                    <label>Teléfono *</label>
                    <input type="tel" name="telefono_cliente" required pattern="[0-9]{10}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email_cliente" required>
            </div>
        </section>
        
        <!-- Información del vehículo -->
        <section class="form-section">
            <h3>Información del Vehículo</h3>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Marca</label>
                    <input type="text" name="vehiculo_marca">
                </div>
                
                <div class="form-group">
                    <label>Modelo</label>
                    <input type="text" name="vehiculo_modelo">
                </div>
                
                <div class="form-group">
                    <label>Año</label>
                    <input type="number" name="vehiculo_año" min="1980" max="2025">
                </div>
            </div>
        </section>
        
        <!-- Servicio solicitado -->
        <section class="form-section">
            <h3>Servicio Requerido</h3>
            
            <div class="form-group">
                <label>Tipo de Servicio *</label>
                <select name="tipo_servicio" required>
                    <option value="">Selecciona...</option>
                    <option value="mantenimiento">Mantenimiento Preventivo</option>
                    <option value="reparacion">Reparación</option>
                    <option value="diagnostico">Diagnóstico</option>
                    <option value="instalacion">Instalación de Refacciones</option>
                    <option value="otros">Otros</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Descripción del Servicio *</label>
                <textarea name="servicio_solicitado" rows="5" required
                    placeholder="Describe el servicio que necesitas..."></textarea>
            </div>
        </section>
        
        <!-- Fecha y hora -->
        <section class="form-section">
            <h3>Fecha y Hora</h3>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Fecha *</label>
                    <input type="date" name="fecha_cita" required 
                           min="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div class="form-group">
                    <label>Hora *</label>
                    <select name="hora_cita" required>
                        <option value="">Selecciona...</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                    </select>
                </div>
            </div>
        </section>
        
        <button type="submit" class="btn btn-primary btn-lg">
            Agendar Cita
        </button>
    </form>
</div>

<script>
async function agendarCita(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/citas/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`¡Cita agendada exitosamente!\nNúmero de cita: ${result.numero_cita}`);
            e.target.reset();
        } else {
            alert('Error al agendar cita: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión. Intenta nuevamente.');
    }
}
</script>
```

---

## 📦 Paquetes NPM Necesarios

```bash
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv
npm install express-session express-validator multer
npm install nodemailer stripe # Para emails y pagos
```

---

## ✅ Checklist de Implementación

### **Backend:**
- [ ] Instalar Node.js y dependencias
- [ ] Configurar conexión a MySQL
- [ ] Crear modelos para cada tabla
- [ ] Implementar autenticación JWT
- [ ] Crear endpoints de API
- [ ] Agregar validaciones
- [ ] Configurar CORS
- [ ] Implementar manejo de sesiones
- [ ] Integrar pasarela de pagos

### **Frontend:**
- [ ] Actualizar formulario de contacto (ya hecho)
- [ ] Crear catálogo de refacciones
- [ ] Implementar carrito de compras
- [ ] Crear página de checkout
- [ ] Agregar sistema de login/registro
- [ ] Crear panel de usuario
- [ ] Implementar formulario de citas
- [ ] Adaptar página de vehículos (solo exhibición)

### **Base de Datos:**
- [ ] Ejecutar script SQL
- [ ] Insertar datos de prueba
- [ ] Configurar backups automáticos
- [ ] Optimizar índices

---

## 🎯 **¡El sistema está completamente diseñado y listo para implementar!**

**Total de tablas:** 25+  
**Módulos:** 8  
**Funcionalidades:** Carrito, Órdenes, Citas, Usuarios, Cupones, Reseñas

Tienes toda la estructura de base de datos lista. Solo falta implementar el backend y frontend para conectarlo todo. 🚀
