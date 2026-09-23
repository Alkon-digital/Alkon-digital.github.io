export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets/");

  // Абсолютный URL — нужен для canonical, sitemap и микроразметки
  eleventyConfig.addFilter("absolute", (path, base) =>
    new URL(path, base).href
  );

  eleventyConfig.addFilter("dateISO", (d) =>
    (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10)
  );

  // Дата по-русски: «23 сентября 2026». Для datetime в разметке остаётся dateISO.
  const MESYATSY = ["января","февраля","марта","апреля","мая","июня",
                    "июля","августа","сентября","октября","ноября","декабря"];
  eleventyConfig.addFilter("dateRu", (d) => {
    const x = d instanceof Date ? d : new Date(d);
    return `${x.getUTCDate()} ${MESYATSY[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
