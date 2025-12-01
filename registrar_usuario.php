<?php
include 'conexion.php';

// Verificar si se enviaron datos
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $email = $_POST['email'];
    $password = $_POST['password'];

    // 1. IMPORTANTE: Encriptar la contraseña
    // Nunca guardes contraseñas como "hola123", es inseguro.
    // password_hash convierte "hola123" en un código largo indescifrable.
    $password_encriptada = password_hash($password, PASSWORD_DEFAULT);

    // 2. Verificar si el correo ya existe
    $checkEmail = "SELECT * FROM usuarios WHERE email = '$email'";
    $resultado = $conn->query($checkEmail);

    if ($resultado->num_rows > 0) {
        echo "Error: Ese correo ya está registrado.";
    } else {
        // 3. Insertar el nuevo usuario
        $sql = "INSERT INTO usuarios (nombre_completo, email, password) VALUES ('$nombre', '$email', '$password_encriptada')";

        if ($conn->query($sql) === TRUE) {
            echo "¡Registro exitoso! Ahora puedes iniciar sesión.";
            // Aquí podrías redirigir al login: header("Location: login.html");
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    }
}
?>