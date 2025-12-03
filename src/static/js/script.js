const URL_BASE = 'http://127.0.0.1:5000'

// =============================================
// FUNCIONES AUXILIARES Y UTILIDADES
// =============================================

// Función auxiliar para obtener los headers con autorización
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// Función para verificar si el token existe y está válido
async function verifyToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No hay token disponible");
    }
    return true;
}

// Función para manejar errores de autenticación
function handleAuthError(error) {
    console.error("Error de autenticación:", error);
    if (error.message === "No hay token disponible" || error.message.includes("401")) {
        Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Por favor inicia sesión nuevamente.',
            confirmButtonText: 'Ir al login'
        }).then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'index.html';
        });
    }
}

// CACHE UTILIZADO PARA RAZAS Y ETAPAS
const cache = {};

// FUNCION PARA RETORNAR EL CACHE O GUARDARLO SI NO EXISTE
async function cargar_cache(key, funcion) {
    if (!cache[key]){
        cache[key] = funcion();
    }
    return cache[key]
}

// FUNCION PARA OBTENER LAS RAZAS DESDE EL CACHE
function consultar_razas_cache() {
    return cargar_cache("razas", consultar_razas)
}

// FUNCION PARA OBTENER LAS ETAPAS DESDE EL CACHE
function consultar_etapas_cache() {
    return cargar_cache("etapas", consultar_etapas)
}

function consultar_porcinos_cache() {
    return cargar_cache("porcinos", consulta_general_porcinos)
}

// Funciones para abrir y cerrar diálogos
function abrirDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.showModal();
    }
}

function cerrarDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.close();
    }
}


function crearIconoEdit() {
    return `
        <div class="vector-edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="16" viewBox="0 0 21 16" fill="none">
                <g clip-path="url(#clip0_1160_1378)">
                    <path d="M10.0909 12L11.4091 10.6818L9.68182 8.95455L8.36364 10.2727V10.9091H9.45455V12H10.0909ZM15.0909 3.81818C14.9697 3.69697 14.8447 3.70076 14.7159 3.82955L10.7386 7.80682C10.6098 7.93561 10.6061 8.06061 10.7273 8.18182C10.8485 8.30303 10.9735 8.29924 11.1023 8.17045L15.0795 4.19318C15.2083 4.06439 15.2121 3.93939 15.0909 3.81818ZM16 10.5682V12.7273C16 13.6288 15.6799 14.3996 15.0398 15.0398C14.3996 15.6799 13.6288 16 12.7273 16H3.27273C2.37121 16 1.60038 15.6799 0.960227 15.0398C0.320076 14.3996 0 13.6288 0 12.7273V3.27273C0 2.37121 0.320076 1.60038 0.960227 0.960227C1.60038 0.320076 2.37121 0 3.27273 0H12.7273C13.2045 0 13.6477 0.094697 14.0568 0.284091C14.1705 0.337121 14.2386 0.424242 14.2614 0.545455C14.2841 0.674242 14.25 0.784091 14.1591 0.875L13.6023 1.43182C13.4962 1.53788 13.375 1.56818 13.2386 1.52273C13.0644 1.47727 12.8939 1.45455 12.7273 1.45455H3.27273C2.77273 1.45455 2.3447 1.63258 1.98864 1.98864C1.63258 2.3447 1.45455 2.77273 1.45455 3.27273V12.7273C1.45455 13.2273 1.63258 13.6553 1.98864 14.0114C2.3447 14.3674 2.77273 14.5455 3.27273 14.5455H12.7273C13.2273 14.5455 13.6553 14.3674 14.0114 14.0114C14.3674 13.6553 14.5455 13.2273 14.5455 12.7273V11.2955C14.5455 11.197 14.5795 11.1136 14.6477 11.0455L15.375 10.3182C15.4886 10.2045 15.6212 10.178 15.7727 10.2386C15.9242 10.2992 16 10.4091 16 10.5682ZM14.9091 2.18182L18.1818 5.45455L10.5455 13.0909H7.27273V9.81818L14.9091 2.18182ZM19.9545 3.68182L18.9091 4.72727L15.6364 1.45455L16.6818 0.409091C16.8939 0.19697 17.1515 0.0909091 17.4545 0.0909091C17.7576 0.0909091 18.0152 0.19697 18.2273 0.409091L19.9545 2.13636C20.1667 2.34848 20.2727 2.60606 20.2727 2.90909C20.2727 3.21212 20.1667 3.4697 19.9545 3.68182Z" fill="#8D8D8D"/>
                </g>
                <defs>
                    <clipPath id="clip0_1160_1378"><rect width="20.3636" height="16" fill="white"/></clipPath>
                </defs>
            </svg>
        </div>`;
}

// =============================================
// FUNCIONES DE DIÁLOGOS BASE
// =============================================

function crearDialogBaseRaza(id, clase, titulo, contenido, textoBoton, claseBoton, uniqueId, funct, params) {
    // Crear el dialogo
    const dialog = document.createElement("dialog");
    
    dialog.className = clase;
    dialog.id = id;
    // Armar contenido interno
    dialog.innerHTML = `
        ${ clase ? `
            <div class="container__btn__close">
                <button type="button" class="${clase.toLowerCase() === 'dialog__ges__raz' ? 'btn__close btn__close__cruds' : 'btn__close'}" onclick="cerrarDialog('${id}')">X</button>
            </div>
        ` : ''}
        <form onsubmit="event.preventDefault(); ${funct}('${uniqueId}')" class="layout_form_dialog">
            <div class="title-dialog">
                <h2>${titulo}</h2>
                <hr>
            </div>
            ${textoBoton ? `
                <div class="${textoBoton.toLowerCase() === 'siguiente' ? 'layout_registrar_etapa' : 'info_raza_etapa'}">${contenido}</div>
            ` : ''}
            ${textoBoton ? `
                <div class="container-button-${claseBoton.includes('cerrar') ? 'close' : 'guardar'}">
                    <button 
                    type="${['cerrar', 'continuar','siguiente'].includes(textoBoton.toLowerCase()) ? 'button' : 'submit'}"
                    class="${claseBoton}"
                    ${textoBoton.toLowerCase() === 'cerrar' ? `onclick="cerrarDialog('${id}')"` : ""}
                    ${funct && funct.toLowerCase() === 'eliminar_raza' 
                        ? `onclick="abrirDialog('dialog-delete-conf-r-${uniqueId}')"` 
                        : funct && funct.toLowerCase() === 'eliminar_etapa' 
                        ? `onclick="abrirDialog('dialog-delete-conf-e-${uniqueId}')"` 
                        : ""}
                    >
                    ${textoBoton}
                    </button>
            </div>` : ""}
        </form>
    `;
    document.body.appendChild(dialog)
    return ''
}

async function openModalEye(type, id) {
    const modal = document.getElementById("modal-eye");
    const content = document.getElementById('eye-content');
    const title = document.getElementById("modal-eye-title");
    const button = document.getElementById("button-eye");

    // Limpias contenido previo
    content.innerHTML = "";
    content.className = "";

    if (type === "porcino") {
        title.textContent = "Información del Porcino";
        content.classList.add("info-porcino");
        await cargarInfoPorcino(id, content);
    }

    if (type === "raza") {
        title.textContent = "Información de la Raza";
        content.classList.add("info_raza_etapa");
        await cargarInfoRaza(id, content);
    }

    if (type === "etapa") {
        title.textContent = "Información de la Etapa de Vida";
        content.classList.add("layout_registrar_etapa")
        button.onclick = "";
        button.textContent = "Siguiente";
        setTimeout(() => {
            activarSteps('modal-eye', '.button-guardar', "eye")
        }, 50);
        await cargarInfoEtapa(id, content);
    }

    if(type === 'tran_peso'){
        title.textContent = "Información de la Trasacción";
        content.classList.add("info_raza_etapa");
        await cargarInfoHistorial(id, content);
    }

    modal.showModal();

}

function resetModalEye() {
    const modal = document.getElementById("modal-eye");
    const content = document.getElementById("eye-content");

    // 1. Resetear Grid si existe
    const grid = modal.querySelector(".layout_registrar_etapa");
    if (grid) {
        grid.style.gridTemplateColumns = "";
    }
    
    // 2. Limpiar contenido dinámico
    content.innerHTML = "";
    content.className = "";
    
    
    // 3. Eliminar botones creados por activarSteps()
    const btnAtras = modal.querySelector(".btn-atras");
    if (btnAtras) btnAtras.remove();

    const btnGuardar = modal.querySelector(".button-eliminar[type='submit']");
    if (btnGuardar) btnGuardar.remove();

    // 4. Restaurar estado de Steps (si existen)
    const step1 = modal.querySelector("#step1");
    const step2 = modal.querySelector("#step2");

    if (step1 && step2) {
        step1.classList.add("active");
        step1.classList.remove("hidden");

        step2.classList.remove("active");
        step2.classList.add("hidden");
    }

    // 5. Restaurar el botón principal
    const mainBtn = document.getElementById("button-eye");
    if (mainBtn) {
        mainBtn.textContent = "Cerrar";
        mainBtn.style.display = "inline-block";
        mainBtn.onclick = () => modal.close();
    }
}

async function openModalEdit(type, id, funct) {
    const modal = document.getElementById("modal-edit");
    const content = document.getElementById('edit-content');
    const title = document.getElementById("modal-edit-title");
    const form = document.getElementById("form-edit")
    const button = document.getElementById("button-edit");

    form.onsubmit = function(event) {
        console.log(funct(id))
        event.preventDefault();
        funct(id)
    }
    
    // LIMPIAR BOTONES DE STEPS
    const btnAtras = modal.querySelector('.btn-atras');
    const btnGuardar = modal.querySelector('.btn-guardar');
    if (btnAtras) btnAtras.remove();
    if (btnGuardar) btnGuardar.remove();

    // Limpiar contenido previo
    content.innerHTML = "";
    content.className = "";

    if (type === "porcino") {
        title.textContent = "Actualizar datos del Porcino";
        content.classList.add("info-porcino");
        content.style.gridTemplateColumns = "";
        button.style.display = "inline-block";
        button.type = "submit";
        button.textContent = "Guardar";
        await cargarInfoPorcinoEdit(id, content);
    }
    
    if (type === "raza") {
        title.textContent = "Actualizar datos de la Raza";
        content.classList.add("info_raza_etapa");
        content.style.gridTemplateColumns = "";
        button.style.display = "inline-block";
        button.type = "submit";
        button.textContent = "Guardar";
        await cargarInfoRazaEdit(id, content);
    }

    if (type === "etapa") {
        title.textContent = "Actualizar datos de la Etapa de Vida";
        content.classList.add("layout_registrar_etapa");

        button.type = "button";
        button.textContent = "Siguiente";

        await cargarInfoEtapaEdit(id, content);

        activarSteps('modal-edit', '.button-guardar', "edit");
    }

    modal.showModal();
}

async function openModalDelete(type, id) {
    const modal = document.getElementById("modal-delete");
    const content = document.getElementById('delete-content');
    const title = document.getElementById("modal-delete-title");
    const button = document.getElementById("button-delete");

    // Limpiar contenido previo
    content.innerHTML = "";
    content.className = "";

    if (type === "porcino") {
        title.textContent = "Eliminar datos del Porcino";
        button.dataset.id = id;
        button.dataset.type = "porcino";
        await cargarInfoDelete(`el ${type}`,content);
    }
    
    if (type === "raza") {
        title.textContent = "Eliminar datos de la Raza";
        button.dataset.id = id;
        button.dataset.type = "raza";
        
        await cargarInfoDelete(`la ${type}`,content);
    }
    
    if (type === "etapa") {
        title.textContent = "Delete datos de la Etapa de Vida";
        button.dataset.id = id;
        button.dataset.type = "etapa";
        await cargarInfoDelete(`la ${type}`,content);
    }

    modal.showModal();
}

// MODAL PARA CONFIRMAR LA ELIMINACION LA INFORMACION DE LOS PORCINOS, ETAPA Y RAZA
async function openModalDeleteConfirm(type, id, funct) {
    const modal = document.getElementById("modal-delete-confirm");
    const content = document.getElementById('delete-content-confirm');
    const title = document.getElementById("modal-delete-confirm-title");
    const form = document.getElementById("form-delete-confirm")
    const button = document.getElementById("button-delete-confirm");

    form.onsubmit = function(event) {
        event.preventDefault();
        funct(id)
    }

    // Limpiar contenido previo
    content.innerHTML = "";

    if (type === "porcino") {
        title.textContent = "Eliminar datos del Porcino";
        await cargarInfoDeleteConfirm(id,content);
    }
    
    if (type === "raza") {
        title.textContent = "Eliminar datos de la Raza";
        await cargarInfoDeleteConfirm(id,content);
    }

    if (type === "etapa") {
        title.textContent = "Delete datos de la Etapa de Vida";
        await cargarInfoDeleteConfirm(id, content);
    }

    modal.showModal();
}

