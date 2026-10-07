# OrganJob Pro - Aplicación de Escritorio para Windows

**OrganJob** es una aplicación de escritorio moderna inspirada en el lenguaje de diseño **Windows 11 Fluent UI**, creada para el control integral de trabajos, proyectos, clientes y productividad con técnica Pomodoro integrada.

---

## 🌟 Características Principales

1. **Gestión de Proyectos & Clientes**:
   - Organiza tus proyectos asociándolos a empresas o clientes específicos (o déjalos como proyectos internos).
   - Control de presupuesto de horas estimadas vs. horas reales registradas.
   - Barra de avance según el porcentaje de tareas completadas.
   - Fechas límites, estados (Activo, Pausa, Completado, Archivado) y colores personalizados.

2. **Tareas e Items Detallados (Estilo To-Do Avanzado)**:
   - Prioridades (Alta, Media, Baja).
   - Fechas de entrega y alertas de vencimiento.
   - Subtareas / Checklist con tachado y barra de progreso.
   - Registro de tiempo real acumulado en cada tarea.
   - Botón directo para iniciar un Pomodoro enfocado en una tarea específica.

3. **Pomodoro Timer Integrado**:
   - Modos predefinidos y configurables: **Trabajo** (25 min), **Descanso Corto** (5 min) y **Descanso Largo** (15 min).
   - Mini-widget permanente en la barra superior (puedes navegar por tus proyectos y el tiempo sigue corriendo).
   - Vinculación directa con la tarea que estás realizando: los minutos trabajados se suman automáticamente a la tarea.
   - Sonidos relajantes mediante síntesis Web Audio (sin dependencias de archivos externos).
   - Notificaciones nativas de Windows en el escritorio.
   - Celebración con fuegos artificiales al completar metas.

4. **Panel de Estadísticas & Exportación**:
   - Métricas de horas dedicadas: Hoy, Esta semana y Este mes.
   - Gráficos interactivos de productividad de los últimos 7 días.
   - Distribución de tiempo por Proyecto y por Cliente.
   - Historial de sesiones y exportación a **CSV / Excel** con un clic para facturar horas a clientes.

5. **Privacidad & Almacenamiento 100% Local**:
   - Todos los datos residen en tu computadora (offline).
   - Exportación e importación de copias de seguridad en formato JSON.

6. **Diseño Windows 11 Fluent UI**:
   - Soporte nativo de Tema Oscuro (Dark Mode Mica) y Tema Claro.
   - Transición fluida, tipografía Segoe UI Variable / Inter.

---

## 🚀 Cómo Ejecutar la Aplicación en Modo Desarrollo

```powershell
# 1. Abrir la terminal en la carpeta del proyecto
cd e:\DESARROLLO\ORGANJOB

# 2. Iniciar la interfaz web
npm run dev

# 3. O ejecutarla dentro de la ventana de escritorio Electron (con integración de barra de título nativa)
npm run electron:dev
```

---

## 📦 Empaquetado y Publicación en Microsoft Store

La aplicación está completamente configurada con `electron-builder` para generar los paquetes compatibles con la **Microsoft Store** y para Windows directo.

### 1. Generar instalador para Windows (.exe con NSIS)
```powershell
npm run package:exe
```
El instalador se generará en la carpeta `release/OrganJob Setup 1.0.0.exe`.

### 2. Generar paquete para Microsoft Store (.appx / .msix)
```powershell
npm run package:store
```
El paquete listo para subir al Microsoft Partner Center se generará en la carpeta `release/`.

Para conocer el paso a paso de publicación en el Partner Center de Microsoft, consulta [STORE_GUIDE.md](file:///e:/DESARROLLO/ORGANJOB/STORE_GUIDE.md).
