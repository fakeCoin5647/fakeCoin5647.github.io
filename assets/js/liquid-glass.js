/* 液态玻璃折射层
   架构改编自 shuding/liquid-glass（MIT License）
   https://github.com/shuding/liquid-glass · Copyright (c) 2025 Shu Ding
   原理：Canvas 按元素尺寸计算圆角矩形 SDF，生成归一化位移图，
   经 feImage + feDisplacementMap 让 backdrop-filter 产生边缘折射；
   中心保持清晰，与 iOS 液态玻璃一致。
   本站改造：低分辨率位移图、按需重建（ResizeObserver）、
   折射带宽度固定像素、模糊量跟随外观面板滑块（CSS 变量）。
   仅 Chromium 支持 backdrop-filter: url()；其余浏览器自动跳过，
   保留 CSS 里的普通磨砂。 */

(() => {
  'use strict';

  const brands = navigator.userAgentData?.brands ?? [];
  const isChromium = brands.some((b) => /Chromium/i.test(b.brand));
  if (!isChromium || !CSS.supports('backdrop-filter', 'url(#lg-probe)')) return;

  const MAP_LONG_SIDE = 144; // 位移图长边像素，低分辨率即可，feImage 会拉伸
  // 折射带按官方比例：约短边 12%，随元素尺寸在 12–44px 间伸缩；
  // 边缘位移拉满带宽（透镜式挤压），文字多的浮层再叠加轻微提亮
  // （HIG regular 变体的 luminosity adaptation 的 Web 近似）。
  const BAND_RATIO = 0.12;
  const BAND_MIN = 12;
  const BAND_MAX = 44;
  const BEND_RATIO = 1.0;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';

  const host = document.createElementNS(SVG_NS, 'svg');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
  const defs = document.createElementNS(SVG_NS, 'defs');
  host.appendChild(defs);

  function smoothStep(a, b, t) {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // 圆角矩形 SDF：内部为负、边缘为 0；坐标以短边归一化
  function roundedRectSDF(x, y, hw, hh, r) {
    const qx = Math.abs(x) - hw + r;
    const qy = Math.abs(y) - hh + r;
    const ax = Math.max(qx, 0);
    const ay = Math.max(qy, 0);
    return Math.min(Math.max(qx, qy), 0) + Math.hypot(ax, ay) - r;
  }

  function cornerRadius(el, w, h) {
    const raw = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const half = Math.min(w, h) / 2;
    return Math.max(0, Math.min(raw || half, half));
  }

  function enhance(el, key, blurExpr, saturate, brightness) {
    const filterId = 'lg-' + key;
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.setAttribute('id', filterId);
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    const feImage = document.createElementNS(SVG_NS, 'feImage');
    feImage.setAttribute('id', filterId + '-map');
    feImage.setAttribute('preserveAspectRatio', 'none');
    filter.appendChild(feImage);

    // 官方 shader 的色差（chromatic aberration）：R/G/B 三路位移，
    // scale 递差约 ±3.5%，分通道后用 screen 混合重组
    // （参考 Amir Ghajari 对 iOS 26 效果的拆解）。
    function makeDisp(resultName, k) {
      const d = document.createElementNS(SVG_NS, 'feDisplacementMap');
      d.setAttribute('in', 'SourceGraphic');
      d.setAttribute('in2', filterId + '-map');
      d.setAttribute('xChannelSelector', 'R');
      d.setAttribute('yChannelSelector', 'G');
      d.setAttribute('result', resultName);
      filter.appendChild(d);
      const cm = document.createElementNS(SVG_NS, 'feColorMatrix');
      cm.setAttribute('in', resultName);
      cm.setAttribute('type', 'matrix');
      cm.setAttribute(
        'values',
        k === 'r'
          ? '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'
          : k === 'g'
            ? '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'
            : '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
      );
      cm.setAttribute('result', resultName + '-c');
      filter.appendChild(cm);
      return d;
    }
    const dispR = makeDisp('lgR', 'r');
    const dispG = makeDisp('lgG', 'g');
    const dispB = makeDisp('lgB', 'b');
    const blendRG = document.createElementNS(SVG_NS, 'feBlend');
    blendRG.setAttribute('in', 'lgR-c');
    blendRG.setAttribute('in2', 'lgG-c');
    blendRG.setAttribute('mode', 'screen');
    blendRG.setAttribute('result', 'lgRG');
    filter.appendChild(blendRG);
    const blendRGB = document.createElementNS(SVG_NS, 'feBlend');
    blendRGB.setAttribute('in', 'lgRG');
    blendRGB.setAttribute('in2', 'lgB-c');
    blendRGB.setAttribute('mode', 'screen');
    filter.appendChild(blendRGB);
    defs.appendChild(filter);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let lastW = 0;
    let lastH = 0;

    function scheduleRebuild() {
      requestAnimationFrame(() => rebuild());
      setTimeout(rebuild, 60); // rAF 被暂停的环境里兜底
    }

    function rebuild() {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w < 8 || h < 8) return; // 隐藏状态（dialog 未打开）不生成
      if (w === lastW && h === lastH) return; // 尺寸没变不重复生成
      lastW = w;
      lastH = h;

      filter.setAttribute('x', '0');
      filter.setAttribute('y', '0');
      filter.setAttribute('width', String(w));
      filter.setAttribute('height', String(h));

      const scale = MAP_LONG_SIDE / Math.max(w, h);
      const mw = Math.max(8, Math.round(w * scale));
      const mh = Math.max(8, Math.round(h * scale));
      canvas.width = mw;
      canvas.height = mh;

      const m = Math.min(w, h); // 短边作为归一化基准
      const hw = w / 2 / m;
      const hh = h / 2 / m;
      const r = cornerRadius(el, w, h) / m;
      const bandPx = Math.max(BAND_MIN, Math.min(BAND_MAX, m * BAND_RATIO));
      const band = Math.min(bandPx / m, Math.min(hw, hh) * 0.9);
      const bend = band * BEND_RATIO;

      const image = ctx.createImageData(mw, mh);
      const data = image.data;
      const raw = new Float32Array(mw * mh * 2);
      let maxDisp = 1e-6;

      let k = 0;
      for (let py = 0; py < mh; py += 1) {
        const ny = py / mh - 0.5;
        for (let px = 0; px < mw; px += 1) {
          const nx = px / mw - 0.5;
          const d = roundedRectSDF(nx, ny, hw, hh, r);
          // 内圈 s=1（原样），边缘一圈 s→0（采样向中心收，形成折射）
          const s = smoothStep(-band, 0, d);
          const dist = Math.hypot(nx, ny);
          const pull = dist > 1e-4 ? (1 - s) * bend : 0;
          const ox = dist > 1e-4 ? (nx / dist) * pull : 0;
          const oy = dist > 1e-4 ? (ny / dist) * pull : 0;
          raw[k++] = ox;
          raw[k++] = oy;
          if (Math.abs(ox) > maxDisp) maxDisp = Math.abs(ox);
          if (Math.abs(oy) > maxDisp) maxDisp = Math.abs(oy);
        }
      }

      let j = 0;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = (raw[j++] / maxDisp * 0.5 + 0.5) * 255;
        data[i + 1] = (raw[j++] / maxDisp * 0.5 + 0.5) * 255;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);

      const url = canvas.toDataURL();
      feImage.setAttribute('width', String(w));
      feImage.setAttribute('height', String(h));
      feImage.setAttributeNS(XLINK_NS, 'href', url);
      feImage.setAttribute('href', url);
      // 位移图归一化到 [0,1]，scale 换算回元素像素（短边基准）；
      // 三路 scale 递差形成边缘色散
      const baseScale = maxDisp * m;
      dispR.setAttribute('scale', (baseScale * 1.035).toFixed(2));
      dispG.setAttribute('scale', baseScale.toFixed(2));
      dispB.setAttribute('scale', (baseScale * 0.965).toFixed(2));

      const chain = [
        `url(#${filterId})`,
        `blur(${blurExpr})`,
        `saturate(${saturate})`,
      ];
      if (brightness) chain.push(`brightness(${brightness})`);
      el.style.backdropFilter = chain.join(' ');
    }

    // 尺寸变化的多重触发：部分环境 ResizeObserver 回调不可靠，
    // 同时用 toggle / 按钮点击 / 低频轮询兜底，任何一路生效即可。
    if (el.tagName === 'DIALOG') {
      el.addEventListener('toggle', scheduleRebuild);
    }
    const ro = new ResizeObserver(scheduleRebuild);
    ro.observe(el);
    rebuild();
    return { el, scheduleRebuild };
  }

  const targets = [];
  document
    .querySelectorAll('dialog.dialog:not(.map-dialog)')
    .forEach((el, i) => {
      const isSearch = el.classList.contains('search-dialog');
      // 文字多的对话框走 regular 变体：磨砂更强 + 轻微提亮保可读；
      // 搜索抽屉信息密度低，走 clear 观感
      targets.push({
        el,
        key: 'dlg' + i,
        blur: isSearch
          ? 'calc(var(--glass-blur) + 2px)'
          : 'calc(var(--glass-blur) + 4px)',
        saturate: isSearch ? 1.55 : 1.6,
        brightness: isSearch ? 1.02 : 1.06,
      });
    });

  const panel = document.getElementById('appearancePanel');
  if (panel) {
    targets.push({ el: panel, key: 'panel', blur: '18px', saturate: 1.5, brightness: 1.04 });
  }
  const fab = document.getElementById('commentFab');
  if (fab) {
    targets.push({ el: fab, key: 'fab', blur: '16px', saturate: 1.6 });
  }

  const handles = targets.map((t) =>
    enhance(t.el, t.key, t.blur, t.saturate, t.brightness),
  );
  document.body.appendChild(host);

  // 外观面板由 app.js 打开（移除 hidden），挂在按钮与全局点击上补触发
  const appearanceBtn = document.getElementById('appearanceBtn');
  if (appearanceBtn) {
    appearanceBtn.addEventListener('click', () => {
      for (const h of handles) h.scheduleRebuild();
    });
  }

  // 轮询兜底：尺寸与上次不同才重建，开销仅几次 getBoundingClientRect
  setInterval(() => {
    for (const h of handles) h.scheduleRebuild();
  }, 800);

  // 视口变化（旋转 / 缩放）全量重建
  window.addEventListener('resize', () => {
    for (const h of handles) h.scheduleRebuild();
  });
})();
