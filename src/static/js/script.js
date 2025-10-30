const URL_BASE = 'http://127.0.0.1:5000'

// Al cargar la página, crear los diálogos directamente
document.addEventListener('DOMContentLoaded', function() {
    crearDialogRegistrarRaza();
    crearDialogRegistrarEtapa();
    crearDialogActualizarPesoHistorial();
});

// REDIRECCION DE FORMA LENTA HACIA LOS HTML

function redirectWithDelay(event, url) {
    event.preventDefault(); // Evita que el enlace redirija de inmediato

    // Aquí puedes poner una animación o efecto antes de redirigir
    console.log("Esperando antes de redirigir...");

    // Esperar 1 segundo (1000 ms) antes de redirigir
    setTimeout(() => {
        window.location.href = url;  
    }, 1000);
}

// FUCNIONALIDAD PARA LA BARRA DE NAVEGACION

const nav_bar = document.querySelectorAll('.nav__item')

function bar_funct(){
    nav_bar.forEach((item) => 
    item.classList.remove('active'));
    this.classList.add('active');
}
nav_bar.forEach((item) => item.addEventListener('click',bar_funct));

// MANEJO DE RUTAS DEL LOGIN Y REGISTRO DE USUARIOS


async function registro_usuarios() {
    try {
        const nombre = document.getElementById('fname').value;
        const tipo_identificacion = document.getElementById('tipo_identificacion').value;
        const numero_identificacion = document.getElementById('n.i').value;
        const correo = document.getElementById('correo').value;
        const contraseña = document.getElementById('password').value;
        const constraseña_confirm = document.getElementById('confirmPassword').value;

        if ((constraseña_confirm == contraseña) && (contraseña != '')){
            const user = {
                "numero_identificacion" : numero_identificacion,
                "nombre" : nombre,
                "correo" : correo,
                "contraseña" : contraseña,
                "estado" : "Activo",
                "id_tipo_identificacion" : tipo_identificacion,
            }
            fetch(`${URL_BASE}/users`, 
                {
                    method: 'POST',
                    body: JSON.stringify(user),
                    headers : {
                        "Content-type" : "application/json"
                    }
                }).then(response => {
                }).then(() => {
                    Swal.fire({
                        title: "Mensaje",
                        text: `Usuario registrado correctamente`,
                        icon: "success"
                    });
                })
        } else{
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
        const correo  = document.getElementById('entrada1').value;
        const contraseña  = document.getElementById('entrada2').value;

        const user = {
            "correo" : correo,
            "contraseña" : contraseña
        }

        fetch(`${URL_BASE}/login`,
            {
                method: 'POST',
                body: JSON.stringify(user),
                headers : {
                    "Content-type" : "application/json"
                }
            }).then(response => {
                return response.json()
            }).then(response => {
                if (response.Mensaje === 'Las crendenciales son correctas'){
                    location.href = 'home.html'
                } else if (response.Mensaje === 'Contraseña incorrecta'){
                    Swal.fire({
                        title: "Mensaje",
                        text: `Constraseña incorrecta`,
                        icon: "error"
                    });
                } else if (response.Mensaje === 'Usuario no encontrado'){
                    Swal.fire({
                        title: "Mensaje",
                        text: `Usuario no encontrado`,
                        icon: "error"
                    });
                } else{
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

function llenarSelectDesdeLista(lista, selectId, valorSeleccionado, keyId, keyNombre, placeholder = "") {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = ""; // limpiar

    // Si hay un placeholder, agregarlo primero
    if (placeholder && placeholder.trim() !== "") {
        const option_place = document.createElement("option");
        option_place.value = "";
        option_place.textContent = placeholder;
        option_place.disabled = true;
        option_place.selected = !valorSeleccionado; // seleccionado si no hay valor
        select.appendChild(option_place);
    }

    // Agregar opciones desde la lista
    lista.forEach(item => {
        const option = document.createElement("option");
        option.value = item[keyId];
        option.textContent = item[keyNombre];

        if (item[keyId] == valorSeleccionado || item[keyNombre] == valorSeleccionado) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}



// -------------------
// GESTION DE PORCINOS
// -------------------


// CONSUMO DE DATOS DE LOS PORCINOS REGISTRADOS
function mostrar_porcinos(porcinos) {
    const info = porcinos.Porcinos.map(item => crearFilaPorcino(item)).join('');
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
            
            ${crearDialogEye(item, uniqueId)}
            ${crearDialogEdit(item, uniqueId)}
            ${crearDialogDelete(item, uniqueId)}
            ${crearDialogDeleteConfirm(uniqueId)}
        </tr>`;
}

function crearIconosAcciones(id) {
    return `
        <img src="/src/static/iconos/icono eye.svg" alt="" class="icon-eye" onclick="abrirDialog('dialog-eye-${id}')">
        <img src="/src/static/iconos/edit icon.svg" alt="" class="icon-edit" onclick="abrirDialog('dialog-edit-${id}')">
        <img src="/src/static/iconos/delete icon.svg" alt="" class="icon-delete" onclick="abrirDialog('dialog-delete-${id}')">
    `;
}

function crearDialogEye(item, uniqueId) {
    let fechaBD = item.fecha_nacimiento
    let fecha = new Date(fechaBD)
    let fecha_formateada = fecha.toISOString().split("T")[0];
    const campos = [
        { label: 'ID', value: item.id_porcino, id: 'ID' },
        { label: 'Peso inicial', value: `${item.peso_inicial} KG`, id: 'Peso-ini' },
        { label: 'Peso final', value: `${item.peso_final} KG`, id: 'Peso-fin' },
        { label: 'Fecha de nacimiento', value: fecha_formateada, id: 'Fecha-naci' },
        { label: 'Sexo', value: item.sexo, id: 'Sexo' },
        { label: 'Raza', value: item.raza, id: 'Raza' },
        { label: 'Etapa de vida', value: item.etapa, id: 'Etapa-vida' },
        { label: 'Descripción', value: item.descripcion, id: 'Descri' },
        { label: 'Estado', value: item.estado, id: 'Estado' }
    ];

    const camposHTML = campos.map(campo => `
    <div class = "container__label__input">
        <label for="${campo.id}-${uniqueId}">${campo.label}</label>
        <input type="text" class="campo-info" id="${campo.id}-${uniqueId}" placeholder="${campo.value}" readonly>
    </div>
    `).join('');

    return crearDialogBase(`dialog-eye-${uniqueId}`, 'dialog-icon-eye', 'Informacion del Porcino', camposHTML, 'Cerrar', 'button-cerrar', uniqueId,'prueba');
}

function crearDialogEdit(item, uniqueId){
    let fechaBD = item.fecha_nacimiento
    let fecha = new Date(fechaBD)
    let fecha_formateada = fecha.toISOString().split("T")[0];
    const camposEditables = [
        { label: 'ID', value: item.id_porcino, editable: false },
        { label: 'Peso inicial', value: item.peso_inicial, editable: true },
        { label: 'Peso final', value: item.peso_final, editable: false },
        { label: 'Fecha de nacimiento', value: fecha_formateada, editable: true },
        { label: 'Sexo', value: item.sexo, editable: true },
        { label: 'Raza', value: item.raza, editable: true },
        { label: 'Etapa de vida', value: item.etapa, editable: true },
        { label: 'Descripcion', value: item.descripcion, editable: true },
        { label: 'Estado', value: item.estado, editable: true }
    ];

    const camposHTML = camposEditables.map(campo => {
        const fieldId = campo.label.replace(/\s+/g, '-') + '-'+ 'actualizar' + '-' + uniqueId;
        if (campo.label === 'Raza' || campo.label === 'Etapa de vida') {
        return `
            <div class="container__label__input">
                <label for="${fieldId}">${campo.label}</label>
                <div class="container-inputs">
                    <select id="${fieldId}" ${campo.editable ? '' : 'disabled'}>
                        <option value="">Cargando...</option>
                    </select>
                    ${campo.editable ? crearIconoEdit() : ''}
                </div>
            </div>
        `;
    } else if (campo.label === "Fecha de nacimiento") {
        return `
            <div class="container__label__input">
                <label for="${fieldId}">${campo.label}</label>
                <div class="container-inputs">
                    <input type="date" id="${fieldId}" value="${campo.value}" ${campo.editable ? '' : 'disabled'}>
                    ${campo.editable ? crearIconoEdit() : ''}
                </div>
            </div>
        `;
    } else if (campo.label === "Sexo"){
        return `
            <div class="container__label__input">
                <label for="${fieldId}">${campo.label}</label>
                <div class="container-inputs">
                    <select id="${fieldId}" ${campo.editable ? '' : 'disabled'}>
                        <option value="${campo.value}">${campo.value}</option>
                        <option value="Macho">Macho</option>
                        <option value="Hembra">Hembra</option>
                    </select>
                    ${campo.editable ? crearIconoEdit() : ''}
                </div>
            </div>
        `;
    } else if (campo.label === "Estado"){
        return `
            <div class="container__label__input">
                <label for="${fieldId}">${campo.label}</label>
                <div class="container-inputs">
                    <select id="${fieldId}" ${campo.editable ? '' : 'disabled'}>
                        <option value="${campo.value}">${campo.value}</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                    ${campo.editable ? crearIconoEdit() : ''}
                </div>
            </div>
        `;
    }else {
        return `
            <div class="container__label__input">
                <label for="${fieldId}">${campo.label}</label>
                <div class="container-inputs">
                    <input type="text" id="${fieldId}" value="${campo.value}" ${campo.editable ? '' : 'disabled'}>
                    ${campo.editable ? crearIconoEdit() : ''}
                </div>
            </div>
        `;
    }

    }).join('');

    setTimeout(async () => {
        try {
            const razas = await consultar_razas();
            const etapas = await consultar_etapas();
            
            llenarSelectDesdeLista(razas.razas, `Raza-actualizar-${uniqueId}`,item.raza, "id_raza", "nombre","");
            llenarSelectDesdeLista(etapas.etapas, `Etapa-de-vida-actualizar-${uniqueId}`,item.etapa, "id_etapa", "nombre","");
        } catch (error) {
            console.error("Error cargando los selects:", error)
        }
    })

    return crearDialogBase(`dialog-edit-${uniqueId}`, 'dialog-icon-edit', 'Actualizar datos del porcino', camposHTML, 'Guardar', 'button-guardar', uniqueId,'actualizar_porcino','');
}

function crearDialogDeleteConfirm(uniqueId){
    const contenido = `
        <p>Escriba debajo el ID "${uniqueId}" y presione eliminar si asi lo desea</p>
        <input id="input-eliminar-${uniqueId}" class="input__add__por" type="number" oninput="this.value = Math.abs(this.value)" placeholder= "Ingrese el ID">
    `;
    return crearDialogBase(`dialog-delete-conf-${uniqueId}`, 'dialog-icon-dele', 'Eliminar registro del porcino', contenido, 'Eliminar','button-eliminar', uniqueId,'eliminar_porcino')
}

function crearDialogDelete(item, uniqueId) {
    const contenido = `
        <p>Eliminar el registro sin saber si el porcino tiene trazabilidad puede que altere el funcionamiento del sistema, es preferible que cambie el estado del porcino a inactivo.</p>
        <span>¿Está seguro que quiere eliminar este registro?</span>
    `;
    return crearDialogBase(`dialog-delete-${uniqueId}`, 'dialog-icon-dele', 'Eliminar registro del porcino', contenido, 'Continuar', 'button-eliminar', uniqueId,'eliminar_porcino');
}


function crearDialogBase(id, clase, titulo, contenido, textoBoton, claseBoton, uniqueId, funct, params) {
    const dialog = document.createElement("dialog");
    
    dialog.className = clase;
    dialog.id = id;
    dialog.innerHTML = `
        <div class="container__btn__close">
            <button type="button" class="btn__close" onclick="cerrarDialog('${id}')">X</button>
        </div>
        ${clase ? `
            <form onsubmit="event.preventDefault(); ${funct}('${uniqueId}')" ${clase.toLowerCase() === 'dialog-icon-dele' ? '' : 'class="container__items__dialogs"' }>
                <div class="title-dialog">
                    <h2>${titulo}</h2>
                    <hr>
                </div>
                ${clase ? ` 
                <div class="${clase.toLowerCase() === 'dialog-icon-dele' ? 'info-delete' : "info-porcino"}"> ${contenido} </div>
                ` : ""}
                ${textoBoton ? `
                <div class="container-button-${claseBoton.includes('cerrar') ? 'close' : 'guardar'}">
                    <button type="${textoBoton.toLowerCase() === 'cerrar' || textoBoton.toLowerCase() === 'continuar' ? 'button' : 'submit'}"
                        class="${claseBoton}"
                        ${textoBoton.toLowerCase() === 'cerrar' ? `onclick="cerrarDialog('${id}')"` : ""}
                        ${textoBoton.toLowerCase() === 'continuar' ? `onclick="abrirDialog('dialog-delete-conf-${uniqueId}')"` : ""}
                        >
                        ${textoBoton}
                    </button>
                </div>` : ""}
            </form>
        ` : ""}
    `;
    document.body.appendChild(dialog)
    return ''
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

async function consulta_general_porcinos() {
    try 
    {
        const response = await fetch(`${URL_BASE}/porcino`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const porcinos = await response.json();
        mostrar_porcinos(porcinos);
        consultar_razas();
        consultar_etapas();
        porcino_filtros();
        consulta_gen_historial_pesos();
        return porcinos
    } catch (error) {
        console.error('Error:', error);
    }
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
        mostrar_porcinos(response);
        }

        return response;

    } catch (error) {
        console.error(error);
        return null;
    }
}

function refrescar_porcinos(id_porcino){
    const row = document.querySelector(`tr[porcino-id = "${id_porcino}"]`)
    if (row){
        row.remove;
        consulta_general_porcinos();
    }
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
        select.className = "input_id"
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

function porcino_filtros() {
    try {
        const input__id = document.getElementById('input_id');
        const filter = document.getElementById("filter_porcino");
        input__id.addEventListener('input', () => {
            filter.disabled = parseInt(input__id.value) !== 0;
            if (parseInt(input__id.value) === 0){
                consulta_general_porcinos()
            }
        });
        const opciones = {
            "sexo" : ["Macho","Hembra"],
            "estado" : ["Activo","Inactivo"],
            "peso_final" : ["Escriba el peso final"]
        }
        filter.addEventListener('change', () => {
            if (opciones[filter.value]){
                crearSelects(filter.value,opciones[filter.value])
            } else{
                setTimeout(async() => {
                    const razas = await consultar_razas();
                    const etapas = await consultar_etapas();
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
        const filtro = document.getElementById('filter_porcino');
        const valor = document.getElementById('filter__options__2').value;
        if (filtro.disabled === true){
            const input_id = document.getElementById('input_id').value;
            return consulta_individual_porcino(input_id, true)
        } else{
            const info = {
                "filtro" : filtro.value,
                "valor" : valor
            }
            const promesa = await fetch(`${URL_BASE}/porcino/filtros`, 
                {
                    method : 'POST',
                    body : JSON.stringify(info),
                    headers : {
                        "Content-type" : "application/json"
                    }
                }
            )
            const response = await promesa.json()
            if (Object.keys(response).length != 1){
                mostrar_porcinos(response)
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

async function agregar_porcino(){
    try {
        const id_porcino = document.getElementById('id_porcino').value;
        const peso_inicial = document.getElementById('peso_inicial').value;
        const peso_final = document.getElementById('peso_final').value;
        const fecha = document.getElementById('fecha').value;
        const raza = document.getElementById('raza_add').value;
        const sexo = document.getElementById('sexo').value;
        const etapa = document.getElementById('etapa_add').value;
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
            headers : {
                "Content-type" : "application/json"
            }
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
    }
}

async function actualizar_porcino(id_porcino) {
    try {
        const peso_inicial = document.getElementById(`Peso-inicial-actualizar-${id_porcino}`).value;
        const peso_final = document.getElementById(`Peso-final-actualizar-${id_porcino}`).value;
        const fecha = document.getElementById(`Fecha-de-nacimiento-actualizar-${id_porcino}`).value;
        const raza = document.getElementById(`Raza-actualizar-${id_porcino}`).value;
        const sexo = document.getElementById(`Sexo-actualizar-${id_porcino}`).value;
        const etapa = document.getElementById(`Etapa-de-vida-actualizar-${id_porcino}`).value;
        const estado = document.getElementById(`Estado-actualizar-${id_porcino}`).value;
        const descripcion = document.getElementById(`Descripcion-actualizar-${id_porcino}`).value;

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
                headers : {
                    "Content-type" : "application/json"
                }
            }
        );
        const response = await promesa.json();
        cerrarDialog(`dialog-edit-${id_porcino}`);
        if (response.Mensaje === `Informacion del porcino con id ${id_porcino} actualizada`){
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success"
            });
            consulta_general_porcinos()
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


function eliminar_porcino(id_porcino){
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
            cerrarDialog(`dialog-delete-conf-${id_porcino}`);
            cerrarDialog(`dialog-delete-${id_porcino}`);
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success"
            });
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

function mostrar_historial(historial){
    const info = historial.Historial.map(item => crearFilaHistorial(item)).join('');
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
                <img src="/src/static/iconos/icon eye.svg" alt="" class="icon-eye" onclick="abrirDialog('dialog-eye-historial-${uniqueId}')">
            </td>
            ${crearDialogEyeHistorial(item,uniqueId)}
        </tr>
    `;
}

async function crearDialogActualizarPesoHistorial(){
    const nm = await conteoNumeroConsecutivo();
    const porcinos = await consulta_general_porcinos();
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

function crearDialogEyeHistorial(item, uniqueId){
    const campos = [
        {label: 'ID', value: item.id_documento, id: 'id-documento'},
        {label: 'Fecha Documento', value: item.fecha_documento, id: 'fecha-documento-eye'},
        {label: 'Fecha Pesaje', value: item.fecha_pesaje, id: 'fecha-pesaje-eye'},
        {label: 'ID porcino', value: item.id_porcino, id: 'id-porcino-eye'},
        {label: 'Peso registrado', value: item.peso_final, id: 'peso-registrado-eye'},
        {label: 'Usuario', value: item.nombre, id: 'nombre-usuario-eye'},
        {label: 'Descripcion', value: item.descripcion, id: 'descripcion-eye'},
    ]

    const camposHTML = campos.map(campo => {
        if (campo.label === 'Descripcion'){
            return `
            <textarea id="textare_eye_historial" readonly>
                ${item.descripcion}
            </textarea>
            `
        }else{
            return `
            <div class = "container__label__input">
                <label for="${campo.id}-${uniqueId}">${campo.label}</label>
                <input type="text" class="campo-info" id="${campo.id}-${uniqueId}" placeholder="${campo.value}" readonly>
            </div>
            `
        }
    }
    ).join('');
    
    
    const HTML = `
        <div class="lay_content_histirial">
            ${camposHTML}
        </div>
    `

    return crearDialogBaseRaza(`dialog-eye-historial-${uniqueId}`, 'dialog-icon-eye', 'Informacion de la transacción', HTML, 'Cerrar', 'button-cerrar', uniqueId, 'cerrarDialog',`dialog-eye-historial-${uniqueId}`);
}


async function consulta_gen_historial_pesos(){
    try {
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos`, 
            {
                method : 'GET',
                headers : {
                    "Content-type" : "application/json",
                }
            })
        const response = await promesa.json();
        
        if (promesa.status == 200){
            mostrar_historial(response)
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

async function consulta_porcino_historial(mostrar = false){
    try{
        const id = document.getElementById('input_id_hp').value;
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/${id}`);
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
            mostrar_historial(response)
        }
        return response
    }catch(error){
        console.error(error)
    }
}


async function conteoNumeroConsecutivo() {
    try {
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/conteo_transacciones`,
            {
                method : 'GET',
                headers : {
                    "Content-type" : "application/json"
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
                headers : {
                    "Content-type" : "application/json"
                }
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
    }
}

 
// -------------------
// GESTION DE DE RAZAS
// -------------------

// seccion para mostrar la informacion en el front-end
function mostrar_raza(razas){
    const contenedor = document.getElementById('razas')
    if(!contenedor) return;
    contenedor.innerHTML = razas.razas.map(item => crearFilaRaza(item)).join('');;
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
            ${crearDialogEyeRaza(item, uniqueId)}
            ${crearDialogEditRaza(item, uniqueId)}
            ${crearDialogtDeleteRaza(item, uniqueId)}
            ${crearDialogDeleteConfirmRaza(uniqueId)}
    </tr>
    `
}

function crearIconosAccionesRaza(id) {
    return `
        <img src="/src/static/iconos/icono eye.svg" alt="" class="icon-eye" onclick="abrirDialog('dialog-eye-raza-${id}')">
        <img src="/src/static/iconos/edit icon.svg" alt="" class="icon-edit" onclick="abrirDialog('dialog-edit-raza-${id}')">
        <img src="/src/static/iconos/delete icon.svg" alt="" class="icon-delete" onclick="abrirDialog('dialog-delete-raza-${id}')">
    `;
}

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

function crearDialogEyeRaza(item, uniqueId){
    const campos = [
        {label: 'ID', value: item.id_raza, id: 'id-raza'},
        {label: 'Nombre', value: item.nombre, id: 'nombre-raza'},
        {label: 'Descripcion', value: item.descripcion, id: 'descripcion-raza'},
    ]

    const camposHTML = campos.map(campo => `
        <div class = "container__label__input">
            <label for="${campo.id}-${uniqueId}">${campo.label}</label>
            <input type="text" class="campo-info" id="${campo.id}-${uniqueId}" placeholder="${campo.value}" readonly>
        </div>
        `).join('');

    return crearDialogBaseRaza(`dialog-eye-raza-${uniqueId}`, 'dialog-icon-eye', 'Informacion de la Raza', camposHTML, 'Cerrar', 'button-cerrar', uniqueId, 'cerrarDialog',`dialog-eye-raza-${uniqueId}`);
}

function crearDialogEditRaza(item, uniqueId){
    const camposEditables = [
        {label: 'ID', value: item.id_raza, editable: false, id: "id-raza"},
        {label: 'Nombre', value: item.nombre, editable: true, id: "nombre-raza"},
        {label: 'Descripcion', value: item.descripcion, editable:true, id: "descripcion-raza"},
    ]

    const camposHTML = camposEditables.map(campo => {
        const fieldId = campo.id.replace(/\s+/g, '-') + '-' + 'actualizar' + '-' +uniqueId;
        return `
        <div class = "container__label__input">
            <label for="${fieldId}">${campo.label}</label>
            <div class="container-inputs">
                <input type="text" id="${fieldId}" value="${campo.value}" ${campo.editable ? '' : 'disabled'}>
                ${campo.editable ? crearIconoEdit() : ''}
            </div>
        </div>
        `;
    }).join('');

    return crearDialogBaseRaza(`dialog-edit-raza-${uniqueId}`, 'dialog-icon-eye', 'Actualizar datos de la Raza', camposHTML, 'Guardar', 'button-guardar', uniqueId, 'actualizar_raza','')
}

function crearDialogDeleteConfirmRaza(uniqueId){
    const contenido = `
        <p>Escriba debajo el ID "${uniqueId}" y presione eliminar si asi lo desea</p>
        <input id="input-eliminar-r-${uniqueId}" class="input__add__por" type="number" oninput="this.value = Math.abs(this.value)" placeholder= "Ingrese el ID">
    `;
    return crearDialogBaseRaza(`dialog-delete-conf-r-${uniqueId}`, 'dialog-icon-dele', 'Eliminar Raza', contenido, 'Eliminar','button-eliminar', uniqueId,'eliminar_raza')
}

function crearDialogtDeleteRaza(item, uniqueId){
    const contenido =  `
        <p>Eliminar el registro sin saber si la raza tiene trazabilidad puede que altere el funcionamiento del sistema.</p>
        <span>¿Está seguro que quiere eliminar este registro?</span>
    `;
    return crearDialogBaseRaza(`dialog-delete-raza-${uniqueId}`, 'dialog-icon-dele', 'Eliminar Raza', contenido, 'Continuar', 'button-eliminar', uniqueId, 'eliminar_raza', '')
}


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
            <div class="info_raza_etapa">${contenido}</div>
            ${textoBoton ? `
                <div class="container-button-${claseBoton.includes('cerrar') ? 'close' : 'guardar'}">
                    <button 
                    type="${['cerrar', 'continuar'].includes(textoBoton.toLowerCase()) ? 'button' : 'submit'}"
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


async function consultar_razas() {
    try {
        const promesa = await fetch(`${URL_BASE}/raza`, {method: 'GET'});
        if (!promesa.ok) throw new Error(`Error: ${promesa.status}`);
        const response = await promesa.json();
        mostrar_raza(response)
        return response
    } catch (error) {
        console.error(error)
    }
}

async function consulta_indi_raza(mostrar = false){
    try {
        const id = document.getElementById('input_id_raza').value;
        const promesa = await fetch(`${URL_BASE}/raza/${id}`);
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
            mostrar_raza(response)
        }
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
            method : 'POST',
            body : JSON.stringify(raza),
            headers: {
                "Content-type" : "application/json"
            }
        })
        const response = await promesa.json()
        if (response.Mensaje == "Raza registrada correctamente"){
            consultar_razas()
            cerrarDialog('dialog-registrar-raza')
            cerrarDialog('dialog__ges__raz')
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

async function actualizar_raza(id) {
    try {
        const nombre = document.getElementById(`nombre-raza-actualizar-${id}`).value;
        const descri = document.getElementById(`descripcion-raza-actualizar-${id}`).value;

        const raza = {
            nombre: nombre,
            descripcion: descri
        }

        const promesa = await fetch(`${URL_BASE}/raza/${id}`, {
            method : 'PUT',
            body : JSON.stringify(raza),
            headers: {
                "Content-type" : "application/json"
            }
        })
        const response = await promesa.json()
        if (response.Mensaje === 'Raza actulizada correctamente'){
            cerrarDialog(`dialog-edit-raza-${id}`)
            cerrarDialog('dialog__ges__raz')
            consultar_razas()
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success",
            });
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

async function eliminar_raza(id){
    try {
        const input = document.getElementById(`input-eliminar-r-${id}`);
        const value_input = document.getElementById(`input-eliminar-r-${id}`).value;
        if (value_input == id){
            const promesa = await fetch(`${URL_BASE}/raza/${id}`, {method : 'DELETE'});
            const response = await promesa.json();
            consultar_razas()
            cerrarDialog(`dialog-delete-conf-r-${id}`);
            cerrarDialog(`dialog-delete-raza-${id}`);
            cerrarDialog(`dialog__ges__raz`);
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success"
            });
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

function mostrar_etapas(etapas){
    const contenedor = document.getElementById('etapas_vida') 
    if (!contenedor) return; 
    contenedor.innerHTML = etapas.etapas.map(item => crearFilaEtapa(item)).join('');
}

function crearFilaEtapa(item){
    const uniqueId = item.id_etapa;
    return `
        <tr class="registro registro__dia">
            <td class="td__border__l">${item.id_etapa}</td>
            <td>${item.nombre}</td>
            <td>${item.descripcion}</td>
            <td class="td__border__r">
                ${crearIconosAccionesEtapa(uniqueId)}
            </td>
            ${crearDialogEyeEtapa(item, uniqueId)}
            ${crearDialogEditEtapa(item, uniqueId)}
            ${crearDialogDeleteEtapa(item, uniqueId)}
            ${crearDialogDeleteConfirmEtapa(uniqueId)}
        </tr>
    `
}

function crearIconosAccionesEtapa(id){
    return `
    <img src="/src/static/iconos/icono eye.svg" alt="" class="icon-eye" id="abrir-dieye" onclick="abrirDialog('dialog-eye-etapa-${id}')">
    <img src="/src/static/iconos/edit icon.svg" alt="" class="icon-edit" id="abrir-diedit" onclick="abrirDialog('dialog-edit-etapa-${id}')">
    <img src="/src/static/iconos/delete icon.svg" alt="" class="icon-delete" id="abrir-didele" onclick="abrirDialog('dialog-delete-etapa-${id}')">
    `
}

function crearDialogRegistrarEtapa(){
    const campos = [
        {label: "Nombre", id: "nombre_etapa", required: false},
        {label: "Descripcion", id: "descripcion_etapa", required: true}
    ]
    const camposHTML = campos.map(campo => {
        return `
                <div class = "container__label__input">
                    <label for="${campo.id}">${campo.label}</label>
                    <input type="text" class="campo-info" id="${campo.id}" ${campo.required ? '' : 'required'}>
                </div>
            `
    }).join('');
    return crearDialogBaseRaza('dialog-registrar-etapa', 'dialog-icon-eye', 'Registar Etapa de vida', camposHTML, "Guardar", 'button-guardar', '','registrar_etapas','')
}

function crearDialogEyeEtapa(item, uniqueId){
    const campos = [
        {label: 'ID', value: item.id_etapa, id: 'id-etapa'},
        {label: 'Nombre', value: item.nombre, id: 'nombre-etapa'},
        {label: 'Descripcion', value: item.descripcion, id: 'descripcion-etapa'},
    ]
    const camposHTML = campos.map(campo => `
        <div class = "container__label__input">
            <label for="${campo.id}-${uniqueId}">${campo.label}</label>
            <input type="text" class="campo-info" id="${campo.id}-${uniqueId}" placeholder="${campo.value}" readonly>
        </div>
    `).join('');
    return crearDialogBaseRaza(`dialog-eye-etapa-${uniqueId}`, 'dialog-icon-eye', 'Informacion de la Etpa de vida', camposHTML, 'Cerrar', 'button-cerrar', uniqueId)
}

function crearDialogEditEtapa(item, uniqueId){
    const camposEditables = [
        {label: 'ID', value: item.id_etapa, id: 'id-etapa', editable: false},
        {label: 'Nombre', value: item.nombre, id: 'nombre-etapa', editable: true},
        {label: 'Descripcion', value: item.descripcion, id: 'descripcion-etapa', editable: true},
    ]

    const camposHTML = camposEditables.map(campo => {
        const fieldId = campo.id.replace(/\s+/g, '-') + '-' + 'actualizar' + '-' +uniqueId;
        return `
        <div class = "container__label__input">
            <label for="${fieldId}">${campo.label}</label>
            <div class="container-inputs">
                <input type="text" id="${fieldId}" value="${campo.value}" ${campo.editable ? '' : 'disabled'}>
                ${campo.editable ? crearIconoEdit() : ''}
            </div>
        </div>
        `;
    }).join('');

    return crearDialogBaseRaza(`dialog-edit-etapa-${uniqueId}`, 'dialog-icon-eye', 'Actualizar datos de la Etapa de Vida', camposHTML, 'Guardar', 'button-guardar', uniqueId,'actualizar_etapa','')
}

function crearDialogDeleteConfirmEtapa(uniqueId){
    const contenido = `
        <p>Escriba debajo el ID "${uniqueId}" y presione eliminar si asi lo desea</p>
        <input id="input-eliminar-e-${uniqueId}" class="input__add__por" type="number" oninput="this.value = Math.abs(this.value)" placeholder= "Ingrese el ID">
    `;
    return crearDialogBaseRaza(`dialog-delete-conf-e-${uniqueId}`, 'dialog-icon-dele', 'Eliminar Etapa de Vida', contenido, 'Eliminar','button-eliminar', uniqueId,'eliminar_etapa')
}

function crearDialogDeleteEtapa(item, uniqueId){
    const contenido =  `
        <p>Eliminar el registro sin saber si la etapa de vida tiene trazabilidad puede que altere el funcionamiento del sistema.</p>
        <span>¿Está seguro que quiere eliminar este registro?</span>
    `;

    return crearDialogBaseRaza(`dialog-delete-etapa-${uniqueId}`, 'dialog-icon-dele', 'Eliminar Etapa de Vida', contenido, 'Continuar','button-eliminar', uniqueId,'eliminar_etapa')
}

async function consultar_etapas() {
    try{
        const promesa = await fetch(`${URL_BASE}/etapa_vida`, {method: 'GET'});
        const response = await promesa.json();
        mostrar_etapas(response)
        return response
    } catch(error){
        console.error(error)
    }
}

async function consulta_indi_etapas(mostrar = false){
    try {
        const id = document.getElementById('input_id_etapa').value;
        const promesa =  await fetch(`${URL_BASE}/etapa_vida/${id}`);
        const response = await promesa.json();
        console.log(response)
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
            mostrar_etapas(response)
        }
        return response
    } catch (error) {
        console.log()
    }
}


async function registrar_etapas(){
    try {
        const nombre = document.getElementById('nombre_etapa').value;
        const descri = document.getElementById('descripcion_etapa').value;

        const etapa = {
            nombre : nombre,
            descripcion : descri
        }

        const promesa = await fetch(`${URL_BASE}/etapa_vida`, {
            method : 'POST',
            body: JSON.stringify(etapa),
            headers : {
                "Content-type" : "application/json"
            }
        })
        const response = await promesa.json()
        if (response.Mensaje == "Etapa de vida registrada correctamente"){
            consultar_etapas()
            cerrarDialog('dialog-registrar-etapa');
            cerrarDialog('dialog__ges__eta');
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

async function actualizar_etapa(id) {
    try {
        const nombre = document.getElementById(`nombre-etapa-actualizar-${id}`).value;
        const descri = document.getElementById(`descripcion-etapa-actualizar-${id}`).value;

        const etapa = {
            nombre : nombre,
            descripcion : descri
        }

        const promesa = await fetch(`${URL_BASE}/etapa_vida/${id}`, {
            method : 'PUT',
            body: JSON.stringify(etapa),
            headers : {
                "Content-type" : "application/json",
            }
        })
        const response = await promesa.json();
        if (response.Mensaje === 'Etapa de vida actulizada correctamente'){
            cerrarDialog(`dialog-edit-etapa-${id}`)
            cerrarDialog('dialog__ges__eta')
            consultar_etapas()
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success",
            });
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
        const input = document.getElementById(`input-eliminar-e-${id}`);
        const value_input = document.getElementById(`input-eliminar-e-${id}`).value;

        if (value_input == id){
            const promesa = await fetch(`${URL_BASE}/etapa_vida/${id}`, {
                method: 'DELETE',
            })
            const response = await promesa.json();
            consultar_etapas()
            cerrarDialog(`dialog-delete-conf-e-${id}`);
            cerrarDialog(`dialog-delete-etapa-${id}`);
            cerrarDialog(`dialog__ges__eta`);
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success"
            });
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

// -------------------
// GESTION DE ALIMENTOS
// -------------------

function consulta_alimentos(){
    const contenido = document.getElementById("contenido");
    fetch(`${URL_BASE}/alimentos`,{method: "GET"})
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
}

function eliminar_alimento(id){
    fetch(`${URL_BASE}/eliminar_alimento/${id}`,{method:"delete"})
    .then(res=>res.json())
    .then(data=>{
        alert("eliminado correctamente")
        window.location.reload()
    })
}

function consulta_individual_alimento(){
    const nombre = document.getElementById("id_alimento").value;
    contenido.innerHTML = "";

    fetch(`${URL_BASE}/consulta_indi_alimento/${nombre}`)
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
    });
}


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