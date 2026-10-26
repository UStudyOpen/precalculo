# Precálculo

Sitio web estático multipágina en Quarto para una asignatura de Precálculo. El objetivo es mantener un compendio académico de consulta rápida, con páginas breves para definiciones, ideas centrales, ejemplos mínimos, errores comunes y ejercicios.

## Uso local

Vista previa con recarga automática:

```bash
quarto preview
```

Render completo del sitio:

```bash
quarto render
```

## Publicación

La nueva salida es `_site/`, ignorada por Git. `docs/` mantiene el sitio anterior en `main/docs` mientras se prepara la migración. No cambiar Pages ni retirar `docs/` durante esta etapa; consultar [MIGRATION.md](MIGRATION.md).


## Arquitectura compartida y revisión local

Quarto **1.10.18**, Python **3.14.8** y Node **24.21.0** en CI. No se instalan paquetes npm ni Python para compilar. El diseño usa una instantánea local **0.3.0**, con correcciones visuales 0.2 preservadas y archivos fijados por SHA-256. Los manifiestos de diseño y plataforma permiten verificar exactamente qué se instala. Las instrucciones previas sobre el piloto son históricas; la integración actual genera exclusivamente `_site/`.

```sh
python3 tests/render_clean.py
python3 tests/run_course.py
python3 tests/platform_validate.py
quarto preview --host 127.0.0.1
```

`tests/run_course.py` ejecuta las pruebas particulares disponibles. En IA y Precálculo incluye actividades reales mediante Chrome/Chromium con sandbox y Node WebSocket, sin paquetes; puede configurarse `BROWSER_EXECUTABLE`. Se usa un perfil desechable y servidor exclusivo en loopback. El render aislado conserva el `_site/` anterior si falla. Para examinar exactamente el artefacto generado sin volver a compilar: `python3 -m http.server 8761 --bind 127.0.0.1 --directory _site` y abrir `http://127.0.0.1:8761/`.

Los estados `lista`, `en-desarrollo` y `proximamente` se declaran en metadatos de página y en `course.yml` (JSON válido como YAML). El temario registra todas las páginas actuales y los temas futuros que ya estaban anunciados, cuando existen. No se inventa un programa institucional. `reference_code: null` significa que no se verificó un código oficial. No se marca revisión académica automáticamente. Para agregar una página: conservar las rutas existentes, declarar sus metadatos, agregarla al registro, al render y a la navegación, y revisar sus recursos; no crear secciones vacías. Los manifiestos de integridad se actualizan únicamente con revisión humana del contenido.

Para actualizar el sistema compartido: desde `../ustudyopen-design`, ejecutar `python3 tooling/sync_course.py ../precalculo`, revisar ambos manifiestos y diferencias y repetir las pruebas y comparaciones visuales. No editar copias vendor. La plantilla solo inicia cursos nuevos; no migra los existentes.

Los workflows están preparados y no se activan por push. La publicación requiere autorización, protección de `main`, revisión del entorno `github-pages`, variable de activación y confirmación manual. [MIGRATION.md](MIGRATION.md) registra la situación remota verificada, los pasos exactos de activación posterior y la reversión. No se han realizado commits, pushes, tags, releases ni despliegues.

## Licencias

Véanse [alcance](LICENSING.md) y [avisos de terceros](THIRD-PARTY-NOTICES.md).
