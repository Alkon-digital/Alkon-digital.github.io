// Обложки: из исходных JPEG в WebP двух размеров.
// Обрабатывает все папки, где лежат файлы вида <имя>-src.jpg
// Запуск: node build/images.mjs
import sharp from "sharp";
import { readdir } from "node:fs/promises";

// Исходники лежат в media/ — вне публикуемой папки: иначе Eleventy копировал бы
// их в сборку, а это 21 МБ, на которые со страниц никто не ссылается.
const PAIRS = [["media/blog", "src/assets/img/blog"],
               ["media/otrasli", "src/assets/img/otrasli"],
               ["media/uslugi", "src/assets/img/uslugi"]];

for (const [from, to] of PAIRS) {
  let files;
  try { files = (await readdir(from)).filter(f => f.endsWith("-src.jpg")); }
  catch { continue; }

  for (const f of files) {
    const name = f.replace("-src.jpg", "");
    const src = `${from}/${f}`;
    await sharp(src).resize(1280, 720, { fit: "cover", position: "centre" })
      .webp({ quality: 72 }).toFile(`${to}/${name}.webp`);
    await sharp(src).resize(640, 360, { fit: "cover", position: "centre" })
      .webp({ quality: 70 }).toFile(`${to}/${name}-sm.webp`);
    console.log(`${to.split("/").pop()}/${name}`);
  }
}

// Баннер главной: 4:3, потому что вёрстка держит именно это соотношение.
// Лежит в корне src/assets/img, а не в папках обложек.
const ROOT = "media";
for (const f of (await readdir(ROOT)).filter(f => f.endsWith("-src.jpg"))) {
  const name = f.replace("-src.jpg", "");
  await sharp(`${ROOT}/${f}`).resize(1280, 960, { fit: "cover", position: "centre" })
    .webp({ quality: 74 }).toFile(`src/assets/img/${name}.webp`);
  await sharp(`${ROOT}/${f}`).resize(640, 480, { fit: "cover", position: "centre" })
    .webp({ quality: 72 }).toFile(`src/assets/img/${name}-sm.webp`);
  console.log(`img/${name} (4:3)`);
}
