
export default async function(eleventyConfig) {
    const now = Date.now();
    console.log(now);
    eleventyConfig.setInputDirectory("src");
    eleventyConfig.addPassthroughCopy("static");
    eleventyConfig.addPassthroughCopy({ "static/index.css": `static/index.${now}.css` });
    eleventyConfig.addPassthroughCopy({"static/_headers": "_headers"});
    eleventyConfig.addWatchTarget("static/index.css");

    // Write a function that will add the timestamp to the css filename and return the new filename
    eleventyConfig.addFilter("cssTimestamp", function(value) {
        return value.replace(".css", `.${now}.css`);
    });
};