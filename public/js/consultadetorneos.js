document.addEventListener('DOMContentLoaded', () => {
    const inputBusqueda = document.getElementById('input-busqueda');
    const selectDeporte = document.getElementById('select-deporte');
    const selectCriterio = document.getElementById('select-criterio');
    const tagsFiltro = document.querySelectorAll('.tag-filtro');
    const tarjetasTorneo = document.querySelectorAll('.tarjeta-torneo');
    const mensajeSinResultados = document.getElementById('sin-resultados');

    let deporteSeleccionado = 'todos';

    // 1. Evento de escritura en la barra de texto
    inputBusqueda.addEventListener('input', () => {
        filtrarTorneos();
    });

    // 2. Evento al cambiar el <select> de deportes
    selectDeporte.addEventListener('change', (e) => {
        deporteSeleccionado = e.target.value;
        
        if (deporteSeleccionado === 'otro') {
            activarModoOtro();
        } else {
            desactivarModoOtro();
        }

        sincronizarEtiquetasVisuales(deporteSeleccionado);
        filtrarTorneos();
    });

    // 3. Evento al cambiar el criterio (Todo, Deporte, Nombre)
    selectCriterio.addEventListener('change', () => {
        filtrarTorneos();
    });

    // 4. Evento al hacer clic en las etiquetas
    tagsFiltro.forEach(tag => {
        tag.addEventListener('click', () => {
            deporteSeleccionado = tag.getAttribute('data-deporte');
            selectDeporte.value = deporteSeleccionado;

            if (deporteSeleccionado === 'otro') {
                activarModoOtro();
            } else {
                desactivarModoOtro();
            }

            sincronizarEtiquetasVisuales(deporteSeleccionado);
            filtrarTorneos();
        });
    });

    // Función para activar el enfoque de texto personalizado
    function activarModoOtro() {
        inputBusqueda.placeholder = "Escribe el deporte que buscas (ej: Handball, Vóley)...";
        inputBusqueda.classList.add('modo-otro');
        inputBusqueda.focus();
    }

    function desactivarModoOtro() {
        inputBusqueda.placeholder = "Escribe un deporte o nombre de torneo...";
        inputBusqueda.classList.remove('modo-otro');
    }

    // Marca visualmente la etiqueta activa
    function sincronizarEtiquetasVisuales(deporte) {
        tagsFiltro.forEach(t => {
            if (t.getAttribute('data-deporte') === deporte) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });
    }

    // Función Principal de Filtrado Dinámico
    function filtrarTorneos() {
        const textoEscrito = inputBusqueda.value.toLowerCase().trim();
        const criterio = selectCriterio.value;
        let visibles = 0;

        tarjetasTorneo.forEach(tarjeta => {
            const deporteTarjeta = (tarjeta.getAttribute('data-deporte') || '').toLowerCase();
            const nombreTarjeta = (tarjeta.getAttribute('data-nombre') || '').toLowerCase();

            let coincide = false;

            // Si se eligió la opción "Otro" o la opción "Todos" con texto escrito
            if (deporteSeleccionado === 'otro') {
                // En modo "Otro", busca directamente si el deporte o nombre de la tarjeta coincide con lo que la persona tipeó
                coincide = deporteTarjeta.includes(textoEscrito) || nombreTarjeta.includes(textoEscrito);
            } 
            else if (deporteSeleccionado === 'todos') {
                // Búsqueda general
                if (criterio === 'deporte') {
                    coincide = deporteTarjeta.includes(textoEscrito);
                } else if (criterio === 'nombre') {
                    coincide = nombreTarjeta.includes(textoEscrito);
                } else {
                    coincide = deporteTarjeta.includes(textoEscrito) || nombreTarjeta.includes(textoEscrito);
                }
            } 
            else {
                // Deporte seleccionado desde las etiquetas/select estándar
                const coincideDeporteBase = (deporteTarjeta === deporteSeleccionado);
                const coincideTexto = deporteTarjeta.includes(textoEscrito) || nombreTarjeta.includes(textoEscrito);
                
                coincide = coincideDeporteBase && coincideTexto;
            }

            if (coincide) {
                tarjeta.style.display = 'flex';
                visibles++;
            } else {
                tarjeta.style.display = 'none';
            }
        });

        // Mostrar o esconder el aviso si no hay coincidencias
        mensajeSinResultados.style.display = (visibles === 0) ? 'block' : 'none';
    }
});