// FUNCIONES PARA CARGAR LA INFORMACION DEL MODAL EYE
async function cargarInfoPorcino(id, container) {
    const data = await consulta_individual_porcino(id, false);
    const p = data.Porcinos[0];
    let fechaBD = p.fecha_nacimiento
    let fecha = new Date(fechaBD)
    const fecha_formateada = fecha.toISOString().split("T")[0];

    container.innerHTML = `
        <div class="container__label__input">
            <label>ID</label>
            <input type="text" value="${p.id_porcino}" disabled>
        </div>

        <div class="container__label__input">
            <label>Peso Inicial (Kg)</label>
            <input type="text" value="${p.peso_inicial}" disabled>
        </div>

        <div class="container__label__input">
            <label>Peso Final (Kg)</label>
            <input type="text" value="${p.peso_final}" disabled>
        </div>

        <div class="container__label__input">
            <label>Fecha Nacimiento</label>
            <input type="text" value="${fecha_formateada}" disabled>
        </div>

        <div class="container__label__input">
            <label>Sexo</label>
            <input type="text" value="${p.sexo}" disabled>
        </div>

        <div class="container__label__input">
            <label>Raza</label>
            <input type="text" value="${p.raza}" disabled>
        </div>

        <div class="container__label__input">
            <label>Etapa de Vida</label>
            <input type="text" value="${p.etapa}" disabled>
        </div>

        <div class="container__label__input">
            <label>Estado</label>
            <input type="text" value="${p.estado}" disabled>
        </div>

        <div class="container__label__input">
            <label>Descripcion</label>
            <input type="text" value="${p.descripcion}" disabled>
        </div>
    `;
}

async function cargarInfoRaza(id, container) {
    try {
        const data = await consulta_indi_raza(id, false);
        console.log(data)
        const r = data.razas[0];
    
        container.innerHTML = `
        <div class="container__label__input">
            <label>ID</label>
            <input type="text" value="${r.id_raza}" disabled>
        </div>
        
        <div class="container__label__input">
            <label>Nombre</label>
            <input type="text" value="${r.nombre}" disabled>
        </div>
        
        <div class="container__label__input">
            <label>Descripción</label>
            <textarea disabled>${r.descripcion}</textarea>
        </div>
        `;
    } catch (error) {
        console.error(error)
    }
}

async function cargarInfoEtapa(id, container) {
    const data = await consulta_indi_etapas(id, false);
    const e = data.etapas[0];
    const mapaReq = {};
    
    e.requerimientos.forEach(req => {
        mapaReq[req.nombre_elemento.toLowerCase()] = req.porcentaje || 0;
    });
    
    container.innerHTML = `
    <div id="step1" class="step">
        <div class="container__label__input">
        <label>ID Etapa:</label>
        <input type="text" value="${e.id_etapa}" disabled>
        </div>
        
        <div class="container__label__input">
        <label>Nombre de Etapa</label>
        <input type="text" value="${e.nombre}" disabled>
        </div>
        
        <div class="container__label__input">
        <label>Peso Mínimo (Kg)</label>
        <input type="text" value="${e.peso_min}" disabled>
        </div>
        
        <div class="container__label__input">
        <label>Peso Máximo (Kg)</label>
        <input type="text" value="${e.peso_max}" disabled>
        </div>
        
        <div class="container__label__input">
        <label>Dias de Duración</label>
        <input type="text" value="${e.duracion_dias}" disabled>
        </div>
        
        <div class="container__label__input">
        <label>Semanas de Duración</label>
        <input type="text" value="${e.duracion_semanas}" disabled>
        </div>
        
        <div class="container__label__input">
        <label>Descripcion (Opcional)</label>
        <input type="text" value="${e.descripcion}" disabled>
        </div>
    </div>
    

    <div id="step2" class="step">

        <div class="container__label__input">
            <label>E. Metabolizable (Kcal/Kg)</label>
            <input type="text" value="${mapaReq['energia_metabo'] || 0}" disabled>
        </div>
        
        <div class="container__label__input">
            <label>Proteína Cruda (%)</label>
            <input type="text" value="${mapaReq['proteina_cruda'] || 0 }" disabled>
        </div>

        <div class="container__label__input">
            <label>Fibra Cruda (%)</label>
            <input type="text" value="${mapaReq['fibra_cruda'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Extracto Etéreo (%)</label>
            <input type="text" value="${mapaReq['extracto_etereo'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Calcio (%)</label>
            <input type="text" value="${mapaReq['calcio'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Fosforo (%)</label>
            <input type="text" value="${mapaReq['fosforo'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Sodio (%)</label>
            <input type="text" value="${mapaReq['sodio'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Arginina (%)</label>
            <input type="text" value="${mapaReq['arginina'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Lisina (%)</label>
            <input type="text" value="${mapaReq['lisina'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Treonina (%)</label>
            <input type="text" value="${mapaReq['treonina'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Metionina</label>
            <input type="text" value="${mapaReq['metionina'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Metionina + Cisteína (%)</label>
            <input type="text" value="${mapaReq['metionina_cisteina'] || 0}" disabled>
        </div>

        <div class="container__label__input">
            <label>Triptófano (%)</label>
            <input type="text" value="${mapaReq['triptofano'] || 0}" disabled>
        </div>

    </div>
    
    `;
}

async function cargarInfoHistorial(id, container) {
    const data = await consulta_individual_transaccion(id, false);    
    const h = data.Historial;
    //FECHA FORMATEADA DOCUMENTO
    let fecha_documento = h.fecha_documento
    let fecha_doc = new Date(fecha_documento)
    const fecha_formateada_doc = fecha_doc.toISOString().split("T")[0];


    //FECHA FORMATEADA PESAJE
    let fecha_pesaje = h.fecha_pesaje
    let fecha_pes = new Date(fecha_pesaje)
    const fecha_formateada_pesaje = fecha_pes.toISOString().split("T")[0];


    container.innerHTML = `

    <div class="lay_content_histirial">
        <div class="container__label__input">
            <label>ID</label>
            <input type="text" value="${h.id_documento}" readonly>
        </div>
            
        <div class="container__label__input">
            <label>Fecha Documento</label>
            <input type="text" value="${fecha_formateada_doc}" readonly>
        </div>
            
        <div class="container__label__input">
            <label>Fecha Pesaje</label>
            <input type="text" value="${fecha_formateada_pesaje}" readonly>
        </div>

        <div class="container__label__input">
            <label>ID Porcino</label>
            <input type="text" value="${h.id_porcino}" readonly>
        </div>
        
        <div class="container__label__input">
            <label>Peso Registrado (Kg)</label>
            <input type="text" value="${h.peso_final}" readonly>
        </div>
        
        <div class="container__label__input">
            <label>Usuario</label>
            <input type="text" value="${h.nombre}" readonly>
        </div>
        
        <textarea id="textare_eye_historial" readonly>
            ${h.descripcion}
        </textarea>
    </div>
    `;
}

// FUNCIONES PARA CARGAR LA INFORMACION DEL MODAL EDIT
async function cargarInfoPorcinoEdit(id, container) {
    // CONSULTA DEL PORCINO POR SU ID
    const data = await consulta_individual_porcino(id, false);
    const p = data.Porcinos[0];

    // FORMATEO DE LA FECHA DE NACIMIENTO
    let fechaBD = p.fecha_nacimiento
    let fecha = new Date(fechaBD)
    const fecha_formateada = fecha.toISOString().split("T")[0];

    // OBTENCION DE LAS RAZAS Y ETAPAS (CACHE)
    const razas = await consultar_razas_cache()
    const etapas = await consultar_etapas_cache()

    // CAMBIO DEL CONTENIDO DEL MODAL
    container.innerHTML = `
        <div class="container__label__input">
        <label>ID</label>
            <div class="container-inputs">
            <input type="text" value="${p.id_porcino}" disabled>
            </div>
        </div>

        <div class="container__label__input">
            <label>Peso Inicial (Kg)</label>
            <div class="container-inputs">
            
            <input id="peso-ini-actu-${id}" type="text" value="${p.peso_inicial}">
            ${crearIconoEdit()}
            </div>
        </div>
            
        <div class="container__label__input">
            <label>Peso Final (Kg)</label>
            <div class="container-inputs">
            <input id="peso-final-actu-${id}" type="text" value="${p.peso_final}" disabled>
            </div>
        </div>
            
        <div class="container__label__input">
            <label>Fecha Nacimiento</label>
            <div class="container-inputs">
                <input id="fecha-naci-actu-${id}" type="date" value="${fecha_formateada}" disabled>
                
            </div>
        </div>

        <div class="container__label__input">
            <label>Sexo</label>
            <div class="container-inputs">
                <select id="sexo-actu-${id}" >
                    <option value = "${p.sexo}" selected disabled>${p.sexo}</option>
                    <option value = "Macho">Macho</option>
                    <option value = "Hembra">Hembra</option>
                </select>
                ${crearIconoEdit()}
            </div>
        </div>

        <div class="container__label__input">
            <label>Raza</label>
            <div class="container-inputs">
                <select id="raza-actu-${id}" >
                    ${crear_opciones_select("razas", razas, p.raza)}
                </select>
            ${crearIconoEdit()}
            </div>
        </div>

        <div class="container__label__input">
            <label>Etapa de Vida</label>
            <div class="container-inputs">
                <select id="etapa-vida-actua-${id}" disabled>
                    ${crear_opciones_select("etapas", etapas, p.etapa)}
                </select>
            
            </div>
        </div>

        <div class="container__label__input">
            <label>Estado</label>
            <div class="container-inputs">
                <select id="estado-actu-${id}" >
                    <option value = "${p.estado}" selected disabled>${p.estado}</option>
                    <option value = "Activo">Activo</option>
                    <option value = "Inactivo">Inactivo</option>
                </select>
                ${crearIconoEdit()}
            </div>
        </div>

        <div class="container__label__input">
            <label>Descripcion</label>
            <div class="container-inputs">
            <input id="descripcion-actu-${id}" type="text" value="${p.descripcion}">
            ${crearIconoEdit()}
            </div>
        </div>
    `;
}

async function cargarInfoRazaEdit(id, container) {
    const data = await consulta_indi_raza(id, false);
    const r = data.razas[0];

    container.innerHTML = `
    <div class="container__label__input">
        <label>ID</label>
        <input type="text" value="${r.id_raza}" disbled>
    </div>
    
    <div class="container__label__input">
        <label>Nombre</label>
        <input type="text" id="nombre-raza-actualizar-${id}" value="${r.nombre}" >
    </div>
    
    <div class="container__label__input">
        <label>Descripción</label>
        <textarea id="descripcion-raza-actualizar-${id}">${r.descripcion}</textarea>
    </div>
    `;
}

