# 🚀 Guía Rápida de Integración con Base de Datos

## ✅ Estado Actual

El formulario de contacto **YA ESTÁ PREPARADO** para base de datos. Los datos se estructuran exactamente como los necesita la BD.

### 📦 Estructura de Datos Generada

Cada vez que alguien llena el formulario, se genera esto:

```json
{
  "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "fecha_creacion": "2024-11-12T15:30:00.000Z",
  "fecha_modificacion": "2024-11-12T15:30:00.000Z",
  "fuente": "contacto_web",
  "estado": "pendiente",
  "prioridad": "media",
  "asignado_a": null,
  "nombre_completo": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "5512345678",
  "tipo_interes": "compra",
  "mensaje": "Me interesa conocer más sobre...",
  "ip_address": null,
  "user_agent": "Mozilla/5.0...",
  "pagina_origen": "http://localhost/contactanos.html",
  "utm_source": null,
  "utm_medium": null,
  "utm_campaign": null
}
```

---

## 🔧 Pasos para Conectar la Base de Datos

### **OPCIÓN 1: Backend con Node.js + MySQL** ⭐ (Recomendado)

#### 1. Instalar dependencias
```bash
npm init -y
npm install express mysql2 cors dotenv body-parser
```

#### 2. Crear archivo `server.js`
```javascript
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'gearsteed',
    waitForConnections: true,
    connectionLimit: 10
});

// Endpoint para recibir contactos
app.post('/api/contactos', async (req, res) => {
    try {
        const data = req.body;
        
        // Validar datos requeridos
        if (!data.nombre_completo || !data.email || !data.telefono || !data.mensaje) {
            return res.status(400).json({ 
                success: false, 
                error: 'Faltan campos obligatorios' 
            });
        }
        
        // Capturar IP del cliente
        data.ip_address = req.ip || req.connection.remoteAddress;
        
        // Insertar en base de datos
        const query = `
            INSERT INTO contactos (
                id, fecha_creacion, fecha_modificacion, fuente, estado, prioridad,
                nombre_completo, email, telefono, tipo_interes, mensaje,
                ip_address, user_agent, pagina_origen,
                utm_source, utm_medium, utm_campaign
            ) VALUES (?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            data.id,
            data.fuente,
            data.estado,
            data.prioridad,
            data.nombre_completo,
            data.email,
            data.telefono,
            data.tipo_interes,
            data.mensaje,
            data.ip_address,
            data.user_agent,
            data.pagina_origen,
            data.utm_source,
            data.utm_medium,
            data.utm_campaign
        ];
        
        await pool.execute(query, values);
        
        res.json({ 
            success: true, 
            message: 'Contacto guardado correctamente',
            id: data.id
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al guardar el contacto' 
        });
    }
});

// Endpoint para obtener estadísticas
app.get('/api/contactos/stats', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN DATE(fecha_creacion) = CURDATE() THEN 1 ELSE 0 END) as hoy
            FROM contactos
        `);
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
```

#### 3. Crear archivo `.env`
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gearsteed
PORT=3000
```

#### 4. Modificar `script.js` (línea donde dice "Simular envío")
```javascript
// En la función initFormValidation, reemplazar el setTimeout por:

// Recolectar datos del formulario
const formData = collectFormData(form);

// ENVIAR A LA BASE DE DATOS
fetch('http://localhost:3000/api/contactos', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
})
.then(response => response.json())
.then(result => {
    if (result.success) {
        showNotification('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
        form.reset();
        allInputs.forEach(input => {
            input.classList.remove('error', 'valid');
            removeFieldError(input);
        });
    } else {
        showNotification('Error al enviar. Por favor, intenta nuevamente.', 'error');
    }
})
.catch(error => {
    console.error('Error:', error);
    showNotification('Error de conexión. Intenta más tarde.', 'error');
})
.finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
});
```

#### 5. Ejecutar
```bash
# Crear la base de datos (ver DATABASE_SCHEMA.md)
mysql -u root -p < crear_tablas.sql

