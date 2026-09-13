-- ============================================================
-- Tabla "usuario"
-- Coincide con las columnas usadas en:
--   - apps/models/usuarios.php (registrarUsuario, obtenerUsuarioPorEmail, verificarLogin)
--   - apps/controllers/usuarioControllers.php
--   - apps/controllers/loginController.php
-- ============================================================

CREATE TABLE usuario (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)        NOT NULL,
    apellido        VARCHAR(100)        NOT NULL,
    email           VARCHAR(150)        NOT NULL,
    contrasena      VARCHAR(255)        NOT NULL,   -- guarda el hash de password_hash(), no la contraseña en texto plano
    rol             VARCHAR(50)         NOT NULL DEFAULT 'participante',
    fecha_registro  DATE                NOT NULL,

    -- Evita emails duplicados. Es lo que provoca el error
    -- PDOException código 23000 que ya manejás en el controller
    -- ("Este correo ya está registrado.")
    UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
