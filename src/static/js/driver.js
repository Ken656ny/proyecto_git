function iniciarTourPorcinos() {
    const driver = new Driver({
        showProgress: true,
        allowClose: false,
        overlayOpacity: 0.45,
    });

    // Esperar hasta que exista al menos una fila
    const primeraFila = document.querySelector(".registro");

    if (!primeraFila) {
        Swal.fire("No hay registros", "No hay porcinos cargados para mostrar el tour.", "info");
        return;
    }

    // Los botones dentro de la primera fila
    const btnEye = primeraFila.querySelector(".icon-eye");
    const btnEdit = primeraFila.querySelector(".icon-edit");
    const btnDelete = primeraFila.querySelector(".icon-delete");
    const btnChart = primeraFila.querySelector('.icon-chart')

    driver.defineSteps([
        {
            element: '.icon__back',
            popover: {
                title: 'Volver a Home',
                description: 'Haz clic aquí para regresar al inicio de la aplicación.',
                position: 'right'
            }
        },
        {
            element: '.container__user__btn',
            popover: {
                title: 'Perfil de usuario',
                description: 'Desde aquí podrás acceder a tu perfil y cerrar sesión.',
                position: 'left'
            }
        },
        {
            element: '#container__search__bar',
            popover: {
                title: 'Buscador',
                description: 'Puedes consultar porcinos por ID o usando filtros.',
                position: 'bottom'
            }
        },
        {
            element: '#input_id',
            popover: {
                title: 'Buscar por ID',
                description: 'Ingresa el ID del porcino que deseas consultar.',
                position: 'bottom'
            }
        },
        {
            element: '.container__filtro',
            popover: {
                title: 'Filtros disponibles',
                description: 'Selecciona un filtro (sexo, raza, etapa, peso o estado) para organizar la información.',
                position: 'bottom'
            }
        },
        {
            element: '#btn_consultar',
            popover: {
                title: 'Botón de consulta',
                description: 'Haz clic aquí para aplicar el filtro o buscar un porcino por ID.',
                position: 'bottom'
            }
        },
        {
            element: '#btn_consultar_todo',
            popover: {
                title: 'Botón de consultar todo',
                description: 'Haz clic aquí para consultar todos los porcinos registrados.',
                position: 'bottom'
            }
        },
        {
            element: '.container__btn__options',
            popover: {
                title: 'Opciones de gestión',
                description: 'Estos botones te permiten añadir porcinos, gestionar razas y etapas, y ver el historial de peso.',
                position: 'top'
            }
        },
        {
            element: '.btn--agregar',
            popover: {
                title: 'Agregar porcino',
                description: 'Crea un nuevo registro de porcino.',
                position: 'top'
            }
        },
        {
            element: '#abrir__digraz',
            popover: {
                title: 'Gestionar razas',
                description: 'Aquí puedes añadir, editar o eliminar razas de porcinos.',
                position: 'top'
            }
        },
        {
            element: '#abrir__digeta',
            popover: {
                title: 'Gestionar etapas',
                description: 'Administra las etapas de vida disponibles.',
                position: 'top'
            }
        },
        {
            element: '.btn--options--actua',
            popover: {
                title: 'Historial de peso',
                description: 'Consulta y actualiza el historial de peso de los porcinos.',
                position: 'top'
            }
        },
        {
            element: primeraFila,
            popover: {
                title: 'Fila de un porcino',
                description: 'Cada fila representa un porcino y muestra su información.',
                position: 'top'
            }
        },
        {
            element: btnEye,
            popover: {
                title: 'Ver información',
                description: 'Haz clic para ver todos los datos del porcino.',
                position: 'left'
            }
        },
        {
            element: btnEdit,
            popover: {
                title: 'Editar porcino',
                description: 'Te permite modificar la información del porcino.',
                position: 'left'
            }
        },
        {
            element: btnDelete,
            popover: {
                title: 'Eliminar porcino',
                description: 'Elimina este registro permanentemente. Úsalo con precaución.',
                position: 'left'
            }
        },
        {
            element: btnChart,
            popover: {
                title: 'Grafica de evolución de peso',
                description: 'Muestra una grafica con la evolucion del peso del porcino',
                position: 'left'
            }
        }
    ]);

    driver.start();
}

