const datosTorneos = {
            "copa-montevideo": {
                participo: true,
                equipos: [
                    { nombre: "La Toronja Mecánica", capitan: "Christian Ruffa", pj: 5, pg: 4, pe: 1, pp: 0, gf: 12, gc: 3, dif: "+9", pts: 13, esMiEquipo: true },
                    { nombre: "Nacional", capitan: "Mateo Silva", pj: 5, pg: 3, pe: 1, pp: 1, gf: 10, gc: 5, dif: "+5", pts: 10, esMiEquipo: false },
                    { nombre: "Gladiadores", capitan: "Agustín Fernández", pj: 5, pg: 2, pe: 2, pp: 1, gf: 8, gc: 6, dif: "+2", pts: 8, esMiEquipo: false },
                    { nombre: "Haikyu", capitan: "Santiago Gómez", pj: 5, pg: 1, pe: 1, pp: 3, gf: 4, gc: 9, dif: "-5", pts: 4, esMiEquipo: false },
                    { nombre: "Barrio Sur FC", capitan: "Bruno Castro", pj: 5, pg: 0, pe: 1, pp: 4, gf: 2, gc: 13, dif: "-11", pts: 1, esMiEquipo: false }
                ]
            },
            "liga-futsal": {
                participo: true,
                equipos: [
                    { nombre: "La Toronja Mecánica", capitan: "Joaquín Pereyra", pj: 4, pg: 3, pe: 1, pp: 0, gf: 14, gc: 6, dif: "+8", pts: 10, esMiEquipo: true },
                    { nombre: "Taka Taka", capitan: "Enzo Morales", pj: 4, pg: 2, pe: 1, pp: 1, gf: 9, gc: 7, dif: "+2", pts: 7, esMiEquipo: false },
                    { nombre: "Los Magos", capitan: "Ignacio Méndez", pj: 4, pg: 1, pe: 0, pp: 3, gf: 5, gc: 11, dif: "-6", pts: 3, esMiEquipo: false }
                ]
            },
            "torneo-handball": {
                participo: false, // En este no participas
                equipos: [
                    { nombre: "Vikingos", capitan: "Facundo Torres", pj: 6, pg: 5, pe: 1, pp: 0, gf: 20, gc: 8, dif: "+12", pts: 16, esMiEquipo: false },
                    { nombre: "Titanes", capitan: "Rodrigo Olivera", pj: 6, pg: 3, pe: 1, pp: 2, gf: 15, gc: 12, dif: "+3", pts: 10, esMiEquipo: false }
                ]
            }
        };

        const selectTorneo = document.getElementById('select-torneo');
        const checkboxMisTorneos = document.getElementById('filtro-mis-torneos');
        const bodyRanking = document.getElementById('body-ranking');

        function renderizarTabla() {
            const torneoSeleccionado = selectTorneo.value;
            const soloMisTorneos = checkboxMisTorneos.checked;
            const torneoData = datosTorneos[torneoSeleccionado];

            bodyRanking.innerHTML = "";

            if (soloMisTorneos && !torneoData.participo) {
                bodyRanking.innerHTML = `
                    <tr>
                        <td colspan="10" style="padding: 30px; color: #9ca3af; text-align: center;">
                            No estás participando en este torneo. 
                            <br><small>Desmarca la casilla para ver la tabla completa.</small>
                        </td>
                    </tr>`;
                return;
            }

            torneoData.equipos.forEach((eq, index) => {
                const fila = document.createElement('tr');
                if (eq.esMiEquipo) fila.classList.add('mi-equipo');

                let posClase = 'posicion';
                if (index === 0) posClase += ' pos-1';
                else if (index === 1) posClase += ' pos-2';
                else if (index === 2) posClase += ' pos-3';

                fila.innerHTML = `
                    <td><span class="${posClase}">${index + 1}</span></td>
                    <td class="col-equipo">
                        ${eq.nombre}
                        <br><small style="color: #64748b;">Cap: ${eq.capitan}</small>
                    </td>
                    <td>${eq.pj}</td>
                    <td>${eq.pg}</td>
                    <td>${eq.pe}</td>
                    <td>${eq.pp}</td>
                    <td>${eq.gf}</td>
                    <td>${eq.gc}</td>
                    <td>${eq.dif}</td>
                    <td class="col-pts">${eq.pts}</td>
                `;

                bodyRanking.appendChild(fila);
            });
        }

        selectTorneo.addEventListener('change', renderizarTabla);
        checkboxMisTorneos.addEventListener('change', renderizarTabla);

        renderizarTabla();