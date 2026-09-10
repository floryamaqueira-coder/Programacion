//Con esta función manejamos la visibilidad de los paneles de el aside y navegación ente módulos.
function toggleMenu() {
  document.getElementById('aside-menu').classList.toggle('abierta');
  document.getElementById('overlay-menu').classList.toggle('visible');
} 
//Basicamente, en mobile cuando desplegamos nuestro aside 'abierta' nuestra pantalla en mobile tomará un tono más oscuro ('overlay-menu') = 'visible'
//Utilizamos "toggle" para desplegar
 
//toggleMenu() Apertura
 
//overlay-menu capa oscura para mobile
 
//cerrarMenu() Cerramos el menu. Al utilizar "remove" eliminamos una o varias clases (como hidden si lo querés ver de esa forma o display:none;)
function cerrarMenu() {
  document.getElementById('aside-menu').classList.remove('abierta');
  document.getElementById('overlay-menu').classList.remove('visible');
}
 
//Entonces: .toggle() y .remove() son MÉTODOS de classList (propiedad que devuelve una colección de CSS en un elemento. Se utiliza para manipular clases con mayor facilidad y sin tener que llamar elemento por elemento.)
//La línea "document.getElementById('aside-menu').classList.toggle('abierta');" dice: Del elemento con el id 'aside-menu' toma su css y muéstralo si es seleccionado. En el caso de encontrarse activo, elimínalo.
 
function mostrarSeccion(id, link) {
  var secciones = document.querySelectorAll('.seccion');
  for (var i = 0; i < secciones.length; i++) {
    secciones[i].classList.remove('visible');
  }
 
//con la función mostrarSeccion(), utilizando el for, recorre todos los elementos de el aside y los oculta/elimina, por eso se utiliza classList.remove. Al darle un (id, link) hará visible solamente el módulo seleccionado.
 
  document.getElementById('sec-' + id).classList.add('visible'); //Acá construimos el selector 'sec-' + id y añadimos la clase .visible para que se muestre solamente el bloque seleccionado.
 
  var enlaces = document.querySelectorAll('.aside a');
  for (var i = 0; i < enlaces.length; i++) {
    enlaces[i].classList.remove('activo'); //Aquí recorre todos los enlaces del menú, les quita la clase 'activo' con .remove y se le asigna un enlace pulsado
  }
  link.classList.add('activo'); //enlace pulsado
 
  // Si entramos a Estadisticas, recalcular los numeros para que siempre se mantengan en tiempo real. Se actualizan al momento de acceder.
  if (id === 'estadisticas') {
    renderizarEstadisticas();
  }
 
  // En mobile, el menú se cierra al elegir una sección
  cerrarMenu();
}
 
// TORNEO
// Un array con perfiles de torneos inventados. Más adelante se pueden usar códgos como .length para saber cuántos torneos hay activos o .push() para agregar nuevos.
var torneos = [
  {
    id: 1,
    nombre: "Copa Verano 2026",
    modalidad: "equipos",
    deporte: "Fútbol",
    categoria: "Amateur",
    formato: "Fase de Grupos + Eliminatoria",
    cantidadEquipos: "16",
    jugadoresPorEquipo: 11,
    cantidadJugadores: "16",
    etiquetas: ["verano", "regional"],
    fechaInicio: "2026-01-10",
    fechaFin: "2026-02-15",
    diasPartidos: ["Sáb", "Dom"],
    horaInicio: "16:00",
    horaFin: "20:00",
    reglasGenerales: "Se juega con reglas FIFA estándar; partidos a dos tiempos de 45 minutos.",
    descripcion: "Torneo de fútbol de verano para clubes de la región.",
    equipos: ["Los Tigres", "Águilas FC", "Rayo Sur"],
    participantes: ["Juan Pérez", "Ana Gómez", "Marcos Díaz"],
    organizadores: ["María López", "Club Deportivo Central"],
    reglamento: ["Reglamento general Copa Verano 2026.pdf"]
  },
  {
    id: 2,
    nombre: "Liga Juvenil de Básquet",
    modalidad: "equipos",
    deporte: "Básquetbol",
    categoria: "Semi-Profesional",
    formato: "Todos contra todos (Liga)",
    cantidadEquipos: "8",
    jugadoresPorEquipo: 5,
    cantidadJugadores: "16",
    etiquetas: ["juvenil"],
    fechaInicio: "2026-03-01",
    fechaFin: "2026-05-30",
    diasPartidos: ["Mar", "Jue"],
    horaInicio: "18:00",
    horaFin: "21:00",
    reglasGenerales: "Partidos de 4 cuartos de 10 minutos según reglamento FIBA juvenil.",
    descripcion: "Liga para categorías juveniles sub-16 y sub-18.",
    equipos: ["Halcones", "Toros Norte"],
    participantes: ["Lucía Fernández", "Pedro Silva"],
    organizadores: ["Federación Juvenil"],
    reglamento: []
  }
];
 
