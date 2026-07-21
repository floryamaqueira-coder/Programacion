//Utilizar "comentarios" para explicación de funciones y códigos

const contenedorDias = document.getElementById("dias-contenedor");
const textoMesAño = document.getElementById("mes-año");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

let fechaActual = new Date();

function renderizarCalendario() {   
    contenedorDias.innerHTML = "";

    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    textoMesAño.textContent = `${meses[mes]} ${año}`;

    const primerDiaIndex = new Date(año, mes, 1).getDay();
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    
    const hoyReal = new Date(); 

    for (let i = 0; i < primerDiaIndex; i++) {
        const divVacio = document.createElement("div");
        divVacio.classList.add("dia", "vacio");
        contenedorDias.appendChild(divVacio);
    }

    for (let dia = 1; dia <= ultimoDia; dia++) {
        const divDia = document.createElement("div");
        divDia.classList.add("dia");
        divDia.textContent = dia;

        if (
            dia === hoyReal.getDate() &&
            mes === hoyReal.getMonth() &&
            año === hoyReal.getFullYear()
        ) {
            divDia.classList.add("hoy");
        }

        contenedorDias.appendChild(divDia);
    }
}

btnPrev.addEventListener("click", () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    renderizarCalendario();
});

btnNext.addEventListener("click", () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    renderizarCalendario();
});

renderizarCalendario();