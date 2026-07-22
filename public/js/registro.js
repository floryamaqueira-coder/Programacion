 function validarPassword(){
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirm-password");

        if (password.value !== confirmPassword.value){
            // Si el valor de "CONTRASEÑA" es diferente a el valor de "CONFIRMACIÓN DE CONTRASEÑA":
            confirmPassword.setCustomValidity("Las contraseñas no coinciden.");
        }else {
            //Si coinciden, no se envía el error
            confirmPassword.setCustomValidity("");
            //setCustomValidity(): Es utilizado para crear mensajes de error en formularios html.
        }
        }