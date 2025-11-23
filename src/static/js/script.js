const URL_BASE = 'http://127.0.0.1:5000'

// Al cargar la página, crear los diálogos directamente
document.addEventListener('DOMContentLoaded', function () {
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

    return crearDialogBase(`dialog-eye-${uniqueId}`, 'dialog-icon-eye', 'Informacion del Porcino', camposHTML, 'Cerrar', 'button-cerrar', uniqueId, 'prueba');
}

function crearDialogEdit(item, uniqueId) {
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
        const fieldId = campo.label.replace(/\s+/g, '-') + '-' + 'actualizar' + '-' + uniqueId;
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
        } else if (campo.label === "Sexo") {
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
        } else if (campo.label === "Estado") {
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
        } else {
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

            llenarSelectDesdeLista(razas.razas, `Raza-actualizar-${uniqueId}`, item.raza, "id_raza", "nombre", "");
            llenarSelectDesdeLista(etapas.etapas, `Etapa-de-vida-actualizar-${uniqueId}`, item.etapa, "id_etapa", "nombre", "");
        } catch (error) {
            console.error("Error cargando los selects:", error)
        }
    })

    return crearDialogBase(`dialog-edit-${uniqueId}`, 'dialog-icon-edit', 'Actualizar datos del porcino', camposHTML, 'Guardar', 'button-guardar', uniqueId, 'actualizar_porcino', '');
}

function crearDialogDeleteConfirm(uniqueId) {
    const contenido = `
        <p>Escriba debajo el ID "${uniqueId}" y presione eliminar si asi lo desea</p>
        <input id="input-eliminar-${uniqueId}" class="input__add__por" type="number" oninput="this.value = Math.abs(this.value)" placeholder= "Ingrese el ID">
    `;
    return crearDialogBase(`dialog-delete-conf-${uniqueId}`, 'dialog-icon-dele', 'Eliminar registro del porcino', contenido, 'Eliminar', 'button-eliminar', uniqueId, 'eliminar_porcino')
}