async function cargarInfoEtapaEdit(id, container) {
    const data = await consulta_indi_etapas(id, false);
    const e = data.etapas[0];
    const mapaReq = {};
    
    e.requerimientos.forEach(req => {
        mapaReq[req.nombre_elemento.toLowerCase()] = req.porcentaje || 0;
    });
    
    container.innerHTML = `
    <div id="step1" class="step">
        <div class="container__label__input">
        <label>ID Etapa:</label>
        <input id="" type="text" value="${e.id_etapa}" disabled>
        </div>
        
        <div class="container__label__input">
        <label>Nombre de Etapa</label>
        <input id="nombre-etapa-actu-${id}" type="text" value="${e.nombre}" >
        </div>
        
        <div class="container__label__input">
        <label>Peso Mínimo (Kg)</label>
        <input id="peso-min-etapa-actu-${id}" type="text" value="${e.peso_min}" >
        </div>
        
        <div class="container__label__input">
        <label>Peso Máximo (Kg)</label>
        <input id="peso-max-etapa-actu-${id}" type="text" value="${e.peso_max}" >
        </div>
        
        <div class="container__label__input">
        <label>Dias de Duración</label>
        <input id="dias-dura-etapa-actu-${id}" type="text" value="${e.duracion_dias}" >
        </div>
        
        <div class="container__label__input">
        <label>Semanas de Duración</label>
        <input id="semanas-dura-etapa-actu-${id}" type="text" value="${e.duracion_semanas}" >
        </div>
        
        <div class="container__label__input">
        <label>Descripcion (Opcional)</label>
        <input id="descripcion-etapa-actu-${id}" type="text" value="${e.descripcion}" >
        </div>
    </div>
    

    <div id="step2" class="step">

        <div class="container__label__input">
            <label>E. Metabolizable (Kcal/Kg)</label>
            <input id="energia-metabo-actu-${id}" type="text" value="${mapaReq['energia_metabo'] || 0}" >
        </div>
        
        <div class="container__label__input">
            <label>Proteína Cruda (%)</label>
            <input id="proteina-cruda-actu-${id}" type="text" value="${mapaReq['proteina_cruda'] || 0 }" >
        </div>

        <div class="container__label__input">
            <label>Fibra Cruda (%)</label>
            <input id="fibra-cruda-actu-${id}" type="text" value="${mapaReq['fibra_cruda'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Extracto Etéreo (%)</label>
            <input id="extracto-etereo-actu-${id}" type="text" value="${mapaReq['extracto_etereo'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Calcio (%)</label>
            <input id="calcio-actu-${id}" type="text" value="${mapaReq['calcio'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Fosforo (%)</label>
            <input id="fosforo-disponible-actu-${id}" type="text" value="${mapaReq['fosforo'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Sodio (%)</label>
            <input id="sodio-actu-${id}" type="text" value="${mapaReq['sodio'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Arginina (%)</label>
            <input id="arginina-actu-${id}" type="text" value="${mapaReq['arginina'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Lisina (%)</label>
            <input id="lisina-actu-${id}" type="text" value="${mapaReq['lisina'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Treonina (%)</label>
            <input id="treonina-actu-${id}" type="text" value="${mapaReq['treonina'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Metionina</label>
            <input id="metionina-actu-${id}" type="text" value="${mapaReq['metionina'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Metionina + Cisteína (%)</label>
            <input id="metionina-cisteina-actu-${id}" type="text" value="${mapaReq['metionina_cisteina'] || 0}" >
        </div>

        <div class="container__label__input">
            <label>Triptófano (%)</label>
            <input id="triptofano-actu-${id}" type="text" value="${mapaReq['triptofano'] || 0}" >
        </div>

    </div>
    
    `;
}

// FUNCION PARA CARGAR LA INFOMACION DEL MODAL DELETE
async function cargarInfoDelete(type,container) {
    container.innerHTML = `
        <p>Eliminar el registro sin saber si ${type} tiene trazabilidad puede que altere el funcionamiento del sistema, es preferible que cambie el estado del porcino a inactivo.</p>
        <span>¿Está seguro que quiere eliminar este registro?</span>
    `;
}

// FUNCION PARA CARGAR EL MODAL CONFIRMAR ELIMINACION
async function cargarInfoDeleteConfirm(id,container) {
    container.innerHTML = `
        <p>Escriba debajo el ID "${id}" y presione eliminar si asi lo desea</p>
        <input id="input-eliminar-${id}" class="input__add__por" type="number" oninput="this.value = Math.abs(this.value)" placeholder= "Ingrese el ID">
    `;
}

// =============================================
// DIÁLOGOS PARA RAZAS
// =============================================

function crearDialogRegistrarRaza(){
    const campos = [
        {label: 'Nombre', id: 'nombre_raza', required: false},
        {label: 'Descripcion', id: 'descripcion_raza', required: true},
    ]
    
    const camposHTML = campos.map(campo => `
        <div class = "container__label__input">
            <label for="${campo.id}">${campo.label}</label>
            <input type="text" class="campo-info" id="${campo.id}" ${campo.required ? '' : 'required'}>
        </div>
        `).join('');
    return crearDialogBaseRaza(`dialog-registrar-raza`, 'dialog-icon-eye', 'Registrar Raza', camposHTML, 'Guardar', 'button-guardar', '', 'registrar_raza','');
}

// =============================================
// DIÁLOGOS PARA ETAPAS
// =============================================

function crearDialogRegistrarEtapa() {
    // ===========================
    // 1. Campos del STEP 1
    // ===========================
    const campos1 = [
        {label: "Nombre", id: "nombre_etapa", required: false, placeholder : "Ingrese el nombre de la etapa..."},
        {label: 'Peso Minimo (Kg)', id: 'peso_min_etapa', required: false, type : "number", placeholder : "Ingrese el peso minimo..."},
        {label: 'Peso Maximo (Kg)', id: 'peso_max_etapa', required: false, type : "number", placeholder : "Ingrese el peso maximo..."},
        {label: 'Dias de duración', id: 'dias_dura_etapa', required: false, type : "number", placeholder : "Duración en días..."},
        {label: 'Semana de duración', id: 'semanas_dura_etapa', required: false, type : "number", placeholder : "Duración en semanas..."},
        {label: 'Descripcion (Opcional)', id: 'descripcion_etapa', required: true, type : "text", placeholder : "Descripción..."},
    ];

    const htmlStep1 = campos1.map(c => `
        <div class="container__label__input">
            <label>${c.label}</label>
            <input type="${c.type || 'text'}" id="${c.id}" min="0" placeholder="${c.placeholder}">
        </div>
    `).join('');

    // ===========================
    // 2. Campo del STEP 2
    // ===========================
    
    const campos2 = [
        {label: "E. Metabolizable (Kcal/Kg)", id: "r-energia-metabo", required: false, type: "number", placeholder : "Ingrese la Energia Metabolizable"},
        {label: "Proteína Cruda (%)", id: "r-proteina-cruda", required: false, type: "number", placeholder : "Ingrese la Proteina Cruda"},
        {label: "Fibra Cruda (%)", id: "r-fibra-cruda", required: false, type: "number", placeholder : "Ingrese la Fibra Cruda"},
        {label: "Extracto Etéreo (%)", id: "r-extracto-etereo", required: false, type: "number", placeholder : "Ingrese la Extracto Etéreo"},
        {label: "Calcio (%)", id: "r-calcio", required: false, type: "number", placeholder : "Ingrese el Calcio"},
        {label: "Fosforo Disponible (%)", id: "r-fosforo-disponible", required: false, type: "number", placeholder : "Ingrese el Fosforo Disponible"},
        {label: "Sodio (%)", id: "r-sodio", required: false, type: "number", placeholder : "Ingrese el sodio"},
        {label: "Arginina (%)", id: "r-arginina", required: false, type: "number", placeholder : "Ingrese la Arginina"},
        {label: "Lisina (%)", id: "r-lisina", required: false, type: "number", placeholder : "Ingrese la Lisina"},
        {label: "Treonina (%)", id: "r-treonina", required: false, type: "number", placeholder : "Ingrese la Treonina"},
        {label: "Metionina (%)", id: "r-metionina", required: false, type: "number", placeholder : "Ingrese la Metionina"},
        {label: "Metionina + Cisteína (%)", id: "r-metionina-cisteina", required: false, type: "number", placeholder : "Ingrese la Metionina + Cisteína"},
        {label: "Triptófano (%)", id: "r-triptofano", required: false, type: "number", placeholder : "Ingrese el Triptófano"},
    ]

    const htmlStep2 = campos2.map(campo => `
        <div class="container__label__input">
            <label>${campo.label}</label>
            <input type="${campo.type || 'text'}" id="${campo.id}" placeholder="${campo.placeholder} min="0"">
        </div>
    `).join('');

    // ===========================
    // 3. Creamos STEP 1 y STEP 2
    // ===========================
    
    const contenido = `
        <div id="step1" class="step">
            ${htmlStep1}
        </div>

        <div id="step2" class="step">
            ${htmlStep2}
        </div>
    `;

    // ===========================
    // 4. Crear el modal como siempre
    // ===========================
    crearDialogBaseRaza(
        'dialog-registrar-etapa',
        'dialog-icon-eye',
        'Registrar Etapa de vida',
        contenido,
        'Siguiente',                  
        'button-guardar',             // CLASE REAL DEL BOTÓN
        '',
        'registrar_etapas', 
        ''
    );

    // ===========================
    // 4. Activar steps correctamente
    // ===========================
    setTimeout(() => {
        activarSteps("dialog-registrar-etapa", ".button-guardar", 'add');
    }, 50);
}

function activarSteps(modalId, botonSelector, funct) {

    const modal = document.getElementById(modalId);
    const btn_siguiente = modal.querySelector(botonSelector);
    const grid = modal.querySelector(".layout_registrar_etapa");
    
    const step1 = modal.querySelector("#step1");
    const step2 = modal.querySelector("#step2");
    
    if (!step1 || !step2) return;
    
    grid.style.gridTemplateColumns = "repeat(2,1fr)";
    
    // Estado inicial correcto
    step1.classList.add("active");
    step2.classList.remove("active");
    
    let btnAtras = modal.querySelector('.btn-atras');
    let btn_guardar = modal.querySelector('.btn-guardar');
    // Crear botón Atrás
    if (!btnAtras){
        btnAtras = document.createElement("button");
        btnAtras.textContent = "Atrás";
        btnAtras.classList = "btn-atras button-eliminar";
        btnAtras.style.display = "none";
        btnAtras.type = "button";
        btn_siguiente.parentElement.appendChild(btnAtras);
    }
    
    // crear boton guardar
    if (!btn_guardar){
        btn_guardar = document.createElement("button");
        btn_guardar.textContent = "Guardar"
        btn_guardar.classList = "btn-guardar button-eliminar";
        btn_guardar.style.display = "none";
        btn_guardar.type = "submit"
        btn_siguiente.parentElement.appendChild(btn_guardar);
    }


    // BOTÓN SIGUIENTE / GUARDAR
    btn_siguiente.addEventListener("click", () => {

        // Si estamos en STEEP 1 → pasar a STEP 2
        if (step1.classList.contains("active")) {

            step1.classList.remove("active");
            step1.classList.add("hidden");

            step2.classList.remove("hidden");
            step2.classList.add("active");

            grid.style.gridTemplateColumns = "repeat(4,1fr)";

            btnAtras.style.display = "inline-block";
            if (funct != 'eye'){
                btn_guardar.style.display = "inline-block";
            } 
            btn_siguiente.style.display = "none";
        };
    });

    // BOTÓN ATRÁS
    btnAtras.addEventListener("click", () => {

        btn_siguiente.textContent = "Siguiente";
        step2.classList.remove("active");

        step2.classList.add("hidden");

        step1.classList.remove("hidden");
        step1.classList.add("active");

        grid.style.gridTemplateColumns = "repeat(2,1fr)";

        btnAtras.style.display = "none";
        btn_guardar.style.display = "none";
        btn_siguiente.style.display = "inline-block";
    });
}

// =============================================
// DIÁLOGOS PARA HISTORIAL DE PESOS
// =============================================

function alertaSobreDialogs(pesoIngresado, pesoActual) {
    const modal_actualizar_peso = document.getElementById("dialog-actualizar-peso");
    const modal_gestionar_historial = document.getElementById("dialog__his__peso")

    const estaba_abierto_map = modal_actualizar_peso.open;
    const estaba_abierto_mgh = modal_gestionar_historial.open
    if (estaba_abierto_map) modal_actualizar_peso.close();
    if (estaba_abierto_mgh) modal_gestionar_historial.close();

    Swal.fire({
        title: "Peso inválido",
        html: `
            <b>El peso ingresado es menor al peso actual del porcino.</b><br><br>
            <span style="font-size: 14px;">
                <b>Ingresado:</b> ${pesoIngresado} kg <br>
                <b>Peso actual:</b> ${pesoActual} kg
            </span>
        `,
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#facc15",
    }).then(() => {
        if (estaba_abierto_mgh) modal_gestionar_historial.showModal() ;
        if (estaba_abierto_map) modal_actualizar_peso.showModal();
    });
}