var torneoActualId = null; 
 
 
function renderizarListaTorneos(filtro) {
  var contenedor = document.getElementById('lista-torneos');
  contenedor.innerHTML = ''; 
  
  //.innerHTML es una propiedad que usamos para leer o hacer modificaciones de TODO el contenido interno (texto y etiquetas del HTML) desde JS
  //Puede funcionar de dos formas (para que sepas a futuro): Si se le asigna una cadena de texto, borra todo lo que había dentro del elemento y le coloca lo nuevo.  
  //Si se le colocan etiquetas HTML, el navegador las interpreta y dibuja.
  //En nuestro caso usamos .innerHTML = ''; que realiza un vaciado de contenido. Principalmente para evitar datos duplicados al filtrar o actualizar.
  // Pero si utilizamos .innerHTML = '<h2>Texto texto</h2><p>Texto texto</p>'; le estamos insertando etiquetas HTML
 
 
// Aqui se compara filtro con el nombre del torneo y su etiqueta (t.etiquetas)
//si hay coincidencia, se crea el elemento div.torneo-item, con el cual se insertan los datos e incrusta el evento onclick para abrir la ventana detallada de dicho torneo.
//Básicamente, compara si el torneo seleccionado existe en el Array antes de proporcionar información más detallada 
  for (var i = 0; i < torneos.length; i++) {
    var t = torneos[i];
    var coincideNombre = t.nombre.toLowerCase().indexOf(filtro) !== -1;
    var coincideEtiqueta = false;
 
    for (var j = 0; j < t.etiquetas.length; j++) {
      if (t.etiquetas[j].toLowerCase().indexOf(filtro) !== -1) {
        coincideEtiqueta = true;
      }
    }
 
    if (filtro === '' || coincideNombre || coincideEtiqueta) {
      var item = document.createElement('div');
      item.className = 'torneo-item';
      item.setAttribute('data-id', t.id);
      item.onclick = function() {
        abrirTorneo(parseInt(this.getAttribute('data-id'))); //Acá se abre la vista detallada
      };
 
      //Estas líneas generan e insertan la tarjeta visual de cada torneo. Toma las etiqeutas y las transforma en HTML, ensambla la estructura y la muestra.
      var etiquetasHtml = ''; //Inicia la variable
      for (var k = 0; k < t.etiquetas.length; k++) { //Recorre el arreglo de etiquetas, por ejemplo ["verano", "regional"] En cada vuelta concatena un pedazo de HTML.
        etiquetasHtml += '<span class="etiqueta">' + t.etiquetas[k] + '</span>'; //si tiene 2 etiquetas (etiquetasHTML) termina siendo <span class="etiqueta">verano</span><span class="etiqueta">regional</span>
      }
 
      item.innerHTML = //Inyecta la estructura dentro de la etiqueta item (que es un <div>).
        '<div><strong>' + t.nombre + '</strong><br><small>' + t.deporte + '</small></div>' + //un primer bloque <div> con <strong> en el nombre y deporte en <small>.
        '<div>' + etiquetasHtml + '</div>'; //segundo bloque <div> que contiene las etiquetas que fueron procesadas arriba.
 
      contenedor.appendChild(item); //toma la tarjeta que acabamos de crear (item) y le agrega un elemento hijo al final del contenedor #lista-torneos
    }
  }
}
 //"Escucha" la entrada de #buscador-torneos y pasa el valor a renderizarListaTorneos()
function filtrarTorneos() { 
  var texto = document.getElementById('buscador-torneos').value.toLowerCase();
  renderizarListaTorneos(texto);
}
 
function abrirTorneo(id) { //Recorre el array, busca el elemento con el id que coincida con el argumento.
  var torneo = null;
  for (var i = 0; i < torneos.length; i++) {
    if (torneos[i].id === id) { torneo = torneos[i]; }
  }
  if (!torneo) { return; }
 
  torneoActualId = id;
 
  document.getElementById('torneos-vista-lista').classList.remove('visible'); //oculta el contenedor #torneos-vista-lista
  document.getElementById('torneos-vista-detalle').classList.add('visible'); //muestra el contenedor #torneos-vista-detalle
 
  document.getElementById('detalle-torneo-nombre').innerText = torneo.nombre; //a diferencia de .innerHTML que interpreta etiquetas HTML, .innerText imprimirá literalmente lo aplicado. 
  //Ejemplo: <strong>Holiwis</strong> interpretado por .innerHTML mostraría "Holiwis" en negrita. Pero inner:Text mostrará <strong>Holiwis</strong> literalmente.
  document.getElementById('t-nombre').value = torneo.nombre; //obtenemos el id de la etiqueta t-nombre en el array torneo variable nombre. Así con todos.
  document.getElementById('t-modalidad').value = torneo.modalidad;
  document.getElementById('t-deporte').value = torneo.deporte;
  document.getElementById('t-categoria').value = torneo.categoria;
  document.getElementById('t-formato').value = torneo.formato;
  document.getElementById('t-cant-equipos').value = torneo.cantidadEquipos;
  document.getElementById('t-jugadores-por-equipo').value = torneo.jugadoresPorEquipo;
  document.getElementById('t-cant-jugadores').value = torneo.cantidadJugadores;
  document.getElementById('t-fecha-inicio').value = torneo.fechaInicio;
  document.getElementById('t-fecha-fin').value = torneo.fechaFin;
  document.getElementById('t-etiquetas').value = torneo.etiquetas.join(', '); //Toma el array de etiquetas y las convierte en un texto separado por una coma y un espacio.
  //.join() es una función utilizada para arrays, tomando todos los elementos y uniendolos en una sola cadena String, insertando un separador que le des (", ")
  document.getElementById('t-hora-inicio').value = torneo.horaInicio;
  document.getElementById('t-hora-fin').value = torneo.horaFin;
  document.getElementById('t-reglas-generales').value = torneo.reglasGenerales;
  document.getElementById('t-descripcion').value = torneo.descripcion;
 
  // Muestra los campos de "equipos" o de "individual" según la modalidad guardada, y marca los días de partido ya elegidos
  actualizarModalidadTorneo();
  marcarDiasTorneo(torneo.diasPartidos);
 
  //Invocamos llenarLista() para insertar arrays simples (en este caso; equipos, participantes, organizadores) a renderizarReglamento(torneo) y cargar la documentación 
  llenarLista('lista-equipos-torneo', torneo.equipos);
  llenarLista('lista-participantes-torneo', torneo.participantes);
  llenarLista('lista-organizadores-torneo', torneo.organizadores);
  renderizarReglamentoTorneo(torneo);
 
  mostrarTabTorneo('info', document.querySelector('#torneos-vista-detalle .tab-btn'));
}
 
function obtenerTorneoActual() {
  for (var i = 0; i < torneos.length; i++) {
    if (torneos[i].id === torneoActualId) { return torneos[i]; }
  }
  return null;
}
 
// Muestra los campos de "Cantidad de equipos / Jugadores por equipo" cuando la modalidad es "equipos",
// o el campo "Cantidad de jugadores" cuando la modalidad es "individual" (misma lógica que en Crear Torneo).
function actualizarModalidadTorneo() {
  var modalidad = document.getElementById('t-modalidad').value;
  var camposEquipos = document.querySelectorAll('#tab-info .campo-modo-equipos');
  var camposIndividual = document.querySelectorAll('#tab-info .campo-modo-individual');
 
  for (var i = 0; i < camposEquipos.length; i++) {
    if (modalidad === 'equipos') {
      camposEquipos[i].classList.remove('is-hidden');
    } else {
      camposEquipos[i].classList.add('is-hidden');
    }
  }
 
  for (var j = 0; j < camposIndividual.length; j++) {
    if (modalidad === 'individual') {
      camposIndividual[j].classList.remove('is-hidden');
    } else {
      camposIndividual[j].classList.add('is-hidden');
    }
  }
}
 
