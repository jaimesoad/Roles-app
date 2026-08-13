# Origen de datos

Esta carpeta es la única API de datos que utiliza la interfaz.

## Cambiar el entorno de Dataverse

Si el entorno nuevo conserva el mismo esquema, vuelve a generar `src/generated`
y actualiza `power.config.json`. No es necesario modificar componentes.

## Cambiar el esquema o proveedor

1. Crea un adaptador que devuelva los tipos normalizados de `types.ts`.
2. Implementa las mismas funciones públicas que expone el adaptador actual.
3. Cambia únicamente el export del adaptador en `index.ts`.

Los nombres lógicos de Dataverse (`cre2b_*`), filtros OData y modelos generados
deben permanecer dentro del adaptador. Nunca deben importarse desde componentes,
`App.svelte` o archivos de dominio.
