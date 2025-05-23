const CleanCSS = require("clean-css");
const { minify } = require("terser");
const metagen = require("eleventy-plugin-metagen");
const eleventyNavigation = require("@11ty/eleventy-navigation");
const Image = require("@11ty/eleventy-img");

module.exports = (eleventyConfig) => {

  eleventyConfig.addPlugin(metagen);
  eleventyConfig.addPlugin(eleventyNavigation);

  eleventyConfig.setTemplateFormats([
    "md",
    "njk"
  ]);

  markdownTemplateEngine: "njk";

  // Perform manual passthrough file copy to include directories in the build output _site
  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/photos");
  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/js");
  eleventyConfig.addPassthroughCopy("./src/favicon_data");

  // Create css-clean CSS Minifier filter
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Create terser JS Minifier async filter (Nunjucks)
  eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (
    code,
    callback
  ) {
    try {
      const minified = await minify(code);
      callback(null, minified.code);
    } catch (err) {
      console.log(`Terser error: ${err}`);
      callback(null, code);
    }
  });

  // Configure image in a template paired shortcode
  eleventyConfig.addPairedShortcode("image", (srcSet, src, alt, sizes = "(min-width: 400px) 33.3vw, 100vw") => {
    return `<img srcset="${srcSet}" src="${src}" alt="${alt}" sizes="${sizes}" />`;
  });

  // Configure outgoing Pexels anchor elements in a template paried shortcode
  eleventyConfig.addPairedShortcode("link", (href, cls = "image-link", rel = "noopener", target = "_blank", btnTxt = "Pexels") => {
    return `<a class="${cls}" href="${href}" rel="${rel}" target="${target}">${btnTxt}</a>`;
  });

  // Get the current year
  eleventyConfig.addShortcode("getYear", function () {
    const year = new Date().getFullYear();
    return year.toString();
  });

eleventyConfig.addShortcode("img", async function ({ src, alt, className, imgDir }) {
  if (alt === undefined) {
    throw new Error(`Missing \`alt\` on responsive image from: ${src}`);
  }

  const IMAGE_DIR = imgDir || "/images/";

  // 直接使用原始图片，不生成压缩格式
  const originalSrcPath = IMAGE_DIR + src;

  const img = `
    <img
      src="${originalSrcPath}"
      alt="${alt}"
      loading="lazy"
      decoding="async"
      class="${className || ''}"
    >`;

  // 返回简单的 <picture> 标签（只使用原图）
  return `<picture>${img}</picture>`;
});


  return {
    dir: {
      input: "src",
      output: "_site",
      layouts: "_includes/layouts",
      includes: "_includes",
    },
    templateFormats: ["md", "liquid", "njk"],
    passthroughFileCopy: true
  }
};
