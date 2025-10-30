const URL_BASE = 'http://127.0.0.1:5000'

// Al cargar la página, insertar el diálogo
document.addEventListener('DOMContentLoaded', function () {
    const dialogContainer = document.createElement('div');
    dialogContainer.innerHTML = crearDialogRegistrarRaza();
    document.body.appendChild(dialogContainer);

    const dialogContainer2 = document.createElement('div');
    dialogContainer2.innerHTML = crearDialogRegistrarEtapa();
    document.body.appendChild(dialogContainer2);
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
            console.log(user)
            fetch(`${URL_BASE}/users`,
                {
                    method: 'POST',
                    body: JSON.stringify(user),
                    headers: {
                        "Content-type": "application/json"
                    }
                }).then(response => {
                    console.log(response)
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
                console.log(response)
                console.log(response.Mensaje)
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


// -------------------
// GESTION DE PORCINOS
// -------------------

function dialog_ges_raz() {
    const mod_wind = document.getElementById('dialog__ges__raz')
    const btn_abrir = document.getElementById('abrir__digraz')
    const btn_cerrar = document.getElementById('cerrar__digraz')

    btn_abrir.addEventListener('click', function () {
        mod_wind.showModal();
    });

    btn_cerrar.addEventListener('click', function () {
        mod_wind.close();
    });
}

function dialog__ges__eta() {
    const mod_wind = document.getElementById('dialog__ges__eta')
    const btn_abrir = document.getElementById('abrir__digeta')
    const btn_cerrar = document.getElementById('cerrar__digeta')

    btn_abrir.addEventListener('click', function () {
        mod_wind.showModal();
    });

    btn_cerrar.addEventListener('click', function () {
        mod_wind.close();
    });
}

// CONSUMO DE DATOS DE LOS PORCINOS REGISTRADOS
function mostrar_porcinos(porcinos) {
    const info = porcinos.map(item => crearFilaPorcino(item)).join('');
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
    const campos = [
        { label: 'ID', value: item.id_porcino, id: 'ID' },
        { label: 'Peso inicial', value: `${item.peso_inicial} KG`, id: 'Peso-ini' },
        { label: 'Peso final', value: `${item.peso_final} KG`, id: 'Peso-fin' },
        { label: 'Fecha de nacimiento', value: item.fecha_nacimiento, id: 'Fecha-naci' },
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

    return crearDialogBase(`dialog-eye-${uniqueId}`, 'dialog-icon-eye', 'Informacion del Porcino', camposHTML, 'Cerrar', 'button-cerrar', uniqueId);
}

function crearDialogEdit(item, uniqueId) {
    const camposEditables = [
        { label: 'ID', value: item.id_porcino, editable: false },
        { label: 'Peso inicial', value: item.peso_inicial, editable: true },
        { label: 'Peso final', value: item.peso_final, editable: false },
        { label: 'Fecha de nacimiento', value: item.fecha_nacimiento, editable: true },
        { label: 'Sexo', value: item.sexo, editable: true },
        { label: 'Raza', value: item.raza, editable: true },
        { label: 'Etapa de vida', value: item.etapa, editable: true },
        { label: 'Descripción', value: item.descripcion, editable: true },
        { label: 'Estado', value: item.estado, editable: true }
    ];

    const camposHTML = camposEditables.map(campo => {
        const fieldId = campo.label.replace(/\s+/g, '-') + '-' + uniqueId;
        if (campo.label == 'Raza' || campo.label == 'Etapa de vida' || campo.label == 'Estado') {
            return `
                <div class = "container__label__input">
                    <label for="${fieldId}">${campo.label}</label>
                    <div class="container-inputs">
                        <select id="${fieldId}" ${campo.editable ? '' : 'disabled'}>
                            <option>${campo.value}</option>
                        </select>
                        ${campo.editable ? crearIconoEdit() : ''}
                    </div>
                </div>
        `;
        } else {
            return `
                <div class = "container__label__input">
                    <label for="${fieldId}">${campo.label}</label>
                    <div class="container-inputs">
                        <input type="text" id="${fieldId}" value="${campo.value}" ${campo.editable ? '' : 'disabled'}>
                        ${campo.editable ? crearIconoEdit() : ''}
                    </div>
                </div>
        `;
        }
    }).join('');

    return crearDialogBase(`dialog-edit-${uniqueId}`, 'dialog-icon-edit', 'Actualizar datos del porcino', camposHTML, 'Guardar', 'button-guardar', uniqueId);
}

function crearDialogDelete(item, uniqueId) {
    const contenido = `
    <div class="info-delete" >
        <p>Eliminar el registro sin saber si el porcino tiene trazabilidad puede que altere el funcionamiento del sistema, es preferible que cambie el estado del porcino a inactivo.</p>
        <span>¿Está seguro que quiere eliminar este registro?</span>
        <div class="container-button-dele">
            <button class="button-eliminar" onclick="eliminar_porcino(${item.id_porcino})">Eliminar</button>
        </div>
    </div>
    `;

    return crearDialogBase(`dialog-delete-${uniqueId}`, 'dialog-icon-dele', 'Eliminar registro del porcino', contenido, '', '', uniqueId);
}

function crearDialogBase(id, clase, titulo, contenido, textoBoton, claseBoton, uniqueId) {
    return `
        <dialog class="${clase}" id="${id}">
            <div class="container__btn__close">
                <button type="button" class="btn__close" onclick="cerrarDialog('${id}')">X</button>
            </div>
            <div class="container__items__dialogs">
                <div class="title-dialog">
                    <h2>${titulo}</h2>
                    <hr>
                </div>
                <div class="info-porcino">${contenido}</div>
                ${textoBoton ? `
                <div class="container-button-${claseBoton.includes('cerrar') ? 'close' : 'guardar'}">
                    <button class="${claseBoton}" onclick="cerrarDialog('${id}')">${textoBoton}</button>
                </div>` : ''}
            </div>
        </dialog>`;
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

// async function consulta_general_porcinos() {
//     try {
//         const response = await fetch(`${URL_BASE}/porcino`);
//         if (!response.ok) throw new Error(`Error: ${response.status}`);
//         const porcinos = await response.json();
//         mostrar_porcinos(porcinos);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// function consulta_individual_porcino(){
//     var id_porcino = document.getElementById('input_id').value
//     fetch(`${URL_BASE}/porcino/${id_porcino}`, {method: 'GET'})
//     .then(response => {
//         if (!response.ok) throw new Error(`Error: ${response.status}`); // Manejo de errores HTTP
//         return response.json();
//     })
//     .then( porcinos => {
//         console.log(porcinos)
//         if (porcinos.Mensaje == 'Porcino no encontrado'){
//             Swal.fire({
//             title: "Mensaje",
//             text: `${porcinos.Mensaje}`,
//             icon: "error"
//         });
//         }else{
//             mostrar_porcinos(porcinos)
//         }
//     })
//     .catch(error => console.error('Error', error));
// }

// function refrescar_porcinos(id_porcino){
//     const row = document.querySelector(`tr[porcino-id = "${id_porcino}"]`)
//     if (row){
//         row.remove;
//         consulta_general_porcinos();
//     }
// }

// async function agregar_porcino(){
//     try {

//         const id_porcino = document.getElementById('id_porcino').value;
//         const peso_inicial = document.getElementById('peso_inicial').value;
//         const peso_final = document.getElementById('peso_final').value;
//         const fecha = document.getElementById('fecha').value;
//         const raza = document.getElementById('raza').value;
//         const sexo = document.getElementById('sexo').value;
//         const etapa = document.getElementById('etapa').value;
//         const descripcion = document.getElementById('descripcion').value;

//         const porcino = {
//             "id_porcino" : id_porcino,
//             "peso_inicial" : peso_inicial,
//             "peso_final" : peso_final,
//             "fecha_nacimiento" : fecha,
//             "id_raza" : raza,
//             "sexo" : sexo,
//             "id_etapa" : etapa,
//             "estado" : "Activo",
//             "descripcion" : descripcion 
//         }

//         const promesa = await fetch(`${URL_BASE}/porcino`, {
//             method : 'POST',
//             body : JSON.stringify(porcino),
//             headers : {
//                 "Content-type" : "application/json"
//             }
//         })
//         const response = await promesa.json()
//         if (response.Mensaje == `Porcino con id ${id_porcino} registrado`){
//             Swal.fire({
//             title: "Mensaje",
//             text: `${response.Mensaje}`,
//             icon: "success"
//         });
//         }else{
//             Swal.fire({
//             title: "Mensaje",
//             text: `LLene todos los campos`,
//             icon: "error"
//         });
//         }
//     } catch (error) {
//         console.error(error)
//     }
// }


// async function actualizar_porcino(id_porcino) {
//     try {
//         const id_porcino = document.getElementById('id_porcino').value;
//         const peso_inicial = document.getElementById('peso_inicial').value;
//         const peso_final = document.getElementById('peso_final').value;
//         const fecha = document.getElementById('fecha').value;
//         const raza = document.getElementById('raza').value;
//         const sexo = document.getElementById('sexo').value;
//         const etapa = document.getElementById('etapa').value;
//         const descripcion = document.getElementById('descripcion').value;

//         const porcino = {
//             "id_porcino" : id_porcino,
//             "peso_inicial" : peso_inicial,
//             "peso_final" : peso_final,
//             "fecha_nacimiento" : fecha,
//             "id_raza" : raza,
//             "sexo" : sexo,
//             "id_etapa" : etapa,
//             "estado" : "Activo",
//             "descripcion" : descripcion 
//         }
//     } catch (error) {
//         console.error(error)
//     }
// }


// function eliminar_porcino(id_porcino){
//     fetch(`${URL_BASE}/porcino/${id_porcino}`, {method: 'DELETE'})
//     .then( response => {
//         if (!response.ok) throw new Error(`Error: ${response.status}`);
//         return response.json()
//     })
//     .then(response => {
//         refrescar_porcinos(id_porcino);
//         Swal.fire({
//             title: "Mensaje",
//             text: `${response.Mensaje}`,
//             icon: "success"
//         });
//     })
//     .catch(error => console.error('Error', error));
// }

// // -------------------
// // GESTION DE DE RAZAS
// // -------------------

// // seccion para mostrar la informacion en el front-end
// function mostrar_raza(razas){
//     const info = razas.razas.map(item => crearFilaRaza(item)).join('');
//     document.getElementById('razas').innerHTML = info;
// }

// function crearFilaRaza(item){
//     const uniqueId = item.id_raza;
//     return `
//     <tr class="registro registro__dia">
//         <td class="td__border__l">${item.id_raza}</td>
//         <td>${item.nombre}</td>
//         <td>${item.descripcion}</td>
//         <td class="td__border__r">
//             ${crearIconosAccionesRaza(uniqueId)}
//         </td>
//             ${crearDialogEyeRaza(item, uniqueId)}
//             ${crearDialogEditRaza(item, uniqueId)}
//             ${crearDialogtDeleteRaza(item, uniqueId)}
//     </tr>
//     `
// }

// function crearIconosAccionesRaza(id) {
//     return `
//         <img src="/src/static/iconos/icono eye.svg" alt="" class="icon-eye" onclick="abrirDialog('dialog-eye-raza-${id}')">
//         <img src="/src/static/iconos/edit icon.svg" alt="" class="icon-edit" onclick="abrirDialog('dialog-edit-raza-${id}')">
//         <img src="/src/static/iconos/delete icon.svg" alt="" class="icon-delete" onclick="abrirDialog('dialog-delete-raza-${id}')">
//     `;
// }

// function crearDialogRegistrarRaza(){
//     const campos = [
//         {label: 'Nombre', id: 'nombre_raza', required: false},
//         {label: 'Descripcion', id: 'descripcion_raza', required: true},
//     ]

//     const camposHTML = campos.map(campo => `
//         <div class = "container__label__input">
//             <label for="${campo.id}">${campo.label}</label>
//             <input type="text" class="campo-info" id="${campo.id}" ${campo.required ? '' : 'required'}>
//         </div>
//         `).join('');

//     return crearDialogBaseRaza(`dialog-registrar-raza`, 'dialog-icon-eye', 'Registrar Raza', camposHTML, 'Guardar', 'button-guardar', '', 'registrar_raza','');
// }

// function crearDialogEyeRaza(item, uniqueId){
//     const campos = [
//         {label: 'ID', value: item.id_raza, id: 'id-raza'},
//         {label: 'Nombre', value: item.nombre, id: 'nombre-raza'},
//         {label: 'Descripcion', value: item.descripcion, id: 'descripcion-raza'},
//     ]

//     const camposHTML = campos.map(campo => `
//         <div class = "container__label__input">
//             <label for="${campo.id}-${uniqueId}">${campo.label}</label>
//             <input type="text" class="campo-info" id="${campo.id}-${uniqueId}" placeholder="${campo.value}" readonly>
//         </div>
//         `).join('');

//     return crearDialogBaseRaza(`dialog-eye-raza-${uniqueId}`, 'dialog-icon-eye', 'Informacion de la Raza', camposHTML, 'Cerrar', 'button-cerrar', uniqueId, 'cerrarDialog',`dialog-eye-raza-${uniqueId}`);
// }


// function crearDialogEditRaza(item, uniqueId){
//     const camposEditables = [
//         {label: 'ID', value: item.id_raza, editable: false, id: "id-raza"},
//         {label: 'Nombre', value: item.nombre, editable: true, id: "nombre-raza"},
//         {label: 'Descripcion', value: item.descripcion, editable:true, id: "descripcion-raza"},
//     ]

//     const camposHTML = camposEditables.map(campo => {
//         const fieldId = campo.id.replace(/\s+/g, '-') + '-' + 'actualizar' + '-' +uniqueId;
//         return `
//         <div class = "container__label__input">
//             <label for="${fieldId}">${campo.label}</label>
//             <div class="container-inputs">
//                 <input type="text" id="${fieldId}" value="${campo.value}" ${campo.editable ? '' : 'disabled'}>
//                 ${campo.editable ? crearIconoEdit() : ''}
//             </div>
//         </div>
//         `;
//     }).join('');

//     return crearDialogBaseRaza(`dialog-edit-raza-${uniqueId}`, 'dialog-icon-eye', 'Actualizar datos de la Raza', camposHTML, 'Guardar', 'button-guardar', uniqueId, 'actualizar_raza','')
// }

// function crearDialogtDeleteRaza(item, uniqueId){
//     const contenido =  `
//         <div class="info-delete" >
//             <p>Eliminar el registro sin saber si la raza tiene trazabilidad puede que altere el funcionamiento del sistema.</p>
//             <span>¿Está seguro que quiere eliminar este registro?</span>
//             <div class="container-button-dele">
//                 <button class="button-eliminar" onclick="eliminar_raza(${item.id_raza})">Eliminar</button>
//             </div>
//         </div>
//     `;

//     return crearDialogBaseRaza(`dialog-delete-raza-${uniqueId}`, 'dialog-icon-dele', 'Eliminar Raza', contenido, '', '', uniqueId, '', '')
// }


// function crearDialogBaseRaza(id, clase, titulo, contenido, textoBoton, claseBoton, uniqueId, funct, params) {
//     // Crear el dialogo
//     const dialog = document.createElement("dialog");
//     document.body.appendChild(dialog)
//     dialog.className = clase;
//     dialog.id = id;
//     // Armar contenido interno
//     dialog.innerHTML = `
//         <div class="container__btn__close">
//             <button type="button" class="btn__close" onclick="cerrarDialog('${id}')">X</button>
//         </div>
//         <form onsubmit="event.preventDefault(); ${funct}('${uniqueId}')">
//             <div class="title-dialog">
//                 <h2>${titulo}</h2>
//                 <hr>
//             </div>
//             <div class="info_raza_etapa">${contenido}</div>
//             ${textoBoton ? `
//             <div class="container-button-${claseBoton.includes('cerrar') ? 'close' : 'guardar'}">
//                 <button type="${textoBoton.toLowerCase() === 'cerrar' ? 'button' : 'submit'}" 
//                         class="${claseBoton}" 
//                         ${textoBoton.toLowerCase() === 'cerrar' ? `onclick="cerrarDialog('${id}')"` : ""}>
//                     ${textoBoton}
//                 </button>
//             </div>` : ""}
//         </form>
//     `;
//     return ''

// }


// async function consultar_razas() {
//     try {
//         const promesa = await fetch(`${URL_BASE}/raza`, {method: 'GET'});
//         if (!promesa.ok) throw new Error(`Error: ${promesa.status}`);
//         const response = await promesa.json();
//         mostrar_raza(response)
//         return response
//     } catch (error) {
//         console.error(error)
//     }
// }

// async function registrar_raza() {
//     try {
//         console.log('si entra a registrar')
//         const nombre = document.getElementById('nombre_raza').value;
//         const descri = document.getElementById('descripcion_raza').value;

//         const raza = {
//             nombre: nombre,
//             descripcion: descri
//         }

//         const promesa = await fetch(`${URL_BASE}/raza`, {
//             method : 'POST',
//             body : JSON.stringify(raza),
//             headers: {
//                 "Content-type" : "application/json"
//             }
//         })
//         const response = await promesa.json()
//         console.log(response)
//         if (response.Mensaje == "Raza registrada correctamente"){
//             Swal.fire({
//             title: "Mensaje",
//             text: `${response.Mensaje}`,
//             icon: "success"

//             });
//             consultar_razas();
//         } else{
//             Swal.fire({
//             title: "Mensaje",
//             text: `${response.Mensaje}`,
//             icon: "error"
//         });
//         }
//         return response
//     } catch (error) {
//         console.error(error)
//     }
// }

// async function actualizar_raza(id) {
//     try {
//         const nombre = document.getElementById(`nombre-raza-actualizar-${id}`).value;
//         const descri = document.getElementById(`descripcion-raza-actualizar-${id}`).value;

//         console.log(document.getElementById(`nombre-raza-actualizar-${id}`))
//         console.log(document.getElementById(`descripcion-actualizar-raza-${id}`))

//         const raza = {
//             nombre: nombre,
//             descripcion: descri
//         }

//         const promesa = await fetch(`${URL_BASE}/raza/${id}`, {
//             method : 'PUT',
//             body : JSON.stringify(raza),
//             headers: {
//                 "Content-type" : "application/json"
//             }
//         })
//         const response = await promesa.json()
//         console.log(response)
//         return response
//     } catch (error) {
//         console.error(error)
//     }
// }

// async function eliminar_raza(id){
//     try {
//         const promesa = await fetch(`${URL_BASE}/raza/${id}`, {method : 'DELETE'});
//         const response = await promesa.json();
//         consultar_razas()
//         return response
//     } catch (error) {
//         console.log(error)
//         Swal.fire({
//             title: "Mensaje",
//             text: `${error}`,
//             icon: "warning"
//         });
//     }
// }

// // -------------------
// // GESTION DE ETAPAS
// // -------------------

// function mostrar_etapas(etapas){

//     const info = etapas.etapas.map(item => crearFilaEtapa(item)).join('');
//     document.getElementById('etapas_vida').innerHTML = info;
// }

// function crearFilaEtapa(item){
//     const uniqueId = item.id_etapa;
//     return `
//         <tr class="registro registro__dia">
//             <td class="td__border__l">${item.id_etapa}</td>
//             <td>${item.nombre}</td>
//             <td>${item.descripcion}</td>
//             <td class="td__border__r">
//                 ${crearIconosAccionesEtapa(uniqueId)}
//             </td>
//             ${crearDialogEyeEtapa(item, uniqueId)}
//             ${crearDialogEditEtapa(item, uniqueId)}
//             ${crearDialogDeleteEtapa(item, uniqueId)}
//         </tr>
//     `
// }

// function crearIconosAccionesEtapa(id){
//     return `
//     <img src="/src/static/iconos/icono eye.svg" alt="" class="icon-eye" id="abrir-dieye" onclick="abrirDialog('dialog-eye-etapa-${id}')">
//     <img src="/src/static/iconos/edit icon.svg" alt="" class="icon-edit" id="abrir-diedit" onclick="abrirDialog('dialog-edit-etapa-${id}')">
//     <img src="/src/static/iconos/delete icon.svg" alt="" class="icon-delete" id="abrir-didele" onclick="abrirDialog('dialog-delete-etapa-${id}')">
//     `
// }

// function crearDialogRegistrarEtapa(){
//     const campos = [
//         {label: "Nombre", id: "nombre_etapa", required: false},
//         {label: "Descripcion", id: "descripcion_etapa", required: true}
//     ]
//     const camposHTML = campos.map(campo => {
//         return `
//                 <div class = "container__label__input">
//                     <label for="${campo.id}">${campo.label}</label>
//                     <input type="text" class="campo-info" id="${campo.id}" ${campo.required ? '' : 'required'}>
//                 </div>
//             `
//     }).join('');
//     return crearDialogBaseRaza('dialog-registrar-etapa', 'dialog-icon-eye', 'Registar Etapa de vida', camposHTML, "Guardar", 'button-guardar', '','registrar_etapas','')
// }

// function crearDialogEyeEtapa(item, uniqueId){
//     const campos = [
//         {label: 'ID', value: item.id_etapa, id: 'id-etapa'},
//         {label: 'Nombre', value: item.nombre, id: 'nombre-etapa'},
//         {label: 'Descripcion', value: item.descripcion, id: 'descripcion-etapa'},
//     ]
//     const camposHTML = campos.map(campo => `
//         <div class = "container__label__input">
//             <label for="${campo.id}-${uniqueId}">${campo.label}</label>
//             <input type="text" class="campo-info" id="${campo.id}-${uniqueId}" placeholder="${campo.value}" readonly>
//         </div>
//     `).join('');
//     return crearDialogBaseRaza(`dialog-eye-etapa-${uniqueId}`, 'dialog-icon-eye', 'Informacion de la Etpa de vida', camposHTML, 'Cerrar', 'button-cerrar', uniqueId)
// }

// function crearDialogEditEtapa(item, uniqueId){
//     const camposEditables = [
//         {label: 'ID', value: item.id_etapa, id: 'id-etapa', editable: false},
//         {label: 'Nombre', value: item.nombre, id: 'nombre-etapa', editable: true},
//         {label: 'Descripcion', value: item.descripcion, id: 'descripcion-etapa', editable: true},
//     ]

//     const camposHTML = camposEditables.map(campo => {
//         const fieldId = campo.id.replace(/\s+/g, '-') + '-' + 'actualizar' + '-' +uniqueId;
//         return `
//         <div class = "container__label__input">
//             <label for="${fieldId}">${campo.label}</label>
//             <div class="container-inputs">
//                 <input type="text" id="${fieldId}" value="${campo.value}" ${campo.editable ? '' : 'disabled'}>
//                 ${campo.editable ? crearIconoEdit() : ''}
//             </div>



//         </div>
//         `;
//     }).join('');

//     return crearDialogBaseRaza(`dialog-edit-etapa-${uniqueId}`, 'dialog-icon-eye', 'Actualizar datos de la Etapa de Vida', camposHTML, 'Guardar', 'button-guardar', uniqueId,'actualizar_etapa','')
// }

// function crearDialogDeleteEtapa(item, uniqueId){
//     const contenido =  `
//         <div class="info-delete" >
//             <p>Eliminar el registro sin saber si la etapa de vida tiene trazabilidad puede que altere el funcionamiento del sistema.</p>
//             <span>¿Está seguro que quiere eliminar este registro?</span>
//             <div class="container-button-dele">
//                 <button class="button-eliminar" onclick="eliminar_etapa(${item.id_etapa})">Eliminar</button>
//             </div>
//         </div>
//     `;

//     return crearDialogBaseRaza(`dialog-delete-etapa-${uniqueId}`, 'dialog-icon-dele', 'Eliminar Etapa de Vida', contenido, '','', uniqueId)
// }

// async function consultar_etapas() {
//     try{
//         const promesa = await fetch(`${URL_BASE}/etapa_vida`, {method: 'GET'});
//         const response = await promesa.json();
//         mostrar_etapas(response)
//         return response
//     } catch(error){
//         console.error(error)
//     }
// }

// async function registrar_etapas(){
//     try {
//         const nombre = document.getElementById('nombre_etapa').value;
//         const descri = document.getElementById('descripcion_etapa').value;

//         const etapa = {
//             nombre : nombre,
//             descripcion : descri
//         }

//         const promesa = await fetch(`${URL_BASE}/etapa_vida`, {
//             method : 'POST',
//             body: JSON.stringify(etapa),
//             headers : {
//                 "Content-type" : "application/json"
//             }
//         })
//         const response = await promesa.json()
//         console.log(response)
//         if (response.Mensaje == "Etapa de vida registrada correctamente"){
//             Swal.fire({
//             title: "Mensaje",
//             text: `${response.Mensaje}`,
//             icon: "success"
//             });
//             consultar_etapas();
//         } else{
//             Swal.fire({
//             title: "Mensaje",
//             text: `${response.Mensaje}`,
//             icon: "error"
//         });
//         }
//         return response
//     } catch (error) {
//         console.error(error)
//     }
// }

// async function actualizar_etapa(id) {
//     try {
//         const nombre = document.getElementById(`nombre-etapa-actualizar-${id}`).value;
//         const descri = document.getElementById(`descripcion-etapa-actualizar-${id}`).value;

//         const etapa = {
//             nombre : nombre,
//             descripcion : descri
//         }

//         const promesa = await fetch(`${URL_BASE}/etapa_vida/${id}`, {
//             method : 'PUT',
//             body: JSON.stringify(etapa),
//             headers : {
//                 "Content-type" : "application/json",
//             }
//         })
//         const response = await promesa.json();

//         console.log(response)
//         return response
//     } catch (error) {
//         console.error(error)
//     }
// }

// async function eliminar_etapa(id) {
//     try {
//         const promesa = await fetch(`${URL_BASE}/etapa_vida/${id}`, {
//             method: 'DELETE',
//         })
//         const response = await promesa.json();
//         consultar_etapas()
//         console.log(response);
//         return response
//     } catch (error) {
//         console.error(error)
//     }
// }


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

function eliminar_alimento(id) {
    fetch(`${URL_BASE}/eliminar_alimento/${id}`, { method: "delete" })
        .then(res => res.json())
        .then(data => {
            console.log("eliminado correctamente")
            alert("eliminado correctamente")
            window.location.reload()
        })
}

async function consulta_individual_alimento() {
  const nombre = document.getElementById("id_alimento").value.trim();
  const contenido = document.getElementById("contenido");
  contenido.innerHTML = "";

  if (!nombre) {
    Swal.fire({
      icon: "warning",
      title: "Campo vacío",
      text: "Por favor ingresa un nombre de alimento para buscar.",
      confirmButtonColor: "#3085d6",
      customClass: { popup: "swal-elevado" }
    });
    return;
  }

  try {
    const response = await fetch(`${URL_BASE}/consulta_indi_alimento/${nombre}`);
    const data = await response.json();

    if (!response.ok || !data.mensaje) {
      Swal.fire({
        icon: "error",
        title: "No encontrado",
        text: "No se encontró ningún alimento con ese nombre.",
        confirmButtonColor: "#d33",
        customClass: { popup: "swal-elevado" }
      });
      return;
    }

    // 🔹 Convierte en array si no lo es
    const alimentos = Array.isArray(data.mensaje) ? data.mensaje : [data.mensaje];

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
          <td class="nuevo">${mapa["Materia_seca"] || ''}</td>
          <td class="nuevo">${mapa["Energia_metabo"] || ''}</td>
          <td class="nuevo">${mapa["Proteina_cruda"] || ''}</td>
          <td class="nuevo">${mapa["Fibra_cruda"] || ''}</td>
          <td class="nuevo">${element.estado}</td>
          <td class="nuevo td__border__r">
              <img src="/src/static/iconos/icon eye.svg" onclick="abrirModal('eye', ${element.id_alimento})" class="icon-eye">
              <img src="/src/static/iconos/edit icon.svg" onclick="abrirModal('edit', ${element.id_alimento})" class="icon-edit">
              <img src="/src/static/iconos/delete icon.svg" onclick="abrirModal('dele', ${element.id_alimento})" class="icon-delete">
          </td>
        </tr>

        <!-- Modal ver -->
        <dialog class="dialog-icon-eye modal-info" id="modal-eye-${element.id_alimento}">
          <div class="title-dialog">
            <h2>Información del alimento</h2>
            <hr>
          </div>
          <div class="modal-info-content">
            <section class="modal-column">
              <p>Nombre del alimento</p>
              <input class="input__id" value="${element.nombre}" readonly>
              <p>Proteína cruda (%)</p>
              <input class="input__id" value="${mapa["Proteina_cruda"] || ''}" readonly>
              <p>Materia seca (%)</p>
              <input class="input__id" value="${mapa["Materia_seca"] || ''}" readonly>
              <p>Energía metabolizable (Kcal/kg)</p>
              <input class="input__id" value="${mapa["Energia_metabo"] || ''}" readonly>
            </section>

            <section class="modal-column">
              <p>Fibra cruda (%)</p>
              <input class="input__id" value="${mapa["Fibra_cruda"] || ''}" readonly>
              <p>Extracto etéreo (%)</p>
              <input class="input__id" value="${mapa["Extracto_etereo"] || ''}" readonly>
              <p>Calcio (%)</p>
              <input class="input__id" value="${mapa["Calcio"] || ''}" readonly>
              <p>Fósforo (%)</p>
              <input class="input__id" value="${mapa["Fosforo"] || ''}" readonly>
            </section>
          </div>
          <div class="modal-footer">
            <button onclick="cerrarModal('eye', ${element.id_alimento})" class="btn">Cerrar</button>
          </div>
        </dialog>

        <!-- Modal eliminar -->
        <dialog class="dialog-icon-dele modal-info" id="modal-dele-${element.id_alimento}">
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

  } catch (error) {
    console.error("Error al consultar alimento:", error);
    Swal.fire({
      icon: "error",
      title: "Error inesperado",
      text: "Ocurrió un problema al consultar el alimento.",
      confirmButtonColor: "#d33",
      customClass: { popup: "swal-elevado" }
    });
  }
}

const abrirnav = document.getElementById("abrirnav")
const barra_lateral = document.getElementById("barra_lateral")
const spans = barra_lateral.querySelectorAll("span")

abrirnav.addEventListener("click", () => {
    barra_lateral.classList.toggle("mini-barra-lateral")
    spans.forEach(span => {
        span.classList.toggle("oculto")
    })
})


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
                <td class="nuevo">${mapa["Materia_seca"]}</td>
                <td class="nuevo">${mapa["Energia_metabo"]}</td>
                <td class="nuevo">${mapa["Proteina_cruda"]}</td>
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
      <input class="input__id" value="${element.nombre}" readonly>

      <p>Proteína cruda (%)</p>
      <input class="input__id" value="${mapa['Proteina_cruda']}" readonly>

      <p>Materia seca (%)</p>
      <input class="input__id" value="${mapa['Materia_seca']}" readonly>

      <p>Energía metabolizable (Kcal/kg)</p>
      <input class="input__id" value="${mapa['Energia_metabo']}" readonly>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input class="input__id" value="${mapa['Fibra_cruda']}" readonly>

      <p>Extracto etéreo (%)</p>
      <input class="input__id" value="${mapa['Extracto_etereo']}" readonly>

      <p>Calcio (%)</p>
      <input class="input__id" value="${mapa['Calcio']}" readonly>

      <p>Fósforo (%)</p>
      <input class="input__id" value="${mapa['Fosforo']}" readonly>
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input class="input__id" value="${mapa['Sodio']}" readonly>

      <p>Arginina (%)</p>
      <input class="input__id" value="${mapa['Arginina']}" readonly>

      <p>Lisina (%)</p>
      <input class="input__id" value="${mapa['Lisina']}" readonly>

      <p>Treitona (%)</p>
      <input class="input__id" value="${mapa['Treitona']}" readonly>
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input class="input__id" value="${mapa['Metionina']}" readonly>

      <p>Metionina + Cisteína (%)</p>
      <input class="input__id" value="${mapa['Metionina_Cisteina']}" readonly>

      <p>Triptófano (%)</p>
      <input class="input__id" value="${mapa['Triptofano']}" readonly>
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
      <input  id="edit-nombre-${element.id_alimento}" class="input__id" value="${element.nombre}">

      <p>Proteína cruda (%)</p>
      <input type="number" id="edit-Proteina_cruda-${element.id_alimento}" class="input__id" value="${mapa['Proteina_cruda'] || ''}">

      <p>Materia seca (%)</p>
      <input type="number" id="edit-Materia_seca-${element.id_alimento}" class="input__id" value="${mapa['Materia_seca'] || ''}">

      <p>Energía metabolizable (Kcal/kg)</p>
      <input type="number" id="edit-Energia_metabo-${element.id_alimento}" class="input__id" value="${mapa['Energia_metabo'] || ''}">

            <p>Estado</p>
      <select id="edit-estado-${element.id_alimento}" class="input__id">
        <option value="activo" ${element.estado === 'activo' ? 'selected' : ''}>Activo</option>
        <option value="inactivo" ${element.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
      </select>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input type="number" id="edit-Fibra_cruda-${element.id_alimento}" class="input__id" value="${mapa['Fibra_cruda'] || ''}">

      <p>Extracto etéreo (%)</p>
      <input type="number" id="edit-Extracto_etereo-${element.id_alimento}" class="input__id" value="${mapa['Extracto_etereo'] || ''}">

      <p>Calcio (%)</p>
      <input type="number" id="edit-Calcio-${element.id_alimento}" class="input__id" value="${mapa['Calcio'] || ''}">

      <p>Fósforo (%)</p>
      <input type="number" id="edit-Fosforo-${element.id_alimento}" class="input__id" value="${mapa['Fosforo'] || ''}">
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input type="number" id="edit-Sodio-${element.id_alimento}" class="input__id" value="${mapa['Sodio'] || ''}">

      <p>Arginina (%)</p>
      <input type="number" id="edit-Arginina-${element.id_alimento}" class="input__id" value="${mapa['Arginina'] || ''}">

      <p>Lisina (%)</p>
      <input type="number" id="edit-Lisina-${element.id_alimento}" class="input__id" value="${mapa['Lisina'] || ''}">

      <p>Treitona (%)</p>
      <input type="number" id="edit-Treitona-${element.id_alimento}" class="input__id" value="${mapa['Treitona'] || ''}">
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input type="number" id="edit-Metionina-${element.id_alimento}" class="input__id" value="${mapa['Metionina'] || ''}">

      <p>Metionina + Cisteína (%)</p>
      <input type="number" id="edit-Metionina_Cisteina-${element.id_alimento}" class="input__id" value="${mapa['Metionina_Cisteina'] || ''}">

      <p>Triptófano (%)</p>
      <input type="number" id="edit-Triptofano-${element.id_alimento}" class="input__id" value="${mapa['Triptofano'] || ''}">

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
                        window.location.reload();
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
                        <td class="nuevo">${mapa["Materia_seca"] || ''}</td>
                        <td class="nuevo">${mapa["Energia_metabo"] || ''}</td>
                        <td class="nuevo">${mapa["Proteina_cruda"] || ''}</td>
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
      <input  class="input__id" value="${element.nombre}" readonly>

      <p>Proteína cruda (%)</p>
      <input type="number" class="input__id" value="${mapa['Proteina_cruda']}" readonly>

      <p>Materia seca (%)</p>
      <input type="number" class="input__id" value="${mapa['Materia_seca']}" readonly>

      <p>Energía metabolizable (Kcal/kg)</p>
      <input type="number" class="input__id" value="${mapa['Energia_metabo']}" readonly>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input type="number" class="input__id" value="${mapa['Fibra_cruda']}" readonly>

      <p>Extracto etéreo (%)</p>
      <input type="number" class="input__id" value="${mapa['Extracto_etereo']}" readonly>

      <p>Calcio (%)</p>
      <input type="number" class="input__id" value="${mapa['Calcio']}" readonly>

      <p>Fósforo (%)</p>
      <input type="number" class="input__id" value="${mapa['Fosforo']}" readonly>
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input type="number" class="input__id" value="${mapa['Sodio']}" readonly>

      <p>Arginina (%)</p>
      <input type="number" class="input__id" value="${mapa['Arginina']}" readonly>

      <p>Lisina (%)</p>
      <input type="number" class="input__id" value="${mapa['Lisina']}" readonly>

      <p>Treitona (%)</p>
      <input type="number" class="input__id" value="${mapa['Treitona']}" readonly>
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input type="number" class="input__id" value="${mapa['Metionina']}" readonly>

      <p>Metionina + Cisteína (%)</p>
      <input type="number" class="input__id" value="${mapa['Metionina_Cisteina']}" readonly>

      <p>Triptófano (%)</p>
      <input type="number" class="input__id" value="${mapa['Triptofano']}" readonly>
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
      <input  id="edit-nombre-${element.id_alimento}" class="input__id" value="${element.nombre}">

      <p>Proteína cruda (%)</p>
      <input type="number" id="edit-Proteina_cruda-${element.id_alimento}" class="input__id" value="${mapa['Proteina_cruda'] || ''}">

      <p>Materia seca (%)</p>
      <input type="number" id="edit-Materia_seca-${element.id_alimento}" class="input__id" value="${mapa['Materia_seca'] || ''}">

      <p>Energía metabolizable (Kcal/kg)</p>
      <input type="number" id="edit-Energia_metabo-${element.id_alimento}" class="input__id" value="${mapa['Energia_metabo'] || ''}">

            <p>Estado</p>
      <select id="edit-estado-${element.id_alimento}" class="input__id">
        <option value="activo" ${element.estado === 'activo' ? 'selected' : ''}>Activo</option>
        <option value="inactivo" ${element.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
      </select>
    </section>

    <!-- Columna 2 -->
    <section class="modal-column">
      <p>Fibra cruda (%)</p>
      <input type="number" id="edit-Fibra_cruda-${element.id_alimento}" class="input__id" value="${mapa['Fibra_cruda'] || ''}">

      <p>Extracto etéreo (%)</p>
      <input type="number" id="edit-Extracto_etereo-${element.id_alimento}" class="input__id" value="${mapa['Extracto_etereo'] || ''}">

      <p>Calcio (%)</p>
      <input type="number" id="edit-Calcio-${element.id_alimento}" class="input__id" value="${mapa['Calcio'] || ''}">

      <p>Fósforo (%)</p>
      <input type="number" id="edit-Fosforo-${element.id_alimento}" class="input__id" value="${mapa['Fosforo'] || ''}">
    </section>

    <!-- Columna 3 -->
    <section class="modal-column">
      <p>Sodio (%)</p>
      <input type="number" id="edit-Sodio-${element.id_alimento}" class="input__id" value="${mapa['Sodio'] || ''}">

      <p>Arginina (%)</p>
      <input type="number" id="edit-Arginina-${element.id_alimento}" class="input__id" value="${mapa['Arginina'] || ''}">

      <p>Lisina (%)</p>
      <input type="number" id="edit-Lisina-${element.id_alimento}" class="input__id" value="${mapa['Lisina'] || ''}">

      <p>Treitona (%)</p>
      <input type="number" id="edit-Treitona-${element.id_alimento}" class="input__id" value="${mapa['Treitona'] || ''}">
    </section>

    <!-- Columna 4 -->
    <section class="modal-column">
      <p>Metionina (%)</p>
      <input type="number" id="edit-Metionina-${element.id_alimento}" class="input__id" value="${mapa['Metionina'] || ''}">

      <p>Metionina + Cisteína (%)</p>
      <input type="number" id="edit-Metionina_Cisteina-${element.id_alimento}" class="input__id" value="${mapa['Metionina_Cisteina'] || ''}">

      <p>Triptófano (%)</p>
      <input type="number" id="edit-Triptofano-${element.id_alimento}" class="input__id" value="${mapa['Triptofano'] || ''}">

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
    { id_elemento: 1,  valor: parseFloat(document.getElementById(`edit-Proteina_cruda-${id_alimento}`).value) || 0 },
    { id_elemento: 2,  valor: parseFloat(document.getElementById(`edit-Fosforo-${id_alimento}`).value) || 0 },
    { id_elemento: 3,  valor: parseFloat(document.getElementById(`edit-Treitona-${id_alimento}`).value) || 0 },
    { id_elemento: 4,  valor: parseFloat(document.getElementById(`edit-Fibra_cruda-${id_alimento}`).value) || 0 },
    { id_elemento: 5,  valor: parseFloat(document.getElementById(`edit-Sodio-${id_alimento}`).value) || 0 },
    { id_elemento: 6,  valor: parseFloat(document.getElementById(`edit-Metionina-${id_alimento}`).value) || 0 },
    { id_elemento: 7,  valor: parseFloat(document.getElementById(`edit-Materia_seca-${id_alimento}`).value) || 0 },
    { id_elemento: 8,  valor: parseFloat(document.getElementById(`edit-Extracto_etereo-${id_alimento}`).value) || 0 },
    { id_elemento: 9,  valor: parseFloat(document.getElementById(`edit-Arginina-${id_alimento}`).value) || 0 },
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
function abrirModal(tipo, id) {
    document.getElementById(`modal-${tipo}-${id}`).showModal();
}
function cerrarModal(tipo, id) {
    document.getElementById(`modal-${tipo}-${id}`).close();
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
                alimentos_en_dieta.innerHTML += `
                    <div class="alimentos_dietas">
                        <div class="imagen_alimento_dieta">
                            <img src="${element.imagen}" 
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
            confirmButtonColor: "#f1c40f"
        });
        return;
    }

    fetch(`${URL_BASE}/consulta_indi_alimento/${nombre}`)
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
                        <img src="${element.imagen}" 
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

// //CONFIRMACION DE CONTRASEÑA EN EL APARTADO DE REGISTRO

// function ConfirmarContraseña(event) {
//     event.preventDefault();

//     const contraseña1 = document.getElementById("password").value;
//     const contraseña2 = document.getElementById("confirmPassword").value;
//     const mensaje = document.getElementById("mensaje");

//     if (contraseña1 === contraseña2) {
//         mensaje.textContent = "Registro exitoso. Redirigiendo...";
//         mensaje.classList.add("success");
//         mensaje.classList.remove("alerta");
//         mensaje.style.display = "block";

//         setTimeout(() => {
//             window.location.href = "index.html";
//         }, 1000);

//     } else {
//         mensaje.textContent = "Las contraseñas no coinciden. Por favor, inténtelo de nuevo.";
//         mensaje.classList.add("alerta");
//         mensaje.classList.remove("success");
//         mensaje.style.display = "block";
//         return false;
//     }
// }

//     function ValidarPassword() {
//     let password = document.getElementById("password").value;
//     let confirmpassword = document.getElementById("confirmpassword").value;
//     let mensajerror = document.getElementById("mesajerror");
//     if (password !== confirmpassword){
//         alert ("Contraseña no coinciden")
//         return false

//         alert ("Contraseña correcta")
//         return true
//     }}

