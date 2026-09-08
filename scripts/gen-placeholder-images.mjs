// Generates a small library of branded SVG placeholder images for property
// listings. Outbound access to stock-photo CDNs is blocked in this
// environment, so rather than faking photorealistic architecture (explicitly
// against the brief's visual-direction rules) we ship honest, on-brand
// placeholders that a real photo pipeline (see admin image upload) replaces.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "images", "properties");
mkdirSync(outDir, { recursive: true });

const PALETTES = [
  ["#0f1b3d", "#1f3163"],
  ["#16244f", "#2a4079"],
  ["#0a1128", "#16244f"],
  ["#1f3163", "#3a4f8a"],
  ["#0f1b3d", "#2a4079"],
  ["#16244f", "#1f3163"],
];

const ICONS = {
  house: `<path d="M60 190 V120 L160 60 L260 120 V190 Z" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.55"/><rect x="140" y="150" width="40" height="40" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.55"/>`,
  apartment: `<rect x="90" y="50" width="140" height="150" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.55"/>
    <line x1="90" y1="85" x2="230" y2="85" stroke="url(#g)" stroke-width="2" opacity="0.4"/>
    <line x1="90" y1="120" x2="230" y2="120" stroke="url(#g)" stroke-width="2" opacity="0.4"/>
    <line x1="90" y1="155" x2="230" y2="155" stroke="url(#g)" stroke-width="2" opacity="0.4"/>
    <line x1="140" y1="50" x2="140" y2="200" stroke="url(#g)" stroke-width="2" opacity="0.4"/>
    <line x1="185" y1="50" x2="185" y2="200" stroke="url(#g)" stroke-width="2" opacity="0.4"/>`,
  villa: `<path d="M50 180 L50 130 L120 90 L120 130 L200 130 L240 100 L280 130 L280 180 Z" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.55"/>`,
  plot: `<rect x="60" y="70" width="200" height="120" fill="none" stroke="url(#g)" stroke-width="3" stroke-dasharray="10 8" opacity="0.55"/>
    <line x1="60" y1="130" x2="260" y2="130" stroke="url(#g)" stroke-width="2" stroke-dasharray="6 6" opacity="0.4"/>
    <line x1="160" y1="70" x2="160" y2="190" stroke="url(#g)" stroke-width="2" stroke-dasharray="6 6" opacity="0.4"/>`,
  shop: `<rect x="70" y="90" width="180" height="100" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.55"/>
    <path d="M70 90 L90 55 H230 L250 90" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.55"/>
    <rect x="150" y="140" width="30" height="50" fill="none" stroke="url(#g)" stroke-width="2" opacity="0.4"/>`,
  office: `<rect x="100" y="40" width="120" height="160" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.55"/>
    ${Array.from({ length: 5 })
      .map((_, i) => `<line x1="100" y1="${65 + i * 25}" x2="220" y2="${65 + i * 25}" stroke="url(#g)" stroke-width="2" opacity="0.35"/>`)
      .join("")}`,
};

function svg({ palette, icon, label, sub }) {
  const [c1, c2] = palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 320 213">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d4b06a"/>
      <stop offset="1" stop-color="#f6f2e9"/>
    </linearGradient>
  </defs>
  <rect width="320" height="213" fill="url(#bg)"/>
  <g transform="translate(0,-6)">${ICONS[icon]}</g>
  <text x="300" y="196" text-anchor="end" font-family="Georgia, serif" font-size="13" fill="#f6f2e9" opacity="0.9">${label}</text>
  <text x="300" y="208" text-anchor="end" font-family="Arial, sans-serif" font-size="7" letter-spacing="2" fill="#d4b06a">${sub}</text>
</svg>`;
}

const SPECS = [
  { file: "prop-1.svg", icon: "apartment", label: "BOK MyHome", sub: "APARTMENT" },
  { file: "prop-2.svg", icon: "villa", label: "BOK MyHome", sub: "VILLA" },
  { file: "prop-3.svg", icon: "house", label: "BOK MyHome", sub: "INDEPENDENT HOUSE" },
  { file: "prop-4.svg", icon: "plot", label: "BOK MyHome", sub: "PLOT / LAND" },
  { file: "prop-5.svg", icon: "shop", label: "BOK MyHome", sub: "SHOP" },
  { file: "prop-6.svg", icon: "office", label: "BOK MyHome", sub: "OFFICE" },
  { file: "prop-7.svg", icon: "apartment", label: "BOK MyHome", sub: "FLAT" },
  { file: "prop-8.svg", icon: "villa", label: "BOK MyHome", sub: "PREMIUM VILLA" },
  { file: "prop-9.svg", icon: "house", label: "BOK MyHome", sub: "RESALE HOUSE" },
  { file: "prop-10.svg", icon: "apartment", label: "BOK MyHome", sub: "COMMERCIAL" },
  { file: "prop-11.svg", icon: "plot", label: "BOK MyHome", sub: "AGRICULTURAL LAND" },
  { file: "prop-12.svg", icon: "office", label: "BOK MyHome", sub: "CO-WORKING OFFICE" },
];

SPECS.forEach((spec, i) => {
  const palette = PALETTES[i % PALETTES.length];
  writeFileSync(path.join(outDir, spec.file), svg({ palette, ...spec }));
});

// A wide hero placeholder
writeFileSync(
  path.join(__dirname, "..", "public", "images", "misc", "hero.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <defs>
      <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0a1128"/>
        <stop offset="1" stop-color="#1f3163"/>
      </linearGradient>
      <radialGradient id="glow" cx="80%" cy="20%" r="60%">
        <stop offset="0" stop-color="#d4b06a" stop-opacity="0.25"/>
        <stop offset="1" stop-color="#d4b06a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#hg)"/>
    <rect width="1920" height="1080" fill="url(#glow)"/>
    <g opacity="0.5" stroke="#d4b06a" stroke-width="2" fill="none">
      <path d="M200 900 L200 600 L560 420 L920 600 L920 900 Z"/>
      <path d="M1000 900 L1000 500 L1300 500 L1300 350 L1600 350 L1600 900 Z"/>
    </g>
  </svg>`
);

console.log(`Generated ${SPECS.length} property placeholders + 1 hero image.`);
