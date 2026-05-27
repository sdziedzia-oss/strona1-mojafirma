const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Passthrough kopie
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("robots.txt");

  // Obserwuj zmiany CSS i JS
  eleventyConfig.addWatchTarget("assets/css/");
  eleventyConfig.addWatchTarget("assets/js/");

  // Filtr daty
  eleventyConfig.addFilter("dateFormat", (date) => {
    return DateTime.fromJSDate(new Date(date)).setLocale("pl").toFormat("d LLLL yyyy");
  });

  eleventyConfig.addFilter("dateISO", (date) => {
    return DateTime.fromJSDate(new Date(date)).toISODate();
  });

  // Filtr ograniczenia tablicy
  eleventyConfig.addFilter("limit", (arr, limit) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, limit);
  });

  // Filtr sortowania po dacie
  eleventyConfig.addFilter("sortByDate", (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.sort((a, b) => {
      return new Date(b.data.data || b.date) - new Date(a.data.data || a.date);
    });
  });

  // Filtr: selectattr – wybiera elementy, gdzie atrybut (zagnieżdżony: "data.klucz") jest prawdziwy lub równy wartości
  eleventyConfig.addFilter("selectattr", (arr, attr, value) => {
    if (!Array.isArray(arr)) return [];
    const keys = attr.split(".");
    return arr.filter((item) => {
      let val = item;
      for (const k of keys) val = val != null ? val[k] : undefined;
      return value !== undefined ? val === value : !!val;
    });
  });

  // Filtr: rejectattr – odwrotność selectattr
  eleventyConfig.addFilter("rejectattr", (arr, attr, value) => {
    if (!Array.isArray(arr)) return [];
    const keys = attr.split(".");
    return arr.filter((item) => {
      let val = item;
      for (const k of keys) val = val != null ? val[k] : undefined;
      return value !== undefined ? val !== value : !val;
    });
  });

  // Filtr: padStart – dopełnia string zerami/znakami od lewej
  eleventyConfig.addFilter("padStart", (num, len, fill) => {
    return String(num).padStart(len || 2, fill || "0");
  });

  // Filtr: sortByKey – sortuje kolekcję po polu w data
  eleventyConfig.addFilter("sortByKey", (arr, key) => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
      const va = a.data?.[key] ?? 99;
      const vb = b.data?.[key] ?? 99;
      return va - vb;
    });
  });

  // Kolekcje
  eleventyConfig.addCollection("uslugi", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/uslugi/*.md");
  });

  eleventyConfig.addCollection("projekty", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/projekty/*.md").sort((a, b) => {
      return (a.data.kolejnosc || 99) - (b.data.kolejnosc || 99);
    });
  });

  eleventyConfig.addCollection("blog", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/blog/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => new Date(b.data.data) - new Date(a.data.data));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