// Marca como "selected" los botones de día que ya estaban guardados para este torneo (Lun, Mar, etc.)
function marcarDiasTorneo(dias) {
  var botones = document.querySelectorAll('#t-dias-selector .day-btn');
  for (var i = 0; i < botones.length; i++) {
    var boton = botones[i];
    if (dias.indexOf(boton.getAttribute('data-dia')) !== -1) {
      boton.classList.add('selected');
    } else {
      boton.classList.remove('selected');
    }
  }
}
 
// Alterna un día de partido seleccionado/no seleccionado al hacer click en el botón (Lun, Mar, Mié...)
function toggleDiaTorneo(boton) {
  boton.classList.toggle('selected');
}
 
// Toma todos los campos del tab "Información general" (incluyendo los nuevos: modalidad, categoría,
// formato, cantidades, días y horarios) y los guarda de vuelta en el torneo que se está editando.
function guardarDatosTorneo() {
  var torneo = obtenerTorneoActual();
  if (!torneo) { return; }
 
  var nombreNuevo = document.getElementById('t-nombre').value.trim();
  if (nombreNuevo === '') {
    alert('El nombre del torneo no puede estar vacío.');
    return;
  }
 
  var diasSeleccionados = [];
  var botonesDias = document.querySelectorAll('#t-dias-selector .day-btn.selected');
  for (var i = 0; i < botonesDias.length; i++) {
    diasSeleccionados.push(botonesDias[i].getAttribute('data-dia'));
  }
 
  torneo.nombre = nombreNuevo;
  torneo.modalidad = document.getElementById('t-modalidad').value;
  torneo.deporte = document.getElementById('t-deporte').value.trim();
  torneo.categoria = document.getElementById('t-categoria').value;
  torneo.formato = document.getElementById('t-formato').value;
  torneo.cantidadEquipos = document.getElementById('t-cant-equipos').value;
  torneo.jugadoresPorEquipo = document.getElementById('t-jugadores-por-equipo').value;
  torneo.cantidadJugadores = document.getElementById('t-cant-jugadores').value;
  torneo.etiquetas = document.getElementById('t-etiquetas').value.split(',').map(function(e) { return e.trim(); }).filter(function(e) { return e !== ''; });
  torneo.fechaInicio = document.getElementById('t-fecha-inicio').value;
  torneo.fechaFin = document.getElementById('t-fecha-fin').value;
  torneo.diasPartidos = diasSeleccionados;
  torneo.horaInicio = document.getElementById('t-hora-inicio').value;
  torneo.horaFin = document.getElementById('t-hora-fin').value;
  torneo.reglasGenerales = document.getElementById('t-reglas-generales').value;
  torneo.descripcion = document.getElementById('t-descripcion').value;
 
  document.getElementById('detalle-torneo-nombre').innerText = torneo.nombre;
  renderizarListaTorneos(document.getElementById('buscador-torneos').value.toLowerCase());
}
 
  //Gestión de reglamentos: renderizarReglamentoTorneo, agregar, editar, eliminar)
 //Construye elementos <li> que contienen un PDF/Documento y dos botones (Editar o eliminar) que están asociados al índice del arreglo con el atributo de data-indice
function renderizarReglamentoTorneo(torneo) {
  var contenedor = document.getElementById('lista-reglamento-torneo');
  contenedor.innerHTML = '';
 
  for (var i = 0; i < torneo.reglamento.length; i++) {
    var li = document.createElement('li');
    li.className = 'item-simple'; //Crea el <li>
 
    var texto = document.createElement('span');
    texto.innerText = torneo.reglamento[i];
 
    var botonEditar = document.createElement('button');
    botonEditar.className = 'btn-mini';
    botonEditar.innerText = 'Editar';
    botonEditar.setAttribute('data-indice', i);
    botonEditar.onclick = function() {
      editarDocumentoReglamento(parseInt(this.getAttribute('data-indice'))); //Modifica el elemento
    };
 
    var botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn-mini btn-mini-eliminar';
    botonEliminar.innerText = 'Eliminar';
    botonEliminar.setAttribute('data-indice', i);
    botonEliminar.onclick = function() {
      eliminarDocumentoReglamento(parseInt(this.getAttribute('data-indice'))); //Elimina el elemento del arreglo utilizando .splice(indice, 1)
    };
 
    li.appendChild(texto);
    li.appendChild(botonEditar);
    li.appendChild(botonEliminar);
    contenedor.appendChild(li);
  }
}
//todas las funciones llaman a renderizarReglamentoTorneo() para re-renderizar la lista tras el cambio (cambios actuales)
//solicita texto utilizando prompt() y lo coloca en el arreglo reglamento del torneo activo utilizando .push() 
function agregarDocumentoReglamento() { 
  var torneo = obtenerTorneoActual();
  if (!torneo) { return; }
 
  var valor = prompt('Nuevo documento de reglamento:');
  if (valor !== null && valor.trim() !== '') {
    torneo.reglamento.push(valor.trim());
    renderizarReglamentoTorneo(torneo);
  }
}
 
function editarDocumentoReglamento(indice) {
  var torneo = obtenerTorneoActual();
  if (!torneo) { return; }
 
  var valorActual = torneo.reglamento[indice];
  var valorNuevo = prompt('Editar documento:', valorActual);
  if (valorNuevo !== null && valorNuevo.trim() !== '') {
    torneo.reglamento[indice] = valorNuevo.trim();
    renderizarReglamentoTorneo(torneo);
  }
}
 
function eliminarDocumentoReglamento(indice) {
  var torneo = obtenerTorneoActual();
  if (!torneo) { return; }
 
  var confirmar = confirm('¿Eliminar este documento del reglamento?');
  if (confirmar) {
    torneo.reglamento.splice(indice, 1);
    renderizarReglamentoTorneo(torneo);
  }
}
 
