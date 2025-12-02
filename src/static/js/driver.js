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