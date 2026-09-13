<?php

// Dirección donde está funcionando el servidor de MySQL.
// "localhost" significa que la base de datos está
// en el mismo equipo donde está ejecutándose PHP.
$host = 'localhost';


// Nombre de la base de datos a la que queremos conectarnos.
$dbname = 'vyse';


// Usuario utilizado para conectarse a MySQL.
$username = 'root';


// Contraseña del usuario de MySQL.
//
// En XAMPP, por defecto, el usuario "root" no tiene
// contraseña configurada.
$password = '';


try {

    // Creamos una nueva conexión con la base de datos
    // utilizando PDO.
    //
    // mysql:       indica que utilizaremos MySQL.
    // host=$host:  indica dónde está el servidor.
    // dbname:      indica qué base de datos utilizaremos.
    // charset:     indica la codificación de los textos.
    //
    // $username y $password son las credenciales
    // necesarias para conectarse.
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );


    // Configuramos PDO para que lance una excepción
    // cuando ocurra un error en la base de datos.
    //
    // Esto permite detectar los errores utilizando
    // try/catch en otros archivos.
    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );


    // Indicamos que cuando obtengamos información
    // de la base de datos, queremos recibirla como
    // un array asociativo.
    //
    // Por ejemplo:
    //
    // [
    //     'id' => 1,
    //     'nombre' => 'Juan'
    // ]
    $pdo->setAttribute(
        PDO::ATTR_DEFAULT_FETCH_MODE,
        PDO::FETCH_ASSOC
    );


} catch (PDOException $e) {

    // Si ocurre un error al intentar conectarnos
    // con la base de datos, mostramos un mensaje
    // en formato JSON.
    //
    // die() detiene completamente la ejecución
    // del programa.
    die(json_encode([
        "success" => false,
        "message" => "Error de conexión: " . $e->getMessage()
    ]));
}

?>