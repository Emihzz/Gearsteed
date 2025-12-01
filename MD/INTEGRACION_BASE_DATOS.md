# Guía de Integración de Base de Datos - Formulario de Contacto

## 📋 Resumen
El formulario de contacto está completamente funcional y preparado para integración con base de datos. Actualmente guarda los datos en `localStorage` como solución temporal.

## 🎯 Estructura de Datos del Formulario

Los datos que se capturan son:

```javascript
{
  "timestamp": "2024-11-12T10:30:00.000Z",  // Fecha/hora automática
  "source": "contacto_web",                  // Origen del contacto
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "+52 55 1234 5678",
  "interes": "compra",                       // compra|venta|refacciones|financiamiento|servicio
  "mensaje": "Estoy interesado en..."
}
```

## 🔧 Validaciones Implementadas

### Campos Obligatorios:
- ✅ **Nombre completo**: Requerido, no vacío
- ✅ **Email**: Requerido, formato válido (usuario@dominio.com)
- ✅ **Mensaje**: Requerido, mínimo 10 caracteres

### Campos Opcionales:
- **Teléfono**: Si se llena, debe tener formato válido (mínimo 10 dígitos)
- **Interés**: Selector con opciones predefinidas

### Validación en Tiempo Real:
- Se valida al perder el foco (blur)
- Se valida mientras se escribe si hay errores
- Indicadores visuales: verde (válido), rojo (error)
- Mensajes de error específicos por campo

## 🗄️ Opciones de Integración con Base de Datos

### Opción 1: API REST con Node.js + MongoDB

**Backend (Node.js + Express + MongoDB):**

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Modelo de datos
const ContactSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  source: String,
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  telefono: String,
  interes: String,
  mensaje: { type: String, required: true },
  estado: { type: String, default: 'pendiente' } // pendiente|contactado|cerrado
});

const Contact = mongoose.model('Contact', ContactSchema);

// Endpoint para recibir formularios
app.post('/api/contact', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.json({ success: true, message: 'Contacto guardado' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/gearsteed')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

app.listen(3000, () => console.log('Server en puerto 3000'));
```

**Modificación en script.js:**

```javascript
// Reemplazar la función submitContactForm con:
async function submitContactForm(formData) {
    const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
        throw new Error('Error en el servidor');
    }
    
    return await response.json();
}
```

### Opción 2: Firebase (Sin servidor backend)

**Configuración en script.js:**

```javascript
// Agregar antes de initializeAll():
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  // ... resto de config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Modificar submitContactForm:
async function submitContactForm(formData) {
    try {
        const docRef = await addDoc(collection(db, "contactos"), formData);
        console.log("Documento guardado con ID:", docRef.id);
        return { success: true, message: 'Formulario enviado correctamente' };
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: error.message };
    }
}
```

### Opción 3: PHP + MySQL (Hosting tradicional)

**Backend (contact_api.php):**

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $conn = new mysqli('localhost', 'usuario', 'password', 'gearsteed_db');
    
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error de conexión']);
        exit;
    }
    
    $stmt = $conn->prepare(
        "INSERT INTO contactos (timestamp, source, nombre, email, telefono, interes, mensaje) 
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    
    $stmt->bind_param(
        'sssssss',
        $data['timestamp'],
        $data['source'],
        $data['nombre'],
        $data['email'],
        $data['telefono'],
        $data['interes'],
        $data['mensaje']
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Contacto guardado']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    
    $stmt->close();
    $conn->close();
}
?>
```

**SQL para crear la tabla:**

```sql
CREATE TABLE contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    source VARCHAR(50),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    interes VARCHAR(100),
    mensaje TEXT NOT NULL,
    estado ENUM('pendiente', 'contactado', 'cerrado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_estado (estado)
);
```

**Modificación en script.js:**

```javascript
async function submitContactForm(formData) {
    const response = await fetch('https://tudominio.com/api/contact_api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    return await response.json();
}
```

### Opción 4: Supabase (Backend como Servicio)

**Configuración:**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://tu-proyecto.supabase.co',
    'tu-anon-key'
);

async function submitContactForm(formData) {
    const { data, error } = await supabase
        .from('contactos')
        .insert([formData]);
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    return { success: true, message: 'Formulario enviado correctamente' };
}
```

## 📧 Notificaciones por Email (Opcional)

Para recibir emails cuando alguien llena el formulario:

### Con Node.js + Nodemailer:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ventas@GearSteed.mx',
        pass: 'tu-password-app'
    }
});

// Después de guardar en DB:
await transporter.sendMail({
    from: 'contacto@GearSteed.mx',
    to: 'ventas@GearSteed.mx',
    subject: `Nuevo contacto de ${formData.nombre}`,
    html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${formData.nombre}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Teléfono:</strong> ${formData.telefono}</p>
        <p><strong>Interés:</strong> ${formData.interes}</p>
        <p><strong>Mensaje:</strong> ${formData.mensaje}</p>
    `
});
```

## 🔍 Ver Datos Guardados Temporalmente

Mientras no tengas base de datos, los datos se guardan en localStorage. Para verlos:

```javascript
// En la consola del navegador (F12):
const datos = JSON.parse(localStorage.getItem('contactFormSubmissions'));
console.table(datos);

// Para exportar a JSON:
const json = JSON.stringify(datos, null, 2);
console.log(json);
// Copia el resultado y guárdalo en un archivo .json
```

## 🚀 Pasos para Implementar

1. **Elige una opción** de las anteriores según tu infraestructura
2. **Instala las dependencias** necesarias
3. **Crea la tabla/colección** en tu base de datos
4. **Modifica la función `submitContactForm`** en `script.js`
5. **Configura las credenciales** (API keys, conexión DB)
6. **Prueba el formulario** en ambiente de desarrollo
7. **Configura CORS** si frontend y backend están en dominios diferentes
8. **Despliega a producción**

## 🔒 Seguridad

- ✅ Validación en frontend ya implementada
- ⚠️ **Agregar validación en backend** (nunca confiar solo en frontend)
- ⚠️ **Sanitizar datos** antes de guardar en DB
- ⚠️ **Usar HTTPS** en producción
- ⚠️ **Proteger API keys** con variables de entorno
- ⚠️ **Implementar rate limiting** para prevenir spam
- ⚠️ **Agregar CAPTCHA** (Google reCAPTCHA) para formularios públicos

## 📞 Soporte

Si necesitas ayuda con la integración, contáctanos o consulta la documentación de tu solución elegida.

---

**Última actualización:** Noviembre 2024
