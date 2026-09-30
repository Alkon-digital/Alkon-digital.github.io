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

// Баннер главной: 4:3, потому что вёрстка держит именно это соотношение.
// Лежит в корне src/assets/img, а не в папках обложек.
const ROOT = "src/assets/img";
for (const f of (await readdir(ROOT)).filter(f => f.endsWith("-src.jpg"))) {
  const name = f.replace("-src.jpg", "");
  await sharp(`${ROOT}/${f}`).resize(1280, 960, { fit: "cover", position: "centre" })
    .webp({ quality: 74 }).toFile(`${ROOT}/${name}.webp`);
  await sharp(`${ROOT}/${f}`).resize(640, 480, { fit: "cover", position: "centre" })
    .webp({ quality: 72 }).toFile(`${ROOT}/${name}-sm.webp`);
  console.log(`img/${name} (4:3)`);
}