function llenarLista(idLista, datos) {
  var lista = document.getElementById(idLista);
  lista.innerHTML = '';
  for (var i = 0; i < datos.length; i++) {
    var li = document.createElement('li');
    li.innerText = datos[i];
    lista.appendChild(li);
  }
}
 
function volverListadoTorneos() {
  document.getElementById('torneos-vista-detalle').classList.remove('visible');
  document.getElementById('torneos-vista-lista').classList.add('visible');
}
 
function mostrarTabTorneo(nombre, boton) {
  var contenidos = document.querySelectorAll('#torneos-vista-detalle .tab-contenido');
  for (var i = 0; i < contenidos.length; i++) {
    contenidos[i].classList.remove('visible');
  }
  document.getElementById('tab-' + nombre).classList.add('visible');
 
  var botones = document.querySelectorAll('#torneos-vista-detalle .tab-btn');
  for (var j = 0; j < botones.length; j++) {
    botones[j].classList.remove('activo');
  }
  boton.classList.add('activo');
}
 
// USUARIOS
 
var usuarios = [
  {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan.perez@correo.com",
    telefono: "099 111 222",
    rol: "Usuario",
    estado: "Activo",
    sanciones: [
      { motivo: "Conducta antideportiva", tipo: "Amonestación", duracion: "-", fecha: "2026-02-01" }
    ],
    actividad: ["Se registró en Copa Verano 2026", "Actualizó su perfil"]
  },
  {
    id: 2,
    nombre: "María López",
    email: "maria.lopez@correo.com",
    telefono: "099 333 444",
    rol: "Administrador",
    estado: "Activo",
    sanciones: [],
    actividad: ["Creó el torneo Copa Verano 2026"]
  },
  {
    id: 3,
    nombre: "Marcos Díaz",
    email: "marcos.diaz@correo.com",
    telefono: "099 555 666",
    rol: "Usuario",
    estado: "Suspendido",
    sanciones: [
      { motivo: "Agresión a un rival", tipo: "Suspensión temporal", duracion: "30 días", fecha: "2026-01-20" }
    ],
    actividad: ["Se registró en Copa Verano 2026"]
  }
];
 
var usuarioActualId = null;
 
var ordenRolesUsuario = ['Administrador', 'Usuario'];
 
function renderizarListaUsuarios(filtro) {
  var contenedor = document.getElementById('lista-usuarios');
  contenedor.innerHTML = '';
 
  var totalMostrados = 0;
 
  for (var r = 0; r < ordenRolesUsuario.length; r++) {
    var rolActual = ordenRolesUsuario[r];
    var coincidentes = [];
 
    for (var i = 0; i < usuarios.length; i++) {
      var u = usuarios[i];
      if (u.rol !== rolActual) { continue; }
 
      var coincideNombre = u.nombre.toLowerCase().indexOf(filtro) !== -1;
      var coincideRol = u.rol.toLowerCase().indexOf(filtro) !== -1;
 
      if (filtro === '' || coincideNombre || coincideRol) {
        coincidentes.push(u);
      }
    }
 
    if (coincidentes.length === 0) { continue; }
 
    var titulo = document.createElement('h3');
    titulo.className = 'subgrupo-titulo';
    titulo.innerText = rolActual === 'Administrador' ? 'Administradores' : 'Usuarios';
    contenedor.appendChild(titulo);
 
    for (var j = 0; j < coincidentes.length; j++) {
      var usuario = coincidentes[j];
      var item = document.createElement('div');
      item.className = 'torneo-item';
      item.setAttribute('data-id', usuario.id);
      item.onclick = function() {
        abrirUsuario(parseInt(this.getAttribute('data-id')));
      };
 
      var claseBadge = usuario.estado === 'Activo' ? 'badge-activo' : 'badge-suspendido';
 
      item.innerHTML =
        '<div><strong>' + usuario.nombre + '</strong><br><small>' + usuario.rol + '</small></div>' +
        '<div><span class="badge-estado ' + claseBadge + '">' + usuario.estado + '</span></div>';
 
      contenedor.appendChild(item);
      totalMostrados++;
    }
  }
 
  if (totalMostrados === 0) {
    contenedor.innerHTML = '<p style="color:#6b7280;">No se encontraron usuarios.</p>';
  }
}
 
function filtrarUsuarios() {
  var texto = document.getElementById('buscador-usuarios').value.toLowerCase();
  renderizarListaUsuarios(texto);
}
 
function abrirUsuario(id) {
  var usuario = null;
  for (var i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id === id) { usuario = usuarios[i]; }
  }
  if (!usuario) { return; }
 
  usuarioActualId = id;
 
  document.getElementById('usuarios-vista-lista').classList.remove('visible');
  document.getElementById('usuarios-vista-detalle').classList.add('visible');
 
  document.getElementById('detalle-usuario-nombre').innerText = usuario.nombre;
  document.getElementById('u-nombre').value = usuario.nombre;
  document.getElementById('u-rol').value = usuario.rol;
  document.getElementById('u-email').value = usuario.email;
  document.getElementById('u-telefono').value = usuario.telefono;
  document.getElementById('u-estado').value = usuario.estado;
 
  renderizarSancionesUsuario();
  llenarLista('lista-actividad-usuario', usuario.actividad);
 
  mostrarTabUsuario('perfil', document.querySelector('#usuarios-vista-detalle .tab-btn'));
}
 
function volverListadoUsuarios() {
  document.getElementById('usuarios-vista-detalle').classList.remove('visible');
  document.getElementById('usuarios-vista-lista').classList.add('visible');
}
 
function mostrarTabUsuario(nombre, boton) {
  var contenidos = document.querySelectorAll('#usuarios-vista-detalle .tab-contenido');
  for (var i = 0; i < contenidos.length; i++) {
    contenidos[i].classList.remove('visible');
  }
  document.getElementById('tabu-' + nombre).classList.add('visible');
 
  var botones = document.querySelectorAll('#usuarios-vista-detalle .tab-btn');
  for (var j = 0; j < botones.length; j++) {
    botones[j].classList.remove('activo');
  }
  boton.classList.add('activo');
}
 
