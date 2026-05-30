export default {
  welcome: {
  title: "مرحبًا بك في Suger DevTool",
  subtitle: "يرجى اختيار لغتك المفضلة للمتابعة.",
  select_language: "اختر اللغة",
  continue: "متابعة",
  already_logged_in: "لقد قمت بتسجيل الدخول بالفعل",

},
activation: {
  title: "أدخل مفتاح المنتج",
  subtitle: "أدخل بريدك الإلكتروني ومفتاح المنتج لفتح الميزات المميزة.",
  label_email: "البريد الإلكتروني",
  label_key: "مفتاح المنتج",
  placeholder_email: "name@example.com",
  no_key: "ليس لديك مفتاح؟",
  get_key_link: "الحصول على المفتاح من الموقع",
  contact_support: "اتصل بالدعم",
  btn_cancel: "إلغاء",
  btn_next: "التالي",
  btn_back: "رجوع",
  btn_activate: "تفعيل",
  error: "فشل التفعيل",
  success: "تم بنجاح!",
  verifying: "جارٍ التحقق...",
  connecting: "جارٍ الاتصال بخادم التراخيص..."
},
license: {
  title: "اتفاقية الترخيص",
  agree_checkbox: "أوافق على الشروط والأحكام",
  content: `
    <h3>اتفاقية ترخيص Suger DevTool</h3>
    <p><strong>مهم: يرجى القراءة بعناية</strong></p>
    <p>هذه الاتفاقية هي عقد قانوني بينك وبين Suger DevTool.</p>

    <p><strong>1. منح الترخيص</strong><br>
    يتم منحك ترخيصًا محدودًا للاستخدام الشخصي أو التجاري.</p>

    <p><strong>2. القيود</strong><br>
    يمنع فك الشفرة أو الهندسة العكسية أو تعديل البرنامج.</p>

    <p><strong>3. الإنهاء</strong><br>
    يتم إنهاء الترخيص تلقائيًا عند مخالفة أي شرط.</p>

    <p>بالنقر على "تفعيل"، فإنك توافق على هذه الشروط.</p>
  `
},
  common: {
    loading: "جارٍ التحميل...",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    refresh: "تحديث",
    clear: "مسح",
    close: "إغلاق",
    filter: "تصفية",
    origin: "المصدر",
    key: "المفتاح",
    value: "القيمة",
    domain: "النطاق",
    path: "المسار",
    expires: "انتهاء الصلاحية / Max-Age",
    size: "الحجم",
    httpOnly: "HttpOnly",
    secure: "Secure",
    sameSite: "SameSite",
    priority: "الأولوية",
    yes: "نعم",
    no: "لا"
  },

  tabs: {
    elements: "العناصر",
    console: "وحدة التحكم",
    network: "الشبكة",
    source: "المصادر",
    application: "التطبيق",
    settings: "الإعدادات"
  },
  dom_action: {
  add_attr: "إضافة خاصية",
  edit_html: "تحرير كـ HTML",
  duplicate: "تكرار العنصر",
  cut: "قص",
  copy: "نسخ",
  copy_ele: "نسخ العنصر",
  copy_html: "نسخ outerHTML",
  delete: "حذف",
  del_ele: "حذف العنصر",
  del_child: "حذف العناصر التابعة",
  del_attr: "حذف الخصائص",
  show: "إظهار العنصر",
  hide: "إخفاء العنصر",
  focus: "تركيز",
  collapse: "طي العناصر التابعة"
},
monitor: {
  title: "مراقب الأداء",
  cpu_usage: "استخدام المعالج",
  js_heap_size: "حجم كومة JS",
  dom_nodes: "عُقد DOM",
  js_event_listeners: "مستمعو أحداث JS",
  frames_per_sec: "إطارات في الثانية"
},
  settings: {
    title: "الإعدادات",
    preferences: "التفضيلات",
    shortcuts: "اختصارات",
    experiments: "التجارب",
    about: "حول",
    appearance: "المظهر",
    language: "اللغة",
    theme: "سمة DevTools",
    editorTheme: "سمة المحرر",
    panelLayout: "تخطيط اللوحات",
    reload_hint: "(يتطلب إعادة تحميل)",
    no_virtualization_warning: "(يؤدي تفعيل التفاف الكلمات إلى تعطيل المحاكاة الافتراضية. قد تلاحظ بطئًا في المشاريع الكبيرة.)",

    shortcuts_hint: "Ctrl + 1-9 للتنقل بين اللوحات",
    sources_section: "المصادر",
    source_maps: "تمكين Source Maps",
    indentation: "اكتشاف المسافة البادئة تلقائيًا",
    network_section: "الشبكة",
    disable_cache: "تعطيل التخزين المؤقت (عند فتح DevTools)",
    general: "عام",
    open_settings: "فتح الإعدادات",
    next_panel: "اللوحة التالية",
    navigate_tree: "التنقل داخل الشجرة",
    expand_collapse: "توسيع / طي",
    edit_attr: "تعديل الخاصية",
    inspect_section: "الفحص",
    hide_while_inspecting: "إخفاء DevTool أثناء الفحص",
    collapse_mode: "إجراء الطي",
    collapse_modes: {
      float: "زر عائم (Bubble)",
      minimize: "تصغير اللوحة (العنوان فقط)"
    },
    license_management: "إدارة الترخيص",
    current_key: "المفتاح الحالي: ****-****-****-{last4}",
    deactivate_btn: "تعطيل وتسجيل الخروج",
    deactivate_confirm: "هل أنت متأكد؟ سيتم تعطيل الترخيص على هذا الجهاز.",
    about_section: {
  build_status_label: "حالة البناء الحالية:",
  build_status_text: "هذا هو الإصدار المستقر الأول (v1.0). على الرغم من اختبار الميزات الأساسية بدقة، قد تظل هناك بعض الحالات النادرة أثناء التشغيل. يعمل فريق الهندسة لدينا باستمرار على نشر تحديثات الاستقرار وتحسينات الأداء.",  
  copyright: "© 2026 Suger DevTool. جميع الحقوق محفوظة.",
  tagline: "صُمّم في الهند • طُوّر عالميًا"
},
pref_styles: {
  title: "Styles",
  editing_behavior: "سلوك التحرير",
  edit_single_click: "تحرير القاعدة بنقرة واحدة",
  single_click_hint: "تمكين التحرير بنقرة واحدة بدلاً من النقر المزدوج/اللمس المزدوج",
  display_options: "خيارات العرض",
  show_user_agent: "عرض أنماط User Agent",
  autocomplete: "الإكمال التلقائي",
  show_suggestions: "عرض الاقتراحات",
  max_suggestions: "الحد الأقصى للاقتراحات",
  suggestions_hint: "القيم الأعلى قد تؤثر على الأداء"
},

pref_elements: {
  title: "لوحة Elements",
  panel_layout: "تخطيط اللوحة",
  sub_tab_layout: "تخطيط التبويبات الفرعية",
  layout_vertical: "عمودي (جنبًا إلى جنب)",
  layout_horizontal: "أفقي (مكدس)",
  show_styles: "عرض Styles في التبويب الرئيسي",
  show_computed: "عرض Computed في التبويب الرئيسي",
  show_layout: "عرض Layout في التبويب الرئيسي",
  console_label: "وحدة التحكم",
  show_main: "عرض في التبويب الرئيسي",
  dom_appearance: "مظهر شجرة DOM",
  show_comments: "عرض تعليقات HTML ()",
  show_shadow: "عرض User Agent Shadow DOM",
  show_rulers: "عرض أدلة المسافة البادئة",
  highlight_updates: "تمييز تحديثات DOM (وميض)",
  computed_box_model: "Computed و Box Model",
  highlight_hover: "تمييز العنصر عند المرور على Box Model",
  show_tooltip: "عرض تلميح عند المرور على Box",
  show_zero: "عرض القيم '0' في Box Model",
  element_badges: "شارات العناصر"
},
pref_inspect: {
  tooltip_title: "تلميح أداة الفحص",
  enable_tooltip: "عرض التلميح أثناء الفحص",
  show_hierarchy: "عرض تسلسل العناصر الأصلية",
  show_dims: "عرض الأبعاد",
  show_color: "عرض معلومات اللون والخط",
  show_box_model: "عرض قيم Margin/Padding",
  show_extra: "عرض تفاصيل إضافية (A11y، التباين)",
  overlay_title: "طبقة التمييز",
  show_margin: "عرض Margin (برتقالي)",
  show_padding: "عرض Padding (أخضر)",
  show_border: "عرض Border (أصفر)"
},

  },

  application: {
    dashboard: "التخزين",
    manifest: "الملف التعريفي",
    service_workers: "خدمات Service Worker",
    local_storage: "Local Storage",
    session_storage: "Session Storage",
    indexed_db: "IndexedDB",
    cookies: "Cookies",
    cache: "الذاكرة المؤقتة",
    cache_storage: "Cache Storage",
    storage_title: "التخزين",
    usage_title: "الاستخدام",
    usage_text: "تم استخدام {used} MB من {quota} MB",
    total_usage: "إجمالي الاستخدام",
    clear_site_data: "مسح بيانات الموقع",
    inc_third_party: "يشمل ملفات تعريف الارتباط الخارجية",
    clear_options: {
      app: "التطبيق",
      unregister_sw: "إلغاء تسجيل Service Worker",
      storage: "التخزين",
      ls_ss: "Local / Session Storage",
      idb: "IndexedDB",
      websql: "Web SQL",
      cookies: "Cookies",
      cache: "Cache",
      cache_storage: "Cache Storage"
    },
    empty_view: "اختر مصدرًا لعرض البيانات.",
    empty_idb: "اختر Object Store.",
    no_manifest: "لم يتم العثور على Manifest",
    no_manifest_desc: "هذه الصفحة لا تحتوي على ملف manifest.json.",
    no_sw: "لا توجد Service Workers",
    identity: "الهوية",
    presentation: "العرض",
    icons: "الأيقونات",
    no_icons: "لا توجد أيقونات",
    view_raw: "عرض JSON الخام",
    sw_offline: "غير متصل",
    sw_update_reload: "التحديث عند إعادة التحميل",
    sw_status: "الحالة",
    sw_running: "نشط",
    sw_stopped: "متوقف",
    sw_clients: "العملاء",
    sw_view_clients: "عرض العملاء",
    update: "تحديث",
    unregister: "إلغاء التسجيل",
    clear_all_confirm: "هل تريد مسح الكل؟",
    clear_cookies_confirm: "مسح ملفات تعريف الارتباط؟",
    delete_cache_confirm: "مسح الذاكرة المؤقتة؟",
    unregister_sw_confirm: "هل تريد إلغاء تسجيل Service Worker؟"
  },

  elements: {
    styles: "الأنماط",
    computed: "المحسوب",
    layout: "التخطيط",
    filter_placeholder: "تصفية",
    show_all: "عرض الكل",
    group: "مجموعة",
    box_model: {
      margin: "Margin",
      border: "Border",
      padding: "Padding",
      tooltip: "تلميح",
      tooltip_title: "إظهار تلميحات الفحص عند التمرير أو النقر"
    },
    groups: {
      other: "أخرى"
    },
    no_css_data: "خطأ: لم يتم تحميل CSSData.js."
  },

  styles: {
    filter_placeholder: "تصفية",
    toggle_element_state: "تبديل حالة العنصر",
    element_classes: "فئات العنصر",
    new_style_rule: "قاعدة نمط جديدة",
    force_element_state: "فرض حالة العنصر",
    add_new_class: "إضافة فئة جديدة",
    no_classes_found: "لا توجد فئات.",
    inherited_from: "موروث من",
    pseudo_element: "العنصر الوهمي ::{type}",
    user_agent_stylesheet: "ورقة أنماط المتصفح",
    inspector_stylesheet: "inspector-stylesheet",
    element_style: "element.style",
    add_new_property: "إضافة خاصية جديدة",

    copy_selector: "نسخ المحدد",
    copy_declaration: "نسخ التصريح",
    copy_property: "نسخ الخاصية",
    copy_value: "نسخ القيمة",
    copy_rule: "نسخ القاعدة",
    copy_declaration_js: "نسخ كـ JS",
    copy_all_declarations: "نسخ كل التصريحات",
    copy_all_declarations_js: "نسخ كل التصريحات كـ JS"
  },

  console: {
    toolbar: {
      sidebar_toggle: "عرض/إخفاء الشريط الجانبي",
      clear_console: "مسح وحدة التحكم (Ctrl + L)",
      toggle_expressions: "تبديل لوحة التعابير",
      filter_placeholder: "تصفية",
      settings: "إعدادات وحدة التحكم"
    },
    sidebar: {
      all_messages: "كل الرسائل",
      user_messages: "رسائل المستخدم",
      errors: "أخطاء",
      warnings: "تحذيرات",
      info: "معلومات",
      verbose: "تفاصيل",
      globals: "المتغيرات العامة"
    },
    expression: {
      placeholder: "اكتب تعبيرًا واضغط Enter",
      close: "إغلاق"
    },
    settings: {
      title: "الإعدادات",
      preferences: "التفضيلات",
      shortcuts: "الاختصارات",
      experiments: "التجارب",
      about: "حول",
      appearance: "المظهر",
      language: "اللغة",
      theme: "سمة DevTools",
      themes: {
        light: "فاتح",
        dark: "داكن",
        system: "نظام"
      },
      editorTheme: "سمة المحرر",
      editorThemes: {
        auto: "تلقائي",
        default: "افتراضي (أبيض)",
        eclipse: "Eclipse",
        neo: "Neo",
        monokai: "Monokai",
        dracula: "Dracula",
        material: "Material"
      },
      panelLayout: "تخطيط اللوحات",
      layouts: {
        horizontal: "أفقي",
        vertical: "عمودي",
        auto: "تلقائي"
      },
      reload_hint: "(يتطلب إعادة تحميل)",
      shortcuts_hint: "Ctrl + 1-9 للتنقل",
      sources_section: "المصادر",
      source_maps: "تمكين Source Maps",
      indentation: "اكتشاف المسافات تلقائيًا",
      network_section: "الشبكة",
      disable_cache: "تعطيل الكاش عند فتح DevTools",
      general: "عام",
      open_settings: "فتح الإعدادات",
      next_panel: "اللوحة التالية",
      coming_soon: "قريبًا...",
      about_text: "MyDevTool v1.0 — أداة مطور خفيفة للهواتف"
    },

    messages: {
      globals_header: "=== المتغيرات العامة في بيئة Sandbox ===",
      error_reading: "[تعذّر قراءة القيمة]",
      listing_unavailable: "قائمة المتغيرات غير متاحة",
      error_listing: "خطأ: {error}",
      illegal_return: "خطأ SyntaxError: جملة return غير مسموحة",
      failed_resource: "فشل تحميل المصدر: {url}",
      unknown_resource: "مصدر غير معروف",
      unhandled_rejection: "رفض Promise غير معالج: "
    }
  },

  source: {
    xhr_breakpoints: "نقاط توقف XHR / Fetch",
    event_listener_breakpoints: "نقاط توقف المستمع",
    no_breakpoints: "لا توجد نقاط توقف",
    page: "صفحة",
    filesystem: "نظام الملفات",
    overrides: "Overrides",
    not_implemented: "غير مدعوم",
    select_file: "اختر ملفًا",
    open_file_hint: "Ctrl + P لفتح ملف",
    run_command_hint: "Ctrl + Shift + P لتنفيذ أمر",
    run_script: "تشغيل ملف JS الحالي",
    pause_resume: "إيقاف / متابعة",
    step_over: "تخطي",
    step_into: "الدخول",
    step_out: "الخروج",
    instrumentation_enable: "تفعيل المراقبة (يتطلب إعادة تحميل)",
    instrumentation_enabled_msg: "مفعل! إعادة تحميل خلال 3 ثوانٍ...",
    instrumentation_disabled_msg: "معطل. إعادة تحميل خلال ثانية واحدة...",
    call_stack: "مكدس الاستدعاءات",
    not_paused: "غير متوقف",
    resume: "متابعة (F8)",
    uncaught_ex: "إيقاف عند الأخطاء غير المعالجة",
    caught_ex: "إيقاف عند الأخطاء المعالجة",
    url_contains: "رابط يحتوي على...",
    remove_bp: "إزالة نقطة التوقف",
    no_file_open: "لا يوجد ملف مفتوح.",
    only_js: "يمكن تشغيل ملفات JS فقط.",
    failed_fetch: "فشل fetch",
    enabled_reload: "مفعل! إعادة تحميل خلال 3 ثوان...",
    disabled_reload: "معطل! إعادة تحميل خلال ثانية واحدة...",
    sw_manager_missing: "SWManager غير محمّل!"
  },

  network: {
    filter_placeholder: "تصفية",
    record_btn: "بدء تسجيل الشبكة (Ctrl + E)",
    stop_record_btn: "إيقاف التسجيل (Ctrl + E)",
    clear_btn: "مسح",
    toggle_filter: "إظهار/إخفاء الفلاتر",
    preserve_log: "حفظ السجل",
    disable_cache: "تعطيل الكاش",
    disable_cache_hint: "إضافة timestamp لتجاوز الكاش",
    invert: "عكس",
    hide_data_urls: "إخفاء data URLs",
    show_waterfall: "عرض المخطط",
    settings: "إعدادات الشبكة",
    overview_title: "مخطط الشبكة (اسحب للتصفية)",

    filters: {
      all: "الكل",
      xhr: "XHR / Fetch",
      js: "JS",
      css: "CSS",
      img: "صور",
      media: "وسائط",
      font: "خطوط",
      doc: "مستندات",
      ws: "WebSocket",
      other: "أخرى",
      blocked_cookies: "ملفات تعريف الارتباط المحجوبة",
      blocked_requests: "الطلبات المحجوبة",
      third_party: "جهات خارجية"
    },

    empty_msg: {
      not_recording: "ابدأ تسجيل الشبكة (Ctrl + E).",
      recording: "جارٍ التسجيل...",
      recording_desc: "قم بعمل طلب أو اضغط <code>Ctrl + R</code>."
    },

    columns: {
      name: "الاسم",
      status: "الحالة",
      type: "النوع",
      initiator: "المُسبب",
      size: "الحجم",
      time: "الوقت",
      timeline: "الخط الزمني"
    },

    footer: {
      requests: "{count} طلبات",
      transferred: "تم نقل {size} MB",
      finish: "اكتمل خلال {time} ثانية",
      requests_filtered: "عرض {shown} من {total}"
    },

    settings_popup: {
      large_rows: "صفوف كبيرة",
      group_frame: "تجميع حسب الإطار",
      show_overview: "عرض الملخص",
      capture_screenshots: "التقاط لقطات شاشة"
    },

    interceptor: {
      fetch_failed: "فشل Fetch:",
      xhr_failed: "فشل XHR:",
      xhr_error: "خطأ XHR",
      xhr_request_failed: "فشل طلب XHR",
      pausing_fetch: "🛑 توقف عند Fetch:",
      pausing_xhr: "🛑 توقف عند XHR:",
      body_read_error: "[تعذّر قراءة body]"
    }
  },
  
  network_details: {
  tabs: {
    headers: "الرؤوس",
    preview: "المعاينة",
    response: "الاستجابة",
    timing: "التوقيت"
  },
  sections: {
    general: "عام",
    response_headers: "رؤوس الاستجابة",
    request_headers: "رؤوس الطلب",
    request_payload: "حمولة الطلب"
  },
  general: {
    request_url: "عنوان الطلب",
    request_method: "طريقة الطلب",
    status_code: "رمز الحالة",
    referrer_policy: "سياسة المُحيل"
  },
  timing: {
    start_time: "وقت البدء",
    dns_lookup: "بحث DNS",
    tcp_connect: "اتصال TCP",
    ssl: "SSL",
    ttfb: "الانتظار (TTFB)",
    content_download: "تنزيل المحتوى",
    total: "المدة الإجمالية"
  },
  messages: {
    loading: "جارٍ تحميل المحتوى...",
    no_content: "لا يوجد محتوى",
    failed_load: "فشل تحميل المحتوى: {error}",
    empty: "(فارغ)",
    no_headers: "لم يتم العثور على رؤوس",
    binary_data: "بيانات ثنائية أو FormData",
    timing_unavailable: "بيانات التوقيت غير متوفرة لهذا الطلب.",
    show_more: "عرض المزيد (المتبقي {remaining} KB)"
  }
},
  inspector: {
    color: "اللون",
    font: "الخط",
    margin: "الهامش",
    accessibility: "إمكانية الوصول",
    name: "الاسم",
    role: "الدور",
    focus: "التركيز",
    btn_missing: "Inspector: لم يتم العثور على #inspect-btn"
  },
  layout: {
    page: "الصفحة",
refresh_page: "تحديث الصفحة",
design_mode: "جعل الصفحة قابلة للتحرير",
  grid: "Grid",
  flexbox: "Flexbox",
  overlay_settings: "إعدادات عرض الطبقة",
  show_line_numbers: "إظهار أرقام الأسطر",
  show_track_sizes: "إظهار أحجام المسارات",
  show_area_names: "إظهار أسماء المناطق",
  extend_grid_lines: "تمديد خطوط الشبكة",
  grid_overlays: "Grid Overlays",
  flex_overlays: "Flexbox Overlays",
  no_grid: "لا توجد عناصر Grid",
  no_flex: "لا توجد عناصر Flexbox"
}
};
