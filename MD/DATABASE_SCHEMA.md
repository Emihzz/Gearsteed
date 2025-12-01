# 🗄️ Esquema de Base de Datos - GearSteed

## 📐 Diagrama Entidad-Relación (ER)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SISTEMA GEARSTEED                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐         ┌──────────────────────┐
│     CONTACTOS        │         │      CLIENTES        │         │     VEHICULOS        │
├──────────────────────┤         ├──────────────────────┤         ├──────────────────────┤
│ id (PK)             │         │ id (PK)             │         │ id (PK)             │
│ fecha_creacion      │         │ nombre_completo     │         │ marca               │
│ fecha_modificacion  │    ┌───→│ email (UNIQUE)      │←───┐    │ modelo              │
│ fuente              │    │    │ telefono            │    │    │ año                 │
│ estado              │    │    │ direccion           │    │    │ precio              │
│ prioridad           │    │    │ ciudad              │    │    │ tipo                │
│ asignado_a (FK)     │────┘    │ fecha_registro      │    │    │ estado              │
│ cliente_id (FK)     │─────────→│ total_compras       │    │    │ kilometraje         │
│ nombre_completo     │         │ cliente_premium     │    │    │ transmision         │
│ email               │         │ notas               │    │    │ combustible         │
│ telefono            │         └──────────────────────┘    │    │ color               │
│ tipo_interes        │                  │                  │    │ vin                 │
│ mensaje             │                  │                  │    │ fecha_ingreso       │
│ ip_address          │                  │                  │    │ vendido             │
│ user_agent          │                  │                  │    │ descripcion         │
│ pagina_origen       │                  │                  │    │ imagen_url          │
│ utm_source          │                  │                  │    └──────────────────────┘
│ utm_medium          │                  │                  │              │
│ utm_campaign        │                  │                  │              │
└──────────────────────┘                  │                  │              │
                                         │                  │              │
                                         ▼                  │              │
                            ┌──────────────────────┐        │              │
                            │      VENTAS          │        │              │
                            ├──────────────────────┤        │              │
                            │ id (PK)             │        │              │
                            │ fecha_venta         │        │              │
                            │ cliente_id (FK)     │────────┘              │
                            │ vehiculo_id (FK)    │───────────────────────┘
                            │ vendedor_id (FK)    │────┐
                            │ precio_venta        │    │
                            │ metodo_pago         │    │
                            │ financiamiento      │    │
                            │ enganche            │    │
                            │ mensualidades       │    │
                            │ comision_vendedor   │    │
                            │ estado              │    │
                            │ notas               │    │
                            └──────────────────────┘    │
                                                       │
                            ┌──────────────────────┐    │
                            │     VENDEDORES       │    │
                            ├──────────────────────┤    │
                            │ id (PK)             │←───┘
                            │ nombre_completo     │
                            │ email (UNIQUE)      │
                            │ telefono            │
                            │ puesto              │
                            │ fecha_contratacion  │
                            │ comision_base       │
                            │ activo              │
                            │ total_ventas        │
                            └──────────────────────┘
                                      │
                                      │
                            ┌──────────────────────┐
                            │    REFACCIONES       │
                            ├──────────────────────┤
                            │ id (PK)             │
                            │ nombre              │
                            │ categoria           │
                            │ marca               │
                            │ precio              │
                            │ stock               │
                            │ codigo_barras       │
                            │ compatibilidad      │
                            │ imagen_url          │
                            │ descripcion         │
                            │ proveedor           │
                            │ fecha_ingreso       │
                            └──────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────────┐
                            │ VENTAS_REFACCIONES   │
                            ├──────────────────────┤
                            │ id (PK)             │
                            │ fecha_venta         │
                            │ refaccion_id (FK)   │
                            │ cantidad            │
                            │ precio_unitario     │
                            │ total               │
                            │ cliente_id (FK)     │
                            │ vendedor_id (FK)    │
                            └──────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ RELACIONES:                                                                   │
│ • Un CONTACTO puede convertirse en un CLIENTE (1:0..1)                       │
│ • Un CONTACTO es asignado a un VENDEDOR (N:1)                                │
│ • Un CLIENTE puede realizar múltiples VENTAS (1:N)                           │
│ • Un VEHÍCULO se vende en una VENTA (1:1)                                    │
│ • Un VENDEDOR puede gestionar múltiples CONTACTOS (1:N)                      │
│ • Un VENDEDOR puede realizar múltiples VENTAS (1:N)                          │
│ • Una REFACCIÓN puede venderse múltiples veces (1:N)                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Definición de Tablas SQL

