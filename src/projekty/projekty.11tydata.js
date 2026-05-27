module.exports = {
  layout: "projekt.njk",
  eleventyComputed: {
    permalink: (data) => {
      if (data.ma_podstrone === false) return false;
      return `/realizacje/${data.page.fileSlug}/index.html`;
    },
  },
};
