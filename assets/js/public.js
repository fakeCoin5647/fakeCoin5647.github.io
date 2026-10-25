(() => {
  'use strict';

  const PUBLIC_PREVIEW_KEY = 'gushibu.public.preview.v1';
  const PUBLIC_DATA_FILE = 'public-library.json';
  const PREVIEW_MODE =
    new URLSearchParams(window.location.search).get('preview') === '1';

  const SECTIONS = {
    outline: {
      label: '大纲',
      eyebrow: 'OUTLINE',
      icon: 'i-outline',
      description: '主线、分卷与章节',
      notesLabel: '大纲内容',
    },
    characters: {
      label: '角色',
      eyebrow: 'CHARACTERS',
      icon: 'i-users',
      description: '人物、动机与关系',
      notesLabel: '人物档案',
    },
    world: {
      label: '背景',
      eyebrow: 'WORLD',
      icon: 'i-world',
      description: '世界、时代与地点',
      notesLabel: '背景详情',
    },
    settings: {
      label: '设定',
      eyebrow: 'LORE',
      icon: 'i-lore',
      description: '规则、组织与体系',
      notesLabel: '规则详情',
    },
    maps: {
      label: '地图',
      eyebrow: 'MAPS',
      icon: 'i-map',
      description: '地理、区域与空间',
      notesLabel: '地理与场所',
    },
    notes: {
      label: '资料',
      eyebrow: 'NOTES',
      icon: 'i-notes',
      description: '灵感、考据与其他',
      notesLabel: '详细内容',
    },
  };
  const SECTION_KEYS = Object.keys(SECTIONS);

  const NOVEL_STATUS = {
    planning: { label: '构思中', className: 'status-planning' },
    drafting: { label: '写作中', className: 'status-drafting' },
    revising: { label: '修订中', className: 'status-revising' },
    done: { label: '已完成', className: 'status-done' },
  };

  const MAP_DEFAULT_COLS = 22;
  const MAP_DEFAULT_ROWS = 14;
  const MAP_HEX_SIZE = 40;
  const MAP_WORLD_SQRT3 = Math.sqrt(3);
  const MAP_TERRAINS = {
    grass: { fill: '#a2c584', stroke: '#88ab6c', fills: ['#a8cc88', '#9cbe7a', '#b0d190'] },
    plains: { fill: '#d6c37c', stroke: '#b9a65f', fills: ['#ddca88', '#cfbb71', '#e3d292'] },
    forest: { fill: '#71a070', stroke: '#5b8a5a', fills: ['#6da26c', '#78ad77', '#649663'] },
    hills: { fill: '#cba75f', stroke: '#ad8a48', fills: ['#d2ae68', '#c39e54', '#dab772'] },
    mountain: { fill: '#9298a8', stroke: '#767c8c', fills: ['#98a0b2', '#8b91a1', '#a3aab9'] },
    water: { fill: '#8db8d6', stroke: '#75a3c4', fills: ['#93bedb', '#87b0cf', '#9cc6e2'] },
    desert: { fill: '#e6c67f', stroke: '#c9a95e', fills: ['#ecd08c', '#dfbc72', '#f2d998'] },
    snow: { fill: '#ecf1f7', stroke: '#ccd7e7', fills: ['#f1f5fa', '#e7edf5', '#f7f9fc'] },
    swamp: { fill: '#89a37a', stroke: '#6f8a62', fills: ['#8fab7d', '#7f9a70', '#98b488'] },
    volcano: { fill: '#6c6367', stroke: '#544d51', fills: ['#72696d', '#645c60', '#7b7175'] },
  };

  function pickMapTerrainFill(terrainKey, col, row) {
    const terrain = MAP_TERRAINS[terrainKey];
    if (!terrain || !terrain.fills) return terrain ? terrain.fill : '#a2c584';
    const hash = Math.abs((col * 7 + row * 13 + ((col * row) % 5) * 3) % 97);
    return terrain.fills[hash % terrain.fills.length];
  }
  const MAP_PATH_KINDS = {
    river: { color: '#4d86c7', width: 3.6, dash: '' },
    road: { color: '#8a6a48', width: 2.4, dash: '7 5' },
  };
  const MAP_MAX_PATH_POINTS = 400;
  const MAP_PATH_LIMIT = 60;

  const MAP_FEATURES = [
    'grove',
    'ruins',
    'temple',
    'fortress',
    'port',
    'camp',
    'stones',
    'danger',
  ];
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
    loading: $('#publicLoading'),
    updated: $('#publicUpdated'),
    previewBanner: $('#publicPreviewBanner'),
    shelfView: $('#publicShelfView'),
    shelfToolbar: $('#publicShelfToolbar'),
    searchInput: $('#publicSearchInput'),
    searchClearBtn: $('#publicSearchClearBtn'),
    sortSelect: $('#publicSortSelect'),
    shelfCount: $('#publicShelfCount'),
    novelGrid: $('#publicNovelGrid'),
    shelfEmpty: $('#publicShelfEmpty'),
    shelfEmptyTitle: $('#publicShelfEmptyTitle'),
    shelfEmptyText: $('#publicShelfEmptyText'),
    noResults: $('#publicNoResults'),
    noResultsClearBtn: $('#publicNoResultsClearBtn'),
    novelView: $('#publicNovelView'),
    crumbNovel: $('#publicCrumbNovel'),
    novelCover: $('#publicNovelCover'),
    novelKicker: $('#publicNovelKicker'),
    novelTitle: $('#publicNovelTitle'),
    novelSummary: $('#publicNovelSummary'),
    novelMeta: $('#publicNovelMeta'),
    novelSynopsis: $('#publicNovelSynopsis'),
    novelDescription: $('#publicNovelDescription'),
    novelSectionNote: $('#publicNovelSectionNote'),
    sectionGrid: $('#publicSectionGrid'),
    sectionView: $('#publicSectionView'),
    crumbNovelLink: $('#publicCrumbNovelLink'),
    crumbSection: $('#publicCrumbSection'),
    sectionEyebrow: $('#publicSectionEyebrow'),
    sectionTitle: $('#publicSectionTitle'),
    sectionCount: $('#publicSectionCount'),
    sectionDesc: $('#publicSectionDesc'),
    entryGrid: $('#publicEntryGrid'),
    sectionEmpty: $('#publicSectionEmpty'),
    sectionEmptyIcon: $('#publicSectionEmptyIcon'),
    sectionEmptyTitle: $('#publicSectionEmptyTitle'),
    sectionEmptyText: $('#publicSectionEmptyText'),
    sectionRelations: $('#publicSectionRelations'),
    sectionRelationList: $('#publicSectionRelationList'),
    entryView: $('#publicEntryView'),
    entryCrumbNovel: $('#publicEntryCrumbNovel'),
    entryCrumbSection: $('#publicEntryCrumbSection'),
    entryCrumb: $('#publicEntryCrumb'),
    entryKicker: $('#publicEntryKicker'),
    entryTitle: $('#publicEntryTitle'),
    entrySubtitle: $('#publicEntrySubtitle'),
    entryLead: $('#publicEntryLead'),
    entryMapPanel: $('#publicEntryMapPanel'),
    entryMapCount: $('#publicEntryMapCount'),
    entryMap: $('#publicEntryMap'),
    entryNotesTitle: $('#publicEntryNotesTitle'),
    entryNotes: $('#publicEntryNotes'),
    entryNotesEmpty: $('#publicEntryNotesEmpty'),
    entryRelations: $('#publicEntryRelations'),
    entryRelationList: $('#publicEntryRelationList'),
    entryMeta: $('#publicEntryMeta'),
    missingView: $('#publicMissingView'),
    missingTitle: $('#publicMissingTitle'),
    missingText: $('#publicMissingText'),
  };

  const state = {
    ready: false,
    novels: [],
    novelMap: new Map(),
    search: '',
    sort: 'updated',
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
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

  function clampInt(value, min, max, fallback) {
    const number = Math.round(Number(value));
    if (!Number.isFinite(number)) return fallback;
    return Math.min(Math.max(number, min), max);
  }

  function cleanText(value, limit) {
    return typeof value === 'string' ? value.trim().slice(0, limit) : '';
  }

  function parseDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function relativeDate(date) {
    if (!date) return '时间未知';
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
    if (!date) return '时间未知';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 ${hours}:${minutes}`;
  }

  function snapshotDate(value) {
    const date = parseDate(value);
    if (!date) return '';
    const pad = (number) => String(number).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatCardDate(item) {
    const created = parseDate(item.createdAt);
    const updated = parseDate(item.updatedAt) || created;
    if (!created && !updated) {
      return { label: '时间未知', full: '时间未知' };
    }
    const wasEdited =
      created && updated && updated.getTime() - created.getTime() > 2000;
    const label = wasEdited
      ? `更新于 ${relativeDate(updated)}`
      : `记于 ${relativeDate(created || updated)}`;
    const full = `创建于 ${fullDate(created || updated)}${
      wasEdited ? ` · 更新于 ${fullDate(updated)}` : ''
    }`;
    return { label, full };
  }

  function formatNovelMeta(novel) {
    const created = parseDate(novel.createdAt);
    const updated = parseDate(novel.updatedAt) || created;
    const parts = [];
    if (created) {
      parts.push(
        `创建于 ${created.getFullYear()} 年 ${created.getMonth() + 1} 月 ${created.getDate()} 日`
      );
    }
    if (updated) parts.push(`最近更新 ${relativeDate(updated)}`);
    return parts.join(' · ');
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

  /* ---------- 快照读取与规整 ---------- */

  function isImageData(value) {
    return (
      typeof value === 'string' &&
      /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value)
    );
  }

  function sanitizeMap(raw) {
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
      if (!MAP_FEATURES.includes(value)) continue;
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
      if (!item || typeof item !== 'object' || cities.length >= 40) continue;
      const col = clampInt(item.col, 0, cols - 1, null);
      const row = clampInt(item.row, 0, rows - 1, null);
      if (col === null || row === null) continue;
      const id = cleanText(item.id, 80);
      if (!id || seen.has(id)) continue;
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
        color: /^#[0-9a-f]{6}$/i.test(item.color)
          ? item.color
          : MAP_CITY_COLORS[cities.length % MAP_CITY_COLORS.length],
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
      const id = cleanText(item.id, 80);
      if (!id || seenPaths.has(id)) continue;
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

  function sanitizeEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const id = cleanText(raw.id, 100);
    const title = cleanText(raw.title, 60);
    if (!id || !title) return null;

    return {
      id,
      title,
      subtitle: cleanText(raw.subtitle, 60),
      summary: cleanText(raw.summary, 160),
      notes: typeof raw.notes === 'string' ? raw.notes.trim() : '',
      tags: Array.isArray(raw.tags)
        ? raw.tags.map((tag) => cleanText(tag, 20)).filter(Boolean).slice(0, 12)
        : [],
      createdAt: cleanText(raw.createdAt, 40),
      updatedAt: cleanText(raw.updatedAt, 40),
      map: sanitizeMap(raw.map),
    };
  }

  function sanitizeNovel(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const id = cleanText(raw.id, 100);
    const title = cleanText(raw.title, 60);
    if (!id || !title) return null;

    const entries = {};
    for (const key of SECTION_KEYS) {
      const list = raw.entries && Array.isArray(raw.entries[key]) ? raw.entries[key] : [];
      const seen = new Set();
      entries[key] = [];
      for (const item of list) {
        const entry = sanitizeEntry(item);
        if (!entry || seen.has(entry.id)) continue;
        seen.add(entry.id);
        entries[key].push(entry);
      }
    }

    const characterIds = new Set(entries.characters.map((entry) => entry.id));
    const relations = (Array.isArray(raw.relations) ? raw.relations : [])
      .filter(
        (relation) =>
          relation &&
          typeof relation === 'object' &&
          characterIds.has(relation.source) &&
          characterIds.has(relation.target)
      )
      .map((relation) => ({
        id: cleanText(relation.id, 100) || `${relation.source}-${relation.target}`,
        source: relation.source,
        target: relation.target,
        label: cleanText(relation.label, 40),
        directed: relation.directed === true,
        graphId: cleanText(relation.graphId, 100),
      }))
      .slice(0, 300);

    const relationGraphs = (Array.isArray(raw.relationGraphs) ? raw.relationGraphs : [])
      .map((graph) => ({
        id: cleanText(graph && graph.id, 100),
        title: cleanText(graph && graph.title, 40),
      }))
      .filter((graph) => graph.id);

    return {
      id,
      title,
      genre: cleanText(raw.genre, 20),
      summary: cleanText(raw.summary, 160),
      description: typeof raw.description === 'string' ? raw.description.trim() : '',
      status: Object.prototype.hasOwnProperty.call(NOVEL_STATUS, raw.status)
        ? raw.status
        : 'planning',
      tone: clampInt(raw.tone, 0, 4, 0),
      cover: isImageData(raw.cover) ? raw.cover : '',
      pinned: raw.pinned === true,
      createdAt: cleanText(raw.createdAt, 40),
      updatedAt: cleanText(raw.updatedAt, 40),
      entries,
      relations,
      relationGraphs,
    };
  }

  function sanitizeSnapshot(raw) {
    if (
      !raw ||
      typeof raw !== 'object' ||
      raw.kind !== 'public-library' ||
      !Array.isArray(raw.novels)
    ) {
      return null;
    }

    const seen = new Set();
    const novels = [];
    for (const item of raw.novels) {
      const novel = sanitizeNovel(item);
      if (!novel || seen.has(novel.id)) continue;
      seen.add(novel.id);
      novels.push(novel);
    }

    return {
      kind: 'public-library',
      generatedAt: cleanText(raw.generatedAt, 40),
      novels,
    };
  }

  function readPreviewSnapshot() {
    try {
      const raw = localStorage.getItem(PUBLIC_PREVIEW_KEY);
      if (!raw) return null;
      return sanitizeSnapshot(JSON.parse(raw));
    } catch (error) {
      console.warn('读取本机公开预览失败：', error);
      return null;
    }
  }

  async function loadSnapshot() {
    if (PREVIEW_MODE) {
      return { snapshot: readPreviewSnapshot(), error: null };
    }

    try {
      const response = await fetch(
        `${PUBLIC_DATA_FILE}?v=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { snapshot: sanitizeSnapshot(await response.json()), error: null };
    } catch (error) {
      console.warn('读取公开快照失败：', error);
      return { snapshot: null, error };
    }
  }

  /* ---------- 封面与地图 ---------- */

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
      cover.append(el('span', 'cover-title', novel.title), el('span', 'cover-seal', '簿'));
    }

    return cover;
  }

  function mapHasContent(map) {
    return Boolean(
      map && (map.cities.length > 0 || Object.keys(map.tiles).length > 0)
    );
  }

  function roundMapCoordinate(value) {
    return Math.round(value * 10) / 10;
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

  function buildMapMarkup(map) {
    const terrainParts = [];
    const coastParts = [];
    const pathParts = [];
    const featureParts = [];
    const territoryParts = [];
    const borderParts = [];
    const cityParts = [];

    for (let row = 0; row < map.rows; row += 1) {
      for (let col = 0; col < map.cols; col += 1) {
        const terrainKey = map.tiles[`${col},${row}`] || 'grass';
        const center = hexCenter(col, row);
        const terrain = MAP_TERRAINS[terrainKey] || MAP_TERRAINS.grass;
        const fill =
          terrainKey === 'water'
            ? 'url(#mapWaterGrad)'
            : pickMapTerrainFill(terrainKey, col, row);
        const strongShade = ['hills', 'mountain', 'volcano', 'forest', 'swamp'].includes(
          terrainKey
        );
        const softShade = ['grass', 'plains', 'desert'].includes(terrainKey);
        const shadeLayer = strongShade
          ? `<path d="${hexPathAt(center.x, center.y)}" fill="url(#mapShade)"/>`
          : softShade
            ? `<path d="${hexPathAt(center.x, center.y)}" fill="url(#mapShadeSoft)"/>`
            : '';
        terrainParts.push(
          `<path class="map-hex-shape" d="${hexPathAt(center.x, center.y)}" fill="${fill}" stroke="${
            terrain.stroke
          }" stroke-opacity=".5" stroke-width=".7"/>${shadeLayer}${buildMapDecor(
            terrainKey,
            center.x,
            center.y,
            col,
            row
          )}`
        );
      }
    }

    coastParts.push(buildMapCoastline(map));
    pathParts.push(buildMapPathsMarkup(map));

    for (const [key, featureKey] of Object.entries(map.features || {})) {
      const [col, row] = key.split(',').map(Number);
      if (col >= map.cols || row >= map.rows) continue;
      const center = hexCenter(col, row);
      featureParts.push(
        `<g class="map-feature" transform="translate(${roundMapCoordinate(
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
            )}L${roundMapCoordinate(corners[end].x)} ${roundMapCoordinate(
              corners[end].y
            )}`
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
      const center = hexCenter(city.col, city.row);
      const label = city.name.length > 8 ? `${city.name.slice(0, 8)}…` : city.name;
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
      cityParts.push(
        `<g class="map-city-marker" transform="translate(${roundMapCoordinate(
          center.x
        )} ${roundMapCoordinate(center.y)})">
          <circle class="map-city-halo" r="${MAP_HEX_SIZE * 0.64}" fill="${
          city.color
        }" opacity=".18"/>
          <circle class="map-city-disc" r="${MAP_HEX_SIZE * 0.4}" fill="${city.color}"/>
          <circle class="map-city-ring" r="${
            MAP_HEX_SIZE * 0.4
          }" fill="none" stroke="#ffffff" stroke-width="2.4"/>
          <path class="map-city-glyph" d="M0 -8 L2.3 -2.5 L8.2 -2.5 L3.4 1.2 L5.2 7 L0 3.5 L-5.2 7 L-3.4 1.2 L-8.2 -2.5 L-2.3 -2.5 Z" fill="#ffffff" opacity=".92"/>
          <g class="map-city-banner" transform="translate(0 ${bannerY})">
            <path d="${bannerPath}" fill="rgba(252,253,255,.94)" stroke="${city.color}" stroke-width="1.6"/>
            <path d="${stripePath}" fill="${city.color}" opacity=".92"/>
            <text class="map-city-label" x="8" y="${
              bannerHeight / 2 + 5.5
            }" text-anchor="middle">${escapeXml(label)}</text>
            <title>${escapeXml(city.name)}</title>
          </g>
        </g>`
      );
    }

    return [
      `<defs>
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

  function buildMapPathsMarkup(map) {
    const parts = [];
    for (const path of map.paths || []) {
      const config = MAP_PATH_KINDS[path.kind] || MAP_PATH_KINDS.river;
      const dash = config.dash ? ` stroke-dasharray="${config.dash}"` : '';
      const d = catmullRomToBezierPath(path.points);
      const bank =
        path.kind === 'river'
          ? `<path d="${d}" fill="none" stroke="${config.color}" stroke-width="${
              config.width + 3
            }" stroke-linecap="round" stroke-linejoin="round" opacity=".22"/>`
          : '';
      parts.push(
        `<g class="map-path-item">${bank}<path d="${d}" fill="none" stroke="${config.color}" stroke-width="${
          config.width
        }"${dash} stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>${
          path.kind === 'river'
            ? `<path d="${d}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2" stroke-linecap="round" transform="translate(0 -1.4)"/>`
            : ''
        }</g>`
      );
    }
    return parts.join('');
  }

  function getMapViewBox(map, padding) {
    const minX = -(MAP_WORLD_SQRT3 / 2) * MAP_HEX_SIZE;
    const minY = -MAP_HEX_SIZE;
    const width = MAP_WORLD_SQRT3 * MAP_HEX_SIZE * (map.cols + 0.5);
    const height = MAP_HEX_SIZE * (1.5 * (map.rows - 1) + 2);
    return `${roundMapCoordinate(minX - padding)} ${roundMapCoordinate(
      minY - padding
    )} ${roundMapCoordinate(width + padding * 2)} ${roundMapCoordinate(
      height + padding * 2
    )}`;
  }

  function createMapSvg(map, { thumb = false } = {}) {
    const padding = thumb ? 10 : 22;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', getMapViewBox(map, padding));
    svg.setAttribute('class', thumb ? 'map-canvas map-thumb' : 'map-canvas map-preview');
    svg.setAttribute(
      'preserveAspectRatio',
      thumb ? 'xMidYMid slice' : 'xMidYMid meet'
    );
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = buildMapMarkup(map);
    return svg;
  }

  /* ---------- 统计 ---------- */

  function sectionEntries(novel, key) {
    return Array.isArray(novel.entries[key]) ? novel.entries[key] : [];
  }

  function countNovelEntries(novel) {
    return SECTION_KEYS.reduce((total, key) => total + sectionEntries(novel, key).length, 0);
  }

  function getStatus(novel) {
    return NOVEL_STATUS[novel.status] || NOVEL_STATUS.planning;
  }

  function sortEntries(entries) {
    return [...entries].sort(
      (a, b) =>
        (parseDate(b.updatedAt)?.getTime() || 0) -
        (parseDate(a.updatedAt)?.getTime() || 0)
    );
  }

  /* ---------- 书架 ---------- */

  function novelSearchText(novel) {
    const parts = [novel.title, novel.genre, novel.summary, novel.description];
    for (const key of SECTION_KEYS) {
      for (const entry of sectionEntries(novel, key)) {
        parts.push(entry.title, entry.subtitle, entry.summary, entry.tags.join(' '));
      }
    }
    return parts.join(' ').toLowerCase();
  }

  function createStatusPill(novel) {
    const status = getStatus(novel);
    const pill = el('span', `status-pill ${status.className}`);
    pill.appendChild(el('i'));
    pill.querySelector('i').setAttribute('aria-hidden', 'true');
    pill.appendChild(el('span', '', status.label));
    return pill;
  }

  function createNovelCard(novel) {
    const card = el('article', 'novel-card');
    card.classList.toggle('is-pinned', novel.pinned);

    const link = el('a', 'novel-card-main');
    link.href = novelHash(novel.id);

    const coverSlot = el('span', 'novel-cover-slot');
    coverSlot.appendChild(createCover(novel, 'shelf'));

    const info = el('span', 'novel-card-info');
    const kicker = el('span', 'novel-kicker');
    kicker.append(createStatusPill(novel), el('span', 'novel-genre', novel.genre || '未标注类型'));

    const title = el('span', 'novel-card-title', novel.title);

    const summary = el('span', 'novel-card-summary');
    if (novel.summary) {
      summary.textContent = novel.summary;
    } else {
      summary.textContent = '还没有写下故事简介。';
      summary.classList.add('is-empty');
    }

    const meta = el(
      'span',
      'novel-card-meta',
      `${sectionEntries(novel, 'characters').length} 位角色 · ${countNovelEntries(novel)} 条公开词条`
    );

    const date = document.createElement('time');
    date.className = 'novel-card-date';
    const dateInfo = formatCardDate(novel);
    date.textContent = dateInfo.label;
    date.title = dateInfo.full;
    if (parseDate(novel.updatedAt)) date.dateTime = novel.updatedAt;

    info.append(kicker, title, summary, meta, date);
    link.append(coverSlot, info);
    card.appendChild(link);
    return card;
  }

  function renderShelf() {
    const query = state.search.trim().toLowerCase();
    const novels = state.novels
      .filter((novel) => !query || novelSearchText(novel).includes(query))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (state.sort === 'title') {
          return a.title.localeCompare(b.title, 'zh-Hans-CN');
        }
        return (
          (parseDate(b.updatedAt)?.getTime() || 0) -
          (parseDate(a.updatedAt)?.getTime() || 0)
        );
      });

    const hasNovels = state.novels.length > 0;
    els.shelfToolbar.hidden = !hasNovels;
    els.shelfEmpty.hidden = hasNovels;
    els.shelfEmptyTitle.textContent = '公开书架还空着';
    els.shelfEmptyText.textContent =
      '作者还没有解锁任何小说。之后公开的故事会出现在这里。';

    if (!hasNovels) {
      els.novelGrid.replaceChildren();
      els.shelfCount.textContent = '';
      els.noResults.hidden = true;
      els.searchClearBtn.hidden = !state.search;
      return;
    }

    const totalEntries = state.novels.reduce(
      (total, novel) => total + countNovelEntries(novel),
      0
    );
    els.shelfCount.textContent = query
      ? `找到 ${novels.length} 本公开小说`
      : `共 ${state.novels.length} 本公开小说 · ${totalEntries} 条公开条目`;

    els.novelGrid.replaceChildren(...novels.map(createNovelCard));
    els.noResults.hidden = novels.length > 0;
    els.searchClearBtn.hidden = !state.search;
  }

  /* ---------- 小说总览 ---------- */

  function renderNovel(novel) {
    document.title = withPreviewSuffix(`${novel.title} · 公开书架 · Coin's Creative Cabin`);
    els.crumbNovel.textContent = novel.title;

    els.novelCover.replaceChildren(createCover(novel, 'hero'));

    const status = getStatus(novel);
    els.novelKicker.replaceChildren(
      createStatusPill(novel),
      el('span', 'novel-genre', novel.genre || '未标注类型')
    );
    els.novelKicker.querySelector('.status-pill').classList.add(status.className);

    els.novelTitle.textContent = novel.title;

    if (novel.summary) {
      els.novelSummary.textContent = novel.summary;
      els.novelSummary.classList.remove('is-empty');
    } else {
      els.novelSummary.textContent = '作者还没有写下故事简介。';
      els.novelSummary.classList.add('is-empty');
    }

    els.novelMeta.textContent = formatNovelMeta(novel);

    if (novel.description) {
      els.novelDescription.textContent = novel.description;
      els.novelDescription.classList.remove('is-empty');
    } else {
      els.novelDescription.textContent = '作者还没有写下完整的故事简介。';
      els.novelDescription.classList.add('is-empty');
    }

    const total = countNovelEntries(novel);
    els.novelSectionNote.textContent =
      total > 0 ? '只展示已经公开的条目。' : '这本书暂时没有公开的条目。';

    const cards = [];
    for (const key of SECTION_KEYS) {
      const entries = sectionEntries(novel, key);
      if (entries.length === 0) continue;
      cards.push(createSectionCard(novel, key, entries.length));
    }
    els.sectionGrid.replaceChildren(...cards);
  }

  function createSectionCard(novel, key, count) {
    const config = SECTIONS[key];
    const card = el('article', 'section-card');
    const link = el('a', 'section-card-main');
    link.href = sectionHash(novel.id, key);

    const iconWrap = el('span', 'section-icon');
    iconWrap.appendChild(icon(config.icon));

    const title = el('h3', 'section-card-title');
    title.append(document.createTextNode(config.label), el('small', '', config.eyebrow));

    const countEl = el('p', 'section-card-count');
    countEl.append(el('strong', '', String(count)), document.createTextNode(' 条公开内容'));

    const enter = el('span', 'section-enter');
    enter.append(icon('i-arrow-right'), document.createTextNode('查看'));

    link.append(
      iconWrap,
      title,
      countEl,
      el('p', 'section-card-desc', config.description),
      enter
    );
    card.appendChild(link);
    return card;
  }

  /* ---------- 分区列表 ---------- */

  function renderSection(novel, sectionKey) {
    const config = SECTIONS[sectionKey];
    const entries = sortEntries(sectionEntries(novel, sectionKey));

    document.title = withPreviewSuffix(
      `${config.label} · ${novel.title} · 公开书架`
    );

    els.crumbNovelLink.textContent = novel.title;
    els.crumbNovelLink.href = novelHash(novel.id);
    els.crumbSection.textContent = config.label;

    els.sectionEyebrow.textContent = config.eyebrow;
    els.sectionTitle.textContent = config.label;
    els.sectionCount.textContent = String(entries.length);
    els.sectionDesc.textContent = config.description;

    if (entries.length === 0) {
      els.entryGrid.replaceChildren();
      els.sectionEmpty.hidden = false;
      els.sectionEmptyIcon.querySelector('use').setAttribute('href', `#${config.icon}`);
      els.sectionEmptyTitle.textContent = '这一区还没有公开内容';
      els.sectionEmptyText.textContent = '作者暂时没有公开这一区的条目。';
    } else {
      els.sectionEmpty.hidden = true;
      els.entryGrid.replaceChildren(
        ...entries.map((entry) => createEntryCard(novel, sectionKey, entry))
      );
    }

    const relationsPanel = els.sectionRelations;
    if (sectionKey === 'characters' && novel.relations.length > 0) {
      const list = buildRelationList(novel, novel.relations);
      if (list) {
        els.sectionRelationList.replaceChildren(...list);
        relationsPanel.hidden = false;
      } else {
        relationsPanel.hidden = true;
        els.sectionRelationList.replaceChildren();
      }
    } else {
      relationsPanel.hidden = true;
      els.sectionRelationList.replaceChildren();
    }
  }

  function createEntryCard(novel, sectionKey, entry) {
    const card = el('article', 'entry-card');
    const link = el('a', 'entry-card-main');
    link.href = entryHash(novel.id, sectionKey, entry.id);

    const title = el('h3', 'entry-card-title', entry.title);
    link.appendChild(title);

    if (sectionKey === 'maps' && entry.map && mapHasContent(entry.map)) {
      const thumb = el('span', 'entry-card-map');
      thumb.appendChild(createMapSvg(entry.map, { thumb: true }));
      if (entry.map.cities.length > 0) {
        thumb.appendChild(
          el('span', 'entry-card-map-badge', `${entry.map.cities.length} 座城市`)
        );
      }
      title.after(thumb);
    }

    if (entry.subtitle) {
      link.appendChild(el('p', 'entry-card-subtitle', entry.subtitle));
    }

    const excerpt = el('p', 'entry-card-excerpt');
    if (entry.summary) {
      excerpt.textContent = entry.summary;
    } else if (entry.notes) {
      excerpt.textContent = entry.notes.replace(/\s+/g, ' ');
    } else {
      excerpt.textContent = '作者还没有补充更多内容。';
      excerpt.classList.add('is-empty');
    }
    link.appendChild(excerpt);

    if (entry.tags.length > 0) {
      const tags = el('div', 'entry-card-tags');
      for (const tag of entry.tags) tags.appendChild(el('span', 'entry-tag', tag));
      link.appendChild(tags);
    }

    const date = document.createElement('time');
    date.className = 'entry-card-date';
    const dateInfo = formatCardDate(entry);
    date.textContent = dateInfo.label;
    date.title = dateInfo.full;
    if (parseDate(entry.updatedAt)) date.dateTime = entry.updatedAt;
    link.appendChild(date);

    card.appendChild(link);
    return card;
  }

  /* ---------- 人物关系 ---------- */

  function characterIndex(novel) {
    const index = new Map();
    for (const entry of sectionEntries(novel, 'characters')) {
      index.set(entry.id, entry);
    }
    return index;
  }

  function graphIndex(novel) {
    const index = new Map();
    for (const graph of novel.relationGraphs) {
      if (graph.title) index.set(graph.id, graph.title);
    }
    return index;
  }

  function buildRelationList(novel, relations) {
    const characters = characterIndex(novel);
    const graphs = graphIndex(novel);
    const rows = [];

    const sorted = [...relations].sort((a, b) => {
      const nameA = characters.get(a.source)?.title || '';
      const nameB = characters.get(b.source)?.title || '';
      return nameA.localeCompare(nameB, 'zh-Hans-CN');
    });

    for (const relation of sorted) {
      const source = characters.get(relation.source);
      const target = characters.get(relation.target);
      if (!source || !target) continue;

      const item = el('li', 'public-relation-item');

      const sourceLink = el('a', 'public-relation-person', source.title);
      sourceLink.href = entryHash(novel.id, 'characters', source.id);

      const targetLink = el('a', 'public-relation-person', target.title);
      targetLink.href = entryHash(novel.id, 'characters', target.id);

      item.append(
        sourceLink,
        el('span', 'public-relation-arrow', relation.directed ? '→' : '—'),
        targetLink,
        el('span', 'public-relation-label', relation.label || '关联')
      );

      const graphTitle = graphs.get(relation.graphId);
      if (graphTitle) {
        item.appendChild(el('span', 'public-relation-graph', graphTitle));
      }

      rows.push(item);
    }

    return rows.length > 0 ? rows : null;
  }

  /* ---------- 条目详情 ---------- */

  function renderEntry(novel, sectionKey, entry) {
    const config = SECTIONS[sectionKey];
    document.title = withPreviewSuffix(
      `${entry.title} · ${config.label} · ${novel.title}`
    );

    els.entryCrumbNovel.textContent = novel.title;
    els.entryCrumbNovel.href = novelHash(novel.id);
    els.entryCrumbSection.textContent = config.label;
    els.entryCrumbSection.href = sectionHash(novel.id, sectionKey);
    els.entryCrumb.textContent = entry.title;

    const kicker = els.entryKicker;
    kicker.replaceChildren(el('span', 'section-chip', config.label));
    for (const tag of entry.tags) kicker.appendChild(el('span', 'entry-tag', tag));

    els.entryTitle.textContent = entry.title;
    els.entrySubtitle.hidden = !entry.subtitle;
    els.entrySubtitle.textContent = entry.subtitle;

    els.entryLead.hidden = !entry.summary;
    els.entryLead.textContent = entry.summary;

    const mapPanel = els.entryMapPanel;
    if (sectionKey === 'maps' && entry.map && mapHasContent(entry.map)) {
      els.entryMap.replaceChildren(createMapSvg(entry.map));
      els.entryMap.setAttribute(
        'aria-label',
        `地图：${entry.title}，${entry.map.cities.length} 座城市`
      );
      els.entryMap.setAttribute('role', 'img');
      els.entryMapCount.textContent =
        entry.map.cities.length > 0
          ? `${entry.map.cities.length} 座城市`
          : '地形图';
      mapPanel.hidden = false;
    } else {
      els.entryMap.replaceChildren();
      els.entryMap.removeAttribute('role');
      mapPanel.hidden = true;
    }

    els.entryNotesTitle.textContent = config.notesLabel;
    if (entry.notes) {
      els.entryNotes.textContent = entry.notes;
      els.entryNotes.hidden = false;
      els.entryNotesEmpty.hidden = true;
    } else {
      els.entryNotes.textContent = '';
      els.entryNotes.hidden = true;
      els.entryNotesEmpty.hidden = false;
    }

    const relationsPanel = els.entryRelations;
    if (sectionKey === 'characters' && novel.relations.length > 0) {
      const related = novel.relations.filter(
        (relation) => relation.source === entry.id || relation.target === entry.id
      );
      const list = related.length > 0 ? buildRelationList(novel, related) : null;
      if (list) {
        els.entryRelationList.replaceChildren(...list);
        relationsPanel.hidden = false;
      } else {
        relationsPanel.hidden = true;
        els.entryRelationList.replaceChildren();
      }
    } else {
      relationsPanel.hidden = true;
      els.entryRelationList.replaceChildren();
    }

    const meta = els.entryMeta;
    meta.replaceChildren();
    const created = parseDate(entry.createdAt);
    const updated = parseDate(entry.updatedAt);
    if (created) meta.appendChild(el('span', '', `创建于 ${fullDate(created)}`));
    if (updated && (!created || updated.getTime() - created.getTime() > 2000)) {
      meta.appendChild(el('span', '', `更新于 ${fullDate(updated)}`));
    }
    if (!meta.childElementCount) meta.appendChild(el('span', '', '时间未知'));
  }

  /* ---------- 路由与视图 ---------- */

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

    const novel = state.novelMap.get(parts[1]);
    if (!novel) {
      return { view: 'missing', missingTitle: '这本小说没有公开', missingText: '可能链接有误，或者作者还没有公开这本小说。' };
    }

    if (!parts[2]) return { view: 'novel', novel };

    if (!Object.prototype.hasOwnProperty.call(SECTIONS, parts[2])) {
      return { view: 'missing', novel };
    }

    const sectionKey = parts[2];
    if (!parts[3]) return { view: 'section', novel, sectionKey };

    const entry = sectionEntries(novel, sectionKey).find(
      (item) => item.id === parts[3]
    );
    if (!entry) {
      return {
        view: 'missing',
        novel,
        missingTitle: '这条档案没有公开',
        missingText: '可能链接有误，或者作者还没有公开这条内容。',
      };
    }

    return { view: 'entry', novel, sectionKey, entry };
  }

  function showView(target) {
    for (const view of [
      els.shelfView,
      els.novelView,
      els.sectionView,
      els.entryView,
      els.missingView,
    ]) {
      view.hidden = view !== target;
    }
  }

  function showMissing(title, text) {
    document.title = withPreviewSuffix('没有可展示的内容 · 公开书架');
    els.missingTitle.textContent = title;
    els.missingText.textContent = text;
    showView(els.missingView);
  }

  function withPreviewSuffix(title) {
    return PREVIEW_MODE ? `${title} · 本机预览` : title;
  }

  function handleRoute() {
    if (!state.ready) return;
    const route = parseRoute();

    if (route.view === 'shelf') {
      document.title = withPreviewSuffix('公开书架 · Coin\'s Creative Cabin');
      renderShelf();
      showView(els.shelfView);
    } else if (route.view === 'novel') {
      renderNovel(route.novel);
      showView(els.novelView);
    } else if (route.view === 'section') {
      renderSection(route.novel, route.sectionKey);
      showView(els.sectionView);
    } else if (route.view === 'entry') {
      renderEntry(route.novel, route.sectionKey, route.entry);
      showView(els.entryView);
    } else {
      showMissing(
        route.missingTitle || '这一页没有公开',
        route.missingText || '可能链接有误，或者作者还没有公开这部分内容。'
      );
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function updateHeader(snapshot) {
    if (!snapshot || !snapshot.generatedAt) {
      els.updated.textContent = PREVIEW_MODE ? '本机预览' : '';
      return;
    }
    const time = snapshotDate(snapshot.generatedAt);
    els.updated.textContent = time
      ? `${PREVIEW_MODE ? '预览' : '更新于'} ${time}`
      : '';
  }

  function bootViews() {
    els.previewBanner.hidden = !PREVIEW_MODE;

    els.searchInput.addEventListener('input', () => {
      state.search = els.searchInput.value;
      renderShelf();
    });

    els.searchClearBtn.addEventListener('click', () => {
      els.searchInput.value = '';
      state.search = '';
      renderShelf();
      els.searchInput.focus();
    });

    els.noResultsClearBtn.addEventListener('click', () => {
      els.searchInput.value = '';
      state.search = '';
      renderShelf();
      els.searchInput.focus();
    });

    els.sortSelect.addEventListener('change', () => {
      state.sort = els.sortSelect.value === 'title' ? 'title' : 'updated';
      renderShelf();
    });

    window.addEventListener('hashchange', handleRoute);
  }

  async function init() {
    bootViews();
    const { snapshot, error } = await loadSnapshot();
    els.loading.hidden = true;

    if (!snapshot) {
      if (PREVIEW_MODE) {
        showMissing(
          '本机还没有公开预览',
          '先回到创作小屋，在「公开作品」里点击「本机预览」，这份只读页面就会在这里打开。'
        );
      } else if (error) {
        showMissing(
          '公开书架暂时打不开',
          '公开内容还没有生成，或者网络暂时不可用。请稍后再试。'
        );
      } else {
        showMissing(
          '公开书架还没有内容',
          '作者还没有发布公开快照。之后公开的故事会出现在这里。'
        );
      }
      return;
    }

    updateHeader(snapshot);
    state.novels = snapshot.novels;
    state.novelMap = new Map(snapshot.novels.map((novel) => [novel.id, novel]));
    state.ready = true;
    handleRoute();
  }

  init().catch((error) => {
    console.error('公开书架初始化失败：', error);
    els.loading.hidden = true;
    showMissing('公开书架暂时打不开', '页面加载时遇到了问题，请稍后刷新再试。');
  });
})();
