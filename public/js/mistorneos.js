document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionar todos los botones de pestañas y las secciones 
    const botonesTabs = document.querySelectorAll('.tab-btn');
    const contenidosTabs = document.querySelectorAll('.tab-content');

    // 2. Agregar el evento de clic a cada botón
    botonesTabs.forEach(boton => {
        boton.addEventListener('click', () => {
            // Obtener el ID de la pestaña que se quiere activar (data-tab="participando" o "creados")
            const targetTabId = boton.getAttribute('data-tab');

            // Quitar la clase 'activo' de todos los botones
            botonesTabs.forEach(btn => btn.classList.remove('activo'));

            // Ocultar todas las secciones de las pestañas
            contenidosTabs.forEach(contenido => contenido.classList.remove('activo'));

            // Activar el botón al que se le dio clic
            boton.classList.add('activo');

            // Mostrar la sección correspondiente
            const seccionAActivar = document.getElementById(targetTabId);
            if (seccionAActivar) {
                seccionAActivar.classList.add('activo');
            }
        });
    });
});