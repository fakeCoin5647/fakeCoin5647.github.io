/* 液态玻璃折射层
   架构改编自 shuding/liquid-glass（MIT License）
   https://github.com/shuding/liquid-glass · Copyright (c) 2025 Shu Ding
   折射数学严格移植自 Kyant0/AndroidLiquidGlass（Apache License 2.0）
   https://github.com/Kyant0/AndroidLiquidGlass · Copyright 2025 Kyant
   —— circleMap 圆弧折射曲线、SDF 梯度位移方向、角落色散模型
   （dispersionIntensity = centeredCoord.x*y / halfSize.x*y）。
   原理：Canvas 按元素尺寸计算圆角矩形 SDF，生成归一化位移图，
   经 feImage + feDisplacementMap 让 backdrop-filter 产生边缘折射；
   中心保持清晰，与 iOS 液态玻璃一致。
   本站改造：低分辨率位移图、按需重建（多重触发）、模糊量跟随
   外观面板滑块（CSS 变量）。
   仅 Chromium 支持 backdrop-filter: url()；其余浏览器自动跳过，
   保留 CSS 里的普通磨砂。 */

(() => {
  'use strict';

  const brands = navigator.userAgentData?.brands ?? [];
  const isChromium = brands.some((b) => /Chromium/i.test(b.brand));
  if (!isChromium || !CSS.supports('backdrop-filter', 'url(#lg-probe)')) return;

  const MAP_LONG_SIDE = 144; // 位移图长边像素，低分辨率即可，feImage 会拉伸
  // refractionHeight（Kyant0 术语）：约短边 12%，随元素尺寸在 12–44px 间伸缩
  const BAND_RATIO = 0.12;
  const BAND_MIN = 12;
  const BAND_MAX = 44;
  const BEND_RATIO = 1.0; // refractionAmount = 带宽（位移拉满）
  // 色散强度系数：Kyant0 模型的 intensity 值域 ±1 会把角落位移放大到 2×，
  // SVG 三路共享 scale 时会拉低主折射，故取温和值
  const CHROMA = 0.35;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';

  const host = document.createElementNS(SVG_NS, 'svg');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
  const defs = document.createElementNS(SVG_NS, 'defs');
  host.appendChild(defs);

  /* 以下三个函数严格移植自 Kyant0/AndroidLiquidGlass（Apache-2.0）
     internal/Shaders.kt 的 AGSL 实现，坐标以短边归一化。 */

  // 圆弧映射：玻璃截面为圆弧，光线偏折沿圆弧分布
  function circleMap(x) {
    return 1.0 - Math.sqrt(1.0 - x * x);
  }

  // 圆角矩形 SDF：内部为负、边缘为 0
  function sdRoundedRect(x, y, hw, hh, r) {
    const cx = Math.abs(x) - (hw - r);
    const cy = Math.abs(y) - (hh - r);
    const outside = Math.hypot(Math.max(cx, 0), Math.max(cy, 0)) - r;
    const inside = Math.min(Math.max(cx, cy), 0);
    return outside + inside;
  }

  // SDF 梯度：位移方向沿表面法线（角部沿角平分线、直边垂直边缘）
  function gradSdRoundedRect(x, y, hw, hh, r) {
    const cx = Math.abs(x) - (hw - r);
    const cy = Math.abs(y) - (hh - r);
    const sx = Math.sign(x) || 1;
    const sy = Math.sign(y) || 1;
    if (cx >= 0 || cy >= 0) {
      const gx = Math.max(cx, 0);
      const gy = Math.max(cy, 0);
      const len = Math.hypot(gx, gy) || 1;
      return { x: (sx * gx) / len, y: (sy * gy) / len };
    }
    // 直边区：法线指向更近的那条边
    const gradX = cy <= cx ? 1 : 0;
    return { x: sx * gradX, y: sy * (1 - gradX) };
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

    // 三张独立位移图：R/G/B 各一张（色散按 Kyant0 模型编码进图）
    const feImages = {};
    for (const k of ['R', 'G', 'B']) {
      const fi = document.createElementNS(SVG_NS, 'feImage');
      fi.setAttribute('id', filterId + '-map' + k);
      fi.setAttribute('preserveAspectRatio', 'none');
      fi.setAttribute('result', filterId + '-map' + k + '-r');
      filter.appendChild(fi);
      feImages[k] = fi;
    }

    // 官方 shader 的色差（chromatic aberration）：R/G/B 三路位移
    // 分通道后用 screen 混合重组（避免 alpha 溢出）
    function makeDisp(resultName, k) {
      const d = document.createElementNS(SVG_NS, 'feDisplacementMap');
      d.setAttribute('in', 'SourceGraphic');
      d.setAttribute('in2', filterId + '-map' + k + '-r');
      d.setAttribute('xChannelSelector', 'R');
      d.setAttribute('yChannelSelector', 'G');
      d.setAttribute('result', resultName);
      filter.appendChild(d);
      const cm = document.createElementNS(SVG_NS, 'feColorMatrix');
      cm.setAttribute('in', resultName);
      cm.setAttribute('type', 'matrix');
      cm.setAttribute(
        'values',
        k === 'R'
          ? '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'
          : k === 'G'
            ? '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'
            : '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
      );
      cm.setAttribute('result', resultName + '-c');
      filter.appendChild(cm);
      return d;
    }
    const dispR = makeDisp('lgR', 'R');
    const dispG = makeDisp('lgG', 'G');
    const dispB = makeDisp('lgB', 'B');
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

    const canvases = {};
    const ctxs = {};
    for (const k of ['R', 'G', 'B']) {
      canvases[k] = document.createElement('canvas');
      ctxs[k] = canvases[k].getContext('2d');
    }
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

      const m = Math.min(w, h); // 短边作为归一化基准
      const hw = w / 2 / m;
      const hh = h / 2 / m;
      const r = cornerRadius(el, w, h) / m;
      // refractionHeight：折射带高度（Kyant0 术语）
      const bandPx = Math.max(BAND_MIN, Math.min(BAND_MAX, m * BAND_RATIO));
      const band = Math.min(bandPx / m, Math.min(hw, hh) * 0.9);
      const amount = -band * BEND_RATIO; // 负值 = 向内采样
      // 梯度用放大 1.5 倍的半径计算，角部过渡更平滑（Kyant0）
      const gradRadius = Math.min(r * 1.5, Math.min(hw, hh));

      const images = {};
      const datas = {};
      for (const k of ['R', 'G', 'B']) {
        canvases[k].width = mw;
        canvases[k].height = mh;
        images[k] = ctxs[k].createImageData(mw, mh);
        datas[k] = images[k].data;
      }
      const rawR = new Float32Array(mw * mh * 2);
      const rawG = new Float32Array(mw * mh * 2);
      const rawB = new Float32Array(mw * mh * 2);
      let maxDisp = 1e-6;

      let idx = 0;
      for (let py = 0; py < mh; py += 1) {
        const ny = py / mh - 0.5;
        for (let px = 0; px < mw; px += 1) {
          const nx = px / mw - 0.5;
          // —— Kyant0 RoundedRectRefractionWithDispersion 数学 ——
          let sd = sdRoundedRect(nx, ny, hw, hh, r);
          if (-sd >= band) {
            // 折射带之外：零位移（中心清晰）
            rawR[idx] = 0; rawR[idx + 1] = 0;
            rawG[idx] = 0; rawG[idx + 1] = 0;
            rawB[idx] = 0; rawB[idx + 1] = 0;
            idx += 2;
            continue;
          }
          sd = Math.min(sd, 0);
          const d = circleMap(1 - -sd / band) * amount;
          const g = gradSdRoundedRect(nx, ny, hw, hh, gradRadius);
          const ox = d * g.x;
          const oy = d * g.y;
          // 色散只在「角落」出现（Kyant0 dispersionIntensity）
          const i = (CHROMA * nx * ny) / (hw * hh);
          rawR[idx] = ox * (1 + i);
          rawR[idx + 1] = oy * (1 + i);
          rawG[idx] = ox;
          rawG[idx + 1] = oy;
          rawB[idx] = ox * (1 - i);
          rawB[idx + 1] = oy * (1 - i);
          for (const v of [rawR[idx], rawR[idx + 1], rawB[idx], rawB[idx + 1]]) {
            const av = Math.abs(v);
            if (av > maxDisp) maxDisp = av;
          }
          idx += 2;
        }
      }

      for (const [k, raw] of [['R', rawR], ['G', rawG], ['B', rawB]]) {
        const data = datas[k];
        let j = 0;
        for (let p = 0; p < data.length; p += 4) {
          data[p] = (raw[j++] / maxDisp * 0.5 + 0.5) * 255;
          data[p + 1] = (raw[j++] / maxDisp * 0.5 + 0.5) * 255;
          data[p + 2] = 0;
          data[p + 3] = 255;
        }
        ctxs[k].putImageData(images[k], 0, 0);
        const url = canvases[k].toDataURL();
        feImages[k].setAttribute('width', String(w));
        feImages[k].setAttribute('height', String(h));
        feImages[k].setAttributeNS(XLINK_NS, 'href', url);
        feImages[k].setAttribute('href', url);
      }
      // 位移图归一化到 [0,1]，scale 换算回元素像素（短边基准）；
      // 色散已按 Kyant0 模型编码进三张图，三路 scale 一致
      const baseScale = maxDisp * m;
      dispR.setAttribute('scale', baseScale.toFixed(2));
      dispG.setAttribute('scale', baseScale.toFixed(2));
      dispB.setAttribute('scale', baseScale.toFixed(2));

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

  // 指针驱动的流动玻璃（glass-lens-react 的 Web 近似）：
  // 1) 大浮层光斑——位置写入 --mx/--my，配合 theme.css 的 radial-gradient；
  // 2) 交互件光角——指针相对控件中心的方位写入 --lg-light-base，
  //    CSS 以 sin()/cos() 让亮 rim 指向光源，hover 扫掠围绕它进行。
  // （显隐交给 CSS :hover，这里只更新变量。
  //   时间戳节流同步写：此环境 rAF 可能被冻结，会拦掉后续所有更新）
  const INTERACTIVE_GLASS =
    'button, .nav-item, .side-novel-link, .workspace-nav-link, .search-box, ' +
    '.sort-control, .filter-pill, .novel-card, .entry-card, .section-card, ' +
    '.panel, .trash-card, .comment-card, .drill-card';
  let glowLast = 0;
  document.addEventListener(
    'pointermove',
    (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      const now = performance.now();
      if (now - glowLast < 40) return;

      const pane = target.closest('.dialog[open], .appearance-panel');
      if (pane) {
        const rect = pane.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        glowLast = now;
        pane.style.setProperty(
          '--mx',
          (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%',
        );
        pane.style.setProperty(
          '--my',
          (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%',
        );
        return;
      }

      const glass = target.closest(INTERACTIVE_GLASS);
      if (!glass) return;
      const rect = glass.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      glowLast = now;
      // 0deg = 光源在正上方，顺时针为正（CSS 角度约定）；
      // rim 位置 (-sinθ, cosθ) 使亮线始终朝向指针
      const deg =
        (Math.atan2(
          e.clientX - (rect.left + rect.width / 2),
          rect.top + rect.height / 2 - e.clientY,
        ) *
          180) /
        Math.PI;
      glass.style.setProperty('--lg-light-base', deg.toFixed(1) + 'deg');
    },
    { passive: true },
  );
})();
