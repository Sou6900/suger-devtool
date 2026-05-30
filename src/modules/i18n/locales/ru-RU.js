export default {
  welcome: {
  title: "Добро пожаловать в Suger DevTool",
  subtitle: "Выберите предпочтительный язык для продолжения.",
  select_language: "Выбрать язык",
  continue: "Продолжить",
  already_logged_in: "Я уже вошёл в систему",

},

activation: {
  title: "Введите ключ продукта",
  subtitle: "Введите ваш email и ключ продукта, чтобы разблокировать премиум-функции.",
  label_email: "EMAIL",
  label_key: "КЛЮЧ ПРОДУКТА",
  placeholder_email: "name@example.com",
  no_key: "Нет ключа?",
  get_key_link: "Получить ключ на сайте",
  contact_support: "Связаться с поддержкой",
  btn_cancel: "Отмена",
  btn_next: "Далее",
  btn_back: "Назад",
  btn_activate: "Активировать",
  error: "Ошибка активации",
  success: "Успешно!",
  verifying: "Проверка...",
  connecting: "Подключение к серверу лицензий..."
},

license: {
  title: "Лицензионное соглашение",
  agree_checkbox: "Я принимаю условия соглашения",
  content: `
    <h3>Лицензионное соглашение Suger DevTool</h3>
    <p><strong>ВАЖНО: ПРОЧИТАЙТЕ ВНИМАТЕЛЬНО</strong></p>
    <p>Это EULA является юридическим соглашением между вами и Suger DevTool.</p>

    <p><strong>1. ПРЕДОСТАВЛЕНИЕ ЛИЦЕНЗИИ</strong><br>
    Вам предоставляется ограниченная, отменяемая, неисключительная лицензия.</p>

    <p><strong>2. ОГРАНИЧЕНИЯ</strong><br>
    Запрещается декомпилировать, разбирать или модифицировать ПО.</p>

    <p><strong>3. ПРЕКРАЩЕНИЕ</strong><br>
    Лицензия прекращается автоматически при нарушении условий.</p>

    <p>Нажимая «Активировать», вы соглашаетесь с условиями.</p>
  `
},

  common: {
    loading: "Загрузка...",
    cancel: "Отмена",
    save: "Сохранить",
    delete: "Удалить",
    refresh: "Обновить",
    clear: "Очистить",
    close: "Закрыть",
    filter: "Фильтр",
    origin: "Источник",
    key: "Ключ",
    value: "Значение",
    domain: "Домен",
    path: "Путь",
    expires: "Истекает / Max-Age",
    size: "Размер",
    httpOnly: "HttpOnly",
    secure: "Secure",
    sameSite: "SameSite",
    priority: "Приоритет",
    yes: "Да",
    no: "Нет"
  },
  tabs: {
    elements: "Элементы",
    console: "Консоль",
    network: "Сеть",
    source: "Источники",
    application: "Приложение",
    settings: "Настройки"
},
dom_action: {
  add_attr: "Добавить атрибут",
  edit_html: "Редактировать как HTML",
  duplicate: "Дублировать элемент",
  cut: "Вырезать",
  copy: "Копировать",
  copy_ele: "Копировать элемент",
  copy_html: "Копировать outerHTML",
  delete: "Удалить",
  del_ele: "Удалить элемент",
  del_child: "Удалить дочерние элементы",
  del_attr: "Удалить атрибуты",
  show: "Показать элемент",
  hide: "Скрыть элемент",
  focus: "Фокус",
  collapse: "Свернуть дочерние элементы"
},
  settings: {
    title: "Настройки",
    preferences: "Предпочтения",
    shortcuts: "Горячие клавиши",
    experiments: "Эксперименты",
    about: "О программе",
    appearance: "Внешний вид",
    language: "Язык",
    theme: "Тема DevTools",
    editorTheme: "Тема редактора",
    panelLayout: "Расположение панелей",
    reload_hint: "(требуется перезагрузка)",
    no_virtualization_warning: "(Включение переноса строк отключает виртуализацию. В больших проектах возможны задержки.)",

    shortcuts_hint: "Ctrl + 1-9 — переключение панелей",
    sources_section: "Источники",
    source_maps: "Включить source maps JavaScript",
    indentation: "Авто-определение отступов",
    network_section: "Сеть",
    disable_cache: "Отключить кэш (когда DevTools открыт)",
    general: "Общие",
    open_settings: "Открыть настройки",
    next_panel: "Следующая панель",
    navigate_tree: "Навигация по дереву",
    expand_collapse: "Развернуть / Свернуть",
    edit_attr: "Редактировать атрибут",
    inspect_section: "Инспекция",
    hide_while_inspecting: "Скрывать DevTool во время инспекции",
    collapse_mode: "Действие сворачивания",
    collapse_modes: {
      float: "Плавающая кнопка (Пузырь)",
      minimize: "Минимизировать панель (только заголовок)"
    },
    license_management: "Управление лицензией",
    current_key: "Текущий ключ: ****-****-****-{last4}",
    deactivate_btn: "Деактивировать и выйти",
    deactivate_confirm: "Вы уверены? Лицензия на этом устройстве будет деактивирована.",
    about_section: {
  build_status_label: "Текущий статус сборки:",
  build_status_text: "Это начальный стабильный релиз (v1.0). Основные функции тщательно протестированы, однако могут сохраняться небольшие пограничные случаи. Наша команда инженеров активно выпускает обновления для повышения стабильности и оптимизации производительности.",  
  copyright: "© 2026 Suger DevTool. Все права защищены.",
  tagline: "Разработано в Индии • Создано по всему миру",
},
pref_styles: {
  title: "Styles",
  editing_behavior: "Поведение редактирования",
  edit_single_click: "Редактировать правило одним кликом",
  single_click_hint: "Включить редактирование одним кликом вместо двойного клика/двойного касания",
  display_options: "Параметры отображения",
  show_user_agent: "Показывать стили user agent",
  autocomplete: "Автодополнение",
  show_suggestions: "Показывать подсказки",
  max_suggestions: "Максимум подсказок",
  suggestions_hint: "Более высокие значения могут повлиять на производительность"
},

pref_elements: {
  title: "Панель Elements",
  panel_layout: "Макет панели",
  sub_tab_layout: "Макет под-вкладок",
  layout_vertical: "Вертикально (рядом)",
  layout_horizontal: "Горизонтально (стек)",
  show_styles: "Показывать Styles на главной вкладке",
  show_computed: "Показывать Computed на главной вкладке",
  show_layout: "Показывать Layout на главной вкладке",
  console_label: "Консоль",
  show_main: "Показывать на главной вкладке",
  dom_appearance: "Вид дерева DOM",
  show_comments: "Показывать HTML-комментарии ()",
  show_shadow: "Показывать User Agent Shadow DOM",
  show_rulers: "Показывать направляющие отступов",
  highlight_updates: "Подсвечивать обновления DOM (мигание)",
  computed_box_model: "Computed и Box Model",
  highlight_hover: "Подсвечивать элемент при наведении на Box Model",
  show_tooltip: "Показывать подсказку при наведении на Box",
  show_zero: "Показывать значения '0' в Box Model",
  element_badges: "Бейджи элементов"
 },
 pref_inspect: {
  tooltip_title: "Подсказка инспектора",
  enable_tooltip: "Показывать подсказку при инспекции",
  show_hierarchy: "Показывать иерархию родителей",
  show_dims: "Показывать размеры",
  show_color: "Показывать информацию о цвете и шрифте",
  show_box_model: "Показывать значения Margin/Padding",
  show_extra: "Показывать дополнительные детали (A11y, Контраст)",
  overlay_title: "Подсветка оверлея",
  show_margin: "Показывать Margin (Оранжевый)",
  show_padding: "Показывать Padding (Зелёный)",
  show_border: "Показывать Border (Жёлтый)"
},

},
  monitor: {
  title: "Монитор производительности",
  cpu_usage: "Использование CPU",
  js_heap_size: "Размер кучи JS",
  dom_nodes: "DOM-узлы",
  js_event_listeners: "Обработчики событий JS",
  frames_per_sec: "Кадров в секунду"
},
  application: {
    dashboard: "Хранилище",
    manifest: "Манифест",
    service_workers: "Service Workers",
    local_storage: "Local Storage",
    session_storage: "Session Storage",
    indexed_db: "IndexedDB",
    cookies: "Cookies",
    cache: "Кэш",
    cache_storage: "Cache Storage",
    storage_title: "Хранилище",
    usage_title: "Использование",
    usage_text: "Использовано {used} MB из {quota} MB",
    total_usage: "Общий объём",
    clear_site_data: "Очистить данные сайта",
    inc_third_party: "включая сторонние cookie",
    clear_options: {
      app: "Приложение",
      unregister_sw: "Удалить регистрацию service worker",
      storage: "Хранилище",
      ls_ss: "Local / Session Storage",
      idb: "IndexedDB",
      websql: "Web SQL",
      cookies: "Cookies",
      cache: "Кэш",
      cache_storage: "Cache Storage"
    },
    empty_view: "Выберите источник для просмотра данных.",
    empty_idb: "Выберите Object Store.",
    no_manifest: "Манифест не найден",
    no_manifest_desc: "На странице отсутствует файл manifest.json.",
    no_sw: "Service Workers не обнаружены",
    identity: "Идентификация",
    presentation: "Представление",
    icons: "Иконки",
    no_icons: "Иконки не найдены",
    view_raw: "Просмотр сырого JSON",
    sw_offline: "Оффлайн",
    sw_update_reload: "Обновлять при перезагрузке",
    sw_status: "Статус",
    sw_running: "работает",
    sw_stopped: "остановлен",
    sw_clients: "Клиенты",
    sw_view_clients: "Просмотр клиентов",
    update: "Обновить",
    unregister: "Удалить регистрацию",
    clear_all_confirm: "Очистить всё?",
    clear_cookies_confirm: "Удалить cookie?",
    delete_cache_confirm: "Удалить кэш?",
    unregister_sw_confirm: "Удалить регистрацию этого Service Worker?"
  },

  elements: {
    styles: "Styles",
    computed: "Computed",
    layout: "Макет",
    filter_placeholder: "Фильтр",
    show_all: "Показать все",
    group: "Группа",
    box_model: {
      margin: "Margin",
      border: "Border",
      padding: "Padding",
      tooltip: "подсказка",
      tooltip_title: "Показывать инспектор-подсказку при наведении/клике"
    },
    groups: {
      other: "Другое"
    },
    no_css_data: "Ошибка: модуль CSSData.js не загружен."
  },

  styles: {
    filter_placeholder: "Фильтр",
    toggle_element_state: "Переключить состояние элемента",
    element_classes: "Классы элемента",
    new_style_rule: "Новое правило",
    force_element_state: "Принудительное состояние",
    add_new_class: "Добавить класс",
    no_classes_found: "Классов не найдено.",
    inherited_from: "Наследовано от",
    pseudo_element: "Псевдоэлемент ::{type}",
    user_agent_stylesheet: "стили браузера",
    inspector_stylesheet: "inspector-stylesheet",
    element_style: "element.style",
    add_new_property: "Добавить свойство",

    // Context Menu
    copy_selector: "Копировать селектор",
    copy_declaration: "Копировать декларацию",
    copy_property: "Копировать свойство",
    copy_value: "Копировать значение",
    copy_rule: "Копировать правило",
    copy_declaration_js: "Копировать как JS",
    copy_all_declarations: "Копировать все декларации",
    copy_all_declarations_js: "Копировать все декларации как JS"
  },

  console: {
    toolbar: {
      sidebar_toggle: "Показать/скрыть боковую панель",
      clear_console: "Очистить консоль (Ctrl+L)",
      toggle_expressions: "Переключить выражения",
      filter_placeholder: "Фильтр",
      settings: "Настройки консоли"
    },
    sidebar: {
      all_messages: "Все сообщения",
      user_messages: "Сообщения пользователя",
      errors: "Ошибки",
      warnings: "Предупреждения",
      info: "Информация",
      verbose: "Подробно",
      globals: "Глобальные"
    },
    expression: {
      placeholder: "Введите выражение (Enter)",
      close: "Закрыть"
    },
    settings: {
      title: "Настройки",
      preferences: "Предпочтения",
      shortcuts: "Горячие клавиши",
      experiments: "Эксперименты",
      about: "О программе",
      appearance: "Внешний вид",
      language: "Язык",
      theme: "Тема DevTools",
      themes: {
        light: "Светлая",
        dark: "Тёмная",
        system: "Системная"
      },
      editorTheme: "Тема редактора",
      editorThemes: {
        auto: "Авто (как DevTools)",
        default: "Default (Белая)",
        eclipse: "Eclipse",
        neo: "Neo",
        monokai: "Monokai",
        dracula: "Dracula",
        material: "Material"
      },
      panelLayout: "Расположение панелей",
      layouts: {
        horizontal: "Горизонтально",
        vertical: "Вертикально",
        auto: "Авто"
      },
      reload_hint: "(требуется перезагрузка)",
      shortcuts_hint: "Ctrl + 1-9 для переключения панелей",
      sources_section: "Источники",
      source_maps: "Включить source maps",
      indentation: "Определение отступов",
      network_section: "Сеть",
      disable_cache: "Отключить кэш при открытых DevTools",
      general: "Общее",
      open_settings: "Открыть настройки",
      next_panel: "Следующая панель",
      coming_soon: "Скоро...",
      about_text: "MyDevTool v1.0 — лёгкий DevTools для мобильных устройств"
    },

    messages: {
      globals_header: "=== Глобальные переменные песочницы ===",
      error_reading: "[Ошибка чтения значения]",
      listing_unavailable: "Список глобальных переменных недоступен",
      error_listing: "Ошибка списка: {error}",
      illegal_return: "Uncaught SyntaxError: Illegal return statement",
      failed_resource: "Не удалось загрузить ресурс: {url}",
      unknown_resource: "Неизвестный ресурс",
      unhandled_rejection: "Необработанное отклонение Promise: "
    }
  },

  source: {
    xhr_breakpoints: "XHR / fetch точки останова",
    event_listener_breakpoints: "Точки останова слушателей",
    no_breakpoints: "Нет точек останова",
    page: "Страница",
    filesystem: "Файловая система",
    overrides: "Overrides",
    not_implemented: "Не реализовано",
    select_file: "Выберите файл",
    open_file_hint: "Ctrl+P → открыть файл",
    run_command_hint: "Ctrl+Shift+P → выполнить команду",
    run_script: "Выполнить текущий JS",
    pause_resume: "Пауза / Продолжить",
    step_over: "Шаг с обходом",
    step_into: "Шаг внутрь",
    step_out: "Шаг наружу",
    instrumentation_enable: "Включить инструментирование (требуется перезагрузка)",
    instrumentation_enabled_msg: "Включено. Перезагрузка через 3с...",
    instrumentation_disabled_msg: "Выключено. Перезагрузка через 1с...",
    call_stack: "Стек вызовов",
    not_paused: "Не на паузе",
    resume: "Продолжить (F8)",
    uncaught_ex: "Останов при необработанных ошибках",
    caught_ex: "Останов при обработанных ошибках",
    url_contains: "URL содержит…",
    remove_bp: "Удалить точку останова",
    no_file_open: "Файл не открыт.",
    only_js: "Можно выполнять только JS файлы.",
    failed_fetch: "Ошибка fetch",
    enabled_reload: "Активировано! Перезагрузка через 3 сек...",
    disabled_reload: "Выключено. Перезагрузка через 1 сек...",
    sw_manager_missing: "SWManager не загружен!"
  },

  network: {
    filter_placeholder: "Фильтр",
    record_btn: "Начать запись сети (Ctrl+E)",
    stop_record_btn: "Остановить запись (Ctrl+E)",
    clear_btn: "Очистить",
    toggle_filter: "Показать/скрыть панель фильтра",
    preserve_log: "Сохранять лог",
    disable_cache: "Отключить кэш",
    disable_cache_hint: "Добавлять timestamp к запросам",
    invert: "Инвертировать",
    hide_data_urls: "Скрыть data URLs",
    show_waterfall: "Показать диаграмму",
    settings: "Настройки сети",
    overview_title: "Сетевой таймлайн (тянуть для фильтрации)",

    filters: {
      all: "Все",
      xhr: "XHR / Fetch",
      js: "JS",
      css: "CSS",
      img: "Изображения",
      media: "Медиа",
      font: "Шрифты",
      doc: "Документы",
      ws: "WebSocket",
      other: "Другое",
      blocked_cookies: "Заблокированные cookie",
      blocked_requests: "Заблокированные запросы",
      third_party: "Сторонние"
    },

    empty_msg: {
      not_recording: "Начните запись сети (Ctrl+E).",
      recording: "Запись...",
      recording_desc: "Сделайте запрос или нажмите <code>Ctrl+R</code>."
    },

    columns: {
      name: "Имя",
      status: "Статус",
      type: "Тип",
      initiator: "Инициатор",
      size: "Размер",
      time: "Время",
      timeline: "Таймлайн"
    },

    footer: {
      requests: "{count} запросов",
      transferred: "Передано: {size} MB",
      finish: "Завершено: {time} сек",
      requests_filtered: "Показано {shown} из {total}"
    },

    settings_popup: {
      large_rows: "Крупные строки",
      group_frame: "Группировать по фреймам",
      show_overview: "Показать обзор",
      capture_screenshots: "Снимать скриншоты"
    },

    interceptor: {
      fetch_failed: "Fetch ошибка:",
      xhr_failed: "XHR ошибка:",
      xhr_error: "XHR Ошибка",
      xhr_request_failed: "XHR запрос не выполнен",
      pausing_fetch: "🛑 Остановка на fetch:",
      pausing_xhr: "🛑 Остановка на XHR:",
      body_read_error: "[Не удалось прочитать тело]"
    }
  },
  
  network_details: {
  tabs: {
    headers: "Заголовки",
    preview: "Предпросмотр",
    response: "Ответ",
    timing: "Время"
  },
  sections: {
    general: "Общее",
    response_headers: "Заголовки ответа",
    request_headers: "Заголовки запроса",
    request_payload: "Тело запроса"
  },
  general: {
    request_url: "URL запроса",
    request_method: "Метод запроса",
    status_code: "Код статуса",
    referrer_policy: "Политика Referrer"
  },
  timing: {
    start_time: "Время начала",
    dns_lookup: "DNS Lookup",
    tcp_connect: "TCP подключение",
    ssl: "SSL",
    ttfb: "Ожидание (TTFB)",
    content_download: "Загрузка контента",
    total: "Общая длительность"
  },
  messages: {
    loading: "Загрузка контента...",
    no_content: "Нет доступного контента",
    failed_load: "Не удалось загрузить: {error}",
    empty: "(Пусто)",
    no_headers: "Заголовки не найдены",
    binary_data: "Бинарные данные или FormData",
    timing_unavailable: "Данные о времени недоступны.",
    show_more: "Показать больше (осталось {remaining} KB)"
  }
},
  inspector: {
    color: "Цвет",
    font: "Шрифт",
    margin: "Отступ",
    accessibility: "Доступность",
    name: "Имя",
    role: "Роль",
    focus: "Фокус",
    btn_missing: "Inspector: элемент #inspect-btn не найден"
  },
  layout: {
    page: "Страница",
refresh_page: "Обновить страницу",
design_mode: "Сделать страницу редактируемой",
  grid: "Grid",
  flexbox: "Flexbox",
  overlay_settings: "Настройки отображения оверлея",
  show_line_numbers: "Показать номера строк",
  show_track_sizes: "Показать размеры треков",
  show_area_names: "Показать имена областей",
  extend_grid_lines: "Продлить линии Grid",
  grid_overlays: "Оверлеи Grid",
  flex_overlays: "Оверлеи Flexbox",
  no_grid: "Элементы Grid не найдены",
  no_flex: "Элементы Flexbox не найдены"
}
};
