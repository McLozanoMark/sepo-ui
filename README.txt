SEPO - Arquitectura interna con mini framework

Estructura:
- css/styles.css
- js/core/framework.js
- js/core/router.js
- js/core/ui.js
- js/components/accordion.js
- js/components/typeahead.js
- js/components/switch.js
- js/modules/bootstrap.js
- js/legacy/app.legacy.js

Nota:
Se mantuvo la lógica original en js/legacy/app.legacy.js para no romper la demo.
El mini framework interno queda listo para migrar funciones poco a poco.


Correcciones aplicadas:
- Reconexión del buscador de fichas asociadas.
- Restauración del selector Tipo de Viñeta en pregunta abierta.
- Sincronización visual de Nº Columnas para vista Tabla.
- Re-inicialización de acordeón y switches en modales y cambios dinámicos.
