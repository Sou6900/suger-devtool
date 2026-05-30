export default {
  welcome: {
  title: "Selamat datang di Suger DevTool",
  subtitle: "Pilih bahasa yang Anda inginkan untuk melanjutkan.",
  select_language: "Pilih Bahasa",
  continue: "Lanjut",
  already_logged_in: "Saya sudah masuk",

},

activation: {
  title: "Masukkan Kunci Produk",
  subtitle: "Masukkan email dan kunci produk untuk membuka fitur premium.",
  label_email: "EMAIL",
  label_key: "KUNCI PRODUK",
  placeholder_email: "name@example.com",
  no_key: "Tidak punya kunci?",
  get_key_link: "Dapatkan kunci dari website",
contact_support: "Hubungi dukungan",

  btn_cancel: "Batal",
  btn_next: "Lanjut",
  btn_back: "Kembali",
  btn_activate: "Aktifkan",
  error: "Aktivasi gagal",
  success: "Berhasil!",
  verifying: "Memverifikasi...",
  connecting: "Menghubungkan ke server lisensi..."
},

license: {
  title: "Perjanjian Lisensi",
  agree_checkbox: "Saya menyetujui syarat & ketentuan",
  content: `
    <h3>Perjanjian Lisensi Suger DevTool</h3>
    <p><strong>PENTING: BACALAH DENGAN SEKSAMA</strong></p>
    <p>EULA ini adalah perjanjian hukum antara Anda dan Suger DevTool.</p>

    <p><strong>1. PEMBERIAN LISENSI</strong><br>
    Anda diberikan lisensi terbatas untuk penggunaan pribadi atau komersial.</p>

    <p><strong>2. PEMBATASAN</strong><br>
    Anda tidak boleh membongkar, mendekompilasi, atau memodifikasi perangkat lunak.</p>

    <p><strong>3. PENGHENTIAN</strong><br>
    Lisensi berakhir otomatis jika syarat dilanggar.</p>

    <p>Dengan mengklik "Aktifkan", Anda setuju dengan perjanjian ini.</p>
  `
}
,
  common: {
    loading: "Memuat...",
    cancel: "Batal",
    save: "Simpan",
    delete: "Hapus",
    refresh: "Segarkan",
    clear: "Bersihkan",
    filter: "Saring",
    close: "Tutup",
    origin: "Origin",
    key: "Kunci",
    value: "Nilai",
    domain: "Domain",
    path: "Path",
    expires: "Kadaluarsa / Max-Age",
    size: "Ukuran",
    httpOnly: "HttpOnly",
    secure: "Secure",
    sameSite: "SameSite",
    priority: "Prioritas",
    yes: "Ya",
    no: "Tidak"
  },
  tabs: {
    elements: "Elemen",
    console: "Konsol",
    network: "Jaringan",
    source: "Sumber",
    application: "Aplikasi",
    settings: "Pengaturan"
  },
  dom_action: {
  add_attr: "Tambah atribut",
  edit_html: "Edit sebagai HTML",
  duplicate: "Duplikasi elemen",
  cut: "Potong",
  copy: "Salin",
  copy_ele: "Salin elemen",
  copy_html: "Salin outerHTML",
  delete: "Hapus",
  del_ele: "Hapus elemen",
  del_child: "Hapus anak",
  del_attr: "Hapus atribut",
  show: "Tampilkan elemen",
  hide: "Sembunyikan elemen",
  focus: "Fokus",
  collapse: "Ciutkan anak"
},
monitor: {
  title: "Monitor kinerja",
  cpu_usage: "Penggunaan CPU",
  js_heap_size: "Ukuran heap JS",
  dom_nodes: "Node DOM",
  js_event_listeners: "Event listener JS",
  frames_per_sec: "Frame per detik"
},
  settings: {
    title: "Pengaturan",
    preferences: "Preferensi",
    shortcuts: "Pintasan",
    experiments: "Eksperimen",
    about: "Tentang",
    appearance: "Tampilan",
    language: "Bahasa",
    theme: "Tema DevTools",
    editorTheme: "Tema Editor",
    panelLayout: "Tata letak panel",
    reload_hint: "(Membutuhkan muat ulang)",
    no_virtualization_warning: "(Mengaktifkan word wrap akan menonaktifkan virtualisasi. Proyek besar mungkin mengalami lag.)",

    shortcuts_hint: "Aktifkan pintasan Ctrl + 1-9 untuk ganti panel",
    sources_section: "Sumber",
    source_maps: "Aktifkan source maps JavaScript",
    indentation: "Deteksi indentasi",
    network_section: "Jaringan",
    disable_cache: "Nonaktifkan cache (saat DevTools terbuka)",
    general: "Umum",
    open_settings: "Buka Pengaturan",
    next_panel: "Panel Berikutnya",
    navigate_tree: "Navigasi Pohon",
    expand_collapse: "Perluas / Tutup",
    edit_attr: "Sunting Atribut",
    inspect_section: "Inspect",
    hide_while_inspecting: "Sembunyikan DevTool saat inspeksi",
    collapse_mode: "Aksi kolaps",
    collapse_modes: {
      float: "Tombol mengambang (Bubble)",
      minimize: "Minimalkan panel (Hanya header)"
    },
    about_section: {
  build_status_label: "Status Build Saat Ini:",
  build_status_text: "Ini adalah rilis stabil awal (v1.0). Meskipun fitur utama telah diuji dengan ketat, beberapa kasus tepi kecil mungkin tetap ada. Tim engineering kami terus merilis patch stabilitas dan peningkatan performa.",
  copyright: "© 2026 Suger DevTool. Hak cipta dilindungi.",
  tagline: "Dirancang di India • Dikembangkan secara global"
},
pref_styles: {
  title: "Styles",
  editing_behavior: "Perilaku pengeditan",
  edit_single_click: "Edit aturan dengan satu klik",
  single_click_hint: "Aktifkan pengeditan satu klik вместо klik ganda/ketuk ganda",
  display_options: "Opsi tampilan",
  show_user_agent: "Tampilkan gaya user agent",
  autocomplete: "Pelengkapan otomatis",
  show_suggestions: "Tampilkan saran",
  max_suggestions: "Maksimum saran",
  suggestions_hint: "Nilai lebih tinggi dapat memengaruhi performa"
},

pref_elements: {
  title: "Panel Elements",
  panel_layout: "Tata letak panel",
  sub_tab_layout: "Tata letak sub-tab",
  layout_vertical: "Vertikal (berdampingan)",
  layout_horizontal: "Horizontal (bertumpuk)",
  show_styles: "Tampilkan Styles di tab utama",
  show_computed: "Tampilkan Computed di tab utama",
  show_layout: "Tampilkan Layout di tab utama",
  console_label: "Console",
  show_main: "Tampilkan di tab utama",
  dom_appearance: "Tampilan pohon DOM",
  show_comments: "Tampilkan komentar HTML ()",
  show_shadow: "Tampilkan User Agent Shadow DOM",
  show_rulers: "Tampilkan panduan indentasi",
  highlight_updates: "Sorot pembaruan DOM (berkedip)",
  computed_box_model: "Computed & Box Model",
  highlight_hover: "Sorot elemen saat hover Box Model",
  show_tooltip: "Tampilkan tooltip saat hover Box",
  show_zero: "Tampilkan nilai '0' di Box Model",
  element_badges: "Badge elemen"
},
pref_inspect: {
  tooltip_title: "Tooltip Inspector",
  enable_tooltip: "Tampilkan tooltip saat inspeksi",
  show_hierarchy: "Tampilkan hierarki induk",
  show_dims: "Tampilkan dimensi",
  show_color: "Tampilkan info warna & font",
  show_box_model: "Tampilkan nilai Margin/Padding",
  show_extra: "Tampilkan detail tambahan (A11y, Kontras)",
  overlay_title: "Overlay Sorotan",
  show_margin: "Tampilkan Margin (Oranye)",
  show_padding: "Tampilkan Padding (Hijau)",
  show_border: "Tampilkan Border (Kuning)"
 },
},
  application: {
    dashboard: "Storage",
    manifest: "Manifest",
    service_workers: "Service Workers",
    local_storage: "Local Storage",
    session_storage: "Session Storage",
    indexed_db: "IndexedDB",
    cookies: "Cookies",
    cache: "Cache",
    cache_storage: "Cache Storage",
    storage_title: "Storage",
    usage_title: "Penggunaan",
    usage_text: "{used} MB digunakan dari kuota penyimpanan {quota} MB",
    total_usage: "Total Penggunaan",
    clear_site_data: "Bersihkan data situs",
    inc_third_party: "termasuk cookie pihak ketiga",
    clear_options: {
      app: "Aplikasi",
      unregister_sw: "Batalkan pendaftaran service worker",
      storage: "Penyimpanan",
      ls_ss: "Local dan session storage",
      idb: "IndexedDB",
      websql: "Web SQL",
      cookies: "Cookies",
      cache: "Cache",
      cache_storage: "Cache storage"
    },
    empty_view: "Pilih origin untuk melihat data.",
    empty_idb: "Pilih Object Store untuk melihat data.",
    no_manifest: "Tidak ada Manifest terdeteksi",
    no_manifest_desc: "Tidak ada file manifest.json di halaman ini.",
    no_sw: "Tidak ada Service Workers terdeteksi",
    identity: "Identitas",
    presentation: "Presentasi",
    icons: "Ikon",
    no_icons: "Tidak ditemukan ikon",
    view_raw: "Lihat JSON Mentah",
    sw_offline: "Offline",
    sw_update_reload: "Perbarui saat muat ulang",
    sw_status: "Status",
    sw_running: "berjalan",
    sw_stopped: "berhenti",
    sw_clients: "Klien",
    sw_view_clients: "Lihat klien",
    update: "Perbarui",
    unregister: "Batalkan pendaftaran",
    clear_all_confirm: "Kosongkan semua?",
    clear_cookies_confirm: "Hapus cookie?",
    delete_cache_confirm: "Hapus cache?",
    unregister_sw_confirm: "Batalkan pendaftaran Service Worker ini?"
  },
  elements: {
    styles: "Gaya",
    computed: "Computed",
    layout: "Tata Letak",
    filter_placeholder: "Saring",
    show_all: "Tampilkan semua",
    group: "Grup",
    box_model: {
      margin: "Margin",
      border: "Border",
      padding: "Padding",
      tooltip: "tooltip", // Label checkbox
      tooltip_title: "Tampilkan tooltip inspector saat hover/klik"
    },
    groups: {
      other: "Lainnya" // Untuk properti tanpa grup
    },
    no_css_data: "Error: modul CSSData.js tidak dimuat."
  },
  styles: {
    filter_placeholder: "Saring",
    toggle_element_state: "Alihkan Status Elemen",
    element_classes: "Kelas Elemen",
    new_style_rule: "Aturan Gaya Baru",
    force_element_state: "Paksakan status elemen",
    add_new_class: "Tambah kelas baru",
    no_classes_found: "Tidak ditemukan kelas.",
    inherited_from: "Diturunkan dari",
    pseudo_element: "Pseudo ::{type} element",
    user_agent_stylesheet: "user agent stylesheet",
    inspector_stylesheet: "inspector-stylesheet",
    element_style: "element.style",
    add_new_property: "Tambah properti baru",
    
    // Context Menu
    copy_selector: "Salin selector",
    copy_declaration: "Salin deklarasi",
    copy_property: "Salin properti",
    copy_value: "Salin nilai",
    copy_rule: "Salin rule",
    copy_declaration_js: "Salin deklarasi sebagai JS",
    copy_all_declarations: "Salin semua deklarasi",
    copy_all_declarations_js: "Salin semua deklarasi sebagai JS"
  },
  console: {
    toolbar: {
      sidebar_toggle: "Tampilkan/Sembunyikan Sidebar Konsol",
      clear_console: "Bersihkan Konsol (Ctrl+L)",
      toggle_expressions: "Alihkan Ekspresi",
      filter_placeholder: "Saring",
      settings: "Pengaturan Konsol"
    },
    sidebar: {
      all_messages: "Semua pesan",
      user_messages: "Pesan pengguna",
      errors: "Kesalahan",
      warnings: "Peringatan",
      info: "Info",
      verbose: "Verbose",
      globals: "Globals" // Jika menampilkan variabel global
    },
    expression: {
      placeholder: "Evaluasi ekspresi (tekan Enter)",
      close: "Tutup ekspresi"
    },
    settings: {
      title: "Pengaturan",
      preferences: "Preferensi",
      shortcuts: "Pintasan",
      experiments: "Eksperimen",
      about: "Tentang",
      appearance: "Tampilan",
      language: "Bahasa",
      theme: "Tema DevTools",
      themes: {
        light: "Terang",
        dark: "Gelap",
        system: "Preferensi sistem"
      },
      editorTheme: "Tema Editor",
      editorThemes: {
        auto: "Otomatis (Sama dengan DevTools)",
        default: "Default (Putih)",
        eclipse: "Eclipse",
        neo: "Neo",
        monokai: "Monokai",
        dracula: "Dracula",
        material: "Material"
      },
      panelLayout: "Tata letak panel",
      layouts: {
        horizontal: "Horizontal",
        vertical: "Vertikal",
        auto: "Otomatis"
      },
      reload_hint: "(Membutuhkan muat ulang)",
      shortcuts_hint: "Aktifkan pintasan Ctrl + 1-9 untuk ganti panel",
      sources_section: "Sumber",
      source_maps: "Aktifkan source maps JavaScript",
      indentation: "Deteksi indentasi",
      network_section: "Jaringan",
      disable_cache: "Nonaktifkan cache (saat DevTools terbuka)",
      general: "Umum",
      open_settings: "Buka Pengaturan",
      next_panel: "Panel Berikutnya",
      coming_soon: "Segera hadir...",
      about_text: "MyDevTool v1.0 - Alat pengembang ringan untuk web mobile.",
      license_management: "Manajemen Lisensi",
current_key: "Kunci saat ini: ****-****-****-{last4}",
deactivate_btn: "Nonaktifkan & Keluar",
deactivate_confirm: "Yakin? Ini akan menonaktifkan lisensi di perangkat ini."

    },
    messages: {
      globals_header: "=== Variabel Global Sandbox ===",
      error_reading: "[Gagal membaca nilai]",
      listing_unavailable: "Daftar variabel global tidak tersedia",
      error_listing: "Gagal daftar global: {error}",
      
      // ✅ Pesan Error Baru
      illegal_return: "Uncaught SyntaxError: Illegal return statement",
      failed_resource: "Gagal memuat sumber: {url}",
      unknown_resource: "sumber tidak dikenal",
      unhandled_rejection: "Unhandled promise rejection: "
    }
  },
  source: {
    xhr_breakpoints: "Breakpoint XHR/fetch",
    event_listener_breakpoints: "Breakpoint Event Listener",
    no_breakpoints: "Tidak ada breakpoint",
    page: "Halaman",
    filesystem: "Filesystem",
    overrides: "Overrides",
    not_implemented: "Belum diimplementasikan",
    select_file: "Pilih file untuk dilihat",
    open_file_hint: "Ctrl+P → Buka file",
    run_command_hint: "Ctrl+Shift+P → Jalankan perintah",
    run_script: "Jalankan file JS saat ini (Langsung)",
    pause_resume: "Jeda/Lanjutkan skrip",
    step_over: "Step over",
    step_into: "Step into",
    step_out: "Step out",
    instrumentation_enable: "Aktifkan/Nonaktifkan Instrumentasi Halaman (Muat ulang diperlukan)",
    instrumentation_enabled_msg: "Instrumentasi Aktif. Klik untuk nonaktifkan (Muat ulang diperlukan).",
    instrumentation_disabled_msg: "Instrumentasi Nonaktif. Klik untuk aktifkan (Muat ulang diperlukan).",
    call_stack: "Call Stack",
    not_paused: "Tidak dijeda",
    resume: "Lanjutkan (F8)",
    uncaught_ex: "Jeda saat uncaught exceptions",
    caught_ex: "Jeda saat caught exceptions",
    url_contains: "URL mengandung...",
    remove_bp: "Hapus breakpoint",
    no_file_open: "Tidak ada file dibuka.",
    only_js: "Hanya file .js yang dapat dijalankan.",
    failed_fetch: "Gagal mem-fetch",
    enabled_reload: "✅ Aktif! Memuat ulang dalam 3s...",
    disabled_reload: "❌ Nonaktif. Memuat ulang dalam 1s...",
    sw_manager_missing: "SWManager tidak dimuat!"
  },
  network: {
    filter_placeholder: "Saring",
    record_btn: "Rekam log jaringan (Ctrl+E)",
    stop_record_btn: "Hentikan rekaman log jaringan (Ctrl+E)",
    clear_btn: "Bersihkan",
    toggle_filter: "Tampilkan/Sembunyikan bar saring",
    preserve_log: "Simpan log",
    disable_cache: "Nonaktifkan cache",
    disable_cache_hint: "Nonaktifkan cache browser (menambahkan timestamp ke permintaan)",
    invert: "Balik",
    hide_data_urls: "Sembunyikan data URL",
    show_waterfall: "Tampilkan Waterfall",
    settings: "Pengaturan Jaringan",
    overview_title: "Garis Waktu Jaringan (Tarik untuk saring)", // ✅ baru
    filters: {
      all: "Semua",
      xhr: "Fetch/XHR",
      js: "JS",
      css: "CSS",
      img: "Gambar",
      media: "Media",
      font: "Font",
      doc: "Dokumen",
      ws: "WS",
      other: "Lainnya",
      blocked_cookies: "Memiliki cookie yang diblokir",
      blocked_requests: "Permintaan diblokir",
      third_party: "Permintaan pihak ketiga"
    },
    
    empty_msg: {
      not_recording: "Rekam log jaringan (Ctrl+E) untuk menampilkan aktivitas jaringan.",
      recording: "Merekam aktivitas jaringan...",
      recording_desc: "Lakukan permintaan atau tekan <code>Ctrl+R</code> untuk merekam muat ulang."
    },
    
    columns: {
      name: "Nama",
      status: "Status",
      type: "Tipe",
      initiator: "Inisiator",
      size: "Ukuran",
      time: "Waktu",
      timeline: "Timeline"
    },
    
    footer: {
      requests: "{count} permintaan",
      transferred: "{size} MB ditransfer",
      finish: "Selesai: {time} s",
      requests_filtered: "{shown} dari {total} permintaan"
    },
    
    settings_popup: {
      large_rows: "Gunakan baris permintaan besar",
      group_frame: "Kelompokkan per frame",
      show_overview: "Tampilkan overview",
      capture_screenshots: "Tangkap screenshot"
    },
    interceptor: {
      fetch_failed: "Fetch gagal:",
      xhr_failed: "XHR gagal:",
      xhr_error: "XHR Error",
      xhr_request_failed: "Permintaan XHR Gagal",
      pausing_fetch: "🛑 Berhenti pada fetch:",
      pausing_xhr: "🛑 Berhenti pada XHR:",
      body_read_error: "[Tidak dapat membaca body]"
    }
  },
  network_details: {
  tabs: {
    headers: "Header",
    preview: "Pratinjau",
    response: "Respons",
    timing: "Waktu"
  },
  sections: {
    general: "Umum",
    response_headers: "Header Respons",
    request_headers: "Header Permintaan",
    request_payload: "Payload Permintaan"
  },
  general: {
    request_url: "URL Permintaan",
    request_method: "Metode Permintaan",
    status_code: "Kode Status",
    referrer_policy: "Kebijakan Referrer"
  },
  timing: {
    start_time: "Waktu Mulai",
    dns_lookup: "DNS Lookup",
    tcp_connect: "Koneksi TCP",
    ssl: "SSL",
    ttfb: "Menunggu (TTFB)",
    content_download: "Unduhan Konten",
    total: "Durasi Total"
  },
  messages: {
    loading: "Memuat konten...",
    no_content: "Tidak ada konten",
    failed_load: "Gagal memuat konten: {error}",
    empty: "(Kosong)",
    no_headers: "Tidak ada header ditemukan",
    binary_data: "Data biner atau FormData",
    timing_unavailable: "Data timing tidak tersedia untuk permintaan ini.",
    show_more: "Tampilkan lebih banyak ({remaining} KB tersisa)"
  }
},
  inspector: {
    color: "Warna",
    font: "Font",
    margin: "Margin",
    accessibility: "Aksesibilitas",
    name: "Nama",
    role: "Peran",
    focus: "Fokus",
    btn_missing: "Inspector: #inspect-btn tidak ditemukan"
  },
  layout: {
    page: "Halaman",
refresh_page: "Segarkan halaman",
design_mode: "Jadikan halaman dapat diedit",
  grid: "Grid",
  flexbox: "Flexbox",
  overlay_settings: "Pengaturan tampilan overlay",
  show_line_numbers: "Tampilkan nomor baris",
  show_track_sizes: "Tampilkan ukuran track",
  show_area_names: "Tampilkan nama area",
  extend_grid_lines: "Perpanjang garis grid",
  grid_overlays: "Overlay Grid",
  flex_overlays: "Overlay Flexbox",
  no_grid: "Tidak ditemukan elemen Grid",
  no_flex: "Tidak ditemukan elemen Flexbox"
}
};
