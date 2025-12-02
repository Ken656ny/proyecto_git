const URL_BASE = 'http://127.0.0.1:5000'

// Al cargar la página, crear los diálogos directamente
document.addEventListener('DOMContentLoaded', function () {
    crearDialogRegistrarRaza();
    crearDialogRegistrarEtapa();
    crearDialogActualizarPesoHistorial();
});

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


// REDIRECCION DE FORMA LENTA HACIA LOS HTML

function redirectWithDelay(event, url) {
    event.preventDefault(); // Evita que el enlace redirija de inmediato

    // Aquí puedes poner una animación o efecto antes de redirigir

    // Esperar 1 segundo (1000 ms) antes de redirigir
    setTimeout(() => {
        window.location.href = url;
    }, 1000);
}

// FUCNIONALIDAD PARA LA BARRA DE NAVEGACION

const nav_bar = document.querySelectorAll('.nav__item')

function bar_funct() {
    nav_bar.forEach((item) =>
        item.classList.remove('active'));
    this.classList.add('active');
}
nav_bar.forEach((item) => item.addEventListener('click', bar_funct));

// MANEJO DE RUTAS DEL LOGIN Y REGISTRO DE USUARIOS


async function registro_usuarios() {
    try {
        const nombre = document.getElementById('fname').value;
        const tipo_identificacion = document.getElementById('tipo_identificacion').value;
        const numero_identificacion = document.getElementById('n.i').value;
        const correo = document.getElementById('correo').value;
        const contraseña = document.getElementById('password').value;
        const constraseña_confirm = document.getElementById('confirmPassword').value;

        if ((constraseña_confirm == contraseña) && (contraseña != '')) {
            const user = {
                "numero_identificacion": numero_identificacion,
                "nombre": nombre,
                "correo": correo,
                "contraseña": contraseña,
                "estado": "Activo",
                "id_tipo_identificacion": tipo_identificacion,
            }
            fetch(`${URL_BASE}/users`,
                {
                    method: 'POST',
                    body: JSON.stringify(user),
                    headers: {
                        "Content-type": "application/json"
                    }
                }).then(response => {
                }).then(() => {
                    Swal.fire({
                        title: "Mensaje",
                        text: `Usuario registrado correctamente`,
                        icon: "success"
                    });

                })
        } else {
            Swal.fire({
                title: "Mensaje",
                text: `Las constraseñas no coinciden`,
                icon: "error"
            });
        }

    } catch (error) {
        console.error(error)
    }
}