function crearDialogDelete(item, uniqueId) {
    const contenido = `
        <p>Eliminar el registro sin saber si el porcino tiene trazabilidad puede que altere el funcionamiento del sistema, es preferible que cambie el estado del porcino a inactivo.</p>
        <span>¿Está seguro que quiere eliminar este registro?</span>
    `;
    return crearDialogBase(`dialog-delete-${uniqueId}`, 'dialog-icon-dele', 'Eliminar registro del porcino', contenido, 'Continuar', 'button-eliminar', uniqueId, 'eliminar_porcino');
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
            <form onsubmit="event.preventDefault(); ${funct}('${uniqueId}')" ${clase.toLowerCase() === 'dialog-icon-dele' ? '' : 'class="container__items__dialogs"'}>
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
    try {
        const response = await fetch(`${URL_BASE}/porcino`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const porcinos = await response.json();
        mostrar_porcinos(porcinos);
        // consultar_razas();
        // consultar_etapas();
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

function refrescar_porcinos(id_porcino) {
    const row = document.querySelector(`tr[porcino-id = "${id_porcino}"]`)
    if (row) {
        row.remove;
        consulta_general_porcinos();
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
        select.className = "input_id"
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
                return consulta_general_porcinos()
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
            if (opciones[filter.value]) {
                crearSelects(filter.value, opciones[filter.value])
            } else {
                setTimeout(async () => {
                    const razas = await consultar_razas();
                    const etapas = await consultar_etapas();
                    if (filter.value === 'raza') {
                        crearSelects(filter.value, razas.razas)
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
        console.log(filtro)
        if (filtro.disabled === true) {
            const input_id = document.getElementById('input_id').value;
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
            if (Object.keys(response).length != 1) {
                mostrar_porcinos(response)
            } else {
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
        const etapa = document.getElementById('etapa_add').value;
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
        const peso_inicial = document.getElementById(`Peso-inicial-actualizar-${id_porcino}`).value;
        const peso_final = document.getElementById(`Peso-final-actualizar-${id_porcino}`).value;
        const fecha = document.getElementById(`Fecha-de-nacimiento-actualizar-${id_porcino}`).value;
        const raza = document.getElementById(`Raza-actualizar-${id_porcino}`).value;
        const sexo = document.getElementById(`Sexo-actualizar-${id_porcino}`).value;
        const etapa = document.getElementById(`Etapa-de-vida-actualizar-${id_porcino}`).value;
        const estado = document.getElementById(`Estado-actualizar-${id_porcino}`).value;
        const descripcion = document.getElementById(`Descripcion-actualizar-${id_porcino}`).value;

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
        cerrarDialog(`dialog-edit-${id_porcino}`);
        if (response.Mensaje === `Informacion del porcino con id ${id_porcino} actualizada`) {
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success"
            });
            consulta_general_porcinos()
        } else {
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
    if (id_input == id_porcino) {
        fetch(`${URL_BASE}/porcino/${id_porcino}`, { method: 'DELETE' })
            .then(response => {
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

function mostrar_historial(historial) {
    const info = historial.Historial.map(item => crearFilaHistorial(item)).join('');
    document.getElementById('historial_pesos').innerHTML = info;
}

function crearFilaHistorial(item) {
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
            ${crearDialogEyeHistorial(item, uniqueId)}
        </tr>
    `;
}

async function crearDialogActualizarPesoHistorial() {
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

function crearDialogEyeHistorial(item, uniqueId) {
    const campos = [
        { label: 'ID', value: item.id_documento, id: 'id-documento' },
        { label: 'Fecha Documento', value: item.fecha_documento, id: 'fecha-documento-eye' },
        { label: 'Fecha Pesaje', value: item.fecha_pesaje, id: 'fecha-pesaje-eye' },
        { label: 'ID porcino', value: item.id_porcino, id: 'id-porcino-eye' },
        { label: 'Peso registrado', value: item.peso_final, id: 'peso-registrado-eye' },
        { label: 'Usuario', value: item.nombre, id: 'nombre-usuario-eye' },
        { label: 'Descripcion', value: item.descripcion, id: 'descripcion-eye' },
    ]

    const camposHTML = campos.map(campo => {
        if (campo.label === 'Descripcion') {
            return `
            <textarea id="textare_eye_historial" readonly>
                ${item.descripcion}
            </textarea>
            `
        } else {
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

    return crearDialogBaseRaza(`dialog-eye-historial-${uniqueId}`, 'dialog-icon-eye', 'Informacion de la transacción', HTML, 'Cerrar', 'button-cerrar', uniqueId, 'cerrarDialog', `dialog-eye-historial-${uniqueId}`);
}


async function consulta_gen_historial_pesos() {
    try {
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos`,
            {
                method: 'GET',
                headers: {
                    "Content-type": "application/json",
                }
            })
        const response = await promesa.json();

        if (promesa.status == 200) {
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

async function consulta_porcino_historial(mostrar = false) {
    try {
        const id = document.getElementById('input_id_hp').value;
        const promesa = await fetch(`${URL_BASE}/porcino/historial_pesos/${id}`);
        const response = await promesa.json()
        console.log(response)
        if (response.Mensaje === `No hay historial de pesos para el porcino con ID ${id}`) {
            cerrarDialog('dialog__his__peso');
            Swal.fire({
                title: "Mensaje",
                text: response.Mensaje,
                icon: "error"
            });
            return null;
        }
        if (mostrar) {
            mostrar_historial(response)
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

// seccion para mostrar la informacion en el front-end
function mostrar_raza(razas) {
    const contenedor = document.getElementById('razas')
    if (!contenedor) return;
    contenedor.innerHTML = razas.razas.map(item => crearFilaRaza(item)).join('');;
}

function crearFilaRaza(item) {
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

function crearDialogEyeRaza(item, uniqueId) {
    const campos = [
        { label: 'ID', value: item.id_raza, id: 'id-raza' },
        { label: 'Nombre', value: item.nombre, id: 'nombre-raza' },
        { label: 'Descripcion', value: item.descripcion, id: 'descripcion-raza' },
    ]

    const camposHTML = campos.map(campo => `
        <div class = "container__label__input">
            <label for="${campo.id}-${uniqueId}">${campo.label}</label>
            <input type="text" class="campo-info" id="${campo.id}-${uniqueId}" placeholder="${campo.value}" readonly>
        </div>
        `).join('');

    return crearDialogBaseRaza(`dialog-eye-raza-${uniqueId}`, 'dialog-icon-eye', 'Informacion de la Raza', camposHTML, 'Cerrar', 'button-cerrar', uniqueId, 'cerrarDialog', `dialog-eye-raza-${uniqueId}`);
}

function crearDialogEditRaza(item, uniqueId) {
    const camposEditables = [
        { label: 'ID', value: item.id_raza, editable: false, id: "id-raza" },
        { label: 'Nombre', value: item.nombre, editable: true, id: "nombre-raza" },
        { label: 'Descripcion', value: item.descripcion, editable: true, id: "descripcion-raza" },
    ]

    const camposHTML = camposEditables.map(campo => {
        const fieldId = campo.id.replace(/\s+/g, '-') + '-' + 'actualizar' + '-' + uniqueId;
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

    return crearDialogBaseRaza(`dialog-edit-raza-${uniqueId}`, 'dialog-icon-eye', 'Actualizar datos de la Raza', camposHTML, 'Guardar', 'button-guardar', uniqueId, 'actualizar_raza', '')
}

function crearDialogDeleteConfirmRaza(uniqueId) {
    const contenido = `
        <p>Escriba debajo el ID "${uniqueId}" y presione eliminar si asi lo desea</p>
        <input id="input-eliminar-r-${uniqueId}" class="input__add__por" type="number" oninput="this.value = Math.abs(this.value)" placeholder= "Ingrese el ID">
    `;
    return crearDialogBaseRaza(`dialog-delete-conf-r-${uniqueId}`, 'dialog-icon-dele', 'Eliminar Raza', contenido, 'Eliminar', 'button-eliminar', uniqueId, 'eliminar_raza')
}

function crearDialogtDeleteRaza(item, uniqueId) {
    const contenido = `
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
            ${funct ? `
                <div class="${funct.toLowerCase() === 'registrar_etapas' ? 'layout_registrar_etapa' : 'info_raza_etapa'}">${contenido}</div>
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


async function consultar_razas() {
    try {
        const promesa = await fetch(`${URL_BASE}/raza`, { method: 'GET' });
        if (!promesa.ok) throw new Error(`Error: ${promesa.status}`);
        const response = await promesa.json();
        mostrar_raza(response)
        return response
    } catch (error) {
        console.error(error)
    }
}

async function consulta_indi_raza(mostrar = false) {
    try {
        const id = document.getElementById('input_id_raza').value;
        const promesa = await fetch(`${URL_BASE}/raza/${id}`);
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
        if (mostrar) {
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
            method: 'POST',
            body: JSON.stringify(raza),
            headers: {
                "Content-type": "application/json"
            }
        })
        const response = await promesa.json()
        if (response.Mensaje == "Raza registrada correctamente") {
            consultar_razas()
            cerrarDialog('dialog-registrar-raza')
            cerrarDialog('dialog__ges__raz')
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success"
            });
        } else {
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
        if (response.Mensaje === 'Raza actulizada correctamente') {
            cerrarDialog(`dialog-edit-raza-${id}`)
            cerrarDialog('dialog__ges__raz')
            consultar_razas()
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

async function eliminar_raza(id) {
    try {
        const input = document.getElementById(`input-eliminar-r-${id}`);
        const value_input = document.getElementById(`input-eliminar-r-${id}`).value;
        if (value_input == id) {
            const promesa = await fetch(`${URL_BASE}/raza/${id}`, { method: 'DELETE' });
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
        } else {
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

function mostrar_etapas(etapas) {
    const contenedor = document.getElementById('etapas_vida')
    if (!contenedor) return;
    contenedor.innerHTML = etapas.etapas.map(item => crearFilaEtapa(item)).join('');
}

function crearFilaEtapa(item) {
    const uniqueId = item.id_etapa;
    return `
        <tr class="registro registro__dia">
            <td class="td__border__l">${item.id_etapa}</td>
            <td>${item.nombre_etapa}</td>
            <td>${item.peso_min}</td>
            <td>${item.peso_max}</td>

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

function crearIconosAccionesEtapa(id) {
    return `
    <img src="/src/static/iconos/icono eye.svg" alt="" class="icon-eye" id="abrir-dieye" onclick="abrirDialog('dialog-eye-etapa-${id}')">
    <img src="/src/static/iconos/edit icon.svg" alt="" class="icon-edit" id="abrir-diedit" onclick="abrirDialog('dialog-edit-etapa-${id}')">
    <img src="/src/static/iconos/delete icon.svg" alt="" class="icon-delete" id="abrir-didele" onclick="abrirDialog('dialog-delete-etapa-${id}')">
    `
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
        activarSteps("dialog-registrar-etapa", ".button-guardar");
    }, 50);
}


function activarSteps(modalId, botonSelector) {

    const modal = document.getElementById(modalId);
    const btn_siguiente = modal.querySelector(botonSelector);
    const grid = document.querySelector(".layout_registrar_etapa");

    const step1 = modal.querySelector("#step1");
    const step2 = modal.querySelector("#step2");

    if (!step1 || !step2) return;

    // Estado inicial correcto
    step1.classList.add("active");
    step2.classList.remove("active");

    // Crear botón Atrás
    const btnAtras = document.createElement("button");
    btnAtras.textContent = "Atrás";
    btnAtras.classList = "btn-atras button-eliminar";
    btnAtras.style.display = "none";

    // crear boton guardar
    const btn_guardar = document.createElement("button");
    btn_guardar.textContent = "Guardar"
    btn_guardar.classList = "button-eliminar";
    btn_guardar.style.display = "none";
    btn_guardar.type = "submit"

    btn_siguiente.parentElement.appendChild(btnAtras);
    btn_siguiente.parentElement.appendChild(btn_guardar);

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
            btn_guardar.style.display = "inline-block";
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

function crearDialogEyeEtapa(item, uniqueId) {
    const campos1 = [
        { label: "ID etapa", id: "e-id-etapa", value: item.id_etapa },
        { label: "Nombre", id: "e-nombre-etapa", value: item.nombre_etapa },
        { label: 'Peso Minimo (Kg)', id: 'e-peso-min-etapa', value: item.peso_min },
        { label: 'Peso Maximo (Kg)', id: 'e-peso-max-etapa', value: item.peso_max },
        { label: 'Dias de duración', id: 'e-dias-dura-etapa', value: item.duracion_dias },
        { label: 'Semana de duración', id: 'e-semanas-dura-etapa', value: item.duracion_semanas },
        { label: 'Descripcion (Opcional)', id: 'e-descripcion-etapa', value: item.descripcion },
    ];

    const camposHTML = campos1.map(campo => `
        <div class = "container__label__input">
            <label for="${campo.id}-${uniqueId}">${campo.label}</label>
            <input type="text" class="campo-info" id="${campo.id}-${uniqueId}" placeholder="${campo.value}" readonly>
        </div>
    `).join('');
    return crearDialogBaseRaza(`dialog-eye-etapa-${uniqueId}`, 'dialog-icon-eye', 'Informacion de la Etapa de vida', camposHTML, 'Cerrar', 'button-cerrar', uniqueId, 'cerrarDialog', `dialog-eye-etapa-${uniqueId}`)
} g

function crearDialogEditEtapa(item, uniqueId) {
    const camposEditables = [
        { label: 'ID', value: item.id_etapa, id: 'id-etapa', editable: false },
        { label: 'Nombre', value: item.nombre, id: 'nombre-etapa', editable: true },
        { label: 'Descripcion', value: item.descripcion, id: 'descripcion-etapa', editable: true },
    ]

    const camposHTML = camposEditables.map(campo => {
        const fieldId = campo.id.replace(/\s+/g, '-') + '-' + 'actualizar' + '-' + uniqueId;
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

    return crearDialogBaseRaza(`dialog-edit-etapa-${uniqueId}`, 'dialog-icon-eye', 'Actualizar datos de la Etapa de Vida', camposHTML, 'Guardar', 'button-guardar', uniqueId, 'actualizar_etapa', '')
}

function crearDialogDeleteConfirmEtapa(uniqueId) {
    const contenido = `
        <p>Escriba debajo el ID "${uniqueId}" y presione eliminar si asi lo desea</p>
        <input id="input-eliminar-e-${uniqueId}" class="input__add__por" type="number" oninput="this.value = Math.abs(this.value)" placeholder= "Ingrese el ID">
    `;
    return crearDialogBaseRaza(`dialog-delete-conf-e-${uniqueId}`, 'dialog-icon-dele', 'Eliminar Etapa de Vida', contenido, 'Eliminar', 'button-eliminar', uniqueId, 'eliminar_etapa')
}

function crearDialogDeleteEtapa(item, uniqueId) {
    const contenido = `
        <p>Eliminar el registro sin saber si la etapa de vida tiene trazabilidad puede que altere el funcionamiento del sistema.</p>
        <span>¿Está seguro que quiere eliminar este registro?</span>
    `;

    return crearDialogBaseRaza(`dialog-delete-etapa-${uniqueId}`, 'dialog-icon-dele', 'Eliminar Etapa de Vida', contenido, 'Continuar', 'button-eliminar', uniqueId, 'eliminar_etapa')
}

async function consultar_etapas() {
    try {
        const promesa = await fetch(`${URL_BASE}/etapa_vida`, { method: 'GET' });
        const response = await promesa.json();
        mostrar_etapas(response)
        return response
    } catch (error) {
        console.error(error)
    }
}

async function consulta_indi_etapas(mostrar = false) {
    try {
        const id = document.getElementById('input_id_etapa').value;
        const promesa = await fetch(`${URL_BASE}/etapa_vida/${id}`);
        const response = await promesa.json();
        console.log(response)
        if (response.Mensaje === `No hay etapa con ID ${id}`) {
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


async function registrar_etapas() {
    try {
        const etapa = {
            "nombre_etapa": document.getElementById('nombre_etapa').value,
            "descripcion": document.getElementById("descripcion_etapa").value,
            "peso_min": document.getElementById("peso_min_etapa").value,
            "peso_max": document.getElementById("peso_max_etapa").value,
            "duracion_dias": document.getElementById("dias_dura_etapa").value,
            "duracion_semanas": document.getElementById("semanas_dura_etapa").value,
            "requerimientos": [
                { id_elemento: 1, porcentaje: parseFloat(document.getElementById("r-proteina-cruda").value) || 0 },
                { id_elemento: 2, porcentaje: parseFloat(document.getElementById("r-treonina").value) || 0 },
                { id_elemento: 3, porcentaje: parseFloat(document.getElementById("r-fosforo-disponible").value) || 0 },
                { id_elemento: 4, porcentaje: parseFloat(document.getElementById("r-fibra-cruda").value) || 0 },
                { id_elemento: 5, porcentaje: parseFloat(document.getElementById("r-sodio").value) || 0 },
                { id_elemento: 6, porcentaje: parseFloat(document.getElementById("r-metionina").value) || 0 },
                { id_elemento: 8, porcentaje: parseFloat(document.getElementById("r-extracto-etereo").value) || 0 },
                { id_elemento: 9, porcentaje: parseFloat(document.getElementById("r-arginina").value) || 0 },
                { id_elemento: 10, porcentaje: parseFloat(document.getElementById("r-metionina-cisteina").value) || 0 },
                { id_elemento: 11, porcentaje: parseFloat(document.getElementById("r-calcio").value) || 0 },
                { id_elemento: 12, porcentaje: parseFloat(document.getElementById("r-lisina").value) || 0 },
                { id_elemento: 13, porcentaje: parseFloat(document.getElementById("r-triptofano").value) || 0 },
                { id_elemento: 14, porcentaje: parseFloat(document.getElementById("r-energia-metabo").value) || 0 }
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
        if (response.Mensaje == "Etapa de vida registrada correctamente") {
            consultar_etapas()
            cerrarDialog('dialog-registrar-etapa');
            cerrarDialog('dialog__ges__eta');
            Swal.fire({
                title: "Mensaje",
                text: `${response.Mensaje}`,
                icon: "success"
            });
        } else {
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
            nombre: nombre,
            descripcion: descri
        }

        const promesa = await fetch(`${URL_BASE}/etapa_vida/${id}`, {
            method: 'PUT',
            body: JSON.stringify(etapa),
            headers: {
                "Content-type": "application/json",
            }
        })
        const response = await promesa.json();
        if (response.Mensaje === 'Etapa de vida actulizada correctamente') {
            cerrarDialog(`dialog-edit-etapa-${id}`)
            cerrarDialog('dialog__ges__eta')
            consultar_etapas()
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

async function eliminar_etapa(id) {
    try {
        const input = document.getElementById(`input-eliminar-e-${id}`);
        const value_input = document.getElementById(`input-eliminar-e-${id}`).value;

        if (value_input == id) {
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


// --------------------------
// GESTION DE NOTIFICACIONES
// --------------------------

function mostrar_notificaciones(notificaciones) {
    const info = notificaciones.Notificaciones.map(item => crear_fila_notificaciones(item)).join('');
    document.getElementById('section_hoy_noti').innerHTML = info
}

function crear_fila_notificaciones(item) {
    return `
        <div class="menssage__noti">
            <div class="menssage__noti__title__fecha">
                <h3>${item.titulo} - ${item.tipo}</h3>
                <h3>${item.fecha_creacion}</h3>
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
        console.log(response)
        mostrar_notificaciones(response)
        return response
    } catch (error) {
        console.error(error)
    }
}

// -------------------
// GESTION DE ALIMENTOS
// -------------------


function consulta_alimentos() {
    const contenido = document.getElementById("contenido");
    fetch(`${URL_BASE}/alimentos`, { method: "GET" })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            contenido.innerHTML = "";
            data.mensaje.forEach(element => {
                const mapa = {};
                element.elementos.forEach(e => {
                    mapa[e.nombre] = e.valor;
                });
                contenido.innerHTML += `
            <tr class="nuevo1">
                <td class="nuevo td__border__l">
                    <img class="svg__alimento" src="/src/static/iconos/logo alimentospng.png">
                </td>
                <td class="nuevo">${element.id_alimento}</td>
                <td class="nuevo">${element.nombre}</td>
                <td class="nuevo">${mapa["Proteina_cruda"]}</td>
                <td class="nuevo">${mapa["Materia_seca"]}</td>
                <td class="nuevo">${mapa["Energia_metabo"]}</td>
                <td class="nuevo">${mapa["Fibra_cruda"]}</td>
                <td class="nuevo">${element.estado}</td>
                <td class="nuevo td__border__r">

                    <!-- Abrir modal ver -->
                    <img src="/src/static/iconos/icon eye.svg" 
                         onclick="abrirModal('eye', ${element.id_alimento})" 
                         class="icon-eye">

                    <!-- Abrir modal editar -->
                    <img src="/src/static/iconos/edit icon.svg"  
                         onclick="abrirModal('edit', ${element.id_alimento})" 
                         class="icon-edit">

                    <!-- Abrir modal eliminar -->
                    <img src="/src/static/iconos/delete icon.svg" 
                         onclick="abrirModal('dele', ${element.id_alimento})" 
                         class="icon-delete">

                </td>
            </tr>

            <!-- Modal ver -->
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
            `
            });
        })
}

function consulta_individual_alimento() {
    const nombre = document.getElementById("id_alimento").value;
    const contenido = document.getElementById("contenido");
    contenido.innerHTML = "";

    if (nombre === "") {
        Swal.fire({
            title: "Campo vacío",
            text: "Por favor ingresa el nombre o ID del alimento.",
            icon: "warning",
            confirmButtonText: "OK"
        });
        return consulta_alimentos();
    }
    fetch(`${URL_BASE}/consulta_indi_alimento/${nombre}`)
        .then(res => res.json())
        .then(data => {
            if (!data.mensaje) {
                Swal.fire({
                    title: "Mensaje",
                    text: "Alimento no encontrado",
                    icon: "error",
                    confirmButtonText: "OK"
                }).then((result) => {
                    if (result.isConfirmed) {
                        consulta_alimentos();
                    }
                });
                return consulta_alimentos();
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
                            <img src="/src/static/iconos/edit icon.svg" onclick="abrirModal('edit', ${element.id_alimento})" 
                         class="icon-edit" class="icon-edit">
                            <img src="/src/static/iconos/delete icon.svg" onclick="abrirModal('dele', ${element.id_alimento})" class="icon-delete">
                        </td>
                    </tr>

                    <!-- Modal ver -->
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
    <button class="button-eliminar" onclick="eliminar_alimento(${element.id_alimento})">Eliminar</button>
    <button class="button-cerrar" onclick="cerrarModal('dele', ${element.id_alimento})">Cancelar</button>
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
            return;
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
function dietas() {
    const alimentos_en_dieta = document.getElementById("alimentos_en_dieta");

    fetch(`${URL_BASE}/alimentos_disponible`)
        .then(res => {
            if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            console.log(data);
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
                console.log(data)

                // MAPA DE NUTRIENTES
                const mapa = {
                    Proteina_cruda: element.Proteina_cruda,
                    Fosforo: element.Fosforo,
                    Treonina: element.Treonina,
                    Fibra_cruda: element.Fibra_cruda,
                    Sodio: element.Sodio,
                    Metionina: element.Metionina,
                    Materia_seca: element.Materia_seca,
                    Extracto_etereo: element.Extracto_etereo,
                    Arginina: element.Arginina,
                    Metionina_Cisteina: element.Metionina_Cisteina,
                    Energia_metabo: element.Energia_metabo,
                    Calcio: element.Calcio,
                    Lisina: element.Lisina,
                    Triptofano: element.Triptofano
                };

                // MODAL + TARJETA DEL ALIMENTO
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
      <input value="${mapa.Proteina_cruda}" readonly>

      <p>Materia seca (%)</p>
      <input value="${mapa.Materia_seca}" readonly>

      <p>Energía metabolizable (Kcal/kg)</p>
      <input value="${mapa.Energia_metabo}" readonly>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input value="${mapa.Fibra_cruda}" readonly>

      <p>Extracto etéreo (%)</p>
      <input value="${mapa.Extracto_etereo}" readonly>

      <p>Calcio (%)</p>
      <input value="${mapa.Calcio}" readonly>

      <p>Fósforo (%)</p>
      <input value="${mapa.Fosforo}" readonly>
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input value="${mapa.Sodio}" readonly>

      <p>Arginina (%)</p>
      <input value="${mapa.Arginina}" readonly>

      <p>Lisina (%)</p>
      <input value="${mapa.Lisina}" readonly>

      <p>Treonina (%)</p>
      <input value="${mapa.Treonina}" readonly>
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input value="${mapa.Metionina}" readonly>

      <p>Metionina + Cisteína (%)</p>
      <input value="${mapa.Metionina_Cisteina}" readonly>

      <p>Triptófano (%)</p>
      <input value="${mapa.Triptofano}" readonly>
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
    <div class="imagen_alimento_dieta">
        <img src="${URL_BASE}${element.imagen}" 
             onclick="abrirModal('eye', ${element.id_alimento})"
             onerror="this.onerror=null; this.src='/src/static/iconos/imagen no encontrada.svg'; this.classList.add('sin_imagen_alimento_dieta')"
             alt="no hay imagen">
    </div>

    <div class="descripcion_dietas">
        <p><strong>Nombre:</strong> ${element.nombre}</p>
        <p><strong>Cantidad (Kg):</strong></p>
        <input type="number" min="0" class="input_dietas"
               data-id="${element.id_alimento}"
               id="cantidad-${element.nombre}"
               placeholder="Cantidad">
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
function grafica() {
const ctx = document.getElementById('nutricionCircular').getContext('2d');
const data = {
    labels: ["Cubierto", "Faltante"],
    datasets: [{
        label: "Total Nutrientes",
        data: [3343.02, 156.98],
        backgroundColor: ["#4caf50", "#f44336"],
        hoverOffset: 4
    }]
};

const config = {
    type: 'pie', // o 'doughnut' si quieres hueco en el centro
    data: data,
    options: {
        responsive: true
    }
};

new Chart(ctx, config);
}
function rellenar_etapa_vida_en_dietas() {
    fetch('http://127.0.0.1:5000/etapa_vida')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('select-etapas');

            if (data.etapas && data.etapas.length > 0) {
                data.etapas.forEach(etapa => {
                    const option = document.createElement('option');
                    option.value = etapa.id_etapa;      // valor del select = id de la etapa
                    option.textContent = etapa.nombre_etapa;  // texto visible = nombre de la etapa
                    select.appendChild(option);
                });
            }
        })
        .catch(err => console.error("Error al cargar las etapas:", err));
    document.getElementById("select-etapas").addEventListener("change", function () {

        const idEtapa = this.value;

        fetch("http://127.0.0.1:5000/etapa_vida")
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
    const endpoint = "http://127.0.0.1:5000/ultima_notificacion/3";

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    let ultimaId = parseInt(localStorage.getItem('ultima_notificacion_id') || 0);

    function mostrarNotificacion(titulo, mensaje, id) {
        if (Notification.permission === "granted") {
            new Notification(titulo, {
                body: mensaje,
                icon: "/src/static/iconos/logo_login.png"
            });
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

