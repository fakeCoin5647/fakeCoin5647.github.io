(() => {
  'use strict';

  const STORAGE_KEY = 'gushibu.library.v1';
  const APPEARANCE_KEY = 'gushibu.appearance.v1';
  const LIBRARY_VERSION = 1;
  const SITE_NAME = "Coin's Creative Cabin";
  const MAX_TAGS = 8;
  const MAX_TAG_LENGTH = 16;
  const DEFAULT_APPEARANCE = { glassAlpha: 78, cardAlpha: 50, blur: 20 };
  const COVER_WIDTH = 480;
  const COVER_HEIGHT = 720;
  const COVER_MAX_LENGTH = 240000;
  const COVER_MAX_FILE_BYTES = 20 * 1024 * 1024;

  const NOVEL_STATUS = {
    planning: { label: '构思中', className: 'status-planning' },
    drafting: { label: '写作中', className: 'status-drafting' },
    revising: { label: '修订中', className: 'status-revising' },
    done: { label: '已完成', className: 'status-done' },
  };

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
      emptyText: '先给主角一个名字，再慢慢补上他的欲望与秘密。',
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

  const MAP_DEFAULT_COLS = 22;
  const MAP_DEFAULT_ROWS = 14;
  const MAP_HEX_SIZE = 40;
  const MAP_HISTORY_LIMIT = 80;
  const MAP_MAX_CITIES = 40;
  const MAP_WORLD_SQRT3 = Math.sqrt(3);

  const MAP_TERRAINS = {
    grass: { label: '草原', fill: '#a9c88e', stroke: '#93b27b' },
    plains: { label: '平原', fill: '#d3ca86', stroke: '#bcb371' },
    forest: { label: '森林', fill: '#7da47c', stroke: '#6b936c' },
    hills: { label: '丘陵', fill: '#c5aa77', stroke: '#ae9463' },
    mountain: { label: '山脉', fill: '#9ba1b0', stroke: '#858c9d' },
    water: { label: '水域', fill: '#8fb8d5', stroke: '#78a5c6' },
    desert: { label: '沙漠', fill: '#e1c993', stroke: '#cbb27c' },
  };
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
    shelfView: $('#shelfView'),
    trashView: $('#trashView'),
    novelView: $('#novelView'),
    missingView: $('#missingView'),

    trashList: $('#trashList'),
    trashEmpty: $('#trashEmpty'),
    trashCount: $('#trashCount'),
    trashClearBtn: $('#trashClearBtn'),

    shelfToolbar: $('#shelfToolbar'),
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
    appearancePanel: $('#appearancePanel'),
    appearanceCloseBtn: $('#appearanceCloseBtn'),
    appearanceResetBtn: $('#appearanceResetBtn'),
    glassAlphaInput: $('#glassAlphaInput'),
    glassAlphaValue: $('#glassAlphaValue'),
    cardAlphaInput: $('#cardAlphaInput'),
    cardAlphaValue: $('#cardAlphaValue'),
    blurInput: $('#blurInput'),
    blurValue: $('#blurValue'),

    statNovels: $('#statNovels'),
    statCharacters: $('#statCharacters'),
    statEntries: $('#statEntries'),

    breadcrumbNovelTitle: $('#breadcrumbNovelTitle'),
    novelCoverSlot: $('#novelCoverSlot'),
    novelStatusPill: $('#novelStatusPill'),
    novelStatusText: $('#novelStatusText'),
    novelGenreLabel: $('#novelGenreLabel'),
    novelTitle: $('#novelTitle'),
    novelHeroSummary: $('#novelHeroSummary'),
    novelHeroMeta: $('#novelHeroMeta'),
    novelPinBtn: $('#novelPinBtn'),
    workspaceNav: $('#workspaceNav'),
    workspaceContent: $('#workspaceContent'),

    sidebarShelfLink: $('#sidebarShelfLink'),
    sidebarTrashLink: $('#sidebarTrashLink'),
    sidebarTrashCount: $('#sidebarTrashCount'),
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
    entryTagEditor: $('#entryTagEditor'),
    entryTagInput: $('#entryTagInput'),
    entryTagSuggestions: $('#entryTagSuggestions'),

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

    toastStack: $('#toastStack'),
    year: $('#year'),
  };

  const state = {
    novels: [],
    trash: [],
    appearance: { ...DEFAULT_APPEARANCE },
    route: null,
    shelf: { query: '', status: 'all', sort: 'updated' },
    novelDraft: { id: null, dirty: false, cover: '', coverBusy: false },
    entryDraft: { novelId: null, sectionKey: null, id: null, dirty: false },
    outlineDraft: { novelId: null, id: null, dirty: false, tags: [], hash: '' },
    draftTags: [],
    confirmAction: null,
    pendingHighlight: null,
    mapEditor: null,
  };

  let isComposingTag = false;

  init();

  function init() {
    const library = loadLibrary();
    state.novels = library.novels;
    state.trash = library.trash;
    state.appearance = loadAppearance();
    applyAppearance();
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
      return { novels: [], trash: [] };
    }
    if (!raw) return { novels: [], trash: [] };

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
      const seen = new Set();
      const trash = [];

      for (const rawItem of rawTrash) {
        const item = normalizeTrashItem(rawItem);
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        trash.push(item);
      }
      trash.sort((a, b) => timeValue(b.deletedAt) - timeValue(a.deletedAt));

      return {
        novels: list.map((item) => normalizeNovel(item)?.novel).filter(Boolean),
        trash,
      };
    } catch (error) {
      console.warn('读取本地书架数据失败：', error);
      return { novels: [], trash: [] };
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
    return {
      glassAlpha: read('glassAlpha', 30, 100, DEFAULT_APPEARANCE.glassAlpha),
      cardAlpha: read('cardAlpha', 10, 90, DEFAULT_APPEARANCE.cardAlpha),
      blur: read('blur', 0, 40, DEFAULT_APPEARANCE.blur),
    };
  }

  function applyAppearance() {
    const { glassAlpha, cardAlpha, blur } = state.appearance;
    const root = document.documentElement;
    root.style.setProperty('--glass-alpha', String(glassAlpha / 100));
    root.style.setProperty('--card-alpha', String(cardAlpha / 100));
    root.style.setProperty('--glass-blur', `${blur}px`);

    els.glassAlphaInput.value = String(glassAlpha);
    els.glassAlphaValue.textContent = `${glassAlpha}%`;
    els.cardAlphaInput.value = String(cardAlpha);
    els.cardAlphaValue.textContent = `${cardAlpha}%`;
    els.blurInput.value = String(blur);
    els.blurValue.textContent = `${blur}px`;
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
    const willOpen = els.appearancePanel.hidden;
    els.appearancePanel.hidden = !willOpen;
    els.appearanceBtn.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) els.glassAlphaInput.focus({ preventScroll: true });
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
        createdAt,
        updatedAt,
        entries,
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
      pinned: raw.pinned === true,
      createdAt,
      updatedAt,
      map: normalizeMap(raw.map),
    };
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

      cities.push({
        id,
        name: cleanText(item.name, 40) || '未命名城市',
        col,
        row,
        color: normalizeCityColor(item.color, cities.length),
        radius: clampInt(item.radius, 1, 3, 2),
      });
    }

    return { cols, rows, tiles, cities };
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

  function renderRoute({ scroll = false } = {}) {
    const route = parseRoute();
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

    const compactEntry = scroll
      && route.view === 'entry'
      && window.matchMedia('(max-width: 880px)').matches;

    if (scroll && !compactEntry) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (route.view === 'shelf') {
      showView('shelf');
      renderShelf();
    } else if (route.view === 'trash') {
      showView('trash');
      renderTrash();
    } else if (route.view === 'missing') {
      showView('missing');
      renderSidebar(route);
    } else {
      showView('novel');
      renderNovelWorkspace(route);
    }

    if (compactEntry) {
      const crumb = els.novelView.querySelector('.workspace-breadcrumb');
      if (crumb) crumb.scrollIntoView({ block: 'start', behavior: 'auto' });
    }

    updateDocumentTitle(route);
  }

  function refreshCurrentView() {
    renderRoute();
  }

  function showView(name) {
    els.shelfView.hidden = name !== 'shelf';
    els.trashView.hidden = name !== 'trash';
    els.novelView.hidden = name !== 'novel';
    els.missingView.hidden = name !== 'missing';
  }

  function updateDocumentTitle(route) {
    if (route.view === 'shelf') {
      document.title = `${SITE_NAME} · 我的小说书架`;
    } else if (route.view === 'trash') {
      document.title = `回收站 · ${SITE_NAME}`;
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
    renderShelfStats();
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

  function renderShelfStats() {
    let characters = 0;
    let entries = 0;

    for (const novel of state.novels) {
      characters += novel.entries.characters.length;
      entries += countNovelEntries(novel);
    }

    els.statNovels.textContent = padCount(state.novels.length);
    els.statCharacters.textContent = padCount(characters);
    els.statEntries.textContent = padCount(entries);
  }

  function padCount(count) {
    return String(count).padStart(2, '0');
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

    $('.novel-card-title', node).textContent = novel.title;

    const summaryEl = $('.novel-card-summary', node);
    if (novel.summary) {
      summaryEl.textContent = novel.summary;
    } else {
      summaryEl.textContent = '还没有写下故事简介。';
      summaryEl.classList.add('is-empty');
    }

    $('.novel-card-meta', node).textContent =
      `${novel.entries.characters.length} 位角色 · ${totalEntries} 条词条`;

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
    els.breadcrumbNovelTitle.textContent = novel.title;

    els.novelCoverSlot.replaceChildren(createCover(novel, 'hero'));

    els.novelStatusPill.className = `status-pill ${status.className}`;
    els.novelStatusText.textContent = status.label;
    els.novelGenreLabel.textContent = novel.genre || '未标注类型';

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

  function renderSidebar(route = state.route) {
    const onShelf = Boolean(route && route.view === 'shelf');
    const onTrash = Boolean(route && route.view === 'trash');
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

    els.sidebarTrashLink.classList.toggle('is-active', onTrash);
    if (onTrash) {
      els.sidebarTrashLink.setAttribute('aria-current', 'page');
    } else {
      els.sidebarTrashLink.removeAttribute('aria-current');
    }
    const trashCount = state.trash.length;
    els.sidebarTrashCount.textContent = trashCount > 99 ? '99+' : String(trashCount);
    els.sidebarTrashCount.hidden = trashCount === 0;

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
      fragment.appendChild(link);
    }

    els.sidebarNovelList.replaceChildren(fragment);
    els.sidebarNovelList.hidden = novels.length === 0;
    els.sidebarNovelsEmpty.hidden = novels.length > 0;

    els.sidebarSectionsGroup.hidden = !currentNovel;
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
      iconName: 'i-book',
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
    synopsisHead.append(synopsisHeadText, editSynopsisBtn);

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
    const entries = sortEntries(novel.entries[sectionKey]);
    const fragment = document.createDocumentFragment();

    const head = el('header', 'content-head');
    const headText = el('div', 'content-head-text');
    headText.appendChild(el('p', 'eyebrow', config.eyebrow));

    const heading = el('h2', 'content-title');
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

    head.append(headText, addBtn);
    fragment.appendChild(head);

    if (entries.length === 0) {
      fragment.appendChild(createSectionEmpty(novel, sectionKey));
    } else {
      const grid = el('div', 'entry-grid');
      for (const entry of entries) {
        grid.appendChild(createEntryCard(novel, sectionKey, entry));
      }
      fragment.appendChild(grid);
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
    if (entry.tags.length > 0) {
      for (const tag of entry.tags) {
        tagsEl.appendChild(el('span', 'entry-tag', tag));
      }
    } else {
      tagsEl.remove();
    }

    const dateEl = $('.entry-card-date', node);
    dateEl.textContent = `更新于 ${relativeDate(new Date(entry.updatedAt))}`;
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
    back.append(icon('i-arrow-left'), document.createTextNode(config.backLabel));
    fragment.appendChild(back);

    const article = el('article', 'entry-detail panel');

    const head = el('header', 'entry-detail-head');
    const kicker = el('div', 'entry-detail-kicker');
    kicker.appendChild(el('span', 'section-chip', config.label));
    for (const tag of entry.tags) {
      kicker.appendChild(el('span', 'entry-tag', tag));
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

    const title = el('h2', 'entry-detail-title', entry.title);
    const subtitle = entry.subtitle
      ? el('p', 'entry-detail-subtitle', entry.subtitle)
      : null;

    head.append(kicker, actions, title);
    if (subtitle) head.appendChild(subtitle);

    const body = el('div', 'entry-detail-body');

    if (entry.summary) {
      body.appendChild(el('p', 'entry-lead', entry.summary));
    }

    if (sectionKey === 'maps') {
      body.appendChild(createMapPanel(novel, sectionKey, entry));
    }

    const block = el('section', 'entry-detail-block');
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

  function highlightEntryCard(entryId, { scroll = false } = {}) {
    const card = els.workspaceContent.querySelector(
      `.entry-card[data-entry-id="${cssEscape(entryId)}"]`
    );
    if (!card) return;

    if (scroll) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      card.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }

    card.classList.add('is-highlighted');
    window.setTimeout(() => card.classList.remove('is-highlighted'), 1900);
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
      setNovelStatus(novel.status);
      setNovelTone(novel.tone);
      els.novelDialogEyebrow.textContent = 'EDIT NOVEL';
      els.novelDialogTitle.textContent = '编辑小说';
      els.novelSaveBtn.textContent = '保存修改';
    } else {
      setNovelStatus('planning');
      setNovelTone(state.novels.length % 5);
      els.novelDialogEyebrow.textContent = 'NEW NOVEL';
      els.novelDialogTitle.textContent = '新建小说';
      els.novelSaveBtn.textContent = '放上书架';
    }

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
        createdAt: now,
        updatedAt: now,
        entries: createEmptyEntries(),
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

    if (entry) {
      els.entryTitleInput.value = entry.title;
      els.entrySubtitleInput.value = entry.subtitle;
      els.entrySummaryInput.value = entry.summary;
      els.entryNotesInput.value = entry.notes;
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
    };
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
    return { cols: MAP_DEFAULT_COLS, rows: MAP_DEFAULT_ROWS, tiles: {}, cities: [] };
  }

  function mapHasContent(map) {
    return Boolean(
      map &&
        (map.cities.length > 0 || Object.keys(map.tiles).length > 0)
    );
  }

  function createMapPanel(novel, sectionKey, entry) {
    const block = el('section', 'entry-detail-block entry-map-block');
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

  function buildMapMarkup(map, { selectedCityId = null } = {}) {
    const terrainParts = [];
    const territoryParts = [];
    const borderParts = [];
    const cityParts = [];

    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        terrainParts.push(buildMapHex(col, row, map.tiles[`${col},${row}`] || 'grass'));
      }
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
      `<g class="map-layer map-terrain-layer">${terrainParts.join('')}</g>`,
      `<g class="map-layer map-territory-layer" aria-hidden="true">${territoryParts.join(
        ''
      )}${borderParts.join('')}</g>`,
      `<g class="map-layer map-city-layer">${cityParts.join('')}</g>`,
    ].join('');
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
    return `<path class="map-hex-shape" d="${hexPathAt(center.x, center.y)}" fill="${
      terrain.fill
    }" stroke="${terrain.stroke}" stroke-width=".9"/>${buildMapDecor(
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

    if (terrainKey === 'grass') {
      if ((col * 5 + row * 11) % 3 !== 0) return '';
      return `${open}<path d="M-10 7c1-4 2.6-4 3.4 0M-4 10c1-5 2.6-5 3.4 0M5 5c1-4 2.4-4 3.2 0" fill="none" stroke="rgba(63,92,54,.32)" stroke-width="1.6" stroke-linecap="round"/>${close}`;
    }

    if (terrainKey === 'plains') {
      return `${open}<path d="M-13 0h7M-2 4h9M-8 9h6" fill="none" stroke="rgba(112,94,43,.38)" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="-4" r="1.3" fill="rgba(112,94,43,.32)"/>${close}`;
    }

    if (terrainKey === 'forest') {
      return `${open}<g transform="translate(-8 4)"><path d="M0 -11 L-5 2 H5 Z" fill="#547d57"/><path d="M0 -4 L-7 10 H7 Z" fill="#628e64"/><path d="M-1 10h2v4h-2z" fill="#6d5743"/></g><g transform="translate(6 -3) scale(.62)"><path d="M0 -11 L-5 2 H5 Z" fill="#547d57"/><path d="M0 -4 L-7 10 H7 Z" fill="#628e64"/><path d="M-1 10h2v4h-2z" fill="#6d5743"/></g><g transform="translate(9 8) scale(.5)"><path d="M0 -11 L-5 2 H5 Z" fill="#4b7350"/><path d="M0 -4 L-7 10 H7 Z" fill="#5b8760"/><path d="M-1 10h2v4h-2z" fill="#6d5743"/></g>${close}`;
    }

    if (terrainKey === 'hills') {
      return `${open}<path d="M-15 8c4-13 12-13 16 0M-1 8c4-11 11-11 15 0" fill="none" stroke="rgba(101,78,41,.4)" stroke-width="2.4" stroke-linecap="round"/><path d="M-8 12h6M2 13h7" fill="none" stroke="rgba(101,78,41,.28)" stroke-width="1.6" stroke-linecap="round"/>${close}`;
    }

    if (terrainKey === 'mountain') {
      return `${open}<path d="M-17 12 L-3 -13 L11 12 Z" fill="#7b8293"/><path d="M-3 -13 L0 -6 L-8 -6 Z" fill="#eef2f8"/><path d="M2 12 L11 -2 L20 12 Z" fill="#959baa" opacity=".92"/><path d="M11 -2 L13 2 L9 2 Z" fill="#eef2f8" opacity=".9"/>${close}`;
    }

    if (terrainKey === 'water') {
      return `${open}<path d="M-15 0c3.5-4 7-4 10.5 0s7 4 10.5 0M-12 9c3.5-4 7-4 10.5 0s7 4 10.5 0" fill="none" stroke="rgba(255,255,255,.62)" stroke-width="2.2" stroke-linecap="round"/>${close}`;
    }

    if (terrainKey === 'desert') {
      return `${open}<circle cx="9" cy="-8" r="3.2" fill="rgba(255,241,192,.9)"/><path d="M-16 6c4-8 10-8 14 0M-1 11c4-7 10-7 14 0" fill="none" stroke="rgba(153,112,49,.4)" stroke-width="2" stroke-linecap="round"/>${close}`;
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

    return `<g class="map-city-marker${
      selected ? ' is-selected' : ''
    }" data-city-id="${escapeXml(city.id)}" transform="translate(${roundMapCoordinate(
      center.x
    )} ${roundMapCoordinate(center.y)})">
      <circle class="map-city-halo" r="${MAP_HEX_SIZE * 0.64}" fill="${
      city.color
    }" opacity=".18"/>
      ${selectRing}
      <circle class="map-city-disc" r="${radius}" fill="${city.color}"/>
      <circle class="map-city-ring" r="${radius}" fill="none" stroke="#ffffff" stroke-width="2.4"/>
      <path class="map-city-glyph" d="M0 -8 L2.3 -2.5 L8.2 -2.5 L3.4 1.2 L5.2 7 L0 3.5 L-5.2 7 L-3.4 1.2 L-8.2 -2.5 L-2.3 -2.5 Z" fill="#ffffff" opacity=".92"/>
      <text class="map-city-label" y="${
        MAP_HEX_SIZE + 4
      }" text-anchor="middle">${escapeXml(label)}</text>
      <title>${escapeXml(city.name)}</title>
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
      selectedCityId: null,
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
    renderMapPalette();
    renderMapToolState();
    renderMapCanvas();
    renderMapInspector();
    syncMapDirtyUi();

    els.mapDialog.showModal();
    fitMapView();
    requestAnimationFrame(fitMapView);
  }

  function renderMapPalette() {
    const editor = state.mapEditor;
    if (!editor) return;

    const fragment = document.createDocumentFragment();
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

    updateMapStageCursor();
    syncMapStageTip();
  }

  function updateMapStageCursor() {
    const editor = state.mapEditor;
    if (!editor) return;
    els.mapStage.classList.toggle('is-city-mode', editor.tool === 'city');
    els.mapStage.classList.toggle(
      'is-paint-mode',
      editor.tool === 'paint' || editor.tool === 'erase'
    );
  }

  function syncMapStageTip() {
    const editor = state.mapEditor;
    if (!editor) return;
    const empty = editor.draft.cities.length === 0;
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
          el('span', 'map-city-item-meta', `${city.radius} 格`)
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
      const active = Number(button.dataset.radius) === city.radius;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function syncMapCityControls(city) {
    els.mapCityCoord.textContent = `第 ${city.row + 1} 行 · 第 ${
      city.col + 1
    } 列 · 半径 ${city.radius} 格`;
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
      if (meta) meta.textContent = `${city.radius} 格`;
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
    if (current === next) return;

    if (next === 'grass') {
      delete editor.draft.tiles[key];
    } else {
      editor.draft.tiles[key] = next;
    }

    const tile = els.mapSvg.querySelector(
      `.map-hex[data-col="${col}"][data-row="${row}"]`
    );
    if (tile) {
      tile.dataset.terrain = next;
      tile.innerHTML = buildMapHexInner(col, row, next);
    }
    syncMapDirtyUi();
  }

  function paintMapCellAt(cell, pointer) {
    if (!cell) return;
    const key = `${cell.col},${cell.row}`;
    if (pointer.lastPaintKey === key) return;
    pointer.lastPaintKey = key;
    paintMapCell(cell.col, cell.row);
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
    if (
      editor.selectedCityId &&
      !editor.draft.cities.some((city) => city.id === editor.selectedCityId)
    ) {
      editor.selectedCityId = null;
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

  function handleMapPointerDown(event) {
    const editor = state.mapEditor;
    if (!editor || !els.mapDialog.open) return;
    if (event.button !== 0 && event.button !== 1) return;
    event.preventDefault();

    const cityEl = event.target.closest('.map-city-marker');
    const cell = eventToMapCell(event);
    const pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      cell,
      cityId: cityEl ? cityEl.dataset.cityId : null,
      mode: 'idle',
      lastPaintKey: null,
    };

    const wantsPan =
      event.button === 1 || event.shiftKey || editor.tool === 'browse' || editor.tool === 'city';

    if (wantsPan || cityEl) {
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
        pointer.mode = 'pan';
        els.mapStage.classList.add('is-panning');
      }
    }

    if (pointer.mode === 'pan') {
      editor.view.tx += dx;
      editor.view.ty += dy;
      applyMapView();
    } else if (pointer.mode === 'paint') {
      paintMapCellAt(eventToMapCell(event), pointer);
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
    } else if (pointer.mode === 'pending') {
      if (pointer.cityId) {
        selectMapCity(pointer.cityId);
      } else if (editor.tool === 'city') {
        addMapCityAtCell(pointer.cell);
      } else if (editor.tool === 'browse') {
        selectMapCity(null);
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

      if (!rawNovels && rawTrash.length === 0) {
        throw new Error(`这不是 ${SITE_NAME} 的备份文件`);
      }

      const incoming = [];
      const incomingTrash = [];
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

      if (incoming.length === 0 && incomingTrash.length === 0) {
        throw new Error('文件里没有有效的内容');
      }

      const previousNovels = state.novels;
      const previousTrash = state.trash;
      const counts = mergeLibraries(incoming);
      const addedTrash = mergeTrash(incomingTrash);
      const changed =
        counts.addedNovels > 0 ||
        counts.updatedNovels > 0 ||
        counts.addedEntries > 0 ||
        counts.updatedEntries > 0 ||
        addedTrash > 0;

      if (!changed) {
        state.novels = previousNovels;
        state.trash = previousTrash;
        showToast('没有发现需要导入的新内容');
        return;
      }

      if (!persist()) {
        state.novels = previousNovels;
        state.trash = previousTrash;
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

      merged.updatedAt = incomingIsNewer ? inc.updatedAt : current.updatedAt;
      novelMap.set(current.id, merged);
      if (changed) updatedNovels += 1;
    }

    state.novels = [...novelMap.values()];
    return { addedNovels, updatedNovels, addedEntries, updatedEntries };
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

  function exportLibrary() {
    if (state.novels.length === 0 && state.trash.length === 0) {
      showToast('书架和回收站都空着，先写下第一本小说吧');
      return;
    }

    const now = new Date();
    const payload = {
      app: SITE_NAME,
      version: LIBRARY_VERSION,
      exportedAt: now.toISOString(),
      novels: state.novels,
      trash: state.trash,
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
    showToast(`已导出 ${state.novels.length} 本小说、${total} 条内容${trashSuffix}`);
  }

  function fileDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    return `${createdText} · ${updatedText}`;
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
    els.glassAlphaInput.addEventListener('input', () =>
      updateAppearance('glassAlpha', els.glassAlphaInput.value)
    );
    els.cardAlphaInput.addEventListener('input', () =>
      updateAppearance('cardAlpha', els.cardAlphaInput.value)
    );
    els.blurInput.addEventListener('input', () =>
      updateAppearance('blur', els.blurInput.value)
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
      editor.tool = button.dataset.mapTool;
      renderMapToolState();
    });

    els.mapTerrainPalette.addEventListener('click', (event) => {
      const button = event.target.closest('[data-terrain]');
      const editor = state.mapEditor;
      if (!button || !editor) return;
      editor.terrain = button.dataset.terrain;
      editor.tool = 'paint';
      renderMapToolState();
    });

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
      const radius = clampInt(button.dataset.radius, 1, 3, 2);
      if (city.radius === radius) return;
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

      if ((event.key === 'Delete' || event.key === 'Backspace') && editor.selectedCityId) {
        event.preventDefault();
        deleteSelectedMapCity();
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
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (
        els.novelDialog.open ||
        els.entryDialog.open ||
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

      renderRoute({ scroll: true });
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
      case 'edit-map':
        event.preventDefault();
        if (sectionKey && entryId) {
          openMapEditor({ novelId, sectionKey, entryId });
        }
        break;
      default:
        break;
    }
  }
})();
