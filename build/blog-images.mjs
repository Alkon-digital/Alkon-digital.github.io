// Обложки статей: из исходных JPEG в WebP двух размеров.
// Запуск: node build/blog-images.mjs
import sharp from "sharp";
import { readdir, unlink } from "node:fs/promises";

const DIR = "src/assets/img/blog";
const files = (await readdir(DIR)).filter(f => f.endsWith("-src.jpg"));

for (const f of files) {
  const name = f.replace("-src.jpg", "");
  const src = `${DIR}/${f}`;

  // Крупная — в шапку статьи
  await sharp(src).resize(1280, 720, { fit: "cover", position: "centre" })
    .webp({ quality: 72 }).toFile(`${DIR}/${name}.webp`);

  // Мелкая — в карточку на странице блога
  await sharp(src).resize(640, 360, { fit: "cover", position: "centre" })
    .webp({ quality: 70 }).toFile(`${DIR}/${name}-sm.webp`);

  console.log(`${name}: 1280 и 640 готовы`);
}
