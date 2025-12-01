

let currentPage = 1;       // página actual
const itemsPerPage = 3;   // cantidad de alimentos por página
let alimentosData = [];    // aquí guardaremos los datos de fetch

const contenido = document.getElementById("contenido");
const alimentos_totales = document.getElementById("alimentos_totales");
const pageInfo = document.getElementById("pageInfo");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");

function consulta_alimentos() {
    fetch(`${URL_BASE}/alimentos`, { method: "GET" })
        .then(res => res.json())
        .then(data => {
            alimentosData = data.mensaje; // guardamos todos los alimentos
            mostrarPagina(currentPage);
        });
}

function mostrarPagina(page) {
    const totalAlimentos = alimentosData.length;
    const totalPages = Math.ceil(totalAlimentos / itemsPerPage);

    // Mostrar información de totales
    alimentos_totales.innerText = `Alimentos Totales: ${totalAlimentos}`;
    pageInfo.innerText = `Página ${page} de ${totalPages}`;

    // **Ocultar paginación si no es necesaria**
    const pagContainer = document.getElementById("paginacion_alimentos");
    if (totalAlimentos <= itemsPerPage) {
        pagContainer.style.display = "none";
    } else {
        pagContainer.style.display = "flex"; // o "block" según tu diseño
    }

    // Calcular rango
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const alimentosPagina = alimentosData.slice(start, end);

    contenido.innerHTML = "";

    if (alimentosPagina.length === 0) {
        contenido.innerHTML = `
            <tr class="sin-alimentos">
                <td colspan="9"><p>No hay Alimentos Disponibles</p></td>
            </tr>`;
        return;
    }

    alimentosPagina.forEach(element => {
        const mapa = {};
        element.elementos.forEach(e => {
            mapa[e.nombre] = e.valor;
        });

        contenido.innerHTML += `
            <tr class="nuevo1">
                <td class="nuevo td__border__l">
                    <img alt="logo de trigo" class="svg__alimento" src="/src/static/iconos/logo alimentospng.png">
                </td>
                <td class="nuevo">${element.id_alimento}</td>
                <td class="nuevo">${element.nombre}</td>
                <td class="nuevo">${mapa["Proteina_cruda"]}</td>
                <td class="nuevo">${mapa["Materia_seca"]}</td>
                <td class="nuevo">${mapa["Energia_metabo"]}</td>
                <td class="nuevo">${mapa["Fibra_cruda"]}</td>
                <td class="nuevo">${element.estado}</td>
                <td style="margin-bottom:2%;" class="nuevo td__border__r">
                    <img alt="ver" src="/src/static/iconos/icon eye.svg" onclick="abrirModal('eye', ${element.id_alimento})" class="icon-eye">
                    <img alt="editar" src="/src/static/iconos/edit icon.svg" onclick="abrirModal('edit', ${element.id_alimento})" class="icon-edit">
                    <img alt="eliminar" src="/src/static/iconos/delete icon.svg" onclick="abrirModal('dele', ${element.id_alimento})" class="icon-delete">
                </td>
            </tr>
             <dialog class="dialog-icon-eye modal-info" id="modal-eye-${element.id_alimento}">
  <div class="title-dialog">
    <h2>Información del Alimento</h2>
    <hr>
  </div>

  <div class="modal-info-content">
    <!-- Columna 1 -->
    <section class="modal-column">
    <p>Nombre del alimento</p>
    <input value="${element.nombre}" readonly>

      <p>Proteína cruda (%)</p>
      <input value="${mapa['Proteina_cruda']}" readonly>

      <p>Materia seca (%)</p>
      <input value="${mapa['Materia_seca']}" readonly>

      <p>Energía metabolizable (Kcal/kg)</p>
      <input value="${mapa['Energia_metabo']}" readonly>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input value="${mapa['Fibra_cruda']}" readonly>

      <p>Extracto etéreo (%)</p>
      <input value="${mapa['Extracto_etereo']}" readonly>

      <p>Calcio (%)</p>
      <input value="${mapa['Calcio']}" readonly>

      <p>Fósforo (%)</p>
      <input value="${mapa['Fosforo']}" readonly>
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input value="${mapa['Sodio']}" readonly>

      <p>Arginina (%)</p>
      <input value="${mapa['Arginina']}" readonly>

      <p>Lisina (%)</p>
      <input value="${mapa['Lisina']}" readonly>

      <p>Treonina (%)</p>
      <input value="${mapa['Treonina']}" readonly>
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input class="input_id" value="${mapa['Metionina']}" readonly>

      <p>Metionina + Cisteína (%)</p>
      <input value="${mapa['Metionina_Cisteina']}" readonly>

      <p>Triptófano (%)</p>
      <input value="${mapa['Triptofano']}" readonly>
    </section>
  </div>

  <div class="modal-footer">
    <button onclick="cerrarModal('eye', ${element.id_alimento})" class="btn">
      Cerrar
    </button>
  </div>
</dialog>

<!-- Modal editar -->
<dialog class="dialog-icon-edit modal-info" id="modal-edit-${element.id_alimento}">
  <div class="title-dialog">
    <h2>Editar Alimento</h2>
    <hr>
  </div>

  <div class="modal-info-content">
    <!-- Columna 1 -->
    <section class="modal-column">
      <p>Nombre del alimento</p>
      <input  id="edit-nombre-${element.id_alimento}" value="${element.nombre}">

      <p>Proteína cruda (%)</p>
      <input type="number" id="edit-Proteina_cruda-${element.id_alimento}" value="${mapa['Proteina_cruda'] || ''}">

      <p>Materia seca (%)</p>
      <input type="number" id="edit-Materia_seca-${element.id_alimento}" value="${mapa['Materia_seca'] || ''}">

      <p>Energía metabolizable (Kcal/kg)</p>
      <input type="number" id="edit-Energia_metabo-${element.id_alimento}" value="${mapa['Energia_metabo'] || ''}">

            <p>Estado</p>
      <select id="edit-estado-${element.id_alimento}" class="input__id">
        <option value="activo" ${element.estado === 'activo' ? 'selected' : ''}>Activo</option>
        <option value="inactivo" ${element.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
      </select>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input type="number" id="edit-Fibra_cruda-${element.id_alimento}" value="${mapa['Fibra_cruda'] || ''}">

      <p>Extracto etéreo (%)</p>
      <input type="number" id="edit-Extracto_etereo-${element.id_alimento}" value="${mapa['Extracto_etereo'] || ''}">

      <p>Calcio (%)</p>
      <input type="number" id="edit-Calcio-${element.id_alimento}" value="${mapa['Calcio'] || ''}">

      <p>Fósforo (%)</p>
      <input type="number" id="edit-Fosforo-${element.id_alimento}" value="${mapa['Fosforo'] || ''}">
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input type="number" id="edit-Sodio-${element.id_alimento}" value="${mapa['Sodio'] || ''}">

      <p>Arginina (%)</p>
      <input type="number" id="edit-Arginina-${element.id_alimento}" value="${mapa['Arginina'] || ''}">

      <p>Lisina (%)</p>
      <input type="number" id="edit-Lisina-${element.id_alimento}" value="${mapa['Lisina'] || ''}">

      <p>Treonina (%)</p>
      <input type="number" id="edit-Treonina-${element.id_alimento}" value="${mapa['Treonina'] || ''}">
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input type="number" id="edit-Metionina-${element.id_alimento}" value="${mapa['Metionina'] || ''}">

      <p>Metionina + Cisteína (%)</p>
      <input type="number" id="edit-Metionina_Cisteina-${element.id_alimento}" value="${mapa['Metionina_Cisteina'] || ''}">

      <p>Triptófano (%)</p>
      <input type="number" id="edit-Triptofano-${element.id_alimento}" value="${mapa['Triptofano'] || ''}">

      <p>Imagen (opcional)</p>
      <input  type="file" id="edit-imagen-${element.id_alimento}" class="input__id" accept="image/*">
    </section>
  </div>

  <div class="modal-footer">
    <button onclick="cerrarModal('edit', ${element.id_alimento})" class="btn">Cancelar</button>
    <button onclick="guardarCambios(${element.id_alimento})" class="btn">Guardar</button>
  </div>
</dialog>



<!-- Modal eliminar -->
<dialog class="dialog-icon-dele" id="modal-dele-${element.id_alimento}">
  <div class="title-dialog">
    <h2>Eliminar registro del alimento</h2>
  </div>
  <hr>
  <p>Eliminar el registro sin saber si el alimento tiene trazabilidad puede alterar el sistema.  
     Es preferible cambiar el estado del alimento a inactivo.</p>
  <span>¿Está seguro que quiere eliminar este registro?</span>
  <div class="container-button-dele1">
    <button class="btn" onclick="eliminar_alimento(${element.id_alimento})">Eliminar</button>
    <button class="btn" onclick="cerrarModal('dele', ${element.id_alimento})">Cancelar</button>
  </div>
</dialog>
        `;
    });

    // Desactivar botones según página
    prevPage.disabled = page <= 1;
    nextPage.disabled = page >= totalPages;
}