### 1. Tabla: **contactos**
```sql
CREATE TABLE contactos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Control de estado
    fuente VARCHAR(50) NOT NULL DEFAULT 'contacto_web',
    estado ENUM('pendiente', 'en_proceso', 'contactado', 'cerrado', 'perdido') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    asignado_a INT NULL,
    cliente_id INT NULL,
    
    -- Datos del contacto
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    tipo_interes ENUM('compra', 'venta', 'refacciones', 'financiamiento', 'servicio') NOT NULL,
    mensaje TEXT NOT NULL,
    
    -- Metadatos
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    pagina_origen VARCHAR(500) NULL,
    utm_source VARCHAR(100) NULL,
    utm_medium VARCHAR(100) NULL,
    utm_campaign VARCHAR(100) NULL,
    
    -- Índices
    INDEX idx_estado (estado),
    INDEX idx_email (email),
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_asignado (asignado_a),
    INDEX idx_cliente (cliente_id),
    INDEX idx_tipo_interes (tipo_interes),
    
    -- Relaciones
    FOREIGN KEY (asignado_a) REFERENCES vendedores(id) ON DELETE SET NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Tabla: **clientes**
```sql
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT NULL,
    ciudad VARCHAR(100) NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_compras DECIMAL(10,2) DEFAULT 0.00,
    cliente_premium BOOLEAN DEFAULT FALSE,
    notas TEXT NULL,
    
    INDEX idx_email (email),
    INDEX idx_telefono (telefono),
    INDEX idx_fecha_registro (fecha_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Tabla: **vendedores**
```sql
CREATE TABLE vendedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    puesto VARCHAR(100) DEFAULT 'Vendedor',
    fecha_contratacion DATE NOT NULL,
    comision_base DECIMAL(5,2) DEFAULT 5.00,
    activo BOOLEAN DEFAULT TRUE,
    total_ventas INT DEFAULT 0,
    
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Tabla: **vehiculos**
```sql
CREATE TABLE vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    año YEAR NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    tipo ENUM('nuevo', 'seminuevo', 'usado') NOT NULL,
    estado ENUM('disponible', 'reservado', 'vendido', 'mantenimiento') DEFAULT 'disponible',
    kilometraje INT DEFAULT 0,
    transmision ENUM('manual', 'automatica') NOT NULL,
    combustible ENUM('gasolina', 'diesel', 'electrico', 'hibrido') NOT NULL,
    color VARCHAR(50) NOT NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    fecha_ingreso DATE NOT NULL DEFAULT (CURRENT_DATE),
    vendido BOOLEAN DEFAULT FALSE,
    descripcion TEXT NULL,
    imagen_url VARCHAR(500) NULL,
    
    INDEX idx_marca_modelo (marca, modelo),
    INDEX idx_precio (precio),
    INDEX idx_estado (estado),
    INDEX idx_tipo (tipo),
    INDEX idx_año (año)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. Tabla: **ventas**
```sql
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cliente_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    precio_venta DECIMAL(12,2) NOT NULL,
    metodo_pago ENUM('contado', 'financiamiento', 'credito') NOT NULL,
    financiamiento BOOLEAN DEFAULT FALSE,
    enganche DECIMAL(12,2) NULL,
    mensualidades INT NULL,
    comision_vendedor DECIMAL(10,2) NULL,
    estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'completada',
    notas TEXT NULL,
    
    INDEX idx_fecha (fecha_venta),
    INDEX idx_cliente (cliente_id),
    INDEX idx_vendedor (vendedor_id),
    INDEX idx_estado (estado),
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6. Tabla: **refacciones**
```sql
CREATE TABLE refacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    codigo_barras VARCHAR(50) UNIQUE NULL,
    compatibilidad TEXT NULL,
    imagen_url VARCHAR(500) NULL,
    descripcion TEXT NULL,
    proveedor VARCHAR(255) NULL,
    fecha_ingreso DATE NOT NULL DEFAULT (CURRENT_DATE),
    
    INDEX idx_categoria (categoria),
    INDEX idx_marca (marca),
    INDEX idx_stock (stock),
    INDEX idx_precio (precio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7. Tabla: **ventas_refacciones**
```sql
CREATE TABLE ventas_refacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    refaccion_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    cliente_id INT NULL,
    vendedor_id INT NULL,
    
    INDEX idx_fecha (fecha_venta),
    INDEX idx_refaccion (refaccion_id),
    INDEX idx_cliente (cliente_id),
    
    FOREIGN KEY (refaccion_id) REFERENCES refacciones(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔄 Scripts de Migración

### Crear todas las tablas en orden:
```sql
-- 1. Tablas independientes primero
CREATE TABLE vendedores (...);
CREATE TABLE clientes (...);
CREATE TABLE vehiculos (...);
CREATE TABLE refacciones (...);

-- 2. Tablas con dependencias
CREATE TABLE contactos (...);
CREATE TABLE ventas (...);
CREATE TABLE ventas_refacciones (...);
```

---

## 📊 Vistas Útiles

### Vista: Contactos Pendientes con Vendedor
```sql
CREATE VIEW contactos_activos AS
SELECT 
    c.id,
    c.nombre_completo,
    c.email,
    c.telefono,
    c.tipo_interes,
    c.estado,
    c.prioridad,
    c.fecha_creacion,
    v.nombre_completo AS vendedor_asignado,
    DATEDIFF(NOW(), c.fecha_creacion) AS dias_desde_contacto
FROM contactos c
LEFT JOIN vendedores v ON c.asignado_a = v.id
WHERE c.estado IN ('pendiente', 'en_proceso')
ORDER BY c.prioridad DESC, c.fecha_creacion ASC;
```

### Vista: Dashboard de Ventas
```sql
CREATE VIEW dashboard_ventas AS
SELECT 
    DATE(fecha_venta) AS fecha,
    COUNT(*) AS total_ventas,
    SUM(precio_venta) AS ingresos_totales,
    AVG(precio_venta) AS ticket_promedio,
    SUM(comision_vendedor) AS comisiones_totales
FROM ventas
WHERE estado = 'completada'
GROUP BY DATE(fecha_venta)
ORDER BY fecha DESC;
```

---

## 🔐 Seguridad y Mejores Prácticas

### 1. Usuarios de Base de Datos
```sql
-- Usuario para la aplicación web (solo INSERT en contactos)
CREATE USER 'gearsteed_web'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT SELECT, INSERT ON gearsteed.contactos TO 'gearsteed_web'@'localhost';

-- Usuario para el CRM (acceso completo)
CREATE USER 'gearsteed_crm'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT ALL PRIVILEGES ON gearsteed.* TO 'gearsteed_crm'@'localhost';

FLUSH PRIVILEGES;
```

### 2. Triggers Útiles

#### Auto-actualizar fecha_modificacion
```sql
CREATE TRIGGER contactos_before_update
BEFORE UPDATE ON contactos
FOR EACH ROW
SET NEW.fecha_modificacion = NOW();
```

#### Crear cliente desde contacto cerrado
```sql
DELIMITER $$
CREATE TRIGGER contacto_a_cliente
AFTER UPDATE ON contactos
FOR EACH ROW
BEGIN
    IF NEW.estado = 'cerrado' AND OLD.estado != 'cerrado' AND NEW.cliente_id IS NULL THEN
        INSERT INTO clientes (nombre_completo, email, telefono)
        VALUES (NEW.nombre_completo, NEW.email, NEW.telefono)
        ON DUPLICATE KEY UPDATE telefono = NEW.telefono;
        
        UPDATE contactos 
        SET cliente_id = LAST_INSERT_ID() 
        WHERE id = NEW.id;
    END IF;
END$$
DELIMITER ;
```

#### Actualizar stock de refacciones
```sql
CREATE TRIGGER actualizar_stock_refaccion
AFTER INSERT ON ventas_refacciones
FOR EACH ROW
UPDATE refacciones 
SET stock = stock - NEW.cantidad 
WHERE id = NEW.refaccion_id;
```

---

## 📈 Consultas Útiles

### Top 10 vendedores del mes
```sql
SELECT 
    v.nombre_completo,
    COUNT(ve.id) AS ventas_mes,
    SUM(ve.precio_venta) AS total_vendido,
    SUM(ve.comision_vendedor) AS comision_ganada
FROM vendedores v
JOIN ventas ve ON v.id = ve.vendedor_id
WHERE MONTH(ve.fecha_venta) = MONTH(CURRENT_DATE)
AND YEAR(ve.fecha_venta) = YEAR(CURRENT_DATE)
GROUP BY v.id
ORDER BY total_vendido DESC
LIMIT 10;
```

### Tasa de conversión de contactos
```sql
SELECT 
    tipo_interes,
    COUNT(*) AS total_contactos,
    SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) AS cerrados,
    ROUND(SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS tasa_conversion
FROM contactos
WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY tipo_interes;
```

---

## 🚀 Integración con el Frontend

El formulario actual ya genera datos en este formato. Para conectar:

```javascript
// En script.js - función submitContactForm
async function submitContactForm(formData) {
    const response = await fetch('https://tudominio.com/api/contactos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'tu_api_key_aqui'
        },
        body: JSON.stringify(formData)
    });
    
    return await response.json();
}
```

---

## 📦 Datos de Ejemplo

### Insertar vendedor de prueba
```sql
INSERT INTO vendedores (nombre_completo, email, telefono, fecha_contratacion) 
VALUES ('Juan Pérez', 'juan@gearsteed.mx', '5512345678', '2024-01-15');
```

### Insertar vehículo de prueba
```sql
INSERT INTO vehiculos (marca, modelo, año, precio, tipo, transmision, combustible, color, vin)
VALUES ('Toyota', 'Hilux', 2024, 580000.00, 'nuevo', 'automatica', 'diesel', 'Blanco', '1HGBH41JXMN109186');
```

---

**Fecha de creación:** Noviembre 2024  
**Versión:** 1.0  
**Compatible con:** MySQL 8.0+, MariaDB 10.5+
