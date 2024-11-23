export default async function(eleventyConfig) {
    eleventyConfig.setInputDirectory("src");
    eleventyConfig.addPassthroughCopy("static");
    eleventyConfig.addPassthroughCopy({"static/_headers": "_headers"});
    eleventyConfig.addWatchTarget("static/index.css");
};