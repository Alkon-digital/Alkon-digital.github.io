// Растровые иконки из SVG. Запуск: node build/icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "src/assets/img";
await mkdir(OUT, { recursive: true });

// Плотный знак под квадратную иконку, поля добавляем сами
const mark = (fg, accent) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
     <rect x="0" y="0" width="40" height="10" fill="${fg}"/>
     <rect x="0" y="15" width="26" height="10" fill="${fg}"/>
     <rect x="0" y="30" width="12" height="10" fill="${accent}"/>
   </svg>`
);

// favicon 32 — без полей, знак во всю ширину, под тёмную тему сайта
await sharp(mark("#EDF4F0", "#5BE38A"), { density: 384 })
  .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(`${OUT}/favicon-32.png`);

// apple-touch 180 — на фирменной подложке с полями, иначе iOS обрежет
await sharp({
  create: { width: 180, height: 180, channels: 4, background: "#0F1A17" }
})
  .composite([{
    input: await sharp(mark("#EDF4F0", "#5BE38A"), { density: 600 })
      .resize(116, 116, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer(),
    gravity: "centre"
  }])
  .png()
  .toFile(`${OUT}/apple-touch-icon.png`);

console.log("иконки готовы: favicon-32.png, apple-touch-icon.png");