function obtenerUsuarioActual() {
  for (var i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id === usuarioActualId) { return usuarios[i]; }
  }
  return null;
}
 
function renderizarSancionesUsuario() {
  var usuario = obtenerUsuarioActual();
  if (!usuario) { return; }
 
  var contenedor = document.getElementById('lista-sanciones-usuario');
  contenedor.innerHTML = '';
 
  if (usuario.sanciones.length === 0) {
    contenedor.innerHTML = '<p style="color:#6b7280; margin-bottom: 10px;">Este usuario no tiene sanciones aplicadas.</p>';
    return;
  }
 
  for (var i = 0; i < usuario.sanciones.length; i++) {
    var s = usuario.sanciones[i];
 
    var fila = document.createElement('div');
    fila.className = 'sancion-item';
 
    var info = document.createElement('div');
    info.className = 'sancion-info';
    info.innerHTML =
      '<strong>' + s.tipo + ' — ' + s.motivo + '</strong>' +
      '<small>Fecha: ' + s.fecha + (s.duracion !== '-' ? ' · Duración: ' + s.duracion : '') + '</small>';
 
    var botonQuitar = document.createElement('button');
    botonQuitar.className = 'btn-mini btn-mini-eliminar';
    botonQuitar.innerText = 'Quitar sanción';
    botonQuitar.setAttribute('data-indice', i);
    botonQuitar.onclick = function() {
      quitarSancion(parseInt(this.getAttribute('data-indice')));
    };
 
    fila.appendChild(info);
    fila.appendChild(botonQuitar);
    contenedor.appendChild(fila);
  }
}
 
function aplicarSancion() {
  var usuario = obtenerUsuarioActual();
  if (!usuario) { return; }
 
  var motivo = document.getElementById('s-motivo').value.trim();
  var tipo = document.getElementById('s-tipo').value;
  var duracion = document.getElementById('s-duracion').value.trim();
  var fecha = document.getElementById('s-fecha').value;
 
  if (motivo === '' || fecha === '') {
    alert('Completá al menos el motivo y la fecha de la sanción.');
    return;
  }
 
  usuario.sanciones.push({
    motivo: motivo,
    tipo: tipo,
    duracion: duracion === '' ? '-' : duracion,
    fecha: fecha
  });
 
  // Si es suspension o expulsion, actualizamos el estado del usuario
  if (tipo === 'Suspensión temporal' || tipo === 'Expulsión') {
    usuario.estado = 'Suspendido';
    document.getElementById('u-estado').value = 'Suspendido';
  }
 
  document.getElementById('s-motivo').value = '';
  document.getElementById('s-duracion').value = '';
  document.getElementById('s-fecha').value = '';
 
  renderizarSancionesUsuario();
}
 
function quitarSancion(indice) {
  var usuario = obtenerUsuarioActual();
  if (!usuario) { return; }
 
  var confirmar = confirm('¿Quitar esta sanción?');
  if (confirmar) {
    usuario.sanciones.splice(indice, 1);
    renderizarSancionesUsuario();
  }
}
 
var datosSecciones = {
  partidos: { nombreSingular: "partido", items: ["Los Tigres vs Águilas FC - 10/01/2026", "Halcones vs Toros Norte - 05/03/2026"] },
  resultados: { nombreSingular: "resultado", items: ["Los Tigres 2 - 1 Águilas FC", "Halcones 78 - 65 Toros Norte"] },
  categorias: { nombreSingular: "etiqueta", items: ["verano", "juvenil", "regional"] },
  notificaciones: { nombreSingular: "plantilla de notificación", items: ["Bienvenida a nuevo usuario", "Recordatorio de partido", "Sanción aplicada"] },
  comoFunciona: { nombreSingular: "paso", items: ["1. Crea una cuenta", "2. Crea o únete a un torneo.", "3. Consulta resultados y ranking."] },
  paraQuien: { nombreSingular: "tipo de usuario", items: ["Jugadores", "Organizadores", "Clubes/Federaciónes", "Docentes", "Organizadores independientes", "Comunidades"] },
  sistemasCompeticion: { nombreSingular: "sistema de competición", items: ["Liga", "Eliminacón directa", "Sistema Suizo"] }
};
 
function renderizarSeccionSimple(clave) {
  var info = datosSecciones[clave];
  var contenedor = document.getElementById('lista-' + clave);
  contenedor.innerHTML = '';
 
  for (var i = 0; i < info.items.length; i++) {
    var li = document.createElement('li');
    li.className = 'item-simple';
 
    var texto = document.createElement('span');
    texto.innerText = info.items[i];
 
    var botonEditar = document.createElement('button');
    botonEditar.className = 'btn-mini';
    botonEditar.innerText = 'Editar';
    botonEditar.setAttribute('data-indice', i);
    botonEditar.onclick = function() {
      editarItemSimple(clave, parseInt(this.getAttribute('data-indice')));
    };
 
    var botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn-mini btn-mini-eliminar';
    botonEliminar.innerText = 'Eliminar';
    botonEliminar.setAttribute('data-indice', i);
    botonEliminar.onclick = function() {
      eliminarItemSimple(clave, parseInt(this.getAttribute('data-indice')));
    };
 
    li.appendChild(texto);
    li.appendChild(botonEditar);
    li.appendChild(botonEliminar);
    contenedor.appendChild(li);
  }
 
  // Truco para que cada boton "recuerde" a que seccion pertenece, ya que los botones se generan dentro de for
  var botones = contenedor.querySelectorAll('.btn-mini');
  for (var b = 0; b < botones.length; b++) {
    botones[b].setAttribute('data-seccion', clave);
  }
}
 
function agregarItemSimple(clave) {
  var info = datosSecciones[clave];
  var valor = prompt('Nuevo ' + info.nombreSingular + ':');
  if (valor !== null && valor.trim() !== '') {
    info.items.push(valor.trim());
    renderizarSeccionSimple(clave);
  }
}
 
function editarItemSimple(clave, indice) {
  var info = datosSecciones[clave];
  var valorActual = info.items[indice];
  var valorNuevo = prompt('Editar ' + info.nombreSingular + ':', valorActual);
  if (valorNuevo !== null && valorNuevo.trim() !== '') {
    info.items[indice] = valorNuevo.trim();
    renderizarSeccionSimple(clave);
  }
}
 
