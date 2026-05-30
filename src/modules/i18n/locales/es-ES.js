export default {
  welcome: {
  title: "Bienvenido a Suger DevTool",
  subtitle: "Seleccione su idioma preferido para continuar.",
  select_language: "Seleccionar idioma",
  continue: "Continuar",
  already_logged_in: "Ya he iniciado sesión",
},

activation: {
  title: "Introducir clave del producto",
  subtitle: "Ingrese su correo electrónico y clave del producto para desbloquear las funciones premium.",
  label_email: "CORREO",
  label_key: "CLAVE DEL PRODUCTO",
  placeholder_email: "name@example.com",
  no_key: "¿No tiene una clave?",
  get_key_link: "Obtener clave desde el sitio web",
  contact_support: "Contactar soporte",
  btn_cancel: "Cancelar",
  btn_next: "Siguiente",
  btn_back: "Atrás",
  btn_activate: "Activar",
  error: "Error de activación",
  success: "¡Éxito!",
  verifying: "Verificando...",
  connecting: "Conectando al servidor de licencias..."
},

license: {
  title: "Acuerdo de licencia",
  agree_checkbox: "Acepto los términos y condiciones",
  content: `
    <h3>Acuerdo de Licencia de Suger DevTool</h3>
    <p><strong>IMPORTANTE: LEA CON ATENCIÓN</strong></p>
    <p>Este EULA es un acuerdo legal entre usted y Suger DevTool.</p>

    <p><strong>1. CONCESIÓN DE LICENCIA</strong><br>
    Suger DevTool le otorga una licencia limitada, no exclusiva, no transferible y revocable para usar el software.</p>

    <p><strong>2. RESTRICCIONES</strong><br>
    Usted acepta no descompilar, desensamblar ni crear trabajos derivados del software.</p>

    <p><strong>3. TERMINACIÓN</strong><br>
    Esta licencia terminará automáticamente si incumple cualquier término.</p>

    <p>Al hacer clic en "Activar", usted acepta los términos del acuerdo.</p>
  `
},
  common: {
    loading: "Cargando...",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    refresh: "Actualizar",
    clear: "Limpiar",
    filter: "Filtrar",
    close: "Cerrar",
    origin: "Origen",
    key: "Clave",
    value: "Valor",
    domain: "Dominio",
    path: "Ruta",
    expires: "Expira",
    size: "Tamaño",
    httpOnly: "HttpOnly",
    secure: "Secure",
    sameSite: "SameSite",
    priority: "Prioridad",
    yes: "Sí",
    no: "No"
  },
  tabs: {
    elements: "Elementos",
    console: "Consola",
    network: "Red",
    source: "Fuentes",
    application: "Aplicación",
    settings: "Ajustes"
  },
  dom_action: {
  add_attr: "Agregar atributo",
  edit_html: "Editar como HTML",
  duplicate: "Duplicar elemento",
  cut: "Cortar",
  copy: "Copiar",
  copy_ele: "Copiar elemento",
  copy_html: "Copiar outerHTML",
  delete: "Eliminar",
  del_ele: "Eliminar elemento",
  del_child: "Eliminar hijos",
  del_attr: "Eliminar atributos",
  show: "Mostrar elemento",
  hide: "Ocultar elemento",
  focus: "Enfocar",
  collapse: "Colapsar hijos"
},
monitor: {
  title: "Monitor de rendimiento",
  cpu_usage: "Uso de CPU",
  js_heap_size: "Tamaño del heap JS",
  dom_nodes: "Nodos DOM",
  js_event_listeners: "Escuchadores de eventos JS",
  frames_per_sec: "Fotogramas por segundo"
},
  settings: {
    title: "Ajustes",
    preferences: "Preferencias",
    shortcuts: "Atajos",
    experiments: "Experimentos",
    about: "Acerca de",
    appearance: "Apariencia",
    language: "Idioma",
    theme: "Tema de DevTools",
    themes: {
      light: "Claro",
      dark: "Oscuro",
      system: "Sistema"
    },
    editorTheme: "Tema del Editor",
    editorThemes: {
      auto: "Auto (Igual a DevTools)",
      default: "Predeterminado (Blanco)",
      eclipse: "Eclipse",
      neo: "Neo",
      monokai: "Monokai",
      dracula: "Drácula",
      material: "Material"
    },
    panelLayout: "Diseño del panel",
    layouts: {
      horizontal: "Horizontal",
      vertical: "Vertical",
      auto: "Auto"
    },
    reload_hint: "(Requiere recargar)",
    no_virtualization_warning: "(Al habilitar el ajuste de línea se desactiva la virtualización. Puede experimentar lentitud en proyectos grandes.)",

    shortcuts_hint: "Use Ctrl + 1-9 para cambiar paneles",
    sources_section: "Fuentes",
    source_maps: "Habilitar mapas de origen JS",
    indentation: "Detectar indentación",
    network_section: "Red",
    disable_cache: "Deshabilitar caché (mientras DevTools está abierto)",
    general: "General",
    open_settings: "Abrir Ajustes",
    next_panel: "Siguiente Panel",
    coming_soon: "Próximamente...",
    about_text: "MyDevTool v1.0 - Una herramienta ligera para web móvil.",
    inspect_section: "Inspeccionar",
    hide_while_inspecting: "Ocultar DevTool mientras se inspecciona",
    collapse_mode: "Acción de colapso",
    collapse_modes: {
      float: "Botón flotante (Burbuja)",
      minimize: "Minimizar panel (solo encabezado)"
    },
    license_management: "Gestión de Licencia",
current_key: "Clave actual: ****-****-****-{last4}",
deactivate_btn: "Desactivar y Cerrar sesión",
deactivate_confirm: "¿Seguro? Esto desactivará la licencia en este dispositivo." ,

pref_elements: {
  title: "Panel de Elements",
  panel_layout: "Diseño del panel",
  sub_tab_layout: "Diseño de subpestañas",
  layout_vertical: "Vertical (lado a lado)",
  layout_horizontal: "Horizontal (apilado)",
  show_styles: "Mostrar Styles en la pestaña principal",
  show_computed: "Mostrar Computed en la pestaña principal",
  show_layout: "Mostrar Layout en la pestaña principal",
  console_label: "Consola",
  show_main: "Mostrar en la pestaña principal",
  dom_appearance: "Apariencia del árbol DOM",
  show_comments: "Mostrar comentarios HTML ()",
  show_shadow: "Mostrar User Agent Shadow DOM",
  show_rulers: "Mostrar guías de indentación",
  highlight_updates: "Resaltar actualizaciones del DOM (parpadeo)",
  computed_box_model: "Computed y Box Model",
  highlight_hover: "Resaltar elemento al pasar por Box Model",
  show_tooltip: "Mostrar tooltip al pasar por Box",
  show_zero: "Mostrar valores '0' en Box Model",
  element_badges: "Insignias de elementos"
},
pref_inspect: {
  tooltip_title: "Tooltip del Inspector",
  enable_tooltip: "Mostrar tooltip al inspeccionar",
  show_hierarchy: "Mostrar jerarquía padre",
  show_dims: "Mostrar dimensiones",
  show_color: "Mostrar información de color y fuente",
  show_box_model: "Mostrar valores de Margin/Padding",
  show_extra: "Mostrar detalles extra (A11y, Contraste)",
  overlay_title: "Superposición de resaltado",
  show_margin: "Mostrar Margin (Naranja)",
  show_padding: "Mostrar Padding (Verde)",
  show_border: "Mostrar Border (Amarillo)"
},
about_section: {
  build_status_label: "Estado actual de compilación:",
  build_status_text: "Esta es la versión estable inicial (v1.0). Aunque las funciones principales están rigurosamente probadas, pueden existir casos menores de ejecución. Nuestro equipo de ingeniería sigue implementando parches de estabilidad y mejoras de rendimiento.",
  copyright: "© 2026 Suger DevTool. Todos los derechos reservados.",
  tagline: "Diseñado en India • Desarrollado globalmente"
},

pref_styles: {
  title: "Styles",
  editing_behavior: "Comportamiento de edición",
  edit_single_click: "Editar regla con un solo clic",
  single_click_hint: "Habilitar edición con un clic en lugar de doble clic/doble toque",
  display_options: "Opciones de visualización",
  show_user_agent: "Mostrar estilos del user agent",
  autocomplete: "Autocompletar",
  show_suggestions: "Mostrar sugerencias",
  max_suggestions: "Máximo de sugerencias",
  suggestions_hint: "Valores más altos pueden afectar el rendimiento"
},



  },
  application: {
    dashboard: "Almacenamiento",
    manifest: "Manifiesto",
    service_workers: "Service Workers",
    local_storage: "Almacenamiento Local",
    session_storage: "Almacenamiento de Sesión",
    indexed_db: "IndexedDB",
    cookies: "Cookies",
    cache: "Caché",
    cache_storage: "Almacenamiento Caché",
    storage_title: "Almacenamiento",
    usage_title: "Uso",
    usage_text: "{used} MB usados de {quota} MB de cuota",
    total_usage: "Uso Total",
    clear_site_data: "Borrar datos del sitio",
    inc_third_party: "incluyendo cookies de terceros",
    clear_options: {
      app: "Aplicación",
      unregister_sw: "Desregistrar service workers",
      storage: "Almacenamiento",
      ls_ss: "Local y Sesión",
      idb: "IndexedDB",
      websql: "Web SQL",
      cookies: "Cookies",
      cache: "Caché",
      cache_storage: "Almacenamiento Caché"
    },
    empty_view: "Seleccione un origen para ver datos.",
    empty_idb: "Seleccione un Object Store para ver datos.",
    no_manifest: "No se detectó manifiesto",
    no_manifest_desc: "No se encontró manifest.json en esta página.",
    no_sw: "No se detectaron Service Workers",
    identity: "Identidad",
    presentation: "Presentación",
    icons: "Iconos",
    no_icons: "No se encontraron iconos",
    view_raw: "Ver JSON sin formato",
    sw_offline: "Desconectado",
    sw_update_reload: "Actualizar al recargar",
    sw_status: "Estado",
    sw_running: "corriendo",
    sw_stopped: "detenido",
    sw_clients: "Clientes",
    sw_view_clients: "Ver clientes",
    update: "Actualizar",
    unregister: "Desregistrar",
    clear_all_confirm: "¿Borrar todo?",
    clear_cookies_confirm: "¿Borrar cookies?",
    delete_cache_confirm: "¿Borrar caché?",
    unregister_sw_confirm: "¿Desregistrar este Service Worker?"
  },
  elements: {
    styles: "Estilos",
    computed: "Computado",
    layout: "Diseño",
    filter_placeholder: "Filtrar",
    show_all: "Mostrar todo",
    group: "Agrupar",
    box_model: {
      margin: "Margen",
      border: "Borde",
      padding: "Relleno",
      tooltip: "información",
      tooltip_title: "Mostrar información al pasar el mouse"
    },
    groups: {
      other: "Otros"
    },
    no_css_data: "Error: Módulo CSSData.js no cargado."
  },
  styles: {
    filter_placeholder: "Filtrar",
    toggle_element_state: "Alternar estado del elemento",
    element_classes: "Clases del elemento",
    new_style_rule: "Nueva regla de estilo",
    force_element_state: "Forzar estado",
    add_new_class: "Añadir nueva clase",
    no_classes_found: "No se encontraron clases.",
    inherited_from: "Heredado de",
    pseudo_element: "Pseudo elemento ::{type}",
    user_agent_stylesheet: "hoja de estilos del agente",
    inspector_stylesheet: "hoja de estilos del inspector",
    element_style: "estilo del elemento",
    add_new_property: "Añadir propiedad",
    copy_selector: "Copiar selector",
    copy_declaration: "Copiar declaración",
    copy_property: "Copiar propiedad",
    copy_value: "Copiar valor",
    copy_rule: "Copiar regla",
    copy_declaration_js: "Copiar declaración como JS",
    copy_all_declarations: "Copiar todas las declaraciones",
    copy_all_declarations_js: "Copiar todo como JS"
  },
  console: {
    toolbar: {
      sidebar_toggle: "Mostrar/Ocultar barra lateral",
      clear_console: "Limpiar consola (Ctrl+L)",
      toggle_expressions: "Alternar expresiones",
      filter_placeholder: "Filtrar",
      settings: "Ajustes de consola"
    },
    sidebar: {
      all_messages: "Todos",
      user_messages: "Usuario",
      errors: "Errores",
      warnings: "Advertencias",
      info: "Info",
      verbose: "Verbosidad",
      globals: "Globales"
    },
    expression: {
      placeholder: "Evaluar expresión (Enter)",
      close: "Cerrar"
    },
    settings: {
      preserve_log: "Conservar registro",
      log_xhr: "Registrar XHR / fetch",
      eager_eval: "Evaluación ansiosa (vista previa)",
      autocomplete: "Autocompletar desde historial",
      treat_eval_user: "Evaluar como acción de usuario",
      selected_context: "Solo contexto seleccionado",
      group_similar: "Agrupar similares",
      show_cors: "Mostrar errores CORS"
    },
    messages: {
      globals_header: "=== Variables Globales Sandbox ===",
      error_reading: "[Error al leer valor]",
      listing_unavailable: "Listado global no disponible",
      error_listing: "Error al listar globales: {error}",
      illegal_return: "Error de sintaxis: Sentencia return ilegal",
      failed_resource: "Fallo al cargar recurso: {url}",
      unknown_resource: "recurso desconocido",
      unhandled_rejection: "Promesa rechazada no manejada: "
    }
  },
  source: {
    xhr_breakpoints: "Puntos de interrupción XHR/fetch",
    event_listener_breakpoints: "Puntos de interrupción de eventos",
    no_breakpoints: "Sin puntos de interrupción",
    page: "Página",
    filesystem: "Archivos",
    overrides: "Anulaciones",
    not_implemented: "No implementado",
    select_file: "Seleccione un archivo",
    open_file_hint: "Ctrl+P → Abrir archivo",
    run_command_hint: "Ctrl+Shift+P → Ejecutar comando",
    run_script: "Ejecutar script actual",
    pause_resume: "Pausar/Reanudar",
    step_over: "Saltar",
    step_into: "Entrar",
    step_out: "Salir",
    instrumentation_enable: "Habilitar instrumentación (Recarga requerida)",
    instrumentation_enabled_msg: "Instrumentación habilitada. Clic para deshabilitar.",
    instrumentation_disabled_msg: "Instrumentación deshabilitada. Clic para habilitar.",
    call_stack: "Pila de llamadas",
    not_paused: "No pausado",
    dom_breakpoints: "Puntos de interrupción DOM",
    scope: "Ámbito",
    watch: "Vigilancia",
    add_expression: "Añadir expresión...",
    no_watch_expr: "Sin expresiones",
    not_available: "(no disponible)",
    not_defined: "<no definido>",
    undefined: "undefined",
    null: "null",
    add: "Añadir",
    refresh: "Actualizar",
    empty: "(vacío)",
    paused: "Pausado en depurador",
    resume: "Reanudar (F8)",
    uncaught_ex: "Pausar en excepciones no capturadas",
    caught_ex: "Pausar en excepciones capturadas",
    url_contains: "URL contiene...",
    remove_bp: "Eliminar punto",
    no_file_open: "Ningún archivo abierto.",
    only_js: "Solo archivos .js",
    failed_fetch: "Fallo al obtener",
    enabled_reload: "✅ ¡Habilitado! Recargando...",
    disabled_reload: "❌ Deshabilitado. Recargando...",
    sw_manager_missing: "¡SWManager no cargado!"
  },
  network: {
    filter_placeholder: "Filtrar",
    record_btn: "Grabar registro de red (Ctrl+E)",
    stop_record_btn: "Detener grabación (Ctrl+E)",
    clear_btn: "Limpiar",
    toggle_filter: "Mostrar barra de filtros",
    preserve_log: "Conservar registro",
    disable_cache: "Deshabilitar caché",
    disable_cache_hint: "Deshabilitar caché del navegador",
    invert: "Invertir",
    hide_data_urls: "Ocultar Data URLs",
    show_waterfall: "Mostrar cascada",
    settings: "Ajustes de red",
    overview_title: "Línea de tiempo (Arrastrar para filtrar)",
    filters: {
      all: "Todo",
      xhr: "Fetch/XHR",
      js: "JS",
      css: "CSS",
      img: "Img",
      media: "Media",
      font: "Fuente",
      doc: "Doc",
      ws: "WS",
      other: "Otro",
      blocked_cookies: "Cookies bloqueadas",
      blocked_requests: "Solicitudes bloqueadas",
      third_party: "Terceros"
    },
    empty_msg: {
      not_recording: "Grabe el registro de red (Ctrl+E) para ver actividad.",
      recording: "Grabando actividad de red...",
      recording_desc: "Realice una solicitud o presione <code>Ctrl+R</code> para recargar."
    },
    columns: {
      name: "Nombre",
      status: "Estado",
      type: "Tipo",
      initiator: "Iniciador",
      size: "Tamaño",
      time: "Tiempo",
      timeline: "Línea de tiempo"
    },
    footer: {
      requests: "{count} solicitudes",
      transferred: "{size} MB transferidos",
      finish: "Finalizado: {time} s",
      requests_filtered: "{shown} de {total} solicitudes"
    },
    settings_popup: {
      large_rows: "Usar filas grandes",
      group_frame: "Agrupar por marco",
      show_overview: "Mostrar resumen",
      capture_screenshots: "Capturar pantallas"
    },
    interceptor: {
      fetch_failed: "Fallo Fetch:",
      xhr_failed: "Fallo XHR:",
      xhr_error: "Error XHR",
      xhr_request_failed: "Solicitud XHR fallida",
      pausing_fetch: "🛑 Pausando en fetch:",
      pausing_xhr: "🛑 Pausando en XHR:",
      body_read_error: "[No se pudo leer el cuerpo]"
    }
  },
  network_details: {
  tabs: {
    headers: "Encabezados",
    preview: "Vista previa",
    response: "Respuesta",
    timing: "Tiempos"
  },
  sections: {
    general: "General",
    response_headers: "Encabezados de respuesta",
    request_headers: "Encabezados de solicitud",
    request_payload: "Carga de solicitud"
  },
  general: {
    request_url: "URL de solicitud",
    request_method: "Método de solicitud",
    status_code: "Código de estado",
    referrer_policy: "Política de referencia"
  },
  timing: {
    start_time: "Hora de inicio",
    dns_lookup: "Búsqueda DNS",
    tcp_connect: "Conexión TCP",
    ssl: "SSL",
    ttfb: "Espera (TTFB)",
    content_download: "Descarga de contenido",
    total: "Duración total"
  },
  messages: {
    loading: "Cargando contenido...",
    no_content: "No hay contenido disponible",
    failed_load: "Error al cargar contenido: {error}",
    empty: "(Vacío)",
    no_headers: "No se encontraron encabezados",
    binary_data: "Datos binarios o FormData",
    timing_unavailable: "Los tiempos no están disponibles para esta solicitud.",
    show_more: "Mostrar más ({remaining} KB restantes)"
  }
},
  inspector: {
    color: "Color",
    font: "Fuente",
    margin: "Margen",
    accessibility: "Accesibilidad",
    name: "Nombre",
    role: "Rol",
    focus: "Foco",
    btn_missing: "Inspector: Botón no encontrado"
  },
  layout: {
    page: "Página",
refresh_page: "Actualizar página",
design_mode: "Hacer la página editable",

  grid: "Grid",
  flexbox: "Flexbox",
  overlay_settings: "Configuración de superposición",
  show_line_numbers: "Mostrar números de línea",
  show_track_sizes: "Mostrar tamaños de pista",
  show_area_names: "Mostrar nombres de área",
  extend_grid_lines: "Extender líneas del grid",
  grid_overlays: "Superposiciones de Grid",
  flex_overlays: "Superposiciones de Flexbox",
  no_grid: "No se encontraron elementos Grid",
  no_flex: "No se encontraron elementos Flexbox"
},
};