-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generacion: 21-11-2025 a las 06:45:18
-- Version del servidor: 10.4.32-MariaDB
-- Version de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gearsteed`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ventas`
--

CREATE TABLE `detalle_ventas` (
  `id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `refaccion_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_ventas`
--

INSERT INTO `detalle_ventas` (`id`, `venta_id`, `refaccion_id`, `cantidad`, `precio_unitario`) VALUES
(7, 7, 1, 1, 1299.99),
(8, 7, 2, 1, 2499.99),
(9, 7, 3, 1, 189.99),
(10, 8, 3, 4, 189.99);

--
-- Disparadores `detalle_ventas`
--
DELIMITER $$
CREATE TRIGGER `restar_stock_tras_venta` AFTER INSERT ON `detalle_ventas` FOR EACH ROW BEGIN
    UPDATE refacciones 
    SET stock = stock - NEW.cantidad 
    WHERE id = NEW.refaccion_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcas`
--

CREATE TABLE `marcas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `marcas`
--

INSERT INTO `marcas` (`id`, `nombre`) VALUES
(6, 'BMW'),
(2, 'Chevrolet'),
(4, 'Dodge'),
(1, 'Ford'),
(3, 'Honda'),
(5, 'Jeep');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_contacto`
--

CREATE TABLE `mensajes_contacto` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `interes` varchar(50) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensajes_contacto`
--

INSERT INTO `mensajes_contacto` (`id`, `nombre`, `email`, `telefono`, `interes`, `mensaje`, `fecha_registro`) VALUES
(1, 'emilio cayetanozz', 'elgoat@hotmail.com', '9612999999', 'compra', 'esto es una prueba de conexion\r\n', '2025-11-20 14:40:40'),
(2, 'EMI HEE', 'emilioelgoat@hotmail.com', '9612999999', 'compra', 'tal vez si funcione', '2025-11-20 14:41:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modelos`
--

CREATE TABLE `modelos` (
  `id` int(11) NOT NULL,
  `marca_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modelos`
--

INSERT INTO `modelos` (`id`, `marca_id`, `nombre`) VALUES
(1, 1, 'F-150'),
(2, 2, 'Silverado 1500'),
(3, 3, 'Accord'),
(4, 4, 'Challenger'),
(5, 5, 'Wrangler'),
(6, 6, 'X3');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `refacciones`
--

CREATE TABLE `refacciones` (
  `id` int(11) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `imagen` varchar(255) DEFAULT 'img/placeholder.jpg',
  `modelos_compatibles` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `refacciones`
--
-- Rutas corregidas a formato .PNG y nombres sin acentos
INSERT INTO `refacciones` (`id`, `sku`, `nombre`, `categoria`, `precio`, `stock`, `imagen`, `modelos_compatibles`) VALUES
(1, 'AM-001', 'Amortiguador Monroe', 'Suspension', 1299.99, 14, 'img/Amortiguador.png', 'Ford F-150, Jeep Wrangler, Toyota Hilux'),
(2, 'BC-002', 'Bomba de Combustible', 'Motor', 2499.99, 7, 'img/BombaCombustible.png', 'Nissan Sentra, Toyota Corolla'),
(3, 'FO-003', 'Filtro de Aceite Premium', 'Motor', 189.99, 45, 'img/FiltroAceite.png', 'Universal, Toyota Corolla, Honda Civic'),
(4, 'KC-004', 'Kit de Clutch LuK', 'Transmision', 3899.99, 6, 'img/KitClutch.png', 'Honda Civic, Toyota Corolla'),
(5, 'PF-005', 'Pastillas de Freno Brembo', 'Frenos', 899.99, 25, 'img/PastillasFreno.png', 'BMW 3 Series, Toyota Camry'),
(6, 'BI-006', 'Bujias de Iridio (Set 4 pzs)', 'Motor', 699.99, 40, 'img/BujiasIridio.png', 'Universal'),
(7, 'DF-007', 'Discos de Freno Ventilados', 'Frenos', 1599.99, 18, 'img/DiscosFreno.png', 'Ford, Chevrolet, Toyota'),
(8, 'BT-008', 'Bateria 12V 60Ah', 'Electrico', 1899.99, 30, 'img/Bateria.png', 'Universal'),
(9, 'RA-009', 'Radiador de Aluminio', 'Motor', 2199.99, 12, 'img/RadiadorAluminio.png', 'Universal fit');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','cliente') DEFAULT 'cliente',
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `telefono`, `password`, `rol`, `fecha_registro`) VALUES
(1, 'emilio cayetano', 'hee', 'emilioelgoat@hotmail.com', '9612167158', '$2y$10$.H/8bcVRyNYO3GWYK58.auZtKIPA//TB78XJQ2bNdL7d53HQHDN9O', 'cliente', '2025-11-20 15:31:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `id` int(11) NOT NULL,
  `modelo_id` int(11) NOT NULL,
  `version` varchar(100) DEFAULT NULL,
  `anio` int(11) NOT NULL,
  `precio` decimal(12,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 1,
  `tipo` varchar(50) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `kilometraje` int(11) DEFAULT 0,
  `transmision` varchar(50) DEFAULT NULL,
  `motor` varchar(100) DEFAULT NULL,
  `combustible` varchar(50) DEFAULT NULL,
  `caracteristicas` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT 'img/placeholder_car.jpg',
  `disponible` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`id`, `modelo_id`, `version`, `anio`, `precio`, `stock`, `tipo`, `estado`, `kilometraje`, `transmision`, `motor`, `combustible`, `caracteristicas`, `imagen`, `disponible`) VALUES
(1, 1, 'Raptor', 2024, 65000.00, 3, 'pickup', 'nuevo', 0, 'Automatica', 'V6 3.5L Turbo', 'Gasolina', '4x4, Off Road', 'img/Ford%20F-150%20Raptor.png', 1),
(2, 2, 'LT', 2022, 38500.00, 1, 'pickup', 'usado', 35000, 'Automatica', 'V8 5.3L', 'Gasolina', '4x4, Crew Cab', 'img/Chevrolet%20Silverado%201500.png', 1),
(3, 3, 'Sport', 2024, 29800.00, 5, 'sedan', 'nuevo', 0, 'CVT', '4 Cil 1.5L Turbo', 'Gasolina', 'Sport, Sensing', 'img/Honda%20Accord%20Sport%202024.png', 1),
(4, 4, 'R/T', 2023, 42900.00, 2, 'deportivo', 'usado', 18500, 'Manual', 'V8 5.7L HEMI', 'Gasolina', 'RWD, Performance', 'img/Dodge%20Challenger%20RT.png', 1),
(5, 5, 'Sahara', 2022, 45900.00, 4, 'suv', 'usado', 28700, 'Automatica', 'V6 3.6L', 'Gasolina', '4x4, Removible', 'img/Jeep%20Wrangler%20Sahara%204x4.png', 1),
(6, 6, 'sDrive30i', 2024, 55800.00, 2, 'suv', 'nuevo', 0, 'Automatica', '4 Cil 2.0L Turbo', 'Gasolina', 'Premium, xDrive', 'img/BMW X3 sDrive30i.png', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL,
  `estado` enum('completado','pendiente','cancelado') DEFAULT 'completado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `usuario_id`, `fecha`, `total`, `estado`) VALUES
(1, 1, '2025-11-20 17:52:05', 4628.37, 'completado'),
(2, 1, '2025-11-20 17:52:13', 4628.37, 'completado'),
(3, 1, '2025-11-20 17:52:21', 4628.37, 'completado'),
(4, 1, '2025-11-20 17:53:55', 4628.37, 'completado'),
(5, 1, '2025-11-20 17:54:22', 4628.37, 'completado'),
(6, 1, '2025-11-20 17:55:13', 4628.37, 'completado'),
(7, 1, '2025-11-20 17:56:56', 4628.37, 'completado'),
(8, 1, '2025-11-20 22:06:35', 1031.55, 'completado');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venta_id` (`venta_id`),
  ADD KEY `refaccion_id` (`refaccion_id`);

--
-- Indices de la tabla `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `marca_id` (`marca_id`);

--
-- Indices de la tabla `refacciones`
--
ALTER TABLE `refacciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `modelo_id` (`modelo_id`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `modelos`
--
ALTER TABLE `modelos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `refacciones`
--
ALTER TABLE `refacciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`),
  ADD CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`refaccion_id`) REFERENCES `refacciones` (`id`);

--
-- Filtros para la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD CONSTRAINT `modelos_ibfk_1` FOREIGN KEY (`marca_id`) REFERENCES `marcas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`modelo_id`) REFERENCES `modelos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;