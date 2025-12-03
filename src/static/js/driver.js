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