function iniciarTourAgregarPorcino() {
    const driver = new Driver({
        showProgress: true,
        allowClose: false,
        overlayOpacity: 0.45,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Finalizar'
    });

    driver.defineSteps([
        {
            element: '.icon__back',
            popover: {
                title: 'Volver',
                description: 'Haz clic aquí para regresar a la lista de porcinos.',
                position: 'right'
            }
        },
        {
            element: '.container__title h1',
            popover: {
                title: 'Agregar Porcinos',
                description: 'En esta sección puedes registrar un nuevo porcino en el sistema.',
                position: 'bottom'
            }
        },
        {
            element: '#id_porcino',
            popover: {
                title: 'ID del porcino',
                description: 'Ingresa un identificador único para el porcino.',
                position: 'bottom'
            }
        },
        {
            element: '#peso_inicial',
            popover: {
                title: 'Peso inicial',
                description: 'Introduce el peso inicial del porcino. Este valor se usa para calcular la etapa de vida.',
                position: 'bottom'
            }
        },
        {
            element: '#peso_final',
            popover: {
                title: 'Peso final',
                description: 'Este campo se completa automáticamente con el peso inicial.',
                position: 'bottom'
            }
        },
        {
            element: '#fecha',
            popover: {
                title: 'Fecha de nacimiento',
                description: 'Selecciona la fecha de nacimiento del porcino.',
                position: 'bottom'
            }
        },
        {
            element: '#raza_add',
            popover: {
                title: 'Raza',
                description: 'Selecciona la raza del porcino desde la lista disponible.',
                position: 'bottom'
            }
        },
        {
            element: '#sexo',
            popover: {
                title: 'Sexo',
                description: 'Indica si el porcino es macho o hembra.',
                position: 'bottom'
            }
        },
        {
            element: '#etapa_add',
            popover: {
                title: 'Etapa de vida',
                description: 'Este campo se asigna automáticamente según el peso ingresado.',
                position: 'bottom'
            }
        },
        {
            element: '#descripcion',
            popover: {
                title: 'Descripción',
                description: 'Puedes agregar información adicional u observaciones del porcino.',
                position: 'top'
            }
        },
        {
            element: '.btn--guardar',
            popover: {
                title: 'Agregar porcino',
                description: 'Haz clic aquí para guardar el porcino en el sistema.',
                position: 'top'
            }
        }
    ]);

    driver.start();
}


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
        showProgress: true,
        allowClose: false,
        overlayOpacity: 0.5,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Finalizar'
    });

    driver.defineSteps([
        {
            element: '.logo-edupork',
            popover: {
                title: 'Bienvenido a EduPork',
                description: 'Este es el logo del sistema. Desde aquí reconoces que estás en EduPork.',
                position: 'right'
            }
        },
        {
            element: '.barra-lateral',
            popover: {
                title: 'Menú principal',
                description: 'Este es el menú lateral. Desde aquí puedes acceder a todos los módulos del sistema.',
                position: 'right'
            }
        },
        {
            element: '.ul-navegacion',
            popover: {
                title: 'Opciones de navegación',
                description: 'Usa estas opciones para ir a Porcinos, Alimentos, Dietas, Informes y más.',
                position: 'right'
            }
        },
        {
            element: '.container__user__btn',
            popover: {
                title: 'Perfil de usuario',
                description: 'Aquí puedes ver tu perfil y cerrar sesión.',
                position: 'left'
            }
        },
        {
            element: '.titulo__home h1',
            popover: {
                title: 'Pantalla de inicio',
                description: 'Esta es la página principal de EduPork, donde comienzas a usar el sistema.',
                position: 'bottom'
            }
        },
        {
            element: '.Parrafo__home',
            popover: {
                title: 'Propósito del sistema',
                description: 'Edupork fue creado para ayudarte a aprender y gestionar dietas nutricionales para porcinos.',
                position: 'bottom'
            }
        },
        {
            element: '.PorcinoTwo',
            popover: {
                title: 'Identidad visual',
                description: 'Esta imagen representa el enfoque educativo del sistema.',
                position: 'left'
            }
        },
        
    ]);

    driver.start();
}