async function login() {
    try {
        const correo = document.getElementById('entrada1').value;
        const contraseña = document.getElementById('entrada2').value;

        const user = {
            "correo": correo,
            "contraseña": contraseña
        }

        fetch(`${URL_BASE}/login`,
            {
                method: 'POST',
                body: JSON.stringify(user),
                headers: {
                    "Content-type": "application/json"
                }
            }).then(response => {
                return response.json()
            }).then(response => {
                if (response.Mensaje === 'Las crendenciales son correctas') {
                    location.href = 'home.html'
                } else if (response.Mensaje === 'Contraseña incorrecta') {
                    Swal.fire({
                        title: "Mensaje",
                        text: `Constraseña incorrecta`,
                        icon: "error"
                    });
                } else if (response.Mensaje === 'Usuario no encontrado') {
                    Swal.fire({
                        title: "Mensaje",
                        text: `Usuario no encontrado`,
                        icon: "error"
                    });
                } else {
                    Swal.fire({
                        text: `Error en la base de datos`,
                        title: "Mensaje",
                        icon: "error"
                    });
                }
            })

    } catch (error) {
        console.error(error)
    }
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

// MODAL PARA VER LA INFORMACION DE PORCINO, ETAPA, RAZA Y TRANSACCION
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
        <input type="text" value="${e.nombre_etapa}" disabled>
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


// MODALES PARA EDITAR LA INFORMACION DE LOS PORCINOS, ETAPA Y RAZA
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

async function openModalEdit(type, id, funct) {
    const modal = document.getElementById("modal-edit");
    const content = document.getElementById('edit-content');
    const title = document.getElementById("modal-edit-title");
    const form = document.getElementById("form-edit")
    const button = document.getElementById("button-edit");

    form.onsubmit = function(event) {
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
        <input id="" type="text" value="${e.id_etapa}">
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

// MODAL PARA ELIMINAR LA INFORMACION DE LOS PORCINOS, ETAPA Y RAZA
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

// FUNCION PARA CARGAR LA INFOMACION DEL MODAL DELETE
async function cargarInfoDelete(type,container) {
    container.innerHTML = `
        <p>Eliminar el registro sin saber si ${type} tiene trazabilidad puede que altere el funcionamiento del sistema, es preferible que cambie el estado del porcino a inactivo.</p>
        <span>¿Está seguro que quiere eliminar este registro?</span>
    `;
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

// FUNCION PARA CARGAR EL MODAL CONFIRMAR ELIMINACION
async function cargarInfoDeleteConfirm(id,container) {
    container.innerHTML = `
        <p>Escriba debajo el ID "${id}" y presione eliminar si asi lo desea</p>
        <input id="input-eliminar-${id}" class="input__add__por" type="number" oninput="this.value = Math.abs(this.value)" placeholder= "Ingrese el ID">
    `;
}


// -------------------
// GESTION DE PORCINOS
// -------------------


// CONSUMO DE DATOS DE LOS PORCINOS REGISTRADOS

async function consulta_general_porcinos() {
    try {
        const response = await fetch(`${URL_BASE}/porcino`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const porcinos = await response.json();
        paginacion_porcinos(porcinos);
        consultar_razas_cache();
        consultar_etapas_cache();
        porcino_filtros();
        consulta_gen_historial_pesos();
        return porcinos
    } catch (error) {
        console.error('Error:', error);
    }
}

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

async function consulta_individual_porcino(id, mostrar = false) {
    try {
        const promesa = await fetch(`${URL_BASE}/porcino/${id}`, {
            method: 'GET',
            headers: { "Content-type": "application/json" }
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
        return null;
    }
}

function refrescar_porcinos(id_porcino) {
    const row = document.querySelector(`tr[porcino-id = "${id_porcino}"]`)
    if (row) {
        row.remove;
        consultar_porcinos_cache();
    }
}

function crearSelects(filtro, opciones) {
    const old_select = document.getElementById('filter__options__2');
    const container_search = document.getElementById("container__search__bar");

    if (old_select) old_select.remove();
    if (filtro === 'peso_final') {
        let input = document.createElement('input');
        input.id = "filter__options__2"
        input.className = "input_id"
        input.type = 'number';
        input.min = '0';
        input.placeholder = opciones
        container_search.appendChild(input)
    } else {
        let select = document.createElement('select')
        select.id = "filter__options__2"
        select.classList.add("input_id", "rm_filter")
        select.setAttribute('required', true)
        let value_pred = document.createElement('option');
        value_pred.text = "Seleccione..."
        value_pred.value = ""
        value_pred.disabled = true
        value_pred.selected = true
        select.appendChild(value_pred)
        if (filtro === 'sexo' || filtro === 'estado') {
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

function porcino_filtros() {
    try {
        const input__id = document.getElementById('input_id');
        const filter = document.getElementById("filter_porcino");
        input__id.addEventListener('input', () => {
            filter.disabled = parseInt(input__id.value) !== 0;
            if (parseInt(input__id.value) === 0) {
                return consultar_porcinos_cache()
            }

        });
        const opciones = {
            "sexo": ["Macho", "Hembra"],
            "estado": ["Activo", "Inactivo"],
            "peso_final": ["Escriba el peso final"]
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
                    if (filter.value === 'etapa') {
                        crearSelects(filter.value, etapas.etapas)
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
        const filtro = document.getElementById('filter_porcino');
        if (filtro.disabled == true){
            const input_id = document.getElementById('input_id').value;
            console.log(input_id)
            return consulta_individual_porcino(input_id, true)
        } else {
            const valor = document.getElementById('filter__options__2').value;
            const info = {
                "filtro": filtro.value,
                "valor": valor
            }
            const promesa = await fetch(`${URL_BASE}/porcino/filtros`,
                {
                    method: 'POST',
                    body: JSON.stringify(info),
                    headers: {
                        "Content-type": "application/json"
                    }
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
    }
}

async function agregar_porcino() {
    try {
        const id_porcino = document.getElementById('id_porcino').value;
        const peso_inicial = document.getElementById('peso_inicial').value;
        const peso_final = document.getElementById('peso_final').value;
        const fecha = document.getElementById('fecha').value;
        const raza = document.getElementById('raza_add').value;
        const sexo = document.getElementById('sexo').value;
        const etapa = document.getElementById('etapa_add').dataset.id;
        const descripcion = document.getElementById('descripcion').value;

        const porcino = {
            "id_porcino": id_porcino,
            "peso_inicial": peso_inicial,
            "peso_final": peso_final,
            "fecha_nacimiento": fecha,
            "id_raza": raza,
            "sexo": sexo,
            "id_etapa": etapa,
            "estado": "Activo",
            "descripcion": descripcion
        }
        const promesa = await fetch(`${URL_BASE}/porcino`, {
            method: 'POST',
            body: JSON.stringify(porcino),
            headers: {
                "Content-type": "application/json"
            }
        })
        const response = await promesa.json()
        if (response.Mensaje == `Porcino con id ${id_porcino} registrado`) {
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
    }
}

async function actualizar_porcino(id_porcino) {
    try {
        const peso_inicial = document.getElementById(`peso-ini-actu-${id_porcino}`).value;
        const peso_final = document.getElementById(`peso-final-actu-${id_porcino}`).value;
        const fecha = document.getElementById(`fecha-naci-actu-${id_porcino}`).value;
        const raza = document.getElementById(`raza-actu-${id_porcino}`).value;
        const sexo = document.getElementById(`sexo-actu-${id_porcino}`).value;
        const etapa = document.getElementById(`etapa-vida-actua-${id_porcino}`).value;
        const estado = document.getElementById(`estado-actu-${id_porcino}`).value;
        const descripcion = document.getElementById(`descripcion-actu-${id_porcino}`).value;

        const porcino = {
            "peso_inicial": peso_inicial,
            "peso_final": peso_final,
            "fecha_nacimiento": fecha,
            "id_raza": raza,
            "sexo": sexo,
            "id_etapa": etapa,
            "estado": estado,
            "descripcion": descripcion
        }
        const promesa = await fetch(`${URL_BASE}/porcino/${id_porcino}`,
            {
                method: "PUT",
                body: JSON.stringify(porcino),
                headers: {
                    "Content-type": "application/json"
                }
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
    }
}


function eliminar_porcino(id_porcino) {
    const input = document.getElementById(`input-eliminar-${id_porcino}`);
    const id_input = document.getElementById(`input-eliminar-${id_porcino}`).value;
    if (id_input == id_porcino){
        fetch(`${URL_BASE}/porcino/${id_porcino}`, {method: 'DELETE'})
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
        .catch(error => console.error('Error', error));
    } else {
        input.style.backgroundColor = '#f8a5a5';
        input.classList.add('placerholder_eliminar')
        input.value = '';
        input.placeholder = 'ID incorrecto...';
    }
}

// -------------------
// HISTORIAL DE PESOS
// -------------------


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

async function crearDialogActualizarPesoHistorial() {
    const nm = await conteoNumeroConsecutivo();
    const porcinos = await consultar_porcinos_cache();
    const campos = [
        { label: 'Fecha de pesaje', id: 'fecha-pesaje-actu', type: 'date', required: true },
        { label: 'ID porcino', id: 'id-porcino-actu', type: 'select', options: porcinos.Porcinos.map(por => por.id_porcino), required: true, placeholder: "Seleccione el ID del porcino" },
        { label: 'Peso final', id: 'peso-final-actu', type: 'number', required: true, placeholder: "Digite el peso en Kg" },
        { label: 'Usuario', id: 'id-usuario-actu', type: 'text', required: true, placeholder: "Juan Tovar", value: 3 },
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
        const pesoFinal = document.getElementById('peso-final-actu');
        const descripcion = document.getElementById('descripcion-actu');
        // Evento cuando cambia el ID del porcino
        selectPorcino.addEventListener('change', async (e) => {
            const idPorcino = e.target.value;
            if (idPorcino) {
                // Consultar los datos del porcino seleccionado
                const porcino = await consulta_individual_porcino(idPorcino, false);
                // Actualizar el texto del preview
                actualizarPreview(porcino, pesoFinal.value, descripcion);
            }
        });
        // Evento cuando cambia el peso
        pesoFinal.addEventListener('input', async () => {
            const idPorcino = selectPorcino.value;
            const porcino = idPorcino ? await consulta_individual_porcino(idPorcino, false) : null;
            actualizarPreview(porcino, pesoFinal.value, descripcion);
        });

    }, 500); // Espera a que el modal esté renderizado
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
    const usuario = "Juan Tovar"; // O obtenerlo dinámicamente si ya lo tienes

    elementoTexto.textContent = `
        El porcino identificado con el ID ${id}, siendo de raza ${raza}, sexo ${sexo} y etapa de vida ${etapa},
        después de su último pesaje registrado por el usuario ${usuario}, presenta un peso de ${peso || "XX"} Kg.
    `;
}

async function consulta_gen_historial_pesos(){
    try {
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos`,
            {
                method: 'GET',
                headers: {
                    "Content-type": "application/json",
                }
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
    }
}

async function consulta_individual_transaccion(id, mostrar=false) {
    try{
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/transaccion/${id}`);
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
        const id = document.getElementById('input_id_hp').value;
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/${id || id_porcino}`);
        const response = await promesa.json()
        if (response.Mensaje === `No hay historial de pesos para el porcino con ID ${id}`) {
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
    } catch (error) {
        console.error(error)
    }
}


async function conteoNumeroConsecutivo() {
    try {
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/conteo_transacciones`,
            {
                method: 'GET',
                headers: {
                    "Content-type": "application/json"
                }
            }
        )
        const response = await promesa.json()
        return response
    } catch (error) {
        console.error(error)
    }
}

async function actualizar_peso_historial() {
    try {
        const fecha_pesaje = document.getElementById('fecha-pesaje-actu').value;
        const id_porcino = document.getElementById('id-porcino-actu').value;
        const peso_final = document.getElementById('peso-final-actu').value;
        const id_usuario = document.getElementById('id-usuario-actu').value;
        const descripcion = document.getElementById('descripcion-actu').textContent;
        const transa = {

            "fecha_pesaje": fecha_pesaje,
            "id_porcino": id_porcino,
            "peso_final": peso_final,
            "id_usuario": id_usuario,
            "descripcion": descripcion
        }

        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/actualizar`,
            {
                method: 'POST',
                body: JSON.stringify(transa),
                headers: {
                    "Content-type": "application/json"
                }
            }
        )
        const response = await promesa.json()
        cerrarDialog(`dialog-actualizar-peso`);
        cerrarDialog(`dialog__his__peso`);
        if (response.Mensaje === `El Peso Final del porcino con id ${id_porcino} actualizado`) {

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
    }
}


// -------------------
// GESTION DE DE RAZAS
// -------------------

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

function crearDialogRegistrarRaza() {
    const campos = [
        { label: 'Nombre', id: 'nombre_raza', required: false },
        { label: 'Descripcion', id: 'descripcion_raza', required: true },
    ]

    const camposHTML = campos.map(campo => `
        <div class = "container__label__input">
            <label for="${campo.id}">${campo.label}</label>
            <input type="text" class="campo-info" id="${campo.id}" ${campo.required ? '' : 'required'}>
        </div>
        `).join('');
    return crearDialogBaseRaza(`dialog-registrar-raza`, 'dialog-icon-eye', 'Registrar Raza', camposHTML, 'Guardar', 'button-guardar', '', 'registrar_raza', '');
}

function crearDialogBaseRaza(id, clase, titulo, contenido, textoBoton, claseBoton, uniqueId, funct, params) {
    // Crear el dialogo
    const dialog = document.createElement("dialog");

    dialog.className = clase;
    dialog.id = id;
    // Armar contenido interno
    dialog.innerHTML = `
        ${clase ? `
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
                    type="${['cerrar', 'continuar', 'siguiente'].includes(textoBoton.toLowerCase()) ? 'button' : 'submit'}"
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

async function consultar_razas(){
    try {
        const promesa = await fetch(`${URL_BASE}/raza`, { method: 'GET' });
        if (!promesa.ok) throw new Error(`Error: ${promesa.status}`);
        const response = await promesa.json();
        paginacion_raza(response)
        return response
    } catch (error) {
        console.error(error)
    }
}

async function consulta_indi_raza(id_raza, mostrar = false){
    try {
        const id = document.getElementById('input_id_raza').value;
        const promesa = await fetch(`${URL_BASE}/raza/${id || id_raza}`);
        const response = await promesa.json();
        if (response.Mensaje === `No hay raza con ID ${id}`) {
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
    }
}

async function registrar_raza() {
    try {
        const nombre = document.getElementById('nombre_raza').value;
        const descri = document.getElementById('descripcion_raza').value;

        const raza = {
            nombre: nombre,
            descripcion: descri
        }

        const promesa = await fetch(`${URL_BASE}/raza`, {
            method: 'POST',
            body: JSON.stringify(raza),
            headers: {
                "Content-type": "application/json"
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
    }
}

async function actualizar_raza(id) {
    try {
        const nombre = document.getElementById(`nombre-raza-actualizar-${id}`).value;
        const descri = document.getElementById(`descripcion-raza-actualizar-${id}`).value;

        const raza = {
            nombre: nombre,
            descripcion: descri
        }

        const promesa = await fetch(`${URL_BASE}/raza/${id}`, {
            method: 'PUT',
            body: JSON.stringify(raza),
            headers: {
                "Content-type": "application/json"
            }
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
    }
}

async function eliminar_raza(id) {
    try {
        const input = document.getElementById(`input-eliminar-${id}`);
        const value_input = document.getElementById(`input-eliminar-${id}`).value;
        if (value_input == id){
            const promesa = await fetch(`${URL_BASE}/raza/${id}`, {method : 'DELETE'});
            const response = await promesa.json();
            cerrarDialog(`modal-delete-confirm`);
            cerrarDialog(`modal-delete`);
            cerrarDialog(`dialog__ges__raz`);
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

// -------------------
// GESTION DE ETAPAS
// -------------------

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




function crearDialogRegistrarEtapa() {
    // ===========================
    // 1. Campos del STEP 1
    // ===========================
    const campos1 = [
        { label: "Nombre", id: "nombre_etapa", required: false, placeholder: "Ingrese el nombre de la etapa..." },
        { label: 'Peso Minimo (Kg)', id: 'peso_min_etapa', required: false, type: "number", placeholder: "Ingrese el peso minimo..." },
        { label: 'Peso Maximo (Kg)', id: 'peso_max_etapa', required: false, type: "number", placeholder: "Ingrese el peso maximo..." },
        { label: 'Dias de duración', id: 'dias_dura_etapa', required: false, type: "number", placeholder: "Duración en días..." },
        { label: 'Semana de duración', id: 'semanas_dura_etapa', required: false, type: "number", placeholder: "Duración en semanas..." },
        { label: 'Descripcion (Opcional)', id: 'descripcion_etapa', required: true, type: "text", placeholder: "Descripción..." },
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
        { label: "E. Metabolizable (Kcal/Kg)", id: "r-energia-metabo", required: false, type: "number", placeholder: "Ingrese la Energia Metabolizable" },
        { label: "Proteína Cruda (%)", id: "r-proteina-cruda", required: false, type: "number", placeholder: "Ingrese la Proteina Cruda" },
        { label: "Fibra Cruda (%)", id: "r-fibra-cruda", required: false, type: "number", placeholder: "Ingrese la Fibra Cruda" },
        { label: "Extracto Etéreo (%)", id: "r-extracto-etereo", required: false, type: "number", placeholder: "Ingrese la Extracto Etéreo" },
        { label: "Calcio (%)", id: "r-calcio", required: false, type: "number", placeholder: "Ingrese el Calcio" },
        { label: "Fosforo Disponible (%)", id: "r-fosforo-disponible", required: false, type: "number", placeholder: "Ingrese el Fosforo Disponible" },
        { label: "Sodio (%)", id: "r-sodio", required: false, type: "number", placeholder: "Ingrese el sodio" },
        { label: "Arginina (%)", id: "r-arginina", required: false, type: "number", placeholder: "Ingrese la Arginina" },
        { label: "Lisina (%)", id: "r-lisina", required: false, type: "number", placeholder: "Ingrese la Lisina" },
        { label: "Treonina (%)", id: "r-treonina", required: false, type: "number", placeholder: "Ingrese la Treonina" },
        { label: "Metionina (%)", id: "r-metionina", required: false, type: "number", placeholder: "Ingrese la Metionina" },
        { label: "Metionina + Cisteína (%)", id: "r-metionina-cisteina", required: false, type: "number", placeholder: "Ingrese la Metionina + Cisteína" },
        { label: "Triptófano (%)", id: "r-triptofano", required: false, type: "number", placeholder: "Ingrese el Triptófano" },
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

async function consultar_etapas() {
    try {
        const promesa = await fetch(`${URL_BASE}/etapa_vida`, { method: 'GET' });
        const response = await promesa.json();
        paginacion_etapa(response)
        return response
    } catch (error) {
        console.error(error)
    }
}

async function consulta_indi_etapas(id_etapa, mostrar = false){
    try {
        const id = document.getElementById('input_id_etapa').value;
        const promesa =  await fetch(`${URL_BASE}/etapa_vida/${id || id_etapa}`);
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
    }
}


async function registrar_etapas() {
    try {
        const etapa = {
            "nombre" : document.getElementById('nombre_etapa').value,
            "descripcion" : document.getElementById("descripcion_etapa").value,
            "peso_min": document.getElementById("peso_min_etapa").value,
            "peso_max": document.getElementById("peso_max_etapa").value,
            "duracion_dias": document.getElementById("dias_dura_etapa").value,
            "duracion_semanas": document.getElementById("semanas_dura_etapa").value,
            "requerimientos": [
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
            method: 'POST',
            body: JSON.stringify(etapa),
            headers: {
                "Content-type": "application/json"
            }
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
    }
}

async function actualizar_etapa(id) {
    try {
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
            method: 'PUT',
            body: JSON.stringify(etapa),
            headers: {
                "Content-type": "application/json",
            }
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
    }
}

async function eliminar_etapa(id) {
    try {
        const input = document.getElementById(`input-eliminar-${id}`);
        const value_input = document.getElementById(`input-eliminar-${id}`).value;

        if (value_input == id) {
            const promesa = await fetch(`${URL_BASE}/etapa_vida/${id}`, {
                method: 'DELETE',
            })
            const response = await promesa.json();
            cerrarDialog(`modal-delete-confirm`);
            cerrarDialog(`modal-delete`);
            cerrarDialog(`dialog__ges__eta`);
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


// --------------------------
// GESTION DE NOTIFICACIONES
// --------------------------

function mostrar_notificaciones(notificaciones) {
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
        // EN ESTE ID DEBE IR EL ID DEL USUARIO QUE TIENE LA SESION ABIERTA
        const id = 3
        const promesa = await fetch(`${URL_BASE}/notificaciones/${id}`,
            {
                method: 'GET',
            }
        )
        const response = await promesa.json()
        mostrar_notificaciones(response)
        return response
    } catch (error) {
        console.error(error)
    }
}

// -------------------
// GESTION DE ALIMENTOS
// -------------------


function ver_alimentos(){
    
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
    pageInfo.innerText = `Pagina ${page} de ${totalPages}`;

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
            <tr class="nuevo1" id="alimento_tour">
                <td class="nuevo td__border__l ">
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

consulta_alimentos()
}

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

async function guardarCambios(id_alimento) {
    const formData = new FormData();

    const nombre = document.getElementById(`edit-nombre-${id_alimento}`).value.trim();
    const estado = document.getElementById(`edit-estado-${id_alimento}`).value;
    const imagen = document.getElementById(`edit-imagen-${id_alimento}`).files[0];

    const elementos = [
        { id_elemento: 1, valor: parseFloat(document.getElementById(`edit-Proteina_cruda-${id_alimento}`).value) || 0 },
        { id_elemento: 2, valor: parseFloat(document.getElementById(`edit-Fosforo-${id_alimento}`).value) || 0 },
        { id_elemento: 3, valor: parseFloat(document.getElementById(`edit-Treonina-${id_alimento}`).value) || 0 },
        { id_elemento: 4, valor: parseFloat(document.getElementById(`edit-Fibra_cruda-${id_alimento}`).value) || 0 },
        { id_elemento: 5, valor: parseFloat(document.getElementById(`edit-Sodio-${id_alimento}`).value) || 0 },
        { id_elemento: 6, valor: parseFloat(document.getElementById(`edit-Metionina-${id_alimento}`).value) || 0 },
        { id_elemento: 7, valor: parseFloat(document.getElementById(`edit-Materia_seca-${id_alimento}`).value) || 0 },
        { id_elemento: 8, valor: parseFloat(document.getElementById(`edit-Extracto_etereo-${id_alimento}`).value) || 0 },
        { id_elemento: 9, valor: parseFloat(document.getElementById(`edit-Arginina-${id_alimento}`).value) || 0 },
        { id_elemento: 10, valor: parseFloat(document.getElementById(`edit-Metionina_Cisteina-${id_alimento}`).value) || 0 },
        { id_elemento: 11, valor: parseFloat(document.getElementById(`edit-Energia_metabo-${id_alimento}`).value) || 0 },
        { id_elemento: 12, valor: parseFloat(document.getElementById(`edit-Calcio-${id_alimento}`).value) || 0 },
        { id_elemento: 13, valor: parseFloat(document.getElementById(`edit-Lisina-${id_alimento}`).value) || 0 },
        { id_elemento: 14, valor: parseFloat(document.getElementById(`edit-Triptofano-${id_alimento}`).value) || 0 }
    ];

    formData.append("nombre", nombre);
    formData.append("estado", estado);
    formData.append("elementos", JSON.stringify(elementos));
    if (imagen) formData.append("imagen", imagen);

    try {
        const response = await fetch(`${URL_BASE}/actualizar_alimento/${id_alimento}`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            if (data.imagen) {
                const preview = document.getElementById(`preview-imagen-${id_alimento}`);
                if (preview) preview.src = data.imagen + "?t=" + new Date().getTime();
            }

            cerrarModal("edit", id_alimento);
            Swal.fire({
                icon: "success",
                title: "Actualizado correctamente",
                text: "El alimento se actualizó exitosamente."
            }).then(() => consulta_alimentos());
        } else {
            cerrarModal("edit", id_alimento);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: data.error || "No se pudo actualizar el alimento."
            }).then(() => abrirModal("edit", id_alimento));
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
        cerrarModal("edit", id_alimento);
        Swal.fire({
            icon: "error",
            title: "Error inesperado",
            text: "Ocurrió un problema al intentar actualizar el alimento."
        }).then(() => abrirModal("edit", id_alimento));
    }
}

async function eliminar_alimento(id) {
    try {
        const response = await fetch(`${URL_BASE}/eliminar_alimento/${id}`, { method: "DELETE" });
        const data = await response.json();

        cerrarModal("dele", id);

        if (response.ok) {
            setTimeout(() => {
                Swal.fire({
                    icon: "success",
                    title: "Eliminado",
                    text: "El alimento se eliminó correctamente.",
                    confirmButtonColor: "#3085d6",
                    background: "#fff",
                    heightAuto: false
                }).then(() => consulta_alimentos());
            }, 200);
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: data.error || "No se pudo eliminar el alimento.",
                confirmButtonColor: "#3085d6",
                background: "#fff",
                heightAuto: false
            }).then(() => {
                abrirModal("dele", id);
            });
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire({
            icon: "error",
            title: "Error inesperado",
            text: "Ocurrió un problema al eliminar el alimento.",
            confirmButtonColor: "#3085d6",
            background: "#fff",
            heightAuto: false
        }).then(() => {
            abrirModal("dele", id);
        });
    }
}

async function cargarAutocompletado() {
    try {
        const response = await fetch(`${URL_BASE}/alimentos`);
        if (!response.ok) throw new Error("Error al obtener alimentos");

        const data = await response.json();

        // Aquí está el arreglo real
        const alimentos = data.mensaje || [];

        const lista = document.getElementById("lista_alimentos");
        lista.innerHTML = "";

        alimentos.forEach(alimento => {
            const option = document.createElement("option");
            option.value = alimento.nombre; // usa el campo correcto
            lista.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando autocompletado:", error);
    }
}

function consulta_individual_alimento_disponible() {
    const nombre = document.getElementById("id_alimento").value.trim();
    const alimentos_en_dieta = document.getElementById("alimentos_en_dieta");

    if (!nombre) {
        Swal.fire({
            icon: "warning",
            title: "Campo vacío",
            text: "Por favor, escribe el nombre del alimento antes de consultar.",
            confirmButtonColor: "#008cffff"
        });
        return;
    }

    fetch(`${URL_BASE}/consulta_indi_alimento_disponible/${nombre}`)
        .then(res => {
            if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            alimentos_en_dieta.innerHTML = "";

            if (!data.mensaje) {
                Swal.fire({
                    icon: "info",
                    title: "Alimento no encontrado",
                    text: `No se encontró el alimento "${nombre}".`,
                    confirmButtonColor: "#3085d6"
                });
                alimentos_en_dieta.innerHTML = `
                    <p class="sin-alimentos">No se encontró el alimento "${nombre}".</p>
                `;
                return;
            }

            const element = data.mensaje;

            alimentos_en_dieta.innerHTML = `
                <div class="alimentos_dietas">
                    <div class="imagen_alimento_dieta">
                      <img src="${URL_BASE}${element.imagen}" 
                             onerror="this.onerror=null; this.src='/src/static/iconos/imagen no encontrada.svg'; this.classList.add('sin_imagen_alimento_dieta')" 
                             alt="no hay imagen">
                    </div>
                    <div class="descripcion_dietas">
                        <p><strong>Nombre:</strong> ${element.nombre}</p>
                        <p><strong>Cantidad (Kg):</strong></p>
                        <input type="number" min="0" class="input_dietas" id="cantidad-${element.nombre}" placeholder="Cantidad">
                    </div>
                </div>
            `;
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error al consultar el alimento",
                text: "Ocurrió un problema al realizar la consulta.",
                confirmButtonColor: "#d33"
            });
            alimentos_en_dieta.innerHTML = `<p>Error al consultar el alimento.</p>`;
        });
}

function crear_alimento() {
    document.getElementById("formRegistrar").addEventListener("submit", function (e) {
        e.preventDefault();

        const numeros = document.querySelectorAll('input[type="number"]');
        for (let input of numeros) {
            if (parseFloat(input.value) < 0) {
                Swal.fire({
                    title: "Valor inválido",
                    text: "No se permiten números negativos.",
                    icon: "warning",
                    confirmButtonText: "Entendido"
                });
                return;
            }
        }

        const formData = new FormData();
        const imagen = document.getElementById("imagen").files[0];
        if (imagen) {
            formData.append("imagen", imagen);
        }

        formData.append("nombre_alimento", document.getElementById("nombre").value);

const elementos = [
    { id: 1, valor: parseFloat(document.getElementById("proteina_cruda").value) || 0 },
    { id: 2, valor: parseFloat(document.getElementById("fosforo").value) || 0 },
    { id: 3, valor: parseFloat(document.getElementById("treonina").value) || 0 },
    { id: 4, valor: parseFloat(document.getElementById("fibra_cruda").value) || 0 },
    { id: 5, valor: parseFloat(document.getElementById("sodio").value) || 0 },
    { id: 6, valor: parseFloat(document.getElementById("metionina").value) || 0 },
    { id: 7, valor: parseFloat(document.getElementById("materia_seca").value) || 0 },
    { id: 8, valor: parseFloat(document.getElementById("extracto_etereo").value) || 0 },
    { id: 9, valor: parseFloat(document.getElementById("arginina").value) || 0 },
    { id: 10, valor: parseFloat(document.getElementById("metionina_cisteina").value) || 0 },
    { id: 11, valor: parseFloat(document.getElementById("energia_m").value) || 0 }, // este input sigue siendo "energia_m"
    { id: 12, valor: parseFloat(document.getElementById("calcio").value) || 0 },
    { id: 13, valor: parseFloat(document.getElementById("lisina").value) || 0 },
    { id: 14, valor: parseFloat(document.getElementById("triptofano").value) || 0 }
];


        formData.append("elementos", JSON.stringify(elementos));

        fetch(`${URL_BASE}/registrar_alimento`, {
            method: "POST",
            body: formData
        })
            .then(async res => {
                try {
                    return await res.json();
                } catch (error) {
                    throw new Error("El servidor no envió un JSON válido.");
                }
            })
            .then(res => {
                if (res.mensaje) {
                    Swal.fire({
                        title: "Registrado",
                        text: res.mensaje,
                        icon: "success",
                        confirmButtonText: "Aceptar",
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then(result => {
                        if (result.isConfirmed) {
                            window.location.href = "alimentos.html";
                        }
                    });
                } else if (res.error) {
                    Swal.fire("Error", res.error, "error");
                }
            })
            .catch(err => {
                Swal.fire("Error", err.message, "error");
            });
    });

}

function abrirModal(tipo, id) {
    document.getElementById(`modal-${tipo}-${id}`).showModal();
}
function cerrarModal(tipo, id) {
    document.getElementById(`modal-${tipo}-${id}`).close();
}


// -------------------------dietas----------------------

function dietas() {
    const alimentos_en_dieta = document.getElementById("alimentos_en_dieta");

    fetch(`${URL_BASE}/alimentos_disponible`)
        .then(res => {
            if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            alimentos_en_dieta.innerHTML = "";

            if (!data.mensaje || data.mensaje.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "Sin alimentos disponibles",
                    text: "Actualmente no hay alimentos registrados o activos.",
                    confirmButtonColor: "#3085d6"
                });
                alimentos_en_dieta.innerHTML = `
                    <p class="sin-alimentos">No hay alimentos disponibles actualmente.</p>
                `;
                return;
            }

            data.mensaje.forEach(element => {
                console.log(element);

                const mapa = {};
                if (Array.isArray(element.elementos)) {
                    element.elementos.forEach(n => {
                        mapa[n.nombre] = n.valor;
                    });
                }

                alimentos_en_dieta.innerHTML += `
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
      <input value="${mapa.Proteina_cruda ?? ''}" readonly>

      <p>Materia seca (%)</p>
      <input value="${mapa.Materia_seca ?? ''}" readonly>

      <p>Energía metabolizable (Kcal/kg)</p>
      <input value="${mapa.Energia_metabo ?? ''}" readonly>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input value="${mapa.Fibra_cruda ?? ''}" readonly>

      <p>Extracto etéreo (%)</p>
      <input value="${mapa.Extracto_etereo ?? ''}" readonly>

      <p>Calcio (%)</p>
      <input value="${mapa.Calcio ?? ''}" readonly>

      <p>Fósforo (%)</p>
      <input value="${mapa.Fosforo ?? ''}" readonly>
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input value="${mapa.Sodio ?? ''}" readonly>

      <p>Arginina (%)</p>
      <input value="${mapa.Arginina ?? ''}" readonly>

      <p>Lisina (%)</p>
      <input value="${mapa.Lisina ?? ''}" readonly>

      <p>Treonina (%)</p>
      <input value="${mapa.Treonina ?? ''}" readonly>
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input value="${mapa.Metionina ?? ''}" readonly>

      <p>Metionina + Cisteína (%)</p>
      <input value="${mapa.Metionina_Cisteina ?? ''}" readonly>

      <p>Triptófano (%)</p>
      <input value="${mapa.Triptofano ?? ''}" readonly>
    </section>

  </div>

  <div class="modal-footer">
    <button onclick="cerrarModal('eye', ${element.id_alimento})" class="btn">
      Cerrar
    </button>
  </div>
</dialog>

<!-- Tarjeta del alimento -->
<div class="alimentos_dietas">

    <!-- CÍRCULO SUPERIOR IZQUIERDO -->
    <div class="circulo-seleccion" onclick="toggleInput(${element.id_alimento})"></div>

    <div class="imagen_alimento_dieta">
        <img id="imagen_dietas" src="${URL_BASE}${element.imagen}" 
             onclick="abrirModal('eye', ${element.id_alimento})"
             onerror="this.onerror=null; this.src='/src/static/iconos/imagen no encontrada.svg'; this.classList.add('sin_imagen_alimento_dieta')"
             alt="no hay imagen" style="cursor:pointer;">
    </div>

    <div class="descripcion_dietas">
        <p><strong>Nombre:</strong> ${element.nombre}</p>
        <p><strong>Cantidad (Kg):</strong></p>

        <input type="number" min="0" class="input_dietas"
               data-id="${element.id_alimento}"
               id="cantidad-${element.id_alimento}"
               placeholder="Cantidad"
               disabled>
    </div>
</div>
                `;
            });
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error al cargar los alimentos",
                text: "Ocurrió un problema al obtener los alimentos disponibles.",
                confirmButtonColor: "#d33"
            });
            alimentos_en_dieta.innerHTML = `<p>Error al cargar los alimentos.</p>`;
        });
}

function toggleInput(id) {
    const input = document.getElementById(`cantidad-${id}`);
    const boton = event.target;

    if (input.disabled) {
        input.disabled = false;
        boton.classList.add("activo");
    } else {
        input.disabled = true;
        input.value = "";
        boton.classList.remove("activo");
    }
}


function rellenar_etapa_vida_en_dietas() {
    fetch(`${URL_BASE}/etapa_vida`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('select-etapas');

            if (data.etapas && data.etapas.length > 0) {
                data.etapas.forEach(etapa => {
                    const option = document.createElement('option');
                    option.value = etapa.id_etapa;      // valor del select = id de la etapa
                    option.textContent = etapa.nombre;  // texto visible = nombre de la etapa
                    select.appendChild(option);
                });
            }
        })
        .catch(err => console.error("Error al cargar las etapas:", err));
    document.getElementById("select-etapas").addEventListener("change", function () {

        const idEtapa = this.value;

        fetch(`${URL_BASE}/etapa_vida`)
            .then(res => res.json())
            .then(data => {

                const etapa = data.etapas.find(e => e.id_etapa == idEtapa);
                if (!etapa) return;

                const req = etapa.requerimientos || [];

                // función para buscar el porcentaje
                function getValor(nombre) {
                    const item = req.find(r => r.nombre_elemento.toLowerCase() === nombre.toLowerCase());
                    return item ? item.porcentaje : "0";
                }

                // Primera columna
                document.getElementById("materia_seca").textContent = getValor("Materia_seca");
                document.getElementById("energia_metabolizable").textContent =
                    getValor("Energia_metabo"); // así viene del backend
                document.getElementById("proteina_cruda").textContent = getValor("Proteina_cruda");
                document.getElementById("fibra_cruda").textContent = getValor("Fibra_cruda");
                document.getElementById("extracto_etereo").textContent = getValor("Extracto_etereo");
                document.getElementById("calcio").textContent = getValor("Calcio");
                document.getElementById("fosforo_disponible").textContent = getValor("Fosforo");

                // Segunda columna
                document.getElementById("sodio").textContent = getValor("Sodio");
                document.getElementById("arginina").textContent = getValor("Arginina");
                document.getElementById("lisina").textContent = getValor("Lisina");
                document.getElementById("treonina").textContent = getValor("Treonina");
                document.getElementById("metionina").textContent = getValor("Metionina");
                document.getElementById("metionina_cistenina").textContent =
                    getValor("Metionina_Cisteina"); // así viene en tu JSON
                document.getElementById("triptofano").textContent = getValor("Triptofano");
            })
            .catch(err => console.error("Error:", err));
    });

}

function consulta_dietas() {
    const contenido = document.getElementById("contenido"); 
    fetch(`${URL_BASE}/dieta`, { method: "GET" })
        .then(res => res.json())
        .then(data => {
            contenido.innerHTML = "";
            data.mensaje.forEach(dieta => {
                const Numero_Dietas =data.mensaje.length;
                Dietas_totales.innerHTML=`Dietas Totales : ${Numero_Dietas} `;
                contenido.innerHTML += `
                    <tr class="nuevo1">
                        <td class="nuevo td__border__l"><img class="svg__alimento" src="/src/static/iconos/ramen 1.svg">
                        </td>
                    <td class="nuevo">${dieta.id_dieta}</td>
                    <td class="nuevo">${dieta.usuario}</td>
                    <td class="nuevo">${dieta.etapa_vida}</td>
                    <td class="nuevo">${dieta.fecha_creacion}</td>
                    <td class="nuevo">${dieta.estado}</td>
                    <td class="nuevo td__border__r">
                        <img src="/src/static/iconos/icon eye.svg" 
                             onclick="abrirModalDieta(${dieta.id_dieta})" 
                             class="icon-eye">
                        
                        <img src="/src/static/iconos/edit icon.svg" 
                             onclick="abrirModalDieta(${dieta.id_dieta})" 
                             class="icon-edit">
                        
                        <img src="/src/static/iconos/delete icon.svg" 
                             onclick="abrirModalDieta(${dieta.id_dieta})" 
                             class="icon-delete">
                        
                             
                             
                    </td>
                    </tr>

                `;
            });
        })
        .catch(err => {
            console.error(err);
            contenido.innerHTML = `<tr><td colspan="7">Error al cargar las dietas</td></tr>`;
        });
}
function consulta_individual_dieta() {
    const contenido = document.getElementById("contenido");
    const Dietas_totales = document.getElementById("Dietas_totales");
    const id = document.getElementById("input_id").value.trim();

    // Validación 1: campo vacío
    if (id === "") {
        Swal.fire("Error", "Por favor ingrese un ID de dieta.", "warning");
        return;
    }

    fetch(`${URL_BASE}/dieta/${id}`, { method: "GET" })
        .then(res => res.json())
        .then(data => {

            // Validación 2: dieta no encontrada
            if (!data.mensaje) {
                Swal.fire("No encontrado", "No existe una dieta con ese ID.", "error");
                // NO modificar tabla
                return;
            }

            // Si existe → render normal
            const dieta = data.mensaje;

            contenido.innerHTML = `
                <tr class="nuevo1">
                    <td class="nuevo td__border__l">
                        <img class="svg__alimento" src="/src/static/iconos/ramen 1.svg">
                    </td>

                    <td class="nuevo">${dieta.id_dieta}</td>
                    <td class="nuevo">${dieta.id_usuario}</td>
                    <td class="nuevo">${dieta.etapa_vida}</td>
                    <td class="nuevo">${dieta.fecha_creacion}</td>
                    <td class="nuevo">${dieta.estado}</td>

                    <td class="nuevo td__border__r">
                        <img src="/src/static/iconos/icon eye.svg" 
                             onclick="abrirModalDieta(${dieta.id_dieta})" 
                             class="icon-eye">

                        <img src="/src/static/iconos/edit icon.svg" 
                             onclick="abrirModalDieta(${dieta.id_dieta})" 
                             class="icon-edit">

                        <img src="/src/static/iconos/delete icon.svg" 
                             onclick="abrirModalDieta(${dieta.id_dieta})" 
                             class="icon-delete">
                    </td>
                </tr>
            `;

            Dietas_totales.innerHTML = "";
        })
        .catch(err => {
            console.error(err);
            // Validación 3: fallo de servidor
            Swal.fire("Error", "Hubo un problema al consultar la dieta.", "error");
            // NO modificar tabla
        });
}

function guardarDieta() {
    const id_usuario = 3; // reemplaza con el usuario logueado
    const id_etapa_vida = document.getElementById("select-etapas").value;

    // Función para mostrar errores tipo toast
    function mostrarError(mensaje) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'warning',
            title: mensaje,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
        });
    }

    // Validar etapa de vida
    if (!id_etapa_vida) {
        mostrarError("Debes seleccionar la etapa de vida");
        return;
    }

    // Recopilar alimentos con cantidad
    const alimentos = [];
    document.querySelectorAll(".input_dietas").forEach(input => {
        const cantidad = parseFloat(input.value);
        if (!isNaN(cantidad) && cantidad > 0) {
            alimentos.push({
                id_alimento: parseInt(input.dataset.id),
                cantidad: cantidad
            });
        }
    });

    if (alimentos.length === 0) {
        mostrarError("Debes ingresar al menos un alimento con cantidad");
        return;
    }

    // Modal para agregar descripción (solo este es un modal)
    Swal.fire({
        title: '¿Quieres agregar una descripción?',
        input: 'textarea',
        inputPlaceholder: 'Escribe la descripción aquí...',
        showCancelButton: true,
        confirmButtonText: 'Guardar dieta',
        cancelButtonText: 'No poner descripción',
        backdrop: 'rgba(0,0,0,0.2)' // overlay ligero
    }).then((result) => {
        const descripcion = result.isConfirmed ? (result.value || '') : '';

        // Enviar datos al backend
        fetch(`${URL_BASE}/crear_dieta`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_usuario,
                id_etapa_vida,
                descripcion,
                alimentos
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                // Toast de error
                mostrarError(data.error);
            } else {
                // Toast de éxito
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Dieta creada correctamente',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true
                });

                console.log("Mezcla nutricional:", data.mezcla_nutricional);
                consulta_dietas(); // actualizar lista de dietas
            }
        })
        .catch(err => {
            console.error(err);
            mostrarError("No se pudo guardar la dieta");
        });
    });
}


// ----------------------------------funciones adicionales

function iniciarTourAlimentos() {
    const driver = new Driver({
        showProgress: true,   // muestra la barra de progreso
        allowClose: false,    // evita que el usuario cierre el tour antes de terminar
        overlayOpacity: 0.4   // opacidad del fondo oscuro
    });

    driver.defineSteps([
        {
            element: '#crear_alimento',
            popover: {
                title: 'Crear un alimento',
                description: 'Presiona este botón para registrar un nuevo alimento en el sistema, agregando su información nutricional y general.',
                position: 'bottom',
                clasname: "tour-modal-onbackground"
            }
        },
        {
            element: '#id_alimento',
            popover: {
                title: 'Buscar un alimento',
                description: 'Ingresa el nombre o ID de un alimento para buscarlo rápidamente en la base de datos.',
                position: 'bottom',
                clasname: "tour-modal-onbackground"
            }
        },
        {
            element: '#enviar_consulta',
            popover: {
                title: 'Botón de consulta',
                description: 'Haz clic aquí para ejecutar la búsqueda del alimento ingresado en la casilla anterior.',
                position: 'bottom'
            }
        },
        {   
            element: '#consultar_todo',
            popover: {
                title: 'Consultar todo',
                description: 'Este botón permite ver todos los alimentos registrados, útil después de hacer búsquedas individuales.',
                position: 'top'
            }
        },
        {
            element: '#head_alimento',
            popover: {
                title: 'Información general',
                description: 'Aquí se muestran los encabezados de la tabla con los datos principales de cada alimento registrado.',
                position: 'top'
            }
        },
        {
            element: '#alimento_tour',
            popover: {
                title: 'Fila de alimento',
                description: 'Cada fila representa un alimento registrado, mostrando su ID, información nutricional y opciones de acción.',
                position: 'top'
            }
        },
        {
            element: '#acciones',
            popover: {
                title: 'Acciones disponibles',
                description: 'Esta columna lista todas las acciones que puedes realizar sobre un alimento, como ver, editar o eliminar.',
                position: 'top'
            }
        },
        {
            element: '.icon-eye',
            popover: {
                title: 'Visualizar',
                description: 'Haz clic aquí para ver toda la información detallada del alimento en esa fila.',
                position: 'left'
            }
        },
        {
            element: '.icon-edit',
            popover: {
                title: 'Editar',
                description: 'Permite modificar la información del alimento, incluyendo datos nutricionales y generales.',
                position: 'left'
            }
        },
        {
            element: '.icon-delete',
            popover: {
                title: 'Eliminar',
                description: 'Elimina el alimento seleccionado de la base de datos de manera permanente, no es recomendable eliminar un alimento. lo mejor es desactivarlo, elimina un alimento solo si ingresastes alimentos incorrectos o alimento no utilizados en dietas.',
                position: 'left'
            }
        }
    ]);

    driver.start();
}
function iniciarTourHome() {
    const driver = new Driver({
        showProgress: true,   // muestra la barra de progreso
        allowClose: false,    // evita que el usuario cierre el tour antes de terminar
        overlayOpacity: 0.4   // opacidad del fondo oscuro
    });

    driver.defineSteps([
        {
            element: '#usuario',
            popover: {
                title: 'botom de usuario',
                description: 'Este boton te facilitara el modo para ir a tu cuenta o cerrar sesione',
                position: 'left',
                clasname: "tour-modal-onbackground"
            }
        },
        {
            element: '#id_alimento',
            popover: {
                title: 'Buscar un alimento',
                description: 'Esta casilla permite digitar el nombre de un alimento.',
                position: 'bottom',
                clasname: "tour-modal-onbackground"
            }
        },
        {
            element: '#enviar_consulta',
            popover: {
                title: 'Botón de consulta',
                description: 'Presiona este botón para buscar el alimento escrito.',
                position: 'bottom'
            }
        },
        {   

            element: '#consultar_todo',
            popover: {
                title: 'consultar todo',
                description: 'este botom ayuda a consultar todo luego de hacer una consulta individua',
                position: 'top'
            }
        },
                {

            element: '#head_alimento',
            popover: {
                title: 'Información general',
                description: 'Aquí se muestran los datos de los alimentos.',
                position: 'top'
            }
        },
                {
            element: '#alimento_tour',
            popover: {
                title: 'Alimento_tour',
                description: 'este es un alimento que fue regitrado, tiene informacion general como su id, unos requerimientos nutricionales y unas funciones adicionales ',
                position: 'top'
            }
        },
                {
            element: '#acciones',
            popover: {
                title: 'acciones',
                description: 'lista de acciones mencionadas',
                position: 'top'
            }
        },
                {
            element: '.icon-eye',
            popover: {
                title: 'visualizar',
                description: 'este bottom permite ver por completo la informacion del alimento que esta en su misma ilera ',
                position: 'left'
            }
        },
                {
            element: '.icon-edit',
            popover: {
                title: 'editar',
                description: 'este bottom permite ver por completo la informacion del alimento que esta en su misma ilera ',
                position: 'left'
            }
        },
                {
            element: '.icon-delete',
            popover: {
                title: 'eliminar',
                description: 'este bottom permite ver por completo la informacion del alimento que esta en su misma ilera ',
                position: 'left'
            }
        }
    ]);

    driver.start();
}
function iniciarTourAgregar_alimento() {
    const driver = new Driver({
        showProgress: true,   // muestra la barra de progreso
        allowClose: false,    // no deja cerrar el tour antes de terminar
        overlayOpacity: 0.4
    });

    driver.defineSteps([
        {
            element: '.section__add__por header h1',
            popover: {
                title: 'Título de la página',
                description: 'Aquí se indica que estás registrando un nuevo alimento.',
                position: 'bottom'
            }
        },
        {
            element: '#columna1',
            popover: {
                title: 'Columna 1: Imagen y Proteínas',
                description: 'Aquí puedes subir la imagen del alimento y registrar proteína cruda, fósforo y metionina.',
                position: 'right'
            }
        },
        {
            element: '#columna2',
            popover: {
                title: 'Columna 2: Nombre y Fibra',
                description: 'Escribe el nombre del alimento y registra fibra cruda, sodio y metionina + cisteína.',
                position: 'right'
            }
        },
        {
            element: '#columna3',
            popover: {
                title: 'Columna 3: Materia seca y aminoácidos',
                description: 'Aquí se registran materia seca, extracto etéreo, arginina y treonina.',
                position: 'right'
            }
        },
        {
            element: '#columna4',
            popover: {
                title: 'Columna 4: Energía y minerales',
                description: 'Registra energía metabolizable, calcio, lisina y triptófano.',
                position: 'left'
            }
        },
        {
            element: '.input_add1',
            popover: {
                title: 'Guardar alimento',
                description: 'Cuando completes todos los campos, presiona este botón para guardar el alimento.',
                position: 'top'
            }
        }
    ]);

    driver.start();
}
function iniciarTourAgregarDietas() {
    const driver = new Driver({
        showProgress: true,
        allowClose: false,
        overlayOpacity: 0.4
    });

    driver.defineSteps([
        {
            element: '.container__title_dietas',
            popover: {
                title: 'Crear Dietas',
                description: 'En este apartado puedes crear una nueva dieta para los porcinos, asignando los alimentos y cantidades necesarias.',
                position: 'bottom'
            }
        },
        {
            element: '.container__search__bar_dietas',
            popover: {
                title: 'Buscador de Alimentos',
                description: 'Busca un alimento por nombre o selecciona "consultar todo" para ver la lista completa de alimentos disponibles.',
                position: 'bottom'
            }
        },
        {
            element: '.buscador_etapa_dietas',
            popover: {
                title: 'Seleccionar Etapa de Vida',
                description: 'Selecciona la etapa de vida de los porcinos (preinicial, inicial, crecimiento, etc.) para ajustar los requerimientos nutricionales de la dieta.',
                position: 'bottom'
            }
        },
        {
            element: '#alimentos_en_dieta',
            popover: {
                title: 'Alimentos Agregados',
                description: 'Aquí se muestran los alimentos que has seleccionado para la dieta. Solo aparecen los activos y listos para ser incluidos.',
                position: 'right'
            }
        },
        {
            element: '.alimentos_dietas',
            popover: {
                title: 'Alimento Individual',
                description: 'Cada alimento puede activarse para incluirlo en la dieta. También podrás ingresar la cantidad exacta que se usará.',
                position: 'right'
            }
        },
        {
            element: '.circulo-seleccion',
            popover: {
                title: 'Agregar Alimento',
                description: 'Haz clic en este botón para añadir el alimento seleccionado a la dieta.',
                position: 'right'
            }
        },
        {
            element: '.input_dietas',
            popover: {
                title: 'Cantidad de Alimento',
                description: 'Después de seleccionar un alimento, ingresa la cantidad que se usará en la dieta (en kg).',
                position: 'right'
            }
        },
        {
            element: '#imagen_dietas',
            popover: {
                title: 'Información del Alimento',
                description: 'Al hacer clic en la imagen del alimento, verás sus propiedades nutricionales y otros detalles importantes.',
                position: 'right'
            }
        },
        {
            element: '.requisitos_nutricionales1',
            popover: {
                title: 'Requerimientos Nutricionales de la Mezcla',
                description: 'Aquí se muestra el aporte nutricional de todos los alimentos seleccionados, permitiéndote comparar con los requerimientos de la dieta.',
                position: 'left'
            }
        },
        {
            element: '#graficoMezcla',
            popover: {
                title: 'Gráfico de Mezcla Nutricional',
                description: 'Visualiza de manera gráfica la distribución de los nutrientes de la dieta según los alimentos agregados.',
                position: 'left'
            }
        },
        {
            element: '.container_requerimientos_etapa',
            popover: {
                title: 'Requerimientos por Etapa de Vida',
                description: 'Compara los requerimientos nutricionales específicos de la etapa de vida del porcino con la mezcla que has creado.',
                position: 'left'
            }
        },
        {
            element: '.btn1',
            popover: {
                title: 'Guardar Dieta',
                description: 'Cuando hayas agregado todos los alimentos y cantidades necesarias, presiona este botón para guardar la dieta en el sistema.',
                position: 'top'
            }
        }
    ]);

    driver.start();
}
function iniciarComandosDeVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = false;

    // Sinónimos de acciones
    const crearWords = ["crear", "agregar", "añadir", "registrar", "nuevo", "añade", "agrega"];
    const verWords = ["ver", "consultar", "mostrar", "abrir", "listar", "enseñar", "consulten"];

    function contieneCualquiera(texto, palabras) {
        return palabras.some(p => texto.includes(p));
    }

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Escuchado:", transcript);

        // --- Crear Dieta ---
        if (contieneCualquiera(transcript, crearWords) && transcript.includes("dieta")) {
            window.location.href = "/src/templates/add_dietas.html";
        }

        // --- Ver Alimentos ---
        if (contieneCualquiera(transcript, verWords) && transcript.includes("alimentos")) {
            window.location.href = "/src/templates/alimentos.html";
        }

        // --- Crear Alimento ---
        if (contieneCualquiera(transcript, crearWords) && transcript.includes("alimentos")) {
            window.location.href = "/src/templates/add_alimento.html";
        }

        // --- Ver Porcinos ---
        if (contieneCualquiera(transcript, verWords) && transcript.includes("porcinos")) {
            window.location.href = "/src/templates/porcinos.html";
        }

        // --- Crear Porcino ---
        if (contieneCualquiera(transcript, crearWords) && transcript.includes("porcinos")) {
            window.location.href = "/src/templates/add_porcinos.html";
        }

        // --- Ver Dietas ---
        if (contieneCualquiera(transcript, verWords) && transcript.includes("dietas")) {
            window.location.href = "/src/templates/gestionar_dietas.html";
        }

        // --- Ver Notificaciones ---
        if (contieneCualquiera(transcript, verWords) && transcript.includes("notificaciones")) {
            window.location.href = "/src/templates/notificaciones.html";
        }

        // --- Cerrar sesión ---
        if (transcript.includes("cerrar sesión") || transcript.includes("cerrar sesion")) {
            alert("Sesión cerrada");
        }

        // --- Ir al inicio ---
        if (transcript.includes("inicio") || transcript.includes("home")) {
            window.location.href = "/index.html";
        }
    };

    recognition.onstart = () => {
        console.log("🎤 Sistema listo para escuchar comandos...");
    };

    recognition.onerror = (event) => {
        console.error("Error en voz:", event.error);
    };

    recognition.start();
}








function timesleep() {
    let tiempoInactividad;
    let tiempoCierre;
    let cuentaRegresiva = 30;
    let modalAbierto = false; // bandera para saber si el modal está abierto

    function iniciarTemporizador() {
        tiempoInactividad = setTimeout(() => {
            mostrarAlerta();
        }, 1200000);
    }

    function mostrarAlerta() {
        modalAbierto = true; // modal abierto
        cuentaRegresiva = 30;

        Swal.fire({
            title: 'mucho tiempo de inactividad, ¿sigues aquí?',
            html: `<p>Tu sesión se cerrará en <b id="contador">${cuentaRegresiva}</b> segundos.</p>`,
            imageUrl: '/src/static/iconos/cerdito.sueño.png',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: 'Cerdito con sueño 😴',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cerrar sesión',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                const contadorElem = Swal.getHtmlContainer().querySelector('#contador');

                tiempoCierre = setInterval(() => {
                    cuentaRegresiva--;
                    contadorElem.textContent = cuentaRegresiva;

                    if (cuentaRegresiva <= 0) {
                        clearInterval(tiempoCierre);
                        Swal.close();
                        modalAbierto = false;
                        cerrarSesion();
                    }
                }, 1000);

                // Eventos de los botones
                const confirmButton = Swal.getConfirmButton();
                const cancelButton = Swal.getCancelButton();

                confirmButton.addEventListener('click', () => {
                    clearInterval(tiempoCierre);
                    Swal.close();
                    modalAbierto = false;
                    reiniciarInactividad();
                });

                cancelButton.addEventListener('click', () => {
                    clearInterval(tiempoCierre);
                    Swal.close();
                    modalAbierto = false;
                    cerrarSesion();
                });
            },
        });
    }

    function cerrarSesion() {
        Swal.fire({
            icon: 'info',
            title: 'Sesión cerrada',
            text: 'Tu sesión fue cerrada por inactividad.',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = '/src/templates/index.html';
        });
    }

    function reiniciarInactividad() {
        if (!modalAbierto) {
            clearTimeout(tiempoInactividad);
            iniciarTemporizador();
        }
    }

    window.onload = iniciarTemporizador;
    document.onmousemove = reiniciarInactividad;
    document.onkeydown = reiniciarInactividad;
    document.onclick = reiniciarInactividad;
}
const cerdo = document.getElementById("cerdo");
const barralateral = document.querySelector(".barra-lateral");
const spans = document.querySelectorAll("span");
const menu = document.querySelector(".menu")

menu.children[1].style.display = "none"
menu.addEventListener("click", () => {
    barralateral.classList.toggle("max-barra-lateral")
    if (barralateral.classList.contains("max-barra-lateral")) {
        menu.children[0].style.display = "none"
        menu.children[1].style.display = "block"
    }
    else {
        menu.children[0].style.display = "block"
        menu.children[1].style.display = "none"
    }
})

document.addEventListener("click", (e) => {
    if (
        !barralateral.contains(e.target) &&
        !menu.contains(e.target)
    ) {
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

function notificaciones_nuevo() {
    const endpoint = `${URL_BASE}/ultima_notificacion/3`;
    const url_notificaciones = "/src/templates/notificaciones.html"; 

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    let ultimaId = parseInt(localStorage.getItem('ultima_notificacion_id') || 0);

    function mostrarNotificacion(titulo, mensaje, id) {
        if (Notification.permission === "granted") {
            const noti = new Notification(titulo, {
                body: mensaje,
                icon: "/src/static/iconos/logo_login.png"
            });

            noti.onclick = function () {
                window.open(url_notificaciones, "_blank"); 
                noti.close();
            };
        }
        localStorage.setItem('ultima_notificacion_id', id);
        ultimaId = id;
    }

    function revisarNotificaciones() {
        fetch(endpoint)
            .then(res => res.json())
            .then(data => {
                const noti = data.Notificacion;
                if (noti) {
                    const idActual = parseInt(noti.id_notificacion);
                    if (idActual > ultimaId) {
                        mostrarNotificacion(noti.titulo, noti.mensaje, idActual);
                    }
                }
            })
            .catch(err => console.error("Error al consultar notificaciones:", err));
    }

    revisarNotificaciones();
    setInterval(revisarNotificaciones, 10000);
}



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

document.getElementById('btn_consultar_todo').addEventListener('click', () =>{
    const input_id = document.getElementById('input_id');
    input_id.readOnly = false
    input_id.disabled = false
    input_id.value = "Ingrese el ID del porcino"
    const filter_2 = document.getElementById("filter__options__2");
    if (filter_2){
        filter_2.style.display = "none";
    }
    document.querySelectorAll(".rm_filter").forEach(select => {
        select.disabled = false
        select.selectedIndex = 0;
    })

    consulta_general_porcinos()
})

document.getElementById('btn_consultar_todo_raza').addEventListener('click', () => {
    const input_id_raza = document.getElementById('input_id_raza');
    if (input_id_raza){
        input_id_raza.value = "Ingrese el ID de la raza";
    }
    consultar_razas()
})

document.getElementById('btn_consultar_todo_etapa').addEventListener('click', () => {
    const input_id_etapa = document.getElementById('input_id_etapa');
    if (input_id_etapa){
        input_id_etapa.value = "Ingrese el ID de la etapa";
    }
    consultar_etapas()
})

document.getElementById('btn_consultar_todo_historial').addEventListener('click', () =>{
    const input_id_historial = document.getElementById('input_id_hp');
    if (input_id_historial){
        input_id_historial.value = "Ingrese el ID del porcino"
    }
    consulta_gen_historial_pesos()
})