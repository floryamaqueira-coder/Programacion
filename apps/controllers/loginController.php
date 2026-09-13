<?php

// Iniciamos la sesión de PHP. Esto tiene que hacerse
// antes de imprimir cualquier cosa en la página, por eso
// va como primera línea del archivo.
//
// Gracias a esto podremos guardar datos del usuario
// (como su id o su nombre) para recordarlo entre
// distintas páginas mientras esté logueado.
session_start();

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

    // Obtenemos el correo electrónico enviado desde el formulario.
    $email = trim($_POST['email'] ?? '');

    // Obtenemos la contraseña.
    //
    // No usamos trim() porque no queremos modificar
    // lo que el usuario escribió como contraseña.
    $contrasena = $_POST['contrasena'] ?? '';


    // Comprobamos que ambos campos hayan sido completados.
    if (empty($email) || empty($contrasena)) {

        echo json_encode([
            'success' => false,
            'message' => 'Por favor, completa todos los campos.'
        ]);

        exit;
    }


    // Comprobamos que el correo tenga un formato válido.
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        echo json_encode([
            'success' => false,
            'message' => 'El formato del correo electrónico no es válido.'
        ]);

        exit;
    }


    // Utilizamos try para poder manejar posibles errores
    // de la base de datos.
    try {

        // Llamamos a la función verificarLogin().
        //
        // Esta función busca al usuario por su email
        // y compara la contraseña con password_verify().
        $usuario = verificarLogin($pdo, $email, $contrasena);

        // Comprobamos si las credenciales fueron correctas.
        if ($usuario) {

            // Guardamos los datos del usuario en la sesión.
            //
            // Esto nos permite saber, en cualquier otra página
            // PHP del proyecto, qué usuario inició sesión.
            $_SESSION['usuario_id']       = $usuario['id'];
            $_SESSION['usuario_nombre']   = $usuario['nombre'];
            $_SESSION['usuario_apellido'] = $usuario['apellido'];
            $_SESSION['usuario_email']    = $usuario['email'];
            $_SESSION['usuario_rol']      = $usuario['rol'];

            // Informamos a JavaScript que el inicio de sesión
            // se realizó correctamente.
            echo json_encode([
                'success' => true,
                'message' => 'Inicio de sesión exitoso.',
                'usuario' => [
                    'nombre'   => $usuario['nombre'],
                    'apellido' => $usuario['apellido'],
                    'email'    => $usuario['email'],
                    'rol'      => $usuario['rol']
                ]
            ]);

        } else {

            // Si el email no existe o la contraseña no coincide,
            // enviamos un mensaje de error.
            //
            // Por seguridad no indicamos cuál de los dos datos
            // está mal, solo que las credenciales son incorrectas.
            echo json_encode([
                'success' => false,
                'message' => 'Correo o contraseña incorrectos.'
            ]);
        }


    // Capturamos errores relacionados con PDO
    // y la base de datos.
    } catch (PDOException $e) {

        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage()
        ]);
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