function eliminarItemSimple(clave, indice) {
  var info = datosSecciones[clave];
  var confirmar = confirm('¿Eliminar este ' + info.nombreSingular + '?');
  if (confirmar) {
    info.items.splice(indice, 1);
    renderizarSeccionSimple(clave);
  }
}
 
// EQUIPOS
 
// Orden de rango: el primero es el de mayor jerarquía.
var ordenRolesMiembro = ['Organizador', 'Encargado', 'Participante'];
 
var equipos = [
  {
    id: 1,
    nombre: "Los Tigres",
    miembros: [
      { nombre: "María López", rol: "Organizador", userId: null },
      { nombre: "Carlos Ruiz", rol: "Encargado", userId: null },
      { nombre: "Juan Pérez", rol: "Participante", userId: null },
      { nombre: "Ana Gómez", rol: "Participante", userId: null }
    ]
  },
  {
    id: 2,
    nombre: "Águilas FC",
    miembros: [
      { nombre: "Marcos Díaz", rol: "Participante", userId: null }
    ]
  },
  { id: 3, nombre: "Rayo Sur", miembros: [] },
  { id: 4, nombre: "Halcones", miembros: [] }
];
 
var equipoActualId = null;
var proximoIdEquipo = 5;
 
function renderizarListaEquipos(filtro) {
  var contenedor = document.getElementById('lista-equipos');
  contenedor.innerHTML = '';
 
  for (var i = 0; i < equipos.length; i++) {
    var eq = equipos[i];
    if (filtro !== '' && eq.nombre.toLowerCase().indexOf(filtro) === -1) { continue; }
 
    var item = document.createElement('div');
    item.className = 'torneo-item';
    item.setAttribute('data-id', eq.id);
    item.onclick = function() {
      abrirEquipo(parseInt(this.getAttribute('data-id')));
    };
 
    item.innerHTML =
      '<div><strong>' + eq.nombre + '</strong><br><small>' + eq.miembros.length + ' miembro(s)</small></div>';
 
    contenedor.appendChild(item);
  }
}
 
function filtrarEquipos() {
  var texto = document.getElementById('buscador-equipos').value.toLowerCase();
  renderizarListaEquipos(texto);
}
 
function crearEquipo() {
  var nombre = prompt('Nombre del nuevo equipo:');
  if (nombre !== null && nombre.trim() !== '') {
    equipos.push({ id: proximoIdEquipo, nombre: nombre.trim(), miembros: [] });
    proximoIdEquipo++;
    renderizarListaEquipos('');
  }
}
 
function obtenerEquipoActual() {
  for (var i = 0; i < equipos.length; i++) {
    if (equipos[i].id === equipoActualId) { return equipos[i]; }
  }
  return null;
}
 
function abrirEquipo(id) {
  var equipo = null;
  for (var i = 0; i < equipos.length; i++) {
    if (equipos[i].id === id) { equipo = equipos[i]; }
  }
  if (!equipo) { return; }
 
  equipoActualId = id;
 
  document.getElementById('equipos-vista-lista').classList.remove('visible');
  document.getElementById('equipos-vista-detalle').classList.add('visible');
 
  document.getElementById('detalle-equipo-nombre').innerText = equipo.nombre;
  document.getElementById('eq-nombre').value = equipo.nombre;
 
  renderizarMiembrosEquipo(equipo);
}
 
function volverListadoEquipos() {
  document.getElementById('equipos-vista-detalle').classList.remove('visible');
  document.getElementById('equipos-vista-lista').classList.add('visible');
  renderizarListaEquipos('');
}
 
function guardarNombreEquipo() {
  var equipo = obtenerEquipoActual();
  if (!equipo) { return; }
 
  var nuevoNombre = document.getElementById('eq-nombre').value.trim();
  if (nuevoNombre === '') {
    alert('El nombre del equipo no puede estar vacío.');
    return;
  }
 
  equipo.nombre = nuevoNombre;
  document.getElementById('detalle-equipo-nombre').innerText = equipo.nombre;
}
 
// Agrupa una lista de miembros por rol
function agruparPorRol(lista) {
  var grupos = {};
  for (var r = 0; r < ordenRolesMiembro.length; r++) {
    grupos[ordenRolesMiembro[r]] = [];
  }
  for (var i = 0; i < lista.length; i++) {
    var rol = lista[i].rol;
    if (!grupos[rol]) { grupos[rol] = []; }
    grupos[rol].push(lista[i]);
  }
  return grupos;
}
 
function renderizarMiembrosEquipo(equipo) {
  var grupos = agruparPorRol(equipo.miembros);
 
  for (var r = 0; r < ordenRolesMiembro.length; r++) {
    var rol = ordenRolesMiembro[r];
    var contenedor = document.getElementById('lista-eq-miembros-' + rol.toLowerCase());
    contenedor.innerHTML = '';
 
    if (grupos[rol].length === 0) {
      contenedor.innerHTML = '<li class="sin-miembros">Sin miembros en este rol.</li>';
      continue;
    }
 
    for (var i = 0; i < grupos[rol].length; i++) {
      var miembro = grupos[rol][i];
      var li = document.createElement('li');
      li.className = 'item-simple';
 
      var info = document.createElement('div');
      info.className = 'miembro-info';
      info.innerHTML =
        '<strong>' + miembro.nombre + '</strong>' +
        '<small class="miembro-userid">ID de usuario: ' + (miembro.userId ? miembro.userId : 'sin vincular') + '</small>';
 
      var botonQuitar = document.createElement('button');
      botonQuitar.className = 'btn-mini btn-mini-eliminar';
      botonQuitar.innerText = 'Quitar';
      botonQuitar.onclick = (function(m) {
        return function() { quitarMiembroEquipo(m); };
      })(miembro);
 
      li.appendChild(info);
      li.appendChild(botonQuitar);
      contenedor.appendChild(li);
    }
  }
}
 
