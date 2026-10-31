/* 课程笔记模块：讲义阅读器（PDF.js）+ 手写批注 + 框选翻译。
 * 路由由 app.js 委托（window.CoursesAPI），本模块自持 DOM 与事件。
 * 用户批注数据存 localStorage `gushibu.courses.v1`，绝不进入公开快照。 */
(() => {
  'use strict';

  const STORAGE_KEY = 'gushibu.courses.v1';
  const DATA_VERSION = 1;
  const SITE_NAME = "Coin's Creative Cabin";
  const MAX_STROKES_PER_PAGE = 400;
  const MAX_POINTS_PER_STROKE = 800;
  const MAX_PAGE_KEYS = 2000;
  const POINT_DECIMALS = 4;
  const STROKE_WIDTH_RANGE = [0.001, 0.04];
  const UNDO_LIMIT = 120;

  const PEN_PRESETS = [
    { id: 'red', label: '红笔', color: '#d64541' },
    { id: 'blue', label: '蓝笔', color: '#3b76d2' },
    { id: 'black', label: '黑笔', color: '#2b2620' },
  ];
  const HIGHLIGHT_COLOR = 'rgba(250, 204, 21, 0.4)';
  const WIDTH_PRESETS = [
    { id: 'thin', label: '细', px: 2.4 },
    { id: 'mid', label: '中', px: 4.2 },
    { id: 'thick', label: '粗', px: 6.8 },
  ];
  const HIGHLIGHT_WIDTH = 16;

  const manifest = window.COURSES_MANIFEST || { courses: [] };

  const state = {
    readOnly: false,
    annotations: {},
    progress: {},
    settings: { immersive: false },
    route: null,
  };

  const viewer = {
    open: false,
    courseId: null,
    lectureId: null,
    pageNum: 1,
    pageCount: 1,
    pdfDoc: null,
    loadingToken: 0,
    renderToken: 0,
    zoom: 1,
    fitScale: 1,
    viewportScale: 1,
    mode: 'read', // read | annotate | translate
    tool: 'pen',
    colorId: 'red',
    widthId: 'mid',
    fingerEnabled: false,
    immersive: false,
    realFsActive: false,
    undoStack: [],
    redoStack: [],
    resizeObserver: null,
    ocrWorker: null,
    ocrLoading: false,
    translating: false,
  };

  /* ---------- 小工具 ---------- */

  const $ = (id) => document.getElementById(id);

  function round4(value) {
    const factor = 10 ** POINT_DECIMALS;
    return Math.round(value * factor) / factor;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function decodeEntities(text) {
    const el = document.createElement('textarea');
    el.innerHTML = text;
    return el.value;
  }

  function findCourse(id) {
    return manifest.courses.find((c) => c.id === id) || null;
  }

  function findLecture(course, id) {
    return course ? course.lectures.find((l) => l.id === id) || null : null;
  }

  function pageKey(courseId, lectureId, pageNum) {
    return `${courseId}/${lectureId}/${pageNum}`;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(
        `script[data-courses-src="${src}"]`
      );
      if (existing) {
        if (existing.dataset.loaded === '1') resolve();
        else existing.addEventListener('load', () => resolve(), { once: true });
        return;
      }
      const el = document.createElement('script');
      el.src = src;
      el.dataset.coursesSrc = src;
      el.onload = () => {
        el.dataset.loaded = '1';
        resolve();
      };
      el.onerror = () => reject(new Error(`脚本加载失败：${src}`));
      document.head.appendChild(el);
    });
  }

  /* ---------- 提示与确认 ---------- */

  let toastTimer = null;
  function toast(message, kind = 'info') {
    const el = $('coursesToast');
    if (!el) return;
    el.textContent = message;
    el.className = `courses-toast is-visible${kind === 'error' ? ' is-error' : ''}`;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.className = 'courses-toast';
    }, 3200);
  }

  function confirmDialog(title, text) {
    return new Promise((resolve) => {
      const dialog = $('coursesConfirmDialog');
      if (!dialog || typeof dialog.showModal !== 'function') {
        resolve(window.confirm(text));
        return;
      }
      $('coursesConfirmTitle').textContent = title;
      $('coursesConfirmText').textContent = text;
      const onDone = () => {
        dialog.removeEventListener('close', onClose);
      };
      const onClose = () => {
        onDone();
        resolve(dialog.returnValue === 'ok');
      };
      dialog.addEventListener('close', onClose, { once: true });
      dialog.showModal();
    });
  }

  /* ---------- 数据层 ---------- */

  function normalizeStroke(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const color = typeof raw.color === 'string' ? raw.color.slice(0, 32) : null;
    if (!color) return null;
    const width = Number(raw.width);
    if (!Number.isFinite(width)) return null;
    const clampedWidth = clamp(width, STROKE_WIDTH_RANGE[0], STROKE_WIDTH_RANGE[1]);
    const highlight = Boolean(raw.highlight);
    const points = [];
    if (Array.isArray(raw.points)) {
      for (const p of raw.points) {
        if (!Array.isArray(p) || p.length < 2 || points.length >= MAX_POINTS_PER_STROKE) break;
        const x = Number(p[0]);
        const y = Number(p[1]);
        const pr = p.length > 2 ? Number(p[2]) : 0.5;
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        points.push([
          round4(clamp(x, 0, 1)),
          round4(clamp(y, 0, 1)),
          Number.isFinite(pr) ? clamp(pr, 0, 1) : 0.5,
        ]);
      }
    }
    if (!points.length) return null;
    return { color, width: round4(clampedWidth), highlight, points };
  }

  function normalizePageEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const strokes = [];
    if (Array.isArray(raw.strokes)) {
      for (const s of raw.strokes) {
        if (strokes.length >= MAX_STROKES_PER_PAGE) break;
        const stroke = normalizeStroke(s);
        if (stroke) strokes.push(stroke);
      }
    }
    return {
      updatedAt:
        typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
      strokes,
    };
  }

  function loadStore() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      /* ignore */
    }
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      if (typeof parsed.version === 'number' && parsed.version > DATA_VERSION) {
        state.readOnly = true;
        return;
      }
      const annotations = {};
      if (parsed.annotations && typeof parsed.annotations === 'object') {
        let count = 0;
        for (const [key, value] of Object.entries(parsed.annotations)) {
          if (count >= MAX_PAGE_KEYS) break;
          const entry = normalizePageEntry(value);
          if (entry) {
            annotations[key] = entry;
            count += 1;
          }
        }
      }
      state.annotations = annotations;
      if (parsed.progress && typeof parsed.progress === 'object') {
        for (const [courseId, p] of Object.entries(parsed.progress)) {
          if (!p || typeof p !== 'object') continue;
          const lecture = typeof p.lecture === 'string' ? p.lecture.slice(0, 16) : null;
          const page = Number(p.page);
          if (lecture && Number.isFinite(page) && page >= 1) {
            state.progress[courseId] = {
              lecture,
              page: Math.floor(page),
              updatedAt:
                typeof p.updatedAt === 'string' ? p.updatedAt : '',
            };
          }
        }
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        state.settings.immersive = Boolean(parsed.settings.immersive);
      }
    } catch (error) {
      console.warn('课程批注数据读取失败：', error);
    }
  }

  let persistTimer = null;
  function persistStore(immediate = false) {
    if (state.readOnly) {
      toast('课程批注数据版本较新，已只读保护；请升级站点后再修改', 'error');
      return;
    }
    const write = () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            version: DATA_VERSION,
            annotations: state.annotations,
            progress: state.progress,
            settings: state.settings,
          })
        );
      } catch (error) {
        console.warn('课程批注保存失败：', error);
        toast('保存批注失败：本机存储空间不足，建议导出批注备份后清理旧批注', 'error');
      }
    };
    if (immediate) {
      clearTimeout(persistTimer);
      write();
      return;
    }
    clearTimeout(persistTimer);
    persistTimer = setTimeout(write, 300);
  }

  function getPageStrokes(key, create = false) {
    let entry = state.annotations[key];
    if (!entry && create) {
      entry = { updatedAt: new Date().toISOString(), strokes: [] };
      state.annotations[key] = entry;
    }
    return entry ? entry.strokes : null;
  }

  /* ---------- 路由 ---------- */

  function parseRoute(parts) {
    if (parts.length === 1) return { view: 'courses' };
    const course = findCourse(parts[1]);
    if (!course) return null;
    if (parts.length === 2) return { view: 'courses' };
    const lecture = findLecture(course, parts[2]);
    if (!lecture) return null;
    let page = 1;
    if (parts.length >= 4) {
      const n = parseInt(parts[3], 10);
      if (!Number.isFinite(n) || n < 1) return null;
      page = n;
    }
    if (parts.length > 4) return null;
    return { view: 'courses', course: course.id, lecture: lecture.id, page };
  }

  function docTitle(route) {
    if (!route || !route.lecture) return `课程笔记 · ${SITE_NAME}`;
    const course = findCourse(route.course);
    const lecture = course ? findLecture(course, route.lecture) : null;
    const lectureLabel = lecture ? `${route.lecture} ${lecture.title}` : route.lecture;
    return `${course ? course.title : '课程'} ${lectureLabel} · ${SITE_NAME}`;
  }

  function updateHash(courseId, lectureId, pageNum) {
    const hash = `#/courses/${courseId}/${lectureId}/${pageNum}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
  }

  /* ---------- 首页 ---------- */

  function lectureAnnotationCount(courseId, lecture) {
    let total = 0;
    let pages = 0;
    for (const [key, entry] of Object.entries(state.annotations)) {
      if (key.startsWith(`${courseId}/${lecture.id}/`)) {
        total += entry.strokes.length;
        if (entry.strokes.length) pages += 1;
      }
    }
    return { total, pages };
  }

  function renderHome() {
    const root = $('coursesHomeRoot');
    const readerRoot = $('coursesReaderRoot');
    if (!root || !readerRoot) return;
    readerRoot.hidden = true;
    root.hidden = false;
    teardownReader();

    const crumb = $('coursesCrumb');
    if (crumb) crumb.textContent = '课程笔记';

    const cards = manifest.courses
      .map((course) => {
        const progress = state.progress[course.id];
        const progressLecture = progress ? findLecture(course, progress.lecture) : null;
        const rows = course.lectures
          .map((lecture) => {
            const marks = lectureAnnotationCount(course.id, lecture);
            const continueHere =
              progressLecture && progressLecture.id === lecture.id
                ? '<span class="course-lecture-continue">上次读到</span>'
                : '';
            const marksLabel = marks.total
              ? `批注 ${marks.total} 笔 · ${marks.pages} 页`
              : '暂无批注';
            return `
              <a class="course-lecture" href="#/courses/${course.id}/${lecture.id}">
                <span class="course-lecture-id">${escapeHtml(lecture.id)}</span>
                <span class="course-lecture-body">
                  <span class="course-lecture-title">${escapeHtml(lecture.title)}</span>
                  <span class="course-lecture-meta">${lecture.pages} 页 · ${marksLabel} ${continueHere}</span>
                </span>
                <svg class="icon course-lecture-go" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
              </a>`;
          })
          .join('');
        return `
          <section class="shelf-section courses-section">
            <header class="content-head">
              <div class="content-head-text">
                <p class="eyebrow">COURSE NOTES</p>
                <h1 class="content-title">${escapeHtml(course.title)} <span class="course-subtitle">${escapeHtml(course.subtitle || '')}</span></h1>
                <p class="content-desc">${escapeHtml(course.description || '')}</p>
              </div>
              <div class="content-head-actions">
                ${
                  progressLecture
                    ? `<a class="btn primary" href="#/courses/${course.id}/${progressLecture.id}/${progress.page || 1}">
                        <svg class="icon" aria-hidden="true"><use href="#i-book"></use></svg>
                        继续阅读${progressLecture ? ` · ${progressLecture.id} p${progress.page || 1}` : ''}
                      </a>`
                    : `<a class="btn primary" href="#/courses/${course.id}/${course.lectures[0].id}">
                        <svg class="icon" aria-hidden="true"><use href="#i-book"></use></svg>
                        从第 1 讲开始
                      </a>`
                }
              </div>
            </header>
            <div class="course-lecture-list">${rows}</div>
          </section>
          <section class="shelf-section courses-data-section">
            <div class="section-head">
              <div>
                <p class="eyebrow">MY ANNOTATIONS</p>
                <h2>批注数据</h2>
              </div>
              <p class="section-note">批注只保存在这台设备上，不会出现在公开页面。换电脑或清理浏览器前，记得先导出备份。</p>
            </div>
            <div class="list-meta"><p id="coursesDataStats" aria-live="polite">${dataStatsText()}</p></div>
            <div class="courses-data-actions">
              <button type="button" class="btn ghost" id="coursesExportBtn">
                <svg class="icon" aria-hidden="true"><use href="#i-export"></use></svg>
                导出批注
              </button>
              <button type="button" class="btn ghost" id="coursesImportBtn">
                <svg class="icon" aria-hidden="true"><use href="#i-import"></use></svg>
                导入批注
              </button>
              <button type="button" class="btn ghost danger-hover" id="coursesClearBtn">
                <svg class="icon" aria-hidden="true"><use href="#i-trash"></use></svg>
                清空全部批注
              </button>
            </div>
          </section>`;
      })
      .join('');

    root.innerHTML = cards || '<section class="shelf-section"><p class="content-desc">还没有配置任何课程。</p></section>';

    $('coursesExportBtn')?.addEventListener('click', exportAnnotations);
    $('coursesImportBtn')?.addEventListener('click', () => $('coursesImportFile')?.click());
    $('coursesClearBtn')?.addEventListener('click', clearAllAnnotations);
  }

  function dataStatsText() {
    const keys = Object.keys(state.annotations);
    let strokes = 0;
    let pages = 0;
    for (const entry of Object.values(state.annotations)) {
      if (entry.strokes.length) {
        strokes += entry.strokes.length;
        pages += 1;
      }
    }
    const bytes = new Blob([JSON.stringify({ annotations: state.annotations })]).size;
    const kb = (bytes / 1024).toFixed(1);
    return pages
      ? `已批注 ${pages} 页、共 ${strokes} 笔，占用约 ${kb} KB 本机存储。`
      : `还没有批注。阅读时切到「批注」模式就能在讲义上手写笔记，占用约 ${kb} KB。`;
  }

  function exportAnnotations() {
    const payload = {
      kind: 'gushibu-courses-annotations',
      version: DATA_VERSION,
      exportedAt: new Date().toISOString(),
      annotations: state.annotations,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    a.href = url;
    a.download = `gushibu-courses-${stamp}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('批注已导出为 JSON 文件');
  }

  function importAnnotations(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== 'object' || !parsed.annotations) {
          throw new Error('文件里没有批注数据');
        }
        if (typeof parsed.version === 'number' && parsed.version > DATA_VERSION) {
          throw new Error('该备份来自更新版本的站点，请先升级站点再导入');
        }
        let merged = 0;
        let skipped = 0;
        for (const [key, value] of Object.entries(parsed.annotations)) {
          const incoming = normalizePageEntry(value);
          if (!incoming) {
            skipped += 1;
            continue;
          }
          const current = state.annotations[key];
          if (!current || current.updatedAt <= incoming.updatedAt) {
            state.annotations[key] = incoming;
            merged += 1;
          } else {
            skipped += 1;
          }
        }
        persistStore(true);
        renderHome();
        toast(`导入完成：合并 ${merged} 页${skipped ? `，跳过 ${skipped} 页（本机更新）` : ''}`);
      } catch (error) {
        toast(`导入失败：${error.message || '文件格式不正确'}`, 'error');
      }
    };
    reader.onerror = () => toast('导入失败：文件读取失败', 'error');
    reader.readAsText(file);
  }

  async function clearAllAnnotations() {
    const pages = Object.keys(state.annotations).length;
    if (!pages) {
      toast('还没有任何批注');
      return;
    }
    const ok = await confirmDialog(
      '清空全部批注',
      `将删除本机保存的全部 ${pages} 页课程批注，且无法恢复。确定继续吗？（想留底请先导出批注）`
    );
    if (!ok) return;
    state.annotations = {};
    persistStore(true);
    renderHome();
    toast('已清空全部批注');
  }

  /* ---------- 阅读器 ---------- */

  /* ---------- 全屏 / 沉浸阅读 ---------- */

  function setImmersive(on, opts = {}) {
    viewer.immersive = on;
    const reader = $('coursesReader');
    if (reader) reader.classList.toggle('is-immersive', on);
    if (!opts.keepPreference) {
      state.settings.immersive = on;
      persistStore();
    }
    const btn = $('readerFullscreenBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', String(on));
      btn.title = on ? '退出全屏' : '全屏阅读';
    }
    if (on) {
      document.body.style.overflow = 'hidden';
      if (!opts.keepPreference) enterRealFullscreen(reader);
    } else {
      document.body.style.overflow = '';
      exitRealFullscreen();
    }
    refreshFitAndRender();
  }

  function enterRealFullscreen(el) {
    if (!el) return;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen;
    if (typeof fn !== 'function') return;
    try {
      const result = fn.call(el);
      if (result && typeof result.then === 'function') {
        result
          .then(() => { viewer.realFsActive = true; })
          .catch(() => { viewer.realFsActive = false; });
      } else {
        viewer.realFsActive = true;
      }
    } catch (error) {
      viewer.realFsActive = false;
    }
  }

  function exitRealFullscreen() {
    const active = document.fullscreenElement || document.webkitFullscreenElement;
    if (!active) {
      viewer.realFsActive = false;
      return;
    }
    const fn = document.exitFullscreen || document.webkitExitFullscreen;
    try {
      const result = fn && fn.call(document);
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch (error) {
      /* ignore */
    }
    viewer.realFsActive = false;
  }

  function teardownReader() {
    if (viewer.immersive) setImmersive(false, { keepPreference: true });
    viewer.open = false;
    viewer.renderToken += 1;
    if (viewer.resizeObserver) {
      viewer.resizeObserver.disconnect();
      viewer.resizeObserver = null;
    }
    if (viewer.pdfDoc) {
      try {
        viewer.pdfDoc.destroy();
      } catch (error) {
        /* ignore */
      }
      viewer.pdfDoc = null;
    }
  }

  async function renderReader(route) {
    const root = $('coursesReaderRoot');
    const homeRoot = $('coursesHomeRoot');
    if (!root || !homeRoot) return;
    homeRoot.hidden = true;
    root.hidden = false;

    const sameLecture =
      viewer.open &&
      viewer.courseId === route.course &&
      viewer.lectureId === route.lecture;

    if (!sameLecture) {
      teardownReader();
      const course = findCourse(route.course);
      const lecture = findLecture(course, route.lecture);
      if (!course || !lecture) return;
      viewer.open = true;
      viewer.courseId = course.id;
      viewer.lectureId = lecture.id;
      viewer.pageCount = lecture.pages;
      viewer.pageNum = clamp(route.page || 1, 1, lecture.pages);
      viewer.zoom = 1;
      viewer.mode = 'read';
      viewer.undoStack = [];
      viewer.redoStack = [];
      buildReaderShell(course, lecture);
      await openPdf(lecture);
    } else {
      viewer.pageNum = clamp(route.page || 1, 1, viewer.pageCount);
      renderCurrentPage();
    }
  }

  function buildReaderShell(course, lecture) {
    const crumb = $('coursesCrumb');
    if (crumb) crumb.textContent = `${course.title} · ${lecture.id}`;

    const options = course.lectures
      .map(
        (l) =>
          `<option value="${l.id}"${l.id === lecture.id ? ' selected' : ''}>${l.id} ${escapeHtml(l.title)}</option>`
      )
      .join('');

    $('coursesReaderRoot').innerHTML = `
      <div class="reader" id="coursesReader">
        <div class="reader-toolbar" id="readerToolbar">
          <div class="reader-toolbar-row">
            <a class="btn ghost reader-back" href="#/courses">
              <svg class="icon" aria-hidden="true"><use href="#i-arrow-left"></use></svg>
              目录
            </a>
            <label class="reader-lecture-pick">
              <span class="sr-only">选择讲次</span>
              <select id="readerLectureSelect">${options}</select>
            </label>
            <div class="reader-pager">
              <button type="button" class="icon-btn" id="readerPrevBtn" aria-label="上一页" title="上一页（←）">
                <svg class="icon" aria-hidden="true"><use href="#i-arrow-left"></use></svg>
              </button>
              <span class="reader-page-indicator">
                <input type="text" inputmode="numeric" id="readerPageInput" aria-label="页码" value="${viewer.pageNum}">
                <span>/ <span id="readerPageCount">${viewer.pageCount}</span></span>
              </span>
              <button type="button" class="icon-btn" id="readerNextBtn" aria-label="下一页" title="下一页（→）">
                <svg class="icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
              </button>
            </div>
            <div class="reader-zoom">
              <button type="button" class="icon-btn" id="readerZoomOutBtn" aria-label="缩小" title="缩小">
                <svg class="icon" aria-hidden="true"><use href="#i-zoom-out"></use></svg>
              </button>
              <span class="reader-zoom-label" id="readerZoomLabel">100%</span>
              <button type="button" class="icon-btn" id="readerZoomInBtn" aria-label="放大" title="放大">
                <svg class="icon" aria-hidden="true"><use href="#i-zoom-in"></use></svg>
              </button>
              <button type="button" class="icon-btn" id="readerFitBtn" aria-label="适应宽度" title="适应宽度">
                <svg class="icon" aria-hidden="true"><use href="#i-fit"></use></svg>
              </button>
              <button type="button" class="icon-btn" id="readerFullscreenBtn" aria-label="全屏阅读" title="全屏阅读" aria-pressed="false">
                <svg class="icon" aria-hidden="true"><use href="#i-fullscreen"></use></svg>
              </button>
            </div>
            <div class="reader-modes" role="group" aria-label="模式">
              <button type="button" class="reader-mode-btn is-active" data-mode="read" aria-pressed="true">
                <svg class="icon" aria-hidden="true"><use href="#i-hand"></use></svg>阅读
              </button>
              <button type="button" class="reader-mode-btn" data-mode="annotate" aria-pressed="false">
                <svg class="icon" aria-hidden="true"><use href="#i-pencil"></use></svg>批注
              </button>
              <button type="button" class="reader-mode-btn" data-mode="translate" aria-pressed="false">
                <svg class="icon" aria-hidden="true"><use href="#i-translate"></use></svg>翻译
              </button>
            </div>
          </div>
          <div class="reader-toolbar-row reader-tools-row" id="readerAnnotateTools" hidden>
            <div class="reader-tool-group" role="group" aria-label="笔颜色">
              ${PEN_PRESETS.map(
                (p) =>
                  `<button type="button" class="reader-pen${p.id === viewer.colorId ? ' is-active' : ''}" data-pen="${p.id}" style="--pen:${p.color}" aria-label="${p.label}" title="${p.label}"></button>`
              ).join('')}
              <button type="button" class="reader-pen reader-pen-hl${viewer.tool === 'highlighter' ? ' is-active' : ''}" data-pen="highlighter" style="--pen:#facc15" aria-label="荧光笔" title="荧光笔"></button>
            </div>
            <div class="reader-tool-group" role="group" aria-label="粗细">
              ${WIDTH_PRESETS.map(
                (w) =>
                  `<button type="button" class="reader-width${w.id === viewer.widthId ? ' is-active' : ''}" data-width="${w.id}" aria-label="${w.label}笔" title="${w.label}笔"><span style="height:${Math.round(w.px)}px"></span></button>`
              ).join('')}
            </div>
            <div class="reader-tool-group">
              <button type="button" class="btn ghost" id="readerEraserBtn"${viewer.tool === 'eraser' ? ' aria-pressed="true"' : ''}>
                <svg class="icon" aria-hidden="true"><use href="#i-eraser"></use></svg>橡皮
              </button>
              <button type="button" class="icon-btn" id="readerUndoBtn" aria-label="撤销" title="撤销">
                <svg class="icon" aria-hidden="true"><use href="#i-undo"></use></svg>
              </button>
              <button type="button" class="icon-btn" id="readerRedoBtn" aria-label="重做" title="重做">
                <svg class="icon" aria-hidden="true"><use href="#i-redo"></use></svg>
              </button>
              <button type="button" class="btn ghost danger-hover" id="readerClearPageBtn">
                <svg class="icon" aria-hidden="true"><use href="#i-trash"></use></svg>清空本页
              </button>
              <label class="reader-finger-toggle" title="开启后手指也能书写；关闭时只用触控笔/鼠标，避免误触">
                <input type="checkbox" id="readerFingerToggle"${viewer.fingerEnabled ? ' checked' : ''}>
                允许手指书写
              </label>
            </div>
          </div>
          <div class="reader-toolbar-row reader-translate-hint" id="readerTranslateHint" hidden>
            <svg class="icon" aria-hidden="true"><use href="#i-translate"></use></svg>
            <span>在讲义上拖拽框选一段内容，松手后自动识别并翻译（英→中）。公式与手写体识别效果有限，可在结果里修正原文后重新翻译。</span>
            <span class="reader-ocr-status" id="readerOcrStatus"></span>
          </div>
        </div>
        <div class="reader-stage" id="readerStage">
          <div class="reader-page-wrap" id="readerPageWrap" hidden>
            <canvas class="reader-pdf-canvas" id="readerPdfCanvas" aria-label="讲义页面"></canvas>
            <canvas class="reader-anno-canvas" id="readerAnnoCanvas" aria-label="批注层"></canvas>
            <div class="reader-marquee" id="readerMarquee" hidden></div>
          </div>
          <p class="reader-loading" id="readerLoading">正在加载讲义…</p>
        </div>

        <aside class="translate-panel" id="translatePanel" hidden>
        <header class="translate-panel-head">
          <svg class="icon" aria-hidden="true"><use href="#i-translate"></use></svg>
          <span>框选翻译</span>
          <button type="button" class="icon-btn" id="translateCloseBtn" aria-label="关闭翻译面板">
            <svg class="icon" aria-hidden="true"><use href="#i-close"></use></svg>
          </button>
        </header>
        <label class="translate-field-label" for="ocrTextArea">识别原文（可修正后重新翻译）</label>
        <textarea class="translate-source" id="ocrTextArea" rows="4" spellcheck="false"></textarea>
        <div class="translate-actions">
          <button type="button" class="btn primary" id="translateRunBtn">
            <svg class="icon" aria-hidden="true"><use href="#i-translate"></use></svg>翻译
          </button>
          <button type="button" class="btn ghost" id="copySourceBtn">复制原文</button>
        </div>
        <label class="translate-field-label">中文译文</label>
        <div class="translate-target" id="translateTarget">还没有翻译。</div>
        <button type="button" class="btn ghost" id="copyTargetBtn" hidden>复制译文</button>
        </aside>
      </div>`;

    bindReaderEvents(course, lecture);

    const freshReader = $('coursesReader');
    if (freshReader && state.settings.immersive) {
      // 沉浸偏好开启：换讲/翻页重建外壳后保持全屏布局（不重复请求系统全屏）
      viewer.immersive = true;
      freshReader.classList.add('is-immersive');
      document.body.style.overflow = 'hidden';
      const btn = $('readerFullscreenBtn');
      if (btn) {
        btn.setAttribute('aria-pressed', 'true');
        btn.title = '退出全屏';
      }
    }
  }

  function bindReaderEvents(course, lecture) {
    $('readerLectureSelect')?.addEventListener('change', (event) => {
      window.location.hash = `#/courses/${course.id}/${event.target.value}`;
    });
    $('readerPrevBtn')?.addEventListener('click', () => turnPage(-1));
    $('readerNextBtn')?.addEventListener('click', () => turnPage(1));
    const pageInput = $('readerPageInput');
    pageInput?.addEventListener('change', () => {
      const n = parseInt(pageInput.value, 10);
      if (!Number.isFinite(n)) {
        pageInput.value = viewer.pageNum;
        return;
      }
      gotoPage(clamp(n, 1, viewer.pageCount));
    });
    $('readerZoomInBtn')?.addEventListener('click', () => setZoom(viewer.zoom * 1.2));
    $('readerZoomOutBtn')?.addEventListener('click', () => setZoom(viewer.zoom / 1.2));
    $('readerFitBtn')?.addEventListener('click', () => setZoom(1));
    $('readerFullscreenBtn')?.addEventListener('click', () => {
      setImmersive(!viewer.immersive);
    });
    document.querySelectorAll('#coursesReader .reader-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    document.querySelectorAll('#coursesReader .reader-pen').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewer.tool = btn.dataset.pen === 'highlighter' ? 'highlighter' : 'pen';
        if (btn.dataset.pen !== 'highlighter') viewer.colorId = btn.dataset.pen;
        syncToolButtons();
      });
    });
    document.querySelectorAll('#coursesReader .reader-width').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewer.widthId = btn.dataset.width;
        syncToolButtons();
      });
    });
    $('readerEraserBtn')?.addEventListener('click', () => {
      viewer.tool = viewer.tool === 'eraser' ? 'pen' : 'eraser';
      syncToolButtons();
    });
    $('readerUndoBtn')?.addEventListener('click', undoAction);
    $('readerRedoBtn')?.addEventListener('click', redoAction);
    $('readerClearPageBtn')?.addEventListener('click', clearPageAnnotations);
    $('readerFingerToggle')?.addEventListener('change', (event) => {
      viewer.fingerEnabled = event.target.checked;
      $('readerStage')?.classList.toggle('finger-draw', viewer.fingerEnabled);
    });
    $('translateCloseBtn')?.addEventListener('click', () => {
      $('translatePanel').hidden = true;
    });
    $('translateRunBtn')?.addEventListener('click', runTranslation);
    $('copySourceBtn')?.addEventListener('click', () => {
      copyText($('ocrTextArea').value, '原文已复制');
    });
    $('copyTargetBtn')?.addEventListener('click', () => {
      copyText($('translateTarget').textContent, '译文已复制');
    });

    bindStagePointerEvents();

    if (viewer.resizeObserver) viewer.resizeObserver.disconnect();
    const stage = $('readerStage');
    if (stage && typeof ResizeObserver === 'function') {
      let resizeTimer = null;
      viewer.resizeObserver = new ResizeObserver(() => {
        if (!viewer.open) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          refreshFitAndRender();
        }, 160);
      });
      viewer.resizeObserver.observe(stage);
    }
  }

  function syncToolButtons() {
    document.querySelectorAll('#coursesReader .reader-pen').forEach((btn) => {
      const active =
        btn.dataset.pen === 'highlighter'
          ? viewer.tool === 'highlighter'
          : viewer.tool === 'pen' && btn.dataset.pen === viewer.colorId;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('#coursesReader .reader-width').forEach((btn) => {
      const active = viewer.tool !== 'eraser' && btn.dataset.width === viewer.widthId;
      btn.classList.toggle('is-active', active);
    });
    const eraser = $('readerEraserBtn');
    if (eraser) eraser.setAttribute('aria-pressed', String(viewer.tool === 'eraser'));
  }

  function setMode(mode) {
    viewer.mode = mode;
    document.querySelectorAll('#coursesReader .reader-mode-btn').forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    const tools = $('readerAnnotateTools');
    if (tools) tools.hidden = mode !== 'annotate';
    const hint = $('readerTranslateHint');
    if (hint) hint.hidden = mode !== 'translate';
    const stage = $('readerStage');
    if (stage) {
      stage.classList.toggle('mode-annotate', mode === 'annotate');
      stage.classList.toggle('mode-translate', mode === 'translate');
      stage.classList.toggle('finger-draw', viewer.fingerEnabled);
    }
    if (mode !== 'translate') {
      const marquee = $('readerMarquee');
      if (marquee) marquee.hidden = true;
      const panel = $('translatePanel');
      if (panel) panel.hidden = true;
    }
    const wrap = $('readerPageWrap');
    if (wrap) redrawAnnotations();
  }

  function penColor() {
    const preset = PEN_PRESETS.find((p) => p.id === viewer.colorId);
    return preset ? preset.color : PEN_PRESETS[0].color;
  }

  function penBasePx() {
    if (viewer.tool === 'highlighter') return HIGHLIGHT_WIDTH;
    const preset = WIDTH_PRESETS.find((w) => w.id === viewer.widthId);
    return preset ? preset.px : WIDTH_PRESETS[1].px;
  }

  /* ---------- PDF 加载与渲染 ---------- */

  let pdfjsReady = false;
  async function ensurePdfJs() {
    if (pdfjsReady && window.pdfjsLib) return;
    await loadScript('assets/vendor/pdfjs/pdf.min.js');
    if (!window.pdfjsLib) throw new Error('PDF 引擎加载失败');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'assets/vendor/pdfjs/pdf.worker.min.js';
    pdfjsReady = true;
  }

  async function openPdf(lecture) {
    const token = ++viewer.loadingToken;
    const loading = $('readerLoading');
    const wrap = $('readerPageWrap');
    if (loading) loading.hidden = false;
    if (wrap) wrap.hidden = true;
    try {
      await ensurePdfJs();
      const doc = await window.pdfjsLib.getDocument(lecture.file).promise;
      if (token !== viewer.loadingToken || !viewer.open) {
        try { doc.destroy(); } catch (e) { /* ignore */ }
        return;
      }
      viewer.pdfDoc = doc;
      viewer.pageCount = doc.numPages || lecture.pages;
      const countEl = $('readerPageCount');
      if (countEl) countEl.textContent = viewer.pageCount;
      viewer.pageNum = clamp(viewer.pageNum, 1, viewer.pageCount);
      if (loading) loading.hidden = true;
      if (wrap) wrap.hidden = false;
      await computeFitScale();
      await renderCurrentPage();
    } catch (error) {
      console.warn('讲义加载失败：', error);
      if (token === viewer.loadingToken && loading) {
        loading.hidden = false;
        loading.textContent = `讲义加载失败：${error && error.message ? error.message : error}（刷新页面可重试）`;
      }
    }
  }

  async function computeFitScale() {
    const stage = $('readerStage');
    if (!stage || !viewer.pdfDoc) return;
    const page = await viewer.pdfDoc.getPage(viewer.pageNum);
    const vp1 = page.getViewport({ scale: 1 });
    const available = stage.clientWidth - 32;
    viewer.fitScale = Math.max(0.2, available / vp1.width);
  }

  async function refreshFitAndRender() {
    await computeFitScale();
    await renderCurrentPage();
  }

  function setZoom(zoom) {
    viewer.zoom = clamp(zoom, 0.4, 5);
    renderCurrentPage();
  }

  let renderChain = Promise.resolve();

  function renderCurrentPage() {
    if (!viewer.open || !viewer.pdfDoc) return Promise.resolve();
    const token = ++viewer.renderToken;
    // pdf.js 不允许同一画布并发渲染：串行排队，过期的渲染直接跳过
    renderChain = renderChain.then(() => doRenderPage(token)).catch(() => {});
    return renderChain;
  }

  async function doRenderPage(token) {
    if (!viewer.open || !viewer.pdfDoc) return;
    if (token !== viewer.renderToken) return;
    const page = await viewer.pdfDoc.getPage(viewer.pageNum);
    if (token !== viewer.renderToken) return;
    const vp1 = page.getViewport({ scale: 1 });
    const scale = viewer.fitScale * viewer.zoom;
    const viewport = page.getViewport({ scale });
    viewer.viewportScale = scale;

    const canvas = $('readerPdfCanvas');
    const anno = $('readerAnnoCanvas');
    const wrap = $('readerPageWrap');
    if (!canvas || !anno || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.floor(vp1.width * scale);
    const cssH = Math.floor(vp1.height * scale);

    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    anno.width = canvas.width;
    anno.height = canvas.height;
    anno.style.width = `${cssW}px`;
    anno.style.height = `${cssH}px`;

    try {
      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: page.getViewport({ scale: scale * dpr }),
      }).promise;
    } catch (error) {
      if (error && error.name === 'RenderingCancelledException') return;
      console.warn('页面渲染失败：', error);
      return;
    }
    if (token !== viewer.renderToken) return;

    redrawAnnotations();
    updatePageChrome();

    const course = findCourse(viewer.courseId);
    if (course) {
      state.progress[course.id] = {
        lecture: viewer.lectureId,
        page: viewer.pageNum,
        updatedAt: new Date().toISOString(),
      };
      persistStore();
    }
  }

  function updatePageChrome() {
    const input = $('readerPageInput');
    if (input && document.activeElement !== input) input.value = viewer.pageNum;
    const zoomLabel = $('readerZoomLabel');
    if (zoomLabel) zoomLabel.textContent = `${Math.round(viewer.zoom * 100)}%`;
  }

  function turnPage(delta) {
    gotoPage(viewer.pageNum + delta);
  }

  function gotoPage(n) {
    const next = clamp(Math.floor(n), 1, viewer.pageCount);
    if (next === viewer.pageNum) return;
    viewer.pageNum = next;
    viewer.undoStack = [];
    viewer.redoStack = [];
    updateHash(viewer.courseId, viewer.lectureId, next);
    refreshFitAndRender();
  }

  /* ---------- 批注层 ---------- */

  function annoContext() {
    const anno = $('readerAnnoCanvas');
    if (!anno) return null;
    return { ctx: anno.getContext('2d'), anno };
  }

  function redrawAnnotations() {
    const anno = $('readerAnnoCanvas');
    const pdf = $('readerPdfCanvas');
    if (!anno || !pdf) return;
    const ctx = anno.getContext('2d');
    ctx.clearRect(0, 0, anno.width, anno.height);
    const cssW = parseFloat(anno.style.width) || anno.width;
    const cssH = parseFloat(anno.style.height) || anno.height;
    const dpr = anno.width / Math.max(1, cssW);
    ctx.save();
    ctx.scale(dpr, dpr);
    const strokes = getPageStrokes(currentKey());
    if (strokes) {
      for (const stroke of strokes) drawStroke(ctx, stroke, cssW, cssH);
    }
    ctx.restore();
  }

  function drawStroke(ctx, stroke, cssW, cssH) {
    const pts = stroke.points;
    if (!pts.length) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.globalCompositeOperation = stroke.highlight ? 'multiply' : 'source-over';
    const baseW = stroke.width * cssW;
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.fillStyle = stroke.color;
      const r = Math.max(0.5, baseW / 2);
      ctx.arc(pts[0][0] * cssW, pts[0][1] * cssH, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      for (let i = 1; i < pts.length; i += 1) {
        const pressure = pts[i][2] ?? 0.5;
        ctx.beginPath();
        ctx.lineWidth = Math.max(0.6, baseW * (0.55 + 0.9 * pressure));
        ctx.moveTo(pts[i - 1][0] * cssW, pts[i - 1][1] * cssH);
        ctx.lineTo(pts[i][0] * cssW, pts[i][1] * cssH);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function currentKey() {
    return pageKey(viewer.courseId, viewer.lectureId, viewer.pageNum);
  }

  /* 撤销 / 重做 / 清空 */

  function pushUndo(action) {
    viewer.undoStack.push(action);
    if (viewer.undoStack.length > UNDO_LIMIT) viewer.undoStack.shift();
    viewer.redoStack = [];
  }

  function undoAction() {
    const action = viewer.undoStack.pop();
    if (!action) return;
    if (action.type === 'add') {
      const strokes = getPageStrokes(action.key);
      if (strokes) {
        const idx = strokes.indexOf(action.stroke);
        if (idx >= 0) strokes.splice(idx, 1);
      }
      viewer.redoStack.push(action);
    } else if (action.type === 'remove') {
      const strokes = getPageStrokes(action.key, true);
      strokes.splice(Math.min(action.index, strokes.length), 0, action.stroke);
      viewer.redoStack.push(action);
    } else if (action.type === 'clear') {
      const entry = state.annotations[action.key];
      if (entry) entry.strokes = action.strokes;
      viewer.redoStack.push(action);
    }
    persistStore();
    redrawAnnotations();
  }

  function redoAction() {
    const action = viewer.redoStack.pop();
    if (!action) return;
    if (action.type === 'add') {
      const strokes = getPageStrokes(action.key, true);
      strokes.push(action.stroke);
      viewer.undoStack.push(action);
    } else if (action.type === 'remove') {
      const strokes = getPageStrokes(action.key);
      if (strokes) {
        const idx = strokes.indexOf(action.stroke);
        if (idx >= 0) strokes.splice(idx, 1);
      }
      viewer.undoStack.push(action);
    } else if (action.type === 'clear') {
      const entry = state.annotations[action.key];
      if (entry) entry.strokes = [];
      viewer.undoStack.push(action);
    }
    persistStore();
    redrawAnnotations();
  }

  async function clearPageAnnotations() {
    const key = currentKey();
    const strokes = getPageStrokes(key);
    if (!strokes || !strokes.length) {
      toast('这一页还没有批注');
      return;
    }
    const ok = await confirmDialog('清空本页批注', `将删除第 ${viewer.pageNum} 页的全部 ${strokes.length} 笔批注，确定吗？`);
    if (!ok) return;
    viewer.undoStack.push({ type: 'clear', key, strokes: strokes.slice() });
    if (viewer.undoStack.length > UNDO_LIMIT) viewer.undoStack.shift();
    viewer.redoStack = [];
    strokes.length = 0;
    persistStore();
    redrawAnnotations();
  }

  /* ---------- 舞台指针交互（批注 / 框选 / 翻页 / 捏合） ---------- */

  function bindStagePointerEvents() {
    const anno = $('readerAnnoCanvas');
    if (!anno) return;

    const pointers = new Map();
    let liveStroke = null;
    let pinchStart = null;
    let swipeStart = null;
    let marqueeStart = null;

    const acceptsDrawing = (event) => {
      if (viewer.mode !== 'annotate') return false;
      if (event.pointerType === 'pen') return true;
      if (event.pointerType === 'mouse') return event.button === 0 || event.buttons === 1;
      if (event.pointerType === 'touch') return viewer.fingerEnabled;
      return false;
    };

    const canvasPoint = (event) => {
      const rect = anno.getBoundingClientRect();
      return {
        x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
        y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
        px: event.clientX - rect.left,
        py: event.clientY - rect.top,
        pressure: event.pointerType === 'pen' && event.pressure > 0 ? event.pressure : 0.5,
      };
    };

    const eraseAt = (pt) => {
      const strokes = getPageStrokes(currentKey());
      if (!strokes || !strokes.length) return;
      const rect = anno.getBoundingClientRect();
      const tol = Math.max(9, penBasePx());
      for (let i = strokes.length - 1; i >= 0; i -= 1) {
        const stroke = strokes[i];
        const baseW = stroke.width * rect.width;
        const threshold = Math.max(tol, baseW * 0.8) + 2;
        const pts = stroke.points;
        for (let j = 0; j < pts.length; j += 1) {
          const dx = pts[j][0] * rect.width - pt.px;
          const dy = pts[j][1] * rect.height - pt.py;
          if (dx * dx + dy * dy <= threshold * threshold) {
            strokes.splice(i, 1);
            pushUndo({ type: 'remove', key: currentKey(), index: i, stroke });
            persistStore();
            redrawAnnotations();
            return;
          }
        }
      }
    };

    anno.addEventListener('pointerdown', (event) => {
      if (!viewer.open) return;
      pointers.set(event.pointerId, event);

      if (viewer.mode === 'annotate' && acceptsDrawing(event)) {
        event.preventDefault();
        try { anno.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
        const pt = canvasPoint(event);
        const cssW = parseFloat(anno.style.width) || 1;
        liveStroke = {
          color: viewer.tool === 'highlighter' ? HIGHLIGHT_COLOR : penColor(),
          highlight: viewer.tool === 'highlighter',
          width: round4(clamp(penBasePx() / cssW, STROKE_WIDTH_RANGE[0], STROKE_WIDTH_RANGE[1])),
          points: [[pt.x, pt.y, pt.pressure]],
        };
        const strokes = getPageStrokes(currentKey(), true);
        if (strokes.length >= MAX_STROKES_PER_PAGE) {
          toast('这一页批注太多了，先整理或导出一下吧', 'error');
          liveStroke = null;
          return;
        }
        strokes.push(liveStroke);
        redrawAnnotations();
        return;
      }

      if (viewer.mode === 'annotate' && event.pointerType === 'touch') {
        // 触摸用于滚动/捏合，不书写
        return;
      }

      if (viewer.mode === 'translate' && (event.pointerType === 'pen' || event.pointerType === 'mouse')) {
        event.preventDefault();
        try { anno.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
        const pt = canvasPoint(event);
        marqueeStart = { x: pt.px, y: pt.py };
        const marquee = $('readerMarquee');
        if (marquee) {
          marquee.hidden = false;
          marquee.style.left = `${pt.px}px`;
          marquee.style.top = `${pt.py}px`;
          marquee.style.width = '0px';
          marquee.style.height = '0px';
        }
        return;
      }

      if (viewer.mode === 'read') {
        swipeStart = { x: event.clientX, y: event.clientY, t: Date.now() };
      }
    });

    anno.addEventListener('pointermove', (event) => {
      if (!viewer.open) return;
      if (pointers.has(event.pointerId)) pointers.set(event.pointerId, event);

      if (liveStroke && acceptsDrawing(event)) {
        event.preventDefault();
        const pt = canvasPoint(event);
        const pts = liveStroke.points;
        const last = pts[pts.length - 1];
        const dx = (pt.x - last[0]) * 1000;
        const dy = (pt.y - last[1]) * 1000;
        if (dx * dx + dy * dy < 1.2) return; // 过滤抖动
        if (pts.length >= MAX_POINTS_PER_STROKE) return;
        pts.push([pt.x, pt.y, pt.pressure]);
        redrawAnnotations();
        return;
      }

      if (marqueeStart) {
        const pt = canvasPoint(event);
        const marquee = $('readerMarquee');
        if (marquee) {
          const left = Math.min(marqueeStart.x, pt.px);
          const top = Math.min(marqueeStart.y, pt.py);
          marquee.style.left = `${left}px`;
          marquee.style.top = `${top}px`;
          marquee.style.width = `${Math.abs(pt.px - marqueeStart.x)}px`;
          marquee.style.height = `${Math.abs(pt.py - marqueeStart.y)}px`;
        }
        return;
      }

      if (viewer.mode === 'read' && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (!pinchStart) {
          pinchStart = { dist, zoom: viewer.zoom };
        } else if (dist > 10) {
          viewer.zoom = clamp(pinchStart.zoom * (dist / pinchStart.dist), 0.4, 5);
          updatePageChrome();
        }
      }
    });

    const finishPointer = (event) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchStart = null;

      if (liveStroke) {
        const strokes = getPageStrokes(currentKey());
        if (strokes) {
          const stroke = liveStroke;
          if (stroke.points.length === 1) {
            // 点一下也留个点
          }
          pushUndo({ type: 'add', key: currentKey(), stroke });
          persistStore();
        }
        liveStroke = null;
        return;
      }

      if (marqueeStart) {
        const pt = canvasPoint(event);
        const rect = {
          x: Math.min(marqueeStart.x, pt.px),
          y: Math.min(marqueeStart.y, pt.py),
          w: Math.abs(pt.px - marqueeStart.x),
          h: Math.abs(pt.py - marqueeStart.y),
        };
        marqueeStart = null;
        const marquee = $('readerMarquee');
        if (marquee) marquee.hidden = true;
        if (rect.w >= 14 && rect.h >= 10) {
          recognizeAndShow(rect);
        }
        return;
      }

      if (swipeStart && viewer.mode === 'read' && pointers.size === 0) {
        const dx = event.clientX - swipeStart.x;
        const dy = event.clientY - swipeStart.y;
        swipeStart = null;
        if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.8) {
          turnPage(dx < 0 ? 1 : -1);
        }
      }
    };

    anno.addEventListener('pointerup', finishPointer);
    anno.addEventListener('pointercancel', (event) => {
      pointers.delete(event.pointerId);
      liveStroke = null;
      marqueeStart = null;
      pinchStart = null;
      swipeStart = null;
      const marquee = $('readerMarquee');
      if (marquee) marquee.hidden = true;
    });
    anno.addEventListener('pointerleave', (event) => {
      if (liveStroke) finishPointer(event);
    });
  }

  /* ---------- 框选翻译 ---------- */

  function showOcrStatus(text) {
    const el = $('readerOcrStatus');
    if (el) el.textContent = text || '';
  }

  function withTimeout(promise, ms, message) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
    ]);
  }

  const OCR_STATUS_LABELS = {
    'loading tesseract core': '加载识别核心',
    'initializing tesseract': '初始化引擎',
    'loading language traineddata': '加载英文语言包',
    'initializing api': '初始化接口',
    'recognizing text': '识别中',
  };

  async function ensureOcrWorker() {
    if (viewer.ocrWorker) return viewer.ocrWorker;
    if (viewer.ocrLoading) return null;
    viewer.ocrLoading = true;
    try {
      await loadScript('assets/vendor/tesseract/tesseract.min.js');
      if (!window.Tesseract) throw new Error('OCR 引擎加载失败');
      showOcrStatus('正在准备识别引擎（首次需数秒）…');
      // Worker 内部的 importScripts 不解析页面相对路径，这里统一转绝对 URL
      const abs = (p) => new URL(p, document.baseURI).href;
      const makeWorker = () =>
        window.Tesseract.createWorker('eng', 1, {
          workerPath: abs('assets/vendor/tesseract/worker.min.js'),
          corePath: abs('assets/vendor/tesseract/'),
          langPath: abs('assets/vendor/tessdata/'),
          gzip: true,
          logger: (m) => {
            if (!m || !m.status) return;
            const label = OCR_STATUS_LABELS[m.status] || m.status;
            const pct = typeof m.progress === 'number' && m.status !== 'recognizing text'
              ? ` ${Math.round(m.progress * 100)}%`
              : m.status === 'recognizing text'
                ? ` ${Math.round(m.progress * 100)}%…`
                : '…';
            showOcrStatus(`${label}${pct}`);
          },
        });
      let worker;
      try {
        worker = await withTimeout(makeWorker(), 30000, '引擎启动超时');
      } catch (error) {
        // 页面刚加载时偶发的 worker 启动竞态：重试一次
        showOcrStatus('引擎启动较慢，正在重试…');
        worker = await withTimeout(makeWorker(), 45000, '引擎启动失败');
      }
      viewer.ocrWorker = worker;
      return worker;
    } finally {
      viewer.ocrLoading = false;
    }
  }

  async function renderPageToCanvas(scale) {
    const page = await viewer.pdfDoc.getPage(viewer.pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
    }).promise;
    return canvas;
  }

  async function recognizeAndShow(rect) {
    if (!viewer.pdfDoc) return;
    const panel = $('translatePanel');
    const source = $('ocrTextArea');
    const target = $('translateTarget');
    if (!panel || !source || !target) return;
    panel.hidden = false;
    source.value = '';
    target.textContent = '正在识别…';
    $('copyTargetBtn').hidden = true;
    try {
      const worker = await ensureOcrWorker();
      if (!worker) {
        target.textContent = '识别引擎正在准备中，稍后再框选一次。';
        return;
      }
      const cssScale = viewer.viewportScale;
      const ocrScale = clamp(Math.max(cssScale, 900 / Math.max(40, rect.w)), cssScale, 3.2);
      const full = await renderPageToCanvas(ocrScale);
      const factor = ocrScale / cssScale;
      const crop = document.createElement('canvas');
      crop.width = Math.max(1, Math.round(rect.w * factor));
      crop.height = Math.max(1, Math.round(rect.h * factor));
      crop.getContext('2d').drawImage(
        full,
        Math.round(rect.x * factor),
        Math.round(rect.y * factor),
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      showOcrStatus('识别中…');
      const result = await worker.recognize(crop);
      const text = (result && result.data && result.data.text ? result.data.text : '').trim();
      source.value = text;
      target.textContent = text ? '点「翻译」把原文翻成中文。' : '没有识别出文字，试着框得紧凑一点或放大页面。';
      showOcrStatus('');
    } catch (error) {
      console.warn('OCR 失败：', error);
      target.textContent = '识别失败：' + (error.message || '未知错误');
      showOcrStatus('');
    }
  }

  async function runTranslation() {
    const source = $('ocrTextArea');
    const target = $('translateTarget');
    const runBtn = $('translateRunBtn');
    if (!source || !target || viewer.translating) return;
    const text = source.value.trim();
    if (!text) {
      target.textContent = '先框选或输入要翻译的内容。';
      return;
    }
    viewer.translating = true;
    if (runBtn) runBtn.disabled = true;
    target.textContent = '正在翻译…';
    try {
      const translated = await translateChunks(text);
      target.textContent = translated;
      $('copyTargetBtn').hidden = false;
    } catch (error) {
      console.warn('翻译失败：', error);
      target.textContent =
        '翻译失败：' +
        (error.message || '网络异常') +
        '。翻译需要联网调用免费翻译接口，请检查网络后重试；也可以直接阅读原文。';
    } finally {
      viewer.translating = false;
      if (runBtn) runBtn.disabled = false;
    }
  }

  function chunkText(text, maxLen) {
    const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?;:])\s+/);
    const chunks = [];
    let current = '';
    for (const sentence of sentences) {
      if ((current + ' ' + sentence).trim().length > maxLen) {
        if (current) chunks.push(current.trim());
        if (sentence.length > maxLen) {
          for (let i = 0; i < sentence.length; i += maxLen) {
            chunks.push(sentence.slice(i, i + maxLen));
          }
          current = '';
        } else {
          current = sentence;
        }
      } else {
        current = `${current} ${sentence}`.trim();
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length ? chunks : [text.slice(0, maxLen)];
  }

  async function translateChunks(text) {
    const chunks = chunkText(text, 440);
    const out = [];
    for (const chunk of chunks) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const url =
          'https://api.mymemory.translated.net/get?q=' +
          encodeURIComponent(chunk) +
          '&langpair=en%7Czh-CN';
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`接口返回 ${res.status}`);
        const data = await res.json();
        const translated =
          data && data.responseData && data.responseData.translatedText;
        if (!translated) {
          throw new Error(
            (data && data.responseDetails) || '没有获得译文'
          );
        }
        out.push(decodeEntities(translated));
      } finally {
        clearTimeout(timer);
      }
    }
    return out.join(' ');
  }

  function copyText(text, okMessage) {
    if (!text) return;
    const done = () => toast(okMessage || '已复制');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      done();
    } catch (error) {
      toast('复制失败，请手动选择文本复制', 'error');
    }
    el.remove();
  }

  /* ---------- 键盘 ---------- */

  function bindGlobalKeys() {
    document.addEventListener('keydown', (event) => {
      if (!viewer.open || !state.route || !state.route.lecture) return;
      const tag = (event.target && event.target.tagName) || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (event.target && event.target.isContentEditable) return;
      switch (event.key) {
        case 'ArrowLeft':
          turnPage(-1);
          event.preventDefault();
          break;
        case 'ArrowRight':
          turnPage(1);
          event.preventDefault();
          break;
        case '+':
        case '=':
          setZoom(viewer.zoom * 1.2);
          break;
        case '-':
          setZoom(viewer.zoom / 1.2);
          break;
        case 'Escape': {
          const panel = $('translatePanel');
          if (panel && !panel.hidden) panel.hidden = true;
          break;
        }
        default:
          break;
      }
    });
  }

  /* ---------- 对外接口 ---------- */

  function render(route) {
    state.route = route;
    const link = document.getElementById('sidebarCoursesLink');
    if (link) {
      const active = Boolean(route);
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (!route || !route.lecture) {
      renderHome();
    } else {
      renderReader(route);
    }
  }

  function init() {
    loadStore();
    bindGlobalKeys();
    const importInput = $('coursesImportFile');
    importInput?.addEventListener('change', () => {
      const file = importInput.files && importInput.files[0];
      importInput.value = '';
      if (file) importAnnotations(file);
    });
    // 离开课程页时清除侧栏「数理统计」的激活态
    window.addEventListener('hashchange', syncSidebarActive);
    // 系统全屏被 Esc 退出时，连沉浸模式一起退
    const onFsChange = () => {
      const active = Boolean(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      viewer.realFsActive = active;
      if (!active && viewer.immersive && viewer.open) {
        setImmersive(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
  }

  function syncSidebarActive() {
    const link = document.getElementById('sidebarCoursesLink');
    if (!link) return;
    const active = window.location.hash.startsWith('#/courses');
    link.classList.toggle('is-active', active);
    if (active) {
      link.setAttribute('aria-current', 'page');
      // 课程页由本模块渲染，app.js 的 renderSidebar 不会跑；手动清掉其他导航的激活态
      [
        'sidebarHomeLink',
        'sidebarShelfLink',
        'sidebarPublishLink',
        'sidebarCommentsLink',
        'sidebarDrillsLink',
        'sidebarIdeasLink',
        'sidebarLuxunLink',
        'sidebarTrashLink',
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('is-active');
        el.removeAttribute('aria-current');
      });
    } else {
      link.removeAttribute('aria-current');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function homeStats() {
    let strokes = 0;
    for (const entry of Object.values(state.annotations)) {
      strokes += entry.strokes.length;
    }
    const lectures = manifest.courses.reduce(
      (sum, course) => sum + course.lectures.length,
      0
    );
    return { courses: manifest.courses.length, lectures, strokes };
  }

  window.CoursesAPI = { parseRoute, render, docTitle, homeStats };
})();
