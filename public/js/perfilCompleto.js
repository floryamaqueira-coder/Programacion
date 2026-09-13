document.addEventListener('DOMContentLoaded', () => {
    const btnConfig = document.getElementById('btn-config');
    const vistaConfiguracion = document.getElementById('vista-configuracion');
    const btnVolver = document.getElementById('btn-volver');
    
    const btnEditarNombre = document.getElementById('btn-editar-nombre');
    const vistaNuevoNombre = document.getElementById('vista-nuevoNombre');

    // Función para alternar modal de configuración
    const toggleModal = () => {
        if (vistaConfiguracion) {
            vistaConfiguracion.classList.toggle('vista-oculto');
        }
    };

    if (btnConfig) {
        btnConfig.addEventListener('click', (event) => { 
            event.stopPropagation(); 
            toggleModal();
        });
    }

    if (vistaConfiguracion) {
        vistaConfiguracion.addEventListener('click', (event) => {
            if (event.target === vistaConfiguracion) {
                toggleModal();
            }
        });
    }

    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            toggleModal();
        });
    }

    // Tecla Escape para cerrar modal
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && vistaConfiguracion && !vistaConfiguracion.classList.contains('vista-oculto')) {
            toggleModal();
        }
    });

    // Función para alternar la vista de Nuevo Nombre
    const toggleNuevoNombre = () => {
        if (vistaNuevoNombre) {
            vistaNuevoNombre.classList.toggle('vista-oculta-nuevoNombre');
        }
    };

    if (btnEditarNombre) {
        btnEditarNombre.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleNuevoNombre();
        });
    }
});