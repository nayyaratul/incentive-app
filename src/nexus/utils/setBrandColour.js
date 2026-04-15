// Contrast-driven scale: same method as colours page. See .local/colour-scale-method.md
const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const TARGET_CR = [1.02, 1.31, 1.73, 2.33, 3.10, 4.48, 3.10, 2.33, 1.73, 1.31, 1.02];
const TARGET_Y = TARGET_CR.map((cr, i) =>
  i <= 5 ? 1.05 / cr - 0.05 : cr * 0.05 - 0.05
);
const L_SEARCH_TOL = 1e-4;
const L_SEARCH_MAX_ITER = 50;

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const v = Math.round(Math.max(0, Math.min(1, c)) * 255);
    return v.toString(16).padStart(2, '0').toUpperCase();
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function rgbToOklab(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

function oklabToRgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
}

function oklabToOklch(L, a, b) {
  return {
    L,
    C: Math.sqrt(a * a + b * b),
    h: Math.atan2(b, a),
  };
}

function oklchToOklab(L, C, h) {
  return { L, a: C * Math.cos(h), b: C * Math.sin(h) };
}

export function hexToOklch(hex) {
  const [r, g, b] = hexToRgb(hex);
  const lab = rgbToOklab(r, g, b);
  return oklabToOklch(lab.L, lab.a, lab.b);
}

export function oklchToHex(L, C, h) {
  const { a, b } = oklchToOklab(L, C, h);
  const [r, g, bb] = oklabToRgb(L, a, b);
  return rgbToHex(r, g, bb);
}

function findLForTargetY(Y_target, C, h) {
  let lo = 0.002;
  let hi = 0.998;
  for (let iter = 0; iter < L_SEARCH_MAX_ITER; iter++) {
    const L = (lo + hi) / 2;
    const hex = oklchToHex(L, C, h);
    const Y = relativeLuminance(hex);
    if (Math.abs(Y - Y_target) < L_SEARCH_TOL) return hex;
    if (Y < Y_target) lo = L;
    else hi = L;
  }
  return oklchToHex((lo + hi) / 2, C, h);
}

export function generateBrandScale(brandHex) {
  const { C, h } = hexToOklch(brandHex);
  return Object.fromEntries(
    STEPS.map((step, i) => {
      const chromaScale = step <= 10 || step >= 90 ? 0.3 : step <= 20 || step >= 80 ? 0.7 : 1;
      const C_step = C * chromaScale;
      const hex = findLForTargetY(TARGET_Y[i], C_step, h);
      return [step, hex];
    })
  );
}

export function setBrandColour(brandHex) {
  const scale = generateBrandScale(brandHex);
  const root = document.documentElement;
  Object.entries(scale).forEach(([step, hex]) => {
    root.style.setProperty(`--brand-${step}`, hex);
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus:brandcolourchange', { detail: { hex: brandHex } }));
  }
}