function iniciarTourHome() {

    document.body.classList.add('tour-activo');

    const driver = new Driver({
        showProgress: true,
        overlayOpacity: 0.35,
        allowClose: false,
        stageBackground: 'rgba(0, 0, 0, 0.2)', // color del recuadro

        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Finalizar',

        
    });

    driver.defineSteps([
        {
            element: '.logo-edupork',
            popover: {
                title: 'Edupork',
                description: 'Logo de la plataforma.',
                position: 'right'
            }
        },
        {
            element: '.ul-navegacion li:nth-child(1)',
            popover: {
                title: 'Home',
                description: 'Página principal.',
                position: 'right'
            }
        },
        {
            element: '.ul-navegacion li:nth-child(2)',
            popover: {
                title: 'Notificaciones',
                description: 'Alertas del sistema.',
                position: 'right'
            }
        },
        {
            element: '.ul-navegacion li:nth-child(3)',
            popover: {
                title: 'Porcinos',
                description: 'Gestión de porcinos.',
                position: 'right'
            }
        },
        {
            element: '.ul-navegacion li:nth-child(4)',
            popover: {
                title: 'Alimentos',
                description: 'Administración de alimentos.',
                position: 'right'
            }
        },
        {
            element: '.ul-navegacion li:nth-child(5)',
            popover: {
                title: 'Dietas',
                description: 'Gestión de dietas.',
                position: 'right'
            }
        },
        {
            element: '.ul-navegacion li:nth-child(6)',
            popover: {
                title: 'Informes',
                description: 'Reportes y estadísticas.',
                position: 'right'
            }
        },
        {
            element: '.ul-navegacion li:nth-child(7)',
            popover: {
                title: 'Perfil',
                description: 'Información del usuario.',
                position: 'right'
            }
        },
        {
            element: '.ul-navegacion li:nth-child(8)',
            popover: {
                title: 'Configuración',
                description: 'Opciones del sistema.',
                position: 'right'
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
function iniciarTourGestionarDietas() {

    // 1. Lista de elementos requeridos (estáticos)
    const requiredElements = [
        '.container__title',
        '.container__search__bar_alimentos',
        '.input__id',
        '#btn_consultar_todo_historial',
        '#enviar_consulta',
        '.container__btn__agregar',
        '.nuevo1',
        '#paginacion_Dietas',
    ];

    // 2. Validar que existan los elementos base
    for (let sel of requiredElements) {
        if (!document.querySelector(sel)) {
            Swal.fire({
                icon: "warning",
                title: "No se puede iniciar la ayuda",
                text: `No se encontró el elemento: ${sel}`,
            });
            return;
        }
    }

    // 3. Esperar hasta que la tabla tenga filas dinámicas
    const esperarFilas = setInterval(() => {
        const filas = document.querySelectorAll(".table__registros .nuevo1");

        if (filas.length > 0) {
            clearInterval(esperarFilas);

            setTimeout(() => {
                const driver = new Driver({
                    showProgress: true,
                    allowClose: false,
                    overlayOpacity: 0.4
                });

                window.tourGestionarDietas = driver;

                driver.defineSteps([

                    {
                        element: '.container__title',
                        popover: {
                            title: 'Gestionar Dietas',
                            description: 'Aquí puedes consultar, gestionar y administrar todas las dietas del sistema.',
                            position: 'bottom'
                        }
                    },

                    {
                        element: '.container__search__bar_alimentos',
                        popover: {
                            title: 'Buscar Dietas',
                            description: 'Busca dietas por ID o consulta el historial completo.',
                            position: 'bottom'
                        }
                    },

                    {
                        element: '.input__id',
                        popover: {
                            title: 'Buscar por ID',
                            description: 'Escribe el ID específico de la dieta.',
                            position: 'bottom'
                        }
                    },

                    {
                        element: '#btn_consultar_todo_historial',
                        popover: {
                            title: 'Consultar Todo',
                            description: 'Muestra todas las dietas registradas.',
                            position: 'bottom'
                        }
                    },

                    {
                        element: '#enviar_consulta',
                        popover: {
                            title: 'Consulta Individual',
                            description: 'Consulta la dieta según el ID ingresado.',
                            position: 'left'
                        }
                    },

                    {
                        element: '.container__btn__agregar',
                        popover: {
                            title: 'Agregar Nueva Dieta',
                            description: 'Crea una nueva dieta desde cero.',
                            position: 'left'
                        }
                    },

                    {
                        element: '.table__registros',
                        popover: {
                            title: 'Tabla de Dietas',
                            description: 'Aquí ves la lista de dietas con sus detalles.',
                            position: 'top'
                        }
                    },
                    {
                        element: '.nuevo1',
                        popover: {
                            title: 'Dietas',
                            description: 'Datos necearios de la dieta ',
                            position: 'top'
                        }
                    },

                    // 🔥 NUEVO: Acciones dentro de cada fila dinámica
                    {
                        element: '.icon-eye',
                        popover: {
                            title: 'Ver Dieta',
                            description: 'Haz clic aquí para ver los detalles completos.',
                            position: 'left'
                        }
                    },

                    {
                        element: '.icon-edit',
                        popover: {
                            title: 'Editar Dieta',
                            description: 'Modifica la información de una dieta.',
                            position: 'left'
                        }
                    },

                    {
                        element: '.icon-delete',
                        popover: {
                            title: 'Eliminar Dieta',
                            description: 'Elimina una dieta de manera permanente.',
                            position: 'left'
                        }
                    },
                ]);

                driver.start();

            }, 300);

        }
    }, 100); // revisa cada 100ms si ya cargaron las filas
}