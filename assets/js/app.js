(() => {
  'use strict';

  const STORAGE_KEY = 'gushibu.library.v1';
  const APPEARANCE_KEY = 'gushibu.appearance.v1';
  const PUBLIC_PREVIEW_KEY = 'gushibu.public.preview.v1';
  const LIBRARY_VERSION = 1;
  const SITE_NAME = "Coin's Creative Cabin";
  const MAX_TAGS = 8;
  const MAX_TAG_LENGTH = 16;
  const ACCENT_PALETTES = {
    blue: {
      label: '星蓝',
      accent: '#4f6df5',
      deep: '#3b55d4',
      pair: '#8a5cf6',
      rgb: '79, 109, 245',
    },
    teal: {
      label: '青瓷',
      accent: '#1c8377',
      deep: '#12665c',
      pair: '#4bb3a2',
      rgb: '28, 131, 119',
    },
    violet: {
      label: '雾紫',
      accent: '#7158e2',
      deep: '#5a42c4',
      pair: '#a06ee8',
      rgb: '113, 88, 226',
    },
    rose: {
      label: '绯樱',
      accent: '#bd4a72',
      deep: '#9c355a',
      pair: '#e08a9e',
      rgb: '189, 74, 114',
    },
    amber: {
      label: '琥珀',
      accent: '#a06a1f',
      deep: '#7f5215',
      pair: '#d1a35a',
      rgb: '160, 106, 31',
    },
  };
  const GLASS_ALPHA_MIN = 58;
  const CARD_ALPHA_MIN = 34;
  const APPEARANCE_PANEL_GAP = 10;
  const APPEARANCE_PANEL_MARGIN = 12;
  const APPEARANCE_PANEL_MAX = 600;
  const DEFAULT_APPEARANCE = {
    glassAlpha: 66,
    cardAlpha: 40,
    blur: 28,
    accent: 'blue',
    wallpaperDim: 60,
    rim: 100,
    readingScale: 100,
  };
  const APPEARANCE_PRESETS = {
    mist: {
      label: '晨雾',
      accent: 'blue',
      glassAlpha: 78,
      cardAlpha: 50,
      blur: 20,
      wallpaperDim: 50,
      rim: 100,
    },
    dusk: {
      label: '暮色',
      accent: 'violet',
      glassAlpha: 72,
      cardAlpha: 44,
      blur: 26,
      wallpaperDim: 78,
      rim: 100,
    },
    warm: {
      label: '暖纸',
      accent: 'amber',
      glassAlpha: 86,
      cardAlpha: 58,
      blur: 14,
      wallpaperDim: 24,
      rim: 84,
    },
    clear: {
      label: '清透',
      accent: 'teal',
      glassAlpha: 62,
      cardAlpha: 36,
      blur: 34,
      wallpaperDim: 30,
      rim: 88,
    },
    liquid: {
      label: '液态玻璃',
      accent: 'blue',
      glassAlpha: 66,
      cardAlpha: 40,
      blur: 28,
      wallpaperDim: 60,
      rim: 100,
    },
  };
  const COVER_WIDTH = 480;
  const COVER_HEIGHT = 720;
  const COVER_MAX_LENGTH = 240000;
  const COVER_MAX_FILE_BYTES = 20 * 1024 * 1024;
  const COMMENT_MAX_LENGTH = 2000;
  const COMMENT_MAX_COUNT = 1000;
  const COMMENT_TARGET_KINDS = new Set([
    'page',
    'novel',
    'section',
    'entry',
    'entry-card',
    'block',
  ]);
  const COMMENT_BLOCK_LABELS = {
    summary: '简介',
    notes: '详细内容',
    map: '地图',
  };

  const NOVEL_STATUS = {
    planning: { label: '构思中', className: 'status-planning' },
    drafting: { label: '写作中', className: 'status-drafting' },
    revising: { label: '修订中', className: 'status-revising' },
    done: { label: '已完成', className: 'status-done' },
  };

  // 大纲状态复用小说状态的语言与配色；空字符串 = 未标记
  const ENTRY_STATUS = {
    planning: NOVEL_STATUS.planning,
    drafting: NOVEL_STATUS.drafting,
    done: NOVEL_STATUS.done,
  };
  const ALIAS_MAX_COUNT = 5;
  const ALIAS_MAX_LENGTH = 12;
  const BACKLINK_LIMIT = 20;
  const BACKLINK_BATCH_SIZE = 100;
  const BACKLINK_IDLE_DELAY = 200;
  const LAST_VISIT_KEY = 'gushibu.lastVisit.v1';
  const BACKUP_META_KEY = 'gushibu.backupMeta.v1';
  const BACKUP_REMIND_DAYS = 90;

  const SECTIONS = {
    outline: {
      label: '大纲',
      singular: '大纲',
      eyebrow: 'OUTLINE',
      icon: 'i-outline',
      description: '主线、分卷与章节',
      titleLabel: '标题',
      titlePlaceholder: '比如：第一幕 · 离港',
      subtitleLabel: '层级 / 范围',
      subtitlePlaceholder: '比如：总纲 / 第一卷 / 第 3 章',
      summaryLabel: '一段话梗概',
      summaryPlaceholder: '用一两句话说明这一段发生什么、改变了什么',
      notesLabel: '大纲正文',
      notesPlaceholder: '分场、转折、伏笔、人物变化、待定分支……',
      emptyError: '请先给这条大纲一个标题。',
      emptyTitle: '还没有铺开故事线',
      emptyText: '先写一句“故事从哪里开始、到哪里结束”，再往下拆分卷与章节。',
      addLabel: '新增大纲',
      backLabel: '返回大纲列表',
    },
    characters: {
      label: '角色',
      singular: '角色',
      eyebrow: 'CHARACTERS',
      icon: 'i-users',
      description: '人物、动机与关系',
      titleLabel: '姓名',
      titlePlaceholder: '比如：林晚',
      subtitleLabel: '身份 / 定位',
      subtitlePlaceholder: '比如：主角 · 夜航书店的继承人',
      summaryLabel: '一句话介绍',
      summaryPlaceholder: '用一句话点出这个人最要紧的地方',
      notesLabel: '人物档案',
      notesPlaceholder: '经历、性格、欲望、秘密、说话方式、与他人的关系……',
      emptyError: '请先给这个角色一个名字。',
      emptyTitle: '还没有角色登场',
      emptyText: '先让第一位角色登场，再添上与他相连的人，关系线会在这里慢慢长出来。',
      addLabel: '新增角色',
      backLabel: '返回角色列表',
    },
    world: {
      label: '背景',
      singular: '背景',
      eyebrow: 'WORLD',
      icon: 'i-world',
      description: '世界、时代与地点',
      titleLabel: '名称',
      titlePlaceholder: '比如：雾港',
      subtitleLabel: '时代 / 类型',
      subtitlePlaceholder: '比如：架空近代 · 港城',
      summaryLabel: '一句话概述',
      summaryPlaceholder: '用一句话说清它的气质与作用',
      notesLabel: '背景详情',
      notesPlaceholder: '时代环境、地点风物、社会氛围、历史事件……',
      emptyError: '请先给这个背景一个名称。',
      emptyTitle: '还没有铺开世界',
      emptyText: '从一个时代、一座城，或者一条街道开始，让故事有可以落脚的地方。',
      addLabel: '新增背景',
      backLabel: '返回背景列表',
    },
    settings: {
      label: '设定',
      singular: '设定',
      eyebrow: 'LORE',
      icon: 'i-lore',
      description: '规则、组织与体系',
      titleLabel: '名称',
      titlePlaceholder: '比如：守夜人誓约',
      subtitleLabel: '类别',
      subtitlePlaceholder: '比如：组织 / 力量体系 / 规则',
      summaryLabel: '一句话概述',
      summaryPlaceholder: '用一句话说清这条设定的核心',
      notesLabel: '规则详情',
      notesPlaceholder: '它如何运作？有什么代价？谁会遵守它？……',
      emptyError: '请先给这个设定一个名称。',
      emptyTitle: '世界还没有规则',
      emptyText: '力量体系、组织、禁忌或习俗，都会让故事里的选择变得更有分量。',
      addLabel: '新增设定',
      backLabel: '返回设定列表',
    },
    maps: {
      label: '地图',
      singular: '地图',
      eyebrow: 'MAPS',
      icon: 'i-map',
      description: '地理、区域与空间',
      titleLabel: '地名',
      titlePlaceholder: '比如：北岸旧城',
      subtitleLabel: '区域 / 范围',
      subtitlePlaceholder: '比如：主城北区 · 临海',
      summaryLabel: '一句话概述',
      summaryPlaceholder: '用一句话说清这里最特别的地方',
      notesLabel: '地理与场所',
      notesPlaceholder: '方位、地形、街区、路线、标志性场所、谁住在这里……',
      emptyError: '请先给这个地方一个名称。',
      emptyTitle: '还没有画下疆域',
      emptyText: '先标出一座城、一条河或一间屋子，让人物有地方相遇和告别。',
      addLabel: '新增地图',
      backLabel: '返回地图列表',
    },
    notes: {
      label: '资料',
      singular: '资料',
      eyebrow: 'NOTES',
      icon: 'i-notes',
      description: '灵感、考据与其他',
      titleLabel: '标题',
      titlePlaceholder: '比如：关于雾港的雨',
      subtitleLabel: '分类',
      subtitlePlaceholder: '比如：灵感 / 考据 / 待办',
      summaryLabel: '一句话说明',
      summaryPlaceholder: '用一句话提醒自己这条资料要说什么',
      notesLabel: '详细内容',
      notesPlaceholder: '零散的灵感、参考书目、待确认的细节……都可以放在这里。',
      emptyError: '请先给这条资料一个标题。',
      emptyTitle: '还没有留下资料',
      emptyText: '把暂时不归属类的灵感、考据和待办先收在这里，之后再来整理。',
      addLabel: '新增资料',
      backLabel: '返回资料列表',
    },
  };

  const SECTION_KEYS = Object.keys(SECTIONS);

  const PUBLISH_VIS_OPTIONS = [
    { value: 'inherit', label: '跟随', ariaLabel: '跟随小说的公开设置' },
    { value: 'public', label: '公开', ariaLabel: '单独设为公开' },
    { value: 'private', label: '私密', ariaLabel: '单独设为私密' },
  ];

  const MAP_DEFAULT_COLS = 22;
  const MAP_DEFAULT_ROWS = 14;
  const MAP_HEX_SIZE = 40;
  const MAP_HISTORY_LIMIT = 80;
  const MAP_MAX_CITIES = 40;
  const MAP_WORLD_SQRT3 = Math.sqrt(3);

  const MAP_TERRAINS = {
    grass: { label: '草原', fill: '#a2c584', stroke: '#88ab6c', fills: ['#a8cc88', '#9cbe7a', '#b0d190'] },
    plains: { label: '平原', fill: '#d6c37c', stroke: '#b9a65f', fills: ['#ddca88', '#cfbb71', '#e3d292'] },
    forest: { label: '森林', fill: '#71a070', stroke: '#5b8a5a', fills: ['#6da26c', '#78ad77', '#649663'] },
    hills: { label: '丘陵', fill: '#cba75f', stroke: '#ad8a48', fills: ['#d2ae68', '#c39e54', '#dab772'] },
    mountain: { label: '山脉', fill: '#9298a8', stroke: '#767c8c', fills: ['#98a0b2', '#8b91a1', '#a3aab9'] },
    water: { label: '水域', fill: '#8db8d6', stroke: '#75a3c4', fills: ['#93bedb', '#87b0cf', '#9cc6e2'] },
    desert: { label: '沙漠', fill: '#e6c67f', stroke: '#c9a95e', fills: ['#ecd08c', '#dfbc72', '#f2d998'] },
    snow: { label: '雪原', fill: '#ecf1f7', stroke: '#ccd7e7', fills: ['#f1f5fa', '#e7edf5', '#f7f9fc'] },
    swamp: { label: '沼泽', fill: '#89a37a', stroke: '#6f8a62', fills: ['#8fab7d', '#7f9a70', '#98b488'] },
    volcano: { label: '火山', fill: '#6c6367', stroke: '#544d51', fills: ['#72696d', '#645c60', '#7b7175'] },
  };

  function pickMapTerrainFill(terrainKey, col, row) {
    const terrain = MAP_TERRAINS[terrainKey];
    if (!terrain || !terrain.fills) return terrain ? terrain.fill : '#a2c584';
    const hash = Math.abs((col * 7 + row * 13 + ((col * row) % 5) * 3) % 97);
    return terrain.fills[hash % terrain.fills.length];
  }

  const MAP_PATH_KINDS = {
    river: { label: '河流', color: '#4d86c7', width: 3.6, dash: '' },
    road: { label: '道路', color: '#8a6a48', width: 2.4, dash: '7 5' },
  };

  const MAP_MAX_PATH_POINTS = 400;
  const MAP_PATH_LIMIT = 60;

  const MAP_FEATURES = {
    grove: { label: '树林' },
    ruins: { label: '遗迹' },
    temple: { label: '神殿' },
    fortress: { label: '要塞' },
    port: { label: '港口' },
    camp: { label: '营地' },
    stones: { label: '石阵' },
    danger: { label: '凶地' },
  };

  const MAP_FEATURE_KEYS = ['none', ...Object.keys(MAP_FEATURES)];
  const MAP_TERRAIN_KEYS = Object.keys(MAP_TERRAINS);

  const MAP_CITY_COLORS = [
    '#4f6df5',
    '#b05a3c',
    '#3f7a66',
    '#8a5aa8',
    '#c08a2e',
    '#3c7fa8',
    '#a34f6a',
    '#59636e',
  ];

  const GRAPH_WIDTH = 1000;
  const GRAPH_HEIGHT = 620;
  const GRAPH_NODE_RADIUS = 40;
  const GRAPH_MIN_X = 110;
  const GRAPH_MAX_X = GRAPH_WIDTH - 110;
  const GRAPH_MIN_Y = 96;
  const GRAPH_MAX_Y = GRAPH_HEIGHT - 118;
  const GRAPH_MAX_RELATIONS = 160;
  const GRAPH_MAX_LABEL_LENGTH = 24;
  const GRAPH_PRIMARY_ID = 'primary';
  const GRAPH_MAX_GRAPHS = 12;
  const GRAPH_MAX_GRAPH_TITLE = 20;
  const GRAPH_ZOOM_MIN = 1;
  const GRAPH_ZOOM_MAX = 2.6;
  const GRAPH_ZOOM_STEP = 0.2;
  const GRAPH_NODE_TONES = [
    { fill: '#e7ecff', stroke: '#93a6f4', ink: '#3b55d4' },
    { fill: '#f6e9e1', stroke: '#dfa98e', ink: '#a85a38' },
    { fill: '#e4f1eb', stroke: '#8dc4ab', ink: '#2d7a56' },
    { fill: '#f0e7f6', stroke: '#bfa1d3', ink: '#7a4e96' },
    { fill: '#f7efdd', stroke: '#dcc28f', ink: '#93691f' },
    { fill: '#e3eff5', stroke: '#93bfd4', ink: '#356f8d' },
  ];

  const MAP_DIRECTIONS = ['E', 'NE', 'NW', 'W', 'SW', 'SE'];
  const MAP_EDGE_CORNERS = {
    E: [1, 2],
    NE: [0, 1],
    NW: [5, 0],
    W: [4, 5],
    SW: [3, 4],
    SE: [2, 3],
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);

  const els = {
    page: $('.page'),
    sidebar: $('.sidebar'),
    content: $('.content'),
    shelfView: $('#shelfView'),
    trashView: $('#trashView'),
    novelView: $('#novelView'),
    commentsView: $('#commentsView'),
    publishView: $('#publishView'),
    missingView: $('#missingView'),

    commentsToolbar: $('#commentsToolbar'),
    commentsStatusFilters: $('#commentsStatusFilters'),
    commentsSearchInput: $('#commentsSearchInput'),
    commentsSearchClearBtn: $('#commentsSearchClearBtn'),
    commentsSortSelect: $('#commentsSortSelect'),
    commentsCount: $('#commentsCount'),
    commentsList: $('#commentsList'),
    commentsEmpty: $('#commentsEmpty'),
    commentsNoResults: $('#commentsNoResults'),
    commentsClearSearchBtn: $('#commentsClearSearchBtn'),
    commentsNoResultsClearBtn: $('#commentsNoResultsClearBtn'),

    commentFab: $('#commentFab'),
    commentFabCount: $('#commentFabCount'),

    commentDialog: $('#commentDialog'),
    commentForm: $('#commentForm'),
    commentDialogEyebrow: $('#commentDialogEyebrow'),
    commentDialogTitle: $('#commentDialogTitle'),
    commentDialogCloseBtn: $('#commentDialogCloseBtn'),
    commentTargetField: $('#commentTargetField'),
    commentTargetSelect: $('#commentTargetSelect'),
    commentTargetPath: $('#commentTargetPath'),
    commentTargetNote: $('#commentTargetNote'),
    commentBodyInput: $('#commentBodyInput'),
    commentBodyCount: $('#commentBodyCount'),
    commentBodyError: $('#commentBodyError'),
    commentDeleteBtn: $('#commentDeleteBtn'),
    commentCancelBtn: $('#commentCancelBtn'),
    commentSaveBtn: $('#commentSaveBtn'),

    trashList: $('#trashList'),
    trashEmpty: $('#trashEmpty'),
    trashCount: $('#trashCount'),
    trashClearBtn: $('#trashClearBtn'),

    shelfToolbar: $('#shelfToolbar'),
    continueBanner: $('#continueBanner'),
    continueBannerText: $('#continueBannerText'),
    continueBannerTime: $('#continueBannerTime'),
    continueBannerBtn: $('#continueBannerBtn'),
    shelfSearchInput: $('#shelfSearchInput'),
    shelfSearchClearBtn: $('#shelfSearchClearBtn'),
    shelfSortSelect: $('#shelfSortSelect'),
    shelfStatusFilters: $('#shelfStatusFilters'),
    shelfClearFiltersBtn: $('#shelfClearFiltersBtn'),
    shelfNoResultsClearBtn: $('#shelfNoResultsClearBtn'),
    shelfResultCount: $('#shelfResultCount'),
    novelGrid: $('#novelGrid'),
    shelfEmpty: $('#shelfEmpty'),
    shelfNoResults: $('#shelfNoResults'),
    newNovelBtn: $('#newNovelBtn'),
    shelfEmptyNewBtn: $('#shelfEmptyNewBtn'),
    shelfEmptyImportBtn: $('#shelfEmptyImportBtn'),

    importBtn: $('#importBtn'),
    exportBtn: $('#exportBtn'),
    footerExportBtn: $('#footerExportBtn'),
    importFile: $('#importFile'),

    appearanceBtn: $('#appearanceBtn'),
    appearanceFooter: $('.sidebar-footer'),
    appearancePanel: $('#appearancePanel'),
    appearanceScroll: $('#appearanceScroll'),
    appearanceCloseBtn: $('#appearanceCloseBtn'),
    appearanceResetBtn: $('#appearanceResetBtn'),
    appearancePresetBtns: Array.from(document.querySelectorAll('[data-preset]')),
    appearanceAccentBtns: Array.from(document.querySelectorAll('[data-accent]')),
    wallpaperDimInput: $('#wallpaperDimInput'),
    wallpaperDimValue: $('#wallpaperDimValue'),
    glassAlphaInput: $('#glassAlphaInput'),
    glassAlphaValue: $('#glassAlphaValue'),
    cardAlphaInput: $('#cardAlphaInput'),
    cardAlphaValue: $('#cardAlphaValue'),
    blurInput: $('#blurInput'),
    blurValue: $('#blurValue'),
    rimInput: $('#rimInput'),
    rimValue: $('#rimValue'),
    readingScaleInput: $('#readingScaleInput'),
    readingScaleValue: $('#readingScaleValue'),

    breadcrumbNovelTitle: $('#breadcrumbNovelTitle'),
    novelCoverSlot: $('#novelCoverSlot'),
    novelStatusPill: $('#novelStatusPill'),
    novelStatusText: $('#novelStatusText'),
    novelGenreLabel: $('#novelGenreLabel'),
    novelVisibilityChip: $('#novelVisibilityChip'),
    novelTitle: $('#novelTitle'),
    novelHeroSummary: $('#novelHeroSummary'),
    novelHeroMeta: $('#novelHeroMeta'),
    novelPinBtn: $('#novelPinBtn'),
    workspaceNav: $('#workspaceNav'),
    workspaceContent: $('#workspaceContent'),

    sidebarShelfLink: $('#sidebarShelfLink'),
    sidebarCommentsLink: $('#sidebarCommentsLink'),
    sidebarCommentCount: $('#sidebarCommentCount'),
    sidebarTrashLink: $('#sidebarTrashLink'),
    sidebarTrashCount: $('#sidebarTrashCount'),
    sidebarPublishLink: $('#sidebarPublishLink'),
    sidebarPublicCount: $('#sidebarPublicCount'),
    sidebarNovelList: $('#sidebarNovelList'),
    sidebarNovelsEmpty: $('#sidebarNovelsEmpty'),
    sidebarSectionsGroup: $('#sidebarSectionsGroup'),
    sidebarBookLink: $('#sidebarBookLink'),
    sidebarBookName: $('#sidebarBookName'),

    novelCardTemplate: $('#novelCardTemplate'),
    entryCardTemplate: $('#entryCardTemplate'),
    outlineEditorTemplate: $('#outlineEditorTemplate'),

    novelDialog: $('#novelDialog'),
    novelForm: $('#novelForm'),
    novelDialogEyebrow: $('#novelDialogEyebrow'),
    novelDialogTitle: $('#novelDialogTitle'),
    novelDialogCloseBtn: $('#novelDialogCloseBtn'),
    novelCancelBtn: $('#novelCancelBtn'),
    novelSaveBtn: $('#novelSaveBtn'),
    novelTitleField: $('#novelTitleField'),
    novelTitleInput: $('#novelTitleInput'),
    novelTitleError: $('#novelTitleError'),
    novelGenreInput: $('#novelGenreInput'),
    novelSummaryInput: $('#novelSummaryInput'),
    novelDescriptionInput: $('#novelDescriptionInput'),
    novelDescriptionCount: $('#novelDescriptionCount'),
    novelCoverPreview: $('#novelCoverPreview'),
    novelCoverUploadBtn: $('#novelCoverUploadBtn'),
    novelCoverUploadLabel: $('#novelCoverUploadLabel'),
    novelCoverRemoveBtn: $('#novelCoverRemoveBtn'),
    novelCoverInput: $('#novelCoverInput'),
    novelCoverStatus: $('#novelCoverStatus'),
    novelPublicInput: $('#novelPublicInput'),
    novelVisibilityHint: $('#novelVisibilityHint'),

    entryDialog: $('#entryDialog'),
    entryForm: $('#entryForm'),
    entryDialogEyebrow: $('#entryDialogEyebrow'),
    entryDialogTitle: $('#entryDialogTitle'),
    entryDialogCloseBtn: $('#entryDialogCloseBtn'),
    entryCancelBtn: $('#entryCancelBtn'),
    entrySaveBtn: $('#entrySaveBtn'),
    entryTitleField: $('#entryTitleField'),
    entryTitleInput: $('#entryTitleInput'),
    entryTitleError: $('#entryTitleError'),
    entryTitleLabelText: $('#entryTitleLabelText'),
    entrySubtitleLabelText: $('#entrySubtitleLabelText'),
    entrySubtitleInput: $('#entrySubtitleInput'),
    entrySummaryLabelText: $('#entrySummaryLabelText'),
    entrySummaryInput: $('#entrySummaryInput'),
    entryNotesLabelText: $('#entryNotesLabelText'),
    entryNotesInput: $('#entryNotesInput'),
    entryNotesCount: $('#entryNotesCount'),
    entryAliasesInput: $('#entryAliasesInput'),
    entryTagEditor: $('#entryTagEditor'),
    entryTagInput: $('#entryTagInput'),
    entryTagSuggestions: $('#entryTagSuggestions'),
    entryVisibilityHint: $('#entryVisibilityHint'),

    publishSummary: $('#publishSummary'),
    publishNovelList: $('#publishNovelList'),
    publishEmpty: $('#publishEmpty'),
    publishEmptyNewBtn: $('#publishEmptyNewBtn'),
    publishPreviewBtn: $('#publishPreviewBtn'),
    publishExportBtn: $('#publishExportBtn'),
    publishOpenBtn: $('#publishOpenBtn'),
    publishSnapshotStatus: $('#publishSnapshotStatus'),

    relationDialog: $('#relationDialog'),
    relationForm: $('#relationForm'),
    relationDialogEyebrow: $('#relationDialogEyebrow'),
    relationDialogTitle: $('#relationDialogTitle'),
    relationDialogCloseBtn: $('#relationDialogCloseBtn'),
    relationFromSelect: $('#relationFromSelect'),
    relationToSelect: $('#relationToSelect'),
    relationFromLabelText: $('#relationFromLabelText'),
    relationToLabelText: $('#relationToLabelText'),
    relationRouteMark: $('#relationRouteMark'),
    relationDirectionBoth: $('#relationDirectionBoth'),
    relationDirectionOneWay: $('#relationDirectionOneWay'),
    relationDirectionBothLabel: $('#relationDirectionBothLabel'),
    relationDirectionOneWayLabel: $('#relationDirectionOneWayLabel'),
    relationDirectionNote: $('#relationDirectionNote'),
    relationLabelField: $('#relationLabelField'),
    relationLabelInput: $('#relationLabelInput'),
    relationLabelError: $('#relationLabelError'),
    relationFormError: $('#relationFormError'),
    relationPresets: $('#relationPresets'),
    relationDeleteBtn: $('#relationDeleteBtn'),
    relationCancelBtn: $('#relationCancelBtn'),
    relationSaveBtn: $('#relationSaveBtn'),
    relationFormHint: $('#relationFormHint'),

    graphDialog: $('#graphDialog'),
    graphForm: $('#graphForm'),
    graphDialogEyebrow: $('#graphDialogEyebrow'),
    graphDialogTitle: $('#graphDialogTitle'),
    graphDialogCloseBtn: $('#graphDialogCloseBtn'),
    graphTitleField: $('#graphTitleField'),
    graphTitleInput: $('#graphTitleInput'),
    graphTitleError: $('#graphTitleError'),
    graphDeleteBtn: $('#graphDeleteBtn'),
    graphCancelBtn: $('#graphCancelBtn'),
    graphSaveBtn: $('#graphSaveBtn'),

    confirmDialog: $('#confirmDialog'),
    confirmTitle: $('#confirmTitle'),
    confirmMessage: $('#confirmMessage'),
    confirmCancelBtn: $('#confirmCancelBtn'),
    confirmOkBtn: $('#confirmOkBtn'),

    mapDialog: $('#mapDialog'),
    mapDialogSubtitle: $('#mapDialogSubtitle'),
    mapSaveState: $('#mapSaveState'),
    mapSaveBtn: $('#mapSaveBtn'),
    mapCancelBtn: $('#mapCancelBtn'),
    mapCloseBtn: $('#mapCloseBtn'),
    mapTools: $('#mapTools'),
    mapTerrainPalette: $('#mapTerrainPalette'),
    mapZoomOutBtn: $('#mapZoomOutBtn'),
    mapZoomInBtn: $('#mapZoomInBtn'),
    mapFitBtn: $('#mapFitBtn'),
    mapUndoBtn: $('#mapUndoBtn'),
    mapRedoBtn: $('#mapRedoBtn'),
    mapClearBtn: $('#mapClearBtn'),
    mapStage: $('#mapStage'),
    mapSvg: $('#mapSvg'),
    mapZoomBadge: $('#mapZoomBadge'),
    mapStageTip: $('#mapStageTip'),
    mapMobileZoomInBtn: $('#mapMobileZoomInBtn'),
    mapMobileZoomOutBtn: $('#mapMobileZoomOutBtn'),
    mapMobileFitBtn: $('#mapMobileFitBtn'),
    mapMobileUndoBtn: $('#mapMobileUndoBtn'),
    mapMobileRedoBtn: $('#mapMobileRedoBtn'),
    mapCityList: $('#mapCityList'),
    mapCityCount: $('#mapCityCount'),
    mapCityEditor: $('#mapCityEditor'),
    mapCityNameInput: $('#mapCityNameInput'),
    mapRadiusRow: $('#mapRadiusRow'),
    mapColorRow: $('#mapColorRow'),
    mapCityCoord: $('#mapCityCoord'),
    mapDeleteCityBtn: $('#mapDeleteCityBtn'),
    mapInspectorEmpty: $('#mapInspectorEmpty'),
    mapBrushRow: $('#mapBrushRow'),
    mapGridBtn: $('#mapGridBtn'),
    mapTerrainLabel: $('#mapTerrainLabel'),
    mapSizeColsMinus: $('#mapSizeColsMinus'),
    mapSizeColsPlus: $('#mapSizeColsPlus'),
    mapSizeRowsMinus: $('#mapSizeRowsMinus'),
    mapSizeRowsPlus: $('#mapSizeRowsPlus'),
    mapSizeColsValue: $('#mapSizeColsValue'),
    mapSizeRowsValue: $('#mapSizeRowsValue'),
    mapGenerateBtn: $('#mapGenerateBtn'),
    mapExportBtn: $('#mapExportBtn'),
    mapPathList: $('#mapPathList'),
    mapPathCount: $('#mapPathCount'),

    searchDialog: $('#searchDialog'),
    searchInput: $('#searchInput'),
    searchResults: $('#searchResults'),
    searchDialogCloseBtn: $('#searchDialogCloseBtn'),
    sidebarSearchBtn: $('#sidebarSearchBtn'),

    toastStack: $('#toastStack'),
    year: $('#year'),
  };

  const state = {
    novels: [],
    trash: [],
    comments: [],
    appearance: { ...DEFAULT_APPEARANCE },
    route: null,
    shelf: { query: '', status: 'all', sort: 'updated' },
    commentDirectory: { query: '', sort: 'newest', status: 'open' },
    commentDraft: {
      mode: null,
      id: null,
      candidates: [],
      targetKey: null,
      dirty: false,
    },
    pendingCommentFocus: null,
    novelDraft: { id: null, dirty: false, cover: '', coverBusy: false },
    entryDraft: { novelId: null, sectionKey: null, id: null, dirty: false },
    outlineDraft: { novelId: null, id: null, dirty: false, tags: [], hash: '' },
    draftTags: [],
    confirmAction: null,
    pendingHighlight: null,
    backlinksToken: 0,
    outlineStatusFilter: 'all',
    sidebarScroll: null,
    listScrolls: Object.create(null),
    mapEditor: null,
    charactersView: 'graph',
    relationDraft: { novelId: null, id: null, graphId: null },
    graphDraft: { novelId: null, id: null },
    activeGraphByNovel: Object.create(null),
    graphViews: Object.create(null),
    publishExpanded: Object.create(null),
    publishFocus: null,
    search: { items: [], activeIndex: -1, mode: 'recent' },
  };

  let isComposingTag = false;
  let sidebarSectionsSettleTimer = 0;
  let pendingSidebarReveal = false;
  let pageFrameAnimation = null;

  init();

  function init() {
    const library = loadLibrary();
    state.novels = library.novels;
    state.trash = library.trash;
    state.comments = library.comments;
    state.appearance = loadAppearance();
    applyAppearance();
    document.body.appendChild(els.appearancePanel);
    els.year.textContent = new Date().getFullYear();
    bindEvents();
    renderRoute();
    syncShelfSearchBox();

    if (!isStorageAvailable()) {
      showToast('浏览器禁用了本地存储，内容将无法持久保存', 'error');
    }
  }

  /* ---------- Storage ---------- */

  function isStorageAvailable() {
    try {
      const key = '__gushibu_test__';
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function loadLibrary() {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return { novels: [], trash: [], comments: [] };
    }
    if (!raw) return { novels: [], trash: [], comments: [] };

    try {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed.novels)
          ? parsed.novels
          : [];
      const rawTrash =
        parsed && !Array.isArray(parsed) && Array.isArray(parsed.trash)
          ? parsed.trash
          : [];
      const rawComments =
        parsed && !Array.isArray(parsed) && Array.isArray(parsed.comments)
          ? parsed.comments
          : [];
      const seen = new Set();
      const trash = [];
      const commentSeen = new Set();
      const comments = [];

      for (const rawItem of rawTrash) {
        const item = normalizeTrashItem(rawItem);
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        trash.push(item);
      }
      trash.sort((a, b) => timeValue(b.deletedAt) - timeValue(a.deletedAt));

      for (const rawItem of rawComments) {
        if (comments.length >= COMMENT_MAX_COUNT) break;
        const comment = normalizeComment(rawItem);
        if (!comment || commentSeen.has(comment.id)) continue;
        commentSeen.add(comment.id);
        comments.push(comment);
      }
      comments.sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt));

      return {
        novels: list.map((item) => normalizeNovel(item)?.novel).filter(Boolean),
        trash,
        comments,
      };
    } catch (error) {
      console.warn('读取本地书架数据失败：', error);
      return { novels: [], trash: [], comments: [] };
    }
  }

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: LIBRARY_VERSION,
          novels: state.novels,
          trash: state.trash,
          comments: state.comments,
        })
      );
      return true;
    } catch (error) {
      console.error('保存失败：', error);
      showToast('保存失败：浏览器存储空间可能已满', 'error');
      return false;
    }
  }

  function loadAppearance() {
    try {
      const raw = localStorage.getItem(APPEARANCE_KEY);
      if (!raw) return { ...DEFAULT_APPEARANCE };
      return normalizeAppearance(JSON.parse(raw));
    } catch (error) {
      return { ...DEFAULT_APPEARANCE };
    }
  }

  function normalizeAppearance(value) {
    const read = (key, min, max, fallback) => {
      const number = Number(value && value[key]);
      if (!Number.isFinite(number)) return fallback;
      return Math.min(max, Math.max(min, Math.round(number)));
    };
    const accent =
      value && typeof value.accent === 'string' && ACCENT_PALETTES[value.accent]
        ? value.accent
        : DEFAULT_APPEARANCE.accent;
    return {
      glassAlpha: read(
        'glassAlpha',
        GLASS_ALPHA_MIN,
        100,
        DEFAULT_APPEARANCE.glassAlpha
      ),
      cardAlpha: read(
        'cardAlpha',
        CARD_ALPHA_MIN,
        90,
        DEFAULT_APPEARANCE.cardAlpha
      ),
      blur: read('blur', 0, 40, DEFAULT_APPEARANCE.blur),
      accent,
      wallpaperDim: read(
        'wallpaperDim',
        0,
        100,
        DEFAULT_APPEARANCE.wallpaperDim
      ),
      rim: read('rim', 0, 100, DEFAULT_APPEARANCE.rim),
      readingScale: read(
        'readingScale',
        90,
        115,
        DEFAULT_APPEARANCE.readingScale
      ),
    };
  }

  function applyAppearance() {
    const {
      glassAlpha,
      cardAlpha,
      blur,
      accent,
      wallpaperDim,
      rim,
      readingScale,
    } = state.appearance;
    const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.blue;
    const root = document.documentElement;
    root.style.setProperty('--glass-alpha', String(glassAlpha / 100));
    root.style.setProperty('--card-alpha', String(cardAlpha / 100));
    root.style.setProperty('--glass-blur', `${blur}px`);
    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--accent-deep', palette.deep);
    root.style.setProperty('--accent-pair', palette.pair);
    root.style.setProperty('--accent-rgb', palette.rgb);
    root.style.setProperty('--accent-soft', `rgba(${palette.rgb}, 0.1)`);
    root.style.setProperty('--accent-weak', `rgba(${palette.rgb}, 0.09)`);
    root.style.setProperty('--wallpaper-dim', String(wallpaperDim / 100));
    root.style.setProperty('--rim-strength', String(rim / 100));
    root.style.setProperty('--reading-scale', String(readingScale / 100));
    root.classList.toggle(
      'is-sheer',
      glassAlpha < 70 || cardAlpha < 42
    );

    els.wallpaperDimInput.value = String(wallpaperDim);
    els.wallpaperDimValue.textContent =
      wallpaperDim <= 33 ? '明亮' : wallpaperDim >= 67 ? '深邃' : '均衡';
    els.glassAlphaInput.value = String(glassAlpha);
    els.glassAlphaValue.textContent = `${glassAlpha}%`;
    els.cardAlphaInput.value = String(cardAlpha);
    els.cardAlphaValue.textContent = `${cardAlpha}%`;
    els.blurInput.value = String(blur);
    els.blurValue.textContent = `${blur}px`;
    els.rimInput.value = String(rim);
    els.rimValue.textContent = `${rim}%`;
    els.readingScaleInput.value = String(readingScale);
    els.readingScaleValue.textContent = `${readingScale}%`;
    syncAppearanceChoices();
  }

  function syncAppearanceChoices() {
    els.appearanceAccentBtns.forEach((button) => {
      const active = button.dataset.accent === state.appearance.accent;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    els.appearancePresetBtns.forEach((button) => {
      const preset = APPEARANCE_PRESETS[button.dataset.preset];
      if (!preset) return;
      const active = Object.keys(preset).every(
        (key) => key === 'label' || state.appearance[key] === preset[key]
      );
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function applyPreset(name) {
    const preset = APPEARANCE_PRESETS[name];
    if (!preset) return;
    const { label, ...values } = preset;
    state.appearance = normalizeAppearance({ ...state.appearance, ...values });
    applyAppearance();
    persistAppearance();
    showToast(`已切换为「${label}」风格`);
  }

  function persistAppearance() {
    try {
      localStorage.setItem(APPEARANCE_KEY, JSON.stringify(state.appearance));
    } catch (error) {
      console.warn('外观设置无法保存：', error);
    }
  }

  function updateAppearance(key, value) {
    state.appearance = normalizeAppearance({ ...state.appearance, [key]: value });
    applyAppearance();
    persistAppearance();
  }

  function toggleAppearancePanel() {
    if (!els.appearancePanel.hidden) {
      closeAppearancePanel();
      return;
    }
    els.appearancePanel.hidden = false;
    els.appearanceBtn.setAttribute('aria-expanded', 'true');
    els.appearanceScroll.scrollTop = 0;
    positionAppearancePanel();
    const activePreset = els.appearancePresetBtns.find((button) =>
      button.classList.contains('is-active')
    );
    (activePreset ||
      els.appearancePresetBtns[0] ||
      els.appearanceCloseBtn).focus({ preventScroll: true });
  }

  function positionAppearancePanel() {
    if (els.appearancePanel.hidden) return;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const btnRect = els.appearanceBtn.getBoundingClientRect();
    const footerRect = (
      els.appearanceFooter || els.appearanceBtn
    ).getBoundingClientRect();

    if (btnRect.bottom < 0 || btnRect.top > viewportH) {
      closeAppearancePanel();
      return;
    }

    const width = Math.round(
      Math.min(
        Math.max(footerRect.width, 240),
        320,
        viewportW - APPEARANCE_PANEL_MARGIN * 2
      )
    );
    const left = Math.min(
      Math.max(footerRect.left, APPEARANCE_PANEL_MARGIN),
      viewportW - width - APPEARANCE_PANEL_MARGIN
    );
    const spaceAbove =
      btnRect.top - APPEARANCE_PANEL_GAP - APPEARANCE_PANEL_MARGIN;
    const spaceBelow =
      viewportH - btnRect.bottom - APPEARANCE_PANEL_GAP - APPEARANCE_PANEL_MARGIN;
    const openUp = spaceAbove >= spaceBelow;
    const available = openUp ? spaceAbove : spaceBelow;

    els.appearancePanel.style.width = `${width}px`;
    els.appearancePanel.style.left = `${left}px`;

    if (available >= 280) {
      els.appearancePanel.style.maxHeight = `${Math.min(APPEARANCE_PANEL_MAX, available)}px`;
      if (openUp) {
        els.appearancePanel.style.top = 'auto';
        els.appearancePanel.style.bottom = `${viewportH - btnRect.top + APPEARANCE_PANEL_GAP}px`;
      } else {
        els.appearancePanel.style.bottom = 'auto';
        els.appearancePanel.style.top = `${btnRect.bottom + APPEARANCE_PANEL_GAP}px`;
      }
      return;
    }

    els.appearancePanel.style.maxHeight = `${viewportH - APPEARANCE_PANEL_MARGIN * 2}px`;
    if (openUp) {
      els.appearancePanel.style.bottom = 'auto';
      els.appearancePanel.style.top = `${APPEARANCE_PANEL_MARGIN}px`;
    } else {
      els.appearancePanel.style.top = 'auto';
      els.appearancePanel.style.bottom = `${APPEARANCE_PANEL_MARGIN}px`;
    }
  }

  let appearancePositionFrame = 0;

  function scheduleAppearancePosition() {
    if (els.appearancePanel.hidden || appearancePositionFrame) return;
    appearancePositionFrame = requestAnimationFrame(() => {
      appearancePositionFrame = 0;
      positionAppearancePanel();
    });
  }

  function closeAppearancePanel() {
    if (els.appearancePanel.hidden) return;
    els.appearancePanel.hidden = true;
    els.appearanceBtn.setAttribute('aria-expanded', 'false');
  }

  function normalizeCover(raw) {
    if (typeof raw !== 'string') return '';
    const value = raw.trim();
    if (!value || value.length > COVER_MAX_LENGTH) return '';
    if (!/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value)) return '';
    return value;
  }

  function normalizeNovel(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const title = cleanText(raw.title, 60);
    if (!title) return null;

    const now = new Date().toISOString();
    const createdAt = parseDate(raw.createdAt) || now;
    const updatedAt = parseDate(raw.updatedAt) || createdAt;
    const rawEntries = raw.entries && typeof raw.entries === 'object' ? raw.entries : {};
    const entries = {};
    let skippedEntries = 0;

    for (const key of SECTION_KEYS) {
      const list = Array.isArray(rawEntries[key]) ? rawEntries[key] : [];
      const seen = new Set();
      const normalized = [];

      for (const item of list) {
        const entry = normalizeEntry(item);
        if (!entry || seen.has(entry.id)) {
          skippedEntries += 1;
          continue;
        }
        seen.add(entry.id);
        normalized.push(entry);
      }
      entries[key] = normalized;
    }

    const tone = Number.isInteger(raw.tone) ? Math.min(Math.max(raw.tone, 0), 4) : 0;
    const relationGraphs = normalizeRelationGraphs(raw.relationGraphs);

    return {
      novel: {
        id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : makeId(),
        title,
        genre: cleanText(raw.genre, 20),
        summary: cleanText(raw.summary, 160),
        description: typeof raw.description === 'string' ? raw.description.trim() : '',
        status: Object.prototype.hasOwnProperty.call(NOVEL_STATUS, raw.status)
          ? raw.status
          : 'planning',
        tone,
        cover: normalizeCover(raw.cover),
        pinned: raw.pinned === true,
        visibility: normalizeNovelVisibility(raw.visibility),
        createdAt,
        updatedAt,
        entries,
        relationGraphs,
        relations: normalizeCharacterRelations(raw.relations, relationGraphs),
      },
      skippedEntries,
    };
  }

  function normalizeEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const title = cleanText(raw.title, 60);
    if (!title) return null;

    const now = new Date().toISOString();
    const createdAt = parseDate(raw.createdAt) || now;
    const updatedAt = parseDate(raw.updatedAt) || createdAt;

    return {
      id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : makeId(),
      title,
      subtitle: cleanText(raw.subtitle, 60),
      summary: cleanText(raw.summary, 160),
      notes: typeof raw.notes === 'string' ? raw.notes.trim() : '',
      tags: normalizeTags(Array.isArray(raw.tags) ? raw.tags : []),
      aliases: normalizeAliases(raw.aliases),
      status: normalizeEntryStatus(raw.status),
      pinned: raw.pinned === true,
      visibility: normalizeEntryVisibility(raw.visibility),
      createdAt,
      updatedAt,
      map: normalizeMap(raw.map),
      graphPos: normalizeGraphPos(raw.graphPos),
      graphPositions: normalizeGraphPositions(raw.graphPositions),
    };
  }

  function normalizeAliases(raw) {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    const list = [];
    for (const item of raw) {
      if (typeof item !== 'string') continue;
      const alias = item.trim().slice(0, ALIAS_MAX_LENGTH);
      if (!alias) continue;
      const key = alias.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(alias);
      if (list.length >= ALIAS_MAX_COUNT) break;
    }
    return list;
  }

  function normalizeEntryStatus(value) {
    return typeof value === 'string' && ENTRY_STATUS[value] ? value : '';
  }

  function parseAliasesInput(value) {
    return String(value || '')
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function normalizeNovelVisibility(value) {
    return value === 'public' ? 'public' : 'private';
  }

  function normalizeEntryVisibility(value) {
    return value === 'public' || value === 'private' ? value : 'inherit';
  }

  function isNovelPublic(novel) {
    return Boolean(novel && novel.visibility === 'public');
  }

  function isEntryPublic(novel, entry) {
    return isNovelPublic(novel) && entry.visibility !== 'private';
  }

  function getEntryVisibilityLabel(novel, entry) {
    if (!isNovelPublic(novel)) return '私密';
    return entry.visibility === 'private' ? '私密' : '公开';
  }

  function createVisibilityChip(isPublic, label) {
    const chip = el('span', `visibility-chip ${isPublic ? 'is-public' : 'is-private'}`);
    chip.appendChild(icon(isPublic ? 'i-world' : 'i-lock'));
    chip.appendChild(el('span', '', label));
    return chip;
  }

  function normalizeTrashItem(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (raw.type !== 'novel' && raw.type !== 'entry') return null;

    const id = cleanText(raw.id, 80) || makeId();
    const deletedAt = parseDate(raw.deletedAt) || new Date().toISOString();
    const index = clampInt(raw.index, 0, 100000, 0);

    if (raw.type === 'novel') {
      const result = normalizeNovel(raw.payload);
      if (!result) return null;
      const novel = result.novel;
      return {
        id,
        type: 'novel',
        deletedAt,
        novelId: novel.id,
        novelTitle: novel.title,
        sectionKey: null,
        sectionLabel: null,
        entryId: null,
        entryTitle: null,
        index,
        payload: novel,
      };
    }

    const sectionKey =
      typeof raw.sectionKey === 'string' &&
      Object.prototype.hasOwnProperty.call(SECTIONS, raw.sectionKey)
        ? raw.sectionKey
        : null;
    const novelId = cleanText(raw.novelId, 80);
    const entry = normalizeEntry(raw.payload);
    if (!sectionKey || !novelId || !entry) return null;

    return {
      id,
      type: 'entry',
      deletedAt,
      novelId,
      novelTitle: cleanText(raw.novelTitle, 60),
      sectionKey,
      sectionLabel: SECTIONS[sectionKey].label,
      entryId: entry.id,
      entryTitle: entry.title,
      index,
      payload: entry,
    };
  }

  function normalizeComment(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const body =
      typeof raw.body === 'string'
        ? raw.body.replace(/\r\n?/g, '\n').trim().slice(0, COMMENT_MAX_LENGTH)
        : '';
    if (!body) return null;

    const target = normalizeCommentTarget(raw.target);
    if (!target) return null;

    const createdAt = parseDate(raw.createdAt) || new Date().toISOString();
    const updatedAt = parseDate(raw.updatedAt) || createdAt;

    return {
      id: cleanText(raw.id, 80) || makeId(),
      body,
      status: raw.status === 'resolved' ? 'resolved' : 'open',
      createdAt,
      updatedAt,
      target,
    };
  }

  function normalizeCommentTarget(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const kind = COMMENT_TARGET_KINDS.has(raw.kind) ? raw.kind : null;
    if (!kind) return null;

    const hash =
      typeof raw.hash === 'string' ? raw.hash.trim().slice(0, 320) : '';
    if (!hash.startsWith('#/') || hash === '#/comments') return null;

    const novelId = cleanText(raw.novelId, 80) || null;
    const sectionKey =
      typeof raw.sectionKey === 'string' &&
      Object.prototype.hasOwnProperty.call(SECTIONS, raw.sectionKey)
        ? raw.sectionKey
        : null;
    const entryId = cleanText(raw.entryId, 80) || null;
    const block = Object.prototype.hasOwnProperty.call(
      COMMENT_BLOCK_LABELS,
      raw.block
    )
      ? raw.block
      : null;

    if (kind === 'novel' && !novelId) return null;
    if (kind === 'section' && (!novelId || !sectionKey)) return null;
    if (
      (kind === 'entry' || kind === 'entry-card') &&
      (!novelId || !sectionKey || !entryId)
    ) {
      return null;
    }
    if (kind === 'block' && (!novelId || !sectionKey || !entryId || !block)) {
      return null;
    }

    return {
      kind,
      hash,
      anchor: block ? `block:${block}` : cleanText(raw.anchor, 160) || 'page',
      novelId,
      sectionKey,
      entryId,
      block,
      label: cleanText(raw.label, 120) || '原位置',
      novelTitle: cleanText(raw.novelTitle, 60),
      sectionLabel:
        cleanText(raw.sectionLabel, 20) ||
        (sectionKey ? SECTIONS[sectionKey].label : ''),
      entryTitle: cleanText(raw.entryTitle, 60),
    };
  }

  function normalizeMap(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const cols = clampInt(raw.cols, 6, 40, MAP_DEFAULT_COLS);
    const rows = clampInt(raw.rows, 6, 30, MAP_DEFAULT_ROWS);
    const tiles = {};
    const rawTiles = raw.tiles && typeof raw.tiles === 'object' ? raw.tiles : {};

    for (const [key, value] of Object.entries(rawTiles)) {
      if (typeof value !== 'string' || value === 'grass') continue;
      if (!Object.prototype.hasOwnProperty.call(MAP_TERRAINS, value)) continue;
      const match = /^(\d{1,2}),(\d{1,2})$/.exec(key);
      if (!match) continue;
      const col = Number(match[1]);
      const row = Number(match[2]);
      if (col >= cols || row >= rows) continue;
      tiles[`${col},${row}`] = value;
    }

    const features = {};
    const rawFeatures =
      raw.features && typeof raw.features === 'object' ? raw.features : {};

    for (const [key, value] of Object.entries(rawFeatures)) {
      if (typeof value !== 'string') continue;
      if (!Object.prototype.hasOwnProperty.call(MAP_FEATURES, value)) continue;
      const match = /^(\d{1,2}),(\d{1,2})$/.exec(key);
      if (!match) continue;
      const col = Number(match[1]);
      const row = Number(match[2]);
      if (col >= cols || row >= rows) continue;
      features[`${col},${row}`] = value;
    }

    const cities = [];
    const seen = new Set();
    const rawCities = Array.isArray(raw.cities) ? raw.cities : [];

    for (const item of rawCities) {
      if (!item || typeof item !== 'object' || cities.length >= MAP_MAX_CITIES) continue;
      const col = clampInt(item.col, 0, cols - 1, null);
      const row = clampInt(item.row, 0, rows - 1, null);
      if (col === null || row === null) continue;

      const id =
        typeof item.id === 'string' && item.id.trim() ? item.id.trim() : makeId();
      if (seen.has(id)) continue;
      seen.add(id);

      const cells = Array.isArray(item.cells)
        ? [
            ...new Set(
              item.cells
                .map((key) => String(key))
                .filter((key) => /^\d{1,2},\d{1,2}$/.test(key))
                .map((key) => {
                  const [cellCol, cellRow] = key.split(',').map(Number);
                  return cellCol < cols && cellRow < rows ? `${cellCol},${cellRow}` : null;
                })
                .filter(Boolean)
            ),
          ]
        : [];
      const customArea = Boolean(item.customArea) && cells.length > 0;

      cities.push({
        id,
        name: cleanText(item.name, 40) || '未命名城市',
        col,
        row,
        color: normalizeCityColor(item.color, cities.length),
        radius: clampInt(item.radius, 1, 3, 2),
        ...(customArea ? { customArea: true, cells } : {}),
      });
    }

    const paths = [];
    const seenPaths = new Set();
    const rawPaths = Array.isArray(raw.paths) ? raw.paths : [];

    for (const item of rawPaths) {
      if (!item || typeof item !== 'object' || paths.length >= MAP_PATH_LIMIT) continue;
      const kind = MAP_PATH_KINDS[item.kind] ? item.kind : null;
      if (!kind) continue;

      const id =
        typeof item.id === 'string' && item.id.trim() ? item.id.trim() : makeId();
      if (seenPaths.has(id)) continue;
      seenPaths.add(id);

      const points = [];
      const rawPoints = Array.isArray(item.points) ? item.points : [];
      for (const point of rawPoints) {
        if (!point || typeof point !== 'object') continue;
        const col = clampInt(point.col, 0, cols - 1, null);
        const row = clampInt(point.row, 0, rows - 1, null);
        if (col === null || row === null) continue;
        const last = points[points.length - 1];
        if (last && last.col === col && last.row === row) continue;
        points.push({ col, row });
        if (points.length >= MAP_MAX_PATH_POINTS) break;
      }
      if (points.length < 2) continue;

      paths.push({ id, kind, points });
    }

    return { cols, rows, tiles, features, cities, paths };
  }

  function normalizeCityColor(value, index) {
    if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
      const normalized = value.toLowerCase();
      if (MAP_CITY_COLORS.includes(normalized)) return normalized;
    }
    return MAP_CITY_COLORS[index % MAP_CITY_COLORS.length];
  }

  function clampInt(value, min, max, fallback) {
    const number = Math.round(Number(value));
    if (!Number.isFinite(number)) return fallback;
    return Math.min(Math.max(number, min), max);
  }

  function cleanText(value, limit) {
    return typeof value === 'string' ? value.trim().slice(0, limit) : '';
  }

  function parseDate(value) {
    if (typeof value !== 'string') return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function normalizeTags(tags) {
    const result = [];
    for (const raw of tags) {
      if (typeof raw !== 'string') continue;
      const tag = raw.trim().replace(/^#+/, '').replace(/\s+/g, ' ').slice(0, MAX_TAG_LENGTH);
      if (!tag) continue;
      if (result.some((item) => item.toLowerCase() === tag.toLowerCase())) continue;
      result.push(tag);
      if (result.length >= MAX_TAGS) break;
    }
    return result;
  }

  function normalizeGraphPos(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const x = Number(raw.x);
    const y = Number(raw.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return {
      x: Math.round(Math.min(Math.max(x, GRAPH_MIN_X), GRAPH_MAX_X)),
      y: Math.round(Math.min(Math.max(y, GRAPH_MIN_Y), GRAPH_MAX_Y)),
    };
  }

  function normalizeGraphPositions(raw) {
    if (!raw || typeof raw !== 'object') return {};
    const result = {};
    for (const [key, value] of Object.entries(raw)) {
      const graphId = cleanText(key, 80);
      if (!graphId || Object.prototype.hasOwnProperty.call(result, graphId)) continue;
      const point = normalizeGraphPos(value);
      if (point) result[graphId] = point;
    }
    return result;
  }

  function normalizeRelationGraphs(raw) {
    const result = [];
    const seen = new Set();

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        let id = cleanText(item.id, 80);
        if (!id || seen.has(id)) id = makeId();
        seen.add(id);
        result.push({
          id,
          title:
            cleanText(item.title, GRAPH_MAX_GRAPH_TITLE) || `谱系 ${result.length + 1}`,
          createdAt: parseDate(item.createdAt) || new Date().toISOString(),
        });
        if (result.length >= GRAPH_MAX_GRAPHS) break;
      }
    }

    if (result.length === 0) {
      result.push({
        id: GRAPH_PRIMARY_ID,
        title: '人物关系',
        createdAt: new Date().toISOString(),
      });
    }

    return result;
  }

  function normalizeCharacterRelations(raw, graphs = null) {
    if (!Array.isArray(raw)) return [];
    const result = [];
    const pairSeen = new Set();
    const idSeen = new Set();
    const graphIds =
      Array.isArray(graphs) && graphs.length > 0
        ? new Set(graphs.map((graph) => graph.id))
        : null;
    const fallbackGraphId =
      Array.isArray(graphs) && graphs.length > 0 ? graphs[0].id : GRAPH_PRIMARY_ID;

    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const source = cleanText(item.source, 80);
      const target = cleanText(item.target, 80);
      if (!source || !target || source === target) continue;

      let graphId = cleanText(item.graphId, 80);
      if (!graphId || (graphIds && !graphIds.has(graphId))) graphId = fallbackGraphId;

      const pairKey = `${graphId}::${source < target ? `${source}|${target}` : `${target}|${source}`}`;
      if (pairSeen.has(pairKey)) continue;
      pairSeen.add(pairKey);

      let id = cleanText(item.id, 80);
      if (!id || idSeen.has(id)) id = makeId();
      idSeen.add(id);

      result.push({
        id,
        source,
        target,
        label: cleanText(item.label, GRAPH_MAX_LABEL_LENGTH) || '关联',
        directed: item.directed === true,
        graphId,
      });
      if (result.length >= GRAPH_MAX_RELATIONS) break;
    }

    return result;
  }

  function relationPairKey(source, target) {
    return source < target ? `${source}|${target}` : `${target}|${source}`;
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /* ---------- Routing ---------- */

  function parseRoute() {
    let raw = window.location.hash.replace(/^#\/?/, '').trim();
    if (!raw) return { view: 'shelf' };

    let parts;
    try {
      parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
    } catch (error) {
      return { view: 'missing' };
    }

    if (parts[0] === 'trash') {
      return parts.length === 1 ? { view: 'trash' } : { view: 'missing' };
    }

    if (parts[0] === 'comments') {
      return parts.length === 1 ? { view: 'comments' } : { view: 'missing' };
    }

    if (parts[0] === 'publish') {
      return parts.length === 1 ? { view: 'publish' } : { view: 'missing' };
    }

    if (parts[0] !== 'novel' || !parts[1]) return { view: 'missing' };

    const novel = findNovel(parts[1]);
    if (!novel) return { view: 'missing' };

    if (!parts[2]) return { view: 'novel', novel, sectionKey: null, entry: null };
    if (!Object.prototype.hasOwnProperty.call(SECTIONS, parts[2])) return { view: 'missing' };

    const sectionKey = parts[2];
    if (!parts[3]) return { view: 'section', novel, sectionKey, entry: null };

    if (sectionKey === 'outline' && parts[3] === 'new') {
      return parts.length === 4
        ? { view: 'outline-editor', novel, sectionKey, entry: null }
        : { view: 'missing' };
    }

    const entry = novel.entries[sectionKey].find((item) => item.id === parts[3]);

    if (sectionKey === 'outline' && parts[4] === 'edit') {
      if (parts.length !== 5) return { view: 'missing' };
      if (!entry) return { view: 'section', novel, sectionKey, entry: null, missingEntry: true };
      return { view: 'outline-editor', novel, sectionKey, entry };
    }

    if (!entry) return { view: 'section', novel, sectionKey, entry: null, missingEntry: true };

    return { view: 'entry', novel, sectionKey, entry };
  }

  function listScrollKey(route) {
    if (!route) return null;
    if (
      route.view === 'shelf' ||
      route.view === 'trash' ||
      route.view === 'comments' ||
      route.view === 'publish'
    ) {
      return route.view;
    }
    if (route.view === 'novel') return `novel:${route.novel.id}`;
    if (route.view === 'section') {
      return `section:${route.novel.id}:${route.sectionKey}`;
    }
    return null;
  }

  function clearPageFrameAnimation() {
    const animation = pageFrameAnimation;
    pageFrameAnimation = null;
    if (els.page) els.page.style.height = '';
    document.body.style.paddingBottom = '';
    if (animation) animation.cancel();
  }

  function measurePageFrameTargetHeight() {
    const height = els.page.getBoundingClientRect().height;
    if (!pendingSidebarReveal) return height;

    const reveal = els.sidebarSectionsGroup.querySelector('.side-current-reveal');
    const inner = reveal && reveal.querySelector('.side-current-inner');
    if (!reveal || !inner) return height;

    const remaining = Math.max(
      0,
      inner.scrollHeight - reveal.getBoundingClientRect().height
    );
    if (remaining < 1) return height;

    const sidebarAlign = els.sidebar.style.alignSelf;
    const contentAlign = els.content.style.alignSelf;
    els.sidebar.style.alignSelf = 'start';
    els.content.style.alignSelf = 'start';
    const sidebarHeight = els.sidebar.getBoundingClientRect().height;
    const contentHeight = els.content.getBoundingClientRect().height;
    els.sidebar.style.alignSelf = sidebarAlign;
    els.content.style.alignSelf = contentAlign;

    const style = window.getComputedStyle(els.page);
    const borders =
      (parseFloat(style.borderTopWidth) || 0) +
      (parseFloat(style.borderBottomWidth) || 0);
    const desktop = window.matchMedia('(min-width: 881px)').matches;
    const innerHeight = desktop
      ? Math.max(contentHeight, sidebarHeight + remaining)
      : contentHeight + sidebarHeight + remaining;
    return innerHeight + borders;
  }

  function startPageFrameAnimation(fromHeight, toHeight, compensateScroll) {
    if (!fromHeight || !toHeight) return;
    const distance = Math.abs(toHeight - fromHeight);
    if (distance < 2) return;

    if (compensateScroll && toHeight > fromHeight) {
      document.body.style.paddingBottom = `${toHeight - fromHeight}px`;
    }

    els.page.style.height = `${fromHeight}px`;
    void els.page.offsetHeight;

    const duration = Math.min(520, Math.round(300 + distance * 0.08));
    const animation = els.page.animate(
      [{ height: `${fromHeight}px` }, { height: `${toHeight}px` }],
      {
        duration,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        fill: 'forwards',
      }
    );
    pageFrameAnimation = animation;
    animation.onfinish = () => {
      if (pageFrameAnimation === animation) clearPageFrameAnimation();
    };
  }

  function renderRoute({ scroll = false, animateFrame = false } = {}) {
    const previousRoute = state.route;
    const route = parseRoute();
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const canAnimateFrame =
      animateFrame &&
      Boolean(previousRoute) &&
      !reduceMotion &&
      !state.pendingCommentFocus;
    const previousFrameHeight = canAnimateFrame
      ? els.page.getBoundingClientRect().height
      : 0;
    clearPageFrameAnimation();
    state.route = route;

    if (route.view !== 'outline-editor') {
      state.outlineDraft = {
        novelId: null,
        id: null,
        dirty: false,
        tags: [],
        hash: '',
      };
    }

    const desktop = window.matchMedia('(min-width: 881px)').matches;
    const compactEntry = scroll && route.view === 'entry' && !desktop;
    const previousListKey = listScrollKey(previousRoute);
    const nextListKey = listScrollKey(route);
    const fromDetail = Boolean(
      previousRoute
      && (previousRoute.view === 'entry' || previousRoute.view === 'outline-editor')
    );

    if (scroll && previousListKey) {
      state.listScrolls[previousListKey] = window.scrollY;
    }

    const sameNovel = Boolean(
      previousRoute
      && previousRoute.novel
      && route.novel
      && previousRoute.novel.id === route.novel.id
    );
    const sameTopLevel = Boolean(
      previousRoute
      && ['shelf', 'trash'].includes(previousRoute.view)
      && ['shelf', 'trash'].includes(route.view)
    );
    const siblingOverviews =
      Boolean(previousRoute)
      && previousRoute.view === 'novel'
      && route.view === 'novel';
    const sidebarScroll = state.sidebarScroll;
    state.sidebarScroll = null;

    const keepSidebarScroll = scroll
      && desktop
      && Boolean(previousListKey && nextListKey)
      && sidebarScroll !== null
      && (sameNovel || sameTopLevel || siblingOverviews);

    let targetScroll = 0;
    if (scroll && desktop) {
      if (keepSidebarScroll) {
        targetScroll = sidebarScroll;
      } else if (fromDetail && nextListKey && sameNovel) {
        targetScroll = state.listScrolls[nextListKey] ?? 0;
      }
    }

    if (route.view === 'shelf') {
      showView('shelf');
      renderShelf();
    } else if (route.view === 'trash') {
      showView('trash');
      renderTrash();
    } else if (route.view === 'comments') {
      showView('comments');
      renderComments();
    } else if (route.view === 'publish') {
      showView('publish');
      renderPublish();
    } else if (route.view === 'missing') {
      showView('missing');
      renderSidebar(route);
    } else {
      showView('novel');
      renderNovelWorkspace(route);
    }

    const frameTargetHeight = canAnimateFrame
      ? measurePageFrameTargetHeight()
      : 0;
    pendingSidebarReveal = false;

    if (scroll && !compactEntry) {
      window.scrollTo({ top: targetScroll, behavior: 'auto' });
    }

    if (compactEntry) {
      const crumb = els.novelView.querySelector('.workspace-breadcrumb');
      if (crumb) crumb.scrollIntoView({ block: 'start', behavior: 'auto' });
    }

    syncCommentFab(route);
    applyPendingCommentFocus();
    updateDocumentTitle(route);

    if (canAnimateFrame) {
      startPageFrameAnimation(
        previousFrameHeight,
        frameTargetHeight,
        scroll && window.scrollY > 0
      );
    }
  }

  function refreshCurrentView() {
    renderRoute();
  }

  function showView(name) {
    els.shelfView.hidden = name !== 'shelf';
    els.trashView.hidden = name !== 'trash';
    els.novelView.hidden = name !== 'novel';
    els.commentsView.hidden = name !== 'comments';
    els.publishView.hidden = name !== 'publish';
    els.missingView.hidden = name !== 'missing';
  }

  function updateDocumentTitle(route) {
    if (route.view === 'shelf') {
      document.title = `${SITE_NAME} · 我的小说书架`;
    } else if (route.view === 'trash') {
      document.title = `回收站 · ${SITE_NAME}`;
    } else if (route.view === 'comments') {
      document.title = `评论与标注 · ${SITE_NAME}`;
    } else if (route.view === 'publish') {
      document.title = `公开作品 · ${SITE_NAME}`;
    } else if (route.view === 'missing') {
      document.title = `这一页还没有写进故事里 · ${SITE_NAME}`;
    } else if (route.view === 'novel') {
      document.title = `${route.novel.title} · ${SITE_NAME}`;
    } else if (route.view === 'section') {
      document.title = `${SECTIONS[route.sectionKey].label} · ${route.novel.title} · ${SITE_NAME}`;
    } else if (route.view === 'entry') {
      document.title = `${route.entry.title} · ${route.novel.title} · ${SITE_NAME}`;
    } else if (route.view === 'outline-editor') {
      document.title = `${route.entry ? '编辑大纲' : '新增大纲'} · ${route.novel.title} · ${SITE_NAME}`;
    }
  }

  function novelHash(id) {
    return `#/novel/${encodeURIComponent(id)}`;
  }

  function sectionHash(novelId, sectionKey) {
    return `${novelHash(novelId)}/${encodeURIComponent(sectionKey)}`;
  }

  function entryHash(novelId, sectionKey, entryId) {
    return `${sectionHash(novelId, sectionKey)}/${encodeURIComponent(entryId)}`;
  }

  function outlineEditorHash(novelId, entryId = null) {
    return entryId
      ? `${entryHash(novelId, 'outline', entryId)}/edit`
      : `${sectionHash(novelId, 'outline')}/new`;
  }

  function findNovel(id) {
    return state.novels.find((novel) => novel.id === id) || null;
  }

  /* ---------- Shelf ---------- */

  function renderShelf() {
    syncShelfStatusFilters();

    const visible = getVisibleNovels();
    const hasNovels = state.novels.length > 0;
    const hasFilters = hasActiveShelfFilters();

    els.shelfToolbar.hidden = !hasNovels;

    const fragment = document.createDocumentFragment();
    for (const novel of visible) {
      fragment.appendChild(createNovelCard(novel));
    }
    els.novelGrid.replaceChildren(fragment);
    els.novelGrid.hidden = visible.length === 0;

    els.shelfEmpty.hidden = hasNovels;
    els.shelfNoResults.hidden = !hasNovels || visible.length > 0;
    els.shelfClearFiltersBtn.hidden = !hasFilters;

    if (!hasNovels) {
      els.shelfResultCount.textContent = '书架还空着';
    } else if (visible.length === 0) {
      els.shelfResultCount.textContent = '没有匹配的小说';
    } else if (hasFilters) {
      els.shelfResultCount.textContent = `筛选出 ${visible.length} 本小说`;
    } else {
      els.shelfResultCount.textContent = `共 ${visible.length} 本小说`;
    }

    renderSidebar(state.route);
  }

  function syncShelfStatusFilters() {
    const counts = { all: state.novels.length };
    for (const status of Object.keys(NOVEL_STATUS)) counts[status] = 0;
    for (const novel of state.novels) {
      if (Object.prototype.hasOwnProperty.call(counts, novel.status)) counts[novel.status] += 1;
    }

    els.shelfStatusFilters.querySelectorAll('.filter-pill').forEach((button) => {
      const status = button.dataset.status;
      const active = state.shelf.status === status;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      const countEl = $('.filter-count', button);
      if (countEl) countEl.textContent = counts[status] ?? 0;
    });
  }

  function getVisibleNovels() {
    const query = state.shelf.query.trim().toLowerCase();

    const filtered = state.novels.filter((novel) => {
      if (state.shelf.status !== 'all' && novel.status !== state.shelf.status) return false;
      if (query) {
        const haystack = [novel.title, novel.genre, novel.summary, novel.description]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    const sorters = {
      updated: (a, b) => pinWeight(b) - pinWeight(a) || timeValue(b.updatedAt) - timeValue(a.updatedAt),
      created: (a, b) => pinWeight(b) - pinWeight(a) || timeValue(b.createdAt) - timeValue(a.createdAt),
      title: (a, b) => pinWeight(b) - pinWeight(a) || a.title.localeCompare(b.title, 'zh-Hans-CN'),
    };

    return filtered.sort(sorters[state.shelf.sort] || sorters.updated);
  }

  function hasActiveShelfFilters() {
    return Boolean(state.shelf.query.trim()) || state.shelf.status !== 'all';
  }

  function createNovelCard(novel) {
    const node = els.novelCardTemplate.content.firstElementChild.cloneNode(true);
    const status = NOVEL_STATUS[novel.status] || NOVEL_STATUS.planning;
    const totalEntries = countNovelEntries(novel);

    node.dataset.novelId = novel.id;
    node.classList.toggle('is-pinned', novel.pinned);

    const link = $('.novel-card-main', node);
    link.href = novelHash(novel.id);

    $('.novel-cover-slot', node).appendChild(createCover(novel, 'shelf'));

    const statusPill = $('.status-pill', node);
    statusPill.classList.add(status.className);
    $('.status-text', node).textContent = status.label;

    $('.novel-genre', node).textContent = novel.genre || '未标注类型';

    const visibilityChip = createVisibilityChip(
      isNovelPublic(novel),
      isNovelPublic(novel) ? '公开' : '仅本地'
    );
    visibilityChip.title = isNovelPublic(novel)
      ? '已解锁：小说与跟随小说的条目会进入公开快照'
      : '未解锁：只在这台电脑可见';
    $('.novel-kicker', node).appendChild(visibilityChip);

    $('.novel-card-title', node).textContent = novel.title;

    const summaryEl = $('.novel-card-summary', node);
    if (novel.summary) {
      summaryEl.textContent = novel.summary;
    } else {
      summaryEl.textContent = '还没有写下故事简介。';
      summaryEl.classList.add('is-empty');
    }

    const novelWords = countNovelWords(novel);
    $('.novel-card-meta', node).textContent =
      `${novel.entries.characters.length} 位角色 · ${totalEntries} 条词条` +
      (novelWords > 0 ? ` · ${formatWordCount(novelWords)}` : '');

    const dateEl = $('.novel-card-date', node);
    const dateInfo = formatCardDate(novel);
    dateEl.textContent = dateInfo.label;
    dateEl.dateTime = novel.updatedAt;
    dateEl.title = dateInfo.full;

    node.querySelectorAll('button').forEach((button) => {
      button.dataset.novelId = novel.id;
    });

    const pinBtn = $('.pin-btn', node);
    if (novel.pinned) {
      pinBtn.classList.add('is-pinned');
      pinBtn.setAttribute('aria-pressed', 'true');
    }
    pinBtn.setAttribute('aria-label', novel.pinned ? '取消置顶小说' : '置顶小说');
    pinBtn.title = novel.pinned ? '取消置顶' : '置顶小说';

    const editBtn = $('[data-action="edit-novel"]', node);
    editBtn.setAttribute('aria-label', `编辑「${novel.title}」的资料`);

    const deleteBtn = $('[data-action="delete-novel"]', node);
    deleteBtn.setAttribute('aria-label', `删除「${novel.title}」`);

    return node;
  }

  function countNovelEntries(novel) {
    return SECTION_KEYS.reduce((sum, key) => sum + novel.entries[key].length, 0);
  }

  function countTextWords(text) {
    if (typeof text !== 'string') return 0;
    return text.replace(/\s+/g, '').length;
  }

  function countEntryWords(entry) {
    return countTextWords(entry && entry.notes);
  }

  function countSectionWords(novel, sectionKey) {
    return novel.entries[sectionKey].reduce(
      (sum, entry) => sum + countEntryWords(entry),
      0
    );
  }

  function countNovelWords(novel) {
    return SECTION_KEYS.reduce(
      (sum, key) => sum + countSectionWords(novel, key),
      0
    );
  }

  function formatWordCount(count) {
    if (!count) return '0 字';
    if (count < 10000) return `${count} 字`;
    return `${(count / 10000).toFixed(1).replace(/\.0$/, '')} 万字`;
  }

  function createWordCountChip(count) {
    const chip = el('span', 'word-count-chip');
    chip.appendChild(icon('i-notes'));
    chip.appendChild(el('span', '', formatWordCount(count)));
    chip.title = '按正文字符数统计（不含空格与换行）';
    return chip;
  }

  function syncShelfSearchBox() {
    const hasValue = els.shelfSearchInput.value.length > 0;
    els.shelfSearchInput.closest('.search-box').classList.toggle('has-value', hasValue);
    els.shelfSearchClearBtn.hidden = !hasValue;
  }

  function setShelfQuery(value) {
    els.shelfSearchInput.value = value;
    state.shelf.query = value;
    syncShelfSearchBox();
    renderShelf();
  }

  function clearShelfSearch({ focus = true } = {}) {
    setShelfQuery('');
    if (focus) els.shelfSearchInput.focus();
  }

  function resetShelfFilters({ focusSearch = false } = {}) {
    state.shelf.query = '';
    state.shelf.status = 'all';
    els.shelfSearchInput.value = '';
    syncShelfSearchBox();
    renderShelf();
    if (focusSearch) els.shelfSearchInput.focus();
  }

  function clearShelfFiltersSilently() {
    state.shelf.query = '';
    state.shelf.status = 'all';
    els.shelfSearchInput.value = '';
    syncShelfSearchBox();
  }

  /* ---------- Trash ---------- */

  function renderTrash() {
    const items = [...state.trash].sort(
      (a, b) => timeValue(b.deletedAt) - timeValue(a.deletedAt)
    );
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      fragment.appendChild(createTrashCard(item));
    }

    els.trashList.replaceChildren(fragment);
    els.trashList.hidden = items.length === 0;
    els.trashEmpty.hidden = items.length > 0;
    els.trashCount.hidden = items.length === 0;
    els.trashClearBtn.hidden = items.length === 0;
    els.trashClearBtn.disabled = items.length === 0;

    if (items.length === 0) {
      els.trashCount.textContent = '回收站是空的';
    } else {
      const novelCount = items.filter((item) => item.type === 'novel').length;
      const entryCount = items.length - novelCount;
      els.trashCount.textContent =
        `共 ${items.length} 项 · ${novelCount} 本小说 · ${entryCount} 条词条`;
    }

    renderSidebar(state.route);
  }

  function createTrashCard(item) {
    const isNovel = item.type === 'novel';
    const novel = isNovel ? null : findNovel(item.novelId);
    const title = isNovel ? item.payload.title : item.entryTitle;
    const sectionLabel = isNovel
      ? ''
      : SECTIONS[item.sectionKey]?.label || item.sectionLabel || '词条';

    const card = el('article', `trash-card ${isNovel ? 'is-novel' : 'is-entry'}`);
    card.dataset.trashId = item.id;

    const iconWrap = el('div', 'trash-icon');
    iconWrap.appendChild(
      icon(isNovel ? 'i-book' : SECTIONS[item.sectionKey]?.icon || 'i-notes')
    );

    const main = el('div', 'trash-main');
    const kicker = el('div', 'trash-kicker');
    kicker.appendChild(el('span', 'trash-type', isNovel ? '小说' : sectionLabel));
    if (!isNovel && !novel) {
      kicker.appendChild(el('span', 'trash-warning', '所属小说已删除'));
    }
    main.appendChild(kicker);
    main.appendChild(el('h3', 'trash-title', title));

    const deletedAt = new Date(item.deletedAt);
    const metaText = isNovel
      ? `删除于 ${fullDate(deletedAt)} · 含 ${countNovelEntries(item.payload)} 条内容`
      : `来自《${novel?.title || item.novelTitle || '未知小说'}》 · 删除于 ${fullDate(deletedAt)}`;
    main.appendChild(el('p', 'trash-meta', metaText));

    const summaryText = isNovel
      ? item.payload.summary || '这本小说没有填写简介。'
      : item.payload.summary || item.payload.subtitle || '这条内容没有填写简介。';
    main.appendChild(el('p', 'trash-summary', summaryText));

    const actions = el('div', 'trash-actions');
    const restoreBtn = el('button', 'btn ghost', '恢复');
    restoreBtn.type = 'button';
    restoreBtn.dataset.action = 'restore-trash';
    restoreBtn.dataset.trashId = item.id;
    const restorable = isNovel || Boolean(novel);
    restoreBtn.disabled = !restorable;
    if (!restorable) restoreBtn.title = '请先恢复这本小说';
    restoreBtn.setAttribute(
      'aria-label',
      `恢复${isNovel ? '小说' : '词条'}「${title}」`
    );

    const purgeBtn = el('button', 'icon-btn danger-hover');
    purgeBtn.type = 'button';
    purgeBtn.dataset.action = 'purge-trash';
    purgeBtn.dataset.trashId = item.id;
    purgeBtn.setAttribute('aria-label', `彻底删除「${title}」`);
    purgeBtn.title = '彻底删除';
    purgeBtn.appendChild(icon('i-trash'));

    actions.append(restoreBtn, purgeBtn);
    card.append(iconWrap, main, actions);
    return card;
  }

  /* ---------- Novel workspace ---------- */

  function renderNovelWorkspace(route) {
    const { novel } = route;
    const status = NOVEL_STATUS[novel.status] || NOVEL_STATUS.planning;

    els.novelView.classList.toggle(
      'is-entry-view',
      route.view === 'entry' || route.view === 'outline-editor'
    );
    els.novelView.classList.toggle('is-section-view', route.view === 'section');
    els.breadcrumbNovelTitle.textContent = novel.title;

    els.novelCoverSlot.replaceChildren(createCover(novel, 'hero'));

    els.novelStatusPill.className = `status-pill ${status.className}`;
    els.novelStatusText.textContent = status.label;
    els.novelGenreLabel.textContent = novel.genre || '未标注类型';

    const visibilityChip = createVisibilityChip(
      isNovelPublic(novel),
      isNovelPublic(novel) ? '已公开' : '仅本地'
    );
    visibilityChip.title = isNovelPublic(novel)
      ? '这本小说已解锁，条目默认跟随公开'
      : '这本小说未解锁，所有条目只在这台电脑可见';
    els.novelVisibilityChip.replaceChildren(visibilityChip);

    els.novelTitle.textContent = novel.title;

    if (novel.summary) {
      els.novelHeroSummary.textContent = novel.summary;
      els.novelHeroSummary.classList.remove('is-empty');
    } else {
      els.novelHeroSummary.textContent = '还没有写下故事简介。';
      els.novelHeroSummary.classList.add('is-empty');
    }

    els.novelHeroMeta.textContent = formatNovelMeta(novel);

    els.novelPinBtn.classList.toggle('is-pinned', novel.pinned);
    els.novelPinBtn.setAttribute('aria-pressed', String(novel.pinned));
    els.novelPinBtn.setAttribute(
      'aria-label',
      novel.pinned ? '取消置顶小说' : '置顶小说'
    );
    els.novelPinBtn.title = novel.pinned ? '取消置顶' : '置顶小说';

    renderWorkspaceNav(novel, route.view === 'novel' ? 'overview' : route.sectionKey);

    if (route.view === 'novel') {
      renderOverview(novel);
    } else if (route.view === 'section') {
      renderSection(novel, route.sectionKey);
    } else if (route.view === 'entry') {
      renderEntryDetail(novel, route.sectionKey, route.entry);
    } else if (route.view === 'outline-editor') {
      renderOutlineEditor(novel, route.entry);
    }

    renderSidebar(route);
  }

  function setSidebarSectionsVisible(visible) {
    const group = els.sidebarSectionsGroup;
    window.clearTimeout(sidebarSectionsSettleTimer);

    if (!visible) {
      group.hidden = true;
      group.classList.remove('is-open', 'is-settled');
      pendingSidebarReveal = false;
      return;
    }

    if (!group.hidden) return;

    group.hidden = false;
    group.classList.remove('is-open', 'is-settled');
    void group.offsetWidth;
    group.classList.add('is-open');
    pendingSidebarReveal = true;
    sidebarSectionsSettleTimer = window.setTimeout(() => {
      group.classList.add('is-settled');
    }, 320);
  }

  function renderSidebar(route = state.route) {
    const onShelf = Boolean(route && route.view === 'shelf');
    const onComments = Boolean(route && route.view === 'comments');
    const onTrash = Boolean(route && route.view === 'trash');
    const onPublish = Boolean(route && route.view === 'publish');
    const currentNovel =
      route && ['novel', 'section', 'entry', 'outline-editor'].includes(route.view)
        ? route.novel
        : null;

    els.sidebarShelfLink.classList.toggle('is-active', onShelf);
    if (onShelf) {
      els.sidebarShelfLink.setAttribute('aria-current', 'page');
    } else {
      els.sidebarShelfLink.removeAttribute('aria-current');
    }

    els.sidebarCommentsLink.classList.toggle('is-active', onComments);
    if (onComments) {
      els.sidebarCommentsLink.setAttribute('aria-current', 'page');
    } else {
      els.sidebarCommentsLink.removeAttribute('aria-current');
    }
    const commentCount = state.comments.length;
    els.sidebarCommentCount.textContent =
      commentCount > 99 ? '99+' : String(commentCount);
    els.sidebarCommentCount.hidden = commentCount === 0;

    els.sidebarTrashLink.classList.toggle('is-active', onTrash);
    if (onTrash) {
      els.sidebarTrashLink.setAttribute('aria-current', 'page');
    } else {
      els.sidebarTrashLink.removeAttribute('aria-current');
    }
    const trashCount = state.trash.length;
    els.sidebarTrashCount.textContent = trashCount > 99 ? '99+' : String(trashCount);
    els.sidebarTrashCount.hidden = trashCount === 0;

    els.sidebarPublishLink.classList.toggle('is-active', onPublish);
    if (onPublish) {
      els.sidebarPublishLink.setAttribute('aria-current', 'page');
    } else {
      els.sidebarPublishLink.removeAttribute('aria-current');
    }
    const publicNovelCount = state.novels.filter(isNovelPublic).length;
    els.sidebarPublicCount.textContent =
      publicNovelCount > 99 ? '99+' : String(publicNovelCount);
    els.sidebarPublicCount.hidden = publicNovelCount === 0;

    const novels = [...state.novels].sort(
      (a, b) => pinWeight(b) - pinWeight(a) || timeValue(b.updatedAt) - timeValue(a.updatedAt)
    );
    const fragment = document.createDocumentFragment();

    for (const novel of novels) {
      const active = Boolean(currentNovel && currentNovel.id === novel.id);
      const link = el('a', 'side-novel-link');
      link.href = novelHash(novel.id);
      link.title = novel.title;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');

      const dot = el('span', `side-novel-dot tone-${novel.tone}`);
      dot.setAttribute('aria-hidden', 'true');
      link.append(dot, el('span', 'side-novel-name', novel.title));
      if (isNovelPublic(novel)) {
        const publicMark = el('span', 'side-public-mark');
        publicMark.appendChild(icon('i-world'));
        publicMark.title = '已公开';
        link.appendChild(publicMark);
      }
      fragment.appendChild(link);
    }

    els.sidebarNovelList.replaceChildren(fragment);
    els.sidebarNovelList.hidden = novels.length === 0;
    els.sidebarNovelsEmpty.hidden = novels.length > 0;

    setSidebarSectionsVisible(Boolean(currentNovel));
    if (currentNovel) {
      els.sidebarBookLink.href = novelHash(currentNovel.id);
      els.sidebarBookLink.title = currentNovel.title;
      els.sidebarBookName.textContent = currentNovel.title;
    }
  }

  function renderWorkspaceNav(novel, activeKey) {
    const fragment = document.createDocumentFragment();

    const overviewLink = createNavLink({
      href: novelHash(novel.id),
      iconName: 'i-overview',
      label: '概览',
      count: countNovelEntries(novel),
      active: activeKey === 'overview',
    });
    fragment.appendChild(overviewLink);

    for (const key of SECTION_KEYS) {
      const config = SECTIONS[key];
      fragment.appendChild(
        createNavLink({
          href: sectionHash(novel.id, key),
          iconName: config.icon,
          label: config.label,
          count: novel.entries[key].length,
          active: activeKey === key,
        })
      );
    }

    els.workspaceNav.replaceChildren(fragment);
  }

  function createNavLink({ href, iconName, label, count, active }) {
    const link = document.createElement('a');
    link.className = 'workspace-nav-link';
    link.href = href;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');

    const iconWrap = el('span', 'workspace-nav-icon');
    iconWrap.appendChild(icon(iconName));

    const text = el('span', 'workspace-nav-text', label);
    const countEl = el('span', 'workspace-nav-count', count);

    link.append(iconWrap, text, countEl);
    return link;
  }

  function createCover(novel, size) {
    const cover = el('span', `book-cover tone-${novel.tone} cover-${size}`);
    cover.setAttribute('aria-hidden', 'true');
    if (novel.title.length > 12) cover.classList.add('is-long');
    if (novel.title.length > 22) cover.classList.add('is-very-long');

    cover.append(el('span', 'cover-spine'), el('span', 'cover-frame'));

    if (novel.cover) {
      cover.classList.add('has-image');
      cover.style.backgroundImage = `url("${novel.cover}")`;
    } else {
      cover.append(
        el('span', 'cover-title', novel.title),
        el('span', 'cover-seal', '簿')
      );
    }

    return cover;
  }

  function renderOverview(novel) {
    const fragment = document.createDocumentFragment();

    const synopsis = el('section', 'panel synopsis-card');
    const synopsisHead = el('div', 'panel-head');
    const synopsisHeadText = el('div');
    synopsisHeadText.append(
      el('p', 'eyebrow', 'SYNOPSIS'),
      el('h2', 'panel-title', '故事简介')
    );
    const editSynopsisBtn = el('button', 'link-btn', '编辑资料');
    editSynopsisBtn.type = 'button';
    editSynopsisBtn.dataset.action = 'edit-novel';
    const synopsisActions = el('div', 'panel-head-actions');
    const exportMarkdownBtn = el('button', 'link-btn', '导出 Markdown');
    exportMarkdownBtn.type = 'button';
    exportMarkdownBtn.dataset.action = 'export-novel-markdown';
    exportMarkdownBtn.dataset.novelId = novel.id;
    exportMarkdownBtn.title = '把这本小说的档案导出为 Markdown 文件';
    synopsisActions.append(exportMarkdownBtn, editSynopsisBtn);
    synopsisHead.append(synopsisHeadText, synopsisActions);

    const synopsisBody = el(
      'p',
      novel.description ? 'synopsis-body' : 'synopsis-body is-empty',
      novel.description || '还没有写下故事简介。可以从时代、地点和主要冲突开始。'
    );
    synopsis.append(synopsisHead, synopsisBody);

    const worldHead = el('div', 'overview-head-block');
    const worldHeadText = el('div');
    worldHeadText.append(
      el('p', 'eyebrow', 'THE STORY'),
      el('h2', 'overview-title', '故事档案')
    );
    worldHead.append(
      worldHeadText,
      el('p', 'overview-note', '大纲、人物、地点与规则，构成了故事的骨架与舞台。')
    );

    const sectionGrid = el('div', 'section-card-grid');
    for (const key of SECTION_KEYS) {
      sectionGrid.appendChild(createSectionCard(novel, key));
    }

    const recentHead = el('div', 'overview-head-block recent-head');
    const recentHeadText = el('div');
    recentHeadText.append(
      el('p', 'eyebrow', 'RECENTLY UPDATED'),
      el('h2', 'overview-title', '最近更新')
    );
    recentHead.appendChild(recentHeadText);

    const recentPanel = el('div', 'panel recent-panel');
    const recent = getRecentEntries(novel, 6);

    if (recent.length === 0) {
      recentPanel.appendChild(
        el(
          'p',
          'recent-empty',
          '还没有更新记录。新增的角色、背景与设定会出现在这里。'
        )
      );
    } else {
      const list = el('div', 'recent-list');
      for (const item of recent) {
        list.appendChild(createRecentItem(novel, item));
      }
      recentPanel.appendChild(list);
    }

    fragment.append(synopsis, worldHead, sectionGrid, recentHead, recentPanel);
    els.workspaceContent.replaceChildren(fragment);
  }

  function createSectionCard(novel, sectionKey) {
    const config = SECTIONS[sectionKey];
    const card = el('article', 'section-card');
    card.dataset.novelId = novel.id;

    const link = document.createElement('a');
    link.className = 'section-card-main';
    link.href = sectionHash(novel.id, sectionKey);
    link.setAttribute('aria-label', `进入${config.label}分区`);

    const top = el('div', 'section-card-top');
    const iconWrap = el('span', 'section-icon');
    iconWrap.appendChild(icon(config.icon));
    top.appendChild(iconWrap);
    link.appendChild(top);

    const title = el('h3', 'section-card-title');
    title.append(
      document.createTextNode(config.label),
      el('small', '', config.eyebrow)
    );
    link.appendChild(title);

    const countLine = el('p', 'section-card-count');
    countLine.append(
      el('strong', '', novel.entries[sectionKey].length),
      document.createTextNode(' 条')
    );
    const sectionWords = countSectionWords(novel, sectionKey);
    if (sectionWords > 0) {
      countLine.appendChild(
        document.createTextNode(` · ${formatWordCount(sectionWords)}`)
      );
    }
    link.appendChild(countLine);

    link.appendChild(el('p', 'section-card-desc', config.description));

    const enter = el('span', 'section-enter');
    enter.append(document.createTextNode('进入'), icon('i-arrow-right'));
    link.appendChild(enter);

    const addBtn = el('button', 'section-add-btn');
    addBtn.type = 'button';
    addBtn.dataset.action = 'new-entry';
    addBtn.dataset.sectionKey = sectionKey;
    addBtn.dataset.novelId = novel.id;
    addBtn.setAttribute('aria-label', config.addLabel);
    addBtn.title = config.addLabel;
    addBtn.appendChild(icon('i-plus'));

    card.append(link, addBtn);
    return card;
  }

  function getRecentEntries(novel, limit) {
    const items = [];
    for (const key of SECTION_KEYS) {
      for (const entry of novel.entries[key]) {
        items.push({ sectionKey: key, entry });
      }
    }
    items.sort((a, b) => timeValue(b.entry.updatedAt) - timeValue(a.entry.updatedAt));
    return items.slice(0, limit);
  }

  function createRecentItem(novel, { sectionKey, entry }) {
    const link = document.createElement('a');
    link.className = 'recent-item';
    link.href = entryHash(novel.id, sectionKey, entry.id);

    const chip = el('span', 'section-chip', SECTIONS[sectionKey].label);
    const title = el('span', 'recent-title', entry.title);
    const time = el('time', 'recent-time', relativeDate(new Date(entry.updatedAt)));
    time.dateTime = entry.updatedAt;

    link.append(chip, title, time, icon('i-arrow-right'));
    return link;
  }

  function renderSection(novel, sectionKey) {
    const config = SECTIONS[sectionKey];
    const allEntries = sortEntries(novel.entries[sectionKey]);
    const entries =
      sectionKey === 'outline' && state.outlineStatusFilter !== 'all'
        ? allEntries.filter(
            (entry) => (entry.status || '') === state.outlineStatusFilter
          )
        : allEntries;
    const fragment = document.createDocumentFragment();

    const head = el('header', 'content-head');
    head.dataset.commentAnchor = 'page';
    const headText = el('div', 'content-head-text');
    headText.appendChild(el('p', 'eyebrow', config.eyebrow));

    const heading = el('h1', 'content-title');
    heading.append(
      document.createTextNode(config.label),
      el('span', 'title-count', entries.length)
    );
    headText.appendChild(heading);
    headText.appendChild(el('p', 'content-desc', config.description));

    const addBtn = el('button', 'btn primary');
    addBtn.type = 'button';
    addBtn.dataset.action = 'new-entry';
    addBtn.dataset.sectionKey = sectionKey;
    addBtn.dataset.novelId = novel.id;
    addBtn.appendChild(icon('i-plus'));
    addBtn.appendChild(document.createTextNode(config.addLabel));

    if (sectionKey === 'characters' && allEntries.length > 0) {
      const headActions = el('div', 'content-head-actions');
      headActions.append(createCharactersViewSwitch(), addBtn);
      head.append(headText, headActions);
    } else {
      head.append(headText, addBtn);
    }
    fragment.appendChild(head);

    if (allEntries.length === 0) {
      fragment.appendChild(createSectionEmpty(novel, sectionKey));
    } else if (sectionKey === 'characters' && state.charactersView === 'graph') {
      fragment.appendChild(createCharacterGraphPanel(novel));
    } else {
      if (sectionKey === 'outline') {
        fragment.appendChild(createOutlineStatusFilter(novel));
      }
      if (entries.length === 0) {
        fragment.appendChild(
          el('p', 'section-filter-empty', '这个状态下还没有大纲，换一个筛选看看。')
        );
      } else {
        const grid = el('div', 'entry-grid');
        for (const entry of entries) {
          grid.appendChild(createEntryCard(novel, sectionKey, entry));
        }
        fragment.appendChild(grid);
      }
    }

    els.workspaceContent.replaceChildren(fragment);

    if (
      state.pendingHighlight &&
      state.pendingHighlight.novelId === novel.id &&
      state.pendingHighlight.sectionKey === sectionKey
    ) {
      const entryId = state.pendingHighlight.entryId;
      state.pendingHighlight = null;
      highlightEntryCard(entryId, { scroll: true });
    }
  }

  function createSectionEmpty(novel, sectionKey) {
    const config = SECTIONS[sectionKey];
    const empty = el('div', 'section-empty panel');
    const iconWrap = el('span', 'section-empty-icon');
    iconWrap.appendChild(icon(config.icon));

    const addBtn = el('button', 'btn primary');
    addBtn.type = 'button';
    addBtn.dataset.action = 'new-entry';
    addBtn.dataset.sectionKey = sectionKey;
    addBtn.dataset.novelId = novel.id;
    addBtn.appendChild(icon('i-plus'));
    addBtn.appendChild(document.createTextNode(config.addLabel));

    empty.append(
      iconWrap,
      el('h3', '', config.emptyTitle),
      el('p', '', config.emptyText),
      addBtn
    );
    return empty;
  }

  function sortEntries(entries) {
    return [...entries].sort(
      (a, b) => pinWeight(b) - pinWeight(a) || timeValue(b.updatedAt) - timeValue(a.updatedAt)
    );
  }

  function createOutlineStatusFilter(novel) {
    const counts = { all: novel.entries.outline.length, '': 0, planning: 0, drafting: 0, done: 0 };
    for (const entry of novel.entries.outline) {
      counts[normalizeEntryStatus(entry.status)] += 1;
    }

    const group = el('div', 'filter-row outline-status-filters');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', '按大纲状态筛选');

    const options = [
      { value: 'all', label: '全部' },
      { value: '', label: '未标记' },
      { value: 'planning', label: '构思中' },
      { value: 'drafting', label: '写作中' },
      { value: 'done', label: '已完成' },
    ];
    for (const option of options) {
      const active = state.outlineStatusFilter === option.value;
      const chip = el('button', `filter-pill${active ? ' is-active' : ''}`);
      chip.type = 'button';
      chip.dataset.action = 'outline-status-filter';
      chip.dataset.value = option.value;
      chip.setAttribute('aria-pressed', String(active));
      chip.appendChild(document.createTextNode(option.label));
      chip.appendChild(el('span', 'filter-count', counts[option.value]));
      group.appendChild(chip);
    }
    return group;
  }

  function createEntryCard(novel, sectionKey, entry) {
    const config = SECTIONS[sectionKey];
    const node = els.entryCardTemplate.content.firstElementChild.cloneNode(true);

    node.dataset.entryId = entry.id;
    node.dataset.sectionKey = sectionKey;
    node.dataset.novelId = novel.id;
    node.classList.toggle('is-pinned', entry.pinned);

    const link = $('.entry-card-main', node);
    link.href = entryHash(novel.id, sectionKey, entry.id);

    const titleEl = $('.entry-card-title', node);
    titleEl.textContent = entry.title;

    if (sectionKey === 'maps' && entry.map && mapHasContent(entry.map)) {
      const thumb = el('span', 'entry-card-map');
      thumb.appendChild(buildMapPreview(entry.map, { thumb: true }));
      if (entry.map.cities.length > 0) {
        thumb.appendChild(
          el('span', 'entry-card-map-badge', `${entry.map.cities.length} 座城市`)
        );
      }
      titleEl.after(thumb);
    }

    const subtitleEl = $('.entry-card-subtitle', node);
    if (entry.subtitle) {
      subtitleEl.textContent = entry.subtitle;
    } else {
      subtitleEl.remove();
    }

    const excerptEl = $('.entry-card-excerpt', node);
    if (entry.summary) {
      excerptEl.textContent = entry.summary;
    } else if (entry.notes) {
      excerptEl.textContent = entry.notes.replace(/\s+/g, ' ');
    } else {
      excerptEl.textContent = '还没有补充更多内容。';
      excerptEl.classList.add('is-empty');
    }

    const tagsEl = $('.entry-card-tags', node);
    const visibilityChip = createVisibilityChip(
      isEntryPublic(novel, entry),
      getEntryVisibilityLabel(novel, entry)
    );
    visibilityChip.title = isEntryPublic(novel, entry)
      ? '会进入公开快照'
      : '不会进入公开快照';
    tagsEl.appendChild(visibilityChip);

    if (sectionKey === 'outline' && ENTRY_STATUS[entry.status]) {
      const status = ENTRY_STATUS[entry.status];
      tagsEl.appendChild(
        el('span', `status-pill ${status.className} entry-status-pill`, status.label)
      );
    }

    for (const tag of entry.tags) {
      tagsEl.appendChild(el('span', 'entry-tag', tag));
    }

    const dateEl = $('.entry-card-date', node);
    const entryWords = countEntryWords(entry);
    dateEl.textContent =
      `更新于 ${relativeDate(new Date(entry.updatedAt))}` +
      (entryWords > 0 ? ` · ${formatWordCount(entryWords)}` : '');
    dateEl.dateTime = entry.updatedAt;

    const actions = $('.entry-actions', node);
    actions.querySelectorAll('button').forEach((button) => {
      button.dataset.novelId = novel.id;
      button.dataset.sectionKey = sectionKey;
      button.dataset.entryId = entry.id;
    });

    const pinBtn = $('.pin-btn', node);
    if (entry.pinned) {
      pinBtn.classList.add('is-pinned');
      pinBtn.setAttribute('aria-pressed', 'true');
    }
    pinBtn.setAttribute(
      'aria-label',
      entry.pinned ? `取消置顶「${entry.title}」` : `置顶「${entry.title}」`
    );
    pinBtn.title = entry.pinned ? '取消置顶' : '置顶条目';

    $('[data-action="edit-entry"]', node).setAttribute(
      'aria-label',
      `编辑「${entry.title}」`
    );
    $('[data-action="delete-entry"]', node).setAttribute(
      'aria-label',
      `删除「${entry.title}」`
    );

    return node;
  }

  function renderEntryDetail(novel, sectionKey, entry) {
    const config = SECTIONS[sectionKey];
    const fragment = document.createDocumentFragment();

    const back = document.createElement('a');
    back.className = 'back-link entry-back-link';
    back.href = sectionHash(novel.id, sectionKey);
    const backLabel =
      sectionKey === 'characters' && state.charactersView === 'graph'
        ? '返回角色关系图'
        : config.backLabel;
    back.append(icon('i-arrow-left'), document.createTextNode(backLabel));
    fragment.appendChild(back);

    const article = el('article', 'entry-detail panel');
    article.dataset.commentAnchor = 'page';

    const head = el('header', 'entry-detail-head');
    const kicker = el('div', 'entry-detail-kicker');
    kicker.appendChild(el('span', 'section-chip', config.label));
    const detailVisibilityChip = createVisibilityChip(
      isEntryPublic(novel, entry),
      getEntryVisibilityLabel(novel, entry)
    );
    detailVisibilityChip.title = isEntryPublic(novel, entry)
      ? '这条内容会进入公开快照'
      : '这条内容只在本机可见';
    kicker.appendChild(detailVisibilityChip);
    if (sectionKey === 'outline' && ENTRY_STATUS[entry.status]) {
      const status = ENTRY_STATUS[entry.status];
      kicker.appendChild(
        el('span', `status-pill ${status.className} entry-status-pill`, status.label)
      );
    }
    if (countEntryWords(entry) > 0) {
      kicker.appendChild(createWordCountChip(countEntryWords(entry)));
    }
    for (const tag of entry.tags) {
      kicker.appendChild(el('span', 'entry-tag', tag));
    }
    for (const alias of entry.aliases) {
      const aliasChip = el('span', 'entry-tag entry-alias-chip', alias);
      aliasChip.title = '别名 / 称谓';
      kicker.appendChild(aliasChip);
    }

    const actions = el('div', 'entry-detail-actions');
    const pinBtn = el('button', 'btn ghost pin-btn');
    pinBtn.type = 'button';
    pinBtn.dataset.action = 'pin-entry';
    pinBtn.dataset.novelId = novel.id;
    pinBtn.dataset.sectionKey = sectionKey;
    pinBtn.dataset.entryId = entry.id;
    pinBtn.setAttribute('aria-pressed', String(entry.pinned));
    pinBtn.setAttribute('aria-label', entry.pinned ? '取消置顶' : '置顶');
    pinBtn.classList.toggle('is-pinned', entry.pinned);
    pinBtn.append(icon('i-star'), document.createTextNode(entry.pinned ? '取消置顶' : '置顶'));

    const editBtn = el('button', 'btn ghost');
    editBtn.type = 'button';
    editBtn.dataset.action = 'edit-entry';
    editBtn.dataset.novelId = novel.id;
    editBtn.dataset.sectionKey = sectionKey;
    editBtn.dataset.entryId = entry.id;
    editBtn.append(icon('i-pencil'), document.createTextNode('编辑'));

    const deleteBtn = el('button', 'icon-btn danger-hover');
    deleteBtn.type = 'button';
    deleteBtn.dataset.action = 'delete-entry';
    deleteBtn.dataset.novelId = novel.id;
    deleteBtn.dataset.sectionKey = sectionKey;
    deleteBtn.dataset.entryId = entry.id;
    deleteBtn.setAttribute('aria-label', `删除「${entry.title}」`);
    deleteBtn.title = '删除';
    deleteBtn.appendChild(icon('i-trash'));

    actions.append(pinBtn, editBtn, deleteBtn);

    const title = el('h1', 'entry-detail-title', entry.title);
    const subtitle = entry.subtitle
      ? el('p', 'entry-detail-subtitle', entry.subtitle)
      : null;

    head.append(kicker, actions, title);
    if (subtitle) head.appendChild(subtitle);

    const body = el('div', 'entry-detail-body');

    if (entry.summary) {
      const lead = el('p', 'entry-lead', entry.summary);
      lead.dataset.commentAnchor = 'block:summary';
      body.appendChild(lead);
    }

    if (sectionKey === 'maps') {
      body.appendChild(createMapPanel(novel, sectionKey, entry));
    }

    const block = el('section', 'entry-detail-block');
    block.dataset.commentAnchor = 'block:notes';
    block.appendChild(el('h3', 'entry-block-title', config.notesLabel));

    if (entry.notes) {
      const notes = el('div', 'entry-notes', entry.notes);
      block.appendChild(notes);
    } else {
      const emptyNotes = el('div', 'entry-notes-empty');
      emptyNotes.appendChild(
        el('p', '', '这篇档案还没有写下更多内容。')
      );
      const fillBtn = el('button', 'link-btn', '补充内容');
      fillBtn.type = 'button';
      fillBtn.dataset.action = 'edit-entry';
      fillBtn.dataset.novelId = novel.id;
      fillBtn.dataset.sectionKey = sectionKey;
      fillBtn.dataset.entryId = entry.id;
      emptyNotes.appendChild(fillBtn);
      block.appendChild(emptyNotes);
    }
    body.appendChild(block);

    attachBacklinks(novel, sectionKey, entry, body);

    const meta = el('footer', 'entry-detail-meta');
    const created = new Date(entry.createdAt);
    const updated = new Date(entry.updatedAt);
    meta.appendChild(document.createTextNode(`创建于 ${fullDate(created)}`));
    if (updated.getTime() - created.getTime() > 2000) {
      meta.appendChild(document.createTextNode(` · 更新于 ${fullDate(updated)}`));
    }

    article.append(head, body, meta);
    fragment.appendChild(article);
    els.workspaceContent.replaceChildren(fragment);
  }

  /* ---------- Entry backlinks ---------- */

  // 扫描同小说其他词条的 title/summary/notes，命中当前词条标题或别名即记一条反链。
  // 首批同步扫描（≤100 条），其余用 idle 分批增量插入；路由切换通过 token 作废。
  function attachBacklinks(novel, sectionKey, entry, body) {
    const needles = [];
    const seenNeedle = new Set();
    for (const text of [entry.title, ...entry.aliases]) {
      const key = text.trim().toLowerCase();
      if (!key || seenNeedle.has(key)) continue;
      seenNeedle.add(key);
      needles.push(text.trim());
    }
    if (needles.length === 0) return;

    const sources = [];
    for (const key of SECTION_KEYS) {
      for (const src of novel.entries[key]) {
        if (src.id === entry.id) continue;
        sources.push({ sectionKey: key, entry: src });
      }
    }
    if (sources.length === 0) return;

    const token = ++state.backlinksToken;
    const matches = [];
    let attached = false;
    let cursor = 0;

    const block = el('section', 'entry-detail-block entry-backlinks');
    const title = el('h3', 'entry-block-title');
    const list = el('div', 'backlink-list');
    const more = el('p', 'backlink-more');
    more.hidden = true;
    block.append(title, list, more);

    const scanSource = (source) => {
      let hit = null;
      for (const field of [
        source.entry.title,
        source.entry.summary,
        source.entry.notes,
      ]) {
        if (!field) continue;
        const lower = field.toLowerCase();
        for (const needle of needles) {
          const index = lower.indexOf(needle.toLowerCase());
          if (index < 0) continue;
          if (!hit || index < hit.index) {
            hit = { field, index, length: needle.length };
          }
        }
      }
      return hit;
    };

    const buildRow = (source, hit) => {
      const row = el('a', 'backlink-row');
      row.href = entryHash(novel.id, source.sectionKey, source.entry.id);
      const iconWrap = el('span', 'backlink-row-icon');
      iconWrap.appendChild(icon(SECTIONS[source.sectionKey].icon));
      const main = el('span', 'backlink-row-main');
      main.appendChild(el('span', 'backlink-row-title', source.entry.title));
      if (hit) {
        const start = Math.max(0, hit.index - 24);
        const end = Math.min(
          hit.field.length,
          hit.index + hit.length + 48
        );
        const excerpt = el('span', 'backlink-row-excerpt');
        appendSearchHighlight(excerpt, {
          before: (start > 0 ? '…' : '') + hit.field.slice(start, hit.index),
          match: hit.field.slice(hit.index, hit.index + hit.length),
          after:
            hit.field.slice(hit.index + hit.length, end) +
            (end < hit.field.length ? '…' : ''),
        });
        main.appendChild(excerpt);
      }
      row.append(iconWrap, main);
      return row;
    };

    const syncHead = () => {
      title.textContent = `被 ${matches.length} 条内容提到`;
      const overflow = matches.length - BACKLINK_LIMIT;
      more.hidden = overflow <= 0;
      if (overflow > 0) {
        more.textContent = `还有 ${overflow} 条内容提到了它`;
      }
    };

    const ensureAttached = () => {
      if (attached || matches.length === 0) return;
      attached = true;
      body.appendChild(block);
    };

    const renderBatch = (count) => {
      const fragment = document.createDocumentFragment();
      for (const match of matches.slice(-count)) {
        fragment.appendChild(buildRow(match.source, match.hit));
      }
      list.appendChild(fragment);
      while (list.children.length > BACKLINK_LIMIT) {
        list.removeChild(list.firstChild);
      }
    };

    for (; cursor < Math.min(sources.length, BACKLINK_BATCH_SIZE); cursor += 1) {
      const hit = scanSource(sources[cursor]);
      if (!hit) continue;
      matches.push({ source: sources[cursor], hit });
    }
    if (matches.length > 0) {
      syncHead();
      renderBatch(matches.length);
      ensureAttached();
    }

    if (cursor >= sources.length) return;

    const scheduleIdle =
      window.requestIdleCallback ||
      ((callback) =>
        window.setTimeout(
          () => callback({ timeRemaining: () => 0 }),
          BACKLINK_IDLE_DELAY
        ));

    const step = () => {
      if (token !== state.backlinksToken) return;
      let budget = BACKLINK_BATCH_SIZE;
      const before = matches.length;
      for (; cursor < sources.length && budget > 0; cursor += 1, budget -= 1) {
        const hit = scanSource(sources[cursor]);
        if (!hit) continue;
        matches.push({ source: sources[cursor], hit });
      }
      if (matches.length > before) {
        syncHead();
        renderBatch(matches.length - before);
        ensureAttached();
      }
      if (cursor < sources.length) {
        scheduleIdle(step);
      }
    };
    scheduleIdle(step);
  }

  /* ---------- Character graph ---------- */

  function createCharactersViewSwitch() {
    const group = el('div', 'view-switch');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', '切换角色展示方式');

    const options = [
      { view: 'graph', label: '关系图', iconName: 'i-users' },
      { view: 'list', label: '档案', iconName: 'i-notes' },
    ];

    for (const option of options) {
      const active = state.charactersView === option.view;
      const button = el('button', 'view-switch-btn');
      button.type = 'button';
      button.dataset.action = 'characters-view';
      button.dataset.view = option.view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      button.append(icon(option.iconName), document.createTextNode(option.label));
      group.appendChild(button);
    }

    return group;
  }

  function createCharacterGraphPanel(novel) {
    const graph = getActiveRelationGraph(novel);
    const nodes = getGraphEntries(novel, graph);
    const relations = getGraphRelations(novel, nodes, graph.id);
    const positions = resolveGraphPositions(nodes, relations, graph.id);

    const panel = el('section', 'character-graph-panel panel');
    panel.appendChild(createGraphSwitcher(novel, graph));

    const toolbar = el('div', 'graph-toolbar');
    const meta = el('p', 'graph-meta');
    meta.append(
      el('strong', '', nodes.length),
      document.createTextNode(' 位角色'),
      el('span', 'graph-meta-sep', ' · '),
      el('strong', '', relations.length),
      document.createTextNode(' 条关系')
    );

    const actions = el('div', 'graph-actions');

    const addRelationBtn = el('button', 'btn primary');
    addRelationBtn.type = 'button';
    addRelationBtn.dataset.action = 'add-relation';
    addRelationBtn.dataset.novelId = novel.id;
    addRelationBtn.dataset.graphId = graph.id;
    addRelationBtn.append(icon('i-link'), document.createTextNode('添加关系'));

    if (nodes.length === 0) {
      actions.append(addRelationBtn);
      toolbar.append(meta, actions);
      panel.append(toolbar, createGraphEmptyState(novel));
      return panel;
    }

    const zoomGroup = el('div', 'graph-zoom');
    zoomGroup.setAttribute('role', 'group');
    zoomGroup.setAttribute('aria-label', '关系图缩放');

    const zoomOutBtn = el('button', 'graph-zoom-btn');
    zoomOutBtn.type = 'button';
    zoomOutBtn.setAttribute('aria-label', '缩小关系图');
    zoomOutBtn.appendChild(icon('i-zoom-out'));

    const zoomLevelBtn = el('button', 'graph-zoom-level');
    zoomLevelBtn.type = 'button';
    zoomLevelBtn.setAttribute('aria-label', '恢复 100% 缩放');
    zoomLevelBtn.textContent = '100%';

    const zoomInBtn = el('button', 'graph-zoom-btn');
    zoomInBtn.type = 'button';
    zoomInBtn.setAttribute('aria-label', '放大关系图');
    zoomInBtn.appendChild(icon('i-zoom-in'));

    const zoomFitBtn = el('button', 'graph-zoom-btn');
    zoomFitBtn.type = 'button';
    zoomFitBtn.setAttribute('aria-label', '关系图适应画布');
    zoomFitBtn.appendChild(icon('i-fit'));

    zoomGroup.append(zoomOutBtn, zoomLevelBtn, zoomInBtn, zoomFitBtn);

    const layoutBtn = el('button', 'btn ghost');
    layoutBtn.type = 'button';
    layoutBtn.dataset.action = 'layout-graph';
    layoutBtn.dataset.novelId = novel.id;
    layoutBtn.dataset.graphId = graph.id;
    layoutBtn.append(icon('i-fit'), document.createTextNode('自动排布'));

    actions.append(zoomGroup, layoutBtn, addRelationBtn);
    toolbar.append(meta, actions);

    const scroll = el('div', 'character-graph-scroll');
    const svg = svgEl('svg', {
      class: 'character-graph',
      viewBox: `0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`,
      role: 'group',
      'aria-label': `人物关系图「${graph.title}」，共 ${nodes.length} 位角色、${relations.length} 条关系`,
    });
    svg.appendChild(
      svgEl(
        'title',
        {},
        `人物关系图「${graph.title}」：${nodes.length} 位角色，${relations.length} 条关系`
      )
    );

    const edgeLayer = svgEl('g', { class: 'graph-edges' });
    const nodeLayer = svgEl('g', { class: 'graph-nodes' });
    svg.append(edgeLayer, nodeLayer);
    scroll.appendChild(svg);

    const viewKey = `${novel.id}:${graph.id}`;
    const savedView = state.graphViews[viewKey];
    const viewState = {
      zoom: savedView ? savedView.zoom : 1,
      x: savedView ? savedView.x : 0,
      y: savedView ? savedView.y : 0,
    };

    const edgeViews = relations.map((relation, index) => {
      const source = nodes.find((node) => node.id === relation.source);
      const target = nodes.find((node) => node.id === relation.target);
      const directed = relation.directed === true;
      const routeText = directed
        ? `${source.title} → ${target.title}`
        : `${source.title} ↔ ${target.title}`;
      const fullText = `${routeText}：${relation.label}`;
      const group = svgEl('g', {
        class: 'graph-edge',
        tabindex: '0',
        role: 'button',
        'aria-label': `编辑${directed ? '单向' : '双向'}关系：${fullText}`,
        'data-relation-id': relation.id,
      });
      group.appendChild(
        svgEl(
          'title',
          {},
          `${routeText} · ${relation.label}${directed ? '（单向）' : '（双向）'}`
        )
      );

      const hit = svgEl('path', { class: 'graph-edge-hit' });
      const line = svgEl('path', { class: 'graph-edge-line' });
      const arrow = svgEl('path', { class: 'graph-edge-arrow' });
      const label = svgEl('text', { class: 'graph-edge-label' });
      label.textContent = shortenGraphText(relation.label, 12);
      group.append(hit, line, arrow, label);
      edgeLayer.appendChild(group);

      const openEditor = () =>
        openRelationEditor({ novelId: novel.id, relationId: relation.id });
      group.addEventListener('click', (event) => {
        event.preventDefault();
        openEditor();
      });
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openEditor();
        }
      });

      return {
        relation,
        line,
        hit,
        arrow,
        label,
        curveSign: index % 2 === 0 ? 1 : -1,
        labelSide: index % 2 === 0 ? 1 : -1,
      };
    });

    nodes.forEach((entry, index) => {
      const point = positions.get(entry.id) || {
        x: GRAPH_WIDTH / 2,
        y: (GRAPH_MIN_Y + GRAPH_MAX_Y) / 2,
      };
      const tone = GRAPH_NODE_TONES[index % GRAPH_NODE_TONES.length];
      const href = entryHash(novel.id, 'characters', entry.id);
      const group = svgEl('g', {
        class: 'graph-node',
        tabindex: '0',
        role: 'link',
        'aria-label': `打开角色「${entry.title}」的人物档案`,
        transform: `translate(${point.x} ${point.y})`,
        'data-node-id': entry.id,
        'data-entry-id': entry.id,
      });
      group.style.setProperty('--node-fill', tone.fill);
      group.style.setProperty('--node-stroke', tone.stroke);
      group.style.setProperty('--node-ink', tone.ink);
      group.appendChild(
        svgEl(
          'title',
          {},
          entry.subtitle ? `${entry.title} · ${entry.subtitle}` : entry.title
        )
      );

      const halo = svgEl('circle', {
        class: 'graph-node-halo',
        cx: '0',
        cy: '0',
        r: '50',
      });
      const core = svgEl('circle', {
        class: 'graph-node-core',
        cx: '0',
        cy: '0',
        r: String(GRAPH_NODE_RADIUS),
      });
      const initial = svgEl('text', { class: 'graph-node-initial' });
      initial.textContent = getGraphInitial(entry.title);
      const name = svgEl('text', { class: 'graph-node-name', y: '59' });
      name.textContent = shortenGraphText(entry.title, 8);
      group.append(halo, core, initial, name);

      if (entry.subtitle) {
        const role = svgEl('text', { class: 'graph-node-role', y: '77' });
        role.textContent = shortenGraphText(entry.subtitle, 11);
        group.appendChild(role);
      }

      const activate = () => {
        if (suppressNodeClick) return;
        window.location.hash = href;
      };
      group.addEventListener('click', (event) => {
        event.preventDefault();
        activate();
      });
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });

      nodeLayer.appendChild(group);
    });

    for (const view of edgeViews) layoutGraphEdge(view, positions);
    layoutGraphEdgeLabels(edgeViews, positions);

    let suppressNodeClick = false;
    let dragState = null;
    let panState = null;

    const layoutAllEdges = () => {
      for (const view of edgeViews) layoutGraphEdge(view, positions);
      layoutGraphEdgeLabels(edgeViews, positions);
    };

    function applyGraphView() {
      const width = GRAPH_WIDTH / viewState.zoom;
      const height = GRAPH_HEIGHT / viewState.zoom;
      viewState.x = Math.min(Math.max(viewState.x, 0), GRAPH_WIDTH - width);
      viewState.y = Math.min(Math.max(viewState.y, 0), GRAPH_HEIGHT - height);
      svg.setAttribute(
        'viewBox',
        `${viewState.x.toFixed(1)} ${viewState.y.toFixed(1)} ${width.toFixed(
          1
        )} ${height.toFixed(1)}`
      );
      const percent = Math.round(viewState.zoom * 100);
      zoomLevelBtn.textContent = `${percent}%`;
      zoomLevelBtn.setAttribute('aria-label', `当前 ${percent}%，点击恢复 100% 缩放`);
      zoomOutBtn.disabled = viewState.zoom <= GRAPH_ZOOM_MIN + 0.001;
      zoomInBtn.disabled = viewState.zoom >= GRAPH_ZOOM_MAX - 0.001;
      svg.classList.toggle('is-zoomed', viewState.zoom > 1.001);
      state.graphViews[viewKey] = {
        zoom: viewState.zoom,
        x: viewState.x,
        y: viewState.y,
      };
    }

    function zoomAt(nextZoom, clientX, clientY) {
      const clamped = Math.min(
        GRAPH_ZOOM_MAX,
        Math.max(GRAPH_ZOOM_MIN, nextZoom)
      );
      if (Math.abs(clamped - viewState.zoom) < 0.0001) return;

      const rect = svg.getBoundingClientRect();
      const fx =
        clientX == null
          ? 0.5
          : Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
      const fy =
        clientY == null
          ? 0.5
          : Math.min(1, Math.max(0, (clientY - rect.top) / Math.max(rect.height, 1)));
      const currentWidth = GRAPH_WIDTH / viewState.zoom;
      const currentHeight = GRAPH_HEIGHT / viewState.zoom;
      const focusX = viewState.x + fx * currentWidth;
      const focusY = viewState.y + fy * currentHeight;

      viewState.zoom = clamped;
      const nextWidth = GRAPH_WIDTH / clamped;
      const nextHeight = GRAPH_HEIGHT / clamped;
      viewState.x = focusX - fx * nextWidth;
      viewState.y = focusY - fy * nextHeight;
      applyGraphView();
    }

    const resetGraphZoom = () => zoomAt(GRAPH_ZOOM_MIN, null, null);

    zoomOutBtn.addEventListener('click', () =>
      zoomAt(viewState.zoom - GRAPH_ZOOM_STEP, null, null)
    );
    zoomInBtn.addEventListener('click', () =>
      zoomAt(viewState.zoom + GRAPH_ZOOM_STEP, null, null)
    );
    zoomLevelBtn.addEventListener('click', resetGraphZoom);
    zoomFitBtn.addEventListener('click', resetGraphZoom);

    svg.addEventListener(
      'wheel',
      (event) => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        zoomAt(
          viewState.zoom * Math.exp(-event.deltaY * 0.0016),
          event.clientX,
          event.clientY
        );
      },
      { passive: false }
    );

    applyGraphView();

    svg.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const target = event.target instanceof Element ? event.target : null;
      const nodeEl = target ? target.closest('.graph-node') : null;

      if (nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        const origin = positions.get(nodeId);
        if (!origin) return;

        dragState = {
          nodeId,
          nodeEl,
          pointerId: event.pointerId,
          startClientX: event.clientX,
          startClientY: event.clientY,
          origin: { ...origin },
          moved: false,
        };
        // Pointer capture is deferred until the drag threshold so a plain click
        // still targets the node and triggers navigation.
        return;
      }

      if (viewState.zoom <= 1.001) return;
      if (target && target.closest('.graph-edge')) return;

      panState = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        originX: viewState.x,
        originY: viewState.y,
        moved: false,
      };
    });

    svg.addEventListener('pointermove', (event) => {
      if (panState && event.pointerId === panState.pointerId) {
        const dxClient = event.clientX - panState.startClientX;
        const dyClient = event.clientY - panState.startClientY;

        if (!panState.moved) {
          if (Math.hypot(dxClient, dyClient) < 4) return;
          panState.moved = true;
          if (!svg.hasPointerCapture(event.pointerId)) {
            svg.setPointerCapture(event.pointerId);
          }
          svg.classList.add('is-panning');
        }

        const rect = svg.getBoundingClientRect();
        const viewWidth = GRAPH_WIDTH / viewState.zoom;
        const viewHeight = GRAPH_HEIGHT / viewState.zoom;
        viewState.x =
          panState.originX -
          dxClient * (viewWidth / Math.max(rect.width, 1));
        viewState.y =
          panState.originY -
          dyClient * (viewHeight / Math.max(rect.height, 1));
        applyGraphView();
        event.preventDefault();
        return;
      }

      if (!dragState || event.pointerId !== dragState.pointerId) return;
      const dxClient = event.clientX - dragState.startClientX;
      const dyClient = event.clientY - dragState.startClientY;

      if (!dragState.moved) {
        if (Math.hypot(dxClient, dyClient) < 4) return;
        dragState.moved = true;
        if (!svg.hasPointerCapture(event.pointerId)) {
          svg.setPointerCapture(event.pointerId);
        }
        dragState.nodeEl.classList.add('is-dragging');
        svg.classList.add('is-dragging');
      }

      const rect = svg.getBoundingClientRect();
      const scaleX =
        GRAPH_WIDTH / viewState.zoom / Math.max(rect.width, 1);
      const scaleY =
        GRAPH_HEIGHT / viewState.zoom / Math.max(rect.height, 1);
      const next = {
        x: Math.min(
          GRAPH_MAX_X,
          Math.max(GRAPH_MIN_X, dragState.origin.x + dxClient * scaleX)
        ),
        y: Math.min(
          GRAPH_MAX_Y,
          Math.max(GRAPH_MIN_Y, dragState.origin.y + dyClient * scaleY)
        ),
      };

      positions.set(dragState.nodeId, next);
      dragState.nodeEl.setAttribute(
        'transform',
        `translate(${next.x.toFixed(1)} ${next.y.toFixed(1)})`
      );
      layoutAllEdges();
      event.preventDefault();
    });

    const finishDrag = (event, cancelled = false) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return false;
      const finished = dragState;
      dragState = null;
      finished.nodeEl.classList.remove('is-dragging');
      svg.classList.remove('is-dragging');
      if (svg.hasPointerCapture(event.pointerId)) {
        svg.releasePointerCapture(event.pointerId);
      }

      if (cancelled) {
        positions.set(finished.nodeId, finished.origin);
        finished.nodeEl.setAttribute(
          'transform',
          `translate(${finished.origin.x} ${finished.origin.y})`
        );
        layoutAllEdges();
        return true;
      }

      if (finished.moved) {
        suppressNodeClick = true;
        window.setTimeout(() => {
          suppressNodeClick = false;
        }, 0);
        if (
          !persistCharacterGraphPositions(novel.id, positions, graph.id)
        ) {
          showToast('角色位置未能保存', 'error');
        }
      }
      return true;
    };

    const finishPan = (event) => {
      if (!panState || event.pointerId !== panState.pointerId) return false;
      panState = null;
      svg.classList.remove('is-panning');
      if (svg.hasPointerCapture(event.pointerId)) {
        svg.releasePointerCapture(event.pointerId);
      }
      return true;
    };

    svg.addEventListener('pointerup', (event) => {
      finishDrag(event);
      finishPan(event);
    });
    svg.addEventListener('pointercancel', (event) => {
      finishDrag(event, true);
      finishPan(event);
    });

    const hint = el('p', 'graph-hint');
    if (relations.length === 0) {
      hint.textContent =
        novel.entries.characters.length < 2
          ? '再添加一位角色，就能画出第一条关系。'
          : '这个谱系里还没有可连接的关系。点击「添加关系」把角色连起来。';
    } else {
      hint.textContent =
        '拖动角色调整位置 · 点击连线修改关系 · 点击角色阅读档案 · Ctrl + 滚轮或按钮缩放';
    }

    panel.append(toolbar, scroll, hint);
    return panel;
  }

  function createGraphSwitcher(novel, activeGraph) {
    const switcher = el('div', 'graph-switcher');
    switcher.setAttribute('aria-label', '关系图谱系');

    const label = el('span', 'graph-switcher-label', '谱系');
    const tabs = el('div', 'graph-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', '切换关系图谱系');

    const relations = Array.isArray(novel.relations) ? novel.relations : [];
    for (const graph of novel.relationGraphs) {
      const count = relations.filter((relation) => relation.graphId === graph.id).length;
      const active = graph.id === activeGraph.id;
      const tab = el('button', 'graph-tab');
      tab.type = 'button';
      tab.dataset.action = 'switch-graph';
      tab.dataset.novelId = novel.id;
      tab.dataset.graphId = graph.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(active));
      tab.classList.toggle('is-active', active);
      tab.appendChild(document.createTextNode(graph.title));
      if (count > 0) {
        tab.appendChild(el('span', 'graph-tab-count', String(count)));
      }
      tabs.appendChild(tab);
    }

    const addTab = el('button', 'graph-tab graph-tab-add');
    addTab.type = 'button';
    addTab.dataset.action = 'new-graph';
    addTab.dataset.novelId = novel.id;
    addTab.setAttribute('aria-label', '新建谱系');
    addTab.append(icon('i-plus'), document.createTextNode('新建'));
    tabs.appendChild(addTab);

    const editBtn = el('button', 'icon-btn graph-edit-btn');
    editBtn.type = 'button';
    editBtn.dataset.action = 'edit-graph';
    editBtn.dataset.novelId = novel.id;
    editBtn.dataset.graphId = activeGraph.id;
    editBtn.setAttribute('aria-label', `重命名或删除谱系「${activeGraph.title}」`);
    editBtn.title = '重命名 / 删除当前谱系';
    editBtn.appendChild(icon('i-pencil'));

    switcher.append(label, tabs, editBtn);
    return switcher;
  }

  function createGraphEmptyState(novel) {
    const characters = novel.entries.characters;
    const empty = el('div', 'graph-empty');

    const iconWrap = el('span', 'graph-empty-icon');
    iconWrap.appendChild(icon(characters.length < 2 ? 'i-users' : 'i-link'));

    const title = el(
      'h3',
      '',
      characters.length < 2 ? '还需要一位角色' : '这个谱系还没有关系'
    );
    const text = el(
      'p',
      '',
      characters.length < 2
        ? '至少需要两位角色才能建立关系。先去角色档案里添加新角色吧。'
        : '点击「添加关系」，把相关的角色连起来；连过的角色会自动出现在这张谱系里。'
    );

    const action = el('button', 'btn primary');
    action.type = 'button';
    action.dataset.novelId = novel.id;
    if (characters.length < 2) {
      action.dataset.action = 'new-entry';
      action.dataset.sectionKey = 'characters';
      action.append(icon('i-plus'), document.createTextNode('添加角色'));
    } else {
      action.dataset.action = 'add-relation';
      action.append(icon('i-link'), document.createTextNode('添加关系'));
    }

    empty.append(iconWrap, title, text, action);
    return empty;
  }

  function getActiveRelationGraph(novel) {
    const graphs =
      Array.isArray(novel.relationGraphs) && novel.relationGraphs.length > 0
        ? novel.relationGraphs
        : normalizeRelationGraphs([]);
    const remembered = state.activeGraphByNovel[novel.id];
    const graph = graphs.find((item) => item.id === remembered) || graphs[0];
    state.activeGraphByNovel[novel.id] = graph.id;
    return graph;
  }

  function getGraphEntries(novel, graph) {
    const characters = [...novel.entries.characters].sort(
      (a, b) =>
        timeValue(a.createdAt) - timeValue(b.createdAt) ||
        a.title.localeCompare(b.title, 'zh-Hans-CN')
    );
    if (!graph) return characters;

    const memberIds = new Set();
    const relations = Array.isArray(novel.relations) ? novel.relations : [];
    for (const relation of relations) {
      if (relation.graphId !== graph.id) continue;
      memberIds.add(relation.source);
      memberIds.add(relation.target);
    }
    return characters.filter((entry) => memberIds.has(entry.id));
  }

  function getGraphRelations(novel, nodes, graphId) {
    const ids = new Set(nodes.map((node) => node.id));
    const list = Array.isArray(novel.relations) ? novel.relations : [];
    return list.filter(
      (relation) =>
        relation.graphId === graphId &&
        ids.has(relation.source) &&
        ids.has(relation.target)
    );
  }

  function resolveGraphPositions(nodes, relations, graphId) {
    const positions = new Map();
    const missing = [];

    for (const node of nodes) {
      const stored = node.graphPositions ? node.graphPositions[graphId] : null;
      const legacy = graphId === GRAPH_PRIMARY_ID ? node.graphPos : null;
      const point = stored || legacy;
      if (point) {
        positions.set(node.id, { x: point.x, y: point.y });
      } else {
        missing.push(node);
      }
    }

    if (positions.size === 0) {
      return computeAutoGraphPositions(nodes, relations);
    }

    for (const node of missing) {
      positions.set(node.id, findFreeGraphSpot(positions));
    }
    return positions;
  }

  function computeAutoGraphPositions(nodes, relations) {
    if (relations.length === 0) return computeRingGraphPositions(nodes);
    return computeForceGraphPositions(nodes, relations);
  }

  function computeRingGraphPositions(nodes) {
    const positions = new Map();
    const n = nodes.length;
    const cx = GRAPH_WIDTH / 2;
    const cy = (GRAPH_MIN_Y + GRAPH_MAX_Y) / 2;

    if (n === 1) {
      positions.set(nodes[0].id, { x: cx, y: cy - 8 });
      return positions;
    }

    if (n <= 10) {
      const radius = Math.min(262, Math.max(152, 86 + n * 17));
      const radiusY = Math.min(190, radius * 0.76);
      nodes.forEach((node, index) => {
        const angle = (index / n) * Math.PI * 2 - Math.PI / 2;
        positions.set(node.id, {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radiusY,
        });
      });
      return positions;
    }

    const cols = Math.ceil(Math.sqrt(n * 1.35));
    const rows = Math.ceil(n / cols);
    const gapX = Math.min(190, (GRAPH_MAX_X - GRAPH_MIN_X) / Math.max(cols - 1, 1));
    const gapY = Math.min(160, (GRAPH_MAX_Y - GRAPH_MIN_Y) / Math.max(rows - 1, 1));
    const totalX = (cols - 1) * gapX;
    const totalY = (rows - 1) * gapY;
    const startX = GRAPH_MIN_X + (GRAPH_MAX_X - GRAPH_MIN_X - totalX) / 2;
    const startY = GRAPH_MIN_Y + (GRAPH_MAX_Y - GRAPH_MIN_Y - totalY) / 2;

    nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      positions.set(node.id, {
        x: startX + col * gapX,
        y: startY + row * gapY,
      });
    });

    return positions;
  }

  function computeForceGraphPositions(nodes, relations) {
    const n = nodes.length;
    const cx = GRAPH_WIDTH / 2;
    const cy = (GRAPH_MIN_Y + GRAPH_MAX_Y) / 2;
    const points = nodes.map((node, index) => {
      const angle =
        (index / n) * Math.PI * 2 -
        Math.PI / 2 +
        (((index * 37) % 11) - 5) * 0.012;
      const radius = Math.min(268, 132 + n * 12);
      return {
        id: node.id,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * 0.76,
        vx: 0,
        vy: 0,
        fx: 0,
        fy: 0,
      };
    });

    const indexById = new Map(points.map((point, index) => [point.id, index]));
    const links = [];
    for (const relation of relations) {
      const sourceIndex = indexById.get(relation.source);
      const targetIndex = indexById.get(relation.target);
      if (
        sourceIndex !== undefined &&
        targetIndex !== undefined &&
        sourceIndex !== targetIndex
      ) {
        links.push([sourceIndex, targetIndex]);
      }
    }

    const ideal = n > 14 ? 156 : n > 8 ? 176 : n > 4 ? 210 : 248;
    const repulsion = ideal * ideal * 0.46;

    for (let step = 0; step < 280; step += 1) {
      for (const point of points) {
        point.fx = 0;
        point.fy = 0;
      }

      for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          const a = points[i];
          const b = points[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let distanceSq = dx * dx + dy * dy;
          if (distanceSq < 1) {
            dx = i - j || 1;
            dy = ((i + 1) % 3) - 1;
            distanceSq = dx * dx + dy * dy;
          }
          const distance = Math.sqrt(distanceSq);
          const force = repulsion / distanceSq;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          a.fx += fx;
          a.fy += fy;
          b.fx -= fx;
          b.fy -= fy;
        }
      }

      for (const [sourceIndex, targetIndex] of links) {
        const a = points[sourceIndex];
        const b = points[targetIndex];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 1;
        const force = (distance - ideal) * 0.022;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        a.fx += fx;
        a.fy += fy;
        b.fx -= fx;
        b.fy -= fy;
      }

      for (const point of points) {
        point.fx += (cx - point.x) * 0.0018;
        point.fy += (cy - point.y) * 0.0022;
        point.vx = (point.vx + point.fx) * 0.82;
        point.vy = (point.vy + point.fy) * 0.82;
        const speed = Math.hypot(point.vx, point.vy);
        if (speed > 16) {
          point.vx *= 16 / speed;
          point.vy *= 16 / speed;
        }
        point.x = Math.min(
          GRAPH_MAX_X,
          Math.max(GRAPH_MIN_X, point.x + point.vx)
        );
        point.y = Math.min(
          GRAPH_MAX_Y,
          Math.max(GRAPH_MIN_Y, point.y + point.vy)
        );
      }

      if (step % 30 === 0) resolveGraphOverlaps(points, ideal * 0.74);
    }

    resolveGraphOverlaps(points, 132);

    const positions = new Map();
    for (const point of points) {
      positions.set(point.id, {
        x: Math.round(point.x),
        y: Math.round(point.y),
      });
    }
    return positions;
  }

  function resolveGraphOverlaps(points, minDistance) {
    for (let pass = 0; pass < 8; pass += 1) {
      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const a = points[i];
          const b = points[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distance = Math.hypot(dx, dy);
          if (distance >= minDistance) continue;
          if (distance < 0.01) {
            dx = i - j || 1;
            dy = ((i + 1) % 3) - 1;
            distance = Math.hypot(dx, dy);
          }
          const push = (minDistance - distance) / 2;
          const nx = dx / distance;
          const ny = dy / distance;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
      for (const point of points) {
        point.x = Math.min(GRAPH_MAX_X, Math.max(GRAPH_MIN_X, point.x));
        point.y = Math.min(GRAPH_MAX_Y, Math.max(GRAPH_MIN_Y, point.y));
      }
    }
  }

  function findFreeGraphSpot(positions) {
    const candidates = [];
    for (let x = 160; x <= GRAPH_WIDTH - 160; x += 170) {
      for (let y = GRAPH_MIN_Y + 40; y <= GRAPH_MAX_Y - 30; y += 125) {
        candidates.push({ x, y });
      }
    }

    const center = {
      x: GRAPH_WIDTH / 2,
      y: (GRAPH_MIN_Y + GRAPH_MAX_Y) / 2,
    };
    const occupied = [...positions.values()];
    let best = candidates[0];
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      let nearest = Infinity;
      for (const point of occupied) {
        nearest = Math.min(
          nearest,
          Math.hypot(candidate.x - point.x, candidate.y - point.y)
        );
      }
      const centerDistance = Math.hypot(
        candidate.x - center.x,
        candidate.y - center.y
      );
      const score = nearest >= 138 ? 1000 - centerDistance : nearest;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best;
  }

  function layoutGraphEdge(view, positions) {
    const source = positions.get(view.relation.source);
    const target = positions.get(view.relation.target);
    if (!source || !target) return;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.hypot(dx, dy) || 1;
    const normalX = -dy / distance;
    const normalY = dx / distance;
    const controlX =
      (source.x + target.x) / 2 +
      normalX * Math.min(72, Math.max(24, distance * 0.16)) * view.curveSign;
    const controlY =
      (source.y + target.y) / 2 +
      normalY * Math.min(72, Math.max(24, distance * 0.16)) * view.curveSign;

    const trim = GRAPH_NODE_RADIUS + 6;
    const sourceDirX = controlX - source.x;
    const sourceDirY = controlY - source.y;
    const sourceLength = Math.hypot(sourceDirX, sourceDirY) || 1;
    const targetDirX = controlX - target.x;
    const targetDirY = controlY - target.y;
    const targetLength = Math.hypot(targetDirX, targetDirY) || 1;

    const startX = source.x + (sourceDirX / sourceLength) * trim;
    const startY = source.y + (sourceDirY / sourceLength) * trim;
    const endX = target.x + (targetDirX / targetLength) * trim;
    const endY = target.y + (targetDirY / targetLength) * trim;
    const path = `M${startX.toFixed(1)} ${startY.toFixed(1)} Q${controlX.toFixed(
      1
    )} ${controlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;

    view.line.setAttribute('d', path);
    view.hit.setAttribute('d', path);

    if (view.arrow) {
      if (view.relation.directed === true) {
        let tangentX = endX - controlX;
        let tangentY = endY - controlY;
        const tangentLength = Math.hypot(tangentX, tangentY) || 1;
        tangentX /= tangentLength;
        tangentY /= tangentLength;

        const arrowLength = 14;
        const arrowHalfWidth = 6.5;
        const baseX = endX - tangentX * arrowLength;
        const baseY = endY - tangentY * arrowLength;
        const perpX = -tangentY;
        const perpY = tangentX;
        const leftX = baseX + perpX * arrowHalfWidth;
        const leftY = baseY + perpY * arrowHalfWidth;
        const rightX = baseX - perpX * arrowHalfWidth;
        const rightY = baseY - perpY * arrowHalfWidth;

        view.arrow.setAttribute(
          'd',
          `M${endX.toFixed(1)} ${endY.toFixed(1)} L${leftX.toFixed(
            1
          )} ${leftY.toFixed(1)} L${rightX.toFixed(1)} ${rightY.toFixed(1)} Z`
        );
      } else {
        view.arrow.removeAttribute('d');
      }
    }

    view.geometry = {
      startX,
      startY,
      controlX,
      controlY,
      endX,
      endY,
      normalX,
      normalY,
    };
  }

  function layoutGraphEdgeLabels(edgeViews, positions) {
    if (edgeViews.length === 0) return;

    if (edgeViews.length > 48) {
      for (const view of edgeViews) {
        placeGraphEdgeLabelMidpoint(view, 16 * view.labelSide);
      }
      return;
    }

    const nodePoints = [...positions.values()];
    const placedRects = [];
    const tValues = [0.5, 0.4, 0.6, 0.32, 0.68, 0.24, 0.76];

    for (const view of edgeViews) {
      const { startX, startY, controlX, controlY, endX, endY, normalX, normalY } =
        view.geometry;
      const textWidth = estimateGraphLabelWidth(view.label.textContent);
      const rectWidth = Math.max(30, textWidth + 10);
      const rectHeight = 22;
      const baseSide = view.labelSide || 1;
      const offsets = [
        16 * baseSide,
        -16 * baseSide,
        28 * baseSide,
        -28 * baseSide,
        10 * baseSide,
        -10 * baseSide,
      ];
      let best = null;
      let bestPenalty = Infinity;

      for (const t of tValues) {
        const inverse = 1 - t;
        const anchorX =
          inverse * inverse * startX +
          2 * inverse * t * controlX +
          t * t * endX;
        const anchorY =
          inverse * inverse * startY +
          2 * inverse * t * controlY +
          t * t * endY;

        for (const offset of offsets) {
          const x = anchorX + normalX * offset;
          const y = anchorY + normalY * offset;
          const rect = {
            left: x - rectWidth / 2,
            right: x + rectWidth / 2,
            top: y - rectHeight / 2,
            bottom: y + rectHeight / 2,
          };
          if (
            rect.left < 20 ||
            rect.right > GRAPH_WIDTH - 20 ||
            rect.top < 16 ||
            rect.bottom > GRAPH_HEIGHT - 16
          ) {
            continue;
          }

          let penalty = t === 0.5 ? 0 : 5;
          penalty += Math.abs(offset) * 0.12;

          for (const point of nodePoints) {
            const distance = Math.hypot(x - point.x, y - point.y);
            if (distance < GRAPH_NODE_RADIUS + 14) penalty += 500;
            const zone = {
              left: point.x - 68,
              right: point.x + 68,
              top: point.y + 46,
              bottom: point.y + 94,
            };
            if (graphRectsOverlap(rect, zone)) penalty += 600;
          }

          for (const other of placedRects) {
            if (graphRectsOverlap(rect, other)) {
              const overlapX =
                Math.min(rect.right, other.right) - Math.max(rect.left, other.left);
              const overlapY =
                Math.min(rect.bottom, other.bottom) - Math.max(rect.top, other.top);
              penalty += 400 + overlapX * overlapY;
            }
          }

          if (penalty < bestPenalty) {
            bestPenalty = penalty;
            best = { x, y, rect };
            if (penalty === 0) break;
          }
        }
        if (bestPenalty === 0) break;
      }

      if (!best) {
        placeGraphEdgeLabelMidpoint(view, 16 * baseSide);
        placedRects.push(buildGraphLabelRect(view, rectWidth, rectHeight));
        continue;
      }

      view.label.setAttribute('x', best.x.toFixed(1));
      view.label.setAttribute('y', best.y.toFixed(1));
      placedRects.push(best.rect);
    }
  }

  function placeGraphEdgeLabelMidpoint(view, offset) {
    const { startX, startY, controlX, controlY, endX, endY, normalX, normalY } =
      view.geometry;
    const anchorX = 0.25 * startX + 0.5 * controlX + 0.25 * endX;
    const anchorY = 0.25 * startY + 0.5 * controlY + 0.25 * endY;
    view.label.setAttribute(
      'x',
      Math.min(GRAPH_WIDTH - 66, Math.max(66, anchorX + normalX * offset)).toFixed(1)
    );
    view.label.setAttribute(
      'y',
      Math.min(GRAPH_HEIGHT - 28, Math.max(28, anchorY + normalY * offset)).toFixed(1)
    );
  }

  function buildGraphLabelRect(view, width, height) {
    const x = Number(view.label.getAttribute('x')) || 0;
    const y = Number(view.label.getAttribute('y')) || 0;
    return {
      left: x - width / 2,
      right: x + width / 2,
      top: y - height / 2,
      bottom: y + height / 2,
    };
  }

  function estimateGraphLabelWidth(text) {
    let width = 0;
    for (const char of Array.from(String(text || ''))) {
      width += /[\u0000-\u00ff]/.test(char) ? 8 : 15;
    }
    return width;
  }

  function graphRectsOverlap(a, b) {
    return (
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top
    );
  }

  function persistCharacterGraphPositions(novelId, positions, graphId) {
    const novel = findNovel(novelId);
    if (!novel) return false;

    const previous = state.novels;
    const nextEntries = novel.entries.characters.map((entry) => {
      const point = positions.get(entry.id);
      if (!point) return entry;
      const rounded = {
        x: Math.round(point.x),
        y: Math.round(point.y),
      };
      return {
        ...entry,
        graphPos: graphId === GRAPH_PRIMARY_ID ? rounded : entry.graphPos,
        graphPositions: {
          ...(entry.graphPositions || {}),
          [graphId]: rounded,
        },
      };
    });

    state.novels = state.novels.map((item) =>
      item.id === novelId
        ? {
            ...item,
            entries: { ...item.entries, characters: nextEntries },
          }
        : item
    );

    if (!persist()) {
      state.novels = previous;
      return false;
    }
    return true;
  }

  function relayoutCharacterGraph(novelId, graphId) {
    const novel = findNovel(novelId);
    if (!novel) {
      refreshCurrentView();
      return;
    }

    const graph =
      novel.relationGraphs.find((item) => item.id === graphId) ||
      getActiveRelationGraph(novel);
    const nodes = getGraphEntries(novel, graph);
    const relations = getGraphRelations(novel, nodes, graph.id);
    const positions = computeAutoGraphPositions(nodes, relations);
    if (!persistCharacterGraphPositions(novelId, positions, graph.id)) return;

    refreshCurrentView();
    showToast('关系图已重新排布');
  }

  function shortenGraphText(text, limit) {
    const chars = Array.from(String(text));
    if (chars.length <= limit) return String(text);
    return `${chars.slice(0, limit).join('')}…`;
  }

  function getGraphInitial(title) {
    const trimmed = String(title).trim();
    if (!trimmed) return '·';
    const words = trimmed.split(/\s+/).filter((word) => /[A-Za-z]/.test(word));
    if (
      words.length >= 2 &&
      /^[A-Za-z]/.test(words[0]) &&
      /^[A-Za-z]/.test(words[1])
    ) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    const first = Array.from(trimmed)[0];
    return /[a-z]/.test(first) ? first.toUpperCase() : first;
  }

  function svgEl(tag, attributes = {}, text) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) {
      node.setAttribute(key, value);
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function highlightEntryCard(entryId, { scroll = false } = {}) {
    const card = els.workspaceContent.querySelector(
      `.entry-card[data-entry-id="${cssEscape(entryId)}"]`
    );
    const target =
      card ||
      els.workspaceContent.querySelector(
        `.graph-node[data-entry-id="${cssEscape(entryId)}"]`
      );
    if (!target) return;

    if (scroll) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const scrollTarget =
        target.ownerSVGElement && target.closest('.character-graph-panel')
          ? target.closest('.character-graph-panel')
          : target;
      scrollTarget.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }

    target.classList.add('is-highlighted');
    window.setTimeout(() => target.classList.remove('is-highlighted'), 1900);
  }

  /* ---------- Novel editor ---------- */

  function openNovelEditor(novelId = null) {
    const novel = novelId ? findNovel(novelId) : null;
    const isNew = !novel;

    state.novelDraft = {
      id: novel ? novel.id : null,
      dirty: false,
      cover: novel ? novel.cover || '' : '',
      coverBusy: false,
    };
    els.novelForm.reset();
    els.novelCoverInput.value = '';
    clearNovelTitleError();

    if (novel) {
      els.novelTitleInput.value = novel.title;
      els.novelGenreInput.value = novel.genre;
      els.novelSummaryInput.value = novel.summary;
      els.novelDescriptionInput.value = novel.description;
      els.novelPublicInput.checked = isNovelPublic(novel);
      setNovelStatus(novel.status);
      setNovelTone(novel.tone);
      els.novelDialogEyebrow.textContent = 'EDIT NOVEL';
      els.novelDialogTitle.textContent = '编辑小说';
      els.novelSaveBtn.textContent = '保存修改';
    } else {
      els.novelPublicInput.checked = false;
      setNovelStatus('planning');
      setNovelTone(state.novels.length % 5);
      els.novelDialogEyebrow.textContent = 'NEW NOVEL';
      els.novelDialogTitle.textContent = '新建小说';
      els.novelSaveBtn.textContent = '放上书架';
    }

    syncNovelVisibilityHint();
    updateNovelDescriptionCount();
    updateNovelCoverPreview();
    setNovelCoverBusy(false);
    setNovelCoverStatus(
      state.novelDraft.cover ? '当前使用自定义封面' : '',
      ''
    );
    els.novelDialog.showModal();
    requestAnimationFrame(() => els.novelTitleInput.focus());

    if (!isNew) {
      els.novelTitleInput.setSelectionRange(
        els.novelTitleInput.value.length,
        els.novelTitleInput.value.length
      );
    }
  }

  function setNovelStatus(status) {
    const input = els.novelForm.querySelector(`input[name="status"][value="${status}"]`);
    if (input) input.checked = true;
  }

  function syncNovelVisibilityHint() {
    els.novelVisibilityHint.textContent = els.novelPublicInput.checked
      ? '已解锁：小说和「跟随小说」的条目会进入公开快照。'
      : '未解锁：小说与所有条目只在这台电脑可见。';
  }

  function setNovelTone(tone) {
    const input = els.novelForm.querySelector(`input[name="tone"][value="${tone}"]`);
    if (input) input.checked = true;
  }

  function updateNovelDescriptionCount() {
    els.novelDescriptionCount.textContent = `${els.novelDescriptionInput.value.length} 字`;
  }

  function updateNovelCoverPreview() {
    const title = els.novelTitleInput.value.trim() || '未命名';
    const toneInput = els.novelForm.querySelector('input[name="tone"]:checked');
    const tone = toneInput ? Number(toneInput.value) : 0;
    const cover = state.novelDraft.cover || '';

    els.novelCoverPreview.replaceChildren(
      createCover({ title, tone, cover }, 'preview')
    );
    els.novelCoverPreview.classList.toggle('has-image', Boolean(cover));
    els.novelCoverRemoveBtn.hidden = !cover;
  }

  function setNovelCoverStatus(message, variant = '') {
    els.novelCoverStatus.textContent = message;
    els.novelCoverStatus.classList.toggle('is-error', variant === 'error');
  }

  function setNovelCoverBusy(busy) {
    state.novelDraft.coverBusy = busy;
    els.novelCoverUploadBtn.disabled = busy;
    els.novelCoverRemoveBtn.disabled = busy;
    els.novelSaveBtn.disabled = busy;
    els.novelCoverUploadLabel.textContent = busy ? '处理中…' : '选择图片';
  }

  function decodeCoverFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        resolve({
          source: image,
          width: image.naturalWidth,
          height: image.naturalHeight,
          release: () => URL.revokeObjectURL(url),
        });
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('这张图片无法读取，请换成 JPG、PNG 或 WebP（HEIC 请先转换）'));
      };
      image.src = url;
    });
  }

  async function prepareCoverImage(file) {
    const looksLikeImage =
      file.type.startsWith('image/') ||
      /\.(?:jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);
    if (!looksLikeImage) {
      throw new Error('请选择一张图片文件');
    }
    if (file.size > COVER_MAX_FILE_BYTES) {
      throw new Error('图片超过 20MB，换一张小一点的吧');
    }

    let decoded;
    try {
      if (typeof createImageBitmap === 'function') {
        const bitmap = await createImageBitmap(file, {
          imageOrientation: 'from-image',
        });
        decoded = {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          release: () => bitmap.close(),
        };
      } else {
        decoded = await decodeCoverFile(file);
      }
    } catch (error) {
      decoded = await decodeCoverFile(file);
    }

    try {
      if (!decoded.width || !decoded.height) {
        throw new Error('这张图片没有可用的画面，请换一张');
      }

      const canvas = document.createElement('canvas');
      canvas.width = COVER_WIDTH;
      canvas.height = COVER_HEIGHT;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('浏览器无法处理这张图片');

      context.fillStyle = '#f6f1e6';
      context.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT);

      const scale = Math.max(
        COVER_WIDTH / decoded.width,
        COVER_HEIGHT / decoded.height
      );
      const drawWidth = decoded.width * scale;
      const drawHeight = decoded.height * scale;
      context.drawImage(
        decoded.source,
        (COVER_WIDTH - drawWidth) / 2,
        (COVER_HEIGHT - drawHeight) / 2,
        drawWidth,
        drawHeight
      );

      let quality = 0.84;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      while (dataUrl.length > COVER_MAX_LENGTH && quality > 0.5) {
        quality = Math.max(0.5, quality - 0.08);
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      if (dataUrl.length > COVER_MAX_LENGTH) {
        throw new Error('图片压缩后仍然太大，请换一张');
      }
      return dataUrl;
    } finally {
      decoded.release();
    }
  }

  async function handleNovelCoverFile() {
    const file = els.novelCoverInput.files && els.novelCoverInput.files[0];
    els.novelCoverInput.value = '';
    if (!file || state.novelDraft.coverBusy) return;

    const draft = state.novelDraft;
    setNovelCoverBusy(true);
    setNovelCoverStatus('正在处理图片…');
    try {
      const cover = await prepareCoverImage(file);
      if (state.novelDraft !== draft) return;
      draft.cover = cover;
      draft.dirty = true;
      updateNovelCoverPreview();
      setNovelCoverStatus('封面已就绪，保存后生效');
    } catch (error) {
      if (state.novelDraft !== draft) return;
      setNovelCoverStatus(error.message, 'error');
      showToast(error.message, 'error');
    } finally {
      if (state.novelDraft === draft) setNovelCoverBusy(false);
    }
  }

  function removeNovelCover() {
    if (!state.novelDraft.cover || state.novelDraft.coverBusy) return;
    state.novelDraft.cover = '';
    state.novelDraft.dirty = true;
    updateNovelCoverPreview();
    setNovelCoverStatus('已恢复自动书封，保存后生效');
  }

  function showNovelTitleError() {
    els.novelTitleField.classList.add('has-error');
    els.novelTitleError.hidden = false;
    els.novelTitleInput.focus();
  }

  function clearNovelTitleError() {
    els.novelTitleField.classList.remove('has-error');
    els.novelTitleError.hidden = true;
  }

  function attemptCloseNovelEditor() {
    if (!state.novelDraft.dirty) {
      els.novelDialog.close();
      return;
    }

    openConfirm({
      title: '放弃这次修改？',
      message: '关闭后，尚未保存的内容会丢失。',
      okLabel: '放弃修改',
      onConfirm: () => {
        state.novelDraft.dirty = false;
        els.novelDialog.close();
      },
    });
  }

  function saveNovel() {
    if (state.novelDraft.coverBusy) {
      showToast('封面图片还在处理中，稍等一下');
      return;
    }

    const title = els.novelTitleInput.value.trim();
    if (!title) {
      showNovelTitleError();
      return;
    }

    const statusInput = els.novelForm.querySelector('input[name="status"]:checked');
    const toneInput = els.novelForm.querySelector('input[name="tone"]:checked');
    const visibility = els.novelPublicInput.checked ? 'public' : 'private';
    const now = new Date().toISOString();
    const isNew = !state.novelDraft.id;
    const previous = state.novels;
    let savedId;

    if (isNew) {
      savedId = makeId();
      const novel = {
        id: savedId,
        title: title.slice(0, 60),
        genre: els.novelGenreInput.value.trim().slice(0, 20),
        summary: els.novelSummaryInput.value.trim().slice(0, 160),
        description: els.novelDescriptionInput.value.trim(),
        status: statusInput ? statusInput.value : 'planning',
        tone: toneInput ? Number(toneInput.value) : 0,
        cover: state.novelDraft.cover || '',
        pinned: false,
        visibility,
        createdAt: now,
        updatedAt: now,
        entries: createEmptyEntries(),
        relationGraphs: normalizeRelationGraphs([]),
        relations: [],
      };
      state.novels = [novel, ...state.novels];
    } else {
      savedId = state.novelDraft.id;
      const current = findNovel(savedId);
      if (!current) {
        els.novelDialog.close();
        showToast('这本小说已经不在了', 'error');
        refreshCurrentView();
        return;
      }

      state.novels = state.novels.map((novel) =>
        novel.id === savedId
          ? {
              ...novel,
              title: title.slice(0, 60),
              genre: els.novelGenreInput.value.trim().slice(0, 20),
              summary: els.novelSummaryInput.value.trim().slice(0, 160),
              description: els.novelDescriptionInput.value.trim(),
              status: statusInput ? statusInput.value : 'planning',
              tone: toneInput ? Number(toneInput.value) : novel.tone,
              cover: state.novelDraft.cover || '',
              visibility,
              updatedAt: now,
            }
          : novel
      );
    }

    if (!persist()) {
      state.novels = previous;
      return;
    }

    state.novelDraft.dirty = false;
    els.novelDialog.close();

    if (isNew) {
      clearShelfFiltersSilently();
      window.location.hash = novelHash(savedId);
      showToast('新小说已放上书架');
    } else {
      refreshCurrentView();
      showToast('小说资料已保存');
    }
  }

  function createEmptyEntries() {
    const entries = {};
    for (const key of SECTION_KEYS) entries[key] = [];
    return entries;
  }

  /* ---------- Entry editor ---------- */

  function openEntryEditor({ novelId, sectionKey, entryId = null }) {
    const novel = findNovel(novelId);
    if (!novel) {
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const config = SECTIONS[sectionKey];
    if (!config) return;

    if (sectionKey === 'outline') {
      window.location.hash = outlineEditorHash(novelId, entryId);
      return;
    }

    const entry = entryId
      ? novel.entries[sectionKey].find((item) => item.id === entryId)
      : null;

    state.entryDraft = {
      novelId,
      sectionKey,
      id: entry ? entry.id : null,
      dirty: false,
    };
    state.draftTags = entry ? [...entry.tags] : [];

    els.entryForm.reset();
    clearEntryTitleError();

    els.entryTitleLabelText.textContent = config.titleLabel;
    els.entrySubtitleLabelText.textContent = config.subtitleLabel;
    els.entrySummaryLabelText.textContent = config.summaryLabel;
    els.entryNotesLabelText.textContent = config.notesLabel;

    els.entryTitleInput.placeholder = config.titlePlaceholder;
    els.entrySubtitleInput.placeholder = config.subtitlePlaceholder;
    els.entrySummaryInput.placeholder = config.summaryPlaceholder;
    els.entryNotesInput.placeholder = config.notesPlaceholder;
    els.entryTitleError.textContent = config.emptyError;
    setEntryVisibility(entry ? entry.visibility : 'inherit');
    syncEntryVisibilityHint();

    if (entry) {
      els.entryTitleInput.value = entry.title;
      els.entrySubtitleInput.value = entry.subtitle;
      els.entrySummaryInput.value = entry.summary;
      els.entryNotesInput.value = entry.notes;
      els.entryAliasesInput.value = entry.aliases.join('，');
      els.entryDialogEyebrow.textContent = `${config.eyebrow} · EDIT`;
      els.entryDialogTitle.textContent = `编辑${config.singular}`;
      els.entrySaveBtn.textContent = '保存修改';
    } else {
      els.entryDialogEyebrow.textContent = `${config.eyebrow} · NEW`;
      els.entryDialogTitle.textContent = `新增${config.singular}`;
      els.entrySaveBtn.textContent = '保存条目';
    }

    els.entryTagInput.value = '';
    renderEditorTags();
    updateEntryTagSuggestions();
    updateEntryNotesCount();

    els.entryDialog.showModal();
    requestAnimationFrame(() => els.entryTitleInput.focus());
  }

  function setEntryVisibility(value) {
    const input = els.entryForm.querySelector(
      `input[name="entryVisibility"][value="${value}"]`
    );
    if (input) input.checked = true;
  }

  function getSelectedEntryVisibility() {
    const input = els.entryForm.querySelector('input[name="entryVisibility"]:checked');
    return normalizeEntryVisibility(input ? input.value : 'inherit');
  }

  function syncEntryVisibilityHint() {
    const novel = findNovel(state.entryDraft.novelId);
    const value = getSelectedEntryVisibility();
    const novelPublic = isNovelPublic(novel);
    let hint;

    if (value === 'private') {
      hint = '私密：这条内容不会进入公开快照。';
    } else if (value === 'public') {
      hint = novelPublic
        ? '公开：这条内容会进入公开快照。'
        : '已标记公开，但这本小说尚未解锁，暂时只在本机可见。';
    } else {
      hint = novelPublic
        ? '跟随小说：这本小说已解锁，这条内容会一起公开。'
        : '跟随小说：这本小说尚未解锁，这条内容只在本机可见。';
    }

    els.entryVisibilityHint.textContent = hint;
  }

  function updateEntryNotesCount() {
    els.entryNotesCount.textContent = `${els.entryNotesInput.value.length} 字`;
  }

  function showEntryTitleError() {
    els.entryTitleField.classList.add('has-error');
    els.entryTitleError.hidden = false;
    els.entryTitleInput.focus();
  }

  function clearEntryTitleError() {
    els.entryTitleField.classList.remove('has-error');
    els.entryTitleError.hidden = true;
  }

  function renderEditorTags() {
    els.entryTagEditor.querySelectorAll('.editor-tag').forEach((chip) => chip.remove());

    const fragment = document.createDocumentFragment();
    for (const tag of state.draftTags) {
      const chip = el('span', 'editor-tag');
      const label = el('span', '', tag);

      const removeBtn = el('button', '', '×');
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', `移除标签 ${tag}`);
      removeBtn.addEventListener('click', () => {
        state.draftTags = state.draftTags.filter((item) => item !== tag);
        markEntryDirty();
        renderEditorTags();
        updateEntryTagSuggestions();
        els.entryTagInput.focus();
      });

      chip.append(label, removeBtn);
      fragment.appendChild(chip);
    }

    els.entryTagEditor.insertBefore(fragment, els.entryTagInput);
  }

  function updateEntryTagSuggestions() {
    const used = new Set(state.draftTags.map((tag) => tag.toLowerCase()));
    const allTags = new Set();
    const novel = state.entryDraft.novelId ? findNovel(state.entryDraft.novelId) : null;

    if (novel) {
      for (const key of SECTION_KEYS) {
        for (const entry of novel.entries[key]) {
          for (const tag of entry.tags) allTags.add(tag);
        }
      }
    }

    const fragment = document.createDocumentFragment();
    [...allTags]
      .filter((tag) => !used.has(tag.toLowerCase()))
      .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
      .forEach((tag) => {
        const option = document.createElement('option');
        option.value = tag;
        fragment.appendChild(option);
      });

    els.entryTagSuggestions.replaceChildren(fragment);
  }

  function addDraftTag(rawValue) {
    const tag = rawValue.trim().replace(/^#+/, '').replace(/\s+/g, ' ');

    if (!tag) return false;
    if (tag.length > MAX_TAG_LENGTH) {
      showToast(`标签最多 ${MAX_TAG_LENGTH} 个字`);
      return false;
    }
    if (state.draftTags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      els.entryTagInput.value = '';
      return false;
    }
    if (state.draftTags.length >= MAX_TAGS) {
      showToast(`最多添加 ${MAX_TAGS} 个标签`);
      return false;
    }

    state.draftTags.push(tag);
    markEntryDirty();
    renderEditorTags();
    updateEntryTagSuggestions();
    els.entryTagInput.value = '';
    return true;
  }

  function attemptCloseEntryEditor() {
    if (!state.entryDraft.dirty) {
      els.entryDialog.close();
      return;
    }

    openConfirm({
      title: '放弃这次修改？',
      message: '关闭后，尚未保存的内容会丢失。',
      okLabel: '放弃修改',
      onConfirm: () => {
        state.entryDraft.dirty = false;
        els.entryDialog.close();
      },
    });
  }

  function commitEntry({
    novelId,
    sectionKey,
    id,
    title,
    subtitle = '',
    summary = '',
    notes = '',
    tags = [],
    aliases,
    status,
    visibility = 'inherit',
  }) {
    const novel = findNovel(novelId);
    if (!novel) return { ok: false, reason: 'novel' };

    const now = new Date().toISOString();
    const isNew = !id;
    const savedId = id || makeId();
    const fields = {
      title: title.trim().slice(0, 60),
      subtitle: subtitle.trim().slice(0, 60),
      summary: summary.trim().slice(0, 160),
      notes: notes.trim(),
      tags: normalizeTags(tags),
      visibility: normalizeEntryVisibility(visibility),
    };
    // aliases / status 未传时保持原值（saveEntry 与大纲编辑器之外的调用方不受影响）
    if (aliases !== undefined) fields.aliases = normalizeAliases(aliases);
    if (status !== undefined) fields.status = normalizeEntryStatus(status);
    let nextEntries;

    if (isNew) {
      nextEntries = [
        {
          id: savedId,
          ...fields,
          pinned: false,
          createdAt: now,
          updatedAt: now,
        },
        ...novel.entries[sectionKey],
      ];
    } else {
      if (!novel.entries[sectionKey].some((entry) => entry.id === savedId)) {
        return { ok: false, reason: 'entry' };
      }
      nextEntries = novel.entries[sectionKey].map((entry) =>
        entry.id === savedId ? { ...entry, ...fields, updatedAt: now } : entry
      );
    }

    const previous = state.novels;
    state.novels = state.novels.map((item) =>
      item.id === novelId
        ? {
            ...item,
            updatedAt: now,
            entries: { ...item.entries, [sectionKey]: nextEntries },
          }
        : item
    );

    if (!persist()) {
      state.novels = previous;
      return { ok: false, reason: 'persist' };
    }

    return { ok: true, id: savedId, isNew };
  }

  function saveEntry() {
    const title = els.entryTitleInput.value.trim();
    if (!title) {
      showEntryTitleError();
      return;
    }

    const { novelId, sectionKey, id } = state.entryDraft;
    if (!findNovel(novelId)) {
      els.entryDialog.close();
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    if (els.entryTagInput.value.trim()) addDraftTag(els.entryTagInput.value);

    const result = commitEntry({
      novelId,
      sectionKey,
      id,
      title,
      subtitle: els.entrySubtitleInput.value,
      summary: els.entrySummaryInput.value,
      notes: els.entryNotesInput.value,
      tags: state.draftTags,
      aliases: parseAliasesInput(els.entryAliasesInput.value),
      visibility: getSelectedEntryVisibility(),
    });

    if (!result.ok) {
      if (result.reason === 'novel' || result.reason === 'entry') {
        els.entryDialog.close();
        showToast(
          result.reason === 'novel' ? '这本小说已经不在了' : '这个条目已经不在了',
          'error'
        );
        refreshCurrentView();
      }
      return;
    }

    state.entryDraft.dirty = false;
    els.entryDialog.close();

    const config = SECTIONS[sectionKey];
    const route = state.route;
    const wasOnTargetSection =
      route.view === 'section' &&
      route.novel.id === novelId &&
      route.sectionKey === sectionKey;

    if (result.isNew) {
      if (wasOnTargetSection) {
        refreshCurrentView();
        highlightEntryCard(result.id, { scroll: true });
      } else {
        state.pendingHighlight = {
          novelId,
          sectionKey,
          entryId: result.id,
        };
        window.location.hash = sectionHash(novelId, sectionKey);
      }
      showToast(`${config.singular}已收录`);
    } else {
      refreshCurrentView();
      if (wasOnTargetSection) highlightEntryCard(result.id, { scroll: true });
      showToast('修改已保存');
    }
  }

  /* ---------- Character relations ---------- */

  function openRelationEditor({
    novelId,
    relationId = null,
    fromId = null,
    toId = null,
    graphId = null,
  }) {
    const novel = findNovel(novelId);
    if (!novel) {
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const characters = [...novel.entries.characters].sort((a, b) =>
      a.title.localeCompare(b.title, 'zh-Hans-CN')
    );
    if (characters.length < 2) {
      showToast('至少需要两位角色才能添加关系', 'error');
      return;
    }

    const relations = Array.isArray(novel.relations) ? novel.relations : [];
    const relation = relationId
      ? relations.find((item) => item.id === relationId)
      : null;
    if (relationId && !relation) {
      showToast('这条关系已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const graphs = Array.isArray(novel.relationGraphs) ? novel.relationGraphs : [];
    let graph = relation
      ? graphs.find((item) => item.id === relation.graphId)
      : graphs.find((item) => item.id === graphId);
    if (!graph) graph = getActiveRelationGraph(novel);

    state.relationDraft = {
      novelId,
      id: relation ? relation.id : null,
      graphId: graph.id,
    };

    els.relationForm.reset();
    clearRelationErrors();

    const fragment = document.createDocumentFragment();
    for (const entry of characters) {
      const option = document.createElement('option');
      option.value = entry.id;
      const base = entry.subtitle ? `${entry.title} · ${entry.subtitle}` : entry.title;
      option.textContent = shortenGraphText(base, 32);
      fragment.appendChild(option);
    }
    els.relationFromSelect.replaceChildren(fragment.cloneNode(true));
    els.relationToSelect.replaceChildren(fragment);

    let source = relation ? relation.source : fromId;
    let target = relation ? relation.target : toId;
    if (!characters.some((entry) => entry.id === source)) {
      source = characters[0].id;
    }
    if (!characters.some((entry) => entry.id === target) || target === source) {
      target = characters.find((entry) => entry.id !== source).id;
    }

    els.relationFromSelect.value = source;
    els.relationToSelect.value = target;
    els.relationLabelInput.value = relation ? relation.label : '';

    const directed = relation ? relation.directed === true : false;
    els.relationDirectionBoth.checked = !directed;
    els.relationDirectionOneWay.checked = directed;
    syncRelationDirectionUI();

    els.relationDialogEyebrow.textContent = `${relation ? 'RELATIONS · EDIT' : 'RELATIONS · NEW'} · ${shortenGraphText(
      graph.title,
      14
    )}`;
    els.relationDialogTitle.textContent = relation ? '编辑人物关系' : '添加人物关系';
    els.relationSaveBtn.textContent = relation ? '保存修改' : '保存关系';
    els.relationDeleteBtn.hidden = !relation;

    els.relationDialog.showModal();
    requestAnimationFrame(() => {
      els.relationLabelInput.focus();
      els.relationLabelInput.select();
    });
  }

  function syncRelationDirectionUI() {
    const directed = els.relationDirectionOneWay.checked;
    els.relationRouteMark.textContent = directed ? '→' : '↔';
    els.relationFromLabelText.textContent = directed ? '起点角色' : '角色 A';
    els.relationToLabelText.textContent = directed ? '终点角色' : '角色 B';
    els.relationDirectionBothLabel.classList.toggle('is-active', !directed);
    els.relationDirectionOneWayLabel.classList.toggle('is-active', directed);

    const fromOption = els.relationFromSelect.selectedOptions[0];
    const toOption = els.relationToSelect.selectedOptions[0];
    const fromName = fromOption ? fromOption.textContent.split(' · ')[0] : '起点角色';
    const toName = toOption ? toOption.textContent.split(' · ')[0] : '终点角色';

    els.relationDirectionNote.textContent = directed
      ? `箭头从「${fromName}」指向「${toName}」；交换左右两侧可以改变方向。`
      : '双向关系：一条线同时连接两位角色。';
    els.relationFormHint.textContent = directed
      ? '单向关系会以箭头指向终点。删除角色时，关系线会暂时收起，恢复角色后会重新出现。'
      : '双向关系没有箭头。删除角色时，关系线会暂时收起，恢复角色后会重新出现。';
  }

  function saveRelation() {
    const { novelId, id, graphId } = state.relationDraft;
    const novel = findNovel(novelId);
    if (!novel) {
      els.relationDialog.close();
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const source = els.relationFromSelect.value;
    const target = els.relationToSelect.value;
    const label = els.relationLabelInput.value
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, GRAPH_MAX_LABEL_LENGTH);
    const directed = els.relationDirectionOneWay.checked;

    clearRelationErrors();

    if (!label) {
      els.relationLabelField.classList.add('has-error');
      els.relationLabelError.hidden = false;
      els.relationLabelInput.focus();
      return;
    }

    const characters = novel.entries.characters;
    if (
      !characters.some((entry) => entry.id === source) ||
      !characters.some((entry) => entry.id === target)
    ) {
      showRelationFormError('这条关系连接的角色已经不在了。');
      return;
    }
    if (source === target) {
      showRelationFormError('关系需要连接两位不同的角色。');
      return;
    }

    const graphs = Array.isArray(novel.relationGraphs) ? novel.relationGraphs : [];
    const graph =
      graphs.find((item) => item.id === graphId) || getActiveRelationGraph(novel);
    const relationGraphId = graph.id;

    const relations = Array.isArray(novel.relations) ? novel.relations : [];
    const pairKey = relationPairKey(source, target);
    const duplicate = relations.find(
      (relation) =>
        relation.id !== id &&
        relation.graphId === relationGraphId &&
        relationPairKey(relation.source, relation.target) === pairKey
    );
    if (duplicate) {
      showRelationFormError(
        `「${graph.title}」里这两位角色已经有一条关系了，点击那条线即可修改。`
      );
      return;
    }

    const now = new Date().toISOString();
    let nextRelations;
    if (id) {
      if (!relations.some((relation) => relation.id === id)) {
        els.relationDialog.close();
        showToast('这条关系已经不在了', 'error');
        refreshCurrentView();
        return;
      }
      nextRelations = relations.map((relation) =>
        relation.id === id
          ? {
              ...relation,
              source,
              target,
              label,
              directed,
              graphId: relationGraphId,
            }
          : relation
      );
    } else {
      if (relations.length >= GRAPH_MAX_RELATIONS) {
        showToast(`一部小说最多保留 ${GRAPH_MAX_RELATIONS} 条关系`, 'error');
        return;
      }
      nextRelations = [
        ...relations,
        {
          id: makeId(),
          source,
          target,
          label,
          directed,
          graphId: relationGraphId,
        },
      ];
    }

    const previous = state.novels;
    state.novels = state.novels.map((item) =>
      item.id === novelId
        ? { ...item, relations: nextRelations, updatedAt: now }
        : item
    );

    if (!persist()) {
      state.novels = previous;
      return;
    }

    els.relationDialog.close();
    refreshCurrentView();
    showToast(id ? '关系已更新' : '关系已连接');
  }

  function askDeleteRelation() {
    const { novelId, id } = state.relationDraft;
    const novel = findNovel(novelId);
    const relation = novel && Array.isArray(novel.relations)
      ? novel.relations.find((item) => item.id === id)
      : null;

    if (!novel || !relation) {
      els.relationDialog.close();
      showToast('这条关系已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const source = novel.entries.characters.find((entry) => entry.id === relation.source);
    const target = novel.entries.characters.find((entry) => entry.id === relation.target);
    const route = source && target
      ? `「${source.title}」与「${target.title}」之间的「${relation.label}」`
      : `「${relation.label}」`;

    openConfirm({
      title: '删除这条关系？',
      message: `${route}会从关系图中移除。`,
      okLabel: '删除关系',
      onConfirm: () => deleteRelation(novelId, relation.id),
    });
  }

  function deleteRelation(novelId, relationId) {
    const novel = findNovel(novelId);
    if (!novel || !Array.isArray(novel.relations)) {
      refreshCurrentView();
      return;
    }
    if (!novel.relations.some((relation) => relation.id === relationId)) {
      refreshCurrentView();
      return;
    }

    const previous = state.novels;
    const now = new Date().toISOString();
    state.novels = state.novels.map((item) =>
      item.id === novelId
        ? {
            ...item,
            relations: item.relations.filter((relation) => relation.id !== relationId),
            updatedAt: now,
          }
        : item
    );

    if (!persist()) {
      state.novels = previous;
      return;
    }

    els.relationDialog.close();
    refreshCurrentView();
    showToast('关系已删除');
  }

  function clearRelationErrors() {
    els.relationLabelField.classList.remove('has-error');
    els.relationLabelError.hidden = true;
    els.relationFormError.hidden = true;
    els.relationFormError.textContent = '';
  }

  function showRelationFormError(message) {
    els.relationFormError.textContent = message;
    els.relationFormError.hidden = false;
  }

  function switchRelationGraph(novelId, graphId) {
    const novel = findNovel(novelId);
    if (!novel || !Array.isArray(novel.relationGraphs)) return;
    if (!novel.relationGraphs.some((graph) => graph.id === graphId)) return;

    state.activeGraphByNovel[novelId] = graphId;
    if (
      state.route &&
      state.route.view === 'section' &&
      state.route.sectionKey === 'characters'
    ) {
      renderSection(novel, 'characters');
      const tab = [
        ...els.workspaceContent.querySelectorAll('[data-action="switch-graph"]'),
      ].find((button) => button.dataset.graphId === graphId);
      if (tab) tab.focus({ preventScroll: true });
    }
  }

  function openGraphEditor({ novelId, graphId = null }) {
    const novel = findNovel(novelId);
    if (!novel) {
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const graphs = Array.isArray(novel.relationGraphs) ? novel.relationGraphs : [];
    const graph = graphId ? graphs.find((item) => item.id === graphId) : null;
    if (graphId && !graph) {
      showToast('这个谱系已经不在了', 'error');
      refreshCurrentView();
      return;
    }
    if (!graph && graphs.length >= GRAPH_MAX_GRAPHS) {
      showToast(`一部小说最多保留 ${GRAPH_MAX_GRAPHS} 张谱系`, 'error');
      return;
    }

    state.graphDraft = {
      novelId,
      id: graph ? graph.id : null,
    };

    clearGraphError();
    els.graphForm.reset();
    els.graphTitleInput.value = graph ? graph.title : `谱系 ${graphs.length + 1}`;

    els.graphDialogEyebrow.textContent = graph ? 'LINEAGE · EDIT' : 'LINEAGE · NEW';
    els.graphDialogTitle.textContent = graph ? '编辑谱系' : '新建谱系';
    els.graphSaveBtn.textContent = graph ? '保存修改' : '创建谱系';
    els.graphDeleteBtn.hidden = !graph || graphs.length <= 1;

    els.graphDialog.showModal();
    requestAnimationFrame(() => {
      els.graphTitleInput.focus();
      els.graphTitleInput.select();
    });
  }

  function clearGraphError() {
    els.graphTitleField.classList.remove('has-error');
    els.graphTitleError.hidden = true;
  }

  function showGraphError(message) {
    els.graphTitleField.classList.add('has-error');
    els.graphTitleError.textContent = message;
    els.graphTitleError.hidden = false;
    els.graphTitleInput.focus();
  }

  function saveRelationGraph() {
    const { novelId, id } = state.graphDraft;
    const novel = findNovel(novelId);
    if (!novel) {
      els.graphDialog.close();
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const title = els.graphTitleInput.value
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, GRAPH_MAX_GRAPH_TITLE);
    clearGraphError();

    if (!title) {
      showGraphError('请写下一个谱系名称。');
      return;
    }

    const graphs = Array.isArray(novel.relationGraphs) ? novel.relationGraphs : [];
    const duplicate = graphs.find(
      (graph) => graph.id !== id && graph.title.toLowerCase() === title.toLowerCase()
    );
    if (duplicate) {
      showGraphError('已经有同名谱系了，换一个名字吧。');
      return;
    }

    const now = new Date().toISOString();
    let nextGraphs;
    let createdId = null;
    if (id) {
      if (!graphs.some((graph) => graph.id === id)) {
        els.graphDialog.close();
        showToast('这个谱系已经不在了', 'error');
        refreshCurrentView();
        return;
      }
      nextGraphs = graphs.map((graph) =>
        graph.id === id ? { ...graph, title } : graph
      );
    } else {
      if (graphs.length >= GRAPH_MAX_GRAPHS) {
        showToast(`一部小说最多保留 ${GRAPH_MAX_GRAPHS} 张谱系`, 'error');
        return;
      }
      createdId = makeId();
      nextGraphs = [...graphs, { id: createdId, title, createdAt: now }];
    }

    const previous = state.novels;
    state.novels = state.novels.map((item) =>
      item.id === novelId
        ? { ...item, relationGraphs: nextGraphs, updatedAt: now }
        : item
    );

    if (!persist()) {
      state.novels = previous;
      return;
    }

    if (createdId) state.activeGraphByNovel[novelId] = createdId;
    els.graphDialog.close();
    refreshCurrentView();
    showToast(id ? '谱系已更新' : '谱系已创建');
  }

  function askDeleteRelationGraph() {
    const { novelId, id } = state.graphDraft;
    const novel = findNovel(novelId);
    const graph =
      novel && Array.isArray(novel.relationGraphs)
        ? novel.relationGraphs.find((item) => item.id === id)
        : null;

    if (!novel || !graph) {
      els.graphDialog.close();
      showToast('这个谱系已经不在了', 'error');
      refreshCurrentView();
      return;
    }
    if (novel.relationGraphs.length <= 1) {
      showToast('至少需要保留一个谱系', 'error');
      return;
    }

    const relations = Array.isArray(novel.relations) ? novel.relations : [];
    const count = relations.filter((relation) => relation.graphId === graph.id).length;
    const title = graph.title;
    els.graphDialog.close();

    openConfirm({
      title: '删除这个谱系？',
      message:
        count > 0
          ? `「${title}」中的 ${count} 条关系也会一并删除，此操作无法撤销。`
          : `「${title}」里还没有关系，删除后无法恢复。`,
      okLabel: '删除谱系',
      onConfirm: () => deleteRelationGraph(novelId, graph.id),
    });
  }

  function deleteRelationGraph(novelId, graphId) {
    const novel = findNovel(novelId);
    if (
      !novel ||
      !Array.isArray(novel.relationGraphs) ||
      novel.relationGraphs.length <= 1
    ) {
      refreshCurrentView();
      return;
    }
    const graph = novel.relationGraphs.find((item) => item.id === graphId);
    if (!graph) {
      refreshCurrentView();
      return;
    }

    const previous = state.novels;
    const now = new Date().toISOString();
    const nextGraphs = novel.relationGraphs.filter((item) => item.id !== graphId);
    const nextRelations = (Array.isArray(novel.relations) ? novel.relations : []).filter(
      (relation) => relation.graphId !== graphId
    );

    state.novels = state.novels.map((item) =>
      item.id === novelId
        ? {
            ...item,
            relationGraphs: nextGraphs,
            relations: nextRelations,
            updatedAt: now,
          }
        : item
    );

    if (!persist()) {
      state.novels = previous;
      return;
    }

    if (state.activeGraphByNovel[novelId] === graphId) {
      state.activeGraphByNovel[novelId] = nextGraphs[0].id;
    }
    delete state.graphViews[`${novelId}:${graphId}`];

    refreshCurrentView();
    showToast('谱系已删除');
  }

  function setCharactersView(view) {
    state.charactersView = view === 'list' ? 'list' : 'graph';
    if (
      state.route &&
      state.route.view === 'section' &&
      state.route.sectionKey === 'characters'
    ) {
      renderSection(state.route.novel, 'characters');
      const button = els.workspaceContent.querySelector(
        `[data-action="characters-view"][data-view="${state.charactersView}"]`
      );
      if (button) button.focus({ preventScroll: true });
    }
  }

  /* ---------- Outline page editor ---------- */

  function renderOutlineEditor(novel, entry) {
    const config = SECTIONS.outline;
    const node = els.outlineEditorTemplate.content.firstElementChild.cloneNode(true);
    const find = (selector) => $(selector, node);
    const isNew = !entry;

    state.outlineDraft = {
      novelId: novel.id,
      id: entry ? entry.id : null,
      dirty: false,
      tags: entry ? normalizeTags(entry.tags) : [],
      status: entry ? normalizeEntryStatus(entry.status) : '',
      hash: window.location.hash,
    };

    const backLink = find('[data-outline-back]');
    backLink.href = sectionHash(novel.id, 'outline');
    find('[data-outline-back-label]').textContent = config.backLabel;

    find('[data-outline-eyebrow]').textContent = isNew
      ? 'OUTLINE · NEW'
      : 'OUTLINE · EDIT';
    find('[data-outline-heading]').textContent = isNew
      ? `新增${config.singular}`
      : `编辑${config.singular}`;
    find('[data-outline-desc]').textContent = isNew
      ? '整页书写，分卷、章节与分场都可以一次铺开。保存后会回到大纲列表。'
      : `正在编辑「${entry.title}」，保存后会回到这条大纲。`;

    const form = find('#outlineEditorForm');
    const titleField = find('#outlineEditorTitleField');
    const titleInput = find('#outlineEditorTitleInput');
    const titleError = find('#outlineEditorTitleError');
    const scopeInput = find('#outlineEditorScopeInput');
    const summaryInput = find('#outlineEditorSummaryInput');
    const notesInput = find('#outlineEditorNotesInput');
    const notesCount = find('#outlineEditorNotesCount');
    const tagEditor = find('#outlineEditorTagEditor');
    const tagInput = find('#outlineEditorTagInput');
    const tagSuggestions = find('#outlineEditorTagSuggestions');
    const stateLabel = find('[data-outline-state]');
    const visibilityPicker = find('[data-outline-visibility]');
    const visibilityHint = find('[data-outline-visibility-hint]');
    const saveLabels = node.querySelectorAll('[data-outline-save-label]');

    titleInput.placeholder = config.titlePlaceholder;
    titleInput.value = entry ? entry.title : '';
    scopeInput.placeholder = config.subtitlePlaceholder;
    scopeInput.value = entry ? entry.subtitle : '';
    summaryInput.placeholder = config.summaryPlaceholder;
    summaryInput.value = entry ? entry.summary : '';
    notesInput.placeholder = config.notesPlaceholder;
    notesInput.value = entry ? entry.notes : '';
    titleError.textContent = config.emptyError;
    notesCount.textContent = `${notesInput.value.length} 字`;

    function setVisibility(value) {
      const input = visibilityPicker.querySelector(
        `input[name="outlineVisibility"][value="${value}"]`
      );
      if (input) input.checked = true;
      syncVisibilityHint();
    }

    function getVisibility() {
      const input = visibilityPicker.querySelector(
        'input[name="outlineVisibility"]:checked'
      );
      return normalizeEntryVisibility(input ? input.value : 'inherit');
    }

    function syncVisibilityHint() {
      const value = getVisibility();
      const novelPublic = isNovelPublic(novel);
      if (value === 'private') {
        visibilityHint.textContent = '私密：这条大纲不会进入公开快照。';
      } else if (value === 'public') {
        visibilityHint.textContent = novelPublic
          ? '公开：这条大纲会进入公开快照。'
          : '已标记公开，但这本小说尚未解锁，暂时只在本机可见。';
      } else {
        visibilityHint.textContent = novelPublic
          ? '跟随小说：这本小说已解锁，这条大纲会一起公开。'
          : '跟随小说：这本小说尚未解锁，这条大纲只在本机可见。';
      }
    }

    setVisibility(entry ? entry.visibility : 'inherit');

    const statusSwitch = find('[data-outline-status]');
    function setStatus(value) {
      state.outlineDraft.status = normalizeEntryStatus(value);
      statusSwitch.querySelectorAll('button[data-status-value]').forEach((btn) => {
        const active = btn.dataset.statusValue === state.outlineDraft.status;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }
    statusSwitch.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-status-value]');
      if (!btn) return;
      event.preventDefault();
      setStatus(btn.dataset.statusValue);
      markDirty();
    });
    setStatus(entry ? entry.status : '');

    saveLabels.forEach((label) => {
      label.textContent = isNew ? '保存大纲' : '保存修改';
    });
    stateLabel.textContent = isNew ? '尚未保存' : '已是最新';

    let composing = false;

    function markDirty() {
      if (state.outlineDraft.dirty) return;
      state.outlineDraft.dirty = true;
      stateLabel.textContent = '有未保存修改';
      stateLabel.classList.add('is-dirty');
    }

    function clearTitleError() {
      titleField.classList.remove('has-error');
      titleError.hidden = true;
    }

    function showTitleError() {
      titleField.classList.add('has-error');
      titleError.hidden = false;
      titleInput.focus();
    }

    function renderTags() {
      tagEditor.querySelectorAll('.editor-tag').forEach((chip) => chip.remove());

      const fragment = document.createDocumentFragment();
      for (const tag of state.outlineDraft.tags) {
        const chip = el('span', 'editor-tag');
        const removeBtn = el('button', '', '×');
        removeBtn.type = 'button';
        removeBtn.setAttribute('aria-label', `移除标签 ${tag}`);
        removeBtn.addEventListener('click', () => {
          state.outlineDraft.tags = state.outlineDraft.tags.filter(
            (item) => item !== tag
          );
          markDirty();
          renderTags();
          updateTagSuggestions();
          tagInput.focus();
        });
        chip.append(el('span', '', tag), removeBtn);
        fragment.appendChild(chip);
      }

      tagEditor.insertBefore(fragment, tagInput);
    }

    function updateTagSuggestions() {
      const used = new Set(
        state.outlineDraft.tags.map((tag) => tag.toLowerCase())
      );
      const allTags = new Set();

      for (const key of SECTION_KEYS) {
        for (const item of novel.entries[key]) {
          for (const tag of item.tags) allTags.add(tag);
        }
      }

      const fragment = document.createDocumentFragment();
      [...allTags]
        .filter((tag) => !used.has(tag.toLowerCase()))
        .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
        .forEach((tag) => {
          const option = document.createElement('option');
          option.value = tag;
          fragment.appendChild(option);
        });

      tagSuggestions.replaceChildren(fragment);
    }

    function addTag(rawValue) {
      const tag = rawValue.trim().replace(/^#+/, '').replace(/\s+/g, ' ');

      if (!tag) return false;
      if (tag.length > MAX_TAG_LENGTH) {
        showToast(`标签最多 ${MAX_TAG_LENGTH} 个字`);
        return false;
      }
      if (
        state.outlineDraft.tags.some(
          (item) => item.toLowerCase() === tag.toLowerCase()
        )
      ) {
        tagInput.value = '';
        return false;
      }
      if (state.outlineDraft.tags.length >= MAX_TAGS) {
        showToast(`最多添加 ${MAX_TAGS} 个标签`);
        return false;
      }

      state.outlineDraft.tags.push(tag);
      markDirty();
      renderTags();
      updateTagSuggestions();
      tagInput.value = '';
      return true;
    }

    function leaveEditor() {
      state.outlineDraft.dirty = false;
      window.location.hash = entry
        ? entryHash(novel.id, 'outline', entry.id)
        : sectionHash(novel.id, 'outline');
    }

    function cancel() {
      if (!state.outlineDraft.dirty) {
        leaveEditor();
        return;
      }

      openConfirm({
        title: '放弃这次修改？',
        message: '离开编辑页后，尚未保存的大纲内容会丢失。',
        okLabel: '放弃修改',
        onConfirm: leaveEditor,
      });
    }

    function save() {
      const title = titleInput.value.trim();
      if (!title) {
        showTitleError();
        return;
      }

      if (tagInput.value.trim()) addTag(tagInput.value);

      const result = commitEntry({
        novelId: novel.id,
        sectionKey: 'outline',
        id: state.outlineDraft.id,
        title,
        subtitle: scopeInput.value,
        summary: summaryInput.value,
        notes: notesInput.value,
        tags: state.outlineDraft.tags,
        status: state.outlineDraft.status,
        visibility: getVisibility(),
      });

      if (!result.ok) {
        if (result.reason === 'novel' || result.reason === 'entry') {
          showToast('这条大纲已经不在了', 'error');
          state.outlineDraft.dirty = false;
          window.location.hash = sectionHash(novel.id, 'outline');
        }
        return;
      }

      state.outlineDraft.dirty = false;
      state.outlineDraft.id = result.id;
      window.location.hash = entryHash(novel.id, 'outline', result.id);
      showToast(result.isNew ? `${config.singular}已收录` : '修改已保存');
    }

    form.addEventListener('input', markDirty);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      save();
    });
    form.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        save();
      }
    });

    titleInput.addEventListener('input', clearTitleError);
    notesInput.addEventListener('input', () => {
      notesCount.textContent = `${notesInput.value.length} 字`;
    });
    visibilityPicker.addEventListener('change', syncVisibilityHint);

    node.querySelectorAll('[data-outline-cancel]').forEach((button) => {
      button.addEventListener('click', cancel);
    });

    tagEditor.addEventListener('click', (event) => {
      if (event.target === tagEditor) tagInput.focus();
    });

    tagInput.addEventListener('compositionstart', () => {
      composing = true;
    });

    tagInput.addEventListener('compositionend', () => {
      composing = false;
    });

    tagInput.addEventListener('input', () => {
      if (composing) return;
      const value = tagInput.value;
      if (!/[,，]/.test(value)) return;

      const parts = value.split(/[,，]/);
      const rest = parts.pop() ?? '';
      for (const part of parts) {
        if (part.trim()) addTag(part);
      }
      tagInput.value = rest;
    });

    tagInput.addEventListener('keydown', (event) => {
      if (event.isComposing || composing) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (tagInput.value.trim()) addTag(tagInput.value);
        return;
      }

      if (
        event.key === 'Backspace' &&
        !tagInput.value &&
        state.outlineDraft.tags.length > 0
      ) {
        state.outlineDraft.tags.pop();
        markDirty();
        renderTags();
        updateTagSuggestions();
      }
    });

    renderTags();
    updateTagSuggestions();
    els.workspaceContent.replaceChildren(node);

    requestAnimationFrame(() => {
      titleInput.focus({ preventScroll: true });
      if (!isNew) {
        titleInput.setSelectionRange(
          titleInput.value.length,
          titleInput.value.length
        );
      }
    });
  }

  /* ---------- Map workshop ---------- */

  function defaultMap() {
    return {
      cols: MAP_DEFAULT_COLS,
      rows: MAP_DEFAULT_ROWS,
      tiles: {},
      features: {},
      cities: [],
      paths: [],
    };
  }

  function mapHasContent(map) {
    return Boolean(
      map &&
        (map.cities.length > 0 ||
          Object.keys(map.tiles).length > 0 ||
          Object.keys(map.features || {}).length > 0 ||
          (map.paths && map.paths.length > 0))
    );
  }

  function createMapPanel(novel, sectionKey, entry) {
    const block = el('section', 'entry-detail-block entry-map-block');
    block.dataset.commentAnchor = 'block:map';
    const head = el('div', 'entry-map-head');
    const headText = el('div');
    headText.appendChild(el('h3', 'entry-block-title', '地图工坊'));

    if (entry.map) {
      const cityCount = entry.map.cities.length;
      const terrainCount = Object.keys(entry.map.tiles).length;
      headText.appendChild(
        el(
          'p',
          'entry-map-caption',
          `${cityCount} 座城市 · ${terrainCount} 处地貌 · 点击地图继续绘制`
        )
      );
    } else {
      headText.appendChild(
        el('p', 'entry-map-caption', '用六边形格子铺出地形，再放下城市与它们的势力范围。')
      );
    }
    head.appendChild(headText);
    block.appendChild(head);

    const data = {
      action: 'edit-map',
      novelId: novel.id,
      sectionKey,
      entryId: entry.id,
    };

    if (entry.map) {
      const previewBtn = el('button', 'map-preview-btn');
      previewBtn.type = 'button';
      Object.assign(previewBtn.dataset, data);
      previewBtn.setAttribute('aria-label', `打开「${entry.title}」的地图工坊`);
      previewBtn.appendChild(buildMapPreview(entry.map));
      previewBtn.appendChild(el('span', 'map-preview-hint', '打开地图工坊'));
      block.appendChild(previewBtn);
    } else {
      const empty = el('div', 'map-preview-empty');
      empty.appendChild(icon('i-map'));
      empty.appendChild(el('h4', '', '这张地点还没有地图'));
      empty.appendChild(
        el('p', '', '先画出海岸与山脉，再把城市放到它们该在的位置。')
      );
      const startBtn = el('button', 'btn primary');
      startBtn.type = 'button';
      Object.assign(startBtn.dataset, data);
      startBtn.append(icon('i-plus'), document.createTextNode('开始绘制地图'));
      empty.appendChild(startBtn);
      block.appendChild(empty);
    }

    return block;
  }

  function buildMapPreview(map, { thumb = false } = {}) {
    const padding = thumb ? 10 : 22;
    const bounds = getMapWorldBounds(map);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', getMapViewBox(map, padding));
    svg.setAttribute('class', thumb ? 'map-canvas map-thumb' : 'map-canvas map-preview');
    svg.setAttribute('preserveAspectRatio', thumb ? 'xMidYMid slice' : 'xMidYMid meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.aspectRatio = `${bounds.width + padding * 2} / ${bounds.height + padding * 2}`;
    svg.innerHTML = buildMapMarkup(map);
    return svg;
  }

  function getMapWorldBounds(map) {
    return {
      minX: -(MAP_WORLD_SQRT3 / 2) * MAP_HEX_SIZE,
      minY: -MAP_HEX_SIZE,
      width: MAP_WORLD_SQRT3 * MAP_HEX_SIZE * (map.cols + 0.5),
      height: MAP_HEX_SIZE * (1.5 * (map.rows - 1) + 2),
    };
  }

  function getMapViewBox(map, padding = 0) {
    const bounds = getMapWorldBounds(map);
    return `${roundMapCoordinate(bounds.minX - padding)} ${roundMapCoordinate(
      bounds.minY - padding
    )} ${roundMapCoordinate(bounds.width + padding * 2)} ${roundMapCoordinate(
      bounds.height + padding * 2
    )}`;
  }

  function hexCenter(col, row) {
    return {
      x: MAP_WORLD_SQRT3 * MAP_HEX_SIZE * (col + 0.5 * (row & 1)),
      y: MAP_HEX_SIZE * 1.5 * row,
    };
  }

  function hexCornersAt(cx, cy) {
    const halfWidth = (MAP_WORLD_SQRT3 / 2) * MAP_HEX_SIZE;
    const quarterHeight = MAP_HEX_SIZE / 2;
    return [
      { x: cx, y: cy - MAP_HEX_SIZE },
      { x: cx + halfWidth, y: cy - quarterHeight },
      { x: cx + halfWidth, y: cy + quarterHeight },
      { x: cx, y: cy + MAP_HEX_SIZE },
      { x: cx - halfWidth, y: cy + quarterHeight },
      { x: cx - halfWidth, y: cy - quarterHeight },
    ];
  }

  function hexPathAt(cx, cy) {
    const corners = hexCornersAt(cx, cy);
    return (
      corners
        .map(
          (point, index) =>
            `${index === 0 ? 'M' : 'L'}${roundMapCoordinate(point.x)} ${roundMapCoordinate(point.y)}`
        )
        .join('') + 'Z'
    );
  }

  function roundMapCoordinate(value) {
    return Math.round(value * 10) / 10;
  }

  function mapHexDistance(colA, rowA, colB, rowB) {
    const qA = colA - (rowA - (rowA & 1)) / 2;
    const qB = colB - (rowB - (rowB & 1)) / 2;
    const dq = qA - qB;
    const dr = rowA - rowB;
    return (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;
  }

  function mapNeighborCell(col, row, direction) {
    const odd = row & 1;
    switch (direction) {
      case 'E':
        return [col + 1, row];
      case 'W':
        return [col - 1, row];
      case 'NE':
        return [col + odd, row - 1];
      case 'NW':
        return [col - 1 + odd, row - 1];
      case 'SE':
        return [col + odd, row + 1];
      case 'SW':
        return [col - 1 + odd, row + 1];
      default:
        return [col, row];
    }
  }

  function computeMapOwnership(map) {
    const ownership = new Map();

    for (const city of map.cities) {
      if (city.customArea && Array.isArray(city.cells) && city.cells.length > 0) {
        for (const key of city.cells) {
          const [col, row] = key.split(',').map(Number);
          if (!Number.isFinite(col) || !Number.isFinite(row)) continue;
          if (col < 0 || row < 0 || col >= map.cols || row >= map.rows) continue;
          const current = ownership.get(key);
          if (!current || current.distance > 0) {
            ownership.set(key, { city, distance: 0 });
          }
        }
        continue;
      }

      for (let row = 0; row < map.rows; row += 1) {
        for (let col = 0; col < map.cols; col += 1) {
          const distance = mapHexDistance(col, row, city.col, city.row);
          if (distance > city.radius) continue;
          const key = `${col},${row}`;
          const current = ownership.get(key);
          if (!current || distance < current.distance) {
            ownership.set(key, { city, distance });
          }
        }
      }
    }

    return ownership;
  }

  function buildMapMarkup(map, { selectedCityId = null, selectedPathId = null, pendingPath = null } = {}) {
    const terrainParts = [];
    const coastParts = [];
    const pathParts = [];
    const featureParts = [];
    const territoryParts = [];
    const borderParts = [];
    const cityParts = [];

    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        terrainParts.push(buildMapHex(col, row, map.tiles[`${col},${row}`] || 'grass'));
      }
    }

    coastParts.push(buildMapCoastline(map));
    pathParts.push(buildMapPathsMarkup(map, { selectedPathId, pendingPath }));

    for (const [key, featureKey] of Object.entries(map.features || {})) {
      const [col, row] = key.split(',').map(Number);
      if (col >= map.cols || row >= map.rows) continue;
      const center = hexCenter(col, row);
      featureParts.push(
        `<g class="map-feature" data-col="${col}" data-row="${row}" data-feature="${featureKey}" transform="translate(${roundMapCoordinate(
          center.x
        )} ${roundMapCoordinate(center.y)})">${buildMapFeatureDecor(featureKey)}</g>`
      );
    }

    const ownership = computeMapOwnership(map);
    const ownedByCity = new Map();

    for (const [key, owner] of ownership) {
      const [col, row] = key.split(',').map(Number);
      const center = hexCenter(col, row);
      const isCenter = owner.city.col === col && owner.city.row === row;
      territoryParts.push(
        `<path class="map-territory-tile" d="${hexPathAt(center.x, center.y)}" fill="${
          owner.city.color
        }" opacity="${isCenter ? 0.2 : 0.09}"/>`
      );
      if (!ownedByCity.has(owner.city.id)) ownedByCity.set(owner.city.id, new Set());
      ownedByCity.get(owner.city.id).add(key);
    }

    for (const city of map.cities) {
      const owned = ownedByCity.get(city.id);
      if (!owned || owned.size === 0) continue;

      const segments = [];
      for (const key of owned) {
        const [col, row] = key.split(',').map(Number);
        const center = hexCenter(col, row);
        const corners = hexCornersAt(center.x, center.y);

        for (const direction of MAP_DIRECTIONS) {
          const [nextCol, nextRow] = mapNeighborCell(col, row, direction);
          if (owned.has(`${nextCol},${nextRow}`)) continue;
          const [start, end] = MAP_EDGE_CORNERS[direction];
          segments.push(
            `M${roundMapCoordinate(corners[start].x)} ${roundMapCoordinate(
              corners[start].y
            )}L${roundMapCoordinate(corners[end].x)} ${roundMapCoordinate(corners[end].y)}`
          );
        }
      }

      borderParts.push(
        `<path class="map-territory-border" d="${segments.join(
          ''
        )}" fill="none" stroke="${city.color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`
      );
    }

    for (const city of map.cities) {
      cityParts.push(buildMapCityMarker(city, city.id === selectedCityId));
    }

    return [
      `<defs>
        <filter id="mapCityShadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.6" flood-color="rgba(20,28,52,.42)"/></filter>
        <linearGradient id="mapShade" x1="0" y1="0" x2="0.55" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".45"/>
          <stop offset=".4" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="1" stop-color="#1c2440" stop-opacity=".32"/>
        </linearGradient>
        <linearGradient id="mapShadeSoft" x1="0" y1="0" x2="0.55" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".2"/>
          <stop offset=".45" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="1" stop-color="#1c2440" stop-opacity=".14"/>
        </linearGradient>
        <linearGradient id="mapWaterGrad" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stop-color="#a9cde6"/>
          <stop offset="1" stop-color="#79a6c9"/>
        </linearGradient>
      </defs>`,
      `<g class="map-layer map-terrain-layer">${terrainParts.join('')}</g>`,
      `<g class="map-layer map-coast-layer" aria-hidden="true">${coastParts.join('')}</g>`,
      `<g class="map-layer map-path-layer">${pathParts.join('')}</g>`,
      `<g class="map-layer map-territory-layer" aria-hidden="true">${territoryParts.join(
        ''
      )}${borderParts.join('')}</g>`,
      `<g class="map-layer map-feature-layer">${featureParts.join('')}</g>`,
      `<g class="map-layer map-city-layer">${cityParts.join('')}</g>`,
    ].join('');
  }

  function buildMapCoastline(map) {
    const segments = [];

    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        if ((map.tiles[`${col},${row}`] || 'grass') !== 'water') continue;
        const center = hexCenter(col, row);
        const corners = hexCornersAt(center.x, center.y);

        for (const direction of MAP_DIRECTIONS) {
          const [nextCol, nextRow] = mapNeighborCell(col, row, direction);
          const neighbor =
            nextCol < 0 || nextRow < 0 || nextCol >= map.cols || nextRow >= map.rows
              ? 'water'
              : map.tiles[`${nextCol},${nextRow}`] || 'grass';
          if (neighbor === 'water') continue;
          const [start, end] = MAP_EDGE_CORNERS[direction];
          segments.push(
            `M${roundMapCoordinate(corners[start].x)} ${roundMapCoordinate(
              corners[start].y
            )}L${roundMapCoordinate(corners[end].x)} ${roundMapCoordinate(corners[end].y)}`
          );
        }
      }
    }

    if (segments.length === 0) return '';
    const d = segments.join('');
    return `<path class="map-coastline" d="${d}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="5" stroke-linecap="round"/>` +
      `<path class="map-coastline" d="${d}" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linecap="round"/>`;
  }

  function catmullRomToBezierPath(points) {
    if (points.length < 2) return '';

    const nodes = points.map((point) => hexCenter(point.col, point.row));
    if (nodes.length === 2) {
      return `M${roundMapCoordinate(nodes[0].x)} ${roundMapCoordinate(
        nodes[0].y
      )}L${roundMapCoordinate(nodes[1].x)} ${roundMapCoordinate(nodes[1].y)}`;
    }

    let path = `M${roundMapCoordinate(nodes[0].x)} ${roundMapCoordinate(nodes[0].y)}`;
    for (let i = 0; i < nodes.length - 1; i += 1) {
      const p0 = nodes[Math.max(0, i - 1)];
      const p1 = nodes[i];
      const p2 = nodes[i + 1];
      const p3 = nodes[Math.min(nodes.length - 1, i + 2)];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      path += `C${roundMapCoordinate(c1x)} ${roundMapCoordinate(c1y)} ${roundMapCoordinate(
        c2x
      )} ${roundMapCoordinate(c2y)} ${roundMapCoordinate(p2.x)} ${roundMapCoordinate(p2.y)}`;
    }
    return path;
  }

  function buildMapPathMarkup(path, selected) {
    const config = MAP_PATH_KINDS[path.kind] || MAP_PATH_KINDS.river;
    const data = selected ? ' is-selected' : '';
    const dash = config.dash ? ` stroke-dasharray="${config.dash}"` : '';
    const d = catmullRomToBezierPath(path.points);
    const bank =
      path.kind === 'river'
        ? `<path class="map-path-bank" d="${d}" fill="none" stroke="${config.color}" stroke-width="${config.width + 3}" stroke-linecap="round" stroke-linejoin="round" opacity=".22"/>`
        : '';
    return `<g class="map-path-item${data}" data-path-id="${escapeXml(path.id)}">
      <path class="map-path-hit" d="${d}" fill="none" stroke="rgba(0,0,0,0)" stroke-width="14"/>
      ${bank}
      <path class="map-path-line" d="${d}" fill="none" stroke="${config.color}" stroke-width="${config.width}"${dash} stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>
      ${
        path.kind === 'river'
          ? `<path class="map-path-glow" d="${d}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2" stroke-linecap="round" transform="translate(0 -1.4)"/>`
          : ''
      }
      <title>${config.label}</title>
    </g>`;
  }

  function buildMapPathsMarkup(map, { selectedPathId = null, pendingPath = null } = {}) {
    const parts = [];
    for (const path of map.paths || []) {
      parts.push(buildMapPathMarkup(path, path.id === selectedPathId));
    }
    if (pendingPath && pendingPath.points.length >= 1) {
      const config = MAP_PATH_KINDS[pendingPath.kind] || MAP_PATH_KINDS.river;
      const points = pendingPath.points;
      const preview =
        points.length >= 2
          ? `<path d="${catmullRomToBezierPath(points)}" fill="none" stroke="${config.color}" stroke-width="${config.width}" stroke-linecap="round" opacity=".55"/>`
          : '';
      const dots = points
        .map(
          (point) =>
            `<circle cx="${roundMapCoordinate(hexCenter(point.col, point.row).x)}" cy="${roundMapCoordinate(
              hexCenter(point.col, point.row).y
            )}" r="3" fill="${config.color}" opacity=".7"/>`
        )
        .join('');
      parts.push(`<g class="map-path-pending">${preview}${dots}</g>`);
    }
    return parts.join('');
  }

  function buildMapHex(col, row, terrainKey) {
    return `<g class="map-hex" data-col="${col}" data-row="${row}" data-terrain="${terrainKey}">${buildMapHexInner(
      col,
      row,
      terrainKey
    )}</g>`;
  }

  function buildMapHexInner(col, row, terrainKey) {
    const center = hexCenter(col, row);
    const terrain = MAP_TERRAINS[terrainKey] || MAP_TERRAINS.grass;
    const fill =
      terrainKey === 'water' ? 'url(#mapWaterGrad)' : pickMapTerrainFill(terrainKey, col, row);
    const strongShade = ['hills', 'mountain', 'volcano', 'forest', 'swamp'].includes(terrainKey);
    const softShade = ['grass', 'plains', 'desert'].includes(terrainKey);
    const shadeLayer = strongShade
      ? `<path d="${hexPathAt(center.x, center.y)}" fill="url(#mapShade)"/>`
      : softShade
        ? `<path d="${hexPathAt(center.x, center.y)}" fill="url(#mapShadeSoft)"/>`
        : '';
    return `<path class="map-hex-shape" d="${hexPathAt(center.x, center.y)}" fill="${fill}" stroke="${
      terrain.stroke
    }" stroke-opacity=".5" stroke-width=".7"/>${shadeLayer}${buildMapDecor(
      terrainKey,
      center.x,
      center.y,
      col,
      row
    )}`;
  }

  function buildMapDecor(terrainKey, x, y, col, row) {
    const open = `<g class="map-decor" transform="translate(${roundMapCoordinate(
      x
    )} ${roundMapCoordinate(y)})" aria-hidden="true">`;
    const close = '</g>';
    const hash = Math.abs((col * 7 + row * 13) % 97);

    if (terrainKey === 'grass') {
      if (hash % 3 === 2) {
        return `${open}<circle cx="${hash % 2 ? 10 : -11}" cy="${
          (hash % 3) - 3
        }" r="1.6" fill="rgba(255,252,220,.85)"/><circle cx="${
          (hash % 2 ? 13 : -8)
        }" cy="${(hash % 2) + 5}" r="1.2" fill="rgba(255,244,200,.7)"/>${close}`;
      }
      return `${open}<path d="M-12 7c1-4.4 2.8-4.4 3.7 0M-4 10c1-5 2.7-5 3.6 0M5 5c1-4 2.5-4 3.4 0M-8 -3c1-3.6 2.4-3.6 3.2 0" fill="none" stroke="rgba(52,82,44,.4)" stroke-width="1.7" stroke-linecap="round"/>${close}`;
    }

    if (terrainKey === 'plains') {
      return `${open}<path d="M-13 0h7M-2 4h9M-8 9h6" fill="none" stroke="rgba(112,94,43,.42)" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="-4" r="1.3" fill="rgba(112,94,43,.32)"/>${
        hash % 4 === 0
          ? '<path d="M-4 -8c.8-3.4 2.2-3.4 3 0" fill="none" stroke="rgba(112,94,43,.34)" stroke-width="1.4" stroke-linecap="round"/>'
          : ''
      }${close}`;
    }

    if (terrainKey === 'forest') {
      const tree = (tx, ty, s, dark) =>
        `<g transform="translate(${tx} ${ty}) scale(${s})"><ellipse cx="0" cy="11" rx="7" ry="2.4" fill="rgba(28,44,30,.22)"/><path d="M0 -11 L-5 2 H5 Z" fill="${dark ? '#4c7450' : '#527c56'}"/><path d="M0 -4 L-7 10 H7 Z" fill="${dark ? '#587f5c' : '#618f65'}"/><path d="M-1 10h2v4h-2z" fill="#6d5743"/></g>`;
      return `${open}${tree(-7, 3, 0.9, hash % 2 === 0)}${tree(7, -4, 0.68, hash % 3 !== 0)}${tree(
        3,
        8,
        0.52,
        true
      )}${hash % 3 === 0 ? tree(-11, -7, 0.45, false) : ''}${close}`;
    }

    if (terrainKey === 'hills') {
      return `${open}<path d="M-15 8c4-13 12-13 16 0M-1 8c4-11 11-11 15 0" fill="none" stroke="rgba(101,78,41,.44)" stroke-width="2.4" stroke-linecap="round"/><path d="M-11 1c2.6-5 7.4-5.6 10-.6" fill="none" stroke="rgba(255,248,214,.5)" stroke-width="1.6" stroke-linecap="round"/><path d="M-8 12h6M2 13h7" fill="none" stroke="rgba(101,78,41,.3)" stroke-width="1.6" stroke-linecap="round"/>${close}`;
    }

    if (terrainKey === 'mountain') {
      return `${open}<ellipse cx="1" cy="13" rx="17" ry="2.6" fill="rgba(28,38,58,.18)"/><path d="M-17 12 L-3 -13 L11 12 Z" fill="#7b8293"/><path d="M-17 12 L-3 -13 L11 12 Z" fill="url(#mapShade)" opacity=".55"/><path d="M-3 -13 L0.5 -5.5 L-7.5 -5.5 Z" fill="#f2f6fb"/><path d="M2 12 L11 -2 L20 12 Z" fill="#959baa" opacity=".92"/><path d="M11 -2 L13 2 L9 2 Z" fill="#eef2f8" opacity=".9"/>${close}`;
    }

    if (terrainKey === 'water') {
      const wave = (wy, op) =>
        `<path d="M-15 ${wy}c3.5-4 7-4 10.5 0s7 4 10.5 0" fill="none" stroke="rgba(255,255,255,${op})" stroke-width="2" stroke-linecap="round"/>`;
      return `${open}${wave(-5, 0.6)}${hash % 2 === 0 ? wave(7, 0.42) : wave(-12, 0.3)}${
        hash % 5 === 0
          ? '<circle cx="9" cy="-9" r="2" fill="rgba(255,255,255,.5)"/><circle cx="-10" cy="10" r="1.4" fill="rgba(255,255,255,.4)"/>'
          : ''
      }${close}`;
    }

    if (terrainKey === 'desert') {
      const cactus =
        hash % 4 === 0
          ? '<g transform="translate(-9 4)"><path d="M0 6V-4M0 -1c-2.6 0-2.6-3.4-2.6-3.4M0 2c2.6 0 2.6-3.4 2.6-3.4" fill="none" stroke="rgba(74,116,74,.75)" stroke-width="1.8" stroke-linecap="round"/></g>'
          : '';
      return `${open}<circle cx="9" cy="-8" r="3.2" fill="rgba(255,241,192,.9)"/><path d="M-16 6c4-8 10-8 14 0M-1 11c4-7 10-7 14 0" fill="none" stroke="rgba(153,112,49,.44)" stroke-width="2" stroke-linecap="round"/>${cactus}${close}`;
    }

    if (terrainKey === 'snow') {
      const flake = (x, y, s) =>
        `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -5V5M-4.3 -2.5L4.3 2.5M-4.3 2.5L4.3 -2.5" stroke="rgba(148,170,200,.7)" stroke-width="1.4" stroke-linecap="round"/></g>`;
      const drift =
        hash % 3 === 0
          ? '<path d="M-13 8c3-2.4 8-2.4 11 0" fill="none" stroke="rgba(178,196,220,.5)" stroke-width="1.8" stroke-linecap="round"/>'
          : '';
      return `${open}${drift}${flake(-7, -2, 1)}${flake(8, 5, 0.72)}${flake(4, -8, 0.55)}${close}`;
    }

    if (terrainKey === 'swamp') {
      return `${open}<path d="M-14 6c3-3 7-3 10 0s7 3 10 0" fill="none" stroke="rgba(46,74,66,.45)" stroke-width="2.1" stroke-linecap="round"/><ellipse cx="6" cy="8" rx="5.5" ry="2" fill="rgba(58,88,74,.3)"/><path d="M-6 -2v-8M-6 -8l-3.4-3M-6 -8l3.4-3" fill="none" stroke="rgba(64,96,80,.5)" stroke-width="1.7" stroke-linecap="round"/><path d="M7 1v-6M7 -3l-2.6-2.4M7 -3l2.6-2.4" fill="none" stroke="rgba(64,96,80,.44)" stroke-width="1.5" stroke-linecap="round"/>${close}`;
    }

    if (terrainKey === 'volcano') {
      return `${open}<ellipse cx="1" cy="13" rx="17" ry="2.6" fill="rgba(24,18,20,.3)"/><path d="M-16 13 L-5 -9 L7 13 Z" fill="#544b4f"/><path d="M-16 13 L-5 -9 L7 13 Z" fill="url(#mapShade)" opacity=".5"/><path d="M-5 -9 L-2.2 -3 L-8.4 -3 Z" fill="#f0b054"/><path d="M7 13 L14 1 L21 13 Z" fill="#61575b" opacity=".9"/><path d="M-3 -5c2 2.4 4.4 2.4 6.4 0" fill="none" stroke="rgba(255,166,76,.8)" stroke-width="1.8" stroke-linecap="round"/><path d="M2 -12c.5 1.7 1.4 2.3 3 2.7-1.6.4-2.5 1-3 2.7-.5-1.7-1.4-2.3-3-2.7 1.6-.4 2.5-1 3-2.7Z" fill="rgba(240,140,70,.85)"/>${close}`;
    }

    return '';
  }

  function buildMapFeatureDecor(featureKey) {
    const open = `<g class="map-feature-decor" aria-hidden="true">`;
    const close = '</g>';

    if (featureKey === 'grove') {
      return `${open}<g transform="translate(-6 2) scale(.78)"><path d="M0 -11 L-5 2 H5 Z" fill="#4f7a54"/><path d="M0 -4 L-7 10 H7 Z" fill="#5d8a60"/><path d="M-1 10h2v4h-2z" fill="#6d5743"/></g><g transform="translate(7 -3) scale(.6)"><path d="M0 -11 L-5 2 H5 Z" fill="#4b7350"/><path d="M0 -4 L-7 10 H7 Z" fill="#5b8760"/><path d="M-1 10h2v4h-2z" fill="#6d5743"/></g>${close}`;
    }

    if (featureKey === 'ruins') {
      return `${open}<path d="M-11 10v-13h4v13" fill="#c9c2b2" stroke="#9a927f" stroke-width="1"/><path d="M-11 -3h4M-11 2h4" stroke="#a89f8c" stroke-width="1"/><path d="M2 10v-9h4v9" fill="#c9c2b2" stroke="#9a927f" stroke-width="1"/><path d="M9 10l-2-11 3-1 3 12" fill="#bdb5a2" stroke="#948c79" stroke-width="1"/><path d="M-14 10h22" stroke="#8f876f" stroke-width="1.6" stroke-linecap="round"/>${close}`;
    }

    if (featureKey === 'temple') {
      return `${open}<path d="M-12 9h24" stroke="#948c79" stroke-width="1.6" stroke-linecap="round"/><path d="M-10 9V-2h20V9" fill="#e4dcc8" stroke="#9a927f" stroke-width="1.1"/><path d="M-12 -2L0 -11l12 9" fill="#d8cfb8" stroke="#9a927f" stroke-width="1.1"/><path d="M-6.5 9V0M-1 9V0M4.5 9V0" stroke="#b0a78f" stroke-width="2.2"/><circle cx="0" cy="-4.5" r="2.2" fill="rgba(240,196,92,.9)"/>${close}`;
    }

    if (featureKey === 'fortress') {
      return `${open}<path d="M-10 10V-4h20V10" fill="#a9adb8" stroke="#7e828e" stroke-width="1.1"/><path d="M-10 -4v-4h4v4M-4 -4v-4h4v4M2 -4v-4h4v4M8 -4v-4h4v4" fill="#a9adb8" stroke="#7e828e" stroke-width="1.1"/><path d="M-3 10V1h6v9" fill="#5c606b"/><path d="M-13 10h26" stroke="#767a86" stroke-width="1.6" stroke-linecap="round"/><path d="M0 -8v-4M0 -12l4 2-4 2" fill="none" stroke="#b04a3c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>${close}`;
    }

    if (featureKey === 'port') {
      return `${open}<path d="M0 -10v14" stroke="#6b4a2e" stroke-width="2" stroke-linecap="round"/><path d="M0 4c-5 0-8-3-8.5-7" fill="none" stroke="#4c4a45" stroke-width="2" stroke-linecap="round"/><path d="M0 4c5 0 8-3 8.5-7" fill="none" stroke="#4c4a45" stroke-width="2" stroke-linecap="round"/><path d="M-5 -6h10" stroke="#4c4a45" stroke-width="2" stroke-linecap="round"/><circle cx="0" cy="-10" r="1.8" fill="none" stroke="#4c4a45" stroke-width="1.6"/><path d="M-13 9c3.5-3 7-3 10.5 0s7 3 10.5 0" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.8" stroke-linecap="round"/>${close}`;
    }

    if (featureKey === 'camp') {
      return `${open}<path d="M-11 10  -4 -3  3 10Z" fill="#c2a06b" stroke="#94764a" stroke-width="1.1" stroke-linejoin="round"/><path d="M-4 -3V10" stroke="#94764a" stroke-width="1"/><path d="M5 10  10 3  15 10Z" fill="#c2a06b" stroke="#94764a" stroke-width="1.1" stroke-linejoin="round"/><path d="M8.5 12c0-2 1.6-2 1.6 0s1.6 2 1.6 0" fill="none" stroke="rgba(216,110,52,.85)" stroke-width="1.7" stroke-linecap="round"/>${close}`;
    }

    if (featureKey === 'stones') {
      return `${open}<path d="M-10 9  -12 -4 -7 -6 -5 9Z" fill="#9aa0ac" stroke="#7d828d" stroke-width="1"/><path d="M-2 9  -2 -9  3 -10  4 9Z" fill="#aab0bb" stroke="#7d828d" stroke-width="1"/><path d="M8 9  10 0  14 -2  15 9Z" fill="#9aa0ac" stroke="#7d828d" stroke-width="1"/><path d="M-13 9h30" stroke="#848a94" stroke-width="1.5" stroke-linecap="round"/>${close}`;
    }

    if (featureKey === 'danger') {
      return `${open}<path d="M-6 -8a6.5 6.2 0 1 1 12 0V-4h-12Z" fill="#e8e2d2" stroke="#8d8776" stroke-width="1.1"/><circle cx="-2.8" cy="-6.6" r="1.7" fill="#3a3630"/><circle cx="2.8" cy="-6.6" r="1.7" fill="#3a3630"/><path d="M-4 -4h8v3h-2v-2h-1.6v2h-1.8v-2H-3v2h-1Z" fill="#3a3630"/><path d="M-9 11c2.2-5 5.4-7.5 9-7.5s6.8 2.5 9 7.5" fill="none" stroke="rgba(176,74,60,.55)" stroke-width="1.8" stroke-linecap="round"/>${close}`;
    }

    return '';
  }

  function buildMapCityMarker(city, selected) {
    const center = hexCenter(city.col, city.row);
    const label = city.name.length > 8 ? `${city.name.slice(0, 8)}…` : city.name;
    const radius = MAP_HEX_SIZE * 0.4;
    const selectRing = selected
      ? `<circle class="map-city-select-ring" r="${
          MAP_HEX_SIZE * 0.62
        }" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="5 4"/>`
      : '';

    const charWidth = 14.5;
    const bannerWidth = Math.max(64, Math.round(label.length * charWidth + 34));
    const bannerHeight = 26;
    const bannerY = MAP_HEX_SIZE * 0.72;
    const halfW = bannerWidth / 2;
    const r = 7;
    const tipW = 7;
    const tipH = 9;
    const bannerPath =
      `M${-halfW + r} 0 L${halfW - r} 0 Q${halfW} 0 ${halfW} ${r} ` +
      `L${halfW} ${bannerHeight - r} Q${halfW} ${bannerHeight} ${halfW - r} ${bannerHeight} ` +
      `L${tipW} ${bannerHeight} L0 ${bannerHeight + tipH} L-${tipW} ${bannerHeight} ` +
      `L${-halfW + r} ${bannerHeight} Q${-halfW} ${bannerHeight} ${-halfW} ${bannerHeight - r} ` +
      `L${-halfW} ${r} Q${-halfW} 0 ${-halfW + r} 0 Z`;
    const stripePath =
      `M${-halfW + r} 0 L${-halfW + 16} 0 L${-halfW + 16} ${bannerHeight} ` +
      `L${-halfW + r} ${bannerHeight} Q${-halfW} ${bannerHeight} ${-halfW} ${bannerHeight - r} ` +
      `L${-halfW} ${r} Q${-halfW} 0 ${-halfW + r} 0 Z`;

    return `<g class="map-city-marker${
      selected ? ' is-selected' : ''
    }" data-city-id="${escapeXml(city.id)}" transform="translate(${roundMapCoordinate(
      center.x
    )} ${roundMapCoordinate(center.y)})" filter="url(#mapCityShadow)">
      <circle class="map-city-halo" r="${MAP_HEX_SIZE * 0.64}" fill="${
      city.color
    }" opacity=".18"/>
      ${selectRing}
      <circle class="map-city-disc" r="${radius}" fill="${city.color}"/>
      <circle class="map-city-ring" r="${radius}" fill="none" stroke="#ffffff" stroke-width="2.4"/>
      <path class="map-city-glyph" d="M0 -8 L2.3 -2.5 L8.2 -2.5 L3.4 1.2 L5.2 7 L0 3.5 L-5.2 7 L-3.4 1.2 L-8.2 -2.5 L-2.3 -2.5 Z" fill="#ffffff" opacity=".92"/>
      <g class="map-city-banner" transform="translate(0 ${bannerY})">
        <path d="${bannerPath}" fill="rgba(252,253,255,.94)" stroke="${city.color}" stroke-width="1.6"/>
        <path d="${stripePath}" fill="${city.color}" opacity=".92"/>
        <text class="map-city-label" x="8" y="${bannerHeight / 2 + 5.5}" text-anchor="middle">${escapeXml(label)}</text>
        <title>${escapeXml(city.name)}</title>
      </g>
    </g>`;
  }

  function escapeXml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      switch (character) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        default:
          return '&apos;';
      }
    });
  }

  function openMapEditor({ novelId, sectionKey = 'maps', entryId }) {
    const novel = findNovel(novelId);
    const entries = novel && novel.entries[sectionKey];
    const entry = entries ? entries.find((item) => item.id === entryId) : null;

    if (!novel || !entry) {
      showToast('这个地点已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const draft = normalizeMap(entry.map) || defaultMap();

    state.mapEditor = {
      novelId,
      sectionKey,
      entryId,
      draft,
      tool: 'browse',
      terrain: 'grass',
      feature: 'grove',
      brushSize: 1,
      showGrid: false,
      selectedCityId: null,
      selectedPathId: null,
      pendingPath: null,
      view: { tx: 0, ty: 0, scale: 1 },
      fitScale: 1,
      history: [JSON.stringify(draft)],
      historyIndex: 0,
      pointer: null,
      strokeSnapshot: null,
      namePending: false,
    };

    els.mapDialogSubtitle.textContent = `${novel.title} · ${entry.title}`;
    els.mapCityNameInput.value = '';
    syncMapSizeUi();
    renderMapPalette();
    renderMapToolState();
    renderMapCanvas();
    renderMapInspector();
    syncMapGridUi();
    syncMapDirtyUi();

    els.mapDialog.showModal();
    fitMapView();
    requestAnimationFrame(fitMapView);
  }

  function renderMapPalette() {
    const editor = state.mapEditor;
    if (!editor) return;

    const fragment = document.createDocumentFragment();

    if (editor.tool === 'feature') {
      const noneButton = el('button', 'terrain-option');
      noneButton.type = 'button';
      noneButton.dataset.feature = 'none';
      noneButton.setAttribute('role', 'radio');
      noneButton.setAttribute('aria-checked', String(editor.feature === 'none'));
      noneButton.title = '清除地标';
      noneButton.append(
        el('span', 'terrain-chip terrain-chip-none'),
        el('span', 'terrain-name', '清除')
      );
      fragment.appendChild(noneButton);

      for (const key of Object.keys(MAP_FEATURES)) {
        const button = el('button', 'terrain-option');
        button.type = 'button';
        button.dataset.feature = key;
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', String(editor.feature === key));
        button.title = `放置${MAP_FEATURES[key].label}`;

        const chip = el('span', 'terrain-chip terrain-chip-feature');
        const chipSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        chipSvg.setAttribute('viewBox', '-18 -18 36 36');
        chipSvg.setAttribute('aria-hidden', 'true');
        chipSvg.innerHTML = buildMapFeatureDecor(key);
        chip.appendChild(chipSvg);
        button.append(chip, el('span', 'terrain-name', MAP_FEATURES[key].label));
        fragment.appendChild(button);
      }

      els.mapTerrainPalette.replaceChildren(fragment);
      return;
    }

    for (const key of MAP_TERRAIN_KEYS) {
      const terrain = MAP_TERRAINS[key];
      const button = el('button', 'terrain-option');
      button.type = 'button';
      button.dataset.terrain = key;
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', String(editor.terrain === key));
      button.title = `绘制${terrain.label}`;

      const chip = el('span', 'terrain-chip');
      chip.style.setProperty('--terrain-fill', terrain.fill);
      button.append(chip, el('span', 'terrain-name', terrain.label));
      fragment.appendChild(button);
    }
    els.mapTerrainPalette.replaceChildren(fragment);
  }

  function syncMapPaletteView() {
    const editor = state.mapEditor;
    if (!editor) return;
    const featureMode = editor.tool === 'feature';
    if (els.mapTerrainLabel) {
      els.mapTerrainLabel.textContent = featureMode ? '地标' : '地形';
    }
    if (els.mapTerrainPalette) {
      els.mapTerrainPalette
        .querySelectorAll('[data-terrain]')
        .forEach((button) => {
          const active = button.dataset.terrain === editor.terrain;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-checked', String(active));
        });
      els.mapTerrainPalette
        .querySelectorAll('[data-feature]')
        .forEach((button) => {
          const active = button.dataset.feature === editor.feature;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-checked', String(active));
        });
    }
  }

  function syncMapGridUi() {
    const editor = state.mapEditor;
    if (!editor) return;
    els.mapSvg.classList.toggle('no-grid', !editor.showGrid);
    if (els.mapGridBtn) {
      els.mapGridBtn.setAttribute('aria-pressed', String(Boolean(editor.showGrid)));
      els.mapGridBtn.classList.toggle('is-active', Boolean(editor.showGrid));
    }
  }

  function renderMapToolState() {
    const editor = state.mapEditor;
    if (!editor) return;

    els.mapTools.querySelectorAll('[data-map-tool]').forEach((button) => {
      const active = button.dataset.mapTool === editor.tool;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    els.mapTerrainPalette.querySelectorAll('[data-terrain]').forEach((button) => {
      const active = button.dataset.terrain === editor.terrain;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-checked', String(active));
    });

    if (els.mapBrushRow) {
      els.mapBrushRow.querySelectorAll('[data-brush]').forEach((button) => {
        const active = Number(button.dataset.brush) === editor.brushSize;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    syncMapPaletteView();

    updateMapStageCursor();
    syncMapStageTip();
  }

  function updateMapStageCursor() {
    const editor = state.mapEditor;
    if (!editor) return;
    const stage = els.mapStage;
    const areaMode = Boolean(getMapAreaCity(editor));
    stage.classList.toggle('is-city-mode', editor.tool === 'city' && !areaMode);
    stage.classList.toggle(
      'is-paint-mode',
      editor.tool === 'paint' ||
        editor.tool === 'erase' ||
        editor.tool === 'feature' ||
        (editor.tool === 'city' && areaMode)
    );
    stage.classList.toggle(
      'is-path-mode',
      editor.tool === 'river' || editor.tool === 'road'
    );
    stage.classList.toggle('is-dropper-mode', editor.tool === 'eyedropper');
  }

  function syncMapStageTip() {
    const editor = state.mapEditor;
    if (!editor) return;
    const hasPending = Boolean(editor.pendingPath);

    if (hasPending) {
      const config = MAP_PATH_KINDS[editor.pendingPath.kind];
      const count = editor.pendingPath.points.length;
      els.mapStageTip.hidden = false;
      els.mapStageTip.textContent =
        count < 2
          ? `继续点击格子延伸这条${config.label}，点击同一点结束`
          : `点击同一个格子结束这条${config.label}（当前 ${count} 个点）`;
      return;
    }

    const areaCity = getMapAreaCity(editor);
    if (areaCity) {
      els.mapStageTip.hidden = false;
      els.mapStageTip.textContent = `点击或拖动格子，划入 / 划出「${
        areaCity.name || '未命名城市'
      }」的范围 · Shift + 拖动平移`;
      return;
    }

    const empty = editor.draft.cities.length === 0;
    const hints = {
      river: '点击格子落下河流起点',
      road: '点击格子落下道路起点',
      eyedropper: '点击一个格子，取用它的地形',
      feature:
        editor.feature === 'none'
          ? '点击带地标的格子，移除它的地标'
          : '点击或拖动格子，放置地标（不改变地形）',
    };
    if (hints[editor.tool]) {
      els.mapStageTip.hidden = false;
      els.mapStageTip.textContent = hints[editor.tool];
      return;
    }

    els.mapStageTip.hidden = !empty;
    if (!empty) return;
    els.mapStageTip.textContent =
      editor.tool === 'city'
        ? '在格子上点一下，放下第一座城市'
        : '选择「城市」，在格子上点一下';
  }

  function renderMapCanvas() {
    const editor = state.mapEditor;
    if (!editor) return;
    els.mapSvg.innerHTML = `<g class="map-viewport">${buildMapMarkup(editor.draft, {
      selectedCityId: editor.selectedCityId,
      selectedPathId: editor.selectedPathId,
      pendingPath: editor.pendingPath,
    })}</g>`;
    applyMapView();
  }

  function applyMapView() {
    const editor = state.mapEditor;
    if (!editor) return;
    const viewport = $('.map-viewport', els.mapSvg);
    if (!viewport) return;

    const { tx, ty, scale } = editor.view;
    viewport.setAttribute(
      'transform',
      `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(3)})`
    );

    const percent = editor.fitScale
      ? Math.round((scale / editor.fitScale) * 100)
      : Math.round(scale * 100);
    els.mapZoomBadge.textContent = `${percent}%`;
  }

  function syncMapViewportBox() {
    const width = els.mapSvg.clientWidth;
    const height = els.mapSvg.clientHeight;
    if (!width || !height) return null;
    els.mapSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    return { width, height };
  }

  function fitMapView() {
    const editor = state.mapEditor;
    if (!editor) return;
    const size = syncMapViewportBox();
    if (!size) return;

    const bounds = getMapWorldBounds(editor.draft);
    const padding = Math.min(56, Math.max(22, Math.min(size.width, size.height) * 0.07));
    const rawScale = Math.min(
      (size.width - padding * 2) / bounds.width,
      (size.height - padding * 2) / bounds.height
    );
    const scale = Math.min(Math.max(rawScale, 0.08), 3);

    editor.fitScale = scale;
    editor.view = {
      scale,
      tx: (size.width - bounds.width * scale) / 2 - bounds.minX * scale,
      ty: (size.height - bounds.height * scale) / 2 - bounds.minY * scale,
    };
    applyMapView();
  }

  function zoomMapAt(px, py, nextScale) {
    const editor = state.mapEditor;
    if (!editor) return;
    const scale = Math.min(Math.max(nextScale, 0.12), 3.4);
    const current = editor.view;
    const worldX = (px - current.tx) / current.scale;
    const worldY = (py - current.ty) / current.scale;

    editor.view = {
      scale,
      tx: px - worldX * scale,
      ty: py - worldY * scale,
    };
    applyMapView();
  }

  function zoomMapBy(factor) {
    const editor = state.mapEditor;
    if (!editor) return;
    const rect = els.mapStage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    zoomMapAt(rect.width / 2, rect.height / 2, editor.view.scale * factor);
  }

  function eventToMapCell(event) {
    const editor = state.mapEditor;
    if (!editor) return null;
    const viewport = $('.map-viewport', els.mapSvg);
    if (!viewport) return null;
    const matrix = viewport.getScreenCTM();
    if (!matrix) return null;

    const point = els.mapSvg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    return worldToMapCell(local.x, local.y, editor.draft);
  }

  function worldToMapCell(x, y, map) {
    const rowGuess = Math.round(y / (1.5 * MAP_HEX_SIZE));
    let best = null;

    for (let row = rowGuess - 1; row <= rowGuess + 1; row += 1) {
      if (row < 0 || row >= map.rows) continue;
      const colGuess = Math.round(
        x / (MAP_WORLD_SQRT3 * MAP_HEX_SIZE) - 0.5 * (row & 1)
      );

      for (let col = colGuess - 1; col <= colGuess + 1; col += 1) {
        if (col < 0 || col >= map.cols) continue;
        const center = hexCenter(col, row);
        const distance = Math.hypot(x - center.x, y - center.y);
        if (!best || distance < best.distance) best = { col, row, distance };
      }
    }

    if (!best || best.distance > MAP_HEX_SIZE) return null;
    return best;
  }

  function renderMapInspector() {
    const editor = state.mapEditor;
    if (!editor) return;

    const cities = editor.draft.cities;
    const selected = cities.find((city) => city.id === editor.selectedCityId) || null;

    els.mapCityCount.textContent = `${cities.length} 座`;
    if (els.mapPathCount) {
      const paths = editor.draft.paths || [];
      const riverCount = paths.filter((path) => path.kind === 'river').length;
      const roadCount = paths.filter((path) => path.kind === 'road').length;
      const parts = [];
      if (riverCount) parts.push(`河流 ${riverCount}`);
      if (roadCount) parts.push(`道路 ${roadCount}`);
      els.mapPathCount.textContent = parts.length ? parts.join(' · ') : '0 条';
    }
    renderMapPathList();

    const list = document.createDocumentFragment();
    if (cities.length === 0) {
      list.appendChild(
        el(
          'p',
          'map-city-list-empty',
          '还没有城市。切换到「城市」工具，在画布上点一下。'
        )
      );
    } else {
      for (const city of cities) {
        const item = el('button', 'map-city-item');
        item.type = 'button';
        item.dataset.cityId = city.id;
        const active = city.id === editor.selectedCityId;
        item.classList.toggle('is-selected', active);
        item.setAttribute('aria-pressed', String(active));

        const dot = el('span', 'map-city-dot');
        dot.style.setProperty('--city-color', city.color);

        item.append(
          dot,
          el('span', 'map-city-item-name', city.name || '未命名城市'),
          el(
            'span',
            'map-city-item-meta',
            city.customArea
              ? `${(city.cells || []).length} 格自选`
              : `${city.radius} 格`
          )
        );
        list.appendChild(item);
      }
    }
    els.mapCityList.replaceChildren(list);

    els.mapCityEditor.hidden = !selected;
    els.mapInspectorEmpty.hidden = Boolean(selected);

    if (!selected) {
      els.mapCityNameInput.value = '';
      els.mapCityCoord.textContent = '';
      syncMapStageTip();
      return;
    }

    if (document.activeElement !== els.mapCityNameInput) {
      els.mapCityNameInput.value = selected.name;
    }
    els.mapCityCoord.textContent = `第 ${selected.row + 1} 行 · 第 ${
      selected.col + 1
    } 列 · 半径 ${selected.radius} 格`;
    renderMapColorRow(selected);
    syncMapRadiusButtons(selected);
    syncMapStageTip();
  }

  function renderMapPathList() {
    if (!els.mapPathList) return;
    const editor = state.mapEditor;
    if (!editor) return;

    const paths = editor.draft.paths || [];
    if (!paths.length) {
      els.mapPathList.hidden = true;
      els.mapPathList.replaceChildren();
      return;
    }

    els.mapPathList.hidden = false;
    const list = document.createDocumentFragment();
    for (const path of paths) {
      const config = MAP_PATH_KINDS[path.kind] || MAP_PATH_KINDS.river;
      const item = el('div', 'map-path-item');
      item.dataset.pathId = path.id;
      item.classList.toggle('is-selected', path.id === editor.selectedPathId);

      const dot = el('span', 'map-path-dot');
      dot.style.setProperty('--path-color', config.color);
      item.append(
        dot,
        el('span', 'map-path-name', config.label),
        el('span', 'map-path-meta', `${path.points.length} 点`)
      );

      const removeBtn = el('button', 'map-path-remove');
      removeBtn.type = 'button';
      removeBtn.dataset.removePathId = path.id;
      removeBtn.setAttribute('aria-label', `移除这条${config.label}`);
      removeBtn.setAttribute('title', '移除');
      removeBtn.append(icon('i-close'));
      item.appendChild(removeBtn);
      list.appendChild(item);
    }
    els.mapPathList.replaceChildren(list);
  }

  function selectMapPath(pathId) {
    const editor = state.mapEditor;
    if (!editor) return;
    const nextId =
      pathId && (editor.draft.paths || []).some((path) => path.id === pathId)
        ? pathId
        : null;
    editor.selectedPathId = nextId;
    renderMapCanvas();
    renderMapPathList();
  }

  function deleteMapPath(pathId) {
    const editor = state.mapEditor;
    if (!editor) return;
    const before = (editor.draft.paths || []).length;
    editor.draft.paths = (editor.draft.paths || []).filter(
      (path) => path.id !== pathId
    );
    if (editor.draft.paths.length === before) return;
    if (editor.selectedPathId === pathId) editor.selectedPathId = null;
    pushMapHistory();
    renderMapCanvas();
    renderMapInspector();
  }

  function commitPendingMapPath() {
    const editor = state.mapEditor;
    if (!editor || !editor.pendingPath) return;
    const pending = editor.pendingPath;
    editor.pendingPath = null;
    if (pending.points.length >= 2) {
      editor.draft.paths = editor.draft.paths || [];
      editor.draft.paths.push({
        id: makeId(),
        kind: pending.kind,
        points: pending.points,
      });
      editor.selectedPathId = null;
      pushMapHistory();
      renderMapCanvas();
      renderMapInspector();
    } else {
      renderMapCanvas();
      syncMapStageTip();
    }
  }

  function cancelPendingMapPath() {
    const editor = state.mapEditor;
    if (!editor || !editor.pendingPath) return;
    editor.pendingPath = null;
    renderMapCanvas();
    syncMapStageTip();
  }

  function appendPendingMapPathPoint(cell) {
    const editor = state.mapEditor;
    if (!editor || !cell) return;
    const kind = editor.tool === 'road' ? 'road' : 'river';
    const pending = editor.pendingPath;

    if (pending && pending.kind !== kind) commitPendingMapPath();

    if (!editor.pendingPath) {
      editor.pendingPath = { kind, points: [cell] };
    } else {
      const last = editor.pendingPath.points[editor.pendingPath.points.length - 1];
      if (last.col === cell.col && last.row === cell.row) {
        commitPendingMapPath();
        return;
      }
      if (editor.pendingPath.points.length >= MAP_MAX_PATH_POINTS) return;
      editor.pendingPath.points.push(cell);
    }

    renderMapCanvas();
    syncMapStageTip();
  }

  function renderMapColorRow(city) {
    const fragment = document.createDocumentFragment();

    for (const color of MAP_CITY_COLORS) {
      const button = el('button', 'map-color-swatch');
      button.type = 'button';
      button.dataset.color = color;
      button.style.setProperty('--city-color', color);
      button.setAttribute('aria-label', `城市颜色 ${color}`);
      const active = city.color === color;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      fragment.appendChild(button);
    }

    els.mapColorRow.replaceChildren(fragment);
  }

  function syncMapRadiusButtons(city) {
    els.mapRadiusRow.querySelectorAll('[data-radius]').forEach((button) => {
      const active =
        button.dataset.radius === 'custom'
          ? Boolean(city.customArea)
          : !city.customArea && Number(button.dataset.radius) === city.radius;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function syncMapCityControls(city) {
    els.mapCityCoord.textContent = city.customArea
      ? `第 ${city.row + 1} 行 · 第 ${city.col + 1} 列 · 自选 ${
          (city.cells || []).length
        } 格`
      : `第 ${city.row + 1} 行 · 第 ${city.col + 1} 列 · 半径 ${city.radius} 格`;
    syncMapRadiusButtons(city);

    els.mapColorRow.querySelectorAll('.map-color-swatch').forEach((button) => {
      const active = button.dataset.color === city.color;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const item = els.mapCityList.querySelector(
      `.map-city-item[data-city-id="${cssEscape(city.id)}"]`
    );
    if (item) {
      const meta = $('.map-city-item-meta', item);
      const dot = $('.map-city-dot', item);
      if (meta) {
        meta.textContent = city.customArea
          ? `${(city.cells || []).length} 格自选`
          : `${city.radius} 格`;
      }
      if (dot) dot.style.setProperty('--city-color', city.color);
    }
  }

  function updateMapCityLabel(city) {
    const marker = els.mapSvg.querySelector(
      `.map-city-marker[data-city-id="${cssEscape(city.id)}"]`
    );
    const displayName = city.name || '未命名城市';

    if (marker) {
      const label = $('.map-city-label', marker);
      const title = $('title', marker);
      if (label) {
        label.textContent =
          displayName.length > 8 ? `${displayName.slice(0, 8)}…` : displayName;
      }
      if (title) title.textContent = displayName;
    }

    const item = els.mapCityList.querySelector(
      `.map-city-item[data-city-id="${cssEscape(city.id)}"] .map-city-item-name`
    );
    if (item) item.textContent = displayName;
  }

  function nextMapCityName(cities) {
    let index = 1;
    const used = new Set(cities.map((city) => city.name));
    while (used.has(`新城 ${index}`)) index += 1;
    return `新城 ${index}`;
  }

  function selectMapCity(cityId) {
    const editor = state.mapEditor;
    if (!editor) return;
    const nextId =
      cityId && editor.draft.cities.some((city) => city.id === cityId)
        ? cityId
        : null;
    if (editor.selectedCityId === nextId) {
      renderMapInspector();
      return;
    }
    editor.selectedCityId = nextId;
    renderMapCanvas();
    renderMapInspector();
  }

  function addMapCityAtCell(cell) {
    const editor = state.mapEditor;
    if (!editor || !cell) return;

    const existing = editor.draft.cities.find(
      (city) => city.col === cell.col && city.row === cell.row
    );
    if (existing) {
      selectMapCity(existing.id);
      return;
    }
    if (editor.draft.cities.length >= MAP_MAX_CITIES) {
      showToast(`一张地图最多放置 ${MAP_MAX_CITIES} 座城市`);
      return;
    }

    const city = {
      id: makeId(),
      name: nextMapCityName(editor.draft.cities),
      col: cell.col,
      row: cell.row,
      color: MAP_CITY_COLORS[editor.draft.cities.length % MAP_CITY_COLORS.length],
      radius: 2,
    };
    editor.draft.cities.push(city);
    editor.selectedCityId = city.id;
    pushMapHistory();
    renderMapCanvas();
    renderMapInspector();
  }

  function deleteSelectedMapCity() {
    const editor = state.mapEditor;
    if (!editor) return;
    const city = editor.draft.cities.find(
      (item) => item.id === editor.selectedCityId
    );
    if (!city) return;

    editor.draft.cities = editor.draft.cities.filter((item) => item.id !== city.id);
    editor.selectedCityId = null;
    pushMapHistory();
    renderMapCanvas();
    renderMapInspector();
  }

  function paintMapCell(col, row) {
    const editor = state.mapEditor;
    if (!editor) return;

    const key = `${col},${row}`;
    const current = editor.draft.tiles[key] || 'grass';
    const next = editor.tool === 'erase' ? 'grass' : editor.terrain;
    const featureChanged =
      editor.tool === 'erase' && editor.draft.features && editor.draft.features[key];

    if (current === next && !featureChanged) return;

    if (next === 'grass') {
      delete editor.draft.tiles[key];
    } else {
      editor.draft.tiles[key] = next;
    }

    if (editor.tool === 'erase' && editor.draft.features) {
      delete editor.draft.features[key];
    }

    const tile = els.mapSvg.querySelector(
      `.map-hex[data-col="${col}"][data-row="${row}"]`
    );
    if (tile) {
      tile.dataset.terrain = next;
      tile.innerHTML = buildMapHexInner(col, row, next);
    }
    if (featureChanged) {
      const featureEl = els.mapSvg.querySelector(
        `.map-feature[data-col="${col}"][data-row="${row}"]`
      );
      if (featureEl) featureEl.remove();
    }
    syncMapDirtyUi();
  }

  function applyFeatureAtCell(col, row) {
    const editor = state.mapEditor;
    if (!editor) return;
    const key = `${col},${row}`;
    const next = editor.feature === 'none' ? null : editor.feature;
    const current = editor.draft.features ? editor.draft.features[key] : undefined;
    if (current === next) return;

    if (!editor.draft.features) editor.draft.features = {};
    if (next) {
      editor.draft.features[key] = next;
    } else {
      delete editor.draft.features[key];
    }

    const existing = els.mapSvg.querySelector(
      `.map-feature[data-col="${col}"][data-row="${row}"]`
    );
    if (existing) existing.remove();
    if (next) {
      const center = hexCenter(col, row);
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add('map-feature');
      group.dataset.col = String(col);
      group.dataset.row = String(row);
      group.dataset.feature = next;
      group.setAttribute(
        'transform',
        `translate(${roundMapCoordinate(center.x)} ${roundMapCoordinate(center.y)})`
      );
      group.innerHTML = buildMapFeatureDecor(next);
      const layer = $('.map-feature-layer', els.mapSvg);
      if (layer) layer.appendChild(group);
    }
    syncMapDirtyUi();
  }

  function paintMapCellAt(cell, pointer) {
    if (!cell) return;
    const key = `${cell.col},${cell.row}`;
    if (pointer.lastPaintKey === key) return;
    pointer.lastPaintKey = key;

    const editor = state.mapEditor;
    if (editor && editor.tool === 'feature') {
      applyFeatureAtCell(cell.col, cell.row);
      return;
    }

    const size = editor ? editor.brushSize : 1;
    if (size <= 1) {
      paintMapCell(cell.col, cell.row);
      return;
    }

    const reach = size - 1;
    for (let row = cell.row - reach; row <= cell.row + reach; row += 1) {
      if (row < 0) continue;
      for (let col = cell.col - reach; col <= cell.col + reach; col += 1) {
        if (col < 0) continue;
        if (mapHexDistance(col, row, cell.col, cell.row) > reach) continue;
        paintMapCell(col, row);
      }
    }
  }

  function pickTerrainAtCell(cell) {
    const editor = state.mapEditor;
    if (!editor || !cell) return;
    const terrainKey = editor.draft.tiles[`${cell.col},${cell.row}`] || 'grass';
    editor.terrain = terrainKey;
    editor.tool = 'paint';
    renderMapToolState();
    showToast(`已取用「${MAP_TERRAINS[terrainKey].label}」，继续绘制`);
  }

  function pushMapHistory(snapshot) {
    const editor = state.mapEditor;
    if (!editor) return;
    const value = snapshot || JSON.stringify(editor.draft);
    if (editor.history[editor.historyIndex] === value) {
      syncMapDirtyUi();
      return;
    }

    editor.history = editor.history.slice(0, editor.historyIndex + 1);
    editor.history.push(value);
    if (editor.history.length > MAP_HISTORY_LIMIT) editor.history.shift();
    editor.historyIndex = editor.history.length - 1;
    editor.namePending = false;
    syncMapDirtyUi();
  }

  function syncMapDirtyUi() {
    const editor = state.mapEditor;
    if (!editor) return;
    const dirty = JSON.stringify(editor.draft) !== editor.history[0];
    els.mapSaveState.textContent = dirty ? '有未保存的改动' : '已与档案同步';
    els.mapSaveState.classList.toggle('is-dirty', dirty);
    const canUndo = editor.historyIndex > 0;
    const canRedo = editor.historyIndex < editor.history.length - 1;
    els.mapUndoBtn.disabled = !canUndo;
    els.mapRedoBtn.disabled = !canRedo;
    els.mapMobileUndoBtn.disabled = !canUndo;
    els.mapMobileRedoBtn.disabled = !canRedo;
  }

  function restoreMapHistory(index) {
    const editor = state.mapEditor;
    if (!editor) return;
    if (index < 0 || index >= editor.history.length) return;

    editor.historyIndex = index;
    editor.draft = JSON.parse(editor.history[index]);
    editor.namePending = false;
    editor.pendingPath = null;
    if (
      editor.selectedCityId &&
      !editor.draft.cities.some((city) => city.id === editor.selectedCityId)
    ) {
      editor.selectedCityId = null;
    }
    if (
      editor.selectedPathId &&
      !(editor.draft.paths || []).some((path) => path.id === editor.selectedPathId)
    ) {
      editor.selectedPathId = null;
    }
    renderMapCanvas();
    renderMapInspector();
    syncMapDirtyUi();
  }

  function undoMapChange() {
    const editor = state.mapEditor;
    if (!editor) return;
    restoreMapHistory(editor.historyIndex - 1);
  }

  function redoMapChange() {
    const editor = state.mapEditor;
    if (!editor) return;
    restoreMapHistory(editor.historyIndex + 1);
  }

  function commitMapCityName() {
    const editor = state.mapEditor;
    if (!editor) return;
    const city = editor.draft.cities.find(
      (item) => item.id === editor.selectedCityId
    );
    if (!city) return;

    const trimmed = city.name.trim().slice(0, 40) || '未命名城市';
    const changed = trimmed !== city.name || editor.namePending;
    city.name = trimmed;

    els.mapCityNameInput.value = trimmed;
    updateMapCityLabel(city);

    if (changed) {
      pushMapHistory();
    }
  }

  function syncMapSizeUi() {
    const editor = state.mapEditor;
    if (!editor || !els.mapSizeColsValue) return;
    els.mapSizeColsValue.textContent = `${editor.draft.cols}`;
    els.mapSizeRowsValue.textContent = `${editor.draft.rows}`;
  }

  function resizeMapCanvas(deltaCols, deltaRows) {
    const editor = state.mapEditor;
    if (!editor) return;

    const cols = clampInt(
      editor.draft.cols + deltaCols,
      6,
      40,
      editor.draft.cols
    );
    const rows = clampInt(
      editor.draft.rows + deltaRows,
      6,
      30,
      editor.draft.rows
    );
    if (cols === editor.draft.cols && rows === editor.draft.rows) return;

    editor.draft.cols = cols;
    editor.draft.rows = rows;

    for (const key of Object.keys(editor.draft.tiles)) {
      const [col, row] = key.split(',').map(Number);
      if (col >= cols || row >= rows) delete editor.draft.tiles[key];
    }
    if (editor.draft.features) {
      for (const key of Object.keys(editor.draft.features)) {
        const [col, row] = key.split(',').map(Number);
        if (col >= cols || row >= rows) delete editor.draft.features[key];
      }
    }
    editor.draft.cities = editor.draft.cities
      .map((city) => {
        const next = {
          ...city,
          ...(city.customArea && Array.isArray(city.cells)
            ? {
                cells: city.cells.filter((key) => {
                  const [cellCol, cellRow] = key.split(',').map(Number);
                  return cellCol < cols && cellRow < rows;
                }),
              }
            : {}),
        };
        if (
          next.customArea &&
          (!Array.isArray(next.cells) || next.cells.length === 0)
        ) {
          delete next.customArea;
          delete next.cells;
        }
        return next;
      })
      .filter((city) => city.col < cols && city.row < rows);
    editor.draft.paths = (editor.draft.paths || [])
      .map((path) => ({
        ...path,
        points: path.points.filter(
          (point) => point.col < cols && point.row < rows
        ),
      }))
      .filter((path) => path.points.length >= 2);
    if (
      editor.selectedCityId &&
      !editor.draft.cities.some((city) => city.id === editor.selectedCityId)
    ) {
      editor.selectedCityId = null;
    }

    pushMapHistory();
    syncMapSizeUi();
    renderMapCanvas();
    renderMapInspector();
    fitMapView();
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeValueNoise(cols, rows, cell, rand) {
    const gw = Math.ceil(cols / cell) + 2;
    const gh = Math.ceil(rows / cell) + 2;
    const grid = Array.from({ length: gh }, () =>
      Array.from({ length: gw }, () => rand())
    );
    const smooth = (t) => t * t * (3 - 2 * t);

    return (x, y) => {
      const fx = x / cell;
      const fy = y / cell;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = smooth(fx - x0);
      const ty = smooth(fy - y0);
      const a = grid[y0][x0];
      const b = grid[y0][x0 + 1];
      const c = grid[y0 + 1][x0];
      const d = grid[y0 + 1][x0 + 1];
      return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
    };
  }

  function buildMapWaterDistance(map, tiles) {
    const dist = new Map();
    const queue = [];

    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        if ((tiles[`${col},${row}`] || 'grass') !== 'water') continue;
        dist.set(`${col},${row}`, 0);
        queue.push([col, row]);
      }
    }

    for (let head = 0; head < queue.length; head += 1) {
      const [col, row] = queue[head];
      const depth = dist.get(`${col},${row}`) || 0;
      if (depth >= 4) continue;
      for (const direction of MAP_DIRECTIONS) {
        const [nextCol, nextRow] = mapNeighborCell(col, row, direction);
        if (nextCol < 0 || nextRow < 0 || nextCol >= map.cols || nextRow >= map.rows) continue;
        const key = `${nextCol},${nextRow}`;
        if (dist.has(key)) continue;
        dist.set(key, depth + 1);
        queue.push([nextCol, nextRow]);
      }
    }

    return dist;
  }

  function generateMapTerrainDraft(map) {
    const rand = mulberry32(Date.now() & 0xffffffff);
    const n1 = makeValueNoise(map.cols, map.rows, 6.5, rand);
    const n2 = makeValueNoise(map.cols, map.rows, 3.2, rand);
    const n3 = makeValueNoise(map.cols, map.rows, 1.8, rand);
    const m = makeValueNoise(map.cols, map.rows, 4.4, rand);

    const heights = [];
    const tiles = {};
    const centerX = (map.cols - 1) / 2;
    const centerY = (map.rows - 1) / 2;

    for (let row = 0; row < map.rows; row += 1) {
      heights.push(new Array(map.cols).fill(0));
      for (let col = 0; col < map.cols; col += 1) {
        const nx = col + 0.5 * (row & 1);
        const raw =
          0.58 * n1(nx, row) +
          0.27 * n2(nx, row) +
          0.15 * n3(nx, row);
        // Unciv 盘古大陆思路：椭圆大陆场让板块整体成形，噪声保留海岸破碎感
        const ax = centerX + 0.6;
        const ay = centerY + 0.6;
        const dx = (nx - centerX) / ax;
        const dy = (row - centerY) / ay;
        const distFactor =
          dx * dx + dy * dy + ((dx + dy) * (dx + dy)) / ((ax + ay) * (ax + ay));
        const elliptic = Math.max(0, 1 - distFactor * 1.35);
        const blended = raw * 0.74 + elliptic * 0.26;
        // 文明式大陆轮廓：离中心越远地势越低，四周自然成海
        const edge =
          Math.max(
            Math.abs(col - centerX) / (centerX + 0.5),
            Math.abs(row - centerY) / (centerY + 0.5)
          ) - 0.62;
        const h = Math.min(blended, blended - Math.max(0, edge) * 0.7);
        heights[row][col] = h;
      }
    }

    // Unciv retryLoweringWaterLevel 思路：按目标海陆比从高度分布里校准海平面，
    // 避免随机种子导致的全陆或全海
    const allHeights = [];
    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) allHeights.push(heights[row][col]);
    }
    allHeights.sort((a, b) => a - b);
    const targetWater = 0.26 + rand() * 0.08;
    const sampled =
      allHeights[
        Math.min(allHeights.length - 1, Math.floor(allHeights.length * targetWater))
      ] || 0.34;
    const waterLevel = Math.min(0.46, Math.max(0.2, sampled));
    // 以陆地高度 96 分位为「山顶」：山脉/火山始终占陆地约 4%，与文明系列一致
    const landHeights = allHeights.filter((v) => v > waterLevel);
    const landMax =
      landHeights.length > 8
        ? landHeights[
            Math.min(landHeights.length - 1, Math.floor(landHeights.length * 0.96))
          ]
        : waterLevel + 0.3;

    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        const h = heights[row][col];
        const nx = col + 0.5 * (row & 1);
        const moisture = m(nx, row);
        const latitude = Math.abs(row - centerY) / (centerY + 0.5);
        // 陆地相对海拔：水位校准后，地形分带不再受海平面高低影响
        const landSpan = Math.max(0.12, landMax - waterLevel);
        const landT =
          h <= waterLevel
            ? 0
            : Math.max(0, Math.min(1, (h - waterLevel) / landSpan));
        const temperature =
          1 - latitude * 0.72 - Math.max(0, landT - 0.84) * 1.1;

        let key;
        if (h < waterLevel) key = 'water';
        else if (temperature < 0.3) key = landT > 0.9 ? 'mountain' : 'snow';
        else if (temperature < 0.42) key = moisture > 0.5 ? 'swamp' : 'plains';
        else if (landT < 0.08)
          key = moisture > 0.68 ? 'swamp' : moisture < 0.32 ? 'desert' : 'grass';
        else if (landT < 0.24)
          key = moisture > 0.66 ? 'swamp' : moisture < 0.3 ? 'desert' : 'grass';
        else if (landT < 0.42) key = moisture > 0.68 ? 'forest' : 'grass';
        else if (landT < 0.58) key = moisture > 0.52 ? 'forest' : 'plains';
        else if (landT < 0.72) key = moisture > 0.42 ? 'forest' : 'plains';
        else if (landT < 0.82) key = moisture > 0.5 ? 'forest' : 'hills';
        else if (landT < 0.9) key = 'hills';
        else if (landT < 0.96) key = 'mountain';
        else key = moisture > 0.72 ? 'volcano' : 'mountain';

        if (landT >= 0.05 && landT < 0.16 && moisture > 0.7 && temperature >= 0.42)
          key = 'swamp';
        tiles[`${col},${row}`] = key;
      }
    }

    const riverPaths = buildGeneratedRivers(map, heights, tiles, rand);
    const features = placeGeneratedFeatures(map, tiles, rand);

    for (const city of map.cities) {
      for (let row = city.row - 1; row <= city.row + 1; row += 1) {
        for (let col = city.col - 1; col <= city.col + 1; col += 1) {
          if (col < 0 || row < 0 || col >= map.cols || row >= map.rows) continue;
          if (mapHexDistance(col, row, city.col, city.row) > 1) continue;
          if ((tiles[`${col},${row}`] || 'grass') === 'water') {
            tiles[`${col},${row}`] = 'grass';
          }
        }
      }
    }

    return { tiles, riverPaths, features };
  }

  function buildGeneratedRivers(map, heights, tiles, rand) {
    const waterDist = buildMapWaterDistance(map, tiles);
    let landCount = 0;
    const candidates = [];

    for (let row = 1; row < map.rows - 1; row += 1) {
      for (let col = 1; col < map.cols - 1; col += 1) {
        const key = `${col},${row}`;
        const terrain = tiles[key] || 'grass';
        if (terrain === 'water') continue;
        landCount += 1;
        // Unciv RiverGenerator：源头优先高地，且离水足够远，河流才有长度
        if (terrain !== 'mountain' && terrain !== 'volcano' && terrain !== 'hills')
          continue;
        const fromWater = waterDist.get(key);
        if (fromWater !== undefined && fromWater < 3) continue;
        candidates.push({ col, row, h: heights[row][col] });
      }
    }

    candidates.sort((a, b) => b.h - a.h);
    // Unciv：河流数量随陆地面积自适应
    const maxRivers = Math.max(3, Math.min(6, Math.round(landCount / 55)));
    const picked = [];
    for (const candidate of candidates) {
      if (picked.length >= maxRivers) break;
      const tooClose = picked.some(
        (source) => mapHexDistance(source.col, source.row, candidate.col, candidate.row) < 4
      );
      if (!tooClose) picked.push(candidate);
    }

    const rivers = [];
    const usedCells = new Set();

    for (const source of picked) {
      const points = [{ col: source.col, row: source.row }];
      const visited = new Set([`${source.col},${source.row}`]);
      let current = source;
      let ended = false;

      for (let step = 0; step < 56 && !ended; step += 1) {
        if ((tiles[`${current.col},${current.row}`] || 'grass') === 'water') {
          ended = true;
          break;
        }

        let best = null;
        let bestJoin = null;
        for (const direction of MAP_DIRECTIONS) {
          const [nextCol, nextRow] = mapNeighborCell(current.col, current.row, direction);
          if (nextCol < 0 || nextRow < 0 || nextCol >= map.cols || nextRow >= map.rows) {
            continue;
          }
          const key = `${nextCol},${nextRow}`;
          if (visited.has(key)) continue;
          const candidate = {
            col: nextCol,
            row: nextRow,
            h: heights[nextRow][nextCol],
            join: (tiles[key] || 'grass') === 'water' || usedCells.has(key),
          };
          // 优先汇入海洋或既有河流（Unciv 式支流汇合），否则走最低梯度
          if (candidate.join) {
            if (!bestJoin || candidate.h < bestJoin.h) bestJoin = candidate;
            continue;
          }
          if (!best || candidate.h < best.h) best = candidate;
        }
        // 洼地逃生：没有更低邻格时允许小幅爬升，避免河流困死在盆地
        const currentH = heights[current.row][current.col];
        const next = bestJoin || (best && best.h <= currentH + 0.02 ? best : null);
        if (!next) break;

        visited.add(`${next.col},${next.row}`);
        points.push({ col: next.col, row: next.row });
        current = next;
        if (next.join) {
          ended = true;
          break;
        }
      }

      if (ended && points.length >= 3) {
        for (const point of points) usedCells.add(`${point.col},${point.row}`);
        rivers.push({
          id: makeId(),
          kind: 'river',
          points,
        });
      }
    }

    return rivers;
  }

  function placeGeneratedFeatures(map, tiles, rand) {
    const features = {};
    const pools = { shore: [], open: [], rough: [], cold: [] };

    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        const key = `${col},${row}`;
        const terrain = tiles[key] || 'grass';
        if (terrain === 'water') continue;
        let hasWaterNeighbor = false;
        for (const direction of MAP_DIRECTIONS) {
          const [nextCol, nextRow] = mapNeighborCell(col, row, direction);
          if (nextCol < 0 || nextRow < 0 || nextCol >= map.cols || nextRow >= map.rows)
            continue;
          if ((tiles[`${nextCol},${nextRow}`] || 'grass') === 'water') {
            hasWaterNeighbor = true;
            break;
          }
        }
        if (terrain === 'hills' || terrain === 'mountain') pools.rough.push({ col, row });
        else if (
          hasWaterNeighbor &&
          ['grass', 'plains', 'desert', 'snow'].includes(terrain)
        )
          pools.shore.push({ col, row });
        else if (terrain === 'snow' || terrain === 'desert') pools.cold.push({ col, row });
        else if (terrain === 'grass' || terrain === 'plains' || terrain === 'forest' || terrain === 'swamp')
          pools.open.push({ col, row });
      }
    }

    const shuffle = (list) => {
      for (let i = list.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    };
    Object.values(pools).forEach(shuffle);

    // Unciv MapRegions 思想：按地貌分配地标，让生成结果自带故事锚点
    const plans = [
      { pool: 'rough', options: ['fortress', 'danger'] },
      { pool: 'shore', options: ['port'] },
      { pool: 'open', options: ['ruins', 'camp', 'temple'] },
      { pool: 'cold', options: ['stones', 'danger'] },
    ];
    const landTotal =
      pools.shore.length + pools.open.length + pools.rough.length + pools.cold.length;
    const target = Math.max(4, Math.min(8, Math.round(landTotal / 38)));
    const placed = [];

    const farEnough = (cell) =>
      placed.every((p) => mapHexDistance(p.col, p.row, cell.col, cell.row) >= 3) &&
      map.cities.every(
        (city) => mapHexDistance(city.col, city.row, cell.col, cell.row) >= 2
      );

    const queue = plans.filter((plan) => pools[plan.pool].length > 0);
    let guard = target * 12;
    while (placed.length < target && guard > 0 && queue.length) {
      guard -= 1;
      const plan = queue.shift();
      const pool = pools[plan.pool];
      let cell = null;
      while (pool.length) {
        const candidate = pool.pop();
        if (farEnough(candidate)) {
          cell = candidate;
          break;
        }
      }
      if (!cell) continue;
      const featureKey = plan.options[Math.floor(rand() * plan.options.length)];
      features[`${cell.col},${cell.row}`] = featureKey;
      placed.push(cell);
      if (pool.length > 0) queue.push(plan);
    }

    return features;
  }

  function generateMapTerrain() {
    const editor = state.mapEditor;
    if (!editor) return;
    openConfirm({
      title: '生成一片灵感大陆？',
      message:
        '会按大陆轮廓、气候与湿度随机重绘地形，自动校准海陆比例，让河流从高地汇流入海，并按地貌布置少量地标（会覆盖手动地标，城市保留）。可以用撤销找回。',
      okLabel: '生成地形',
      onConfirm: () => {
        const editorNow = state.mapEditor;
        if (!editorNow) return;
        const { tiles, riverPaths, features } = generateMapTerrainDraft(
          editorNow.draft
        );
        editorNow.draft.tiles = tiles;
        editorNow.draft.features = features;
        const keptPaths = (editorNow.draft.paths || []).filter(
          (path) => path.kind !== 'river'
        );
        editorNow.draft.paths = keptPaths.concat(riverPaths);
        pushMapHistory();
        renderMapCanvas();
        renderMapInspector();
        syncMapDirtyUi();
        showToast('已生成大陆、水系与地标，继续调整或撤销');
      },
    });
  }

  function exportMapPng() {
    const editor = state.mapEditor;
    if (!editor) return;

    const novel = findNovel(editor.novelId);
    const entries = novel && novel.entries[editor.sectionKey];
    const entry = entries
      ? entries.find((item) => item.id === editor.entryId)
      : null;
    const baseName = (entry ? entry.title : '地图')
      .replace(/[\\/:*?"<>|]/g, '')
      .slice(0, 40) || '地图';

    const bounds = getMapWorldBounds(editor.draft);
    const padding = 28;
    const scale = 2;
    const width = Math.round((bounds.width + padding * 2) * scale);
    const height = Math.round((bounds.height + padding * 2) * scale);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', getMapViewBox(editor.draft, padding));
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.innerHTML =
      `<style>.map-city-label{fill:#293044;font-family:-apple-system,'Segoe UI','Microsoft YaHei','PingFang SC',sans-serif;font-size:15px;font-weight:600;paint-order:stroke;stroke:rgba(255,255,255,.86);stroke-width:4px;stroke-linejoin:round}</style>` +
      `<rect x="${roundMapCoordinate(bounds.minX - padding)}" y="${roundMapCoordinate(
        bounds.minY - padding
      )}" width="${roundMapCoordinate(bounds.width + padding * 2)}" height="${roundMapCoordinate(
        bounds.height + padding * 2
      )}" fill="#eef2f8"/>` +
      buildMapMarkup(editor.draft);

    const blob = new Blob([svg.outerHTML], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.fillStyle = '#eef2f8';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          showToast('导出失败，请重试', 'error');
          return;
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pngBlob);
        link.download = `${baseName}.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 4000);
        showToast('地图已导出为 PNG');
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('导出失败，请重试', 'error');
    };
    image.src = url;
  }

  function attemptCloseMapEditor() {
    const editor = state.mapEditor;
    if (!editor) {
      els.mapDialog.close();
      return;
    }
    const dirty = JSON.stringify(editor.draft) !== editor.history[0];
    if (!dirty) {
      els.mapDialog.close();
      return;
    }

    openConfirm({
      title: '放弃这次地图改动？',
      message: '尚未保存的地形与城市会丢失。',
      okLabel: '放弃改动',
      onConfirm: () => {
        els.mapDialog.close();
      },
    });
  }

  function saveMapEditor() {
    const editor = state.mapEditor;
    if (!editor) return;
    commitMapCityName();
    cancelPendingMapPath();

    const novel = findNovel(editor.novelId);
    const entries = novel && novel.entries[editor.sectionKey];
    const entry = entries
      ? entries.find((item) => item.id === editor.entryId)
      : null;

    if (!novel || !entry) {
      els.mapDialog.close();
      showToast('这个地点已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const map = normalizeMap(JSON.parse(JSON.stringify(editor.draft))) || defaultMap();
    const now = new Date().toISOString();
    const previous = state.novels;
    const nextEntries = novel.entries[editor.sectionKey].map((item) =>
      item.id === editor.entryId ? { ...item, map, updatedAt: now } : item
    );

    state.novels = state.novels.map((item) =>
      item.id === editor.novelId
        ? {
            ...item,
            updatedAt: now,
            entries: { ...item.entries, [editor.sectionKey]: nextEntries },
          }
        : item
    );

    if (!persist()) {
      state.novels = previous;
      return;
    }

    els.mapDialog.close();
    refreshCurrentView();
    showToast('地图已保存');
  }

  function getMapAreaCity(editor) {
    if (!editor || editor.tool !== 'city' || !editor.selectedCityId) return null;
    const city = editor.draft.cities.find(
      (item) => item.id === editor.selectedCityId
    );
    return city && city.customArea ? city : null;
  }

  function applyMapAreaCell(city, cell, add) {
    const editor = state.mapEditor;
    if (!editor || !city || !cell) return;
    const key = `${cell.col},${cell.row}`;
    const set = new Set(city.cells || []);
    if (add) {
      if (set.has(key)) return;
      set.add(key);
    } else {
      if (!set.has(key)) return;
      set.delete(key);
    }
    city.cells = [...set];

    if (!editor.areaRenderQueued) {
      editor.areaRenderQueued = true;
      requestAnimationFrame(() => {
        editor.areaRenderQueued = false;
        renderMapCanvas();
      });
    }
    syncMapDirtyUi();
  }

  function handleMapPointerDown(event) {
    const editor = state.mapEditor;
    if (!editor || !els.mapDialog.open) return;
    if (event.button !== 0 && event.button !== 1) return;
    event.preventDefault();

    const cityEl = event.target.closest('.map-city-marker');
    const pathEl =
      editor.tool === 'browse'
        ? event.target.closest('.map-path-item')
        : null;
    const cell = eventToMapCell(event);
    const pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      cell,
      cityId: cityEl ? cityEl.dataset.cityId : null,
      pathId: pathEl ? pathEl.dataset.pathId : null,
      mode: 'idle',
      lastPaintKey: null,
    };

    const areaCity = getMapAreaCity(editor);
    const wantsPan =
      event.button === 1 ||
      event.shiftKey ||
      editor.tool === 'browse' ||
      (editor.tool === 'city' && !areaCity);

    if (cityEl) {
      pointer.mode = 'pending';
    } else if (areaCity) {
      if (cell) {
        const key = `${cell.col},${cell.row}`;
        pointer.mode = 'area';
        pointer.areaCityId = areaCity.id;
        pointer.areaAdd = !(areaCity.cells || []).includes(key);
        pointer.lastPaintKey = key;
        applyMapAreaCell(areaCity, cell, pointer.areaAdd);
      } else {
        pointer.mode = 'idle';
      }
    } else if (wantsPan) {
      pointer.mode = 'pending';
    } else if (editor.tool === 'river' || editor.tool === 'road') {
      pointer.mode = 'pending';
    } else if (editor.tool === 'eyedropper') {
      pointer.mode = 'pending';
    } else {
      pointer.mode = 'paint';
      editor.strokeSnapshot = JSON.stringify(editor.draft);
      paintMapCellAt(cell, pointer);
    }

    editor.pointer = pointer;
    els.mapSvg.setPointerCapture(event.pointerId);
  }

  function handleMapPointerMove(event) {
    const editor = state.mapEditor;
    const pointer = editor && editor.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;

    const dx = event.clientX - pointer.lastX;
    const dy = event.clientY - pointer.lastY;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;

    if (pointer.mode === 'pending') {
      if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 5) {
        if (editor.tool === 'river' || editor.tool === 'road') {
          pointer.mode = 'path-draw';
          appendPendingMapPathPoint(pointer.cell);
        } else {
          pointer.mode = 'pan';
          els.mapStage.classList.add('is-panning');
        }
      }
    }

    if (pointer.mode === 'pan') {
      editor.view.tx += dx;
      editor.view.ty += dy;
      applyMapView();
    } else if (pointer.mode === 'paint') {
      paintMapCellAt(eventToMapCell(event), pointer);
    } else if (pointer.mode === 'area') {
      const cell = eventToMapCell(event);
      if (!cell) return;
      const key = `${cell.col},${cell.row}`;
      if (pointer.lastPaintKey === key) return;
      pointer.lastPaintKey = key;
      const areaCity = editor.draft.cities.find(
        (item) => item.id === pointer.areaCityId
      );
      if (!areaCity) return;
      applyMapAreaCell(areaCity, cell, pointer.areaAdd);
    } else if (pointer.mode === 'path-draw') {
      const cell = eventToMapCell(event);
      if (!cell) return;
      const key = `${cell.col},${cell.row}`;
      if (pointer.lastPaintKey === key) return;
      pointer.lastPaintKey = key;
      appendPendingMapPathPoint(cell);
    }
  }

  function handleMapPointerUp(event) {
    const editor = state.mapEditor;
    const pointer = editor && editor.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;

    if (pointer.mode === 'paint') {
      const snapshot = JSON.stringify(editor.draft);
      const changed = editor.strokeSnapshot !== snapshot;
      editor.strokeSnapshot = null;
      if (changed) pushMapHistory(snapshot);
    } else if (pointer.mode === 'area') {
      pushMapHistory();
      renderMapCanvas();
      const areaCity = editor.draft.cities.find(
        (item) => item.id === pointer.areaCityId
      );
      if (areaCity) syncMapCityControls(areaCity);
    } else if (pointer.mode === 'pending') {
      if (pointer.cityId) {
        selectMapCity(pointer.cityId);
      } else if (pointer.pathId) {
        selectMapPath(pointer.pathId);
      } else if (editor.tool === 'city') {
        addMapCityAtCell(pointer.cell);
      } else if (editor.tool === 'river' || editor.tool === 'road') {
        appendPendingMapPathPoint(pointer.cell);
      } else if (editor.tool === 'eyedropper') {
        pickTerrainAtCell(pointer.cell);
      } else if (editor.tool === 'browse') {
        selectMapCity(null);
        selectMapPath(null);
      }
    }

    if (els.mapSvg.hasPointerCapture(event.pointerId)) {
      els.mapSvg.releasePointerCapture(event.pointerId);
    }
    editor.pointer = null;
    els.mapStage.classList.remove('is-panning');
  }

  function handleMapPointerCancel(event) {
    const editor = state.mapEditor;
    const pointer = editor && editor.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    editor.pointer = null;
    editor.strokeSnapshot = null;
    els.mapStage.classList.remove('is-panning');
  }

  function handleMapWheel(event) {
    const editor = state.mapEditor;
    if (!editor || !els.mapDialog.open) return;
    event.preventDefault();

    const rect = els.mapSvg.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const factor = Math.exp(-event.deltaY * 0.0016);
    zoomMapAt(px, py, editor.view.scale * factor);
  }

  /* ---------- Delete / pin ---------- */

  function askDeleteNovel(novelId) {
    const novel = findNovel(novelId);
    if (!novel) {
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const total = countNovelEntries(novel);
    openConfirm({
      title: '把这本小说移入回收站？',
      message:
        total > 0
          ? `「${novel.title}」以及其中的 ${total} 条内容会移入回收站，之后可以恢复。`
          : `「${novel.title}」会移入回收站，之后可以恢复。`,
      okLabel: '移入回收站',
      onConfirm: () => deleteNovel(novelId),
    });
  }

  function deleteNovel(novelId) {
    const novel = findNovel(novelId);
    if (!novel) {
      refreshCurrentView();
      return;
    }

    const previousNovels = state.novels;
    const previousTrash = state.trash;
    const index = state.novels.findIndex((item) => item.id === novelId);
    const trashItem = {
      id: makeId(),
      type: 'novel',
      deletedAt: new Date().toISOString(),
      novelId: novel.id,
      novelTitle: novel.title,
      sectionKey: null,
      sectionLabel: null,
      entryId: null,
      entryTitle: null,
      index: Math.max(index, 0),
      payload: novel,
    };

    state.novels = state.novels.filter((item) => item.id !== novelId);
    state.trash = [trashItem, ...state.trash];

    if (!persist()) {
      state.novels = previousNovels;
      state.trash = previousTrash;
      return;
    }

    const wasCurrent =
      state.route &&
      state.route.view !== 'shelf' &&
      state.route.novel &&
      state.route.novel.id === novelId;

    if (wasCurrent) {
      if (window.location.hash === '#/' || window.location.hash === '') {
        refreshCurrentView();
      } else {
        window.location.hash = '#/';
      }
    } else {
      refreshCurrentView();
    }

    showToast('小说已移入回收站，可在左侧回收站恢复');
  }

  function askDeleteEntry(novelId, sectionKey, entryId) {
    const novel = findNovel(novelId);
    const entry = novel
      ? novel.entries[sectionKey].find((item) => item.id === entryId)
      : null;

    if (!novel || !entry) {
      showToast('这条内容已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const config = SECTIONS[sectionKey];
    openConfirm({
      title: `把这个${config.singular}移入回收站？`,
      message: `「${entry.title}」会从「${novel.title}」移入回收站，之后可以恢复。`,
      okLabel: '移入回收站',
      onConfirm: () => deleteEntry(novelId, sectionKey, entryId),
    });
  }

  function deleteEntry(novelId, sectionKey, entryId) {
    const novel = findNovel(novelId);
    if (!novel) {
      refreshCurrentView();
      return;
    }

    const list = novel.entries[sectionKey];
    const index = list.findIndex((item) => item.id === entryId);
    if (index === -1) {
      refreshCurrentView();
      return;
    }

    const entry = list[index];
    const previousNovels = state.novels;
    const previousTrash = state.trash;
    const now = new Date().toISOString();
    const nextEntries = list.filter((item) => item.id !== entryId);
    const trashItem = {
      id: makeId(),
      type: 'entry',
      deletedAt: now,
      novelId: novel.id,
      novelTitle: novel.title,
      sectionKey,
      sectionLabel: SECTIONS[sectionKey].label,
      entryId: entry.id,
      entryTitle: entry.title,
      index,
      payload: entry,
    };

    state.novels = state.novels.map((item) =>
      item.id === novelId
        ? {
            ...item,
            updatedAt: now,
            entries: { ...item.entries, [sectionKey]: nextEntries },
          }
        : item
    );
    state.trash = [trashItem, ...state.trash];

    if (!persist()) {
      state.novels = previousNovels;
      state.trash = previousTrash;
      return;
    }

    const route = state.route;
    const wasOnEntryDetail =
      route.view === 'entry' &&
      route.entry &&
      route.entry.id === entryId;

    if (wasOnEntryDetail) {
      window.location.hash = sectionHash(novelId, sectionKey);
    } else {
      refreshCurrentView();
    }

    showToast('已移入回收站，可在左侧回收站恢复');
  }

  function findTrashItem(trashId) {
    return state.trash.find((item) => item.id === trashId) || null;
  }

  function restoreTrashItem(trashId) {
    const item = findTrashItem(trashId);
    if (!item) {
      renderTrash();
      return;
    }

    const previousNovels = state.novels;
    const previousTrash = state.trash;

    if (item.type === 'novel') {
      let novel = item.payload;
      let renamed = false;
      if (findNovel(novel.id)) {
        novel = { ...novel, id: makeId() };
        renamed = true;
      }

      const nextNovels = [...state.novels];
      const index = Math.min(Math.max(item.index, 0), nextNovels.length);
      nextNovels.splice(index, 0, novel);
      state.novels = nextNovels;

      if (renamed) {
        state.trash = state.trash.map((entry) =>
          entry.type === 'entry' && entry.novelId === item.novelId
            ? { ...entry, novelId: novel.id }
            : entry
        );
      }
    } else {
      const novel = findNovel(item.novelId);
      if (!novel) {
        showToast('所属小说已不在书架，请先恢复小说', 'error');
        renderTrash();
        return;
      }

      const list = novel.entries[item.sectionKey];
      let entry = item.payload;
      if (list.some((current) => current.id === entry.id)) {
        entry = { ...entry, id: makeId() };
      }

      const nextList = [...list];
      const index = Math.min(Math.max(item.index, 0), nextList.length);
      nextList.splice(index, 0, entry);
      const now = new Date().toISOString();

      state.novels = state.novels.map((current) =>
        current.id === novel.id
          ? {
              ...current,
              updatedAt: now,
              entries: { ...current.entries, [item.sectionKey]: nextList },
            }
          : current
      );
    }

    state.trash = state.trash.filter((entry) => entry.id !== trashId);

    if (!persist()) {
      state.novels = previousNovels;
      state.trash = previousTrash;
      return;
    }

    renderTrash();
    showToast(
      item.type === 'novel'
        ? `《${item.payload.title}》已恢复到书架`
        : `${item.sectionLabel || '词条'}「${item.entryTitle}」已恢复`
    );
  }

  function askPurgeTrashItem(trashId) {
    const item = findTrashItem(trashId);
    if (!item) {
      renderTrash();
      return;
    }

    const isNovel = item.type === 'novel';
    const title = isNovel ? item.payload.title : item.entryTitle;
    const relatedEntries = isNovel
      ? state.trash.filter(
          (entry) => entry.type === 'entry' && entry.novelId === item.novelId
        ).length
      : 0;
    const relatedNote =
      relatedEntries > 0
        ? ` 同时会删除它的 ${relatedEntries} 条词条回收记录。`
        : '';

    openConfirm({
      title: '彻底删除这项内容？',
      message: isNovel
        ? `「${title}」将从回收站中永久删除，无法恢复。${relatedNote}`
        : `「${title}」将从回收站中永久删除，无法恢复。`,
      okLabel: '彻底删除',
      onConfirm: () => purgeTrashItem(trashId),
    });
  }

  function purgeTrashItem(trashId) {
    const item = findTrashItem(trashId);
    if (!item) {
      renderTrash();
      return;
    }

    const previousTrash = state.trash;
    state.trash = state.trash.filter((entry) => {
      if (entry.id === trashId) return false;
      if (
        item.type === 'novel' &&
        entry.type === 'entry' &&
        entry.novelId === item.novelId
      ) {
        return false;
      }
      return true;
    });

    if (!persist()) {
      state.trash = previousTrash;
      return;
    }

    renderTrash();
    showToast('已彻底删除');
  }

  function askClearTrash() {
    if (state.trash.length === 0) return;

    openConfirm({
      title: '清空回收站？',
      message: `回收站里的 ${state.trash.length} 项内容将被永久删除，无法恢复。`,
      okLabel: '清空回收站',
      onConfirm: clearTrash,
    });
  }

  function clearTrash() {
    const previousTrash = state.trash;
    state.trash = [];

    if (!persist()) {
      state.trash = previousTrash;
      return;
    }

    renderTrash();
    showToast('回收站已清空');
  }

  function toggleNovelPin(novelId) {
    const novel = findNovel(novelId);
    if (!novel) {
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const previous = state.novels;
    state.novels = state.novels.map((item) =>
      item.id === novelId ? { ...item, pinned: !item.pinned } : item
    );

    if (!persist()) {
      state.novels = previous;
      return;
    }

    const wasPinned = novel.pinned;
    refreshCurrentView();
    showToast(wasPinned ? '已取消置顶' : '小说已置顶');
    focusNovelPin(novelId);
  }

  function focusNovelPin(novelId) {
    const button =
      state.route && state.route.view === 'shelf'
        ? els.novelGrid.querySelector(
            `[data-action="pin-novel"][data-novel-id="${cssEscape(novelId)}"]`
          )
        : els.novelPinBtn;
    if (button) button.focus({ preventScroll: true });
  }

  function toggleEntryPin(novelId, sectionKey, entryId) {
    const novel = findNovel(novelId);
    const entry = novel
      ? novel.entries[sectionKey].find((item) => item.id === entryId)
      : null;

    if (!novel || !entry) {
      showToast('这条内容已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const previous = state.novels;
    const nextEntries = novel.entries[sectionKey].map((item) =>
      item.id === entryId ? { ...item, pinned: !item.pinned } : item
    );

    state.novels = state.novels.map((item) =>
      item.id === novelId
        ? { ...item, entries: { ...item.entries, [sectionKey]: nextEntries } }
        : item
    );

    if (!persist()) {
      state.novels = previous;
      return;
    }

    const wasPinned = entry.pinned;
    refreshCurrentView();
    showToast(wasPinned ? '已取消置顶' : `${SECTIONS[sectionKey].singular}已置顶`);

    const button = els.workspaceContent.querySelector(
      `[data-action="pin-entry"][data-entry-id="${cssEscape(entryId)}"]`
    );
    if (button) button.focus({ preventScroll: true });
  }

  /* ---------- Confirm ---------- */

  function openConfirm({ title, message, okLabel, onConfirm }) {
    if (els.confirmDialog.open) return;

    state.confirmAction = typeof onConfirm === 'function' ? onConfirm : null;
    els.confirmTitle.textContent = title;
    els.confirmMessage.textContent = message;
    els.confirmOkBtn.textContent = okLabel;
    els.confirmDialog.showModal();
    requestAnimationFrame(() => els.confirmCancelBtn.focus());
  }

  function resolveConfirm(runAction) {
    const action = state.confirmAction;
    state.confirmAction = null;
    els.confirmDialog.close();
    if (runAction && action) action();
  }

  /* ---------- Comments ---------- */

  function canCommentOnRoute(route) {
    return Boolean(route && !['comments', 'publish', 'missing'].includes(route.view));
  }

  function commentTargetKey(target) {
    return `${target.kind}|${target.hash}|${target.anchor}`;
  }

  function buildCommentTarget({
    kind,
    hash,
    anchor = 'page',
    novelId = null,
    sectionKey = null,
    entryId = null,
    block = null,
    label,
    novelTitle = '',
    sectionLabel = '',
    entryTitle = '',
  }) {
    return {
      kind,
      hash,
      anchor,
      novelId,
      sectionKey,
      entryId,
      block,
      label: label || '原位置',
      novelTitle,
      sectionLabel,
      entryTitle,
    };
  }

  function createCommentCandidate(target, optionLabel, group) {
    return {
      key: commentTargetKey(target),
      optionLabel,
      group,
      target,
    };
  }

  function getCommentTargetCandidates(route) {
    if (!canCommentOnRoute(route)) return [];
    const candidates = [];

    if (route.view === 'shelf') {
      const pageTarget = buildCommentTarget({
        kind: 'page',
        hash: '#/',
        label: '我的书架',
      });
      candidates.push(
        createCommentCandidate(pageTarget, '本页 · 我的书架', 'page')
      );

      for (const novel of getVisibleNovels()) {
        const target = buildCommentTarget({
          kind: 'novel',
          hash: novelHash(novel.id),
          novelId: novel.id,
          novelTitle: novel.title,
          label: `《${novel.title}》`,
        });
        candidates.push(
          createCommentCandidate(target, `小说 · 《${novel.title}》`, 'detail')
        );
      }
      return candidates;
    }

    if (route.view === 'trash') {
      const target = buildCommentTarget({
        kind: 'page',
        hash: '#/trash',
        label: '回收站',
      });
      return [createCommentCandidate(target, '本页 · 回收站', 'page')];
    }

    const novel = route.novel;
    if (!novel) return [];

    if (route.view === 'outline-editor') {
      const editing = Boolean(route.entry);
      const title = editing ? route.entry.title : '新增大纲';
      const target = buildCommentTarget({
        kind: editing ? 'entry' : 'page',
        hash: editing
          ? outlineEditorHash(novel.id, route.entry.id)
          : sectionHash(novel.id, 'outline'),
        novelId: novel.id,
        sectionKey: 'outline',
        entryId: editing ? route.entry.id : null,
        label: editing ? `大纲编辑 · ${title}` : `大纲 · 《${novel.title}》`,
        novelTitle: novel.title,
        sectionLabel: SECTIONS.outline.label,
        entryTitle: editing ? title : '',
      });
      return [
        createCommentCandidate(
          target,
          editing ? `本页 · 大纲编辑` : `本页 · 大纲列表`,
          'page'
        ),
      ];
    }

    if (route.view === 'novel') {
      const pageTarget = buildCommentTarget({
        kind: 'page',
        hash: novelHash(novel.id),
        novelId: novel.id,
        label: `《${novel.title}》 · 概览`,
        novelTitle: novel.title,
      });
      candidates.push(
        createCommentCandidate(pageTarget, '本页 · 故事概览', 'page')
      );

      for (const key of SECTION_KEYS) {
        const config = SECTIONS[key];
        const target = buildCommentTarget({
          kind: 'section',
          hash: sectionHash(novel.id, key),
          novelId: novel.id,
          sectionKey: key,
          label: `${config.label} · 《${novel.title}》`,
          novelTitle: novel.title,
          sectionLabel: config.label,
        });
        candidates.push(
          createCommentCandidate(target, `分区 · ${config.label}`, 'detail')
        );
      }
      return candidates;
    }

    if (route.view === 'section') {
      const config = SECTIONS[route.sectionKey];
      const pageTarget = buildCommentTarget({
        kind: 'page',
        hash: sectionHash(novel.id, route.sectionKey),
        novelId: novel.id,
        sectionKey: route.sectionKey,
        label: `${config.label} · 《${novel.title}》`,
        novelTitle: novel.title,
        sectionLabel: config.label,
      });
      candidates.push(
        createCommentCandidate(
          pageTarget,
          `本页 · ${config.label}列表`,
          'page'
        )
      );

      for (const entry of sortEntries(novel.entries[route.sectionKey])) {
        const target = buildCommentTarget({
          kind: 'entry-card',
          hash: sectionHash(novel.id, route.sectionKey),
          anchor: `entry:${entry.id}`,
          novelId: novel.id,
          sectionKey: route.sectionKey,
          entryId: entry.id,
          label: `${config.label} · ${entry.title}`,
          novelTitle: novel.title,
          sectionLabel: config.label,
          entryTitle: entry.title,
        });
        candidates.push(
          createCommentCandidate(target, `细目 · ${entry.title}`, 'detail')
        );
      }
      return candidates;
    }

    if (route.view === 'entry') {
      const config = SECTIONS[route.sectionKey];
      const entry = route.entry;
      const pageTarget = buildCommentTarget({
        kind: 'page',
        hash: entryHash(novel.id, route.sectionKey, entry.id),
        novelId: novel.id,
        sectionKey: route.sectionKey,
        entryId: entry.id,
        label: `${config.label} · ${entry.title}`,
        novelTitle: novel.title,
        sectionLabel: config.label,
        entryTitle: entry.title,
      });
      candidates.push(
        createCommentCandidate(pageTarget, `本页 · ${entry.title}`, 'page')
      );

      if (entry.summary) {
        const summaryTarget = buildCommentTarget({
          kind: 'block',
          hash: entryHash(novel.id, route.sectionKey, entry.id),
          anchor: 'block:summary',
          block: 'summary',
          novelId: novel.id,
          sectionKey: route.sectionKey,
          entryId: entry.id,
          label: `简介 · ${entry.title}`,
          novelTitle: novel.title,
          sectionLabel: config.label,
          entryTitle: entry.title,
        });
        candidates.push(
          createCommentCandidate(summaryTarget, '段落 · 简介', 'detail')
        );
      }

      const notesTarget = buildCommentTarget({
        kind: 'block',
        hash: entryHash(novel.id, route.sectionKey, entry.id),
        anchor: 'block:notes',
        block: 'notes',
        novelId: novel.id,
        sectionKey: route.sectionKey,
        entryId: entry.id,
        label: `${config.notesLabel} · ${entry.title}`,
        novelTitle: novel.title,
        sectionLabel: config.label,
        entryTitle: entry.title,
      });
      candidates.push(
        createCommentCandidate(notesTarget, `段落 · ${config.notesLabel}`, 'detail')
      );

      if (route.sectionKey === 'maps') {
        const mapTarget = buildCommentTarget({
          kind: 'block',
          hash: entryHash(novel.id, route.sectionKey, entry.id),
          anchor: 'block:map',
          block: 'map',
          novelId: novel.id,
          sectionKey: route.sectionKey,
          entryId: entry.id,
          label: `地图 · ${entry.title}`,
          novelTitle: novel.title,
          sectionLabel: config.label,
          entryTitle: entry.title,
        });
        candidates.push(
          createCommentCandidate(mapTarget, '段落 · 地图画布', 'detail')
        );
      }

      return candidates;
    }

    return [];
  }

  function formatCommentTargetPath(target) {
    if (!target) return '未选择位置';
    if (!target.novelId) {
      if (target.hash === '#/') return '我的书架';
      if (target.hash === '#/trash') return '回收站';
      return target.label || '页面';
    }

    const parts = [
      `《${target.novelTitle || '未命名小说'}》`,
    ];
    if (target.sectionKey && SECTIONS[target.sectionKey]) {
      parts.push(SECTIONS[target.sectionKey].label);
    }
    if (target.entryTitle) parts.push(target.entryTitle);
    if (target.block) {
      const blockLabel =
        target.block === 'notes' && SECTIONS[target.sectionKey]
          ? SECTIONS[target.sectionKey].notesLabel
          : COMMENT_BLOCK_LABELS[target.block] || '段落';
      parts.push(blockLabel);
    }
    return parts.join(' / ');
  }

  function describeCommentTarget(target) {
    const novel = target.novelId ? findNovel(target.novelId) : null;
    const sectionConfig = target.sectionKey
      ? SECTIONS[target.sectionKey] || null
      : null;
    const entry =
      novel && sectionConfig && target.entryId
        ? novel.entries[target.sectionKey].find(
            (item) => item.id === target.entryId
          ) || null
        : null;

    let available = true;
    let reason = '';
    if (target.novelId && !novel) {
      available = false;
      reason = '原小说已删除';
    } else if (target.sectionKey && !sectionConfig) {
      available = false;
      reason = '原分区已不存在';
    } else if (target.entryId && !entry) {
      available = false;
      reason = '原词条已删除';
    }

    let label = target.label || '原位置';
    if (target.kind === 'novel' && novel) {
      label = `《${novel.title}》`;
    } else if (target.kind === 'section' && novel && sectionConfig) {
      label = `${sectionConfig.label} · 《${novel.title}》`;
    } else if (target.kind === 'entry-card' && novel && entry) {
      label = `${sectionConfig.label} · ${entry.title}`;
    } else if (target.kind === 'block' && novel && entry) {
      const blockLabel =
        target.block === 'notes' && sectionConfig
          ? sectionConfig.notesLabel
          : COMMENT_BLOCK_LABELS[target.block] || '段落';
      label = `${blockLabel} · ${entry.title}`;
    } else if (target.kind === 'entry' && novel && entry) {
      label = `大纲编辑 · ${entry.title}`;
    } else if (target.kind === 'page' && novel) {
      if (entry && sectionConfig) {
        label = `${sectionConfig.label} · ${entry.title}`;
      } else if (sectionConfig) {
        label = `${sectionConfig.label} · 《${novel.title}》`;
      } else {
        label = `《${novel.title}》 · 概览`;
      }
    } else if (target.kind === 'page' && !target.novelId) {
      if (target.hash === '#/') label = '我的书架';
      else if (target.hash === '#/trash') label = '回收站';
    }

    return { available, reason, label, novel, sectionConfig, entry };
  }

  function countCommentsForTarget(target) {
    const key = commentTargetKey(target);
    return state.comments.filter(
      (comment) => commentTargetKey(comment.target) === key
    ).length;
  }

  function findComment(id) {
    return state.comments.find((comment) => comment.id === id) || null;
  }

  function syncCommentFab(route = state.route) {
    const count = state.comments.length;
    els.commentFab.hidden = !canCommentOnRoute(route);
    els.commentFabCount.textContent = count > 99 ? '99+' : String(count);
    els.commentFabCount.hidden = count === 0;
  }

  function getSelectedCommentTarget() {
    const candidate = state.commentDraft.candidates.find(
      (item) => item.key === state.commentDraft.targetKey
    );
    return candidate ? candidate.target : null;
  }

  function openCommentComposer() {
    const route = state.route;
    if (!canCommentOnRoute(route)) return;
    const candidates = getCommentTargetCandidates(route);
    if (candidates.length === 0) {
      showToast('这个页面暂时没有可以标注的位置', 'error');
      return;
    }

    state.commentDraft = {
      mode: 'create',
      id: null,
      candidates,
      targetKey: candidates[0].key,
      dirty: false,
    };
    populateCommentDialog();
    if (!els.commentDialog.open) els.commentDialog.showModal();
    window.requestAnimationFrame(() => els.commentBodyInput.focus());
  }

  function openCommentEditor(commentId) {
    const comment = findComment(commentId);
    if (!comment) {
      showToast('这条评论已经不在了', 'error');
      return;
    }

    state.commentDraft = {
      mode: 'edit',
      id: comment.id,
      candidates: [createCommentCandidate(comment.target, comment.target.label, 'page')],
      targetKey: commentTargetKey(comment.target),
      dirty: false,
    };
    populateCommentDialog();
    if (!els.commentDialog.open) els.commentDialog.showModal();
    window.requestAnimationFrame(() => {
      els.commentBodyInput.focus();
      els.commentBodyInput.setSelectionRange(
        els.commentBodyInput.value.length,
        els.commentBodyInput.value.length
      );
    });
  }

  function populateCommentDialog() {
    const isEdit = state.commentDraft.mode === 'edit';
    const comment = isEdit ? findComment(state.commentDraft.id) : null;

    els.commentDialogEyebrow.textContent = isEdit
      ? 'MARGIN NOTE · EDIT'
      : 'MARGIN NOTE · NEW';
    els.commentDialogTitle.textContent = isEdit ? '编辑评论' : '写一条评论';
    els.commentTargetField.hidden = isEdit;
    els.commentDeleteBtn.hidden = !isEdit;
    els.commentSaveBtn.textContent = isEdit ? '保存修改' : '保存评论';
    els.commentBodyInput.value = comment ? comment.body : '';
    els.commentBodyError.hidden = true;
    updateCommentBodyState();

    const groups = new Map([
      ['page', { label: '当前页面', items: [] }],
      ['detail', { label: '页面中的细目', items: [] }],
    ]);
    for (const candidate of state.commentDraft.candidates) {
      const group = groups.get(candidate.group) || groups.get('page');
      group.items.push(candidate);
    }

    const fragment = document.createDocumentFragment();
    for (const group of groups.values()) {
      if (group.items.length === 0) continue;
      const optgroup = document.createElement('optgroup');
      optgroup.label = group.label;
      for (const item of group.items) {
        const option = document.createElement('option');
        option.value = item.key;
        option.textContent = item.optionLabel;
        optgroup.appendChild(option);
      }
      fragment.appendChild(optgroup);
    }
    els.commentTargetSelect.replaceChildren(fragment);
    if (state.commentDraft.targetKey) {
      els.commentTargetSelect.value = state.commentDraft.targetKey;
    }
    syncCommentDialogTarget();
  }

  function syncCommentDialogTarget() {
    const target = getSelectedCommentTarget();
    els.commentTargetPath.textContent = formatCommentTargetPath(target);
    if (!target) {
      els.commentTargetNote.textContent = '';
      return;
    }

    if (state.commentDraft.mode === 'edit') {
      els.commentTargetNote.textContent = '编辑时位置保持不变；如需换位置，请删除后重新添加。';
      return;
    }

    const count = countCommentsForTarget(target);
    els.commentTargetNote.textContent =
      count > 0
        ? `这个位置已经有 ${count} 条评论。`
        : '评论会收进左侧的「评论」目录。';
  }

  function updateCommentBodyState() {
    const value = els.commentBodyInput.value;
    els.commentBodyCount.textContent = `${value.length} 字`;
    els.commentBodyError.hidden = true;
    els.commentSaveBtn.disabled = value.trim().length === 0;
  }

  function attemptCloseCommentDialog() {
    if (!els.commentDialog.open) return;
    if (!state.commentDraft.dirty) {
      els.commentDialog.close();
      return;
    }

    openConfirm({
      title: '放弃这条评论？',
      message: '尚未保存的评论内容会丢失。',
      okLabel: '放弃评论',
      onConfirm: () => {
        state.commentDraft.dirty = false;
        els.commentDialog.close();
      },
    });
  }

  function saveComment() {
    const body = els.commentBodyInput.value
      .replace(/\r\n?/g, '\n')
      .trim()
      .slice(0, COMMENT_MAX_LENGTH);
    if (!body) {
      els.commentBodyError.hidden = false;
      els.commentBodyInput.focus();
      return;
    }

    if (state.commentDraft.mode === 'edit') {
      const id = state.commentDraft.id;
      const current = findComment(id);
      if (!current) {
        els.commentDialog.close();
        showToast('这条评论已经不在了', 'error');
        return;
      }

      const previous = state.comments;
      state.comments = state.comments.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              body,
              updatedAt: new Date().toISOString(),
            }
          : comment
      );
      if (!persist()) {
        state.comments = previous;
        return;
      }

      state.commentDraft.dirty = false;
      els.commentDialog.close();
      afterCommentMutation();
      showToast('评论已更新');
      return;
    }

    const target = getSelectedCommentTarget();
    if (!target) {
      showToast('请选择评论的位置', 'error');
      return;
    }

    const now = new Date().toISOString();
    const comment = {
      id: makeId(),
      body,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      target: { ...target },
    };
    const previous = state.comments;
    state.comments = [comment, ...state.comments].slice(0, COMMENT_MAX_COUNT);
    if (!persist()) {
      state.comments = previous;
      return;
    }

    state.commentDraft.dirty = false;
    els.commentDialog.close();
    afterCommentMutation();
    showToast('评论已保存');
  }

  function afterCommentMutation() {
    renderSidebar(state.route);
    syncCommentFab(state.route);
    if (state.route && state.route.view === 'comments') {
      renderComments();
    }
  }

  function askDeleteComment(commentId) {
    const comment = findComment(commentId);
    if (!comment) return;
    openConfirm({
      title: '删除这条评论？',
      message: '删除后会从评论目录中移除，无法恢复。',
      okLabel: '删除评论',
      onConfirm: () => deleteComment(commentId),
    });
  }

  function deleteComment(commentId) {
    const previous = state.comments;
    state.comments = state.comments.filter(
      (comment) => comment.id !== commentId
    );
    if (state.comments.length === previous.length) return;
    if (!persist()) {
      state.comments = previous;
      return;
    }

    if (state.commentDraft.id === commentId) {
      state.commentDraft.dirty = false;
      if (els.commentDialog.open) els.commentDialog.close();
    }
    afterCommentMutation();
    showToast('评论已删除');
  }

  function matchesCommentQuery(comment, query) {
    if (!query) return true;
    const info = describeCommentTarget(comment.target);
    const haystack = [
      comment.body,
      comment.target.label,
      info.label,
      comment.target.novelTitle,
      comment.target.entryTitle,
      comment.target.sectionLabel,
      formatCommentTargetPath(comment.target),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  }

  function groupComments(comments) {
    const groups = new Map();

    for (const comment of comments) {
      const target = comment.target;
      const key = target.novelId || '__site__';
      if (!groups.has(key)) {
        const novel = target.novelId ? findNovel(target.novelId) : null;
        groups.set(key, {
          key,
          novel,
          title: target.novelId
            ? novel
              ? novel.title
              : `${target.novelTitle || '未知小说'}（已删除）`
            : '书架与回收站',
          comments: [],
        });
      }
      groups.get(key).comments.push(comment);
    }

    return [...groups.values()];
  }

  // 评论状态的唯一写入口：切换必须写 updatedAt，否则多设备按新者胜合并时会回跳
  function setCommentStatus(id, status) {
    const comment = findComment(id);
    if (!comment) {
      showToast('这条评论已经不在了', 'error');
      return;
    }
    const next = status === 'resolved' ? 'resolved' : 'open';
    if ((comment.status || 'open') === next) return;

    const now = new Date().toISOString();
    const previous = state.comments;
    state.comments = state.comments.map((item) =>
      item.id === id ? { ...item, status: next, updatedAt: now } : item
    );
    if (!persist()) {
      state.comments = previous;
      return;
    }
    showToast(next === 'resolved' ? '已标记为已解决' : '已标回待处理');
    refreshCurrentView();
  }

  function renderComments() {
    syncCommentsSearchBox();
    const query = state.commentDirectory.query.trim().toLowerCase();
    const direction = state.commentDirectory.sort === 'oldest' ? 1 : -1;
    const sorted = [...state.comments].sort(
      (a, b) =>
        (timeValue(a.createdAt) - timeValue(b.createdAt)) * direction
    );
    const statusFilter = state.commentDirectory.status;
    const visible = sorted.filter((comment) => {
      if (
        statusFilter !== 'all' &&
        (comment.status || 'open') !== statusFilter
      ) {
        return false;
      }
      return matchesCommentQuery(comment, query);
    });
    const pendingCount = state.comments.filter(
      (comment) => (comment.status || 'open') === 'open'
    ).length;
    const hasComments = state.comments.length > 0;

    els.commentsToolbar.hidden = !hasComments;
    els.commentsStatusFilters.hidden = !hasComments;
    els.commentsCount.hidden = !hasComments;
    els.commentsEmpty.hidden = hasComments;
    els.commentsNoResults.hidden = !hasComments || visible.length > 0;
    els.commentsList.hidden = visible.length === 0;
    els.commentsClearSearchBtn.hidden = !query;
    els.commentsSortSelect.value = state.commentDirectory.sort;
    els.commentsStatusFilters.querySelectorAll('.filter-pill').forEach((button) => {
      const value = button.dataset.commentStatus;
      const active = statusFilter === value;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      const countEl = $('.filter-count', button);
      if (!countEl) return;
      if (value === 'open') countEl.textContent = pendingCount;
      else if (value === 'resolved') {
        countEl.textContent = state.comments.length - pendingCount;
      } else countEl.textContent = state.comments.length;
    });

    if (!hasComments) {
      els.commentsCount.textContent = '还没有评论';
    } else if (visible.length === 0) {
      els.commentsCount.textContent = '没有匹配的评论';
    } else if (query || statusFilter !== 'all') {
      els.commentsCount.textContent = `筛选出 ${visible.length} 条评论`;
    } else {
      els.commentsCount.textContent = `共 ${visible.length} 条评论`;
    }

    const fragment = document.createDocumentFragment();
    for (const group of groupComments(visible)) {
      fragment.appendChild(createCommentGroup(group));
    }
    els.commentsList.replaceChildren(fragment);

    renderSidebar(state.route);
  }

  function createCommentGroup(group) {
    const section = el('section', 'comment-group');
    const head = el('header', 'comment-group-head');

    const titleWrap = el('div', 'comment-group-title');
    const iconWrap = el('span', 'comment-group-icon');
    iconWrap.appendChild(icon(group.novel ? 'i-book' : 'i-comment'));
    titleWrap.appendChild(iconWrap);

    if (group.novel) {
      const link = el('a', 'comment-group-link', group.title);
      link.href = novelHash(group.novel.id);
      titleWrap.appendChild(link);
    } else {
      titleWrap.appendChild(el('span', 'comment-group-name', group.title));
    }

    const count = el(
      'span',
      'comment-group-count',
      `${group.comments.length} 条`
    );
    head.append(titleWrap, count);

    const list = el('div', 'comment-list');
    for (const comment of group.comments) {
      list.appendChild(createCommentCard(comment));
    }
    section.append(head, list);
    return section;
  }

  function createCommentCard(comment) {
    const info = describeCommentTarget(comment.target);
    const resolved = (comment.status || 'open') === 'resolved';
    const card = el(
      'article',
      info.available ? 'comment-card' : 'comment-card is-unavailable'
    );
    if (resolved) card.classList.add('is-resolved');
    card.dataset.commentId = comment.id;

    const head = el('div', 'comment-card-head');
    const targetWrap = el('div', 'comment-target-wrap');
    const chip = el('span', 'comment-target-chip');
    chip.append(icon('i-comment'), el('span', '', info.label));
    targetWrap.appendChild(chip);
    if (resolved) {
      targetWrap.appendChild(el('span', 'comment-resolved-chip', '已解决'));
    }
    if (!info.available) {
      targetWrap.appendChild(
        el('span', 'comment-missing-chip', info.reason || '原位置已不存在')
      );
    }

    const created = new Date(comment.createdAt);
    const updated = new Date(comment.updatedAt);
    const edited = updated.getTime() - created.getTime() > 2000;
    const time = document.createElement('time');
    time.className = 'comment-time';
    time.dateTime = comment.updatedAt;
    time.title = `创建于 ${fullDate(created)}${
      edited ? ` · 更新于 ${fullDate(updated)}` : ''
    }`;
    time.textContent = edited
      ? `编辑于 ${relativeDate(updated)}`
      : `评论于 ${relativeDate(created)}`;
    head.append(targetWrap, time);

    const body = el('p', 'comment-body', comment.body);

    const actions = el('div', 'comment-card-actions');
    const statusBtn = el(
      'button',
      `btn ghost comment-status-btn${resolved ? ' is-resolved-btn' : ''}`
    );
    statusBtn.type = 'button';
    statusBtn.dataset.action = 'comment-status';
    statusBtn.dataset.commentId = comment.id;
    statusBtn.dataset.statusValue = resolved ? 'resolved' : 'open';
    statusBtn.setAttribute(
      'aria-label',
      resolved ? '把这条评论标回待处理' : '把这条评论标记为已解决'
    );
    if (!resolved) statusBtn.appendChild(icon('i-check'));
    statusBtn.appendChild(
      document.createTextNode(resolved ? '标为待处理' : '标记完成')
    );

    const jumpBtn = el('button', 'btn ghost comment-jump');
    jumpBtn.type = 'button';
    jumpBtn.dataset.action = 'jump-comment';
    jumpBtn.dataset.commentId = comment.id;
    jumpBtn.disabled = !info.available;
    if (!info.available) jumpBtn.title = info.reason || '原位置已不存在';
    jumpBtn.append(icon('i-arrow-right'), document.createTextNode('跳转定位'));

    const editBtn = el('button', 'btn ghost comment-edit');
    editBtn.type = 'button';
    editBtn.dataset.action = 'edit-comment';
    editBtn.dataset.commentId = comment.id;
    editBtn.append(icon('i-pencil'), document.createTextNode('编辑'));

    const deleteBtn = el('button', 'icon-btn danger-hover');
    deleteBtn.type = 'button';
    deleteBtn.dataset.action = 'delete-comment';
    deleteBtn.dataset.commentId = comment.id;
    deleteBtn.setAttribute('aria-label', '删除这条评论');
    deleteBtn.title = '删除评论';
    deleteBtn.appendChild(icon('i-trash'));

    actions.append(statusBtn, jumpBtn, editBtn, deleteBtn);
    card.append(head, body, actions);
    return card;
  }

  function syncCommentsSearchBox() {
    const hasValue = els.commentsSearchInput.value.length > 0;
    const box = els.commentsSearchInput.closest('.search-box');
    if (box) box.classList.toggle('has-value', hasValue);
    els.commentsSearchClearBtn.hidden = !hasValue;
  }

  function clearCommentSearch({ focus = true } = {}) {
    state.commentDirectory.query = '';
    els.commentsSearchInput.value = '';
    syncCommentsSearchBox();
    renderComments();
    if (focus) els.commentsSearchInput.focus();
  }

  function jumpToComment(commentId) {
    const comment = findComment(commentId);
    if (!comment) return;
    const info = describeCommentTarget(comment.target);
    if (!info.available) {
      showToast(info.reason || '这条评论的原位置已经不存在', 'error');
      return;
    }

    state.pendingCommentFocus = {
      id: comment.id,
      target: { ...comment.target },
    };
    if (window.location.hash === comment.target.hash) {
      applyPendingCommentFocus();
    } else {
      window.location.hash = comment.target.hash;
    }
  }

  function applyPendingCommentFocus() {
    const pending = state.pendingCommentFocus;
    if (!pending) return;
    state.pendingCommentFocus = null;
    const target = pending.target;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (target.kind === 'entry-card' && target.entryId) {
          highlightEntryCard(target.entryId, { scroll: true });
          return;
        }

        const anchor = findCommentAnchorElement(target);
        if (!anchor) {
          showToast('没有找到这条评论的位置', 'error');
          return;
        }

        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        anchor.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'center',
        });
        anchor.classList.add('is-comment-focus');
        window.setTimeout(
          () => anchor.classList.remove('is-comment-focus'),
          2400
        );
      });
    });
  }

  function findCommentAnchorElement(target) {
    const view = document.querySelector('#mainContent .view:not([hidden])');
    if (!view) return null;

    if (target.kind === 'block' && target.block) {
      const block = view.querySelector(
        `[data-comment-anchor="block:${target.block}"]`
      );
      if (block) return block;
    }

    return view.querySelector('[data-comment-anchor="page"]');
  }

  /* ---------- Import / export ---------- */

  async function handleImportFile() {
    const file = els.importFile.files && els.importFile.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rawNovels = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed.novels)
          ? parsed.novels
          : null;
      const rawTrash =
        parsed && !Array.isArray(parsed) && Array.isArray(parsed.trash)
          ? parsed.trash
          : [];
      const rawComments =
        parsed && !Array.isArray(parsed) && Array.isArray(parsed.comments)
          ? parsed.comments
          : [];

      if (!rawNovels && rawTrash.length === 0 && rawComments.length === 0) {
        throw new Error(`这不是 ${SITE_NAME} 的备份文件`);
      }

      const incoming = [];
      const incomingTrash = [];
      const incomingComments = [];
      let skipped = 0;

      for (const raw of rawNovels || []) {
        const result = normalizeNovel(raw);
        if (!result) {
          skipped += 1;
          continue;
        }
        incoming.push(result.novel);
        skipped += result.skippedEntries;
      }

      for (const raw of rawTrash) {
        const item = normalizeTrashItem(raw);
        if (!item) {
          skipped += 1;
          continue;
        }
        incomingTrash.push(item);
      }

      for (const raw of rawComments) {
        const comment = normalizeComment(raw);
        if (!comment) {
          skipped += 1;
          continue;
        }
        incomingComments.push(comment);
      }

      if (
        incoming.length === 0 &&
        incomingTrash.length === 0 &&
        incomingComments.length === 0
      ) {
        throw new Error('文件里没有有效的内容');
      }

      const previousNovels = state.novels;
      const previousTrash = state.trash;
      const previousComments = state.comments;
      const counts = mergeLibraries(incoming);
      const addedTrash = mergeTrash(incomingTrash);
      const commentCounts = mergeComments(incomingComments);
      const changed =
        counts.addedNovels > 0 ||
        counts.updatedNovels > 0 ||
        counts.addedEntries > 0 ||
        counts.updatedEntries > 0 ||
        addedTrash > 0 ||
        commentCounts.added > 0 ||
        commentCounts.updated > 0;

      if (!changed) {
        state.novels = previousNovels;
        state.trash = previousTrash;
        state.comments = previousComments;
        showToast('没有发现需要导入的新内容');
        return;
      }

      if (!persist()) {
        state.novels = previousNovels;
        state.trash = previousTrash;
        state.comments = previousComments;
        return;
      }

      clearShelfFiltersSilently();
      refreshCurrentView();

      const parts = [];
      if (counts.addedNovels) parts.push(`新增 ${counts.addedNovels} 本小说`);
      if (counts.addedEntries) parts.push(`新增 ${counts.addedEntries} 条内容`);
      if (counts.updatedNovels) parts.push(`更新 ${counts.updatedNovels} 本小说`);
      if (counts.updatedEntries) parts.push(`更新 ${counts.updatedEntries} 条内容`);
      if (addedTrash) parts.push(`回收站 ${addedTrash} 项`);
      if (commentCounts.added) parts.push(`新增 ${commentCounts.added} 条评论`);
      if (commentCounts.updated) parts.push(`更新 ${commentCounts.updated} 条评论`);
      if (skipped) parts.push(`跳过 ${skipped} 条无效内容`);
      showToast(`导入完成：${parts.join('，')}`);
    } catch (error) {
      console.error('导入失败：', error);
      showToast(
        error instanceof Error ? error.message : '导入失败，请检查文件格式',
        'error'
      );
    } finally {
      els.importFile.value = '';
    }
  }

  function mergeLibraries(incoming) {
    const novelMap = new Map(state.novels.map((novel) => [novel.id, novel]));
    let addedNovels = 0;
    let updatedNovels = 0;
    let addedEntries = 0;
    let updatedEntries = 0;

    for (const inc of incoming) {
      const current = novelMap.get(inc.id);
      if (!current) {
        novelMap.set(inc.id, inc);
        addedNovels += 1;
        continue;
      }

      const incomingIsNewer = timeValue(inc.updatedAt) > timeValue(current.updatedAt);
      const merged = incomingIsNewer
        ? {
            ...current,
            ...inc,
            pinned: current.pinned || inc.pinned,
            entries: {},
          }
        : { ...current, entries: {} };

      let changed = incomingIsNewer;
      for (const key of SECTION_KEYS) {
        const entryMap = new Map(current.entries[key].map((entry) => [entry.id, entry]));
        for (const entry of inc.entries[key]) {
          const currentEntry = entryMap.get(entry.id);
          if (!currentEntry) {
            entryMap.set(entry.id, entry);
            addedEntries += 1;
            changed = true;
          } else if (timeValue(entry.updatedAt) > timeValue(currentEntry.updatedAt)) {
            entryMap.set(entry.id, {
              ...entry,
              pinned: currentEntry.pinned || entry.pinned,
            });
            updatedEntries += 1;
            changed = true;
          }
        }
        merged.entries[key] = [...entryMap.values()];
      }

      merged.relationGraphs = mergeRelationGraphs(
        current.relationGraphs,
        inc.relationGraphs,
        incomingIsNewer
      );
      merged.relations = mergeCharacterRelations(
        current.relations,
        inc.relations,
        incomingIsNewer,
        merged.relationGraphs
      );
      merged.updatedAt = incomingIsNewer ? inc.updatedAt : current.updatedAt;
      novelMap.set(current.id, merged);
      if (changed) updatedNovels += 1;
    }

    state.novels = [...novelMap.values()];
    return { addedNovels, updatedNovels, addedEntries, updatedEntries };
  }

  function mergeRelationGraphs(currentGraphs, incomingGraphs, incomingIsNewer) {
    const currentList = normalizeRelationGraphs(currentGraphs);
    const incomingList = normalizeRelationGraphs(incomingGraphs);
    const preferred = incomingIsNewer ? incomingList : currentList;
    const fallback = incomingIsNewer ? currentList : incomingList;
    const graphMap = new Map();

    for (const graph of fallback) graphMap.set(graph.id, graph);
    for (const graph of preferred) graphMap.set(graph.id, graph);

    return [...graphMap.values()];
  }

  function mergeCharacterRelations(
    currentRelations,
    incomingRelations,
    incomingIsNewer,
    graphs
  ) {
    const currentList = Array.isArray(currentRelations) ? currentRelations : [];
    const incomingList = Array.isArray(incomingRelations) ? incomingRelations : [];
    const preferred = incomingIsNewer ? incomingList : currentList;
    const fallback = incomingIsNewer ? currentList : incomingList;
    const relationMap = new Map();

    for (const relation of fallback) {
      relationMap.set(
        `${relation.graphId || GRAPH_PRIMARY_ID}::${relationPairKey(
          relation.source,
          relation.target
        )}`,
        relation
      );
    }
    for (const relation of preferred) {
      relationMap.set(
        `${relation.graphId || GRAPH_PRIMARY_ID}::${relationPairKey(
          relation.source,
          relation.target
        )}`,
        relation
      );
    }

    return normalizeCharacterRelations([...relationMap.values()], graphs);
  }

  function mergeTrash(incoming) {
    const ids = new Set(state.trash.map((item) => item.id));
    let added = 0;

    for (const item of incoming) {
      if (ids.has(item.id)) continue;
      state.trash.push(item);
      ids.add(item.id);
      added += 1;
    }

    if (added > 0) {
      state.trash.sort((a, b) => timeValue(b.deletedAt) - timeValue(a.deletedAt));
    }
    return added;
  }

  function mergeComments(incoming) {
    const commentMap = new Map(
      state.comments.map((comment) => [comment.id, comment])
    );
    let added = 0;
    let updated = 0;

    for (const comment of incoming) {
      const current = commentMap.get(comment.id);
      if (!current) {
        commentMap.set(comment.id, comment);
        added += 1;
        continue;
      }
      if (timeValue(comment.updatedAt) > timeValue(current.updatedAt)) {
        commentMap.set(comment.id, comment);
        updated += 1;
      }
    }

    if (added > 0 || updated > 0) {
      state.comments = [...commentMap.values()]
        .sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt))
        .slice(0, COMMENT_MAX_COUNT);
    }

    return { added, updated };
  }

  function exportLibrary() {
    if (
      state.novels.length === 0 &&
      state.trash.length === 0 &&
      state.comments.length === 0
    ) {
      showToast('书架、回收站和评论都空着，先写下第一本小说吧');
      return;
    }

    const now = new Date();
    const payload = {
      app: SITE_NAME,
      version: LIBRARY_VERSION,
      exportedAt: now.toISOString(),
      novels: state.novels,
      trash: state.trash,
      comments: state.comments,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${SITE_NAME}-备份-${fileDate(now)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    const total = state.novels.reduce((sum, novel) => sum + countNovelEntries(novel), 0);
    const trashSuffix =
      state.trash.length > 0 ? `、${state.trash.length} 项回收站记录` : '';
    const commentSuffix =
      state.comments.length > 0 ? `、${state.comments.length} 条评论` : '';
    showToast(
      `已导出 ${state.novels.length} 本小说、${total} 条内容${trashSuffix}${commentSuffix}`
    );
  }

  function fileDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /* ---------- Public snapshot ---------- */

  function countPublicEntries(novel) {
    return SECTION_KEYS.reduce(
      (sum, key) =>
        sum + novel.entries[key].filter((entry) => isEntryPublic(novel, entry)).length,
      0
    );
  }

  function getPublicSignature() {
    return state.novels
      .filter(isNovelPublic)
      .map((novel) => {
        const entries = SECTION_KEYS.map((key) =>
          novel.entries[key]
            .filter((entry) => isEntryPublic(novel, entry))
            .map((entry) => `${entry.id}@${entry.updatedAt}:${entry.visibility}`)
            .join(',')
        ).join(';');
        return `${novel.id}@${novel.updatedAt}#${entries}`;
      })
      .sort()
      .join('|');
  }

  function buildPublicSnapshot() {
    const novels = [];

    for (const novel of state.novels) {
      if (!isNovelPublic(novel)) continue;

      const entries = {};
      const publicIds = new Map();

      for (const key of SECTION_KEYS) {
        const visible = novel.entries[key].filter((entry) =>
          isEntryPublic(novel, entry)
        );
        publicIds.set(key, new Set(visible.map((entry) => entry.id)));
        entries[key] = visible.map((entry) => {
          const copy = {
            id: entry.id,
            title: entry.title,
            subtitle: entry.subtitle,
            summary: entry.summary,
            notes: entry.notes,
            tags: [...entry.tags],
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
          };
          if (entry.map) copy.map = normalizeMap(entry.map);
          return copy;
        });
      }

      const characterIds = publicIds.get('characters');
      const relations = novel.relations
        .filter(
          (relation) =>
            characterIds.has(relation.source) && characterIds.has(relation.target)
        )
        .map((relation) => ({
          id: relation.id,
          source: relation.source,
          target: relation.target,
          label: relation.label,
          directed: relation.directed,
          graphId: relation.graphId,
        }));
      const graphIds = new Set(relations.map((relation) => relation.graphId));
      const relationGraphs = novel.relationGraphs
        .filter((graph) => graphIds.has(graph.id))
        .map((graph) => ({ id: graph.id, title: graph.title }));

      novels.push({
        id: novel.id,
        title: novel.title,
        genre: novel.genre,
        summary: novel.summary,
        description: novel.description,
        status: novel.status,
        tone: novel.tone,
        cover: novel.cover,
        pinned: novel.pinned,
        createdAt: novel.createdAt,
        updatedAt: novel.updatedAt,
        entries,
        relations,
        relationGraphs,
      });
    }

    return {
      app: SITE_NAME,
      version: 1,
      kind: 'public-library',
      generatedAt: new Date().toISOString(),
      signature: getPublicSignature(),
      novels,
    };
  }

  function getSnapshotStats(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.novels)) {
      return { novels: 0, entries: 0 };
    }

    let entries = 0;
    for (const novel of snapshot.novels) {
      const novelEntries = novel && novel.entries ? novel.entries : {};
      for (const key of SECTION_KEYS) {
        const list = Array.isArray(novelEntries[key]) ? novelEntries[key] : [];
        entries += list.length;
      }
    }

    return { novels: snapshot.novels.length, entries };
  }

  function readPublicPreview() {
    try {
      const raw = localStorage.getItem(PUBLIC_PREVIEW_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        parsed.kind !== 'public-library' ||
        !Array.isArray(parsed.novels)
      ) {
        return null;
      }
      return parsed;
    } catch (error) {
      console.warn('读取公开快照预览失败：', error);
      return null;
    }
  }

  function storePublicPreview(snapshot) {
    try {
      localStorage.setItem(PUBLIC_PREVIEW_KEY, JSON.stringify(snapshot));
      return true;
    } catch (error) {
      console.warn('本机预览快照过大：', error);
      return false;
    }
  }

  function formatSnapshotTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '未知时间';
    const pad = (number) => String(number).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function renderPublish() {
    const publicNovels = state.novels.filter(isNovelPublic);
    let publicEntries = 0;
    let privateInPublic = 0;
    let totalEntries = 0;

    for (const novel of state.novels) {
      const total = countNovelEntries(novel);
      totalEntries += total;
      if (isNovelPublic(novel)) {
        const visible = countPublicEntries(novel);
        publicEntries += visible;
        privateInPublic += total - visible;
      }
    }

    renderPublishSummary({
      publicNovels: publicNovels.length,
      publicEntries,
      privateInPublic,
      privateTotal: totalEntries - publicEntries,
    });
    renderPublishNovelList();
    updatePublishSnapshotStatus();
    renderSidebar(state.route);
    restorePublishFocus();
  }

  function restorePublishFocus() {
    if (!state.publishFocus) return;
    const { entryId, value } = state.publishFocus;
    state.publishFocus = null;
    const input = els.publishNovelList.querySelector(
      `[data-publish-entry-vis][data-entry-id="${cssEscape(entryId)}"][value="${value}"]`
    );
    if (input) input.focus({ preventScroll: true });
  }

  function renderPublishSummary({
    publicNovels,
    publicEntries,
    privateInPublic,
    privateTotal,
  }) {
    const cards = [
      {
        tone: 'public',
        iconName: 'i-world',
        label: '已解锁小说',
        value: String(publicNovels),
        hint:
          state.novels.length > 0
            ? `共 ${state.novels.length} 本，其余只在本机`
            : '书架还空着',
      },
      {
        tone: 'public',
        iconName: 'i-books',
        label: '会进入快照的条目',
        value: String(publicEntries),
        hint:
          privateInPublic > 0
            ? `另有 ${privateInPublic} 条在解锁小说中保持私密`
            : '解锁小说中的全部条目',
      },
      {
        tone: 'private',
        iconName: 'i-lock',
        label: '只留在本机',
        value: String(privateTotal),
        hint: '私密条目、评论与回收站不会公开',
      },
    ];

    const fragment = document.createDocumentFragment();
    for (const card of cards) {
      const node = el('article', `publish-summary-card is-${card.tone}`);
      const head = el('div', 'publish-summary-head');
      head.append(icon(card.iconName), el('span', '', card.label));
      node.append(
        head,
        el('strong', 'publish-summary-value', card.value),
        el('p', 'publish-summary-hint', card.hint)
      );
      fragment.appendChild(node);
    }
    els.publishSummary.replaceChildren(fragment);
  }

  function renderPublishNovelList() {
    const novels = [...state.novels].sort(
      (a, b) =>
        pinWeight(b) - pinWeight(a) || timeValue(b.updatedAt) - timeValue(a.updatedAt)
    );
    const fragment = document.createDocumentFragment();

    for (const novel of novels) {
      fragment.appendChild(createPublishNovelRow(novel));
    }

    els.publishNovelList.replaceChildren(fragment);
    els.publishNovelList.hidden = novels.length === 0;
    els.publishEmpty.hidden = novels.length > 0;
  }

  function getEntryVisibilityBreakdown(novel) {
    const counts = { inherit: 0, public: 0, private: 0 };
    for (const key of SECTION_KEYS) {
      for (const entry of novel.entries[key]) {
        counts[normalizeEntryVisibility(entry.visibility)] += 1;
      }
    }
    return counts;
  }

  function createPublishNovelRow(novel) {
    const isPublic = isNovelPublic(novel);
    const total = countNovelEntries(novel);
    const visible = countPublicEntries(novel);
    const row = el('article', `publish-novel-row${isPublic ? ' is-public' : ''}`);
    row.dataset.novelId = novel.id;

    const coverSlot = el('span', 'publish-novel-cover');
    coverSlot.appendChild(createCover(novel, 'publish'));

    const main = el('div', 'publish-novel-main');
    const titleRow = el('div', 'publish-novel-title-row');
    const title = el('a', 'publish-novel-name', novel.title);
    title.href = novelHash(novel.id);
    titleRow.append(
      title,
      createVisibilityChip(isPublic, isPublic ? '已解锁' : '未解锁')
    );

    const meta = el('p', 'publish-novel-meta');
    meta.textContent = [
      novel.genre || '未标注类型',
      isPublic ? `${visible} / ${total} 条会公开` : `${total} 条仍在本机`,
      `更新于 ${relativeDate(new Date(novel.updatedAt))}`,
    ].join(' · ');
    main.append(titleRow, meta, createPublishEntriesToggle(novel));

    const switchLabel = el('label', 'visibility-switch publish-switch');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = isPublic;
    input.dataset.publishNovel = novel.id;
    input.setAttribute('aria-label', `${isPublic ? '收回' : '公开'}《${novel.title}》`);
    const track = el('span', 'visibility-switch-track');
    track.setAttribute('aria-hidden', 'true');
    track.appendChild(el('span', 'visibility-switch-thumb'));
    const copy = el('span', 'visibility-switch-copy');
    copy.append(
      el('span', 'visibility-switch-title', isPublic ? '公开中' : '仅本机'),
      el('span', 'visibility-switch-hint', isPublic ? '生成快照后生效' : '点击解锁')
    );
    switchLabel.append(input, track, copy);

    row.append(coverSlot, main, switchLabel, createPublishEntriesPanel(novel));
    return row;
  }

  function createPublishEntriesToggle(novel) {
    const counts = getEntryVisibilityBreakdown(novel);
    const overrides = counts.public + counts.private;
    const total = counts.inherit + overrides;
    const expanded = Boolean(state.publishExpanded[novel.id]);

    const toggle = el('button', `publish-entries-toggle${expanded ? ' is-open' : ''}`);
    toggle.type = 'button';
    toggle.dataset.action = 'toggle-publish-entries';
    toggle.dataset.novelId = novel.id;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute(
      'aria-controls',
      `publishEntries-${cssEscape(novel.id)}`
    );

    const label = el('span', 'publish-entries-toggle-label', '条目公开范围');
    const summary = el(
      'span',
      'publish-entries-toggle-summary',
      `${total} 条` + (overrides > 0 ? ` · ${overrides} 项单独设置` : '')
    );
    const chevronWrap = el('span', 'publish-entries-toggle-chevron');
    chevronWrap.setAttribute('aria-hidden', 'true');
    chevronWrap.appendChild(icon('i-chevron'));

    toggle.append(label, summary, chevronWrap);
    return toggle;
  }

  function createPublishEntriesPanel(novel) {
    const expanded = Boolean(state.publishExpanded[novel.id]);
    const panel = el('div', 'publish-entries-panel');
    panel.id = `publishEntries-${novel.id}`;
    panel.hidden = !expanded;

    if (!isNovelPublic(novel)) {
      const note = el('p', 'publish-entries-note');
      note.appendChild(icon('i-lock'));
      note.appendChild(
        document.createTextNode(
          '这本小说还未解锁：可以先给条目定好公开范围，解锁后按这里的设置生效。'
        )
      );
      panel.appendChild(note);
    }

    let listed = 0;
    for (const key of SECTION_KEYS) {
      const entries = novel.entries[key];
      if (entries.length === 0) continue;
      listed += entries.length;

      const config = SECTIONS[key];
      const group = el('div', 'publish-entries-group');
      const head = el('p', 'publish-entries-group-head');
      head.appendChild(icon(config.icon));
      head.appendChild(document.createTextNode(config.label));
      head.appendChild(
        el('span', 'publish-entries-group-count', `${entries.length} 条`)
      );

      const list = el('div', 'publish-entries-list');
      for (const entry of sortEntries(entries)) {
        list.appendChild(createPublishEntryRow(novel, key, entry));
      }
      group.append(head, list);
      panel.appendChild(group);
    }

    if (listed === 0) {
      panel.appendChild(
        el('p', 'publish-entries-note', '这本小说还没有条目，先去各分区新增内容。')
      );
    }
    return panel;
  }

  function createPublishEntryRow(novel, sectionKey, entry) {
    const rowNode = el('div', 'publish-entry-row');
    const link = el('a', 'publish-entry-link', entry.title);
    link.href = entryHash(novel.id, sectionKey, entry.id);
    link.title = `打开「${entry.title}」`;

    const current = normalizeEntryVisibility(entry.visibility);
    const seg = el('div', 'publish-vis-seg');
    seg.setAttribute('role', 'radiogroup');
    seg.setAttribute('aria-label', `「${entry.title}」的公开范围`);

    for (const option of PUBLISH_VIS_OPTIONS) {
      const optionLabel = el('label', 'publish-vis-option');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `pubvis-${entry.id}`;
      input.value = option.value;
      input.checked = current === option.value;
      input.dataset.publishEntryVis = '1';
      input.dataset.novelId = novel.id;
      input.dataset.sectionKey = sectionKey;
      input.dataset.entryId = entry.id;
      input.setAttribute('aria-label', option.ariaLabel);
      optionLabel.append(input, el('span', '', option.label));
      seg.appendChild(optionLabel);
    }

    rowNode.append(link, seg);
    return rowNode;
  }

  function togglePublishEntries(novelId) {
    if (!novelId) return;
    const expanded = !state.publishExpanded[novelId];
    state.publishExpanded[novelId] = expanded;

    const row = els.publishNovelList.querySelector(
      `[data-novel-id="${cssEscape(novelId)}"]`
    );
    if (!row) return;
    const panel = $('.publish-entries-panel', row);
    const toggle = $('.publish-entries-toggle', row);
    if (panel) panel.hidden = !expanded;
    if (toggle) {
      toggle.classList.toggle('is-open', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
    }
  }

  function setEntryVisibilityOverride(novelId, sectionKey, entryId, value) {
    const novel = findNovel(novelId);
    if (!novel || !novel.entries[sectionKey]) return;
    const entry = novel.entries[sectionKey].find((item) => item.id === entryId);
    if (!entry) return;

    const normalized = normalizeEntryVisibility(value);
    if (entry.visibility === normalized) return;

    const previous = state.novels;
    state.novels = state.novels.map((item) => {
      if (item.id !== novelId) return item;
      const entries = { ...item.entries };
      entries[sectionKey] = entries[sectionKey].map((candidate) =>
        candidate.id === entryId
          ? { ...candidate, visibility: normalized }
          : candidate
      );
      return { ...item, entries };
    });

    if (!persist()) {
      state.novels = previous;
      renderPublish();
      return;
    }

    state.publishFocus = { entryId, value: normalized };
    renderPublish();

    if (normalized === 'private') {
      showToast(`「${entry.title}」已设为私密，重新生成快照后不会公开`);
    } else if (normalized === 'public') {
      showToast(
        isNovelPublic(novel)
          ? `「${entry.title}」已设为公开，重新生成快照后生效`
          : `「${entry.title}」已标记公开，等小说解锁后会一起生效`
      );
    } else {
      showToast(`「${entry.title}」已恢复为跟随小说`);
    }
  }

  function setNovelVisibility(novelId, isPublic) {
    const novel = findNovel(novelId);
    if (!novel || isNovelPublic(novel) === isPublic) return;

    const previous = state.novels;
    state.novels = state.novels.map((item) =>
      item.id === novelId
        ? { ...item, visibility: isPublic ? 'public' : 'private' }
        : item
    );

    if (!persist()) {
      state.novels = previous;
      renderPublish();
      return;
    }

    renderPublish();
    renderSidebar(state.route);
    showToast(
      isPublic
        ? `《${novel.title}》已解锁，生成快照后会公开`
        : `已收回《${novel.title}》，只会留在本机`
    );
  }

  function downloadPublicSnapshot(snapshot) {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'public-library.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportPublicLibrary() {
    const snapshot = buildPublicSnapshot();
    const stats = getSnapshotStats(snapshot);
    const stored = storePublicPreview(snapshot);
    downloadPublicSnapshot(snapshot);
    updatePublishSnapshotStatus(snapshot);

    if (stats.novels === 0) {
      showToast('已生成空白快照，发布后公开页会回到空白状态');
      return;
    }

    showToast(
      `已生成公开快照：${stats.novels} 本小说、${stats.entries} 条内容${
        stored ? '，本机预览已更新' : '；本机预览空间不足，可部署后查看'
      }`
    );
  }

  function openPublicPreview() {
    const snapshot = buildPublicSnapshot();
    const stored = storePublicPreview(snapshot);
    const link = document.createElement('a');
    link.href = 'public.html?preview=1';
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    updatePublishSnapshotStatus(snapshot);

    if (!stored) {
      showToast('本机预览空间不足，请先生成快照并部署后查看', 'error');
      return;
    }
    showToast('已打开本机预览，预览内容不会自动上传');
  }

  function updatePublishSnapshotStatus(snapshot = readPublicPreview()) {
    if (!els.publishSnapshotStatus) return;

    if (!snapshot) {
      els.publishSnapshotStatus.classList.remove('is-stale');
      els.publishSnapshotStatus.textContent =
        '还没有生成过快照。生成后会下载 public-library.json，并自动启用本机预览。';
      return;
    }

    const stats = getSnapshotStats(snapshot);
    const generated = formatSnapshotTime(snapshot.generatedAt);
    const stale =
      typeof snapshot.signature === 'string' &&
      snapshot.signature !== getPublicSignature();
    els.publishSnapshotStatus.classList.toggle('is-stale', stale);
    els.publishSnapshotStatus.textContent = stale
      ? `本机预览快照生成于 ${generated}，包含 ${stats.novels} 本小说、${stats.entries} 条内容；此后公开范围或内容有变化，建议重新生成后再发布。`
      : `本机预览快照生成于 ${generated}，包含 ${stats.novels} 本小说、${stats.entries} 条内容。下载的 public-library.json 部署后才会对所有人可见。`;
  }

  /* ---------- Global search ---------- */

  function openGlobalSearch() {
    if (els.searchDialog.open) return;
    els.searchDialog.showModal();
    els.searchInput.value = '';
    runGlobalSearch();
    els.searchInput.focus();
  }

  function closeGlobalSearch() {
    if (!els.searchDialog.open) return;
    els.searchDialog.close();
    state.search.items = [];
    state.search.activeIndex = -1;
  }

  function runGlobalSearch() {
    const query = els.searchInput.value;
    const result = buildGlobalSearchResults(query);
    state.search.mode = result.mode;
    state.search.items = result.items;
    state.search.activeIndex = result.items.length > 0 ? 0 : -1;
    renderSearchResults();
  }

  function scoreGlobalMatch(fields, query) {
    let best = null;
    for (const field of fields) {
      if (!field.text) continue;
      const index = field.text.toLowerCase().indexOf(query);
      if (index < 0) continue;
      if (!best || field.weight > best.weight) {
        best = {
          text: field.text,
          weight: field.weight,
          index,
          label: field.label || null,
        };
      }
    }
    return best;
  }

  function buildSearchExcerpt(match, query) {
    const start = Math.max(0, match.index - 22);
    const end = Math.min(match.text.length, match.index + query.length + 42);
    return {
      before:
        (start > 0 ? '…' : '') + match.text.slice(start, match.index),
      match: match.text.slice(match.index, match.index + query.length),
      after:
        match.text.slice(match.index + query.length, end) +
        (end < match.text.length ? '…' : ''),
    };
  }

  function plainExcerpt(text, limit = 90) {
    if (!text) return null;
    return { before: '', match: '', after: text.slice(0, limit) };
  }

  function collectAllEntries() {
    const all = [];
    for (const novel of state.novels) {
      for (const key of SECTION_KEYS) {
        for (const entry of novel.entries[key]) {
          all.push({ novel, sectionKey: key, entry });
        }
      }
    }
    return all;
  }

  function buildGlobalSearchResults(rawQuery) {
    const query = rawQuery.trim().toLowerCase();

    if (!query) {
      const items = collectAllEntries()
        .sort(
          (a, b) => timeValue(b.entry.updatedAt) - timeValue(a.entry.updatedAt)
        )
        .slice(0, 8)
        .map(({ novel, sectionKey, entry }) => ({
          badge: `${novel.title} · ${SECTIONS[sectionKey].label}`,
          title: entry.title,
          titleHighlight: null,
          excerpt: plainExcerpt(entry.summary),
          hash: entryHash(novel.id, sectionKey, entry.id),
        }));
      return { mode: 'recent', items };
    }

    const matches = [];

    for (const novel of state.novels) {
      const novelMatch = scoreGlobalMatch(
        [
          { text: novel.title, weight: 3 },
          { text: novel.genre, weight: 2 },
          { text: novel.summary, weight: 2 },
          { text: novel.description, weight: 1 },
        ],
        query
      );
      if (novelMatch) {
        const titleHighlight =
          novelMatch.text === novel.title ? novelMatch.index : null;
        matches.push({
          score: novelMatch.weight + 1,
          time: timeValue(novel.updatedAt),
          badge: '小说',
          title: novel.title,
          titleHighlight,
          excerpt:
            titleHighlight !== null
              ? plainExcerpt(novel.summary || novel.description)
              : buildSearchExcerpt(novelMatch, query),
          hash: novelHash(novel.id),
        });
      }

      for (const key of SECTION_KEYS) {
        for (const entry of novel.entries[key]) {
          const match = scoreGlobalMatch(
            [
              { text: entry.title, weight: 3 },
              { text: entry.subtitle, weight: 2 },
              { text: entry.summary, weight: 2 },
              ...entry.tags.map((tag) => ({ text: tag, weight: 2 })),
              ...entry.aliases.map((alias) => ({
                text: alias,
                weight: 2,
                label: 'alias',
              })),
              { text: entry.notes, weight: 1 },
            ],
            query
          );
          if (!match) continue;

          const titleHighlight = match.text === entry.title ? match.index : null;
          const badgeLabel =
            match.label === 'alias' ? ` · 别名：${match.text}` : '';
          matches.push({
            score: match.weight,
            time: timeValue(entry.updatedAt),
            badge: `${novel.title} · ${SECTIONS[key].label}${badgeLabel}`,
            title: entry.title,
            titleHighlight,
            excerpt:
              titleHighlight !== null
                ? plainExcerpt(entry.summary || entry.notes)
                : buildSearchExcerpt(match, query),
            hash: entryHash(novel.id, key, entry.id),
          });
        }
      }
    }

    matches.sort((a, b) => b.score - a.score || b.time - a.time);
    return { mode: 'search', items: matches.slice(0, 30) };
  }

  function renderSearchResults() {
    const fragment = document.createDocumentFragment();

    if (state.search.items.length === 0) {
      const query = els.searchInput.value.trim();
      const empty = el('div', 'search-empty');
      empty.appendChild(
        el('p', 'search-empty-title', query ? '没有找到匹配的内容' : '书架还空着')
      );
      empty.appendChild(
        el(
          'p',
          'search-empty-hint',
          query
            ? '换个更短的关键词试试：搜索覆盖标题、简介、标签与正文。'
            : '先在书架新建一本小说，再回来搜索。'
        )
      );
      fragment.appendChild(empty);
      els.searchResults.replaceChildren(fragment);
      return;
    }

    if (state.search.mode === 'recent') {
      fragment.appendChild(el('p', 'search-group-label', '最近更新'));
    }

    state.search.items.forEach((item, index) => {
      const active = index === state.search.activeIndex;
      const button = el('button', `search-result${active ? ' is-active' : ''}`);
      button.type = 'button';
      button.dataset.searchIndex = index;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', active ? 'true' : 'false');

      const top = el('span', 'search-result-top');
      top.appendChild(el('span', 'search-result-badge', item.badge));
      button.appendChild(top);

      const title = el('span', 'search-result-title');
      if (item.titleHighlight === null) {
        title.textContent = item.title;
      } else {
        appendSearchHighlight(title, {
          before: item.title.slice(0, item.titleHighlight),
          match: item.title.slice(
            item.titleHighlight,
            item.titleHighlight + els.searchInput.value.trim().length
          ),
          after: item.title.slice(item.titleHighlight + els.searchInput.value.trim().length),
        });
      }
      button.appendChild(title);

      if (item.excerpt) {
        const excerpt = el('span', 'search-result-excerpt');
        appendSearchHighlight(excerpt, item.excerpt);
        button.appendChild(excerpt);
      }

      fragment.appendChild(button);
    });

    els.searchResults.replaceChildren(fragment);
  }

  function appendSearchHighlight(node, excerpt) {
    if (excerpt.before) node.appendChild(el('span', '', excerpt.before));
    if (excerpt.match) {
      const mark = document.createElement('mark');
      mark.textContent = excerpt.match;
      node.appendChild(mark);
    }
    if (excerpt.after) node.appendChild(el('span', '', excerpt.after));
  }

  function moveSearchActive(delta) {
    const { items, activeIndex } = state.search;
    if (items.length === 0) return;
    setActiveSearchIndex((activeIndex + delta + items.length) % items.length);
  }

  function setActiveSearchIndex(index) {
    state.search.activeIndex = index;
    const buttons = els.searchResults.querySelectorAll('[data-search-index]');
    buttons.forEach((button, position) => {
      const active = position === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active) button.scrollIntoView({ block: 'nearest' });
    });
  }

  function activateSearchResult(index) {
    const item = state.search.items[index];
    if (!item) return;
    closeGlobalSearch();
    window.location.hash = item.hash;
  }

  /* ---------- Novel Markdown export ---------- */

  function sanitizeFilename(name) {
    const cleaned = String(name)
      .replace(/[\\/:*?"<>|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned || 'novel';
  }

  function exportNovelMarkdown(novelId) {
    const novel = findNovel(novelId);
    if (!novel) {
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    const markdown = buildNovelMarkdown(novel);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `《${sanitizeFilename(novel.title)}》档案.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`已导出《${novel.title}》的 Markdown 档案`);
  }

  function buildNovelMarkdown(novel) {
    const status = NOVEL_STATUS[novel.status] || NOVEL_STATUS.planning;
    const charactersById = new Map(
      novel.entries.characters.map((entry) => [entry.id, entry])
    );
    const lines = [];

    lines.push(`# 《${novel.title}》`);
    lines.push('');
    lines.push(
      [
        `类型：${novel.genre || '未标注'}`,
        `状态：${status.label}`,
        `条目：${countNovelEntries(novel)} 条`,
        `正文字数：${formatWordCount(countNovelWords(novel))}`,
      ].join(' · ')
    );
    lines.push('');

    if (novel.summary) {
      lines.push(`> ${novel.summary.replace(/\n+/g, ' ')}`);
      lines.push('');
    }

    if (novel.description) {
      lines.push('## 故事简介');
      lines.push('');
      lines.push(novel.description);
      lines.push('');
    }

    for (const key of SECTION_KEYS) {
      const entries = novel.entries[key];
      if (entries.length === 0) continue;

      lines.push(`## ${SECTIONS[key].label}`);
      lines.push('');
      for (const entry of sortEntries(entries)) {
        lines.push(`### ${entry.title}`);
        if (entry.subtitle) {
          lines.push(`*${entry.subtitle}*`);
        }
        lines.push('');
        if (entry.summary) {
          lines.push(entry.summary);
          lines.push('');
        }
        if (entry.notes) {
          lines.push(entry.notes);
          lines.push('');
        }
        if (key === 'maps' && entry.map && entry.map.cities.length > 0) {
          lines.push('**城市**');
          lines.push('');
          for (const city of entry.map.cities) {
            lines.push(
              `- ${city.name}（第 ${city.col + 1} 列，第 ${city.row + 1} 行 · 领地 ${city.radius} 格）`
            );
          }
          lines.push('');
        }
        if (entry.tags.length > 0) {
          lines.push(`标签：${entry.tags.join('、')}`);
          lines.push('');
        }
      }
    }

    const graphs = novel.relationGraphs.filter((graph) =>
      novel.relations.some((relation) => relation.graphId === graph.id)
    );
    if (graphs.length > 0) {
      lines.push('## 人物关系');
      lines.push('');
      for (const graph of graphs) {
        const graphRelations = novel.relations.filter(
          (relation) => relation.graphId === graph.id
        );
        if (graphs.length > 1) {
          lines.push(`### ${graph.title}`);
          lines.push('');
        }
        for (const relation of graphRelations) {
          const from = charactersById.get(relation.source);
          const to = charactersById.get(relation.target);
          if (!from || !to) continue;
          const arrow = relation.directed ? '→' : '↔';
          const label = relation.label ? `：${relation.label}` : '';
          lines.push(`- ${from.title} ${arrow} ${to.title}${label}`);
        }
        lines.push('');
      }
    }

    lines.push(
      `---`,
      '',
      `导出自 ${SITE_NAME} · ${formatSnapshotTime(new Date().toISOString())}`
    );
    return lines.join('\n');
  }

  /* ---------- Feedback ---------- */

  function showToast(message, variant = 'success') {
    while (els.toastStack.children.length >= 3) {
      els.toastStack.firstElementChild.remove();
    }

    const toast = document.createElement('div');
    toast.className = variant === 'error' ? 'toast toast-error' : 'toast';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', variant === 'error' ? '#i-alert' : '#i-check');
    svg.appendChild(use);

    const text = document.createElement('span');
    text.textContent = message;

    toast.append(svg, text);
    els.toastStack.appendChild(toast);

    const duration = variant === 'error' ? 3800 : 2600;
    const timer = window.setTimeout(remove, duration);

    function remove() {
      window.clearTimeout(timer);
      if (!toast.isConnected) return;
      toast.classList.add('is-leaving');
      window.setTimeout(() => toast.remove(), 210);
    }

    toast.addEventListener('click', remove);
  }

  /* ---------- Utilities ---------- */

  function el(tag, className = '', text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${name}`);
    svg.appendChild(use);
    return svg;
  }

  function pinWeight(item) {
    return item.pinned ? 1 : 0;
  }

  function timeValue(value) {
    return new Date(value).getTime();
  }

  function formatCardDate(item) {
    const created = new Date(item.createdAt);
    const updated = new Date(item.updatedAt);
    const wasEdited = updated.getTime() - created.getTime() > 2000;

    return {
      label: wasEdited ? `更新于 ${relativeDate(updated)}` : `记于 ${relativeDate(created)}`,
      full: `创建于 ${fullDate(created)}${wasEdited ? ` · 更新于 ${fullDate(updated)}` : ''}`,
    };
  }

  function formatNovelMeta(novel) {
    const created = new Date(novel.createdAt);
    const updated = new Date(novel.updatedAt);
    const createdText = `创建于 ${created.getFullYear()} 年 ${created.getMonth() + 1} 月 ${created.getDate()} 日`;
    const updatedText = `最近更新 ${relativeDate(updated)}`;
    const words = countNovelWords(novel);
    return [
      createdText,
      updatedText,
      ...(words > 0 ? [`全书 ${formatWordCount(words)}`] : []),
    ].join(' · ');
  }

  function relativeDate(date) {
    const now = new Date();
    const startOfDay = (value) =>
      new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

    if (dayDiff <= 0) return '今天';
    if (dayDiff === 1) return '昨天';
    if (dayDiff < 7) return `${dayDiff} 天前`;
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
    }
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  }

  function fullDate(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 ${hours}:${minutes}`;
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(String(value));
    }
    return String(value).replace(/(["\\])/g, '\\$1');
  }

  function markEntryDirty() {
    state.entryDraft.dirty = true;
  }

  /* ---------- Events ---------- */

  function bindEvents() {
    els.newNovelBtn.addEventListener('click', () => openNovelEditor());
    els.shelfEmptyNewBtn.addEventListener('click', () => openNovelEditor());
    els.shelfEmptyImportBtn.addEventListener('click', () => els.importFile.click());
    els.importBtn.addEventListener('click', () => els.importFile.click());
    els.exportBtn.addEventListener('click', exportLibrary);
    els.footerExportBtn.addEventListener('click', exportLibrary);
    els.importFile.addEventListener('change', handleImportFile);

    els.publishPreviewBtn.addEventListener('click', openPublicPreview);
    els.publishExportBtn.addEventListener('click', exportPublicLibrary);
    els.publishEmptyNewBtn.addEventListener('click', () => openNovelEditor());

    els.sidebarSearchBtn.addEventListener('click', openGlobalSearch);
    els.searchDialogCloseBtn.addEventListener('click', closeGlobalSearch);
    els.searchInput.addEventListener('input', runGlobalSearch);
    els.searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveSearchActive(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveSearchActive(-1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        activateSearchResult(state.search.activeIndex);
      }
    });
    els.searchResults.addEventListener('click', (event) => {
      const button = event.target.closest('[data-search-index]');
      if (button) activateSearchResult(Number(button.dataset.searchIndex));
    });
    els.searchDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeGlobalSearch();
    });
    els.searchDialog.addEventListener('click', (event) => {
      if (event.target === els.searchDialog) closeGlobalSearch();
    });
    els.publishNovelList.addEventListener('change', (event) => {
      const novelInput = event.target.closest('[data-publish-novel]');
      if (novelInput) {
        setNovelVisibility(novelInput.dataset.publishNovel, novelInput.checked);
        return;
      }
      const visInput = event.target.closest('[data-publish-entry-vis]');
      if (visInput) {
        setEntryVisibilityOverride(
          visInput.dataset.novelId,
          visInput.dataset.sectionKey,
          visInput.dataset.entryId,
          visInput.value
        );
      }
    });

    els.commentFab.addEventListener('click', openCommentComposer);
    els.commentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveComment();
    });
    els.commentForm.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        saveComment();
      }
    });
    els.commentBodyInput.addEventListener('input', () => {
      state.commentDraft.dirty = true;
      updateCommentBodyState();
    });
    els.commentTargetSelect.addEventListener('change', () => {
      state.commentDraft.targetKey = els.commentTargetSelect.value;
      syncCommentDialogTarget();
    });
    els.commentDialogCloseBtn.addEventListener('click', attemptCloseCommentDialog);
    els.commentCancelBtn.addEventListener('click', attemptCloseCommentDialog);
    els.commentDeleteBtn.addEventListener('click', () => {
      if (state.commentDraft.id) askDeleteComment(state.commentDraft.id);
    });
    els.commentDialog.addEventListener('cancel', (event) => {
      if (!state.commentDraft.dirty) return;
      event.preventDefault();
      attemptCloseCommentDialog();
    });
    els.commentDialog.addEventListener('close', () => {
      if (els.commentDialog.open) return;
      state.commentDraft = {
        mode: null,
        id: null,
        candidates: [],
        targetKey: null,
        dirty: false,
      };
      els.commentForm.reset();
      els.commentTargetSelect.replaceChildren();
      els.commentBodyError.hidden = true;
      updateCommentBodyState();
    });

    els.commentsSearchInput.addEventListener('input', () => {
      state.commentDirectory.query = els.commentsSearchInput.value;
      syncCommentsSearchBox();
      renderComments();
    });
    els.commentsSearchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && els.commentsSearchInput.value) {
        event.preventDefault();
        clearCommentSearch();
      }
    });
    els.commentsSearchClearBtn.addEventListener('click', () =>
      clearCommentSearch()
    );
    els.commentsClearSearchBtn.addEventListener('click', () =>
      clearCommentSearch()
    );
    els.commentsNoResultsClearBtn.addEventListener('click', () =>
      clearCommentSearch()
    );
    els.commentsSortSelect.addEventListener('change', () => {
      state.commentDirectory.sort = els.commentsSortSelect.value;
      renderComments();
    });

    els.appearanceBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleAppearancePanel();
    });
    els.appearanceCloseBtn.addEventListener('click', () => {
      closeAppearancePanel();
      els.appearanceBtn.focus();
    });
    els.appearanceResetBtn.addEventListener('click', () => {
      state.appearance = { ...DEFAULT_APPEARANCE };
      applyAppearance();
      persistAppearance();
      showToast('外观已恢复默认');
    });
    els.appearancePresetBtns.forEach((button) => {
      button.addEventListener('click', () => applyPreset(button.dataset.preset));
    });
    els.appearanceAccentBtns.forEach((button) => {
      button.addEventListener('click', () =>
        updateAppearance('accent', button.dataset.accent)
      );
    });
    els.wallpaperDimInput.addEventListener('input', () =>
      updateAppearance('wallpaperDim', els.wallpaperDimInput.value)
    );
    els.glassAlphaInput.addEventListener('input', () =>
      updateAppearance('glassAlpha', els.glassAlphaInput.value)
    );
    els.cardAlphaInput.addEventListener('input', () =>
      updateAppearance('cardAlpha', els.cardAlphaInput.value)
    );
    els.blurInput.addEventListener('input', () =>
      updateAppearance('blur', els.blurInput.value)
    );
    els.rimInput.addEventListener('input', () =>
      updateAppearance('rim', els.rimInput.value)
    );
    els.readingScaleInput.addEventListener('input', () =>
      updateAppearance('readingScale', els.readingScaleInput.value)
    );

    window.addEventListener('resize', scheduleAppearancePosition);
    window.addEventListener('scroll', scheduleAppearancePosition, {
      passive: true,
    });

    document.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        const link =
          target instanceof Element ? target.closest('.side-nav a') : null;
        const plainClick =
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey;
        state.sidebarScroll = link && plainClick ? window.scrollY : null;
      },
      true
    );

    document.addEventListener('click', (event) => {
      if (els.appearancePanel.hidden) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        els.appearancePanel.contains(target) ||
        els.appearanceBtn.contains(target)
      ) {
        return;
      }
      closeAppearancePanel();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || els.appearancePanel.hidden) return;
      closeAppearancePanel();
      els.appearanceBtn.focus();
    });

    els.shelfSearchInput.addEventListener('input', () => {
      state.shelf.query = els.shelfSearchInput.value;
      syncShelfSearchBox();
      renderShelf();
    });

    els.shelfSearchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && els.shelfSearchInput.value) {
        event.preventDefault();
        clearShelfSearch();
      }
    });

    els.shelfSearchClearBtn.addEventListener('click', () => clearShelfSearch());

    els.shelfSortSelect.addEventListener('change', () => {
      state.shelf.sort = els.shelfSortSelect.value;
      renderShelf();
    });

    els.shelfStatusFilters.addEventListener('click', (event) => {
      const button = event.target.closest('.filter-pill');
      if (!button) return;
      state.shelf.status = button.dataset.status;
      renderShelf();
    });

    els.shelfClearFiltersBtn.addEventListener('click', () =>
      resetShelfFilters({ focusSearch: true })
    );
    els.shelfNoResultsClearBtn.addEventListener('click', () =>
      resetShelfFilters({ focusSearch: true })
    );

    document.addEventListener('click', handleActionClick);

    document.addEventListener(
      'click',
      (event) => {
        if (
          !state.outlineDraft.dirty ||
          !state.route ||
          state.route.view !== 'outline-editor' ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#/')) return;

        event.preventDefault();
        openConfirm({
          title: '放弃这次修改？',
          message: '离开编辑页后，尚未保存的大纲内容会丢失。',
          okLabel: '放弃修改',
          onConfirm: () => {
            state.outlineDraft.dirty = false;
            window.location.hash = href;
          },
        });
      },
      true
    );

    els.novelForm.addEventListener('input', () => {
      state.novelDraft.dirty = true;
    });
    els.novelTitleInput.addEventListener('input', () => {
      clearNovelTitleError();
      updateNovelCoverPreview();
    });
    els.novelDescriptionInput.addEventListener('input', updateNovelDescriptionCount);
    els.novelForm
      .querySelectorAll('input[name="tone"]')
      .forEach((input) => input.addEventListener('change', updateNovelCoverPreview));

    els.novelCoverUploadBtn.addEventListener('click', () => els.novelCoverInput.click());
    els.novelCoverRemoveBtn.addEventListener('click', removeNovelCover);
    els.novelCoverInput.addEventListener('change', handleNovelCoverFile);
    els.novelPublicInput.addEventListener('change', syncNovelVisibilityHint);

    els.novelForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveNovel();
    });

    els.novelForm.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        saveNovel();
      }
    });

    els.novelDialogCloseBtn.addEventListener('click', attemptCloseNovelEditor);
    els.novelCancelBtn.addEventListener('click', attemptCloseNovelEditor);

    els.novelDialog.addEventListener('cancel', (event) => {
      if (!state.novelDraft.dirty) return;
      event.preventDefault();
      attemptCloseNovelEditor();
    });

    els.novelDialog.addEventListener('close', () => {
      if (els.novelDialog.open) return;
      state.novelDraft = { id: null, dirty: false, cover: '', coverBusy: false };
      els.novelForm.reset();
      els.novelCoverInput.value = '';
      els.novelSaveBtn.disabled = false;
      els.novelCoverUploadBtn.disabled = false;
      els.novelCoverRemoveBtn.disabled = false;
      els.novelCoverUploadLabel.textContent = '选择图片';
      clearNovelTitleError();
    });

    els.entryForm.addEventListener('input', () => {
      state.entryDraft.dirty = true;
    });
    els.entryTitleInput.addEventListener('input', clearEntryTitleError);
    els.entryNotesInput.addEventListener('input', updateEntryNotesCount);
    els.entryForm
      .querySelectorAll('input[name="entryVisibility"]')
      .forEach((input) =>
        input.addEventListener('change', syncEntryVisibilityHint)
      );

    els.entryForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveEntry();
    });

    els.entryForm.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        saveEntry();
      }
    });

    els.entryDialogCloseBtn.addEventListener('click', attemptCloseEntryEditor);
    els.entryCancelBtn.addEventListener('click', attemptCloseEntryEditor);

    els.entryDialog.addEventListener('cancel', (event) => {
      if (!state.entryDraft.dirty) return;
      event.preventDefault();
      attemptCloseEntryEditor();
    });

    els.entryDialog.addEventListener('close', () => {
      state.entryDraft = {
        novelId: null,
        sectionKey: null,
        id: null,
        dirty: false,
      };
      state.draftTags = [];
      els.entryForm.reset();
      els.entryTagInput.value = '';
      clearEntryTitleError();
    });

    els.relationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveRelation();
    });

    els.relationForm.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        saveRelation();
      }
    });

    els.relationDialogCloseBtn.addEventListener('click', () =>
      els.relationDialog.close()
    );
    els.relationCancelBtn.addEventListener('click', () =>
      els.relationDialog.close()
    );

    els.relationLabelInput.addEventListener('input', clearRelationErrors);
    els.relationFromSelect.addEventListener('change', () => {
      clearRelationErrors();
      syncRelationDirectionUI();
    });
    els.relationToSelect.addEventListener('change', () => {
      clearRelationErrors();
      syncRelationDirectionUI();
    });
    els.relationDirectionBoth.addEventListener('change', () => {
      clearRelationErrors();
      syncRelationDirectionUI();
    });
    els.relationDirectionOneWay.addEventListener('change', () => {
      clearRelationErrors();
      syncRelationDirectionUI();
    });

    els.relationPresets.addEventListener('click', (event) => {
      const button = event.target.closest('[data-relation-preset]');
      if (!button) return;
      els.relationLabelInput.value = button.dataset.relationPreset;
      clearRelationErrors();
      els.relationLabelInput.focus();
    });

    els.relationDeleteBtn.addEventListener('click', () => askDeleteRelation());

    els.relationDialog.addEventListener('close', () => {
      if (els.relationDialog.open) return;
      state.relationDraft = { novelId: null, id: null, graphId: null };
      els.relationForm.reset();
      clearRelationErrors();
    });

    els.graphForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveRelationGraph();
    });

    els.graphDialogCloseBtn.addEventListener('click', () =>
      els.graphDialog.close()
    );
    els.graphCancelBtn.addEventListener('click', () => els.graphDialog.close());
    els.graphTitleInput.addEventListener('input', clearGraphError);
    els.graphDeleteBtn.addEventListener('click', () => askDeleteRelationGraph());

    els.graphDialog.addEventListener('close', () => {
      if (els.graphDialog.open) return;
      state.graphDraft = { novelId: null, id: null };
      els.graphForm.reset();
      clearGraphError();
    });

    els.entryTagEditor.addEventListener('click', (event) => {
      if (event.target === els.entryTagEditor) els.entryTagInput.focus();
    });

    els.entryTagInput.addEventListener('compositionstart', () => {
      isComposingTag = true;
    });

    els.entryTagInput.addEventListener('compositionend', () => {
      isComposingTag = false;
    });

    els.entryTagInput.addEventListener('input', () => {
      markEntryDirty();
      if (isComposingTag) return;
      const value = els.entryTagInput.value;
      if (/[,，]/.test(value)) {
        const parts = value.split(/[,，]/);
        const rest = parts.pop() ?? '';
        for (const part of parts) {
          if (part.trim()) addDraftTag(part);
        }
        els.entryTagInput.value = rest;
      }
    });

    els.entryTagInput.addEventListener('keydown', (event) => {
      if (event.isComposing || isComposingTag) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (els.entryTagInput.value.trim()) addDraftTag(els.entryTagInput.value);
        return;
      }

      if (
        event.key === 'Backspace' &&
        !els.entryTagInput.value &&
        state.draftTags.length > 0
      ) {
        state.draftTags.pop();
        markEntryDirty();
        renderEditorTags();
        updateEntryTagSuggestions();
      }
    });

    els.confirmCancelBtn.addEventListener('click', () => resolveConfirm(false));
    els.confirmOkBtn.addEventListener('click', () => resolveConfirm(true));
    els.confirmDialog.addEventListener('close', () => {
      if (!els.confirmDialog.open) state.confirmAction = null;
    });

    els.mapTools.addEventListener('click', (event) => {
      const button = event.target.closest('[data-map-tool]');
      const editor = state.mapEditor;
      if (!button || !editor) return;
      if (editor.pendingPath) commitPendingMapPath();
      const nextTool = button.dataset.mapTool;
      const paletteModeChanged =
        (nextTool === 'feature') !== (editor.tool === 'feature');
      editor.tool = nextTool;
      if (paletteModeChanged) renderMapPalette();
      renderMapToolState();
    });

    els.mapTerrainPalette.addEventListener('click', (event) => {
      const editor = state.mapEditor;
      if (!editor) return;

      const featureButton = event.target.closest('[data-feature]');
      if (featureButton) {
        editor.feature = featureButton.dataset.feature;
        renderMapToolState();
        return;
      }

      const button = event.target.closest('[data-terrain]');
      if (!button) return;
      editor.terrain = button.dataset.terrain;
      editor.tool = 'paint';
      if (editor.pendingPath) commitPendingMapPath();
      renderMapToolState();
    });

    if (els.mapGridBtn) {
      els.mapGridBtn.addEventListener('click', () => {
        const editor = state.mapEditor;
        if (!editor) return;
        editor.showGrid = !editor.showGrid;
        syncMapGridUi();
      });
    }

    if (els.mapBrushRow) {
      els.mapBrushRow.addEventListener('click', (event) => {
        const button = event.target.closest('[data-brush]');
        const editor = state.mapEditor;
        if (!button || !editor) return;
        editor.brushSize = clampInt(button.dataset.brush, 1, 3, 1);
        renderMapToolState();
      });
    }

    if (els.mapSizeColsMinus) {
      els.mapSizeColsMinus.addEventListener('click', () => resizeMapCanvas(-1, 0));
      els.mapSizeColsPlus.addEventListener('click', () => resizeMapCanvas(1, 0));
      els.mapSizeRowsMinus.addEventListener('click', () => resizeMapCanvas(0, -1));
      els.mapSizeRowsPlus.addEventListener('click', () => resizeMapCanvas(0, 1));
    }

    if (els.mapGenerateBtn) {
      els.mapGenerateBtn.addEventListener('click', generateMapTerrain);
    }
    if (els.mapExportBtn) {
      els.mapExportBtn.addEventListener('click', exportMapPng);
    }

    if (els.mapPathList) {
      els.mapPathList.addEventListener('click', (event) => {
        const removeBtn = event.target.closest('[data-remove-path-id]');
        if (removeBtn) {
          deleteMapPath(removeBtn.dataset.removePathId);
          return;
        }
        const item = event.target.closest('.map-path-item');
        if (item) selectMapPath(item.dataset.pathId);
      });
    }

    els.mapZoomInBtn.addEventListener('click', () => zoomMapBy(1.22));
    els.mapZoomOutBtn.addEventListener('click', () => zoomMapBy(1 / 1.22));
    els.mapFitBtn.addEventListener('click', fitMapView);
    els.mapUndoBtn.addEventListener('click', undoMapChange);
    els.mapRedoBtn.addEventListener('click', redoMapChange);
    els.mapMobileZoomInBtn.addEventListener('click', () => zoomMapBy(1.22));
    els.mapMobileZoomOutBtn.addEventListener('click', () => zoomMapBy(1 / 1.22));
    els.mapMobileFitBtn.addEventListener('click', fitMapView);
    els.mapMobileUndoBtn.addEventListener('click', undoMapChange);
    els.mapMobileRedoBtn.addEventListener('click', redoMapChange);

    els.mapClearBtn.addEventListener('click', () => {
      openConfirm({
        title: '清空这张地图？',
        message: '所有地形与城市都会被移除，可以用撤销找回。',
        okLabel: '清空地图',
        onConfirm: () => {
          const editor = state.mapEditor;
          if (!editor) return;
          editor.draft = defaultMap();
          editor.selectedCityId = null;
          pushMapHistory();
          renderMapCanvas();
          renderMapInspector();
        },
      });
    });

    els.mapCancelBtn.addEventListener('click', attemptCloseMapEditor);
    els.mapCloseBtn.addEventListener('click', attemptCloseMapEditor);
    els.mapSaveBtn.addEventListener('click', saveMapEditor);

    els.mapDialog.addEventListener('cancel', (event) => {
      const editor = state.mapEditor;
      if (!editor || JSON.stringify(editor.draft) === editor.history[0]) return;
      event.preventDefault();
      attemptCloseMapEditor();
    });

    els.mapDialog.addEventListener('close', () => {
      state.mapEditor = null;
      els.mapSvg.replaceChildren();
      els.mapStage.classList.remove('is-panning');
    });

    els.mapCityList.addEventListener('click', (event) => {
      const item = event.target.closest('.map-city-item');
      if (!item) return;
      selectMapCity(item.dataset.cityId);
    });

    els.mapCityNameInput.addEventListener('input', () => {
      const editor = state.mapEditor;
      if (!editor) return;
      const city = editor.draft.cities.find(
        (item) => item.id === editor.selectedCityId
      );
      if (!city) return;
      city.name = els.mapCityNameInput.value.slice(0, 40);
      editor.namePending = true;
      updateMapCityLabel(city);
      syncMapDirtyUi();
    });
    els.mapCityNameInput.addEventListener('change', commitMapCityName);
    els.mapCityNameInput.addEventListener('blur', commitMapCityName);
    els.mapCityNameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        els.mapCityNameInput.blur();
      }
    });

    els.mapRadiusRow.addEventListener('click', (event) => {
      const button = event.target.closest('[data-radius]');
      const editor = state.mapEditor;
      if (!button || !editor) return;
      const city = editor.draft.cities.find(
        (item) => item.id === editor.selectedCityId
      );
      if (!city) return;

      if (button.dataset.radius === 'custom') {
        if (city.customArea) {
          city.customArea = false;
          delete city.cells;
          pushMapHistory();
        } else {
          city.customArea = true;
          if (!Array.isArray(city.cells) || city.cells.length === 0) {
            const seeded = [];
            for (let row = 0; row < editor.draft.rows; row += 1) {
              for (let col = 0; col < editor.draft.cols; col += 1) {
                if (mapHexDistance(col, row, city.col, city.row) <= city.radius) {
                  seeded.push(`${col},${row}`);
                }
              }
            }
            city.cells = seeded;
          }
          editor.tool = 'city';
          renderMapToolState();
          showToast(
            '直接点击或拖动画布上的格子，把它划入或划出这座城的范围'
          );
        }
        renderMapCanvas();
        syncMapCityControls(city);
        syncMapStageTip();
        return;
      }

      if (city.customArea) {
        city.customArea = false;
        delete city.cells;
      }
      const radius = clampInt(button.dataset.radius, 1, 3, 2);
      if (!city.customArea && city.radius === radius) return;
      city.radius = radius;
      pushMapHistory();
      renderMapCanvas();
      syncMapCityControls(city);
    });

    els.mapColorRow.addEventListener('click', (event) => {
      const button = event.target.closest('[data-color]');
      const editor = state.mapEditor;
      if (!button || !editor) return;
      const city = editor.draft.cities.find(
        (item) => item.id === editor.selectedCityId
      );
      if (!city || city.color === button.dataset.color) return;
      city.color = button.dataset.color;
      pushMapHistory();
      renderMapCanvas();
      syncMapCityControls(city);
    });

    els.mapDeleteCityBtn.addEventListener('click', deleteSelectedMapCity);

    els.mapSvg.addEventListener('pointerdown', handleMapPointerDown);
    els.mapSvg.addEventListener('pointermove', handleMapPointerMove);
    els.mapSvg.addEventListener('pointerup', handleMapPointerUp);
    els.mapSvg.addEventListener('pointercancel', handleMapPointerCancel);
    els.mapSvg.addEventListener('wheel', handleMapWheel, { passive: false });
    els.mapSvg.addEventListener('contextmenu', (event) => event.preventDefault());

    document.addEventListener('keydown', (event) => {
      if (!els.mapDialog.open || els.confirmDialog.open) return;
      const editor = state.mapEditor;
      if (!editor) return;

      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (isTyping) return;

      const meta = event.ctrlKey || event.metaKey;
      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redoMapChange();
        else undoMapChange();
        return;
      }
      if (meta && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redoMapChange();
        return;
      }

      if (event.key === 'Escape' && editor.pendingPath) {
        event.preventDefault();
        cancelPendingMapPath();
        return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace')) {
        if (editor.selectedCityId) {
          event.preventDefault();
          deleteSelectedMapCity();
        } else if (editor.selectedPathId) {
          event.preventDefault();
          deleteMapPath(editor.selectedPathId);
        }
      }
    });

    if ('ResizeObserver' in window) {
      const mapObserver = new ResizeObserver(() => {
        if (!state.mapEditor || !els.mapDialog.open) return;
        syncMapViewportBox();
      });
      mapObserver.observe(els.mapStage);
    }

    document.addEventListener('keydown', (event) => {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.shiftKey ||
        event.altKey ||
        event.key.toLowerCase() !== 'k'
      ) {
        return;
      }
      event.preventDefault();
      if (els.searchDialog.open) {
        closeGlobalSearch();
        return;
      }
      if (
        els.novelDialog.open ||
        els.entryDialog.open ||
        els.relationDialog.open ||
        els.graphDialog.open ||
        els.commentDialog.open ||
        els.confirmDialog.open ||
        els.mapDialog.open
      ) {
        return;
      }
      openGlobalSearch();
    });

    document.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (
        els.novelDialog.open ||
        els.entryDialog.open ||
        els.relationDialog.open ||
        els.graphDialog.open ||
        els.commentDialog.open ||
        els.confirmDialog.open ||
        els.mapDialog.open
      ) {
        return;
      }

      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (isTyping) return;

      if (event.key === 'n' || event.key === 'N') {
        if (state.route.view === 'shelf') {
          event.preventDefault();
          openNovelEditor();
        } else if (state.route.sectionKey && state.route.view !== 'outline-editor') {
          event.preventDefault();
          if (state.route.sectionKey === 'outline') {
            window.location.hash = outlineEditorHash(state.route.novel.id);
          } else {
            openEntryEditor({
              novelId: state.route.novel.id,
              sectionKey: state.route.sectionKey,
            });
          }
        }
      } else if (event.key === '/' && state.route.view === 'shelf') {
        event.preventDefault();
        els.shelfSearchInput.focus();
      } else if (event.key === '/' && state.route.view === 'comments') {
        event.preventDefault();
        els.commentsSearchInput.focus();
      }
    });

    window.addEventListener('hashchange', () => {
      if (
        state.outlineDraft.dirty &&
        state.route &&
        state.route.view === 'outline-editor'
      ) {
        const intendedHash = window.location.hash;
        const currentHash = state.outlineDraft.hash;

        if (intendedHash !== currentHash) {
          window.history.replaceState(null, '', currentHash);
          openConfirm({
            title: '放弃这次修改？',
            message: '离开编辑页后，尚未保存的大纲内容会丢失。',
            okLabel: '放弃修改',
            onConfirm: () => {
              state.outlineDraft.dirty = false;
              window.location.hash = intendedHash;
            },
          });
          return;
        }
      }

      const nextRoute = parseRoute();
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (
        nextRoute.view === 'entry' &&
        !reduceMotion &&
        !state.pendingCommentFocus
      ) {
        if (typeof document.startViewTransition === 'function') {
          try {
            document.startViewTransition(() => renderRoute({ scroll: true }));
            return;
          } catch (error) {
            /* 回退到下面的淡入 */
          }
        }
        renderRoute({ scroll: true });
        els.novelView.classList.remove('is-route-entering');
        void els.novelView.offsetWidth;
        els.novelView.classList.add('is-route-entering');
        return;
      }

      renderRoute({ scroll: true, animateFrame: true });
    });

    window.addEventListener('beforeunload', (event) => {
      if (!state.outlineDraft.dirty) return;
      event.preventDefault();
      event.returnValue = '';
    });

    window.addEventListener('storage', (event) => {
      if (event.key === APPEARANCE_KEY) {
        state.appearance = loadAppearance();
        applyAppearance();
        return;
      }
      if (event.key !== STORAGE_KEY) return;
      if (
        state.route &&
        state.route.view === 'outline-editor' &&
        state.outlineDraft.dirty
      ) {
        showToast('其他标签页刚刚修改了书架，请先保存这条大纲', 'error');
        return;
      }
      const library = loadLibrary();
      state.novels = library.novels;
      state.trash = library.trash;
      state.comments = library.comments;
      renderRoute();
      showToast('已同步其他标签页中的改动');
    });
  }

  function handleActionClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    const novelId = actionEl.dataset.novelId || (state.route.novel && state.route.novel.id);
    const sectionKey = actionEl.dataset.sectionKey;
    const entryId = actionEl.dataset.entryId;

    switch (action) {
      case 'edit-novel':
        event.preventDefault();
        openNovelEditor(novelId);
        break;
      case 'delete-novel':
        event.preventDefault();
        askDeleteNovel(novelId);
        break;
      case 'pin-novel':
        event.preventDefault();
        toggleNovelPin(novelId);
        break;
      case 'new-entry':
        event.preventDefault();
        if (!sectionKey) break;
        if (sectionKey === 'outline') {
          window.location.hash = outlineEditorHash(novelId);
        } else {
          openEntryEditor({ novelId, sectionKey });
        }
        break;
      case 'edit-entry':
        event.preventDefault();
        if (!sectionKey || !entryId) break;
        if (sectionKey === 'outline') {
          window.location.hash = outlineEditorHash(novelId, entryId);
        } else {
          openEntryEditor({ novelId, sectionKey, entryId });
        }
        break;
      case 'delete-entry':
        event.preventDefault();
        if (sectionKey && entryId) askDeleteEntry(novelId, sectionKey, entryId);
        break;
      case 'pin-entry':
        event.preventDefault();
        if (sectionKey && entryId) toggleEntryPin(novelId, sectionKey, entryId);
        break;
      case 'characters-view':
        event.preventDefault();
        setCharactersView(actionEl.dataset.view);
        break;
      case 'add-relation':
        event.preventDefault();
        if (novelId) {
          openRelationEditor({ novelId, graphId: actionEl.dataset.graphId || null });
        }
        break;
      case 'layout-graph':
        event.preventDefault();
        if (novelId) relayoutCharacterGraph(novelId, actionEl.dataset.graphId || null);
        break;
      case 'switch-graph':
        event.preventDefault();
        if (novelId && actionEl.dataset.graphId) {
          switchRelationGraph(novelId, actionEl.dataset.graphId);
        }
        break;
      case 'new-graph':
        event.preventDefault();
        if (novelId) openGraphEditor({ novelId });
        break;
      case 'edit-graph':
        event.preventDefault();
        if (novelId && actionEl.dataset.graphId) {
          openGraphEditor({ novelId, graphId: actionEl.dataset.graphId });
        }
        break;
      case 'restore-trash':
        event.preventDefault();
        if (actionEl.dataset.trashId) restoreTrashItem(actionEl.dataset.trashId);
        break;
      case 'purge-trash':
        event.preventDefault();
        if (actionEl.dataset.trashId) askPurgeTrashItem(actionEl.dataset.trashId);
        break;
      case 'clear-trash':
        event.preventDefault();
        askClearTrash();
        break;
      case 'toggle-publish-entries':
        event.preventDefault();
        togglePublishEntries(actionEl.dataset.novelId);
        break;
      case 'export-novel-markdown':
        event.preventDefault();
        if (novelId) exportNovelMarkdown(novelId);
        break;
      case 'export-library':
        event.preventDefault();
        exportLibrary();
        break;
      case 'outline-status-filter':
        event.preventDefault();
        state.outlineStatusFilter = actionEl.dataset.value || 'all';
        refreshCurrentView();
        break;
      case 'comment-status-filter':
        event.preventDefault();
        state.commentDirectory.status = actionEl.dataset.commentStatus || 'open';
        renderComments();
        break;
      case 'comment-status':
        event.preventDefault();
        setCommentStatus(
          actionEl.dataset.commentId,
          actionEl.dataset.statusValue === 'resolved' ? 'open' : 'resolved'
        );
        break;
      case 'continue-last':
        event.preventDefault();
        if (actionEl.dataset.continueHash) {
          window.location.hash = actionEl.dataset.continueHash;
        }
        break;
      case 'dismiss-continue':
        event.preventDefault();
        dismissContinueBanner();
        break;
      case 'edit-map':
        event.preventDefault();
        if (sectionKey && entryId) {
          openMapEditor({ novelId, sectionKey, entryId });
        }
        break;
      case 'jump-comment':
        event.preventDefault();
        if (actionEl.dataset.commentId) jumpToComment(actionEl.dataset.commentId);
        break;
      case 'edit-comment':
        event.preventDefault();
        if (actionEl.dataset.commentId) openCommentEditor(actionEl.dataset.commentId);
        break;
      case 'delete-comment':
        event.preventDefault();
        if (actionEl.dataset.commentId) askDeleteComment(actionEl.dataset.commentId);
        break;
      default:
        break;
    }
  }
})();