async function crearDialogActualizarPesoHistorial(){
    const nm = await conteoNumeroConsecutivo();
    const porcinos = await consultar_porcinos_cache();
    const campos = [
        { label: 'Fecha de pesaje', id: 'fecha-pesaje-actu', type: 'date', required: true },
        { label: 'ID porcino', id: 'id-porcino-actu', type: 'select', options: porcinos.Porcinos.map(por => por.id_porcino), required: true, placeholder: "Seleccione el ID del porcino" },
        { label: 'Peso final', id: 'peso-final-actu', type: 'number', required: true, placeholder: "Digite el peso en Kg" },
        { label: 'Usuario', id: 'id-usuario-actu', type: 'text', required: true, placeholder: "Juan Tovar", value: 1 },
    ];

    const camposHTML = campos.map(campo => {
        // Si el campo es un SELECT
        if (campo.type === 'select') {
            const opciones = campo.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            return `
                <div class="container__label__input container__label__input__actupeso">
                    <label for="${campo.id}">${campo.label}</label>
                    <select id="${campo.id}" class="input__actu__peso" ${campo.required ? 'required' : ''}>
                        <option value="">${campo.placeholder}</option>
                        ${opciones}
                    </select>
                </div>
            `;
        }

        // Si el campo es el usuario (mostrar nombre pero enviar ID oculto)
        if (campo.id === 'id-usuario-actu') {
            return `
                <div class="container__label__input container__label__input__actupeso">
                    <label for="${campo.id}">${campo.label}</label>

                    <!-- Input visible (muestra el nombre del usuario) -->
                    <input 
                        type="text"
                        class="input__actu__peso"
                        id="${campo.id}-nombre"
                        value="${campo.placeholder}" 
                        readonly
                    >

                    <!-- Input oculto (envía el ID real del usuario al backend) -->
                    <input 
                        type="hidden"
                        id="${campo.id}"
                        value="${campo.value}"
                    >
                </div>
            `;
        }

        // Si es input normal (text, date, number, etc.)
        return `
            <div class="container__label__input container__label__input__actupeso">
                <label for="${campo.id}">${campo.label}</label>
                <input 
                    type="${campo.type || 'text'}"
                    class="input__actu__peso"
                    id="${campo.id}"
                    value="${campo.id}"
                    placeholder="${campo.placeholder || ''}"
                    ${campo.required ? 'required' : ''}
                >
            </div>
        `;
    }).join('');

    const HTML = `
        <div class='container layout_actualizar_peso'>
            <div class='lay_actu_s1'>
                <span class="span__actu_peso" id="span_num_consec">N.C: ${nm.Conteo + 1}</span>
                ${camposHTML}
            </div>
            <div class='lay_actu_s2'>
                <span class="span__actu_peso" id="span_fecha">${new Date().toLocaleDateString()}</span>
                <span class="span__actu_peso">Preview</span>
                <container class="container__preview"> 
                    <p class="content__preview" id="descripcion-actu">
                        Seleccione el ID del porcino...
                    </p>
                </container>
            </div>
        </div>
    `;

    setTimeout(() => {
    const selectPorcino = document.getElementById('id-porcino-actu');
    const input_peso_final = document.getElementById('peso-final-actu');
    const descripcion = document.getElementById('descripcion-actu');

    let peso_actual_porcino = null;
    let debounceTimer = null;

    // Cambio de porcino
    selectPorcino.addEventListener('change', async (e) => {
        const idPorcino = e.target.value;
        if (idPorcino) {
            const porcino = await consulta_individual_porcino(idPorcino, false);
            actualizarPreview(porcino, input_peso_final.value, descripcion);
        }
    });

    // Input peso final con debounce
    input_peso_final.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(async () => {
            const idPorcino = selectPorcino.value;
            let porcino = null;

            // Si no hay porcino seleccionado, no validar
            if (!idPorcino) return;

            porcino = await consulta_individual_porcino(idPorcino, false);
            peso_actual_porcino = porcino.Porcinos[0].peso_final;

            //  NO VALIDAR SI EL INPUT ESTÁ VACÍO
            if (!input_peso_final.value.trim()) {
                actualizarPreview(porcino, "", descripcion);
                return;
            }

            const peso_final_actualizado = parseFloat(input_peso_final.value);

            // Si no es número válido, no validar
            if (isNaN(peso_final_actualizado)) return;

            // Validación
            if (peso_final_actualizado < peso_actual_porcino) {
                alertaSobreDialogs(peso_final_actualizado,peso_actual_porcino)
            }

            actualizarPreview(porcino, input_peso_final.value, descripcion);

        }, 2000);
    });

}, 500);
    return crearDialogBaseRaza('dialog-actualizar-peso', 'dialog__ges__raz', 'Actualizar Peso', HTML, 'Guardar', 'button-guardar', '', 'actualizar_peso_historial', '');
}

function actualizarPreview(porcino, peso, elementoTexto) {
    if (!porcino) {
        elementoTexto.textContent = "Seleccione el ID del porcino...";
        return;
    }
    const raza = porcino.Porcinos[0].raza || "XX";
    const sexo = porcino.Porcinos[0].sexo || "XX";
    const etapa = porcino.Porcinos[0].etapa || "XX";
    const id = porcino.Porcinos[0].id_porcino || "XX";
    const usuario = "Juan Tovar";

    elementoTexto.textContent = `
        El porcino identificado con el ID ${id}, siendo de raza ${raza}, sexo ${sexo} y etapa de vida ${etapa},
        después de su último pesaje registrado por el usuario ${usuario}, presenta un peso de ${peso || "XX"} Kg.
    `;
}

// =============================================
// FUNCIONES DE GESTIÓN DE PORCINOS
// =============================================

function paginacion_porcinos(porcinos){
    
    const registros_por_pagina = 3;
    let pagina_actual = 1;
    const total_paginas = Math.ceil(porcinos.Porcinos.length / registros_por_pagina);

    // LIMPIAR LISTENERS ANTERIORES
    const contenedor = document.getElementById("paginacion_porcino");
    contenedor.replaceWith(contenedor.cloneNode(true));

    // OBTENER LOS REGISTROS DE UNA PAGINA  
    function obtener_pagina(pagina){
        const registro_inicial = (pagina - 1) * registros_por_pagina;
        const registro_final = registro_inicial + registros_por_pagina;
        return porcinos.Porcinos.slice(registro_inicial,registro_final)
    }

    function mostrar_porcinos() {
        const info = obtener_pagina(pagina_actual).map(item => crearFilaPorcino(item)).join('');
        document.getElementById('info_porcinos').innerHTML = info;
    }

    function crearFilaPorcino(item) {
        const uniqueId = item.id_porcino;
        return `
            <tr class="registro" porcino-id="${uniqueId}">
                <td class="td__border__l">
                    <img src="/src/static/iconos/registro pig.svg" alt="" class="svg__pig">
                </td>
                <td>${item.id_porcino}</td>
                <td>${item.sexo}</td>
                <td>${item.raza}</td>
                <td>${item.etapa}</td>
                <td>${item.peso_final} KG</td>
                <td>${item.estado}</td>
                <td class="td__border__r">
                    ${crearIconosAcciones(uniqueId)}
                </td>
            </tr>`;
    }

    function crearIconosAcciones(id) {
        return `
            <button class="icon-eye" data-id="${id}" data-type="porcino"><img src="/src/static/iconos/icono eye.svg" alt="ver informacion"></button>
            <button class="icon-edit" data-id="${id}" data-type="porcino"><img src="/src/static/iconos/edit icon.svg" alt="editar informacion"></button>
            <button class="icon-delete" data-id="${id}" data-type="porcino"><img src="/src/static/iconos/delete icon.svg" alt="eliminar informacion"></button>
        `;
    }

    function render_paginacion(){
        const cont = document.getElementById('paginacion_porcino');
        cont.innerHTML = `

        <span>Porcinos Totales: ${porcinos.Porcinos.length}</span>

        <container class="container_btn_paginacion">
        <iconify-icon icon="bxs:left-arrow" width="24" height="24"  style="color: #2C3D31" ${pagina_actual === 1 ? "disabled" : ""} data-page="${pagina_actual - 1}"></iconify-icon>
        <span>Pagina ${pagina_actual} de ${total_paginas}</span>
        <iconify-icon icon="bxs:right-arrow" width="24" height="24"  style="color: #2C3D31" ${pagina_actual === total_paginas ? "disabled" : ""} data-page="${pagina_actual + 1}"></iconify-icon>
        </container>
        `
    }

    document.getElementById("paginacion_porcino").addEventListener("click", (e) => {
        if (!e.target.dataset.page) return;
        const nueva = Number(e.target.dataset.page);
        if (nueva >= 1 && nueva <= total_paginas){
            pagina_actual = nueva;
            mostrar_porcinos();
            render_paginacion();
        }
    });

    mostrar_porcinos()
    render_paginacion()
}

function refrescar_porcinos(id_porcino){
    const row = document.querySelector(`tr[porcino-id = "${id_porcino}"]`)
    if (row){
        row.remove();
        consulta_general_porcinos();
    }
}

function crearSelects(filtro,opciones){
    const old_select = document.getElementById('filter_options_2');
    const container_search = document.getElementById("container_search_bar");
    
    if (old_select) old_select.remove();
    if (filtro === 'peso_final'){
        let input = document.createElement('input');
        input.id = "filter_options_2"
        input.className = "input_id"
        input.type = 'number';
        input.min = '0';
        input.placeholder = opciones
        container_search.appendChild(input)
    }else{
        let select = document.createElement('select')
        select.id = "filter_options_2"
        select.classList.add("input_id", "rm_filter")
        select.setAttribute('required', true)
        let value_pred = document.createElement('option');
        value_pred.text = "Seleccione..."
        value_pred. value = ""
        value_pred.disabled = true
        value_pred.selected = true
        select.appendChild(value_pred)
        if (filtro === 'sexo' || filtro === 'estado'){
            opciones.forEach(opcion => {
                let option = document.createElement('option')
                option.text = opcion
                option.value = opcion
                select.appendChild(option)
            })
        } else {
            opciones.forEach(opcion => {
                let option = document.createElement('option')
                option.text = opcion.nombre
                option.value = opcion.nombre
                select.appendChild(option)
            })
        }
        container_search.appendChild(select)
    }
}

function crear_opciones_select(tipo, lista, valor_actual){
    let id_actual = "";

    if (tipo.toLowerCase() === "razas"){
        const raza = lista.razas.find(r => r.nombre === valor_actual)
        id_actual = raza ? raza.id_raza : "";
    }

    if (tipo.toLowerCase() === "etapas"){
        const etapa = lista.etapas.find(e => e.nombre === valor_actual)
        id_actual = etapa ? etapa.id_etapa : "";
    }

    let html = `<option value="${id_actual}" selected>${valor_actual}</option>`
    if (tipo.toLowerCase() === "razas"){
        lista.razas.forEach(item => {
            html += `<option value="${item.id_raza}">${item.nombre}</option>`
        })
    }
    if (tipo.toLowerCase() === "etapas"){
        lista.etapas.forEach(item => {
            html += `<option value="${item.id_etapa}">${item.nombre}</option>`
        })
    }
    return html
}

function porcino_filtros() {
    try {
        const input__id = document.getElementById('input_id');
        const filter = document.getElementById("filter_porcino");
        input__id.addEventListener('input', () => {
            filter.disabled = parseInt(input__id.value) !== 0;
            if (parseInt(input__id.value) === 0){
                return consultar_porcinos_cache()
            }
            
        });
        const opciones = {
            "sexo" : ["Macho","Hembra"],
            "estado" : ["Activo","Inactivo"],
            "peso_final" : ["Escriba el peso final"]
        }
        filter.addEventListener('change', () => {
            input__id.readOnly = true;
            input__id.disabled = true;
            if (opciones[filter.value]){
                crearSelects(filter.value,opciones[filter.value])
            } else{
                setTimeout(async() => {
                    const razas = await consultar_razas_cache();
                    const etapas = await consultar_etapas_cache();
                    if (filter.value === 'raza'){
                        crearSelects(filter.value,razas.razas)
                    }
                    if (filter.value === 'etapa'){
                        crearSelects(filter.value,etapas.etapas)
                    }
                },);
            }
        })
    } catch (error) {
        console.error(error)
    }
}

async function consulta_filtros() {
    try {
        await verifyToken();
        const filtro = document.getElementById('filter_porcino');
        if (filtro.disabled == true){
            const input_id = document.getElementById('input_id').value;
            console.log(input_id)
            return consulta_individual_porcino(input_id, true)
        } else{
            const valor = document.getElementById('filter__options__2').value;
            const info = {
                "filtro" : filtro.value,
                "valor" : valor
            }
            const promesa = await fetch(`${URL_BASE}/porcino/filtros`, 
                {
                    method : 'POST',
                    body : JSON.stringify(info),
                    headers : getAuthHeaders()
                }
            )
            const response = await promesa.json()
            if (Object.keys(response).length != 1){
                paginacion_porcinos(response)
            } else{
                Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "error",
            });
            }
        }
    } catch (error) {
        console.error(error)
        handleAuthError(error)
    }
}

