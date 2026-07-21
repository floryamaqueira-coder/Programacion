// Inicia la lógica del script y declaramos variables principales
    document.addEventListener("DOMContentLoaded", () => { //"Escucha eventos"--> Espera a que todo el HTML
    //se cargue para ejecutar luego JS
        let currentStep = 1;
        const totalSteps = 4; 

        const btnNext = document.getElementById("btnNext"); //getElementById: Busca y selecciona un único elemento HTML
        const btnPrev = document.getElementById("btnPrev");
        const modalidadSelect = document.getElementById("modalidadTorneo");

        // Alternar campos según Modalidad (Equipo o Individual)
        modalidadSelect.addEventListener("change", toggleModalidadFields);

        function toggleModalidadFields() {
            //const: Variable cuyo valor no será reasignado/modificado
            const modo = modalidadSelect.value;
            const equipoFields = document.querySelectorAll(".mode-equipo");
            const individualFields = document.querySelectorAll(".mode-individual");
            //querySelectorAll: Sirve para buscar y seleccionar TODOS los elementos HTML de la página que coincidan con 
            //el selector CSS indicado. 
            //getElementByID: Solamente un elemento
            //querySelectorAll: Devuelve un grupo completo de elementos

            // Cambiado a "equipos" para coincidir con el <option value="equipos"> del HTML
            if (modo === "equipos") {
                equipoFields.forEach(el => el.classList.remove("is-hidden"));
            // Hace visibles los campos del formulario del HTML que ocultamos de equipos
                individualFields.forEach(el => el.classList.add("is-hidden"));
            // Hace visibles los campos del formulario del HTML que ocultamos de individual
            } else {
                equipoFields.forEach(el => el.classList.add("is-hidden"));
            // Mantiene ocultos los campos del formulario del HTML de equipos
                individualFields.forEach(el => el.classList.remove("is-hidden"));
            // Mantiene ocultos los campos del formulario del HTML de individual
            }
        }

        // Marcar y desmarcar botones de días de la semana
        document.querySelectorAll(".day-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("selected");
            });
        });

        // Avance de paso a paso
        btnNext.addEventListener("click", () => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepView(); // Con esto actualizamos la interfaz gráfica y la pantalla cada que el usuario
                //avanza o retrocede en el formulario
            } else {
                const isConfirmed = document.getElementById("confirmCheck").checked; //Checked: Propiedad que
                // indica si un elemento de opción está seleccionado o no
                if (isConfirmed) {
                    alert("¡Torneo creado exitosamente!");
                    // document.getElementById("torneoForm").submit();
                } else {
                    alert("Debes confirmar que los datos ingresados son correctos.");
                }
            }
        });

        // Retroceso de paso
        btnPrev.addEventListener("click", () => {
            if (currentStep > 1) {
                currentStep--;
                updateStepView();
            }
        });

        function updateStepView() {
            // Ocultar/Mostrar secciones
            document.querySelectorAll(".form-step").forEach(step => step.classList.remove("active"));
            document.getElementById(`step-${currentStep}`).classList.add("active");

            // Actualizar números del Stepper
            document.querySelectorAll(".step-item").forEach(item => {
                const stepNum = parseInt(item.getAttribute("data-step")); //parseInt(): función de JS
                //que convierte texto en un número entero.
                //getAttribute(): Sirve para leer el valor de cualquier atributo HTML que tenga etiqueta
                // (src, href, id, class, type, data-step, ...)
                if (stepNum <= currentStep) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });

            // Visibilidad botón Atrás
            btnPrev.style.display = currentStep === 1 ? "none" : "block";
            //btnPrev.style.display = Accede a CSS del botón atrás para modificar cómo se muestra en pantalla
            // currentStep === 1 : Evalúa si el usuario realmente se encuentra en el primer paso

            // ? "none" Si la condición es VERDADERA, display=none Esto oculta el botón 
            // por completo de la pantalla, ya que no tiene sentido permitirle 
            // retroceder si recién está en el inicio.

            // : block Si la condición es FALSA y el usuario está en los pasos 2, 3 o 4 asigna display = "block"
            // haciendo así visible el botón de retroceder

            // Texto del botón Siguiente / Crear
            if (currentStep === totalSteps) {
                btnNext.textContent = "Crear Torneo";
                populateSummary(); // recopia datos ingresados en el formulario y los escribe en pantalla
            } else {
                btnNext.textContent = "Siguiente";
            }
        }

        // Llenar tarjeta de resumen dinámicamente
        function populateSummary() {
            const modo = modalidadSelect.value;

            // Nombre
            document.getElementById("resNombre").textContent = document.getElementById("nombreTorneo").value || "Sin especificar";
            
            // Deporte, Categoría y Modalidad
            const deporte = document.getElementById("deporteSelec").value || "Sin especificar";
            const cat = document.getElementById("categoria").value;
            const txtModo = modo === "equipos" ? "En Equipo" : "Individual";
            document.getElementById("resDeporteCat").textContent = `${deporte} - ${cat} (${txtModo})`;
            //document.getElementById("resDeporteCat") = Busca en tu HTML la etiqueta donde 
            // quieres mostrar este dato.

            //.textContent = ... Le indica a JavaScript 
            // que reemplace todo el texto que haya dentro de esa etiqueta por el 
            // nuevo valor formateado.

            //Las comillas invertidas (``) y ${} Permiten intercalar variables de 
            // JavaScript dentro de un texto sin tener que estar sumando cadenas con el signo
            // Le indica que es una variable a evaluar y no solamente texto

            // Formato y Participantes según la modalidad
            const formato = document.getElementById("formatoTorneo").value; //.value = Propiedad para obtener o cambiar
            // el texto o dato ingresado dentro de un elemento de formulario de nuestro HTML
            let participantesText = "";
            // let : Palabra clave para declarar variables cuyos valores serán modificados o reasignados
            if (modo === "equipos") {
                const equipos = document.getElementById("equiposPart").value;
                const jugXEquipo = document.getElementById("jugadoresPorEquipo").value || "N/A";
                participantesText = `${formato} (${equipos} equipos, ${jugXEquipo} titulares por equipo)`;
            } else {
                const jugadores = document.getElementById("jugadoresPart").value;
                participantesText = `${formato} (${jugadores} jugadores)`;
            }
            document.getElementById("resFormatoEquipos").textContent = participantesText;

            // Fechas
            const fInicio = document.getElementById("fechaInicio").value;
            const fFin = document.getElementById("fechaFin").value;
            document.getElementById("resFechas").textContent = fInicio && fFin ? `${fInicio} al ${fFin}` : "No definidas";

            // Horarios y Días
            const hIn = document.getElementById("horaInicio").value;
            const hFin = document.getElementById("horaFin").value;
            const dias = Array.from(document.querySelectorAll(".day-btn.selected")).map(b => b.textContent).join(", ");
            document.getElementById("resHorarios").textContent = `${hIn} - ${hFin} hs (${dias || 'Ninguno'})`;
        }

        // Ejecución inicial para sincronizar vista con opción por defecto
        toggleModalidadFields(); // Revisa qué modalidad eligió el usuario en el desplegable (Equipo o individual)
    });