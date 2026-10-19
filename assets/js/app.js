(() => {
  'use strict';

  const STORAGE_KEY = 'gushibu.library.v1';
  const LIBRARY_VERSION = 1;
  const MAX_TAGS = 8;
  const MAX_TAG_LENGTH = 16;

  const NOVEL_STATUS = {
    planning: { label: '构思中', className: 'status-planning' },
    drafting: { label: '写作中', className: 'status-drafting' },
    revising: { label: '修订中', className: 'status-revising' },
    done: { label: '已完成', className: 'status-done' },
  };

  const SECTIONS = {
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

  const $ = (selector, scope = document) => scope.querySelector(selector);

  const els = {
    shelfView: $('#shelfView'),
    novelView: $('#novelView'),
    missingView: $('#missingView'),

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

    novelCardTemplate: $('#novelCardTemplate'),
    entryCardTemplate: $('#entryCardTemplate'),

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

    toastStack: $('#toastStack'),
    year: $('#year'),
  };

  const state = {
    novels: [],
    route: null,
    shelf: { query: '', status: 'all', sort: 'updated' },
    novelDraft: { id: null, dirty: false },
    entryDraft: { novelId: null, sectionKey: null, id: null, dirty: false },
    draftTags: [],
    confirmAction: null,
    pendingHighlight: null,
  };

  let isComposingTag = false;

  init();

  function init() {
    state.novels = loadNovels();
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

  function loadNovels() {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return [];
    }
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed.novels)
          ? parsed.novels
          : [];
      return list.map((item) => normalizeNovel(item)?.novel).filter(Boolean);
    } catch (error) {
      console.warn('读取本地故事簿失败：', error);
      return [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: LIBRARY_VERSION, novels: state.novels })
      );
      return true;
    } catch (error) {
      console.error('保存失败：', error);
      showToast('保存失败：浏览器存储空间可能已满', 'error');
      return false;
    }
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
    };
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

    if (parts[0] !== 'novel' || !parts[1]) return { view: 'missing' };

    const novel = findNovel(parts[1]);
    if (!novel) return { view: 'missing' };

    if (!parts[2]) return { view: 'novel', novel, sectionKey: null, entry: null };
    if (!Object.prototype.hasOwnProperty.call(SECTIONS, parts[2])) return { view: 'missing' };

    const sectionKey = parts[2];
    if (!parts[3]) return { view: 'section', novel, sectionKey, entry: null };

    const entry = novel.entries[sectionKey].find((item) => item.id === parts[3]);
    if (!entry) return { view: 'section', novel, sectionKey, entry: null, missingEntry: true };

    return { view: 'entry', novel, sectionKey, entry };
  }

  function renderRoute({ scroll = false } = {}) {
    const route = parseRoute();
    state.route = route;

    if (scroll) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (route.view === 'shelf') {
      showView('shelf');
      renderShelf();
    } else if (route.view === 'missing') {
      showView('missing');
    } else {
      showView('novel');
      renderNovelWorkspace(route);
    }

    updateDocumentTitle(route);
  }

  function refreshCurrentView() {
    renderRoute();
  }

  function showView(name) {
    els.shelfView.hidden = name !== 'shelf';
    els.novelView.hidden = name !== 'novel';
    els.missingView.hidden = name !== 'missing';
  }

  function updateDocumentTitle(route) {
    if (route.view === 'shelf') {
      document.title = '故事簿 · 我的小说书架';
    } else if (route.view === 'missing') {
      document.title = '这一页还没有写进故事里 · 故事簿';
    } else if (route.view === 'novel') {
      document.title = `${route.novel.title} · 故事簿`;
    } else if (route.view === 'section') {
      document.title = `${SECTIONS[route.sectionKey].label} · ${route.novel.title} · 故事簿`;
    } else if (route.view === 'entry') {
      document.title = `${route.entry.title} · ${route.novel.title} · 故事簿`;
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

  /* ---------- Novel workspace ---------- */

  function renderNovelWorkspace(route) {
    const { novel } = route;
    const status = NOVEL_STATUS[novel.status] || NOVEL_STATUS.planning;

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

    cover.append(
      el('span', 'cover-spine'),
      el('span', 'cover-frame'),
      el('span', 'cover-title', novel.title),
      el('span', 'cover-seal', '簿')
    );
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
      el('p', 'eyebrow', 'THE WORLD'),
      el('h2', 'overview-title', '世界档案')
    );
    worldHead.append(
      worldHeadText,
      el('p', 'overview-note', '人物、地点与规则，构成了故事可以发生的地方。')
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

    $('.entry-card-title', node).textContent = entry.title;

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

    state.novelDraft = { id: novel ? novel.id : null, dirty: false };
    els.novelForm.reset();
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

  function saveEntry() {
    const title = els.entryTitleInput.value.trim();
    if (!title) {
      showEntryTitleError();
      return;
    }

    const { novelId, sectionKey, id } = state.entryDraft;
    const novel = findNovel(novelId);
    if (!novel) {
      els.entryDialog.close();
      showToast('这本小说已经不在了', 'error');
      refreshCurrentView();
      return;
    }

    if (els.entryTagInput.value.trim()) addDraftTag(els.entryTagInput.value);

    const tags = normalizeTags(state.draftTags);
    const now = new Date().toISOString();
    const isNew = !id;
    const previous = state.novels;
    let savedId = id;

    let nextEntries;
    if (isNew) {
      savedId = makeId();
      const entry = {
        id: savedId,
        title: title.slice(0, 60),
        subtitle: els.entrySubtitleInput.value.trim().slice(0, 60),
        summary: els.entrySummaryInput.value.trim().slice(0, 160),
        notes: els.entryNotesInput.value.trim(),
        tags,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      };
      nextEntries = [entry, ...novel.entries[sectionKey]];
    } else {
      nextEntries = novel.entries[sectionKey].map((entry) =>
        entry.id === savedId
          ? {
              ...entry,
              title: title.slice(0, 60),
              subtitle: els.entrySubtitleInput.value.trim().slice(0, 60),
              summary: els.entrySummaryInput.value.trim().slice(0, 160),
              notes: els.entryNotesInput.value.trim(),
              tags,
              updatedAt: now,
            }
          : entry
      );
    }

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

    if (isNew) {
      if (wasOnTargetSection) {
        refreshCurrentView();
        highlightEntryCard(savedId, { scroll: true });
      } else {
        state.pendingHighlight = { novelId, sectionKey, entryId: savedId };
        window.location.hash = sectionHash(novelId, sectionKey);
      }
      showToast(`${config.singular}已收录`);
    } else {
      refreshCurrentView();
      if (wasOnTargetSection) highlightEntryCard(savedId, { scroll: true });
      showToast('修改已保存');
    }
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
      title: '删除这本小说？',
      message:
        total > 0
          ? `「${novel.title}」以及其中的 ${total} 条内容都会被永久删除，此操作无法撤销。`
          : `「${novel.title}」将从书架中永久删除，此操作无法撤销。`,
      okLabel: '删除',
      onConfirm: () => deleteNovel(novelId),
    });
  }

  function deleteNovel(novelId) {
    const novel = findNovel(novelId);
    if (!novel) {
      refreshCurrentView();
      return;
    }

    const previous = state.novels;
    state.novels = state.novels.filter((item) => item.id !== novelId);

    if (!persist()) {
      state.novels = previous;
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

    showToast('小说已从书架移除');
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
      title: `删除这个${config.singular}？`,
      message: `「${entry.title}」将从「${novel.title}」中永久删除，此操作无法撤销。`,
      okLabel: '删除',
      onConfirm: () => deleteEntry(novelId, sectionKey, entryId),
    });
  }

  function deleteEntry(novelId, sectionKey, entryId) {
    const novel = findNovel(novelId);
    if (!novel) {
      refreshCurrentView();
      return;
    }

    const previous = state.novels;
    const now = new Date().toISOString();
    const nextEntries = novel.entries[sectionKey].filter((item) => item.id !== entryId);

    if (nextEntries.length === novel.entries[sectionKey].length) {
      refreshCurrentView();
      return;
    }

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

    showToast(`${SECTIONS[sectionKey].singular}已删除`);
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

      if (!rawNovels) throw new Error('这不是故事簿的备份文件');

      const incoming = [];
      let skipped = 0;

      for (const raw of rawNovels) {
        const result = normalizeNovel(raw);
        if (!result) {
          skipped += 1;
          continue;
        }
        incoming.push(result.novel);
        skipped += result.skippedEntries;
      }

      if (incoming.length === 0) throw new Error('文件里没有有效的小说');

      const previous = state.novels;
      const counts = mergeLibraries(incoming);
      const changed =
        counts.addedNovels > 0 ||
        counts.updatedNovels > 0 ||
        counts.addedEntries > 0 ||
        counts.updatedEntries > 0;

      if (!changed) {
        state.novels = previous;
        showToast('没有发现需要导入的新内容');
        return;
      }

      if (!persist()) {
        state.novels = previous;
        return;
      }

      clearShelfFiltersSilently();
      refreshCurrentView();

      const parts = [];
      if (counts.addedNovels) parts.push(`新增 ${counts.addedNovels} 本小说`);
      if (counts.addedEntries) parts.push(`新增 ${counts.addedEntries} 条内容`);
      if (counts.updatedNovels) parts.push(`更新 ${counts.updatedNovels} 本小说`);
      if (counts.updatedEntries) parts.push(`更新 ${counts.updatedEntries} 条内容`);
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

  function exportLibrary() {
    if (state.novels.length === 0) {
      showToast('书架还空着，先写下第一本小说吧');
      return;
    }

    const now = new Date();
    const payload = {
      app: '故事簿',
      version: LIBRARY_VERSION,
      exportedAt: now.toISOString(),
      novels: state.novels,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `故事簿-备份-${fileDate(now)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    const total = state.novels.reduce((sum, novel) => sum + countNovelEntries(novel), 0);
    showToast(`已导出 ${state.novels.length} 本小说、${total} 条内容`);
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

    els.novelForm.addEventListener('input', () => {
      state.novelDraft.dirty = true;
    });
    els.novelTitleInput.addEventListener('input', clearNovelTitleError);
    els.novelDescriptionInput.addEventListener('input', updateNovelDescriptionCount);

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
      state.novelDraft = { id: null, dirty: false };
      els.novelForm.reset();
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

    document.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (
        els.novelDialog.open ||
        els.entryDialog.open ||
        els.confirmDialog.open
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
        } else if (state.route.sectionKey) {
          event.preventDefault();
          openEntryEditor({
            novelId: state.route.novel.id,
            sectionKey: state.route.sectionKey,
          });
        }
      } else if (event.key === '/' && state.route.view === 'shelf') {
        event.preventDefault();
        els.shelfSearchInput.focus();
      }
    });

    window.addEventListener('hashchange', () => {
      renderRoute({ scroll: true });
    });

    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return;
      state.novels = loadNovels();
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
        if (sectionKey) openEntryEditor({ novelId, sectionKey });
        break;
      case 'edit-entry':
        event.preventDefault();
        if (sectionKey && entryId) {
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
      default:
        break;
    }
  }
})();
