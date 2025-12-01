<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json; charset=UTF-8');

// Evitar bloqueos por preflight requests (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
include 'conexion.php';

// Leer JSON RAW
$json_input = file_get_contents('php://input');
if ($json_input) {
    $data = json_decode($json_input, true);
    if (is_array($data)) {
        $_POST = array_merge($_POST, $data);
    }
}

$response = array('success' => false, 'message' => 'Error desconocido.', 'logged_in' => false);

if (isset($_POST['action'])) {
    $action = $_POST['action'];

    // --- 1. LOGIN ---
    if ($action === 'login') {
        if (!isset($_POST['email']) || !isset($_POST['password'])) {
            $response['message'] = 'Faltan parámetros.';
        } else {
            $email = $_POST['email'];
            $password = $_POST['password'];
            $stmt = $conn->prepare("SELECT id, nombre, apellido, password FROM usuarios WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $usuario = $result->fetch_assoc();
                if (password_verify($password, $usuario['password'])) {
                    $_SESSION['user_id'] = $usuario['id'];
                    $_SESSION['user_name'] = $usuario['nombre'] . ' ' . $usuario['apellido'];
                    $response['success'] = true;
                    $response['message'] = 'Bienvenido ' . $_SESSION['user_name'];
                    $response['logged_in'] = true;
                } else {
                    $response['message'] = 'Contraseña incorrecta.';
                }
            } else {
                $response['message'] = 'Usuario no encontrado.';
            }
        }
    }

    // --- 2. REGISTRO ---
    elseif ($action === 'register') {
        if (!isset($_POST['nombre'], $_POST['apellido'], $_POST['email'], $_POST['telefono'], $_POST['password'])) {
            $response['message'] = 'Faltan campos obligatorios.';
        } else {
            $nombre = $_POST['nombre'];
            $apellido = $_POST['apellido'];
            $email = $_POST['email'];
            $telefono = $_POST['telefono'];
            $password = $_POST['password'];
            $check = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
            $check->bind_param("s", $email);
            $check->execute();
            if ($check->get_result()->num_rows > 0) {
                $response['message'] = 'El correo ya existe.';
            } else {
                $passHash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $conn->prepare("INSERT INTO usuarios (nombre, apellido, email, telefono, password) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("sssss", $nombre, $apellido, $email, $telefono, $passHash);
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Registro exitoso.';
                } else {
                    $response['message'] = 'Error BD: ' . $conn->error;
                }
            }
        }
    }

    // --- 3. VERIFICAR SESIÓN ---
    elseif ($action === 'check_session') {
        if (isset($_SESSION['user_id'])) {
            $response['success'] = true;
            $response['logged_in'] = true;
            $response['user_name'] = $_SESSION['user_name'];
        }
    }

    // --- 4. CERRAR SESIÓN ---
    elseif ($action === 'logout') {
        session_destroy();
        session_start();
        $response['success'] = true;
        $response['logged_in'] = false;
        $response['message'] = 'Sesión cerrada.';
    }

    // --- 5. OBTENER PRODUCTOS ---
    elseif ($action === 'get_products') {
        $sql = "SELECT * FROM refacciones WHERE stock > 0";
        $result = $conn->query($sql);
        $productos = array();
        if ($result) {
            while($row = $result->fetch_assoc()) {
                $productos[] = $row;
            }
            $response['success'] = true;
            $response['products'] = $productos;
        } else {
            $response['message'] = 'Error al cargar productos.';
        }
    }

    // --- 6. CHECKOUT (CORREGIDO: SE ELIMINÓ EL UPDATE POR CONFLICTO CON TRIGGER) ---
    elseif ($action === 'checkout') {
        if (!isset($_SESSION['user_id'])) {
            $response['success'] = false;
            $response['message'] = 'Debes iniciar sesión.';
        } elseif (!isset($_POST['cart_data']) || !isset($_POST['total'])) {
            $response['message'] = 'Datos incompletos.';
        } else {
            $cart_data_raw = $_POST['cart_data'];
            $carrito_raw = is_array($cart_data_raw) ? $cart_data_raw : json_decode($cart_data_raw, true);

            if (empty($carrito_raw)) {
                $response['message'] = 'Carrito vacío.';
            } else {
                // 1. DEDUPLICAR PRODUCTOS
                $carrito = [];
                foreach ($carrito_raw as $item) {
                    $sku = $item['sku'];
                    if (isset($carrito[$sku])) {
                        $carrito[$sku]['quantity'] += intval($item['quantity']);
                    } else {
                        $carrito[$sku] = $item;
                    }
                }

                $total = $_POST['total'];
                $usuario_id = $_SESSION['user_id'];

                $conn->begin_transaction();
                $errores = false;

                // 2. Crear Venta
                $stmt = $conn->prepare("INSERT INTO ventas (usuario_id, total) VALUES (?, ?)");
                $stmt->bind_param("id", $usuario_id, $total);

                if ($stmt->execute()) {
                    $venta_id = $conn->insert_id;

                    // 3. Preparar consultas
                    // OJO: Seleccionamos también el STOCK para verificar antes de vender
                    $stmt_check_stock = $conn->prepare("SELECT id, stock FROM refacciones WHERE sku = ? LIMIT 1");
                    $stmt_insert = $conn->prepare("INSERT INTO detalle_ventas (venta_id, refaccion_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");

                    // Variables para bind
                    $sku_param = "";
                    $stmt_check_stock->bind_param("s", $sku_param);

                    $p_venta_id = $venta_id; $p_ref_id = 0; $p_cant = 0; $p_precio = 0.0;
                    $stmt_insert->bind_param("iiid", $p_venta_id, $p_ref_id, $p_cant, $p_precio);

                    foreach ($carrito as $item) {
                        $sku_param = $item['sku'];
                        $cantidad_deseada = intval($item['quantity']);

                        // A. Verificar existencia y stock
                        $stmt_check_stock->execute();
                        $res_check = $stmt_check_stock->get_result();

                        if ($row_prod = $res_check->fetch_assoc()) {
                            $refaccion_id = $row_prod['id'];
                            $stock_actual = intval($row_prod['stock']);

                            // Validar stock disponible
                            if ($stock_actual < $cantidad_deseada) {
                                $errores = true;
                                $response['message'] = "Stock insuficiente para el producto SKU: $sku_param. Disponible: $stock_actual";
                                break;
                            }

                            // B. Insertar detalle (EL TRIGGER DE LA BD RESTARÁ EL STOCK AUTOMÁTICAMENTE)
                            $p_ref_id = $refaccion_id;
                            $p_cant = $cantidad_deseada;
                            $p_precio = floatval($item['price']);

                            if (!$stmt_insert->execute()) {
                                $errores = true;
                                break;
                            }

                            // *** AQUÍ ELIMINAMOS EL UPDATE MANUAL DE PHP ***
                            // El trabajo de resta lo hace el trigger `restar_stock_tras_venta`

                        } else {
                            $errores = true;
                            $response['message'] = "SKU desconocido: " . htmlspecialchars($sku_param);
                            break;
                        }
                    }

                    if (!$errores) {
                        $conn->commit();
                        $response['success'] = true;
                        $response['message'] = '¡Compra realizada con éxito!';
                    } else {
                        $conn->rollback();
                        if ($response['message'] === 'Error desconocido.') $response['message'] = 'Error al procesar los detalles.';
                    }

                } else {
                    $conn->rollback();
                    $response['message'] = 'Error al crear la venta.';
                }
            }
        }
    }

    // --- 7. VEHÍCULOS ---
    elseif ($action === 'get_vehicles') {
        $sql = "SELECT v.*, m.nombre as modelo, ma.nombre as marca 
                FROM vehiculos v 
                JOIN modelos m ON v.modelo_id = m.id 
                JOIN marcas ma ON m.marca_id = ma.id 
                WHERE v.disponible = 1";
        $result = $conn->query($sql);
        $vehiculos = array();
        if ($result) {
            while($row = $result->fetch_assoc()) {
                if(isset($row['version'])) $row['modelo'] .= ' ' . $row['version'];
                $vehiculos[] = $row;
            }
            $response['success'] = true;
            $response['vehicles'] = $vehiculos;
        } else {
            $response['message'] = 'Error BD: ' . $conn->error;
        }
    } else {
        $response['message'] = 'Acción inválida.';
    }

} else {
    $response['message'] = 'Sin acción.';
}

echo json_encode($response);
?>