function agregarMiembroEquipo() {
  var equipo = obtenerEquipoActual();
  if (!equipo) { return; }
 
  var nombre = prompt('Nombre del nuevo miembro:');
  if (nombre === null || nombre.trim() === '') { return; }
 
  var rol = prompt('Rol del miembro (Organizador, Encargado o Participante):', 'Participante');
  if (rol === null) { return; }
  rol = rol.trim();
 
  if (ordenRolesMiembro.indexOf(rol) === -1) {
    alert('Rol inválido. Debe ser: Organizador, Encargado o Participante.');
    return;
  }
 
  // userId queda en null: se podrá vincular a un usuario registrado más adelante.
  equipo.miembros.push({ nombre: nombre.trim(), rol: rol, userId: null });
  renderizarMiembrosEquipo(equipo);
  renderizarListaEquipos('');
}
 
function quitarMiembroEquipo(miembro) {
  var equipo = obtenerEquipoActual();
  if (!equipo) { return; }
 
  var confirmar = confirm('¿Quitar a "' + miembro.nombre + '" del equipo?');
  if (!confirmar) { return; }
 
  var indice = equipo.miembros.indexOf(miembro);
  if (indice !== -1) {
    equipo.miembros.splice(indice, 1);
    renderizarMiembrosEquipo(equipo);
    renderizarListaEquipos('');
  }
}
 
// MIEMBROS
 
var miembros = [
  { id: 1, nombre: "María López", rol: "Organizador" },
  { id: 2, nombre: "Carlos Ruiz", rol: "Encargado" },
  { id: 3, nombre: "Juan Pérez", rol: "Participante" },
  { id: 4, nombre: "Ana Gómez", rol: "Participante" },
  { id: 5, nombre: "Lucía Fernández", rol: "Participante" }
];
 
var proximoIdMiembro = 6;
 
function renderizarMiembros() {
  var grupos = agruparPorRol(miembros);
 
  for (var r = 0; r < ordenRolesMiembro.length; r++) {
    var rol = ordenRolesMiembro[r];
    var contenedor = document.getElementById('lista-miembros-' + rol.toLowerCase());
    contenedor.innerHTML = '';
 
    if (grupos[rol].length === 0) {
      contenedor.innerHTML = '<li class="sin-miembros">Sin miembros en este rol.</li>';
      continue;
    }
 
    for (var i = 0; i < grupos[rol].length; i++) {
      var miembro = grupos[rol][i];
      var li = document.createElement('li');
      li.className = 'item-simple';
 
      var texto = document.createElement('span');
      texto.innerText = miembro.nombre;
 
      var botonEditar = document.createElement('button');
      botonEditar.className = 'btn-mini';
      botonEditar.innerText = 'Editar';
      botonEditar.onclick = (function(m) {
        return function() { editarMiembro(m); };
      })(miembro);
 
      var botonEliminar = document.createElement('button');
      botonEliminar.className = 'btn-mini btn-mini-eliminar';
      botonEliminar.innerText = 'Eliminar';
      botonEliminar.onclick = (function(m) {
        return function() { eliminarMiembro(m); };
      })(miembro);
 
      li.appendChild(texto);
      li.appendChild(botonEditar);
      li.appendChild(botonEliminar);
      contenedor.appendChild(li);
    }
  }
}
 
function agregarMiembro() {
  var nombre = prompt('Nombre del nuevo miembro:');
  if (nombre === null || nombre.trim() === '') { return; }
 
  var rol = prompt('Rol del miembro (Organizador, Encargado o Participante):', 'Participante');
  if (rol === null) { return; }
  rol = rol.trim();
 
  if (ordenRolesMiembro.indexOf(rol) === -1) {
    alert('Rol inválido. Debe ser: Organizador, Encargado o Participante.');
    return;
  }
 
  miembros.push({ id: proximoIdMiembro, nombre: nombre.trim(), rol: rol });
  proximoIdMiembro++;
  renderizarMiembros();
}
 
function editarMiembro(miembro) {
  var nuevoNombre = prompt('Editar nombre:', miembro.nombre);
  if (nuevoNombre === null || nuevoNombre.trim() === '') { return; }
 
  var nuevoRol = prompt('Editar rol (Organizador, Encargado o Participante):', miembro.rol);
  if (nuevoRol === null) { return; }
  nuevoRol = nuevoRol.trim();
 
  if (ordenRolesMiembro.indexOf(nuevoRol) === -1) {
    alert('Rol inválido. Debe ser: Organizador, Encargado o Participante.');
    return;
  }
 
  miembro.nombre = nuevoNombre.trim();
  miembro.rol = nuevoRol;
  renderizarMiembros();
}
 
function eliminarMiembro(miembro) {
  var confirmar = confirm('¿Eliminar a "' + miembro.nombre + '" del directorio de miembros?');
  if (!confirmar) { return; }
 
  var indice = miembros.indexOf(miembro);
  if (indice !== -1) {
    miembros.splice(indice, 1);
    renderizarMiembros();
  }
}
 
// mostrar el nombre del archivo elegido en un input file
 
function mostrarNombreArchivo(idInput, idPreview) {
  var input = document.getElementById(idInput);
  var preview = document.getElementById(idPreview);
 
  if (input.files && input.files.length > 0) {
    preview.innerText = input.files[0].name;
  } else {
    preview.innerText = 'Sin imagen';
  }
}
 
// ESTADISTICAS 
 
function renderizarEstadisticas() {
  var contenedor = document.getElementById('tarjetas-stats');
  contenedor.innerHTML = '';
 
  var totalSanciones = 0;
  for (var i = 0; i < usuarios.length; i++) {
    totalSanciones += usuarios[i].sanciones.length;
  }
 
  var datos = [
    { numero: torneos.length, etiqueta: 'Torneos activos' },
    { numero: usuarios.length, etiqueta: 'Usuarios registrados' },
    { numero: equipos.length, etiqueta: 'Equipos' },
    { numero: miembros.length, etiqueta: 'Miembros' },
    { numero: totalSanciones, etiqueta: 'Sanciones aplicadas' }
  ];
 
  for (var j = 0; j < datos.length; j++) {
    var box = document.createElement('div');
    box.className = 'stat-box';
    box.innerHTML =
      '<div class="numero">' + datos[j].numero + '</div>' +
      '<div class="etiqueta-stat">' + datos[j].etiqueta + '</div>';
    contenedor.appendChild(box);
  }
}
// INFORMACIÓN DEL SITIO (contenido editable de la página principal / pagina.html)
 
