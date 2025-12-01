<?php
// conexion.php
$servidor = "127.0.0.1"; // Usamos IP para forzar TCP/IP y evitar problemas de socket
$usuario = "root";
$password = "Emiz";
$base_datos = "GearSteed";
$puerto = 3306;

// Crear conexión usando el puerto específico
$conn = new mysqli($servidor, $usuario, $password, $base_datos, $puerto);

// Verificar conexión
if ($conn->connect_error) {
    // Si falla, matamos el proceso y mostramos el error
    die("Fallo critico en la conexión: " . $conn->connect_error);
}

// Configurar caracteres especiales (tildes, ñ)
$conn->set_charset("utf8");
?>