async function consulta_general_porcinos() {
    try {
        await verifyToken();
        const response = await fetch(`${URL_BASE}/porcino`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const porcinos = await response.json();
        paginacion_porcinos(porcinos);
        consultar_razas_cache();
        consultar_etapas_cache();
        porcino_filtros();
        consulta_gen_historial_pesos();
        return porcinos;
    } catch (error) {
        console.error('Error:', error);
        handleAuthError(error);
    }
}

async function consulta_individual_porcino(id, mostrar = false) {
    try {
        await verifyToken();
        const promesa = await fetch(`${URL_BASE}/porcino/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const response = await promesa.json(); 
        if (response.Mensaje === 'Porcino no encontrado') {
            Swal.fire({
                title: "Mensaje",
                text: response.Mensaje,
                icon: "error"
            });
            return null;
        }

        if (mostrar) {
            paginacion_porcinos(response);
        }

        return response;
    } catch (error) {
        console.error(error);
        handleAuthError(error);
        return null;
    }
}

async function agregar_porcino(){
    try {
        await verifyToken();
        const id_porcino = document.getElementById('id_porcino').value;
        const peso_inicial = document.getElementById('peso_inicial').value;
        const peso_final = document.getElementById('peso_final').value;
        const fecha = document.getElementById('fecha').value;
        const raza = document.getElementById('raza_add').value;
        const sexo = document.getElementById('sexo').value;
        const etapa = document.getElementById('etapa_add').dataset.id;
        const descripcion = document.getElementById('descripcion').value;

        const porcino = {
            "id_porcino" : id_porcino,
            "peso_inicial" : peso_inicial,
            "peso_final" : peso_final,
            "fecha_nacimiento" : fecha,
            "id_raza" : raza,
            "sexo" : sexo,
            "id_etapa" : etapa,
            "estado" : "Activo",
            "descripcion" : descripcion 
        }
        const promesa = await fetch(`${URL_BASE}/porcino`, {
            method : 'POST',
            body : JSON.stringify(porcino),
            headers : getAuthHeaders()
        })
        const response = await promesa.json()
        if (response.Mensaje == `Porcino con id ${id_porcino} registrado`){
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success",
            });
        }else{
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "error",
            });
        }
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error);
    }
}

async function actualizar_porcino(id_porcino) {
    try {
        await verifyToken()
        const peso_inicial = document.getElementById(`peso-ini-actu-${id_porcino}`).value;
        const peso_final = document.getElementById(`peso-final-actu-${id_porcino}`).value;
        const fecha = document.getElementById(`fecha-naci-actu-${id_porcino}`).value;
        const raza = document.getElementById(`raza-actu-${id_porcino}`).value;
        const sexo = document.getElementById(`sexo-actu-${id_porcino}`).value;
        const etapa = document.getElementById(`etapa-vida-actua-${id_porcino}`).value;
        const estado = document.getElementById(`estado-actu-${id_porcino}`).value;
        const descripcion = document.getElementById(`descripcion-actu-${id_porcino}`).value;

        const porcino = {
            "peso_inicial" : peso_inicial,
            "peso_final" : peso_final,
            "fecha_nacimiento" : fecha,
            "id_raza" : raza,
            "sexo" : sexo,
            "id_etapa" : etapa,
            "estado" :estado,
            "descripcion" : descripcion 
        }
        const promesa = await fetch(`${URL_BASE}/porcino/${id_porcino}`, 
            {
                method : "PUT",
                body : JSON.stringify(porcino),
                headers : getAuthHeaders()
            }
        );
        const response = await promesa.json();
        cerrarDialog(`modal-edit`);
        if (response.Mensaje === `Informacion del porcino con id ${id_porcino} actualizada`){
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success"
            });
            
        } else{
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "error"
            });
        }
        return response

    } catch (error) {
        console.error(error)
        handleAuthError(error)
    }
}

function eliminar_porcino(id_porcino){
    verifyToken().then(() => {
        const input = document.getElementById(`input-eliminar-${id_porcino}`);
        const id_input = document.getElementById(`input-eliminar-${id_porcino}`).value;
        if (id_input == id_porcino){
            fetch(`${URL_BASE}/porcino/${id_porcino}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
            .then( response => {
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                return response.json()
            })
            .then(response => {
                refrescar_porcinos(id_porcino);
                cerrarDialog(`modal-delete-confirm`);
                cerrarDialog(`modal-delete`);
                if (response.Mensaje ===  `Error al eliminar el porcino con id ${id_porcino}`){
                    Swal.fire({
                        title: "Mensaje",
                        text: `El Porcino con id ${id_porcino} esta asociado a una trasacción de peso, No se puede eliminar, Cambie el estado a "Inactivo"`,
                        icon: "error"
                    });
                } else{
                    Swal.fire({
                        title: "Mensaje",
                        text: `${response.Mensaje}`,
                        icon: "success"
                    });
                    location.reload()
                }
            })
            .catch(error => {
                console.error('Error', error);
                handleAuthError(error);
            });
        } else {
            input.style.backgroundColor = '#f8a5a5';
            input.classList.add('placerholder_eliminar')
            input.value = '';
            input.placeholder = 'ID incorrecto...';
        }
    }).catch(error => handleAuthError(error));
}

function crearSelects(filtro,opciones){
    const old_select = document.getElementById('filter__options__2');
    const container_search = document.getElementById("container__search__bar");
    
    if (old_select) old_select.remove();
    if (filtro === 'peso_final'){
        let input = document.createElement('input');
        input.id = "filter__options__2"
        input.className = "input_id"
        input.type = 'number';
        input.min = '0';
        input.placeholder = opciones
        container_search.appendChild(input)
    }else{
        let select = document.createElement('select')
        select.id = "filter__options__2"
        select.classList.add("input_id", "rm_filter")
        select.setAttribute('required', true)
        let value_pred = document.createElement('option');
        value_pred.text = "Seleccione..."
        value_pred. value = ""
        value_pred.disabled = true
        value_pred.selected = true
        select.appendChild(value_pred)
        if (filtro === 'sexo' || filtro === 'estado'){
            opciones.forEach(opcion => {
                let option = document.createElement('option')
                option.text = opcion
                option.value = opcion
                select.appendChild(option)
            })
        } else {
            opciones.forEach(opcion => {
                let option = document.createElement('option')
                option.text = opcion.nombre
                option.value = opcion.nombre
                select.appendChild(option)
            })
        }
        container_search.appendChild(select)
    }
}

// =============================================
// GESTIÓN DE HISTORIAL DE PESOS
// =============================================

function paginacion_historial(historial){
    const registros_por_pagina = 2;
    let pagina_actual = 1;
    const total_paginas = Math.ceil(historial.Historial.length / registros_por_pagina);

    const contenedor = document.getElementById('paginacion_historial');
    contenedor.replaceWith(contenedor.cloneNode(true));

    function obtener_pagina(pagina){
        const registro_inicial = (pagina-1) * registros_por_pagina;
        const registro_final = registro_inicial + registros_por_pagina;
        return historial.Historial.slice(registro_inicial,registro_final);
    }

    function mostrar_historial(){
        const info = obtener_pagina(pagina_actual).map(item => crearFilaHistorial(item)).join('');
        document.getElementById('historial_pesos').innerHTML = info;
    }
    
    function crearFilaHistorial(item){
        const uniqueId = item.id_documento;
        return `
            <tr class="registro registro__dia">
                <td class="td__border__l"> ${item.id_documento} </td>
                <td> ${item.id_porcino} </td>
                <td> ${item.peso_final} </td>
                <td> ${item.fecha_pesaje} </td>
                <td class="td__border__r">
                    <button class="icon-eye" data-id="${uniqueId}" data-type="tran_peso"><img src="/src/static/iconos/icono eye.svg" alt="ver informacion"></button>
                </td>
            </tr>
        `;
    }

    function render_paginacion(){
        const cont = document.getElementById('paginacion_historial');
        cont.innerHTML = `
            <span>Transacciones Totales: ${historial.Historial.length}</span>

            <container class="container_btn_paginacion">
            <iconify-icon icon="bxs:left-arrow" width="24" height="24"  style="color: #2C3D31" ${pagina_actual === 1 ? "disabled" : ""} data-page="${pagina_actual - 1}"></iconify-icon>
            <span>Pagina ${pagina_actual} de ${total_paginas}</span>
            <iconify-icon icon="bxs:right-arrow" width="24" height="24"  style="color: #2C3D31" ${pagina_actual === total_paginas ? "disabled" : ""} data-page="${pagina_actual + 1}"></iconify-icon>
            </container>
        
        `
    }

    document.getElementById("paginacion_historial").addEventListener('click', (e) => {
        if (!e.target.dataset.page) return; 
        const nueva_pagina = Number(e.target.dataset.page)
        if (nueva_pagina >= 1 && nueva_pagina <= total_paginas){
            pagina_actual = nueva_pagina;
            mostrar_historial()
            render_paginacion()
        }
    })
    mostrar_historial()
    render_paginacion()
}

async function consulta_gen_historial_pesos(){
    try {
        await verifyToken();
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos`, 
            {
                method : 'GET',
                headers : getAuthHeaders()
            })
        const response = await promesa.json();
        
        if (promesa.status == 200){
            paginacion_historial(response)
        } else {
            Swal.fire({
            title: "Mensaje",
            text: `${response.Mensaje}`,
            icon: "error",
            });
        }
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error);
    }
}

async function consulta_individual_transaccion(id, mostrar=false) {
    try{
        await verifyToken();
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/transaccion/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const response = await promesa.json()
        if (response.Mensaje === `No se econtró la transacción`){
            cerrarDialog('dialog__his__peso');
            Swal.fire({
                title: "Mensaje",
                text: response.Mensaje,
                icon: "error"
            });
            return null;
        }
        if (mostrar){
            paginacion_historial(response)
        }
        return response
    }catch(error){
        console.error(error)
    }
}

async function consulta_porcino_historial(id_porcino,mostrar = false){
    try{
        await verifyToken();
        const id = document.getElementById('input_id_hp').value;
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/${id || id_porcino}`,{
            headers: getAuthHeaders()
        });
        const response = await promesa.json()
        console.log(response)
        if (response.Mensaje === `No hay historial de pesos para el porcino con ID ${id}`){
            cerrarDialog('dialog__his__peso');
            Swal.fire({
                title: "Mensaje",
                text: response.Mensaje,
                icon: "error"
            });
            return null;
        }
        if (mostrar){
            paginacion_historial(response)
        }
        return response
    }catch(error){
        console.error(error)
    }
}

async function conteoNumeroConsecutivo() {
    try {
        await verifyToken();
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/conteo_transacciones`,
            {
                method : 'GET',
                headers : getAuthHeaders()
            }
        )
        const response = await promesa.json()
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error);
    }
}

async function actualizar_peso_historial() {
    try {
        await verifyToken();
        const fecha_pesaje = document.getElementById('fecha-pesaje-actu').value;
        const id_porcino = document.getElementById('id-porcino-actu').value;
        const peso_final = document.getElementById('peso-final-actu').value;
        const id_usuario = document.getElementById('id-usuario-actu').value;
        const descripcion = document.getElementById('descripcion-actu').textContent;
        const transa = {
            
            "fecha_pesaje" : fecha_pesaje,
            "id_porcino" : id_porcino,
            "peso_final" : peso_final,
            "id_usuario" : id_usuario,
            "descripcion" : descripcion
        }
        
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/actualizar`,
            {
                method : 'POST',
                body : JSON.stringify(transa),
                headers : getAuthHeaders()
            }
        )
        const response = await promesa.json()
        cerrarDialog(`dialog-actualizar-peso`);
        cerrarDialog(`dialog__his__peso`);
        if (response.Mensaje ===  `El Peso Final del porcino con id ${id_porcino} actualizado`){
            
            Swal.fire({
            title: "Mensaje",
            text: `${response.Mensaje}`,
            icon: "success",
            });
            
        } else {
            Swal.fire({
            title: "Mensaje",
            text: `${response.Mensaje}`,
            icon: "error",
            });
        }
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error);
    }
}

// =============================================
// GESTIÓN DE RAZAS
// =============================================

