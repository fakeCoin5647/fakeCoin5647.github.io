/* Coin's Creative Cabin · WebGL2 液态玻璃外壳
   折射 SDF、色散权重、边缘高光与阴影参数参考 Kyant0/AndroidLiquidGlass（Apache-2.0）。
   与 Backdrop Catalog 的演示版差异：视口级画布、页面滚动同步、
   页面底部渐隐、壁纸明暗实时跟随外观面板。 */

(function () {
  'use strict';

  const MAX_PIXELS = 6e6;
  const root = document.documentElement;
  const reduceTransparency = window.matchMedia?.(
    '(prefers-reduced-transparency: reduce)',
  ).matches;
  // 降低透明度偏好下不做 WebGL：直接沿用 CSS 磨砂，省 GPU 也保证可读性
  if (reduceTransparency) return;

  let gl = null;
  let canvas = null;
  let ready = false;
  let shown = false;
  let rafId = 0;
  let dirty = true;
  let descs = [];
  let pageEl = null;
  let quadBuf = null;
  let vao = null;
  let snapTex = null;
  let bgProg = null;
  let shadowProg = null;
  let glassProg = null;
  let wallpaperTex = null;
  let wallpaperReady = false;
  let wallpaperEntry = null;
  let lastTime = 0;
  let observedBody = false;

  let CSS_W = 1;
  let CSS_H = 1;
  let DPR = 1;
  let PX_W = 1;
  let PX_H = 1;

  const pageFade = { start: 1e9, end: 1e9 };
  const navMotion = {
    ready: false,
    active: false,
    id: '',
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    tx: 0,
    ty: 0,
    tw: 1,
    th: 1,
    vx: 0,
    vy: 0,
    vw: 0,
    vh: 0,
  };
  let peerSyncQueued = 0;
  let lastPeerPress = { key: '', at: 0 };
  const peerHistory = new Map();
  const colorCache = new Map();
  const wired = new WeakSet();
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    .matches;

  const PRESETS = {
    shell: {
      blur: 0,
      lensH: 28,
      lensA: 34,
      depth: 0,
      chroma: 0.55,
      surface: 0.08,
      surfaceColor: '#f8faff',
      rim: 3,
      rimAlpha: 0.85,
      shadow: { r: 30, a: 0.22, y: 12 },
      inner: 0.16,
      innerRadius: 28,
    },
    rail: {
      blur: 18,
      lensH: 26,
      lensA: 34,
      depth: 0,
      chroma: 0.4,
      surface: 0.55,
      surfaceColor: '#f5f8ff',
      rim: 3,
      rimAlpha: 0.68,
      shadow: null,
      inner: 0.34,
      innerRadius: 26,
    },
    panel: {
      blur: 10,
      lensH: 24,
      lensA: 30,
      depth: 0,
      chroma: 0.38,
      surface: 0.48,
      surfaceColor: '#f8faff',
      rim: 3,
      rimAlpha: 0.6,
      shadow: null,
      inner: 0.26,
      innerRadius: 24,
    },
    nav: {
      blur: 0,
      lensH: 6,
      lensA: 10,
      depth: 0,
      chroma: 0.42,
      surface: 0.86,
      surfaceColor: '#4f6df5',
      rim: 3,
      rimAlpha: 0.4,
      shadow: null,
      inner: 0.18,
      innerRadius: 8,
    },
    pill: {
      blur: 8,
      lensH: 9,
      lensA: 20,
      depth: 0,
      chroma: 0.45,
      surface: 0.55,
      surfaceColor: '#ffffff',
      rim: 3,
      rimAlpha: 0.55,
      shadow: { r: 8, a: 0.1, y: 2 },
      inner: 0.3,
      innerRadius: 9,
    },
  };

  /* ---------------- shaders ---------------- */

  const VS_QUAD = `#version 300 es
layout(location = 0) in vec2 aPos;
uniform vec2 uCanvas;
uniform vec2 uPos;
uniform vec2 uSize;
uniform vec2 uOrigin;
uniform mat2 uMatrix;
uniform vec2 uTranslate;
uniform vec2 uCenter;
uniform float uExtraScale;
uniform float uInflate;
out vec2 vLocal;
out vec2 vScreen;
void main() {
  vec2 local = aPos * (uSize + 2.0 * uInflate) - uInflate;
  vLocal = local;
  vec2 q = uCenter + (local - uCenter) * uExtraScale;
  vec2 screen = uPos + uOrigin + uMatrix * (q - uOrigin) + uTranslate;
  vScreen = screen;
  vec2 clip = vec2(screen.x / uCanvas.x * 2.0 - 1.0, 1.0 - screen.y / uCanvas.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
}`;

  const VS_BG = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos.x * 2.0 - 1.0, 1.0 - aPos.y * 2.0, 0.0, 1.0);
}`;

  const FS_BG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uHas;
uniform vec2 uBgA;
uniform vec2 uBgB;
uniform vec3 uBgColor;
uniform float uDim;
out vec4 fragColor;

void main() {
  if (uHas < 0.5) {
    fragColor = vec4(uBgColor, 1.0);
    return;
  }
  vec3 img = texture(uTex, vUv * uBgA + uBgB).rgb;
  float y = vUv.y;
  float topA = 0.1 + uDim * 0.52;
  float midA = uDim * 0.2;
  float botA = 0.12 + uDim * 0.52;
  float a = y < 0.42
    ? mix(topA, midA, y / 0.42)
    : mix(midA, botA, (y - 0.42) / 0.58);
  fragColor = vec4(mix(img, uBgColor, clamp(a, 0.0, 1.0)), 1.0);
}`;

  const SDF_LIB = `
float cornerRadius(vec2 p, vec4 r) {
  if (p.y < 0.0) return p.x < 0.0 ? r.x : r.y;
  return p.x < 0.0 ? r.w : r.z;
}
float sdRoundRect(vec2 p, vec2 halfSize, vec4 radii) {
  float cr = cornerRadius(p, radii);
  vec2 inner = halfSize - vec2(cr);
  vec2 q = abs(p) - inner;
  return min(max(q.x, q.y), 0.0) + length(max(q, vec2(0.0))) - cr;
}
vec2 sdfNormal(vec2 p, vec2 halfSize, vec4 radii) {
  float cr = cornerRadius(p, radii);
  vec2 inner = halfSize - vec2(cr);
  vec2 q = abs(p) - inner;
  return normalize(sign(p) * max(q, vec2(0.0)) + vec2(1e-6));
}`;

  const FS_SHADOW = `#version 300 es
precision highp float;
in vec2 vLocal;
in vec2 vScreen;
uniform vec2 uSize;
uniform vec4 uRadii;
uniform vec4 uShadowColor;
uniform vec2 uOffset;
uniform float uSigma;
uniform float uAlpha;
uniform float uFadeStart;
uniform float uFadeEnd;
out vec4 fragColor;
${SDF_LIB}
void main() {
  vec2 halfSize = uSize * 0.5;
  vec2 p = vLocal - halfSize - uOffset;
  float sd = sdRoundRect(p, halfSize, uRadii);
  float d = max(sd, 0.0);
  float g = exp(-(d * d) / (2.0 * uSigma * uSigma));
  float a = mix(g, 1.0, step(sd, 0.0));
  float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, vScreen.y);
  fragColor = vec4(uShadowColor.rgb, uShadowColor.a * a * uAlpha * fade);
}`;

  const FS_GLASS = `#version 300 es
precision highp float;

in vec2 vLocal;
in vec2 vScreen;
out vec4 fragColor;

uniform vec2 uCanvas;
uniform vec2 uSize;
uniform vec4 uRadii;
uniform vec2 uPos;
uniform vec2 uOrigin;
uniform mat2 uMatrix;
uniform vec2 uTranslate;
uniform vec2 uCenter;
uniform float uExtraScale;

uniform sampler2D uSnap;
uniform float uDpr;

uniform float uLensHeight;
uniform float uLensAmount;
uniform float uDepth;
uniform float uBlur;
uniform float uChroma;
uniform float uVibrancy;
uniform vec4 uSurface;
uniform vec3 uTint;
uniform float uTintAmount;
uniform int uRimMode;
uniform float uRimAlpha;
uniform float uGlow;
uniform vec2 uGlowCenter;
uniform float uGlowRadius;
uniform float uInner;
uniform float uInnerRadius;
uniform float uAlpha;
uniform float uExposure;
uniform float uFadeStart;
uniform float uFadeEnd;

${SDF_LIB}

vec2 mapLocal(vec2 p) {
  vec2 q = uCenter + (p - uCenter) * uExtraScale;
  return uPos + uOrigin + uMatrix * (q - uOrigin) + uTranslate;
}

vec3 sampleBackdrop(vec2 localPt) {
  vec2 scr = mapLocal(localPt);
  vec2 sp = vec2(scr.x, uCanvas.y - scr.y) * uDpr;
  vec2 uv = sp / (uCanvas * uDpr);
  return texture(uSnap, uv).rgb * uExposure;
}

vec3 sampleBlurred(vec2 p, float r) {
  if (r < 0.25) return sampleBackdrop(p);
  float k = r * 1.5;
  vec3 s = sampleBackdrop(p) * 0.16;
  s += sampleBackdrop(p + vec2(0.62, 0.17) * k) * 0.07;
  s += sampleBackdrop(p + vec2(-0.43, 0.55) * k) * 0.07;
  s += sampleBackdrop(p + vec2(0.31, -0.72) * k) * 0.07;
  s += sampleBackdrop(p + vec2(-0.65, -0.30) * k) * 0.07;
  s += sampleBackdrop(p + vec2(0.85, 0.53) * k) * 0.07;
  s += sampleBackdrop(p + vec2(-0.87, 0.13) * k) * 0.07;
  s += sampleBackdrop(p + vec2(0.10, 0.90) * k) * 0.07;
  s += sampleBackdrop(p + vec2(-0.15, -0.92) * k) * 0.07;
  s += sampleBackdrop(p + vec2(0.55, -0.28) * k) * 0.07;
  s += sampleBackdrop(p + vec2(-0.55, 0.86) * k) * 0.07;
  s += sampleBackdrop(p + vec2(0.95, -0.15) * k) * 0.07;
  s += sampleBackdrop(p + vec2(-0.05, 0.35) * k) * 0.07;
  return s;
}

vec3 rgb2hsl(vec3 c) {
  float mx = max(max(c.r, c.g), c.b);
  float mn = min(min(c.r, c.g), c.b);
  float l = (mx + mn) * 0.5;
  float h = 0.0;
  float s = 0.0;
  float d = mx - mn;
  if (d > 1e-5) {
    s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
    if (mx == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
  }
  return vec3(h, s, l);
}

float hue2rgb(float p, float q, float t) {
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x;
  float s = hsl.y;
  float l = hsl.z;
  if (s < 1e-5) return vec3(l);
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(hue2rgb(p, q, h + 1.0 / 3.0), hue2rgb(p, q, h), hue2rgb(p, q, h - 1.0 / 3.0));
}

void main() {
  vec2 halfSize = uSize * 0.5;
  vec2 p = vLocal - halfSize;
  float sd = sdRoundRect(p, halfSize, uRadii);
  float aa = max(fwidth(sd), 0.0001);
  float mask = 1.0 - smoothstep(-aa, aa, sd);
  if (mask <= 0.001) discard;

  vec2 grad = sdfNormal(p, halfSize, uRadii);

  vec3 rgb;
  if (uLensHeight > 0.001 && sd < 0.0) {
    float t = clamp(1.0 + sd / uLensHeight, 0.0, 1.0);
    float band = 1.0 - sqrt(max(0.0, 1.0 - t * t));
    vec2 dir = grad;
    if (uDepth > 0.001) {
      dir = normalize(grad + normalize(p + vec2(1e-5)) * (uDepth * 1.5) + vec2(1e-6));
    }
    vec2 sp = vLocal + dir * (-uLensAmount * band);

    if (uChroma > 0.001 && band > 0.001) {
      float f = uChroma * (p.x * p.y / max(0.0001, halfSize.x * halfSize.y)) * band;
      vec2 d = dir * (-uLensAmount * band * f);
      vec3 c0 = sampleBlurred(sp, uBlur);
      vec3 c1 = sampleBlurred(sp + d, uBlur);
      vec3 c2 = sampleBlurred(sp + d * 0.667, uBlur);
      vec3 c3 = sampleBlurred(sp + d * 0.333, uBlur);
      vec3 c4 = sampleBlurred(sp - d * 0.333, uBlur);
      vec3 c5 = sampleBlurred(sp - d * 0.667, uBlur);
      vec3 c6 = sampleBlurred(sp - d, uBlur);
      float r = c1.r / 3.5 + c2.r / 3.5 + c3.r / 3.5 + c6.r / 7.0;
      float g = c2.g / 7.0 + c3.g / 3.5 + c0.g / 3.5 + c4.g / 3.5;
      float b = c4.b / 3.0 + c5.b / 3.0 + c6.b / 3.0;
      rgb = vec3(r, g, b);
    } else {
      rgb = sampleBlurred(sp, uBlur);
    }
  } else {
    rgb = sampleBlurred(vLocal, uBlur);
  }

  if (uVibrancy > 0.001) {
    float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = clamp(mix(vec3(lum), rgb, uVibrancy), 0.0, 1.0);
  }

  if (uTintAmount > 0.001) {
    vec3 hs = rgb2hsl(rgb);
    vec3 ht = rgb2hsl(uTint);
    vec3 hueBlend = hsl2rgb(vec3(ht.x, hs.y, hs.z));
    rgb = mix(hueBlend, uTint, 0.75 * clamp(uTintAmount, 0.0, 1.0));
  }

  rgb = mix(rgb, uSurface.rgb, clamp(uSurface.a, 0.0, 1.0));

  float rimBand = 1.0 - smoothstep(0.0, 1.1, -sd);
  if (rimBand > 0.001) {
    float rim = 1.0;
    if (uRimMode == 1) {
      rim = abs(dot(grad, vec2(0.7071, -0.7071)));
    } else if (uRimMode == 2) {
      rim = clamp(-grad.y, 0.0, 1.0);
    } else if (uRimMode == 3) {
      rim = 0.3 + 0.7 * clamp(-grad.y, 0.0, 1.0);
    }
    rgb += vec3(uRimAlpha * rimBand * rim);
  }

  if (uGlow > 0.001) {
    float dist = length(vLocal - uGlowCenter);
    float radial = 1.0 - smoothstep(uGlowRadius * 0.12, uGlowRadius, dist);
    rgb += vec3(uGlow * (0.08 + 0.15 * radial));
  }

  if (uInner > 0.001) {
    float bandIn = 1.0 - smoothstep(0.0, max(1.0, uInnerRadius), -sd);
    float top = smoothstep(0.0, 0.42, 0.5 - vLocal.y / uSize.y);
    rgb *= 1.0 - 0.42 * bandIn * top * uInner;
  }

  float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, vScreen.y);
  fragColor = vec4(clamp(rgb, 0.0, 1.0), mask * uAlpha * fade);
}`;

  /* ---------------- gl helpers ---------------- */

  function compile(type, source) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('Shader compile failed: ' + log);
    }
    return sh;
  }

  function link(vsSource, fsSource, label) {
    const vs = compile(gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      throw new Error('Program link failed (' + label + '): ' + log);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    const p = { program: program, u: {}, a: {} };
    const nu = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < nu; i += 1) {
      const info = gl.getActiveUniform(program, i);
      const name = info.name.replace(/\[0\]$/, '');
      p.u[name] = gl.getUniformLocation(program, info.name);
    }
    const na = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < na; i += 1) {
      const info = gl.getActiveAttrib(program, i);
      p.a[info.name] = gl.getAttribLocation(program, info.name);
    }
    return p;
  }

  function parseColor(value) {
    if (!value) return { r: 0, g: 0, b: 0, a: 1 };
    const key = String(value).trim();
    if (colorCache.has(key)) return colorCache.get(key);
    let out = { r: 0, g: 0, b: 0, a: 1 };
    const m = key.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      const parts = m[1].split(',').map((s) => parseFloat(s));
      out = {
        r: (parts[0] || 0) / 255,
        g: (parts[1] || 0) / 255,
        b: (parts[2] || 0) / 255,
        a: parts.length > 3 ? Math.max(0, Math.min(1, parts[3])) : 1,
      };
    } else if (key.startsWith('#')) {
      let hex = key.slice(1);
      if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
      if (hex.length === 6 || hex.length === 8) {
        out = {
          r: parseInt(hex.slice(0, 2), 16) / 255,
          g: parseInt(hex.slice(2, 4), 16) / 255,
          b: parseInt(hex.slice(4, 6), 16) / 255,
          a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
        };
      }
    }
    colorCache.set(key, out);
    return out;
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function readEnv() {
    const cs = getComputedStyle(root);
    const num = (name, fallback) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    return {
      glassAlpha: num('--glass-alpha', 0.78),
      cardAlpha: num('--card-alpha', 0.5),
      blur: num('--glass-blur', 20),
      rim: clamp(num('--rim-strength', 1), 0, 1),
      dim: clamp(num('--wallpaper-dim', 0.5), 0, 1),
      accent: cs.getPropertyValue('--accent').trim() || '#4f6df5',
    };
  }

  /* ---------------- DOM 测量 ---------------- */

  function readRadii(el, w, h) {
    const cs = getComputedStyle(el);
    const max = Math.min(w, h) / 2;
    return [
      parseFloat(cs.borderTopLeftRadius) || 0,
      parseFloat(cs.borderTopRightRadius) || 0,
      parseFloat(cs.borderBottomRightRadius) || 0,
      parseFloat(cs.borderBottomLeftRadius) || 0,
    ].map((v) => Math.min(v, max));
  }

  function isVisible(el) {
    if (!el.offsetWidth || !el.offsetHeight) return false;
    if (el.closest('[hidden]')) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return el.getClientRects().length > 0;
  }

  function makeState(el) {
    if (el._cabinGlass) return el._cabinGlass;
    const st = {
      press: 0,
      pressV: 0,
      pressTarget: 0,
      hover: 0,
      hoverTarget: 0,
      glowX: 0,
      glowY: 0,
      pointerInside: false,
      extraScale: 1,
    };
    el._cabinGlass = st;
    return st;
  }

  function wire(el, st) {
    if (wired.has(el) || reduceMotion) return;
    wired.add(el);
    const isPill = el.dataset.glass === 'pill';
    const isRail = el.dataset.glass === 'rail';
    const isNav = el.dataset.glass === 'nav';

    const localPoint = (event) => {
      const r = el.getBoundingClientRect();
      st.glowX = event.clientX - r.left;
      st.glowY = event.clientY - r.top;
    };

    el.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      st.hoverTarget = 1;
      st.pointerInside = true;
      localPoint(event);
      invalidate();
    });
    el.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      st.pointerInside = true;
      localPoint(event);
      if (isPill || isRail) invalidate();
    });
    el.addEventListener('pointerleave', () => {
      st.hoverTarget = 0;
      st.pointerInside = false;
      invalidate();
    });
    if (isPill || isNav) {
      el.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        st.pressTarget = 1;
        localPoint(event);
        invalidate();
      });
      const release = () => {
        st.pressTarget = 0;
        invalidate();
      };
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('blur', release);
    }
  }

  function snapNav(r) {
    navMotion.x = navMotion.tx = r.left;
    navMotion.y = navMotion.ty = r.top;
    navMotion.w = navMotion.tw = Math.max(1, r.width);
    navMotion.h = navMotion.th = Math.max(1, r.height);
    navMotion.vx = 0;
    navMotion.vy = 0;
    navMotion.vw = 0;
    navMotion.vh = 0;
    navMotion.active = false;
  }

  function setNavTarget(el, r) {
    if (!navMotion.ready) {
      navMotion.ready = true;
      navMotion.id = el.id;
      snapNav(r);
      return;
    }
    if (navMotion.id !== el.id) {
      navMotion.id = el.id;
      navMotion.active = !reduceMotion;
      if (reduceMotion) {
        snapNav(r);
        return;
      }
    } else if (!navMotion.active) {
      snapNav(r);
      return;
    }
    navMotion.tx = r.left;
    navMotion.ty = r.top;
    navMotion.tw = Math.max(1, r.width);
    navMotion.th = Math.max(1, r.height);
  }

  function stepNav(dt) {
    if (!navMotion.ready || !navMotion.active) return false;
    const stiffness = 240;
    const damping = 2 * Math.sqrt(stiffness) * 0.64;
    const axes = [
      ['x', 'tx', 'vx'],
      ['y', 'ty', 'vy'],
      ['w', 'tw', 'vw'],
      ['h', 'th', 'vh'],
    ];
    let moving = false;
    for (let i = 0; i < axes.length; i += 1) {
      const key = axes[i][0];
      const target = axes[i][1];
      const velocity = axes[i][2];
      const delta = navMotion[target] - navMotion[key];
      if (Math.abs(delta) < 0.02 && Math.abs(navMotion[velocity]) < 0.02) {
        navMotion[key] = navMotion[target];
        navMotion[velocity] = 0;
        continue;
      }
      const accel = stiffness * delta - damping * navMotion[velocity];
      navMotion[velocity] += accel * dt;
      navMotion[key] += navMotion[velocity] * dt;
      moving = true;
    }
    if (!moving) {
      navMotion.x = navMotion.tx;
      navMotion.y = navMotion.ty;
      navMotion.w = navMotion.tw;
      navMotion.h = navMotion.th;
      navMotion.active = false;
    }
    return moving;
  }

  function buildDescriptors() {
    descs = [];
    pageEl = document.querySelector('.page');
    const nodes = document.querySelectorAll('[data-glass]');
    for (let i = 0; i < nodes.length; i += 1) {
      const el = nodes[i];
      if (!isVisible(el)) continue;
      const type = el.dataset.glass;
      if (!PRESETS[type]) continue;
      if (type === 'nav' && !el.classList.contains('is-active')) continue;
      const st = makeState(el);
      wire(el, st);
      const r = el.getBoundingClientRect();
      let geo;
      if (type === 'nav') {
        setNavTarget(el, r);
        geo = {
          x: navMotion.x,
          y: navMotion.y,
          w: navMotion.w,
          h: navMotion.h,
        };
      } else {
        geo = {
          x: r.left,
          y: r.top,
          w: Math.max(1, r.width),
          h: Math.max(1, r.height),
        };
      }
      descs.push({
        el: el,
        type: type,
        x: geo.x,
        y: geo.y,
        w: geo.w,
        h: geo.h,
        radii: readRadii(el, r.width, r.height),
        attrs: {
          surface: el.dataset.surface == null ? null : parseFloat(el.dataset.surface),
          surfaceColor: el.dataset.surfaceColor || null,
          lensH: el.dataset.lensHeight == null ? null : parseFloat(el.dataset.lensHeight),
          lensA: el.dataset.lensAmount == null ? null : parseFloat(el.dataset.lensAmount),
        },
        st: st,
      });
    }
    invalidate();
  }

  function syncGeometry() {
    for (let i = 0; i < descs.length; i += 1) {
      const d = descs[i];
      const r = d.el.getBoundingClientRect();
      if (d.type === 'nav') {
        setNavTarget(d.el, r);
        d.x = navMotion.x;
        d.y = navMotion.y;
        d.w = navMotion.w;
        d.h = navMotion.h;
        d.radii = readRadii(d.el, r.width, r.height);
        continue;
      }
      d.x = r.left;
      d.y = r.top;
      d.w = Math.max(1, r.width);
      d.h = Math.max(1, r.height);
      d.radii = readRadii(d.el, d.w, d.h);
    }
    const maskOn = window.innerWidth >= 881;
    if (maskOn && pageEl) {
      const pr = pageEl.getBoundingClientRect();
      pageFade.start = pr.bottom - 120;
      pageFade.end = pr.bottom;
    } else {
      pageFade.start = 1e9;
      pageFade.end = 1e9;
    }
  }

  /* ---------------- 参数 ---------------- */

  function resolveParams(d, env) {
    const base = PRESETS[d.type];
    const st = d.st;
    const out = {
      blur: base.blur,
      lensH: base.lensH,
      lensA: base.lensA,
      depth: base.depth,
      chroma: base.chroma,
      vibrancy: 1.25,
      surface: base.surface,
      surfaceColor: base.surfaceColor,
      rim: base.rim,
      rimAlpha: base.rimAlpha,
      shadow: base.shadow,
      inner: base.inner,
      innerRadius: base.innerRadius,
      exposure: 1,
      glow: 0,
      glowX: d.w / 2,
      glowY: d.h / 2,
      glowRadius: Math.max(d.w, d.h) * 0.6,
    };

    if (d.type === 'shell') {
      out.surface = clamp(0.05 + (env.glassAlpha - 0.58) * 0.22, 0.04, 0.16);
      out.blur = 0;
      out.exposure = 1.15;
      out.vibrancy = 1.35;
      out.lensH = 28;
      out.lensA = 36;
    } else if (d.type === 'rail') {
      out.surface = clamp(0.52 + (env.cardAlpha - 0.34) * 0.2, 0.5, 0.6);
      out.blur = env.blur * 0.5;
      out.exposure = 1.5;
      out.vibrancy = 1.38;
    } else if (d.type === 'panel') {
      out.surface = clamp(0.42 + (env.cardAlpha - 0.34) * 0.22, 0.38, 0.5);
      out.blur = env.blur * 0.36;
      out.exposure = 1.45;
      out.vibrancy = 1.32;
    } else if (d.type === 'pill') {
      out.surface = clamp(0.52 + (env.cardAlpha - 0.34) * 0.18, 0.48, 0.58);
      out.blur = env.blur * 0.32;
      out.exposure = 1.15;
      out.vibrancy = 1.1;
    } else if (d.type === 'nav') {
      out.surface = 0.88;
      out.surfaceColor = env.accent;
      out.blur = 0;
      out.exposure = 1;
      out.vibrancy = 1;
      out.lensA += st.press * 9;
      out.surface = clamp(out.surface - st.press * 0.05, 0.78, 0.9);
      out.glow = st.pointerInside ? 0.04 + st.hover * 0.03 + st.press * 0.06 : 0;
    }

    out.rimAlpha *= env.rim;

    if (d.attrs.surface != null) out.surface = clamp(d.attrs.surface, 0, 1);
    if (d.attrs.surfaceColor) out.surfaceColor = d.attrs.surfaceColor;
    if (d.attrs.lensH != null) out.lensH = d.attrs.lensH;
    if (d.attrs.lensA != null) out.lensA = d.attrs.lensA;

    if (d.type === 'pill') {
      out.surface += st.hover * 0.05;
      out.lensH += st.press * 4;
      out.lensA += st.press * 7;
      out.surface -= st.press * 0.06;
      out.glow = st.pointerInside ? 0.05 + st.hover * 0.03 + st.press * 0.05 : 0;
    } else if (d.type === 'rail') {
      out.glow = st.pointerInside ? 0.025 + st.hover * 0.015 : 0;
    } else if (d.type === 'shell') {
      out.glow = 0;
    }

    return out;
  }

  /* ---------------- 弹簧 ---------------- */

  function stepValue(st, dt) {
    const stiffness = 210;
    const damping = 2 * Math.sqrt(stiffness) * 0.86;
    let active = false;

    if (Math.abs(st.pressTarget - st.press) > 0.001 || Math.abs(st.pressV) > 0.001) {
      const a = -stiffness * (st.press - st.pressTarget) - damping * st.pressV;
      st.pressV += a * dt;
      st.press += st.pressV * dt;
      if (st.press < 0) st.press = 0;
      if (st.press > 1.2) st.press = 1.2;
      if (Math.abs(st.pressTarget - st.press) < 0.002 && Math.abs(st.pressV) < 0.02) {
        st.press = st.pressTarget;
        st.pressV = 0;
      } else {
        active = true;
      }
    }

    const hoverDelta = st.hoverTarget - st.hover;
    if (Math.abs(hoverDelta) > 0.001) {
      st.hover += hoverDelta * Math.min(1, dt * 14);
      if (Math.abs(st.hoverTarget - st.hover) < 0.005) st.hover = st.hoverTarget;
      else active = true;
    }

    st.extraScale = 1 - st.press * 0.045;
    return active;
  }

  /* ---------------- 同级按钮的滑动选中 ---------------- */

  const PEER_PILL_GROUPS =
    '.status-filters, .comments-status-filters, .ideas-status-filters, .outline-status-filters';
  const PEER_SWITCH_GROUPS = '.view-switch';

  function ensureContentThumb(group) {
    if (!group || group.querySelector(':scope > .content-thumb')) return;
    const thumb = document.createElement('span');
    thumb.className = 'content-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    group.prepend(thumb);
  }

  function ensurePeerThumbs() {
    const presets = document.querySelector('.appearance-presets');
    if (presets && !presets.querySelector('.preset-thumb')) {
      const thumb = document.createElement('span');
      thumb.className = 'preset-thumb';
      thumb.setAttribute('aria-hidden', 'true');
      presets.prepend(thumb);
    }
    const swatches = document.querySelector('.appearance-swatches');
    if (swatches && !swatches.querySelector('.accent-thumb')) {
      const thumb = document.createElement('span');
      thumb.className = 'accent-thumb';
      thumb.setAttribute('aria-hidden', 'true');
      swatches.prepend(thumb);
    }
    document.querySelectorAll(PEER_PILL_GROUPS).forEach(ensureContentThumb);
    document.querySelectorAll(PEER_SWITCH_GROUPS).forEach(ensureContentThumb);
    document.querySelectorAll('.graph-tabs').forEach(ensureContentThumb);
  }

  function placePeerThumb(group, active, thumb, grow, key) {
    if (!group || !thumb) return;
    if (!active || !active.offsetWidth) {
      thumb.classList.remove('is-visible');
      if (key) peerHistory.set(key, { visible: false });
      return;
    }
    const width = active.offsetWidth + grow;
    const height = active.offsetHeight + grow;
    const x = active.offsetLeft - grow / 2;
    const y = active.offsetTop - grow / 2;
    const prev = key ? peerHistory.get(key) : null;
    const fresh = !thumb.classList.contains('is-visible');
    // 整组重绘时旧块会被移除：从刚点过的旧位置接着滑，而不是瞬移
    const resumed =
      fresh &&
      prev?.visible &&
      lastPeerPress.key === key &&
      performance.now() - lastPeerPress.at < 900;
    if (resumed) {
      thumb.style.width = prev.w + 'px';
      thumb.style.height = prev.h + 'px';
      thumb.style.transform = `translate3d(${prev.x}px, ${prev.y}px, 0)`;
      thumb.classList.add('is-visible');
      void thumb.offsetWidth;
      thumb.classList.add('is-ready');
    }
    thumb.style.width = width + 'px';
    thumb.style.height = height + 'px';
    thumb.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    thumb.classList.add('is-visible');
    if (!thumb.classList.contains('is-ready')) {
      requestAnimationFrame(() => thumb.classList.add('is-ready'));
    }
    if (key) peerHistory.set(key, { x, y, w: width, h: height, visible: true });
  }

  function peerKey(group) {
    const base = group.id || Array.from(group.classList).slice(0, 2).join('.') || 'peer';
    const host = group.closest('dialog');
    return host ? `${base}@${host.id}` : base;
  }

  function syncPeerThumbs() {
    peerSyncQueued = 0;
    const presets = document.querySelector('.appearance-presets');
    if (presets) {
      placePeerThumb(
        presets,
        presets.querySelector('.appearance-preset.is-active'),
        presets.querySelector('.preset-thumb'),
        0,
      );
    }
    const swatches = document.querySelector('.appearance-swatches');
    if (swatches) {
      placePeerThumb(
        swatches,
        swatches.querySelector('.accent-swatch.is-active'),
        swatches.querySelector('.accent-thumb'),
        6,
      );
    }
    document.querySelectorAll(PEER_PILL_GROUPS).forEach((group) => {
      ensureContentThumb(group);
      placePeerThumb(
        group,
        group.querySelector('.filter-pill.is-active'),
        group.querySelector('.content-thumb'),
        0,
        peerKey(group),
      );
    });
    document.querySelectorAll('.graph-tabs').forEach((group) => {
      ensureContentThumb(group);
      placePeerThumb(
        group,
        group.querySelector('.graph-tab.is-active'),
        group.querySelector('.content-thumb'),
        0,
        peerKey(group),
      );
    });
    document.querySelectorAll(PEER_SWITCH_GROUPS).forEach((group) => {
      ensureContentThumb(group);
      placePeerThumb(
        group,
        group.querySelector('.view-switch-btn.is-active'),
        group.querySelector('.content-thumb'),
        0,
        peerKey(group),
      );
    });
  }

  function schedulePeerSync() {
    if (peerSyncQueued) return;
    peerSyncQueued = requestAnimationFrame(syncPeerThumbs);
  }

  function initPeerMotion() {
    ensurePeerThumbs();
    syncPeerThumbs();
    const panel = document.getElementById('appearancePanel');
    if (panel && !panel._cabinPeerObserver) {
      panel._cabinPeerObserver = new MutationObserver(schedulePeerSync);
      panel._cabinPeerObserver.observe(panel, {
        attributes: true,
        attributeFilter: ['class', 'hidden', 'aria-pressed', 'style'],
        subtree: true,
      });
    }
    document.addEventListener(
      'pointerdown',
      (event) => {
        if (!(event.target instanceof Element)) return;
        const control = event.target.closest(
          '.filter-pill, .graph-tab, .appearance-preset, .accent-swatch, .view-switch-btn',
        );
        if (!control) return;
        const group = control.closest(
          '.status-filters, .comments-status-filters, .ideas-status-filters, ' +
            '.outline-status-filters, .graph-tabs, .appearance-presets, ' +
            '.appearance-swatches, .view-switch',
        );
        lastPeerPress = {
          key: group ? peerKey(group) : '',
          at: performance.now(),
        };
      },
      true,
    );
    const main = document.getElementById('mainContent');
    if (main && !main._cabinPeerObserver) {
      main._cabinPeerObserver = new MutationObserver(schedulePeerSync);
      main._cabinPeerObserver.observe(main, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'hidden', 'aria-pressed', 'aria-selected'],
      });
    }
    // 弹窗挂在 main 之外：分段按钮换选中态或开合时也要重排浮块
    document.querySelectorAll('dialog').forEach((dialog) => {
      if (dialog._cabinPeerObserver) return;
      dialog._cabinPeerObserver = new MutationObserver(schedulePeerSync);
      dialog._cabinPeerObserver.observe(dialog, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'hidden', 'open', 'aria-pressed'],
      });
    });
    window.addEventListener('resize', schedulePeerSync);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedulePeerSync).catch(() => {});
    }
  }

  /* ---------------- 背景 ---------------- */

  function loadWallpaper() {
    const entry = { img: null, ready: false, error: false };
    wallpaperEntry = entry;
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      entry.ready = true;
      uploadWallpaper(img);
      if (ready) invalidate();
    };
    img.onerror = function () {
      entry.error = true;
    };
    img.src = 'assets/img/story-library.jpg';
    entry.img = img;
  }

  function uploadWallpaper(img) {
    if (!gl) return;
    if (wallpaperTex) gl.deleteTexture(wallpaperTex);
    wallpaperTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, wallpaperTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    wallpaperReady = true;
  }

  function fitBackground() {
    const img = wallpaperEntry?.img;
    const iw = img?.naturalWidth || CSS_W;
    const ih = img?.naturalHeight || CSS_H;
    const s = Math.max(CSS_W / iw, CSS_H / ih);
    const drawnW = iw * s;
    const drawnH = ih * s;
    const offX = (CSS_W - drawnW) / 2;
    const offY = (CSS_H - drawnH) / 2;
    return {
      a: [CSS_W / drawnW, CSS_H / drawnH],
      b: [-offX / drawnW, -offY / drawnH],
    };
  }

  function drawBackground(env) {
    gl.useProgram(bgProg.program);
    gl.bindVertexArray(vao);
    const fit = fitBackground();
    gl.uniform1i(bgProg.u.uTex, 0);
    gl.uniform1f(bgProg.u.uHas, wallpaperReady ? 1 : 0);
    gl.uniform2f(bgProg.u.uBgA, fit.a[0], fit.a[1]);
    gl.uniform2f(bgProg.u.uBgB, fit.b[0], fit.b[1]);
    gl.uniform3f(bgProg.u.uBgColor, 0.086, 0.125, 0.227);
    gl.uniform1f(bgProg.u.uDim, env.dim);
    gl.activeTexture(gl.TEXTURE0);
    if (wallpaperTex) gl.bindTexture(gl.TEXTURE_2D, wallpaperTex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ---------------- drawing ---------------- */

  function setTransform(prog, d, inflate) {
    const fade = d.el.closest('.page') && pageFade.start < 1e8
      ? pageFade
      : { start: 1e9, end: 1e9 };
    gl.uniform2f(prog.u.uCanvas, CSS_W, CSS_H);
    gl.uniform2f(prog.u.uPos, d.x, d.y);
    gl.uniform2f(prog.u.uSize, d.w, d.h);
    gl.uniform2f(prog.u.uOrigin, d.w / 2, d.h / 2);
    gl.uniformMatrix2fv(prog.u.uMatrix, false, [1, 0, 0, 1]);
    gl.uniform2f(prog.u.uTranslate, 0, 0);
    gl.uniform2f(prog.u.uCenter, d.w / 2, d.h / 2);
    gl.uniform1f(prog.u.uExtraScale, d.st.extraScale);
    gl.uniform1f(prog.u.uInflate, inflate);
    if (prog.u.uFadeStart) gl.uniform1f(prog.u.uFadeStart, fade.start);
    if (prog.u.uFadeEnd) gl.uniform1f(prog.u.uFadeEnd, fade.end);
  }

  function mapPoint(d, x, y) {
    const qx = d.w / 2 + (x - d.w / 2) * d.st.extraScale;
    const qy = d.h / 2 + (y - d.h / 2) * d.st.extraScale;
    return [d.x + qx, d.y + qy];
  }

  function drawShadow(d, params, alpha) {
    const sh = params.shadow;
    if (!sh || sh.a <= 0.001 || sh.r <= 0 || alpha <= 0.001) return;
    const inflate = sh.r * 3 + 8;
    gl.useProgram(shadowProg.program);
    setTransform(shadowProg, d, inflate);
    gl.uniform4f(
      shadowProg.u.uRadii,
      d.radii[0],
      d.radii[1],
      d.radii[2],
      d.radii[3],
    );
    gl.uniform4f(shadowProg.u.uShadowColor, 0, 0, 0, sh.a);
    gl.uniform2f(shadowProg.u.uOffset, 0, sh.y);
    gl.uniform1f(shadowProg.u.uSigma, Math.max(1, sh.r * 0.5));
    gl.uniform1f(shadowProg.u.uAlpha, alpha);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function snapshotRegion(d, blur) {
    const pad = Math.max(12, blur * 2 + 10);
    const corners = [
      mapPoint(d, -pad, -pad),
      mapPoint(d, d.w + pad, -pad),
      mapPoint(d, d.w + pad, d.h + pad),
      mapPoint(d, -pad, d.h + pad),
    ];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < 4; i += 1) {
      minX = Math.min(minX, corners[i][0]);
      minY = Math.min(minY, corners[i][1]);
      maxX = Math.max(maxX, corners[i][0]);
      maxY = Math.max(maxY, corners[i][1]);
    }
    const x0 = Math.max(0, Math.floor(minX * DPR));
    const y0 = Math.max(0, Math.floor(minY * DPR));
    const x1 = Math.min(PX_W, Math.ceil(maxX * DPR));
    const y1 = Math.min(PX_H, Math.ceil(maxY * DPR));
    if (x1 - x0 < 2 || y1 - y0 < 2) return null;
    return { x: x0, y: PX_H - y1, w: x1 - x0, h: y1 - y0 };
  }

  function drawGlass(d, env) {
    const params = resolveParams(d, env);
    const st = d.st;
    const alpha = 1;
    if (alpha <= 0.002) return;

    const region = snapshotRegion(d, params.blur);
    if (!region) return;

    drawShadow(d, params, alpha);

    gl.useProgram(glassProg.program);
    setTransform(glassProg, d, 2);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, snapTex);
    gl.copyTexSubImage2D(
      gl.TEXTURE_2D,
      0,
      region.x,
      region.y,
      region.x,
      region.y,
      region.w,
      region.h,
    );

    gl.uniform1i(glassProg.u.uSnap, 0);
    gl.uniform1f(glassProg.u.uDpr, DPR);

    gl.uniform4f(
      glassProg.u.uRadii,
      d.radii[0],
      d.radii[1],
      d.radii[2],
      d.radii[3],
    );
    gl.uniform1f(glassProg.u.uLensHeight, params.lensH);
    gl.uniform1f(glassProg.u.uLensAmount, params.lensA);
    gl.uniform1f(glassProg.u.uDepth, params.depth);
    gl.uniform1f(glassProg.u.uBlur, params.blur);
    gl.uniform1f(glassProg.u.uChroma, params.chroma);
    gl.uniform1f(glassProg.u.uVibrancy, params.vibrancy);

    const sc = parseColor(params.surfaceColor);
    gl.uniform4f(glassProg.u.uSurface, sc.r, sc.g, sc.b, params.surface);

    gl.uniform3f(glassProg.u.uTint, 1, 1, 1);
    gl.uniform1f(glassProg.u.uTintAmount, 0);

    gl.uniform1i(glassProg.u.uRimMode, params.rim);
    gl.uniform1f(glassProg.u.uRimAlpha, params.rimAlpha);

    gl.uniform1f(glassProg.u.uGlow, params.glow);
    gl.uniform2f(glassProg.u.uGlowCenter, params.glowX, params.glowY);
    gl.uniform1f(glassProg.u.uGlowRadius, params.glowRadius);

    gl.uniform1f(glassProg.u.uInner, params.inner || 0);
    gl.uniform1f(glassProg.u.uInnerRadius, params.innerRadius || 8);
    gl.uniform1f(glassProg.u.uAlpha, alpha);
    gl.uniform1f(glassProg.u.uExposure, params.exposure);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function draw() {
    if (!ready) return;
    const env = readEnv();
    syncGeometry();

    gl.bindVertexArray(vao);
    gl.viewport(0, 0, PX_W, PX_H);
    gl.clearColor(0.086, 0.125, 0.227, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.disable(gl.BLEND);
    drawBackground(env);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    for (let i = 0; i < descs.length; i += 1) {
      drawGlass(descs[i], env);
    }

    if (!shown) {
      shown = true;
      root.classList.add('cabin-glass-on');
      initPeerMotion();
    }
  }

  /* ---------------- 调度 ---------------- */

  function frame(now) {
    rafId = 0;
    if (!ready) return;
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;
    let active = false;
    if (stepNav(dt)) active = true;
    for (let i = 0; i < descs.length; i += 1) {
      if (stepValue(descs[i].st, dt)) active = true;
    }
    if (dirty || active) {
      dirty = false;
      draw();
    }
    if (active) schedule();
  }

  function schedule() {
    if (!rafId) rafId = requestAnimationFrame(frame);
  }

  function invalidate() {
    dirty = true;
    schedule();
  }

  function refresh() {
    if (!ready) return;
    buildDescriptors();
    invalidate();
  }

  /* ---------------- init ---------------- */

  function resize() {
    CSS_W = Math.max(1, window.innerWidth);
    CSS_H = Math.max(1, window.innerHeight);
    const budget = Math.sqrt(MAX_PIXELS / (CSS_W * CSS_H));
    DPR = clamp(Math.min(window.devicePixelRatio || 1, 2, budget), 1, 2);
    PX_W = Math.max(1, Math.floor(CSS_W * DPR));
    PX_H = Math.max(1, Math.floor(CSS_H * DPR));
    if (!canvas) return;
    canvas.width = PX_W;
    canvas.height = PX_H;
    canvas.style.width = CSS_W + 'px';
    canvas.style.height = CSS_H + 'px';
    /* scrollbar-gutter: stable both-edges 会把固定层的内容原点推到滚动条留白之后，
       画布需反推回视口原点，否则整层玻璃相对 DOM 右移。 */
    const box = canvas.getBoundingClientRect();
    const curX = parseFloat(canvas.style.left) || 0;
    const curY = parseFloat(canvas.style.top) || 0;
    if (Math.abs(box.left) > 0.01) {
      canvas.style.left = Math.round((curX - box.left) * 100) / 100 + 'px';
    }
    if (Math.abs(box.top) > 0.01) {
      canvas.style.top = Math.round((curY - box.top) * 100) / 100 + 'px';
    }
    if (snapTex) gl.deleteTexture(snapTex);
    snapTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, snapTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      PX_W,
      PX_H,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  function init() {
    if (!document.body) return;
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.className = 'cabin-glass-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) {
      canvas.remove();
      canvas = null;
      return;
    }

    try {
      bgProg = link(VS_BG, FS_BG, 'background');
      shadowProg = link(VS_QUAD, FS_SHADOW, 'shadow');
      glassProg = link(VS_QUAD, FS_GLASS, 'glass');
    } catch (err) {
      canvas.remove();
      canvas = null;
      gl = null;
      if (window.console) console.error(err);
      return;
    }

    quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    resize();
    ready = true;
    pageEl = document.querySelector('.page');
    loadWallpaper();
    buildDescriptors();

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        refresh();
        invalidate();
      }, 80);
    });
    window.addEventListener(
      'scroll',
      () => {
        invalidate();
      },
      { passive: true },
    );
    window.addEventListener('hashchange', () => {
      setTimeout(refresh, 80);
      setTimeout(refresh, 320);
    });
    const sidebarEl = document.querySelector('.sidebar');
    if (sidebarEl) {
      let sidebarTimer = 0;
      new MutationObserver(() => {
        clearTimeout(sidebarTimer);
        sidebarTimer = setTimeout(refresh, 32);
      }).observe(sidebarEl, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true,
      });
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) invalidate();
    });
    window.addEventListener('input', (event) => {
      const t = event.target;
      if (t && t.closest && t.closest('#appearancePanel')) invalidate();
    });
    window.addEventListener('change', (event) => {
      const t = event.target;
      if (t && t.closest && t.closest('#appearancePanel')) invalidate();
    });
    new MutationObserver(() => invalidate()).observe(root, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => invalidate());
      ro.observe(document.body);
      if (!observedBody) observedBody = true;
    }
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      ready = false;
      root.classList.remove('cabin-glass-on');
    });

    invalidate();
  }

  window.CabinGlass = {
    refresh: refresh,
    invalidate: invalidate,
    isReady: function () {
      return ready;
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
