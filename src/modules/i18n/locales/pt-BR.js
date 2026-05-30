export default {
  welcome: {
  title: "Bem-vindo ao Suger DevTool",
  subtitle: "Selecione o idioma preferido para continuar.",
  select_language: "Selecionar idioma",
  continue: "Continuar",
  already_logged_in: "Já estou conectado",

},

activation: {
  title: "Inserir chave do produto",
  subtitle: "Digite seu e-mail e chave para desbloquear recursos premium.",
  label_email: "EMAIL",
  label_key: "CHAVE DO PRODUTO",
  placeholder_email: "name@example.com",
  no_key: "Não tem uma chave?",
  btn_cancel: "Cancelar",
  btn_next: "Avançar",
  btn_back: "Voltar",
  btn_activate: "Ativar",
  error: "Falha na ativação",
  success: "Sucesso!",
  verifying: "Verificando...",
  connecting: "Conectando ao servidor de licenças..."
},

license: {
  title: "Contrato de Licença",
  agree_checkbox: "Aceito os termos e condições",
  content: `
    <h3>Contrato de Licença do Suger DevTool</h3>
    <p><strong>IMPORTANTE: LEIA COM ATENÇÃO</strong></p>
    <p>Este EULA é um acordo legal entre você e o Suger DevTool.</p>

    <p><strong>1. CONCESSÃO DE LICENÇA</strong><br>
    O Suger DevTool concede a você uma licença limitada e revogável para uso pessoal ou comercial.</p>

    <p><strong>2. RESTRIÇÕES</strong><br>
    Você não pode desmontar, descompilar ou criar obras derivadas.</p>

    <p><strong>3. TÉRMINO</strong><br>
    Esta licença será encerrada automaticamente se houver violação dos termos.</p>

    <p>Ao clicar em "Ativar", você concorda com este contrato.</p>
  `
}
,
  common: {
    loading: "Carregando...",
    cancel: "Cancelar",
    save: "Salvar",
    delete: "Excluir",
    refresh: "Atualizar",
    clear: "Limpar",
    filter: "Filtrar",
    close: "Fechar",
    origin: "Origem",
    key: "Chave",
    value: "Valor",
    domain: "Domínio",
    path: "Caminho",
    expires: "Expira",
    size: "Tamanho",
    httpOnly: "HttpOnly",
    secure: "Secure",
    sameSite: "SameSite",
    priority: "Prioridade",
    yes: "Sim",
    no: "Não"
  },
  tabs: {
    elements: "Elementos",
    console: "Console",
    network: "Rede",
    source: "Fontes",
    application: "Aplicativo",
    settings: "Configurações"
  },
  dom_action: {
  add_attr: "Adicionar atributo",
  edit_html: "Editar como HTML",
  duplicate: "Duplicar elemento",
  cut: "Cortar",
  copy: "Copiar",
  copy_ele: "Copiar elemento",
  copy_html: "Copiar outerHTML",
  delete: "Excluir",
  del_ele: "Excluir elemento",
  del_child: "Excluir filhos",
  del_attr: "Excluir atributos",
  show: "Mostrar elemento",
  hide: "Ocultar elemento",
  focus: "Focar",
  collapse: "Recolher filhos"
},
monitor: {
  title: "Monitor de desempenho",
  cpu_usage: "Uso de CPU",
  js_heap_size: "Tamanho do heap JS",
  dom_nodes: "Nós DOM",
  js_event_listeners: "Listeners de eventos JS",
  frames_per_sec: "Quadros por segundo"
},
  settings: {
    title: "Configurações",
    preferences: "Preferências",
    shortcuts: "Atalhos",
    experiments: "Experimentos",
    about: "Sobre",
    appearance: "Aparência",
    language: "Idioma",
    theme: "Tema do DevTools",
    themes: {
      light: "Claro",
      dark: "Escuro",
      system: "Sistema"
    },
    editorTheme: "Tema do Editor",
    editorThemes: {
      auto: "Auto (Igual ao DevTools)",
      default: "Padrão (Branco)",
      eclipse: "Eclipse",
      neo: "Neo",
      monokai: "Monokai",
      dracula: "Dracula",
      material: "Material"
    },
    panelLayout: "Layout do painel",
    layouts: {
      horizontal: "Horizontal",
      vertical: "Vertical",
      auto: "Auto"
    },
    reload_hint: "(Requer recarregar)",
    no_virtualization_warning: "(Ativar a quebra de linha desativa a virtualização. Pode haver lentidão em projetos grandes.)",

    shortcuts_hint: "Use Ctrl + 1-9 para alternar painéis",
    sources_section: "Fontes",
    source_maps: "Habilitar mapas de origem JS",
    indentation: "Detectar indentação",
    network_section: "Rede",
    disable_cache: "Desativar cache (enquanto DevTools estiver aberto)",
    general: "Geral",
    open_settings: "Abrir Configurações",
    next_panel: "Próximo Painel",
    coming_soon: "Em breve...",
    about_text: "MyDevTool v1.0 - Ferramenta leve para web móvel.",
    inspect_section: "Inspecionar",
    hide_while_inspecting: "Ocultar DevTool ao inspecionar",
    collapse_mode: "Ação de recolher",
    collapse_modes: {
      float: "Botão flutuante (Bolha)",
      minimize: "Minimizar painel (Apenas cabeçalho)"
    },
    license_management: "Gerenciamento de Licença",
current_key: "Chave atual: ****-****-****-{last4}",
deactivate_btn: "Desativar e Sair",
deactivate_confirm: "Tem certeza? Isso desativará a licença neste dispositivo.",
about_section: {
  build_status_label: "Status atual da versão:",
  build_status_text: "Esta é a versão estável inicial (v1.0). Embora os recursos principais sejam amplamente testados, pequenos casos extremos de execução podem ocorrer. Nossa equipe de engenharia está aplicando patches de estabilidade e otimizações de desempenho continuamente.",
  copyright: "© 2026 Suger DevTool. Todos os direitos reservados.",
  tagline: "Projetado na Índia • Desenvolvido globalmente"
},
pref_styles: {
  title: "Styles",
  editing_behavior: "Comportamento de edição",
  edit_single_click: "Editar regra com um clique",
  single_click_hint: "Ativar edição com um clique em vez de clique duplo/toque duplo",
  display_options: "Opções de exibição",
  show_user_agent: "Mostrar estilos do user agent",
  autocomplete: "Autocompletar",
  show_suggestions: "Mostrar sugestões",
  max_suggestions: "Máximo de sugestões",
  suggestions_hint: "Valores mais altos podem afetar o desempenho"
},

pref_elements: {
  title: "Painel Elements",
  panel_layout: "Layout do painel",
  sub_tab_layout: "Layout das sub-abas",
  layout_vertical: "Vertical (lado a lado)",
  layout_horizontal: "Horizontal (empilhado)",
  show_styles: "Mostrar Styles na aba principal",
  show_computed: "Mostrar Computed na aba principal",
  show_layout: "Mostrar Layout na aba principal",
  console_label: "Console",
  show_main: "Mostrar na aba principal",
  dom_appearance: "Aparência da árvore DOM",
  show_comments: "Mostrar comentários HTML ()",
  show_shadow: "Mostrar Shadow DOM do User Agent",
  show_rulers: "Mostrar guias de indentação",
  highlight_updates: "Destacar atualizações do DOM (piscar)",
  computed_box_model: "Computed e Box Model",
  highlight_hover: "Destacar elemento ao passar no Box Model",
  show_tooltip: "Mostrar tooltip ao passar no Box",
  show_zero: "Mostrar valores '0' no Box Model",
  element_badges: "Badges de elementos"
 },
 pref_inspect: {
  tooltip_title: "Tooltip do Inspetor",
  enable_tooltip: "Mostrar tooltip ao inspecionar",
  show_hierarchy: "Mostrar hierarquia pai",
  show_dims: "Mostrar dimensões",
  show_color: "Mostrar informações de cor e fonte",
  show_box_model: "Mostrar valores de Margin/Padding",
  show_extra: "Mostrar detalhes extras (A11y, Contraste)",
  overlay_title: "Overlay de destaque",
  show_margin: "Mostrar Margin (Laranja)",
  show_padding: "Mostrar Padding (Verde)",
  show_border: "Mostrar Border (Amarelo)"
},

},
  application: {
    dashboard: "Armazenamento",
    manifest: "Manifesto",
    service_workers: "Service Workers",
    local_storage: "Armazenamento Local",
    session_storage: "Armazenamento de Sessão",
    indexed_db: "IndexedDB",
    cookies: "Cookies",
    cache: "Cache",
    cache_storage: "Armazenamento Cache",
    storage_title: "Armazenamento",
    usage_title: "Uso",
    usage_text: "{used} MB usados de {quota} MB",
    total_usage: "Uso Total",
    clear_site_data: "Limpar dados do site",
    inc_third_party: "incluindo cookies de terceiros",
    clear_options: {
      app: "Aplicativo",
      unregister_sw: "Desregistrar service workers",
      storage: "Armazenamento",
      ls_ss: "Local e Sessão",
      idb: "IndexedDB",
      websql: "Web SQL",
      cookies: "Cookies",
      cache: "Cache",
      cache_storage: "Armazenamento Cache"
    },
    empty_view: "Selecione uma origem para ver os dados.",
    empty_idb: "Selecione um Object Store para ver os dados.",
    no_manifest: "Nenhum manifesto detectado",
    no_manifest_desc: "Nenhum manifest.json encontrado nesta página.",
    no_sw: "Nenhum Service Worker detectado",
    identity: "Identidade",
    presentation: "Apresentação",
    icons: "Ícones",
    no_icons: "Nenhum ícone encontrado",
    view_raw: "Ver JSON bruto",
    sw_offline: "Offline",
    sw_update_reload: "Atualizar ao recarregar",
    sw_status: "Status",
    sw_running: "executando",
    sw_stopped: "parado",
    sw_clients: "Clientes",
    sw_view_clients: "Ver clientes",
    update: "Atualizar",
    unregister: "Desregistrar",
    clear_all_confirm: "Limpar tudo?",
    clear_cookies_confirm: "Limpar cookies?",
    delete_cache_confirm: "Excluir cache?",
    unregister_sw_confirm: "Desregistrar este Service Worker?"
  },
  elements: {
    styles: "Estilos",
    computed: "Computado",
    layout: "Layout",
    filter_placeholder: "Filtrar",
    show_all: "Mostrar tudo",
    group: "Agrupar",
    box_model: {
      margin: "Margem",
      border: "Borda",
      padding: "Preenchimento",
      tooltip: "dica",
      tooltip_title: "Mostrar dica ao passar o mouse"
    },
    groups: {
      other: "Outros"
    },
    no_css_data: "Erro: Módulo CSSData.js não carregado."
  },
  styles: {
    filter_placeholder: "Filtrar",
    toggle_element_state: "Alternar estado do elemento",
    element_classes: "Classes do elemento",
    new_style_rule: "Nova regra de estilo",
    force_element_state: "Forçar estado",
    add_new_class: "Adicionar nova classe",
    no_classes_found: "Nenhuma classe encontrada.",
    inherited_from: "Herdado de",
    pseudo_element: "Pseudo elemento ::{type}",
    user_agent_stylesheet: "folha de estilo do agente",
    inspector_stylesheet: "folha de estilo do inspetor",
    element_style: "estilo do elemento",
    add_new_property: "Adicionar propriedade",
    copy_selector: "Copiar seletor",
    copy_declaration: "Copiar declaração",
    copy_property: "Copiar propriedade",
    copy_value: "Copiar valor",
    copy_rule: "Copiar regra",
    copy_declaration_js: "Copiar declaração como JS",
    copy_all_declarations: "Copiar todas as declarações",
    copy_all_declarations_js: "Copiar tudo como JS"
  },
  console: {
    toolbar: {
      sidebar_toggle: "Mostrar/Ocultar barra lateral",
      clear_console: "Limpar console (Ctrl+L)",
      toggle_expressions: "Alternar expressões",
      filter_placeholder: "Filtrar",
      settings: "Configurações do Console"
    },
    sidebar: {
      all_messages: "Todas",
      user_messages: "Usuário",
      errors: "Erros",
      warnings: "Avisos",
      info: "Info",
      verbose: "Detalhado",
      globals: "Globais"
    },
    expression: {
      placeholder: "Avaliar expressão (Enter)",
      close: "Fechar"
    },
    settings: {
      preserve_log: "Preservar log",
      log_xhr: "Log XMLHttpRequests / fetch",
      eager_eval: "Avaliação imediata",
      autocomplete: "Autocompletar do histórico",
      treat_eval_user: "Tratar avaliação como ação do usuário",
      selected_context: "Apenas contexto selecionado",
      group_similar: "Agrupar mensagens similares",
      show_cors: "Mostrar erros CORS"
    },
    messages: {
      globals_header: "=== Variáveis Globais Sandbox ===",
      error_reading: "[Erro ao ler valor]",
      listing_unavailable: "Listagem global indisponível",
      error_listing: "Erro ao listar globais: {error}",
      illegal_return: "Erro de sintaxe: Declaração return ilegal",
      failed_resource: "Falha ao carregar recurso: {url}",
      unknown_resource: "recurso desconhecido",
      unhandled_rejection: "Promessa rejeitada não tratada: "
    }
  },
  source: {
    xhr_breakpoints: "Pontos de interrupção XHR",
    event_listener_breakpoints: "Pontos de interrupção de eventos",
    no_breakpoints: "Sem pontos de interrupção",
    page: "Página",
    filesystem: "Arquivos",
    overrides: "Substituições",
    not_implemented: "Não implementado",
    select_file: "Selecione um arquivo",
    open_file_hint: "Ctrl+P → Abrir arquivo",
    run_command_hint: "Ctrl+Shift+P → Executar comando",
    run_script: "Executar script atual",
    pause_resume: "Pausar/Continuar",
    step_over: "Passar",
    step_into: "Entrar",
    step_out: "Sair",
    instrumentation_enable: "Habilitar instrumentação (Recarga necessária)",
    instrumentation_enabled_msg: "Instrumentação ativada. Clique para desativar.",
    instrumentation_disabled_msg: "Instrumentação desativada. Clique para ativar.",
    call_stack: "Pilha de chamadas",
    not_paused: "Não pausado",
    dom_breakpoints: "Pontos de interrupção DOM",
    scope: "Escopo",
    watch: "Vigilância",
    add_expression: "Adicionar expressão...",
    no_watch_expr: "Sem expressões",
    not_available: "(indisponível)",
    not_defined: "<não definido>",
    undefined: "undefined",
    null: "null",
    add: "Adicionar",
    refresh: "Atualizar",
    empty: "(vazio)",
    paused: "Pausado no depurador",
    resume: "Continuar (F8)",
    uncaught_ex: "Pausar em exceções não tratadas",
    caught_ex: "Pausar em exceções tratadas",
    url_contains: "URL contém...",
    remove_bp: "Remover ponto",
    no_file_open: "Nenhum arquivo aberto.",
    only_js: "Apenas arquivos .js",
    failed_fetch: "Falha ao buscar",
    enabled_reload: "✅ Ativado! Recarregando...",
    disabled_reload: "❌ Desativado. Recarregando...",
    sw_manager_missing: "SWManager não carregado!"
  },
  network: {
    filter_placeholder: "Filtrar",
    record_btn: "Gravar log de rede (Ctrl+E)",
    stop_record_btn: "Parar gravação (Ctrl+E)",
    clear_btn: "Limpar",
    toggle_filter: "Mostrar barra de filtros",
    preserve_log: "Preservar log",
    disable_cache: "Desativar cache",
    disable_cache_hint: "Desativar cache do navegador",
    invert: "Inverter",
    hide_data_urls: "Ocultar Data URLs",
    show_waterfall: "Mostrar cascata",
    settings: "Configurações de rede",
    overview_title: "Linha do tempo (Arraste para filtrar)",
    filters: {
      all: "Tudo",
      xhr: "Fetch/XHR",
      js: "JS",
      css: "CSS",
      img: "Img",
      media: "Mídia",
      font: "Fonte",
      doc: "Doc",
      ws: "WS",
      other: "Outro",
      blocked_cookies: "Cookies bloqueados",
      blocked_requests: "Requisições bloqueadas",
      third_party: "Terceiros"
    },
    empty_msg: {
      not_recording: "Grave o log de rede (Ctrl+E) para ver a atividade.",
      recording: "Gravando atividade de rede...",
      recording_desc: "Faça uma requisição ou pressione <code>Ctrl+R</code> para recarregar."
    },
    columns: {
      name: "Nome",
      status: "Status",
      type: "Tipo",
      initiator: "Iniciador",
      size: "Tamanho",
      time: "Tempo",
      timeline: "Linha do tempo"
    },
    footer: {
      requests: "{count} requisições",
      transferred: "{size} MB transferidos",
      finish: "Concluído: {time} s",
      requests_filtered: "{shown} de {total} requisições"
    },
    settings_popup: {
      large_rows: "Usar linhas grandes",
      group_frame: "Agrupar por quadro",
      show_overview: "Mostrar visão geral",
      capture_screenshots: "Capturar telas"
    },
    interceptor: {
      fetch_failed: "Falha no Fetch:",
      xhr_failed: "Falha no XHR:",
      xhr_error: "Erro XHR",
      xhr_request_failed: "Requisição XHR falhou",
      pausing_fetch: "🛑 Pausando no fetch:",
      pausing_xhr: "🛑 Pausando no XHR:",
      body_read_error: "[Não foi possível ler o corpo]"
    }
  },
  network_details: {
  tabs: {
    headers: "Cabeçalhos",
    preview: "Pré-visualização",
    response: "Resposta",
    timing: "Tempo"
  },
  sections: {
    general: "Geral",
    response_headers: "Cabeçalhos da resposta",
    request_headers: "Cabeçalhos da requisição",
    request_payload: "Carga da requisição"
  },
  general: {
    request_url: "URL da requisição",
    request_method: "Método da requisição",
    status_code: "Código de status",
    referrer_policy: "Política de referência"
  },
  timing: {
    start_time: "Hora de início",
    dns_lookup: "Consulta DNS",
    tcp_connect: "Conexão TCP",
    ssl: "SSL",
    ttfb: "Aguardando (TTFB)",
    content_download: "Download do conteúdo",
    total: "Duração total"
  },
  messages: {
    loading: "Carregando conteúdo...",
    no_content: "Nenhum conteúdo disponível",
    failed_load: "Falha ao carregar conteúdo: {error}",
    empty: "(Vazio)",
    no_headers: "Nenhum cabeçalho encontrado",
    binary_data: "Dados binários ou FormData",
    timing_unavailable: "Dados de tempo indisponíveis para esta requisição.",
    show_more: "Mostrar mais (restam {remaining} KB)"
  }
},
  inspector: {
    color: "Cor",
    font: "Fonte",
    margin: "Margem",
    accessibility: "Acessibilidade",
    name: "Nome",
    role: "Função",
    focus: "Foco",
    btn_missing: "Inspetor: Botão não encontrado"
  },
  layout: {
    page: "Página",
refresh_page: "Atualizar página",
design_mode: "Tornar a página editável",

  grid: "Grid",
  flexbox: "Flexbox",
  overlay_settings: "Configurações de sobreposição",
  show_line_numbers: "Mostrar números de linha",
  show_track_sizes: "Mostrar tamanhos das trilhas",
  show_area_names: "Mostrar nomes das áreas",
  extend_grid_lines: "Estender linhas do grid",
  grid_overlays: "Sobreposições do Grid",
  flex_overlays: "Sobreposições do Flexbox",
  no_grid: "Nenhum elemento Grid encontrado",
  no_flex: "Nenhum elemento Flexbox encontrado"
},
};