function paginacion_raza(razas){
    const registros_por_pagina = 2;
    let pagina_actual = 1;
    const total_paginas = Math.ceil(razas.razas.length / registros_por_pagina);

    const contenedor = document.getElementById('paginacion_raza');

    // Si no existe el contenedor, no ejecutar la paginación
    if (!contenedor) {
        console.warn("paginacion_raza: No existe el contenedor #paginacion_raza en este HTML.");
        return;
    }
    
    // LIMPIAR LISTENERS ANTERIORES
    contenedor.replaceWith(contenedor.cloneNode(true));

    function obtener_pagina(pagina){
        const registro_inicial = (pagina - 1) * registros_por_pagina;
        const registro_final = registro_inicial + registros_por_pagina;
        return razas.razas.slice(registro_inicial,registro_final)
    }

    // seccion para mostrar la informacion en el front-end
    function mostrar_raza(){
        const contenedor = document.getElementById('razas')
        if(!contenedor) return;
        contenedor.innerHTML = obtener_pagina(pagina_actual).map(item => crearFilaRaza(item)).join('');;
    }

    function crearFilaRaza(item){
        const uniqueId = item.id_raza;
        return `
        <tr class="registro registro__dia">
            <td class="td__border__l">${item.id_raza}</td>
            <td>${item.nombre}</td>
            <td>${item.descripcion}</td>
            <td class="td__border__r">
                ${crearIconosAccionesRaza(uniqueId)}
            </td>
        </tr>
        `
    }

    function crearIconosAccionesRaza(id) {
        return `
            <button class="icon-eye" data-id="${id}" data-type="raza"><img src="/src/static/iconos/icono eye.svg" alt="ver informacion"></button>
            <button class="icon-edit" data-id="${id}" data-type="raza" ><img src="/src/static/iconos/edit icon.svg" alt="editar informacion"></button>
            <button class="icon-delete" data-id="${id}" data-type="raza" ><img src="/src/static/iconos/delete icon.svg" alt="eliminar informacion"></button>
        `;
    }

    function render_paginacion(){
        const cont = document.getElementById('paginacion_raza');
        cont.innerHTML = `
            <span>Razas Totales: ${razas.razas.length}</span>

            <container class="container_btn_paginacion">
            <iconify-icon icon="bxs:left-arrow" width="24" height="24"  style="color: #2C3D31" ${pagina_actual === 1 ? "disabled" : ""} data-page="${pagina_actual - 1}"></iconify-icon>
            <span>Pagina ${pagina_actual} de ${total_paginas}</span>
            <iconify-icon icon="bxs:right-arrow" width="24" height="24"  style="color: #2C3D31" ${pagina_actual === total_paginas ? "disabled" : ""} data-page="${pagina_actual + 1}"></iconify-icon>
            </container>
        
        `
    }

    document.getElementById("paginacion_raza").addEventListener("click", (e) => {
        if (!e.target.dataset.page) return;
        const nueva_pagina = Number(e.target.dataset.page)
        if (nueva_pagina >= 1 && nueva_pagina <= total_paginas){
            pagina_actual = nueva_pagina;
            mostrar_raza()
            render_paginacion()
        }
    })

    mostrar_raza()
    render_paginacion()
}

async function consultar_razas() {
    try {
        await verifyToken();
        const promesa = await fetch(`${URL_BASE}/raza`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!promesa.ok) throw new Error(`Error: ${promesa.status}`);
        const response = await promesa.json();
        paginacion_raza(response)
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error);
    }
}

async function consulta_indi_raza(id_raza, mostrar = false){
    try {
        await verifyToken()
        const id = document.getElementById('input_id_raza').value;
        const promesa = await fetch(`${URL_BASE}/raza/${id || id_raza}`,{
            method: 'GET',
            headers : getAuthHeaders()
        });
        const response = await promesa.json();
        if (response.Mensaje === `No hay raza con ID ${id}`){
            cerrarDialog('dialog__ges__raz');
            Swal.fire({
                title: "Mensaje",
                text: response.Mensaje,
                icon: "error"
            });
            return null;
        }
        if (mostrar){
            paginacion_raza(response)
        }
        console.log(response)
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error)
    }
}

async function registrar_raza() {
    try {
        await verifyToken();
        const nombre = document.getElementById('nombre_raza').value;
        const descri = document.getElementById('descripcion_raza').value;

        const raza = {
            nombre: nombre,
            descripcion: descri
        }

        const promesa = await fetch(`${URL_BASE}/raza`, {
            method : 'POST',
            body : JSON.stringify(raza),
            headers: {
                "Content-type" : "application/json",
                headers: getAuthHeaders()
            }
        })
        const response = await promesa.json()
        if (response.Mensaje == "Raza registrada correctamente"){
            cerrarDialog('dialog-registrar-raza')
            cerrarDialog('dialog__ges__raz')
            Swal.fire({
            title: "Mensaje",
            text: `${response.Mensaje}`,
            icon: "success",
            confirmButton: "Ok"
            }).then((result) => {
                if (result.isConfirmed){
                    location.reload()
                }
            })
        } else{
            Swal.fire({
            title: "Mensaje",
            text: `${response.Mensaje}`,
            icon: "error"
        });
        }
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error);
    }
}

async function actualizar_raza(id) {
    try {
        await verifyToken()
        const nombre = document.getElementById(`nombre-raza-actualizar-${id}`).value;
        const descri = document.getElementById(`descripcion-raza-actualizar-${id}`).value;

        const raza = {
            nombre: nombre,
            descripcion: descri
        }

        const promesa = await fetch(`${URL_BASE}/raza/${id}`, {
            method : 'PUT',
            body : JSON.stringify(raza),
            headers: getAuthHeaders()
        })
        const response = await promesa.json()
        if (response.Mensaje === 'Raza actulizada correctamente'){
            cerrarDialog(`modal-edit`)
            cerrarDialog('dialog__ges__raz')
            
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success",
                confirmButton: "Ok"
                }).then((result) => {
                    if (result.isConfirmed){
                        location.reload()
                    }
            })
        } else{
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "error",
            });
        }
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error)
    }
}

async function eliminar_raza(id){
    try {
        await verifyToken()
        const input = document.getElementById(`input-eliminar-${id}`);
        const value_input = document.getElementById(`input-eliminar-${id}`).value;
        if (value_input == id){
            const promesa = await fetch(`${URL_BASE}/raza/${id}`, {method : 'DELETE',
                headers : getAuthHeaders()
            });
            const response = await promesa.json();
            cerrarDialog(`modal-delete-confirm`);
            cerrarDialog(`modal-delete`);
            cerrarDialog(`dialog__ges__raz`);
            if (response.Mensaje === `Error en la base de datos`) {
                Swal.fire({
                    title: "Mensaje",
                    text: `La raza con id ${id} esta asociada a un porcino, No puede ser eliminada`,
                    icon: "error",
                    confirmButton: "Ok",
                    })
            } else{
                Swal.fire({
                    title: "Mensaje",
                    text: `${response.Mensaje}`,
                    icon: "success",
                    confirmButton: "Ok"
                    }).then((result) => {
                        if (result.isConfirmed){
                            location.reload()
                        }
                })
            }
            return response
        } else{
            input.style.backgroundColor = '#f8a5a5';
            input.classList.add('placerholder_eliminar')
            input.value = '';
            input.placeholder = 'ID incorrecto...';
        }
    } catch (error) {
        Swal.fire({
            title: "Mensaje",
            text: `${error}`,
            icon: "warning"
        });
    }
}

// =============================================
// GESTIÓN DE ETAPAS
// =============================================

function paginacion_etapa(etapas){
    const registros_por_pagina = 2;
    let pagina_actual = 1;
    const total_paginas = Math.ceil(etapas.etapas.length / registros_por_pagina);

    const contenedor = document.getElementById('paginacion_etapa');
    if (!contenedor){
        console.warn("paginacion_etapa: No existe el contenedor #paginacion_etapa en esta pagina");
        return;
    }
    contenedor.replaceWith(contenedor.cloneNode(true));

    function obtener_pagina(pagina){
        const registro_inicial = (pagina - 1) * registros_por_pagina;
        const registro_final = registro_inicial + registros_por_pagina;
        return etapas.etapas.slice(registro_inicial,registro_final);
    }

    function mostrar_etapas(){
        const contenedor = document.getElementById('etapas_vida') 
        if (!contenedor) return;
        contenedor.innerHTML = obtener_pagina(pagina_actual).map(item => crearFilaEtapa(item)).join('');
    }

    function crearFilaEtapa(item){
        const uniqueId = item.id_etapa;
        return `
            <tr class="registro registro__dia">
                <td class="td__border__l">${item.id_etapa}</td>
                <td>${item.nombre}</td>
                <td>${item.peso_min}</td>
                <td>${item.peso_max}</td>

                <td class="td__border__r">
                    ${crearIconosAccionesEtapa(uniqueId)}
                </td>
            </tr>
        `
    }

    function crearIconosAccionesEtapa(id){
        return `
            <button class="icon-eye" data-id="${id}" data-type="etapa"><img src="/src/static/iconos/icono eye.svg" alt="ver informacion"></button>
            <button class="icon-edit" data-id="${id}" data-type="etapa" ><img src="/src/static/iconos/edit icon.svg" alt="editar informacion"></button>
            <button class="icon-delete" data-id="${id}" data-type="etapa" ><img src="/src/static/iconos/delete icon.svg" alt="eliminar informacion"></button>
        `
    }

    function render_paginacion(){
        const cont = document.getElementById('paginacion_etapa');
        cont.innerHTML = `
            <span>Razas Totales: ${etapas.etapas.length}</span>

            <container class="container_btn_paginacion">
            <iconify-icon icon="bxs:left-arrow" width="24" height="24"  style="color: #2C3D31" ${pagina_actual === 1 ? "disabled" : ""} data-page="${pagina_actual - 1}"></iconify-icon>
            <span>Pagina ${pagina_actual} de ${total_paginas}</span>
            <iconify-icon icon="bxs:right-arrow" width="24" height="24"  style="color: #2C3D31" ${pagina_actual === total_paginas ? "disabled" : ""} data-page="${pagina_actual + 1}"></iconify-icon>
            </container>
        
        `
    }

    document.getElementById("paginacion_etapa").addEventListener("click", (e) => {
        if (!e.target.dataset.page) return;
        const nueva_pagina = Number(e.target.dataset.page)
        if (nueva_pagina >= 1 && nueva_pagina <= total_paginas){
            pagina_actual = nueva_pagina;
            mostrar_etapas()
            render_paginacion()
            
        }
    })

    mostrar_etapas()
    render_paginacion()
}

async function consultar_etapas() {
    try{
        await verifyToken();
        const promesa = await fetch(`${URL_BASE}/etapa_vida`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const response = await promesa.json();
        paginacion_etapa(response)
        return response
    } catch(error){
        console.error(error)
        handleAuthError(error);
    }
}

async function consulta_indi_etapas(id_etapa, mostrar = false){
    try {
        await verifyToken()
        const id = document.getElementById('input_id_etapa').value;
        const promesa =  await fetch(`${URL_BASE}/etapa_vida/${id || id_etapa}`, 
            {
                method: 'GET',
                headers : getAuthHeaders()
            });
        const response = await promesa.json();
        if (response.Mensaje === `No hay etapa con ID ${id}`){
            cerrarDialog('dialog__ges__eta');
            Swal.fire({
                title: "Mensaje",
                text: response.Mensaje,
                icon: "error"
            });
            return null;
        }
        if (mostrar) {
            paginacion_etapa(response)
        }
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error)
    }
}

