<?php

require_once __DIR__ ."/../database/conexion.php";

function registrarUsuario($pdo, $nombre, $apellido, $email, $contrasena, $rol) {
    // Encriptar la contraseña
    $passHash = password_hash($contrasena, PASSWORD_BCRYPT);
    $fechaActual = date('Y-m-d');

    //valores que se van a la tabla que se elija 
    $sql = "INSERT INTO usuario (nombre, apellido, email, contrasena, rol, fecha_registro) 
            VALUES (:nombre, :apellido, :email, :contrasena, :rol, :fecha_registro)";

    $stmt = $pdo->prepare($sql);

    return $stmt->execute([
        ':nombre'         => $nombre,
        ':apellido'       => $apellido,
        ':email'          => $email,
        ':contrasena'     => $passHash,
        ':rol'            => $rol,
        ':fecha_registro' => $fechaActual
    ]);
}

// Obtiene todos los usuarios con email para verificar duplicados e iniciar sesión
function obtenerUsuarioPorEmail($pdo, $email) {
    $stmt = $pdo->prepare("SELECT id, nombre, apellido, email, contrasena, rol FROM usuario WHERE email = :email");
    $stmt->execute(['email' => $email]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Verifica las credenciales de un usuario para el inicio de sesión.
//
// Busca al usuario por su email y compara la contraseña ingresada
// con el hash guardado en la base de datos usando password_verify().
//
// Devuelve el array del usuario (sin la contraseña) si las
// credenciales son correctas, o false si el email no existe
// o la contraseña no coincide.
function verificarLogin($pdo, $email, $contrasena) {
    $usuario = obtenerUsuarioPorEmail($pdo, $email);

    // Si no existe un usuario con ese email.
    if (!$usuario) {
        return false;
    }

    // Comparamos la contraseña ingresada con el hash guardado.
    if (!password_verify($contrasena, $usuario['contrasena'])) {
        return false;
    }

    // Quitamos la contraseña antes de devolver los datos,
    // para no exponerla nunca fuera del modelo.
    unset($usuario['contrasena']);

    return $usuario;
}

?>