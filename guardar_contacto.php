<?php
$servidor = "127.0.0.1";
$usuario = "root";
$password = "Emiz";
$base_datos = "GearSteed";
$puerto = 3306;

$conn = new mysqli($servidor, $usuario, $password, $base_datos, $puerto);

if ($conn->connect_error) {
    die("Fallo conexión: " . $conn->connect_error);
}

// Recibir datos
$nombre = $_POST['nombre'];
$email = $_POST['email'];
$telefono = $_POST['telefono'];
$interes = $_POST['interes'];
$mensaje = $_POST['mensaje'];

$sql = "INSERT INTO mensajes_contacto (nombre, email, telefono, interes, mensaje) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssss", $nombre, $email, $telefono, $interes, $mensaje);

if ($stmt->execute()) {
    echo "<h1>¡ÉXITO! DATOS GUARDADOS.</h1>";
    echo "<p>Revisa tu base de datos ahora.</p>";
    echo "<a href='contactanos.html'>Volver</a>";
} else {
    echo "Error: " . $stmt->error;
}
$conn->close();
?>