async function registrar_etapas(){
    try {
        await verifyToken()
        const etapa = {
            "nombre" : document.getElementById('nombre_etapa').value,
            "descripcion" : document.getElementById("descripcion_etapa").value,
            "peso_min": document.getElementById("peso_min_etapa").value,
            "peso_max": document.getElementById("peso_max_etapa").value,
            "duracion_dias" : document.getElementById("dias_dura_etapa").value,
            "duracion_semanas" : document.getElementById("semanas_dura_etapa").value,
            "requerimientos" : [
                { id_elemento: 1, porcentaje: parseFloat(document.getElementById("r-proteina-cruda").value) || 0 },
                { id_elemento: 2, porcentaje: parseFloat(document.getElementById("r-fosforo-disponible").value) || 0 },
                { id_elemento: 3, porcentaje: parseFloat(document.getElementById("r-treonina").value) || 0 },
                { id_elemento: 4, porcentaje: parseFloat(document.getElementById("r-fibra-cruda").value) || 0 },
                { id_elemento: 5, porcentaje: parseFloat(document.getElementById("r-sodio").value) || 0 },
                { id_elemento: 6, porcentaje: parseFloat(document.getElementById("r-metionina").value) || 0 },
                { id_elemento: 8, porcentaje: parseFloat(document.getElementById("r-extracto-etereo").value) || 0 },
                { id_elemento: 9, porcentaje: parseFloat(document.getElementById("r-arginina").value) || 0 },
                { id_elemento: 10,porcentaje: parseFloat(document.getElementById("r-metionina-cisteina").value) || 0 },
                { id_elemento: 11,porcentaje: parseFloat(document.getElementById("r-energia-metabo").value) || 0 },
                { id_elemento: 12,porcentaje: parseFloat(document.getElementById("r-calcio").value) || 0 },
                { id_elemento: 13,porcentaje: parseFloat(document.getElementById("r-lisina").value) || 0 },
                { id_elemento: 14,porcentaje: parseFloat(document.getElementById("r-triptofano").value) || 0 },
            ]
        }

        const promesa = await fetch(`${URL_BASE}/etapa_vida`, {
            method : 'POST',
            body: JSON.stringify(etapa),
            headers : getAuthHeaders()
        })
        const response = await promesa.json()
        if (response.Mensaje == "Etapa de vida registrada correctamente"){
            cerrarDialog('dialog-registrar-etapa');
            cerrarDialog('dialog__ges__eta');
            Swal.fire({
            title: "Mensaje",
            text: `${response.Mensaje}`,
            icon: "success",
            confirmButton: "Ok"
            }).then((result) => {
                if (result.isConfirmed){
                    location.reload()
                }
            })
        } else{
            Swal.fire({
            title: "Mensaje",
            text: `${response.Mensaje}`,
            icon: "error"
        });
        }
        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error)
    }
}

async function actualizar_etapa(id) {
    try {
        await verifyToken()
        const etapa = {
            "nombre" : document.getElementById(`nombre-etapa-actu-${id}`).value,
            "descripcion" : document.getElementById(`descripcion-etapa-actu-${id}`).value,
            "peso_min": document.getElementById(`peso-min-etapa-actu-${id}`).value,
            "peso_max": document.getElementById(`peso-max-etapa-actu-${id}`).value,
            "duracion_dias" : document.getElementById(`dias-dura-etapa-actu-${id}`).value,
            "duracion_semanas" : document.getElementById(`semanas-dura-etapa-actu-${id}`).value,
            "requerimientos" : [
                { id_elemento: 1, porcentaje: parseFloat(document.getElementById(`proteina-cruda-actu-${id}`).value) || 0 },
                { id_elemento: 2, porcentaje: parseFloat(document.getElementById(`fosforo-disponible-actu-${id}`).value) || 0 },
                { id_elemento: 3, porcentaje: parseFloat(document.getElementById(`treonina-actu-${id}`).value) || 0 },
                { id_elemento: 4, porcentaje: parseFloat(document.getElementById(`fibra-cruda-actu-${id}`).value) || 0 },
                { id_elemento: 5, porcentaje: parseFloat(document.getElementById(`sodio-actu-${id}`).value) || 0 },
                { id_elemento: 6, porcentaje: parseFloat(document.getElementById(`metionina-actu-${id}`).value) || 0 },
                { id_elemento: 8, porcentaje: parseFloat(document.getElementById(`extracto-etereo-actu-${id}`).value) || 0 },
                { id_elemento: 9, porcentaje: parseFloat(document.getElementById(`arginina-actu-${id}`).value) || 0 },
                { id_elemento: 10,porcentaje: parseFloat(document.getElementById(`metionina-cisteina-actu-${id}`).value) || 0 },
                { id_elemento: 11,porcentaje: parseFloat(document.getElementById(`energia-metabo-actu-${id}`).value) || 0 },
                { id_elemento: 12,porcentaje: parseFloat(document.getElementById(`calcio-actu-${id}`).value) || 0 },
                { id_elemento: 13,porcentaje: parseFloat(document.getElementById(`lisina-actu-${id}`).value) || 0 },
                { id_elemento: 14,porcentaje: parseFloat(document.getElementById(`triptofano-actu-${id}`).value) || 0 },
            ]
        }

        const promesa = await fetch(`${URL_BASE}/etapa_vida/${id}`, {
            method : 'PUT',
            body: JSON.stringify(etapa),
            headers : getAuthHeaders()
        })
        const response = await promesa.json();
        if (response.Mensaje === 'Etapa de vida actulizada correctamente'){
            cerrarDialog(`modal-edit`)
            cerrarDialog('dialog__ges__eta')
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success",
                confirmButton: "Ok"
                }).then((result) => {
                    if (result.isConfirmed){
                        location.reload()
                    }
            })
        } else{
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "error",
            });
        }

        return response
    } catch (error) {
        console.error(error)
        handleAuthError(error)
    }
}

async function eliminar_etapa(id) {
    try {
        await verifyToken()
        const input = document.getElementById(`input-eliminar-${id}`);
        const value_input = document.getElementById(`input-eliminar-${id}`).value;

        if (value_input == id){
            const promesa = await fetch(`${URL_BASE}/etapa_vida/${id}`, {
                method: 'DELETE',
                headers : getAuthHeaders()
            })
            const response = await promesa.json();
            cerrarDialog(`modal-delete-confirm`);
            cerrarDialog(`modal-delete`);
            cerrarDialog(`dialog__ges__eta`);
            if (response.Mensaje === `Error en la base de datos`) {
                Swal.fire({
                    title: "Mensaje",
                    text: `La etapa de vida con id ${id} esta asociada a un porcino o dieta, No puede ser eliminada`,
                    icon: "error",
                    confirmButton: "Ok",
                    })
            } else{
                Swal.fire({
                    title: "Mensaje",
                    text: `${response.Mensaje}`,
                    icon: "success",
                    confirmButton: "Ok"
                    }).then((result) => {
                        if (result.isConfirmed){
                            location.reload()
                        }
                })
            }
            return response
        } else {
            input.style.backgroundColor = '#f8a5a5';
            input.classList.add('placerholder_eliminar')
            input.value = '';
            input.placeholder = 'ID incorrecto...';
        }
        
        
    } catch (error) {
        console.error(error)
    }
}

// =============================================
// GESTIÓN DE ALIMENTOS
// =============================================

function consulta_alimentos(){
    verifyToken().then(() => {
        const contenido = document.getElementById("contenido");
        fetch(`${URL_BASE}/alimentos`,{
            method: "GET",
            headers: getAuthHeaders()
        })
        .then(res=>res.json())
        .then(data=>{
            contenido.innerHTML=""; 
            data.mensaje.forEach(element => {
                const mapa = {};
                element.elementos.forEach(e => {
                    mapa[e.nombre] = e.valor;
                });

                contenido.innerHTML+=`
                <tr class="nuevo1">
                    <td class="nuevo td__border__l"><img class="svg__pig" src="/src/static/iconos/logo alimentospng.png"></td>
                    <td class="nuevo">${element.id_alimento}</td>
                    <td class="nuevo">${element.nombre}</td>
                    <td class="nuevo">${mapa["Materia_seca"]}</td>
                    <td class="nuevo">${mapa["Energia_metabo"]}</td>
                    <td class="nuevo">${mapa["Proteina_cruda"]}</td>
                    <td class="nuevo">${mapa["Fibra_cruda"]}</td>
                    <td class="nuevo">${element.estado}</td>
                    <td class="nuevo td__border__r">
                        <img src="/src/static/iconos/icon eye.svg " class="icon-eye">
                        <img src="/src/static/iconos/edit icon.svg" class="icon-edit">
                        <img class="eliminar" onclick="eliminar_alimento(${element.id_alimento})" src="/src/static/iconos/delete icon.svg" class="icon-edit">
                    </td>
                </tr>
                `
            });
        })
        .catch(error => handleAuthError(error));
    }).catch(error => handleAuthError(error));
}

function eliminar_alimento(id){
    verifyToken().then(() => {
        fetch(`${URL_BASE}/eliminar_alimento/${id}`,{
            method:"delete",
            headers: getAuthHeaders()
        })
        .then(res=>res.json())
        .then(data=>{
            alert("eliminado correctamente")
            window.location.reload()
        })
        .catch(error => handleAuthError(error));
    }).catch(error => handleAuthError(error));
}