// Eventos de botones
prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        mostrarPagina(currentPage);
    }
});

nextPage.addEventListener('click', () => {
    const totalPages = Math.ceil(alimentosData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        mostrarPagina(currentPage);
    }
});



function consulta_individual_alimento() {
    const nombre = document.getElementById("id_alimento").value;
    const contenido = document.getElementById("contenido");
    const pagContainer = document.getElementById("paginacion_alimentos"); // contenedor de paginación
    const pageInfo = document.getElementById("pageInfo"); // info de página
    contenido.innerHTML = "";

    // Ocultar paginación y página cuando es búsqueda individual
    pagContainer.style.display = "none";
    pageInfo.innerText = "";

    if (nombre === "") {
        Swal.fire({
            title: "Campo vacío",
            text: "Por favor ingresa el nombre o ID del alimento.",
            icon: "warning",
            confirmButtonText: "OK"
        });
        return consulta_alimentos(); // aquí volverá la paginación
    }

    fetch(`${URL_BASE}/consulta_indi_alimento/${nombre}`)
        .then(res => res.json())
        .then(data => {
            alimentos_totales.innerHTML = "";
            if (!data.mensaje) {
                Swal.fire({
                    title: "Mensaje",
                    text: "Alimento no encontrado",
                    icon: "error",
                    confirmButtonText: "OK"
                }).then((result) => {
                    if (result.isConfirmed) {
                        consulta_alimentos(); // aquí volverá la paginación
                    }
                });
                return;
            }

            let alimentos = Array.isArray(data.mensaje) ? data.mensaje : [data.mensaje];

            alimentos.forEach(element => {
                const mapa = {};
                element.elementos.forEach(e => {
                    mapa[e.nombre] = e.valor;
                });

                contenido.innerHTML += `
                    <tr class="nuevo1">
                        <td class="nuevo td__border__l"><img class="svg__alimento" src="/src/static/iconos/logo alimentospng.png"></td>
                        <td class="nuevo">${element.id_alimento}</td>
                        <td class="nuevo">${element.nombre}</td>
                        <td class="nuevo">${mapa["Proteina_cruda"] || ''}</td>
                        <td class="nuevo">${mapa["Materia_seca"] || ''}</td>
                        <td class="nuevo">${mapa["Energia_metabo"] || ''}</td>
                        <td class="nuevo">${mapa["Fibra_cruda"] || ''}</td>
                        <td class="nuevo">${element.estado}</td>
                        <td class="nuevo td__border__r">
                            <img src="/src/static/iconos/icon eye.svg" onclick="abrirModal('eye', ${element.id_alimento})" class="icon-eye">
                            <img src="/src/static/iconos/edit icon.svg" onclick="abrirModal('edit', ${element.id_alimento})" class="icon-edit">
                            <img src="/src/static/iconos/delete icon.svg" onclick="abrirModal('dele', ${element.id_alimento})" class="icon-delete">
                        </td>
                    </tr>
                     <dialog class="dialog-icon-eye modal-info" id="modal-eye-${element.id_alimento}">
  <div class="title-dialog">
    <h2>Información del Alimento</h2>
    <hr>
  </div>

  <div class="modal-info-content">
    <!-- Columna 1 -->
    <section class="modal-column">
      <p>Nombre del alimento</p>
      <input  value="${element.nombre}" readonly>

      <p>Proteína cruda (%)</p>
      <input type="number" value="${mapa['Proteina_cruda']}" readonly>

      <p>Materia seca (%)</p>
      <input type="number" value="${mapa['Materia_seca']}" readonly>

      <p>Energía metabolizable (Kcal/kg)</p>
      <input type="number" value="${mapa['Energia_metabo']}" readonly>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input type="number" value="${mapa['Fibra_cruda']}" readonly>

      <p>Extracto etéreo (%)</p>
      <input type="number" value="${mapa['Extracto_etereo']}" readonly>

      <p>Calcio (%)</p>
      <input type="number" value="${mapa['Calcio']}" readonly>

      <p>Fósforo (%)</p>
      <input type="number" value="${mapa['Fosforo']}" readonly>
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input type="number" value="${mapa['Sodio']}" readonly>

      <p>Arginina (%)</p>
      <input type="number" value="${mapa['Arginina']}" readonly>

      <p>Lisina (%)</p>
      <input type="number" value="${mapa['Lisina']}" readonly>

      <p>Treonina (%)</p>
      <input type="number" value="${mapa['Treonina']}" readonly>
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input type="number" value="${mapa['Metionina']}" readonly>

      <p>Metionina + Cisteína (%)</p>
      <input type="number" value="${mapa['Metionina_Cisteina']}" readonly>

      <p>Triptófano (%)</p>
      <input type="number" value="${mapa['Triptofano']}" readonly>
    </section>
  </div>

  <div class="modal-footer">
    <button onclick="cerrarModal('eye', ${element.id_alimento})" class="btn">
      Cerrar
    </button>
  </div>
</dialog>

<!-- Modal editar -->
<dialog class="dialog-icon-edit modal-info" id="modal-edit-${element.id_alimento}">
  <div class="title-dialog">
    <h2>Editar Alimento</h2>
    <hr>
  </div>

  <div class="modal-info-content">
    <!-- Columna 1 -->
    <section class="modal-column">
      <p>Nombre del alimento</p>
      <input  id="edit-nombre-${element.id_alimento}" value="${element.nombre}">

      <p>Proteína cruda (%)</p>
      <input type="number" id="edit-Proteina_cruda-${element.id_alimento}" value="${mapa['Proteina_cruda'] || ''}">

      <p>Materia seca (%)</p>
      <input type="number" id="edit-Materia_seca-${element.id_alimento}" value="${mapa['Materia_seca'] || ''}">

      <p>Energía metabolizable (Kcal/kg)</p>
      <input type="number" id="edit-Energia_metabo-${element.id_alimento}" value="${mapa['Energia_metabo'] || ''}">

            <p>Estado</p>
      <select id="edit-estado-${element.id_alimento}" class="input__id">
        <option value="activo" ${element.estado === 'activo' ? 'selected' : ''}>Activo</option>
        <option value="inactivo" ${element.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
      </select>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input type="number" id="edit-Fibra_cruda-${element.id_alimento}" value="${mapa['Fibra_cruda'] || ''}">

      <p>Extracto etéreo (%)</p>
      <input type="number" id="edit-Extracto_etereo-${element.id_alimento}" value="${mapa['Extracto_etereo'] || ''}">

      <p>Calcio (%)</p>
      <input type="number" id="edit-Calcio-${element.id_alimento}" value="${mapa['Calcio'] || ''}">

      <p>Fósforo (%)</p>
      <input type="number" id="edit-Fosforo-${element.id_alimento}" value="${mapa['Fosforo'] || ''}">
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input type="number" id="edit-Sodio-${element.id_alimento}" value="${mapa['Sodio'] || ''}">

      <p>Arginina (%)</p>
      <input type="number" id="edit-Arginina-${element.id_alimento}" value="${mapa['Arginina'] || ''}">

      <p>Lisina (%)</p>
      <input type="number" id="edit-Lisina-${element.id_alimento}" value="${mapa['Lisina'] || ''}">

      <p>Treonina (%)</p>
      <input type="number" id="edit-Treonina-${element.id_alimento}" value="${mapa['Treonina'] || ''}">
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input type="number" id="edit-Metionina-${element.id_alimento}" value="${mapa['Metionina'] || ''}">

      <p>Metionina + Cisteína (%)</p>
      <input type="number" id="edit-Metionina_Cisteina-${element.id_alimento}" value="${mapa['Metionina_Cisteina'] || ''}">

      <p>Triptófano (%)</p>
      <input type="number" id="edit-Triptofano-${element.id_alimento}" value="${mapa['Triptofano'] || ''}">

      <p>Imagen (opcional)</p>
      <input  type="file" id="edit-imagen-${element.id_alimento}" class="input__id" accept="image/*">
    </section>
  </div>

  <div class="modal-footer">
    <button onclick="cerrarModal('edit', ${element.id_alimento})" class="btn">Cancelar</button>
    <button onclick="guardarCambios(${element.id_alimento})" class="btn">Guardar</button>
  </div>
</dialog>
<!-- Modal eliminar -->
<dialog class="dialog-icon-dele" id="modal-dele-${element.id_alimento}">
  <div class="title-dialog">
    <h2>Eliminar registro del alimento</h2>
  </div>
  <hr>
  <p>Eliminar el registro sin saber si el alimento tiene trazabilidad puede alterar el sistema.  
     Es preferible cambiar el estado del alimento a inactivo.</p>
  <span>¿Está seguro que quiere eliminar este registro?</span>
  <div class="container-button-dele1">
    <button class="btn" onclick="eliminar_alimento(${element.id_alimento})">Eliminar</button>
    <button class="btn" onclick="cerrarModal('dele', ${element.id_alimento})">Cancelar</button>
  </div>
</dialog>
                `;
            });
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                title: "Error",
                text: "Hubo un problema al consultar el alimento",
                icon: "error",
                confirmButtonText: "OK"
            }).then((result) => {
                if (result.isConfirmed) {
                    consulta_individual_alimento()
                }
            });
        });
}























// ----------------------------- comandoz de voz
function iniciarComandosDeVoz() {
    // Crear reconocimiento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = false;

    // Cuando escucha y obtiene un resultado
    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Escuchado:", transcript);

        // ---- ACCIONES SEGÚN PALABRAS CLAVE ----
        
        if (transcript.includes("crear dieta")) {
            console.log("Acción: ir a crear dieta");
            window.location.href = "/src/templates/add_dietas.html";
        }

if (transcript.includes("ver") && transcript.includes("alimentos")) {
    window.location.href = "/src/templates/alimentos.html";
}


        if (transcript.includes("cerrar sesión") || transcript.includes("cerrar sesion")) {
            console.log("Acción: cerrar sesión");
            // Aquí puedes poner tu logout real
            alert("Sesión cerrada");
        }

        if (transcript.includes("inicio") || transcript.includes("home")) {
            console.log("Acción: ir al inicio");
            window.location.href = "/index.html";
        }

    };

    // Inicia la escucha
    recognition.onstart = () => {
        console.log("🎤 Esperando comandos de voz...");
    };

    recognition.onerror = (event) => {
        console.error("Error en voz:", event.error);
    };

    recognition.start();
}