var sitioInfo = {
  hero: {
    titulo1: "COMPITE",
    titulo2: "CONECTA",
    tituloDestacado: "TRIUNFA",
    texto: "Organiza competiciones, administra equipos, registra resultados y consulta estadísticas en tiempo real.",
    botonExplorar: "Explora torneos",
    botonCrear: "Crea tu torneo"
  },
  queEsSpl: "SPL es una plataforma diseñada para organizar torneos deportivos de cualquier disciplina.",
  footer: "2026 SPL | Sistema de Gestión de Torneos y Partidos"
};
 
// Carga los valores actuales de sitioInfo en los campos del formulario (se llama una sola vez, al cargar la página)
function cargarInformacionSitio() {
  document.getElementById('sitio-titulo1').value = sitioInfo.hero.titulo1;
  document.getElementById('sitio-titulo2').value = sitioInfo.hero.titulo2;
  document.getElementById('sitio-titulo-destacado').value = sitioInfo.hero.tituloDestacado;
  document.getElementById('sitio-hero-texto').value = sitioInfo.hero.texto;
  document.getElementById('sitio-boton-explorar').value = sitioInfo.hero.botonExplorar;
  document.getElementById('sitio-boton-crear').value = sitioInfo.hero.botonCrear;
  document.getElementById('sitio-que-es-texto').value = sitioInfo.queEsSpl;
  document.getElementById('sitio-footer-texto').value = sitioInfo.footer;
}
 
function guardarHeroSitio() {
  sitioInfo.hero.titulo1 = document.getElementById('sitio-titulo1').value.trim();
  sitioInfo.hero.titulo2 = document.getElementById('sitio-titulo2').value.trim();
  sitioInfo.hero.tituloDestacado = document.getElementById('sitio-titulo-destacado').value.trim();
  sitioInfo.hero.texto = document.getElementById('sitio-hero-texto').value.trim();
  sitioInfo.hero.botonExplorar = document.getElementById('sitio-boton-explorar').value.trim();
  sitioInfo.hero.botonCrear = document.getElementById('sitio-boton-crear').value.trim();
}
 
function guardarQueEsSplSitio() {
  sitioInfo.queEsSpl = document.getElementById('sitio-que-es-texto').value.trim();
}
 
function guardarFooterSitio() {
  sitioInfo.footer = document.getElementById('sitio-footer-texto').value.trim();
}
 
// Preguntas frecuentes de la página principal (cada una con pregunta + respuesta, por eso no usa el mecanismo genérico de listas simples)
var preguntasFrecuentes = [
  { pregunta: "¿Es gratis?", respuesta: "Sí, registrarte y explorar la plataforma es totalmente gratuito para todos los usuarios." },
  { pregunta: "¿Puedo organizar torneos privados?", respuesta: "¡Por supuesto! Al crear un torneo puedes configurarlo como privado para que solo accedan con invitación." },
  { pregunta: "¿Puedo editar un torneo?", respuesta: "Sí, puedes editar la información, fechas y participantes de tus torneos desde tu panel de administrador." }
];
 
function renderizarFaq() {
  var contenedor = document.getElementById('lista-faq');
  contenedor.innerHTML = '';
 
  for (var i = 0; i < preguntasFrecuentes.length; i++) {
    var faq = preguntasFrecuentes[i];
 
    var fila = document.createElement('div');
    fila.className = 'sancion-item';
 
    var info = document.createElement('div');
    info.className = 'sancion-info';
    info.innerHTML = '<strong>' + faq.pregunta + '</strong><small>' + faq.respuesta + '</small>';
 
    var botonEditar = document.createElement('button');
    botonEditar.className = 'btn-mini';
    botonEditar.innerText = 'Editar';
    botonEditar.setAttribute('data-indice', i);
    botonEditar.onclick = function() {
      editarFaq(parseInt(this.getAttribute('data-indice')));
    };
 
    var botonEliminar = document.createElement('button');
    botonEliminar.className = 'btn-mini btn-mini-eliminar';
    botonEliminar.innerText = 'Eliminar';
    botonEliminar.setAttribute('data-indice', i);
    botonEliminar.onclick = function() {
      eliminarFaq(parseInt(this.getAttribute('data-indice')));
    };
 
    var botonesFaq = document.createElement('div');
    botonesFaq.appendChild(botonEditar);
    botonesFaq.appendChild(botonEliminar);
 
    fila.appendChild(info);
    fila.appendChild(botonesFaq);
    contenedor.appendChild(fila);
  }
}
 
function agregarFaq() {
  var pregunta = prompt('Nueva pregunta:');
  if (pregunta === null || pregunta.trim() === '') { return; }
 
  var respuesta = prompt('Respuesta para "' + pregunta.trim() + '":');
  if (respuesta === null || respuesta.trim() === '') { return; }
 
  preguntasFrecuentes.push({ pregunta: pregunta.trim(), respuesta: respuesta.trim() });
  renderizarFaq();
}
 
function editarFaq(indice) {
  var faq = preguntasFrecuentes[indice];
 
  var preguntaNueva = prompt('Editar pregunta:', faq.pregunta);
  if (preguntaNueva === null || preguntaNueva.trim() === '') { return; }
 
  var respuestaNueva = prompt('Editar respuesta:', faq.respuesta);
  if (respuestaNueva === null || respuestaNueva.trim() === '') { return; }
 
  faq.pregunta = preguntaNueva.trim();
  faq.respuesta = respuestaNueva.trim();
  renderizarFaq();
}
 
function eliminarFaq(indice) {
  var confirmar = confirm('¿Eliminar esta pregunta frecuente?');
  if (confirmar) {
    preguntasFrecuentes.splice(indice, 1);
    renderizarFaq();
  }
}
 
// AL CARGAR LA PAGINA
 
document.addEventListener('DOMContentLoaded', function() {
  renderizarListaTorneos('');
  renderizarListaUsuarios('');
  renderizarListaEquipos('');
  renderizarMiembros();
  cargarInformacionSitio();
  renderizarFaq();
 
  for (var clave in datosSecciones) {
    renderizarSeccionSimple(clave);
  }
});
 
 
 
 