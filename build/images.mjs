// Обложки: из исходных JPEG в WebP двух размеров.
// Обрабатывает все папки, где лежат файлы вида <имя>-src.jpg
// Запуск: node build/images.mjs
import sharp from "sharp";
import { readdir } from "node:fs/promises";

const DIRS = ["src/assets/img/blog", "src/assets/img/otrasli", "src/assets/img/uslugi"];

for (const dir of DIRS) {
  let files;
  try { files = (await readdir(dir)).filter(f => f.endsWith("-src.jpg")); }
  catch { continue; }

  for (const f of files) {
    const name = f.replace("-src.jpg", "");
    const src = `${dir}/${f}`;
    await sharp(src).resize(1280, 720, { fit: "cover", position: "centre" })
      .webp({ quality: 72 }).toFile(`${dir}/${name}.webp`);
    await sharp(src).resize(640, 360, { fit: "cover", position: "centre" })
      .webp({ quality: 70 }).toFile(`${dir}/${name}-sm.webp`);
    console.log(`${dir.split("/").pop()}/${name}`);
  }
}
