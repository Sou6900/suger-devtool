export default {
  welcome: {
  title: "欢迎使用 Suger DevTool",
  subtitle: "请选择您希望使用的语言。",
  select_language: "选择语言",
  continue: "继续",
  already_logged_in: "我已经登录了",

},

activation: {
  title: "输入产品密钥",
  subtitle: "输入您的邮箱和产品密钥以解锁高级功能。",
  label_email: "邮箱",
  label_key: "产品密钥",
  placeholder_email: "name@example.com",
  no_key: "没有密钥？",
  get_key_link: "从网站获取密钥",
contact_support: "联系客服",

  btn_cancel: "取消",
  btn_next: "下一步",
  btn_back: "返回",
  btn_activate: "激活",
  error: "激活失败",
  success: "成功！",
  verifying: "正在验证...",
  connecting: "正在连接许可服务器..."
},

license: {
  title: "许可协议",
  agree_checkbox: "我接受条款和条件",
  content: `
    <h3>Suger DevTool 许可协议</h3>
    <p><strong>重要：请仔细阅读</strong></p>
    <p>本 EULA 为您与 Suger DevTool 之间的法律协议。</p>

    <p><strong>1. 许可授予</strong><br>
    您获得软件的有限、不可转让的授权。</p>

    <p><strong>2. 限制</strong><br>
    禁止反编译、反向工程、修改本软件。</p>

    <p><strong>3. 终止</strong><br>
    若违反条款，本许可将自动终止。</p>

    <p>点击“激活”即表示您同意本协议。</p>
  `
},

  common: {
    loading: "加载中...",
    cancel: "取消",
    save: "保存",
    delete: "删除",
    refresh: "刷新",
    clear: "清除",
    close: "关闭",
    filter: "筛选",
    origin: "来源",
    key: "键",
    value: "值",
    domain: "域名",
    path: "路径",
    expires: "过期时间 / Max-Age",
    size: "大小",
    httpOnly: "HttpOnly",
    secure: "Secure",
    sameSite: "SameSite",
    priority: "优先级",
    yes: "是",
    no: "否"
  },

  tabs: {
    elements: "元素",
    console: "控制台",
    network: "网络",
    source: "源代码",
    application: "应用",
    settings: "设置"
},
dom_action: {
  add_attr: "添加属性",
  edit_html: "以 HTML 编辑",
  duplicate: "复制元素",
  cut: "剪切",
  copy: "复制",
  copy_ele: "复制元素",
  copy_html: "复制 outerHTML",
  delete: "删除",
  del_ele: "删除元素",
  del_child: "删除子元素",
  del_attr: "删除属性",
  show: "显示元素",
  hide: "隐藏元素",
  focus: "聚焦",
  collapse: "折叠子元素"
},
  settings: {
    title: "设置",
    preferences: "偏好设置",
    shortcuts: "快捷键",
    experiments: "实验性功能",
    about: "关于",
    appearance: "外观",
    language: "语言",
    theme: "DevTools 主题",
    editorTheme: "编辑器主题",
    panelLayout: "面板布局",
    reload_hint: "（需要刷新）",
    no_virtualization_warning: "(启用自动换行将禁用虚拟化。在大型项目中可能会出现卡顿。)",

    shortcuts_hint: "使用 Ctrl + 1-9 切换面板",
    sources_section: "Sources",
    source_maps: "启用 JavaScript Source Maps",
    indentation: "自动检测缩进",
    network_section: "网络",
    disable_cache: "DevTools 打开时禁用缓存",
    general: "通用",
    open_settings: "打开设置",
    next_panel: "下一个面板",
    navigate_tree: "导航树结构",
    expand_collapse: "展开 / 折叠",
    edit_attr: "编辑属性",
    inspect_section: "检查",
    hide_while_inspecting: "检查元素时隐藏 DevTool",
    collapse_mode: "折叠方式",
    collapse_modes: {
      float: "浮动按钮（气泡）",
      minimize: "最小化面板（仅标题）"
    },
    license_management: "许可证管理",
    current_key: "当前密钥: ****-****-****-{last4}",
    deactivate_btn: "停用并退出",
    deactivate_confirm: "确定吗？这将在此设备上停用许可证。",
    about_section: {
  build_status_label: "当前构建状态：",
  build_status_text: "这是初始稳定版本 (v1.0)。虽然核心功能已经过严格测试，但可能仍存在一些小的运行时边缘情况。我们的工程团队正在持续发布稳定性补丁和性能优化。",  
  copyright: "© 2026 Suger DevTool. 版权所有。",
  tagline: "印度设计 • 全球研发"
  },
  pref_styles: {
  title: "样式",
  editing_behavior: "编辑行为",
  edit_single_click: "单击编辑规则",
  single_click_hint: "启用单击编辑，替代双击/双击触控",
  display_options: "显示选项",
  show_user_agent: "显示 User Agent 样式",
  autocomplete: "自动补全",
  show_suggestions: "显示建议",
  max_suggestions: "最大建议数量",
  suggestions_hint: "较高的值可能会影响性能"
},

  pref_elements: {
  title: "Elements 面板",
  panel_layout: "面板布局",
  sub_tab_layout: "子标签布局",
  layout_vertical: "垂直（并排）",
  layout_horizontal: "水平（堆叠）",
  show_styles: "在主标签中显示 Styles",
  show_computed: "在主标签中显示 Computed",
  show_layout: "在主标签中显示 Layout",
  console_label: "控制台",
  show_main: "在主标签中显示",
  dom_appearance: "DOM 树外观",
  show_comments: "显示 HTML 注释 ()",
  show_shadow: "显示 User Agent Shadow DOM",
  show_rulers: "显示缩进参考线",
  highlight_updates: "高亮 DOM 更新（闪烁）",
  computed_box_model: "Computed 与 Box Model",
  highlight_hover: "Box Model 悬停时高亮元素",
  show_tooltip: "Box 悬停时显示提示",
  show_zero: "在 Box Model 中显示 '0' 值",
  element_badges: "元素标记"
},
pref_inspect: {
  tooltip_title: "检查器工具提示",
  enable_tooltip: "检查时显示工具提示",
  show_hierarchy: "显示父级层级",
  show_dims: "显示尺寸",
  show_color: "显示颜色和字体信息",
  show_box_model: "显示 Margin/Padding 值",
  show_extra: "显示额外信息（A11y，对比度）",
  overlay_title: "高亮叠加层",
  show_margin: "显示 Margin（橙色）",
  show_padding: "显示 Padding（绿色）",
  show_border: "显示 Border（黄色）"
},

},
monitor: {
  title: "性能监视器",
  cpu_usage: "CPU 使用率",
  js_heap_size: "JS 堆大小",
  dom_nodes: "DOM 节点",
  js_event_listeners: "JS 事件监听器",
  frames_per_sec: "每秒帧数"
},
  application: {
    dashboard: "存储",
    manifest: "Manifest",
    service_workers: "Service Workers",
    local_storage: "Local Storage",
    session_storage: "Session Storage",
    indexed_db: "IndexedDB",
    cookies: "Cookies",
    cache: "Cache",
    cache_storage: "Cache Storage",
    storage_title: "存储",
    usage_title: "使用情况",
    usage_text: "已使用 {used} MB / 总计 {quota} MB",
    total_usage: "总使用量",
    clear_site_data: "清除站点数据",
    inc_third_party: "包括第三方 Cookie",
    clear_options: {
      app: "应用",
      unregister_sw: "注销 Service Worker",
      storage: "存储",
      ls_ss: "Local / Session Storage",
      idb: "IndexedDB",
      websql: "Web SQL",
      cookies: "Cookies",
      cache: "Cache",
      cache_storage: "Cache Storage"
    },
    empty_view: "选择一个来源查看数据。",
    empty_idb: "请选择一个 Object Store。",
    no_manifest: "未检测到 Manifest",
    no_manifest_desc: "此页面未包含 manifest.json。",
    no_sw: "未检测到 Service Worker",
    identity: "身份",
    presentation: "展示",
    icons: "图标",
    no_icons: "未找到图标",
    view_raw: "查看 JSON 原始数据",
    sw_offline: "离线",
    sw_update_reload: "重载时更新",
    sw_status: "状态",
    sw_running: "运行中",
    sw_stopped: "已停止",
    sw_clients: "客户端",
    sw_view_clients: "查看客户端",
    update: "更新",
    unregister: "注销",
    clear_all_confirm: "确定全部清除？",
    clear_cookies_confirm: "确定删除 Cookies？",
    delete_cache_confirm: "确定删除缓存？",
    unregister_sw_confirm: "确定注销 Service Worker？"
  },

  elements: {
    styles: "Styles",
    computed: "Computed",
    layout: "布局",
    filter_placeholder: "筛选",
    show_all: "显示全部",
    group: "分组",
    box_model: {
      margin: "Margin",
      border: "Border",
      padding: "Padding",
      tooltip: "提示",
      tooltip_title: "悬停/点击元素时显示 Inspector 工具提示"
    },
    groups: {
      other: "其他"
    },
    no_css_data: "错误：未加载 CSSData.js。"
  },

  styles: {
    filter_placeholder: "筛选",
    toggle_element_state: "切换元素状态",
    element_classes: "元素类",
    new_style_rule: "新建样式规则",
    force_element_state: "强制元素状态",
    add_new_class: "添加新类",
    no_classes_found: "未找到类。",
    inherited_from: "继承自",
    pseudo_element: "伪元素 ::{type}",
    user_agent_stylesheet: "UA 样式表",
    inspector_stylesheet: "inspector-stylesheet",
    element_style: "element.style",
    add_new_property: "添加新属性",

    // Context Menu
    copy_selector: "复制选择器",
    copy_declaration: "复制声明",
    copy_property: "复制属性",
    copy_value: "复制值",
    copy_rule: "复制规则",
    copy_declaration_js: "复制为 JS 格式",
    copy_all_declarations: "复制所有声明",
    copy_all_declarations_js: "复制所有声明（JS 格式）"
  },

  console: {
    toolbar: {
      sidebar_toggle: "显示/隐藏侧栏",
      clear_console: "清空控制台 (Ctrl+L)",
      toggle_expressions: "切换表达式面板",
      filter_placeholder: "筛选",
      settings: "控制台设置"
    },
    sidebar: {
      all_messages: "全部消息",
      user_messages: "用户消息",
      errors: "错误",
      warnings: "警告",
      info: "信息",
      verbose: "详细",
      globals: "全局变量"
    },
    expression: {
      placeholder: "输入表达式并按 Enter",
      close: "关闭"
    },
    settings: {
      title: "设置",
      preferences: "偏好设置",
      shortcuts: "快捷键",
      experiments: "实验",
      about: "关于",
      appearance: "外观",
      language: "语言",
      theme: "DevTools 主题",
      themes: {
        light: "浅色",
        dark: "深色",
        system: "跟随系统"
      },
      editorTheme: "编辑器主题",
      editorThemes: {
        auto: "自动（与 DevTools 一致）",
        default: "默认（白色）",
        eclipse: "Eclipse",
        neo: "Neo",
        monokai: "Monokai",
        dracula: "Dracula",
        material: "Material"
      },
      panelLayout: "面板布局",
      layouts: {
        horizontal: "水平",
        vertical: "垂直",
        auto: "自动"
      },
      reload_hint: "（需要刷新）",
      shortcuts_hint: "按 Ctrl + 1-9 切换面板",
      sources_section: "Source",
      source_maps: "启用源映射",
      indentation: "自动检测缩进",
      network_section: "网络",
      disable_cache: "打开 DevTools 时禁用缓存",
      general: "通用",
      open_settings: "打开设置",
      next_panel: "下一个面板",
      coming_soon: "即将推出...",
      about_text: "MyDevTool v1.0 - 移动端轻量级开发者工具"
    },

    messages: {
      globals_header: "=== 沙盒全局变量 ===",
      error_reading: "[无法读取值]",
      listing_unavailable: "无法获取全局变量列表",
      error_listing: "列表获取失败: {error}",
      illegal_return: "Uncaught SyntaxError: Illegal return statement",
      failed_resource: "资源加载失败: {url}",
      unknown_resource: "未知资源",
      unhandled_rejection: "未处理的 Promise 拒绝: "
    }
  },

  source: {
    xhr_breakpoints: "XHR / fetch 断点",
    event_listener_breakpoints: "事件监听断点",
    no_breakpoints: "无断点",
    page: "页面",
    filesystem: "文件系统",
    overrides: "Overrides",
    not_implemented: "未实现",
    select_file: "请选择文件",
    open_file_hint: "Ctrl+P → 打开文件",
    run_command_hint: "Ctrl+Shift+P → 运行命令",
    run_script: "运行当前 JS 文件",
    pause_resume: "暂停 / 恢复",
    step_over: "逐过程",
    step_into: "逐语句",
    step_out: "跳出",
    instrumentation_enable: "启用/禁用页面监控（需要刷新）",
    instrumentation_enabled_msg: "已启用（刷新后生效）",
    instrumentation_disabled_msg: "已禁用（刷新后生效）",
    call_stack: "调用栈",
    not_paused: "未暂停",
    resume: "恢复 (F8)",
    uncaught_ex: "遇到未捕获异常时暂停",
    caught_ex: "遇到已捕获异常时暂停",
    url_contains: "URL 包含…",
    remove_bp: "删除断点",
    no_file_open: "未打开任何文件。",
    only_js: "只能执行 JS 文件。",
    failed_fetch: "请求失败",
    enabled_reload: "已启用！3 秒后重新加载...",
    disabled_reload: "已禁用。1 秒后重新加载...",
    sw_manager_missing: "SWManager 未加载！"
  },

  network: {
    filter_placeholder: "筛选",
    record_btn: "开始记录网络日志 (Ctrl+E)",
    stop_record_btn: "停止记录 (Ctrl+E)",
    clear_btn: "清除",
    toggle_filter: "显示/隐藏筛选栏",
    preserve_log: "保留日志",
    disable_cache: "禁用缓存",
    disable_cache_hint: "为请求添加时间戳以绕过缓存",
    invert: "反转",
    hide_data_urls: "隐藏 data URL",
    show_waterfall: "显示瀑布流",
    settings: "网络设置",
    overview_title: "网络时间线（拖动筛选）",

    filters: {
      all: "全部",
      xhr: "XHR / Fetch",
      js: "JS",
      css: "CSS",
      img: "图片",
      media: "媒体",
      font: "字体",
      doc: "文档",
      ws: "WebSocket",
      other: "其他",
      blocked_cookies: "被阻止的 Cookie",
      blocked_requests: "被阻止的请求",
      third_party: "第三方"
    },

    empty_msg: {
      not_recording: "开始记录网络日志 (Ctrl+E)。",
      recording: "正在记录...",
      recording_desc: "执行网络请求或按 <code>Ctrl+R</code> 刷新页面。"
    },

    columns: {
      name: "名称",
      status: "状态",
      type: "类型",
      initiator: "发起者",
      size: "大小",
      time: "时间",
      timeline: "时间线"
    },

    footer: {
      requests: "请求数: {count}",
      transferred: "已传输: {size} MB",
      finish: "完成: {time} 秒",
      requests_filtered: "显示 {shown} / {total}"
    },

    settings_popup: {
      large_rows: "使用大行显示",
      group_frame: "按 Frame 分组",
      show_overview: "显示概览",
      capture_screenshots: "捕获屏幕截图"
    },

    interceptor: {
      fetch_failed: "Fetch 失败:",
      xhr_failed: "XHR 失败:",
      xhr_error: "XHR 错误",
      xhr_request_failed: "XHR 请求失败",
      pausing_fetch: "🛑 在 Fetch 暂停:",
      pausing_xhr: "🛑 在 XHR 暂停:",
      body_read_error: "[无法读取 Body]"
    }
  },
  network_details: {
  tabs: {
    headers: "请求头",
    preview: "预览",
    response: "响应",
    timing: "计时"
  },
  sections: {
    general: "通用",
    response_headers: "响应头",
    request_headers: "请求头",
    request_payload: "请求负载"
  },
  general: {
    request_url: "请求 URL",
    request_method: "请求方法",
    status_code: "状态码",
    referrer_policy: "引用策略"
  },
  timing: {
    start_time: "开始时间",
    dns_lookup: "DNS 查询",
    tcp_connect: "TCP 连接",
    ssl: "SSL",
    ttfb: "等待 (TTFB)",
    content_download: "内容下载",
    total: "总耗时"
  },
  messages: {
    loading: "正在加载内容...",
    no_content: "无内容",
    failed_load: "内容加载失败: {error}",
    empty: "(空)",
    no_headers: "未找到头部",
    binary_data: "二进制或 FormData 数据",
    timing_unavailable: "该请求无可用计时数据。",
    show_more: "显示更多（剩余 {remaining} KB）"
  }
},

  inspector: {
    color: "颜色",
    font: "字体",
    margin: "外边距",
    accessibility: "可访问性",
    name: "名称",
    role: "角色",
    focus: "焦点",
    btn_missing: "Inspector：未找到 #inspect-btn"
  },
  layout: {
    page: "页面",
refresh_page: "刷新页面",
design_mode: "使页面可编辑",
  grid: "网格",
  flexbox: "Flexbox",
  overlay_settings: "叠加层显示设置",
  show_line_numbers: "显示行号",
  show_track_sizes: "显示轨道尺寸",
  show_area_names: "显示区域名称",
  extend_grid_lines: "延伸网格线",
  grid_overlays: "网格叠加",
  flex_overlays: "Flexbox 叠加",
  no_grid: "未找到网格元素",
  no_flex: "未找到 Flexbox 元素"
}
};
