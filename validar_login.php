<?php
session_start(); // Iniciar el manejo de sesiones
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];       // Asegúrate que en tu HTML el input se llame name="email"
    $password = $_POST['password']; // Asegúrate que en tu HTML el input se llame name="password"

    // 1. Buscar el usuario por su correo
    $sql = "SELECT * FROM usuarios WHERE email = '$email'";
    $resultado = $conn->query($sql);

    if ($resultado->num_rows > 0) {
        // El correo existe, ahora sacamos los datos
        $fila = $resultado->fetch_assoc();

        // 2. Verificar la contraseña encriptada
        // password_verify compara la contraseña escrita con el hash guardado en la BD
        if (password_verify($password, $fila['password'])) {

            // ¡CONTRASEÑA CORRECTA!
            $_SESSION['usuario_id'] = $fila['id'];
            $_SESSION['usuario_nombre'] = $fila['nombre_completo'];

            echo "¡Bienvenido " . $fila['nombre_completo'] . "!";
            // Redirigir al panel principal
            // header("Location: index.html");

        } else {
            echo "Contraseña incorrecta.";
        }
    } else {
        echo "No existe ninguna cuenta con ese correo.";
    }
}
?>