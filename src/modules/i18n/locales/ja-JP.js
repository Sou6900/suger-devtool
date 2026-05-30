export default {
  welcome: {
  title: "Suger DevTool へようこそ",
  subtitle: "続行するには言語を選択してください。",
  select_language: "言語を選択",
  continue: "続ける",
  already_logged_in: "すでにログインしています",

},

activation: {
  title: "プロダクトキーの入力",
  subtitle: "メールアドレスとプロダクトキーを入力してプレミアム機能を有効化してください。",
  label_email: "メール",
  label_key: "プロダクトキー",
  placeholder_email: "name@example.com",
  no_key: "キーがありませんか？",
  get_key_link: "ウェブサイトからキーを取得",
contact_support: "サポートに連絡",

  btn_cancel: "キャンセル",
  btn_next: "次へ",
  btn_back: "戻る",
  btn_activate: "有効化",
  error: "有効化に失敗しました",
  success: "成功！",
  verifying: "確認中...",
  connecting: "ライセンスサーバーに接続中..."
},

license: {
  title: "ライセンス契約",
  agree_checkbox: "利用規約に同意します",
  content: `
    <h3>Suger DevTool ライセンス契約</h3>
    <p><strong>重要：必ずお読みください</strong></p>
    <p>この EULA はあなたと Suger DevTool の間の法的契約です。</p>

    <p><strong>1. ライセンス付与</strong><br>
    個人または商用利用のための限定ライセンスが付与されます。</p>

    <p><strong>2. 制限事項</strong><br>
    ソフトウェアの分解、逆コンパイルなどは禁止されています。</p>

    <p><strong>3. 契約終了</strong><br>
    規約に違反した場合、ライセンスは自動的に終了します。</p>

    <p>「有効化」をクリックすると規約へ同意したことになります。</p>
  `
},
  common: {
    loading: "読み込み中...",
    cancel: "キャンセル",
    save: "保存",
    delete: "削除",
    refresh: "更新",
    clear: "クリア",
    close: "閉じる",
    filter: "フィルター",
    origin: "オリジン",
    key: "キー",
    value: "値",
    domain: "ドメイン",
    path: "パス",
    expires: "有効期限 / Max-Age",
    size: "サイズ",
    httpOnly: "HttpOnly",
    secure: "Secure",
    sameSite: "SameSite",
    priority: "優先度",
    yes: "はい",
    no: "いいえ"
  },
  tabs: {
    elements: "要素",
    console: "コンソール",
    network: "ネットワーク",
    source: "ソース",
    application: "アプリケーション",
    settings: "設定"
},
dom_action: {
  add_attr: "属性を追加",
  edit_html: "HTML として編集",
  duplicate: "要素を複製",
  cut: "切り取り",
  copy: "コピー",
  copy_ele: "要素をコピー",
  copy_html: "outerHTML をコピー",
  delete: "削除",
  del_ele: "要素を削除",
  del_child: "子要素を削除",
  del_attr: "属性を削除",
  show: "要素を表示",
  hide: "要素を非表示",
  focus: "フォーカス",
  collapse: "子要素を折りたたむ"
},
  settings: {
    title: "設定",
    preferences: "設定",
    shortcuts: "ショートカット",
    experiments: "実験的機能",
    about: "情報",
    appearance: "外観",
    language: "言語",
    theme: "DevTools テーマ",
    editorTheme: "エディターテーマ",
    panelLayout: "パネルレイアウト",
    reload_hint: "（再読み込みが必要）",
    no_virtualization_warning: "(ワードラップを有効にすると仮想化が無効になります。大規模なプロジェクトでは遅延が発生する可能性があります。)",

    shortcuts_hint: "Ctrl + 1〜9 でパネル切り替え",
    sources_section: "ソース",
    source_maps: "JavaScript ソースマップを有効化",
    indentation: "インデントを自動検出",
    network_section: "ネットワーク",
    disable_cache: "DevTools 開放中はキャッシュ無効",
    general: "一般",
    open_settings: "設定を開く",
    next_panel: "次のパネル",
    navigate_tree: "ツリーをナビゲート",
    expand_collapse: "展開 / 折りたたみ",
    edit_attr: "属性を編集",
    inspect_section: "インスペクト",
    hide_while_inspecting: "検証中は DevTool を隠す",
    collapse_mode: "折りたたみ動作",
    collapse_modes: {
      float: "フローティングボタン（バブル）",
      minimize: "パネルを最小化（ヘッダーのみ）"
    },
    license_management: "ライセンス管理",
    current_key: "現在のキー: ****-****-****-{last4}",
    deactivate_btn: "無効化してログアウト",
    deactivate_confirm: "本当によろしいですか？このデバイスのライセンスが無効化されます。",
    about_section: {
  build_status_label: "現在のビルド状況:",
  build_status_text: "これは初期の安定版リリース (v1.0) です。主要機能は徹底的にテストされていますが、軽微な実行時の例外が残る可能性があります。エンジニアリングチームは安定化パッチとパフォーマンス改善を継続的に展開しています。",  
  copyright: "© 2026 Suger DevTool. All rights reserved.",
  tagline: "インドで設計 • 世界で開発"
},
pref_styles: {
  title: "Styles",
  editing_behavior: "編集動作",
  edit_single_click: "シングルクリックでルールを編集",
  single_click_hint: "ダブルクリック/ダブルタップの代わりにシングルクリック編集を有効化",
  display_options: "表示オプション",
  show_user_agent: "User Agent スタイルを表示",
  autocomplete: "オートコンプリート",
  show_suggestions: "候補を表示",
  max_suggestions: "最大候補数",
  suggestions_hint: "値を大きくするとパフォーマンスに影響する場合があります"
},

pref_elements: {
  title: "Elements パネル",
  panel_layout: "パネルレイアウト",
  sub_tab_layout: "サブタブレイアウト",
  layout_vertical: "垂直（並列）",
  layout_horizontal: "水平（スタック）",
  show_styles: "メインタブに Styles を表示",
  show_computed: "メインタブに Computed を表示",
  show_layout: "メインタブに Layout を表示",
  console_label: "コンソール",
  show_main: "メインタブに表示",
  dom_appearance: "DOM ツリーの外観",
  show_comments: "HTML コメントを表示 ()",
  show_shadow: "User Agent Shadow DOM を表示",
  show_rulers: "インデントガイドを表示",
  highlight_updates: "DOM 更新をハイライト（点滅）",
  computed_box_model: "Computed と Box Model",
  highlight_hover: "Box Model ホバー時に要素を強調",
  show_tooltip: "Box ホバー時にツールチップを表示",
  show_zero: "Box Model に '0' の値を表示",
  element_badges: "要素バッジ"
},
pref_inspect: {
  tooltip_title: "インスペクターツールチップ",
  enable_tooltip: "検証中にツールチップを表示",
  show_hierarchy: "親階層を表示",
  show_dims: "サイズを表示",
  show_color: "色とフォント情報を表示",
  show_box_model: "Margin/Padding の値を表示",
  show_extra: "追加情報を表示 (A11y, コントラスト)",
  overlay_title: "ハイライトオーバーレイ",
  show_margin: "Margin を表示（オレンジ）",
  show_padding: "Padding を表示（緑）",
  show_border: "Border を表示（黄色）"
},

  },
  monitor: {
  title: "パフォーマンスモニター",
  cpu_usage: "CPU 使用率",
  js_heap_size: "JS ヒープサイズ",
  dom_nodes: "DOM ノード",
  js_event_listeners: "JS イベントリスナー",
  frames_per_sec: "毎秒フレーム数"
},
  application: {
    dashboard: "ストレージ",
    manifest: "マニフェスト",
    service_workers: "Service Workers",
    local_storage: "Local Storage",
    session_storage: "Session Storage",
    indexed_db: "IndexedDB",
    cookies: "Cookies",
    cache: "Cache",
    cache_storage: "Cache Storage",
    storage_title: "ストレージ",
    usage_title: "使用状況",
    usage_text: "{used} MB / {quota} MB 使用",
    total_usage: "総使用量",
    clear_site_data: "サイトデータを削除",
    inc_third_party: "サードパーティ Cookie を含む",
    clear_options: {
      app: "アプリ",
      unregister_sw: "Service Worker 登録解除",
      storage: "ストレージ",
      ls_ss: "Local / Session Storage",
      idb: "IndexedDB",
      websql: "Web SQL",
      cookies: "Cookies",
      cache: "Cache",
      cache_storage: "Cache Storage"
    },
    empty_view: "オリジンを選択するとデータが表示されます。",
    empty_idb: "Object Store を選択してください。",
    no_manifest: "マニフェストが見つかりません",
    no_manifest_desc: "manifest.json が読み込まれていません。",
    no_sw: "Service Worker が検出されません",
    identity: "アイデンティティ",
    presentation: "表示",
    icons: "アイコン",
    no_icons: "アイコンがありません",
    view_raw: "JSON（生データ）を見る",
    sw_offline: "オフライン",
    sw_update_reload: "リロード時に更新",
    sw_status: "ステータス",
    sw_running: "実行中",
    sw_stopped: "停止",
    sw_clients: "クライアント",
    sw_view_clients: "クライアントを見る",
    update: "更新",
    unregister: "登録解除",
    clear_all_confirm: "すべて削除しますか？",
    clear_cookies_confirm: "Cookie を削除しますか？",
    delete_cache_confirm: "キャッシュを削除しますか？",
    unregister_sw_confirm: "この Service Worker を登録解除しますか？"
  },
  elements: {
    styles: "Styles",
    computed: "Computed",
    layout: "レイアウト",
    filter_placeholder: "フィルター",
    show_all: "すべて表示",
    group: "グループ",
    box_model: {
      margin: "Margin",
      border: "Border",
      padding: "Padding",
      tooltip: "ツールチップ",
      tooltip_title: "要素をホバー/クリックしたとき Inspector のツールチップを表示"
    },
    groups: {
      other: "その他"
    },
    no_css_data: "エラー：CSSData.js が読み込まれていません。"
  },
  styles: {
    filter_placeholder: "フィルター",
    toggle_element_state: "要素の状態を切り替え",
    element_classes: "要素クラス",
    new_style_rule: "新規スタイルルール",
    force_element_state: "要素の状態を強制",
    add_new_class: "新しいクラスを追加",
    no_classes_found: "クラスがありません。",
    inherited_from: "継承元",
    pseudo_element: "Pseudo ::{type} element",
    user_agent_stylesheet: "UA stylesheet",
    inspector_stylesheet: "inspector-stylesheet",
    element_style: "element.style",
    add_new_property: "プロパティを追加",

    // Context Menu
    copy_selector: "セレクターをコピー",
    copy_declaration: "宣言をコピー",
    copy_property: "プロパティをコピー",
    copy_value: "値をコピー",
    copy_rule: "ルールをコピー",
    copy_declaration_js: "JS 形式で宣言をコピー",
    copy_all_declarations: "すべての宣言をコピー",
    copy_all_declarations_js: "すべての宣言を JS 形式でコピー"
  },
  console: {
    toolbar: {
      sidebar_toggle: "サイドバー表示/非表示",
      clear_console: "コンソールをクリア (Ctrl+L)",
      toggle_expressions: "式パネルを切り替え",
      filter_placeholder: "フィルター",
      settings: "コンソール設定"
    },
    sidebar: {
      all_messages: "すべてのメッセージ",
      user_messages: "ユーザーメッセージ",
      errors: "エラー",
      warnings: "警告",
      info: "情報",
      verbose: "詳細",
      globals: "グローバル"
    },
    expression: {
      placeholder: "式を評価（Enter）",
      close: "閉じる"
    },
    settings: {
      title: "設定",
      preferences: "設定",
      shortcuts: "ショートカット",
      experiments: "実験機能",
      about: "情報",
      appearance: "外観",
      language: "言語",
      theme: "DevTools テーマ",
      themes: {
        light: "ライト",
        dark: "ダーク",
        system: "システム設定"
      },
      editorTheme: "エディターテーマ",
      editorThemes: {
        auto: "自動 (DevTools と同じ)",
        default: "デフォルト (白)",
        eclipse: "Eclipse",
        neo: "Neo",
        monokai: "Monokai",
        dracula: "Dracula",
        material: "Material"
      },
      panelLayout: "パネルレイアウト",
      layouts: {
        horizontal: "水平",
        vertical: "垂直",
        auto: "自動"
      },
      reload_hint: "（再読み込みが必要）",
      shortcuts_hint: "Ctrl + 1〜9 でパネル切替",
      sources_section: "ソース",
      source_maps: "ソースマップを有効化",
      indentation: "インデント自動検出",
      network_section: "ネットワーク",
      disable_cache: "DevTools 開放中はキャッシュ無効化",
      general: "一般",
      open_settings: "設定を開く",
      next_panel: "次のパネル",
      coming_soon: "準備中...",
      about_text: "MyDevTool v1.0 - 軽量モバイル用 DevTools"
    },
    messages: {
      globals_header: "=== サンドボックスのグローバル変数 ===",
      error_reading: "[値を読み取れません]",
      listing_unavailable: "グローバル変数一覧は利用不可",
      error_listing: "一覧取得エラー: {error}",
      illegal_return: "Uncaught SyntaxError: Illegal return statement",
      failed_resource: "リソース読み込み失敗: {url}",
      unknown_resource: "不明なリソース",
      unhandled_rejection: "Unhandled promise rejection: "
    }
  },
  source: {
    xhr_breakpoints: "XHR / fetch ブレークポイント",
    event_listener_breakpoints: "イベントリスナーブレークポイント",
    no_breakpoints: "ブレークポイントなし",
    page: "ページ",
    filesystem: "ファイルシステム",
    overrides: "Overrides",
    not_implemented: "未実装",
    select_file: "ファイルを選択してください",
    open_file_hint: "Ctrl+P → ファイルを開く",
    run_command_hint: "Ctrl+Shift+P → コマンド実行",
    run_script: "現在の JS を実行",
    pause_resume: "一時停止 / 再開",
    step_over: "ステップオーバー",
    step_into: "ステップイン",
    step_out: "ステップアウト",
    instrumentation_enable: "ページ計測を有効/無効（再読み込み必要）",
    instrumentation_enabled_msg: "有効（再読み込み必要）",
    instrumentation_disabled_msg: "無効（再読み込み必要）",
    call_stack: "コールスタック",
    not_paused: "一時停止していません",
    resume: "再開 (F8)",
    uncaught_ex: "未処理例外で停止",
    caught_ex: "処理済み例外で停止",
    url_contains: "URL に含む…",
    remove_bp: "ブレークポイント削除",
    no_file_open: "ファイルが開かれていません。",
    only_js: "JS ファイルのみ実行可能。",
    failed_fetch: "フェッチ失敗",
    enabled_reload: "有効! 3秒後に再読み込み...",
    disabled_reload: "無効。1秒後に再読み込み...",
    sw_manager_missing: "SWManager が読み込まれていません!"
  },
  network: {
    filter_placeholder: "フィルター",
    record_btn: "ネットワーク記録 (Ctrl+E)",
    stop_record_btn: "記録停止 (Ctrl+E)",
    clear_btn: "クリア",
    toggle_filter: "フィルターバーを開閉",
    preserve_log: "ログを保持",
    disable_cache: "キャッシュ無効",
    disable_cache_hint: "リクエストにタイムスタンプを追加してキャッシュ無効化",
    invert: "反転",
    hide_data_urls: "data URL を非表示",
    show_waterfall: "ウォーターフォール表示",
    settings: "ネットワーク設定",
    overview_title: "ネットワークタイムライン（ドラッグでフィルター）",

    filters: {
      all: "すべて",
      xhr: "XHR / Fetch",
      js: "JS",
      css: "CSS",
      img: "画像",
      media: "メディア",
      font: "フォント",
      doc: "ドキュメント",
      ws: "WebSocket",
      other: "その他",
      blocked_cookies: "ブロックされた Cookie",
      blocked_requests: "ブロックされたリクエスト",
      third_party: "サードパーティ"
    },

    empty_msg: {
      not_recording: "ネットワーク記録を開始してください (Ctrl+E)。",
      recording: "記録中...",
      recording_desc: "リクエストを行うか <code>Ctrl+R</code> でページを再読み込みしてください。"
    },

    columns: {
      name: "名前",
      status: "ステータス",
      type: "タイプ",
      initiator: "イニシエーター",
      size: "サイズ",
      time: "時間",
      timeline: "タイムライン"
    },

    footer: {
      requests: "{count} 件のリクエスト",
      transferred: "{size} MB 転送",
      finish: "完了: {time} 秒",
      requests_filtered: "{shown} / {total} 表示"
    },

    settings_popup: {
      large_rows: "大きい行を使用",
      group_frame: "フレームごとにグループ化",
      show_overview: "概要を表示",
      capture_screenshots: "スクリーンショットを取得"
    },

    interceptor: {
      fetch_failed: "Fetch 失敗:",
      xhr_failed: "XHR 失敗:",
      xhr_error: "XHR エラー",
      xhr_request_failed: "XHR リクエスト失敗",
      pausing_fetch: "🛑 Fetch 停止:",
      pausing_xhr: "🛑 XHR 停止:",
      body_read_error: "[Body を読み取れません]"
    }
  },
  network_details: {
  tabs: {
    headers: "ヘッダー",
    preview: "プレビュー",
    response: "レスポンス",
    timing: "タイミング"
  },
  sections: {
    general: "一般",
    response_headers: "レスポンスヘッダー",
    request_headers: "リクエストヘッダー",
    request_payload: "リクエストペイロード"
  },
  general: {
    request_url: "リクエスト URL",
    request_method: "リクエスト方法",
    status_code: "ステータスコード",
    referrer_policy: "リファラーポリシー"
  },
  timing: {
    start_time: "開始時間",
    dns_lookup: "DNS Lookup",
    tcp_connect: "TCP 接続",
    ssl: "SSL",
    ttfb: "待機 (TTFB)",
    content_download: "コンテンツダウンロード",
    total: "合計時間"
  },
  messages: {
    loading: "コンテンツを読み込み中…",
    no_content: "コンテンツがありません",
    failed_load: "読み込みに失敗しました: {error}",
    empty: "(空)",
    no_headers: "ヘッダーが見つかりません",
    binary_data: "バイナリまたは FormData オブジェクト",
    timing_unavailable: "このリクエストのタイミングデータはありません。",
    show_more: "さらに表示 ({remaining} KB 残り)"
  }
},
  inspector: {
    color: "色",
    font: "フォント",
    margin: "マージン",
    accessibility: "アクセシビリティ",
    name: "名前",
    role: "ロール",
    focus: "フォーカス",
    btn_missing: "Inspector: #inspect-btn が見つかりません"
  },
  layout: {
    page: "ページ",
refresh_page: "ページを更新",
design_mode: "ページを編集可能にする",

  grid: "グリッド",
  flexbox: "フレックスボックス",
  overlay_settings: "オーバーレイ設定",
  show_line_numbers: "行番号を表示",
  show_track_sizes: "トラックサイズを表示",
  show_area_names: "エリア名を表示",
  extend_grid_lines: "グリッドラインを拡張",
  grid_overlays: "グリッドオーバーレイ",
  flex_overlays: "フレックスボックスオーバーレイ",
  no_grid: "グリッド要素が見つかりません",
  no_flex: "フレックスボックス要素が見つかりません"
}
};