function consulta_individual_alimento(){
    verifyToken().then(() => {
        const nombre = document.getElementById("id_alimento").value;
        contenido.innerHTML = "";

        fetch(`${URL_BASE}/consulta_indi_alimento/${nombre}`, {
            headers: getAuthHeaders()
        })
        .then(res => res.json())
        .then(data => {
            if (!data.mensaje) {
                contenido.innerHTML = `
                    <tr>
                        <td colspan="9" class="nuevo td__border__l"> No se encontró ningún alimento con ese nombre, por favor digite el nombre completo</td>
                    </tr>
                `;
                return;
            }

            let alimentos = [];
            if (Array.isArray(data.mensaje)) {
                alimentos = data.mensaje;
            } else {
                alimentos = [data.mensaje];
            }

            alimentos.forEach(element => {
                const mapa = {};
                element.elementos.forEach(e => {
                    mapa[e.nombre] = e.valor;
                });

                contenido.innerHTML += `
                    <tr class="nuevo1">
                        <td class="nuevo td__border__l"><img class="svg__pig" src="/comida.png"></td>
                        <td class="nuevo">${element.id_alimento}</td>
                        <td class="nuevo">${element.nombre}</td>
                        <td class="nuevo">${mapa["Materia_seca"]}</td>
                        <td class="nuevo">${mapa["Energia_metabo"]}</td>
                        <td class="nuevo">${mapa["Proteina_cruda"]}</td>
                        <td class="nuevo">${mapa["Fibra_cruda"]}</td>
                        <td class="nuevo">${alimentos.estado}</td>
                        <td class="nuevo td__border__r">
                            <img src="/src/static/iconos/icon eye.svg" class="icon-eye">
                            <img src="/src/static/iconos/edit icon.svg" class="icon-edit">
                            <img class="eliminar" onclick="eliminar(${element.id_alimento})" src="/src/static/iconos/delete icon.svg" class="icon-edit">
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => handleAuthError(error));
    }).catch(error => handleAuthError(error));
}

// =============================================
// GESTIÓN DE NOTIFICACIONES
// =============================================

function mostrar_notificaciones(notificaciones){
    const info = notificaciones.Notificaciones.map(item => crear_fila_notificaciones(item)).join('');
    document.getElementById('section_hoy_noti').innerHTML = info
}

function crear_fila_notificaciones(item){
    let fechaBD = item.fecha_creacion;
    let fecha = new Date(fechaBD);

    const opciones = {
        weekday: "long",   // día de la semana
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    };

    // Fecha bonita con día en español
    const fecha_bonita = fecha.toLocaleDateString("es-CO", opciones);
    return `
        <div class="menssage__noti">
            <div class="menssage__noti__title__fecha">
                <h3>${item.titulo} - ${item.tipo}</h3>
                <h3>${fecha_bonita}</h3>
            </div>
            <p>${item.mensaje}</p>
        </div>
    `
}

async function consultar_notificaciones() {
    try {
        await verifyToken()
        // EN ESTE ID DEBE IR EL ID DEL USUARIO QUE TIENE LA SESION ABIERTA
        const id = 1
        const promesa = await fetch(`${URL_BASE}/notificaciones/${id}`,
            {
                method : 'GET',
                headers : getAuthHeaders()
            }
        )
        const response = await promesa.json()
        console.log(response)
        mostrar_notificaciones(response)
        return response 
    } catch (error) {
        console.error(error)
    }
}

// =============================================
// FUNCIONES DE AUTENTICACIÓN Y USUARIO
// =============================================

function ContrasenaRobusta(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
}

async function registro_usuarios(event) {
    event.preventDefault();
    try {
        const nombre = document.getElementById('fname').value;
        const tipo_identificacion = document.getElementById('tipo_identificacion').value;
        const numero_identificacion = document.getElementById('n.i').value;
        const correo = document.getElementById('correo').value;
        const contraseña = document.getElementById('password').value;
        const constraseña_confirm = document.getElementById('confirmPassword').value;

        if (!ContrasenaRobusta(contraseña)) {
            Swal.fire({
                title: "Contraseña débil",
                html: `
                    <div style="text-align: left;">
                        <p>Tu contraseña debe contener:</p>
                        <ul>
                            <li> Mínimo 8 caracteres</li>
                            <li> Una letra mayúscula</li>
                            <li> Una letra minúscula</li>
                            <li> Un número</li>
                            <li> Un carácter especial</li>
                        </ul>
                    </div>
                `,
                icon: "error",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#60836a"
            });
            return;
        }

        if (constraseña_confirm !== contraseña) {
            Swal.fire({
                title: "Mensaje",
                text: `Las contraseñas no coinciden`,
                icon: "error",
                scrollbarPadding: false
            });
            return;
        }

        const user = {
            numero_identificacion,
            nombre,
            correo,
            contraseña,
            estado: "Activo",
            id_tipo_identificacion: tipo_identificacion,
        };

        const resCodigo = await fetch(`${URL_BASE}/enviar_codigo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: correo })
        });

        if (!resCodigo.ok) {
            Swal.fire("Error", "No se pudo enviar el código de verificación", "error");
            return;
        }

        const { value: codigoIngresado } = await Swal.fire({
            title: "Verificación de correo",
            input: "text",
            inputLabel: "Ingresa el código que recibiste en tu correo",
            inputPlaceholder: "Ej: 776545",
            confirmButtonText: "Validar",
            showCancelButton: true
        });

        if (!codigoIngresado) {
            Swal.fire("Error", "Debes ingresar el código", "error");
            return;
        }

        const resValidar = await fetch(`${URL_BASE}/validar_codigo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: correo, codigo: codigoIngresado })
        });

        const dataValidar = await resValidar.json();

        if (!resValidar.ok) {
            Swal.fire("Error", dataValidar.error || "Código incorrecto", "error");
            return;
        }

        const response = await fetch(`${URL_BASE}/users`, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: { "Content-type": "application/json" }
        });

        const data = await response.json();

        if (!response.ok) {
            Swal.fire({
                title: "Mensaje",
                text: data.Mensaje || "Ocurrió un error al registrar el usuario",
                icon: "error",
                confirmButtonColor: "#60836a"
            });
            return;
        }

        Swal.fire({
            title: "Mensaje",
            text: `Usuario registrado correctamente. Ahora inicia sesión`,
            icon: "success",
            timer: 1700,
            showConfirmButton: false
        }).then(() => {
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify({
                nombre,
                numero_identificacion,
                correo
            }));
            location.href = "index.html";
        });

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Hubo un problema en el registro", "error");
    }
}


async function login() {
    try {
        const correo = document.getElementById('entrada1').value;
        const contraseña = document.getElementById('entrada2').value;

        if (!correo || !contraseña) {
            Swal.fire({
                title: "Error",
                text: "Por favor completa todos los campos",
                icon: "warning"
            });
            return;
        }

        const user = {
            "correo": correo,
            "contraseña": contraseña
        }

        const response = await fetch(`${URL_BASE}/login`, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await response.json();

        if (response.ok && data.Mensaje === 'Las credenciales son correctas') {
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify({
                nombre: data.nombre,
                numero_identificacion: data.numero_identificacion,
                correo: data.correo,
                rol: data.rol
            }));
            
            Swal.fire({
                title: "¡Éxito!",
                text: "Inicio de sesión exitoso",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                location.href = 'home.html';
            });
            
        } else {
            let errorMessage = data.Mensaje || "Error desconocido";
            
            Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error"
            });
        }
    } catch (error) {
        console.error("Error en login:", error);
        Swal.fire({
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor",
            icon: "error"
        });
    }
}

async function olvidoPassword() {
    const correo = document.getElementById('correo').value;

    if (!correo) {
        Swal.fire({
            title: "Error",
            text: "Por favor ingresa tu correo",
            icon: "warning"
        });
        return;
    }

    try {
        const response = await fetch(`${URL_BASE}/olvido-password`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo })
        });

        const data = await response.json();

        Swal.fire({
            title: response.ok ? "Éxito" : "Error",
            text: data.Mensaje || "Hubo un problema",
            icon: response.ok ? "success" : "error"
        });
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: "No se pudo conectar con el servidor",
            icon: "error"
        });
        console.error("Error en forgotPassword:", error);
    }
}

async function recuperarPassword() {
        const token = new URLSearchParams(window.location.search).get('token');
        const nueva_contrasena = document.getElementById('nueva_contrasena').value;

        if (!ContrasenaRobusta(nueva_contrasena)) {
            Swal.fire({
            title: "Contraseña débil",
            html: `
                <div style="text-align: left;">
                    <p>Tu contraseña debe contener:</p>
                    <ul>
                        <li> Mínimo 8 caracteres</li>
                        <li> Una letra mayúscula</li>
                        <li> Una letra minúscula</li>
                        <li> Un número</li>
                        <li> Un carácter especial</li>
                    </ul>
                </div>
            `,
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#60836a"
        });
        return;
        }

        const response = await fetch(`${URL_BASE}/recuperar-password`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, nueva_contrasena })
        });

        const data = await response.json();

        Swal.fire({
            title: response.ok ? "Éxito" : "Error",
            text: data.Mensaje,
            icon: response.ok ? "success" : "error"
        }).then(() => {
            if (response.ok) location.href = 'index.html';
        });
    }

// FUNCIONAMIENTO DE LA API DE GOOGLE
function handleCredentialResponse(response) {
    const idToken = response.credential;
    console.log("Token recibido de Google:", idToken);

    if (!idToken) {
        Swal.fire({
            icon: "error",
            title: "Error de autenticación",
            text: "No se recibió el token de Google. Intenta nuevamente."
        });
        return;
    }

    fetch(`${URL_BASE}/api/auth/google`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ token: idToken })
    })
    .then(async (res) => {
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || `Error ${res.status}: ${res.statusText}`);
        }
        return data;
    })
    .then(data => {
        if (!data.token) {
            throw new Error("El servidor no devolvió el token de autenticación.");
        }
        
        if (data.status !== "success") {
            throw new Error(data.message || "Error en la autenticación");
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify({
            nombre: data.nombre,
            numero_identificacion: data.numero_identificacion,
            correo: data.correo,
            rol: data.rol
        }));

        Swal.fire({
            icon: "success",
            timer: 1500,
            title: "¡Bienvenido a Edupork!",
            text: `Hola ${data.nombre}, tu acceso con Google fue exitoso.`,
            showConfirmButton: false
        }).then(() => {
            location.href = "home.html";
        });
    })
    .catch(err => {
        console.error("Error completo en login:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        
        Swal.fire({
            icon: "error",
            title: "Error de acceso",
            text: err.message || "No se pudo completar el inicio de sesión con Google."
        });
    });
}

function tieneRol(rolRequerido) {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.rol === rolRequerido;
}

async function cargarDatosPerfil() {
    try {
        await verifyToken();
        const respuesta = await fetch(`${URL_BASE}/perfil`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Sesión inválida',
                text: datos.Mensaje || 'No se pudo cargar el perfil.',
                confirmButtonText: 'Volver a iniciar sesión'
            }).then(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = 'index.html';
            });
            return;
        }

        document.getElementById('nombreUsuario').textContent = datos.nombre;
        document.getElementById('correoUsuario').textContent = datos.correo;

        if (datos.es_google) {
            document.getElementById('identificacionLinea').style.display = 'none';
        } else {
            document.getElementById('identificacionUsuario').textContent = datos.numero_identificacion;
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor.',
            confirmButtonText: 'Reintentar'
        });
    }
}

// CERRAR SESIÓN
function cerrarSesion() {
    Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Estás seguro de que quieres salir",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            location.href = "index.html";
        }
    });
}

function mostrarNombreUsuario() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && usuario.nombre) {
        const nombreSpan = document.getElementById("nombreUsuarioTexto");
        if (nombreSpan) {
            nombreSpan.textContent = usuario.nombre;
        }
    }
}

// =============================================
// FUNCIONES DE NAVEGACIÓN Y UI
// =============================================

// FUNCIONALIDAD PARA LA BARRA DE NAVEGACION
const nav_bar = document.querySelectorAll('.nav__item')
function bar_funct(){
    nav_bar.forEach((item) => 
    item.classList.remove('active'));
    this.classList.add('active');
}
nav_bar.forEach((item) => item.addEventListener('click',bar_funct));

// CONTROL DEL MENU DESPLEGABLE
document.addEventListener("DOMContentLoaded", () => {
    mostrarNombreUsuario();

    const btnPerfil = document.getElementById("btnPerfil");
    const menu = document.getElementById("usuarioMenu");

    if (btnPerfil && menu) {
        btnPerfil.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.style.display = menu.style.display === "block" ? "none" : "block";
        });

        window.addEventListener("click", () => {
            menu.style.display = "none";
        });
    } 

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    }

    const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");
    if (cerrarSesionBtn) {
        cerrarSesionBtn.addEventListener("click", (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    }
});

const cerdo = document.getElementById("cerdo");
const barralateral = document.querySelector(".barra-lateral");
const spans = document.querySelectorAll("span");
const menu=document.querySelector(".menu")

menu.children[1].style.display="none"
menu.addEventListener("click",()=>{
    barralateral.classList.toggle("max-barra-lateral")
    if(barralateral.classList.contains("max-barra-lateral")){
        menu.children[0].style.display="none"
        menu.children[1].style.display="block"
    }
    else{
        menu.children[0].style.display="block"
        menu.children[1].style.display="none"
    }
})

document.addEventListener("click", (e) => {
    if (
        !barralateral.contains(e.target) &&
        !menu.contains(e.target)
    ){
        if (barralateral.classList.contains("max-barra-lateral")) {
            barralateral.classList.remove("max-barra-lateral");

            // Actualiza íconos
            menu.children[0].style.display = "block";
            menu.children[1].style.display = "none";
        }
    }
});

cerdo.addEventListener("click", () => {
    barralateral.classList.toggle("mini-barra-lateral");
    spans.forEach((span) => {
        span.classList.toggle("oculto");
    });
});

// Función para verificar si es aprendiz
function esAprendiz() {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.rol === 'Aprendiz';
}

// Función específica para aprendices
function verificarRol() {
    if (esAprendiz()) {
        Swal.fire({
            title: "Acceso No Autorizado",
            html: `<div style="text-align: center;">
                    <p style="font-size: 18px; margin-bottom: 15px;">
                    <strong>Sección restringida</strong>
                    </p>
                    <p>Esta sección no está disponible para aprendices.</p>
                    </div>`,
            icon: "warning",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#60836a",
            width: 500
        });
        return false;
    }
    return true;
}

// Función para manejar las restricciones
function manejarClickRol(event) {
    if (!verificarRol()) {
        event.preventDefault(); // Evita la redirección
        event.stopPropagation(); // Evita que otros eventos se ejecuten
        return false;
    }
}

// =============================================
// EVENT LISTENER PRINCIPAL (AL FINAL)
// =============================================

document.addEventListener("click", (e) => {
    const icon = e.target.closest(".icon-eye, .icon-edit, .icon-delete, #button-delete");
    if (!icon) return;
    
    const id = icon.dataset.id;
    const type = icon.dataset.type;

    if (icon.classList.contains("icon-eye")) {
        openModalEye(type, id);
    } else if (icon.classList.contains("icon-edit")) {
        if (type === "raza") {
            openModalEdit(type, id, actualizar_raza);
        }
        else if (type === "etapa") {
            openModalEdit(type, id, actualizar_etapa);
        }
        else if (type === "porcino") {
            openModalEdit(type, id, actualizar_porcino);
        }
    } else if (icon.classList.contains("icon-delete")) {
        if (type === "raza") {
            openModalDelete(type, id);
        }
        else if (type === "etapa") {
            openModalDelete(type, id);
        }
        else if (type === "porcino") {
            openModalDelete(type, id);
        }
    }

    if(icon.id === "button-delete"){
        if (type === 'raza'){
            openModalDeleteConfirm(type,id, eliminar_raza)
        }
        else if (type === 'etapa'){
            openModalDeleteConfirm(type,id, eliminar_etapa)
        }
        else if (type === 'porcino'){
            openModalDeleteConfirm(type,id, eliminar_porcino)
        }
    }
});

document.getElementById("modal-eye").addEventListener("close", resetModalEye);

document.getElementById('btn_consultar_todo_raza').addEventListener('click', () => {
    const input_id_raza = document.getElementById('input_id_raza');
    if (input_id_raza){
        input_id_raza.value = "Ingrese el ID de la raza";
    }
    consultar_razas()
})

document.addEventListener('DOMContentLoaded', function() {
    crearDialogRegistrarRaza();
    crearDialogRegistrarEtapa();
    crearDialogActualizarPesoHistorial();
});

