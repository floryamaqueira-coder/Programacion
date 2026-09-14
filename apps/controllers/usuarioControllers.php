<?php

// Indicamos que este archivo va a devolver
// las respuestas en formato JSON.
header('Content-Type: application/json');


// Incluimos el archivo que contiene la conexión
// con la base de datos.
require_once __DIR__ . '/../database/conexion.php';


// Incluimos el modelo de usuarios, que contiene
// las funciones relacionadas con los usuarios.
require_once __DIR__ . '/../models/usuarios.php';


// Comprobamos que la petición que llegó al servidor
// utiliza el método POST.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Obtenemos el nombre enviado desde el formulario.
    // trim() elimina espacios innecesarios al principio
    // y al final del texto.
    //
    // Si no existe "nombre", utilizamos una cadena vacía.
    $nombre = trim($_POST['nombre'] ?? '');


    // Obtenemos el apellido enviado desde el formulario.
    $apellido = trim($_POST['apellido'] ?? '');


    // Obtenemos el correo electrónico.
    $email = trim($_POST['email'] ?? '');


    // Obtenemos la contraseña.
    //
    // No usamos trim() porque no queremos modificar
    // lo que el usuario escribió como contraseña.
    $contrasena = $_POST['contrasena'] ?? '';


    // Obtenemos el rol del usuario.
    //
    // Si no se recibe ningún rol, se utiliza
    // "participante" como valor predeterminado.
    $rol = trim($_POST['rol'] ?? 'usuario');


    // Comprobamos que todos los campos obligatorios
    // hayan sido completados.
    if (
        empty($nombre) ||
        empty($apellido) ||
        empty($email) ||
        empty($contrasena)
    ) {

        // Enviamos un mensaje indicando que faltan datos.
        echo json_encode([
            'success' => false,
            'message' => 'Por favor, completa todos los campos.'
        ]);

        // Detenemos la ejecución del archivo.
        exit;
    }


    // Comprobamos que el correo tenga un formato válido.
    //
    // Por ejemplo:
    // usuario@gmail.com -> válido
    // usuario@gmail -> no válido
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        // Enviamos un mensaje indicando que
        // el correo no tiene un formato correcto.
        echo json_encode([
            'success' => false,
            'message' => 'El formato del correo electrónico no es válido.'
        ]);

        // Detenemos la ejecución.
        exit;
    }


    // Utilizamos try para intentar registrar
    // el usuario y poder manejar posibles errores
    // de la base de datos.
    try {

        // Llamamos a la función registrarUsuario().
        //
        // Esta función pertenece al modelo de usuarios
        // y se encarga de guardar los datos en la base de datos.
        //
        // Le pasamos:
        // - La conexión a la base de datos.
        // - Nombre.
        // - Apellido.
        // - Correo.
        // - Contraseña.
        // - Rol.
        $creado = registrarUsuario(
            $pdo,
            $nombre,
            $apellido,
            $email,
            $contrasena,
            $rol
        );


        // Comprobamos si el usuario fue creado correctamente.
        if ($creado) {

            // Informamos a JavaScript que el registro
            // se realizó correctamente.
            echo json_encode([
                'success' => true,
                'message' => 'Usuario registrado exitosamente.'
            ]);

        } else {

            // Si la función no pudo crear el usuario,
            // enviamos un mensaje de error.
            echo json_encode([
                'success' => false,
                'message' => 'No se pudo completar el registro.'
            ]);
        }


    // Capturamos errores relacionados con PDO
    // y la base de datos.
    } catch (PDOException $e) {

        // El código 23000 normalmente indica
        // un problema de integridad en la base de datos.
        //
        // En este caso se utiliza para detectar
        // que el correo ya está registrado.
        if ($e->getCode() == 23000) {

            // Informamos al usuario de que
            // ese correo ya existe.
            echo json_encode([
                'success' => false,
                'message' => 'Este correo ya está registrado.'
            ]);

        } else {

            // Si ocurre otro error de base de datos,
            // mostramos un mensaje indicando que ocurrió
            // un problema.
            echo json_encode([
                'success' => false,
                'message' => 'Error en la base de datos: ' . $e->getMessage()
            ]);
        }
    }


} else {

    // Si alguien intenta acceder a este controlador
    // utilizando un método diferente a POST,
    // rechazamos la petición.
    echo json_encode([
        'success' => false,
        'message' => 'Método de petición no permitido.'
    ]);
}

?>