# Iniciar servidor
node server.js
```

---

### **OPCIÓN 2: Backend con PHP + MySQL** (Para hosting tradicional)

#### 1. Crear archivo `api/guardar_contacto.php`
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit();
}

// Configuración de base de datos
$host = 'localhost';
$dbname = 'gearsteed';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obtener datos del formulario
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar campos obligatorios
    if (empty($data['nombre_completo']) || empty($data['email']) || 
        empty($data['telefono']) || empty($data['mensaje'])) {
        throw new Exception('Faltan campos obligatorios');
    }
    
    // Capturar IP del cliente
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    
    // Preparar consulta
    $sql = "INSERT INTO contactos (
        id, fecha_creacion, fecha_modificacion, fuente, estado, prioridad,
        nombre_completo, email, telefono, tipo_interes, mensaje,
        ip_address, user_agent, pagina_origen,
        utm_source, utm_medium, utm_campaign
    ) VALUES (
        :id, NOW(), NOW(), :fuente, :estado, :prioridad,
        :nombre_completo, :email, :telefono, :tipo_interes, :mensaje,
        :ip_address, :user_agent, :pagina_origen,
        :utm_source, :utm_medium, :utm_campaign
    )";
    
    $stmt = $pdo->prepare($sql);
    
    // Ejecutar
    $stmt->execute([
        ':id' => $data['id'],
        ':fuente' => $data['fuente'] ?? 'contacto_web',
        ':estado' => $data['estado'] ?? 'pendiente',
        ':prioridad' => $data['prioridad'] ?? 'media',
        ':nombre_completo' => $data['nombre_completo'],
        ':email' => $data['email'],
        ':telefono' => $data['telefono'],
        ':tipo_interes' => $data['tipo_interes'] ?? '',
        ':mensaje' => $data['mensaje'],
        ':ip_address' => $ip,
        ':user_agent' => $data['user_agent'] ?? '',
        ':pagina_origen' => $data['pagina_origen'] ?? '',
        ':utm_source' => $data['utm_source'] ?? null,
        ':utm_medium' => $data['utm_medium'] ?? null,
        ':utm_campaign' => $data['utm_campaign'] ?? null
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Contacto guardado correctamente',
        'id' => $data['id']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

#### 2. Modificar `script.js`
```javascript
// Cambiar la URL del fetch a:
fetch('https://tudominio.com/api/guardar_contacto.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
})
```

---

### **OPCIÓN 3: Firebase (Sin servidor)** (Más fácil para empezar)

#### 1. Instalar Firebase SDK
```html
<!-- Agregar en contactanos.html antes del </body> -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

#### 2. Configurar Firebase en `script.js`
```javascript
// Agregar después de las funciones de inicialización
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Modificar donde dice "Simular envío"
const formData = collectFormData(form);

db.collection('contactos').add(formData)
    .then(() => {
        showNotification('¡Mensaje enviado correctamente!', 'success');
        form.reset();
        // ... resto del código de limpieza
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error al enviar. Intenta nuevamente.', 'error');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
```

---

## 📊 Panel de Administración (Opcional)

Para ver los contactos guardados, puedes crear un archivo `admin.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel de Contactos - GearSteed</title>
    <style>
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
        th { background: #2c3e50; color: white; }
        tr:hover { background: #f5f5f5; }
        .pendiente { color: #f39c12; font-weight: bold; }
        .contactado { color: #27ae60; }
    </style>
</head>
<body>
    <h1>📋 Contactos Recibidos</h1>
    <div id="stats"></div>
    <table id="contactosTable">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Interés</th>
                <th>Estado</th>
                <th>Mensaje</th>
            </tr>
        </thead>
        <tbody id="contactosBody"></tbody>
    </table>

    <script>
        // Cargar contactos desde localStorage
        const contactos = JSON.parse(localStorage.getItem('gearsteed_contactos') || '[]');
        
        // Estadísticas
        const stats = {
            total: contactos.length,
            pendientes: contactos.filter(c => c.estado === 'pendiente').length,
            hoy: contactos.filter(c => {
                const fecha = new Date(c.fecha_creacion);
                return fecha.toDateString() === new Date().toDateString();
            }).length
        };
        
        document.getElementById('stats').innerHTML = `
            <p><strong>Total:</strong> ${stats.total} | 
               <strong>Pendientes:</strong> ${stats.pendientes} | 
               <strong>Hoy:</strong> ${stats.hoy}</p>
        `;
        
        // Mostrar tabla
        const tbody = document.getElementById('contactosBody');
        contactos.reverse().forEach(c => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${new Date(c.fecha_creacion).toLocaleString('es-MX')}</td>
                <td>${c.nombre_completo}</td>
                <td>${c.email}</td>
                <td>${c.telefono}</td>
                <td>${c.tipo_interes}</td>
                <td class="${c.estado}">${c.estado}</td>
                <td>${c.mensaje.substring(0, 50)}...</td>
            `;
        });
    </script>
</body>
</html>
```

---

## 🔍 Verificar que Todo Funciona

### 1. Ver datos guardados localmente (temporalmente):
```javascript
// En la consola del navegador (F12):
const datos = JSON.parse(localStorage.getItem('gearsteed_contactos'));
console.table(datos);
```

### 2. Exportar a JSON:
```javascript
// En la consola:
exportarContactosAJSON();
```

### 3. Ver estadísticas:
```javascript
// En la consola:
verEstadisticasContactos();
```

---

## ✅ Checklist de Integración

- [ ] Base de datos creada con tablas del `DATABASE_SCHEMA.md`
- [ ] Backend configurado (Node.js/PHP/Firebase)
- [ ] Variables de entorno configuradas (.env)
- [ ] URL del API actualizada en `script.js`
- [ ] Probado en localhost
- [ ] CORS configurado correctamente
- [ ] Certificado SSL para HTTPS en producción
- [ ] Backup de datos locales exportado
- [ ] Panel de administración funcionando

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica que la base de datos esté creada
2. Revisa la consola del navegador (F12) para errores
3. Verifica que el backend esté corriendo
4. Confirma que la URL del API sea correcta
5. Revisa los logs del servidor

---

**¡El sistema está listo para conectarse a base de datos en cualquier momento!** 🚀
