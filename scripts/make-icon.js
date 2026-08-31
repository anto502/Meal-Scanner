const fs = require('fs');
const sharp = require('sharp');

const art = (color) => `
  <g fill="none" stroke="${color}" stroke-width="34" stroke-linecap="round">
    <circle cx="512" cy="512" r="235"/>
    <circle cx="512" cy="512" r="132" stroke-width="26"/>
  </g>
  <g stroke="${color}" stroke-width="30" stroke-linecap="round" fill="none">
    <line x1="150" y1="320" x2="150" y2="704"/>
    <line x1="108" y1="320" x2="108" y2="440"/>
    <line x1="192" y1="320" x2="192" y2="440"/>
    <line x1="108" y1="440" x2="192" y2="440"/>
    <line x1="874" y1="320" x2="874" y2="704"/>
    <path d="M 874 320 C 912 372 912 452 874 500"/>
  </g>`;

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${inner}</svg>`;

const scale = (s) => `translate(512 512) scale(${s}) translate(-512 -512)`;

(async () => {
  fs.mkdirSync('assets', { recursive: true });

  await sharp(Buffer.from(svg(`<rect width="1024" height="1024" fill="#16A34A"/>${art('#FFFFFF')}`)))
    .png().toFile('assets/icon.png');

  await sharp(Buffer.from(svg(`<g transform="${scale(0.62)}">${art('#FFFFFF')}</g>`)))
    .png().toFile('assets/adaptive-icon.png');

  await sharp(Buffer.from(svg(`<g transform="${scale(0.7)}">${art('#16A34A')}</g>`)))
    .png().toFile('assets/splash-icon.png');

  console.log('Icons generated: assets/icon.png, assets/adaptive-icon.png, assets/splash-icon.png');
})();
