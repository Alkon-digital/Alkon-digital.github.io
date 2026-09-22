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

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
