sistema de alimentacion que permita crear, modificar, consultar y eliminar alimentos y dietas destinados a porcinos dependiendo su etapa de vida, cada etapa de vida requiere unos requerimientos nutricionales los cuales se verana saciados por las dietas

![Build Status](https://img.shields.io/github/actions/workflow/status/usuario/repositorio/ci.yml)

graph TD
  A[Inicio] --> B[Gestionar Alimentos]
  A --> C[Gestionar Dietas]
  B --> D[Crear/Editar/Eliminar Alimento]
  C --> E[Asignar Dietas por Etapa de Vida]
  E --> F[Verificar Requerimientos Cubiertos]
