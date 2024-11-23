export const gridAwareRewriter = (gridData, method) => {
    return new HTMLRewriter()
        .on('html', {
            element(element) {
                element.setAttribute('data-grid-aware', 'true');
            },
        })
        .on('span#page-color', {
            element(element) {
                element.setInnerContent('dark mode');
            },
        })
        .on('span#cleaner-dirtier', {
            element(element) {
                element.setInnerContent('dirtier than a certain value.');
            },
        })
        .on('#data', {
            element(element) {
                element.setInnerContent(JSON.stringify(gridData, null, 2).trim());
            },
        })
        .on('.platform', {
            element(element) {
                element.setInnerContent('Cloudflare Workers');
            },
        })
        .on('#font-type', {
            element(element) {
                element.setInnerContent('system font');
            },
        })
        .on('figure > img', {
            element(element) {
                const src = element.getAttribute('src');
                const alt = element.getAttribute('alt');
                element.setAttribute('data-grid-aware-src', src);
                element.removeAttribute('src');
                element.after(`<div class="grid-aware-img-placeholder"><a href="${src}" target="_blank">View original image</a><p>${alt}</p></div>`, { html: true });
            },
        })
        .on('figure > figcaption', {
            element(element) {
                element.remove();
            },
        }).on('#snippet', {
            element(element) {
                element.setInnerContent(cloudflareSnippet(method));
            },
        }).on('#code-link', {
            element(element) {
                let codeUrl = 'https://github.com/fershad/grid-aware-demo/blob/main/grid-aware-workers/cloudflare/co2e/src/index.js'
                if (method === 'gridAwarePower') {
                    codeUrl = 'https://github.com/fershad/grid-aware-demo/blob/main/grid-aware-workers/cloudflare/power/src/index.js'
                }
                element.before(`<a href="${codeUrl}" target="_blank">View the full code on GitHub</a>`, { html: true });
            },
        })
}

export const regularRewriter = (gridData, method) => {
    return new HTMLRewriter()
        .on('#data', {
            element(element) {
                element.setInnerContent(JSON.stringify(gridData, null, 2).trim());
            },
        })
        .on('.platform', {
            element(element) {
                element.setInnerContent('Cloudflare Workers');
            },
        })
        .on('#snippet', {
            element(element) {
                element.setInnerContent(cloudflareSnippet(method));
            },
        }).on('#code-link', {
            element(element) {
                let codeUrl = 'https://github.com/fershad/grid-aware-demo/blob/main/grid-aware-workers/cloudflare/co2e/src/index.js'
                if (method === 'gridAwarePower') {
                    codeUrl = 'https://github.com/fershad/grid-aware-demo/blob/main/grid-aware-workers/cloudflare/power/src/index.js'
                }
                element.before(`<a href="${codeUrl}" target="_blank">View the full code on GitHub</a>`, { html: true });
            },
        })
}

export const cloudflareSnippet = (method) => {
return `
// Import the things we need from the grid-aware-websites library
import { ${method} } from 'grid-aware-websites';
import { cloudflare } from 'grid-aware-websites/plugins/edge';

export default {
    async fetch(request, env, ctx) {
        // First fetch the request
        const response = await fetch(request.url);
        // Then check if the request content type is HTML. If not, return the request as is.
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('text/html')) {
            return new Response(response.body, {
                ...response,
            });
        }

        // If the content type is HTML, we can then do the grid-aware checks, based on the user location.
        // Here we use the country, but you could also use lat-lon.
        let cfData = cloudflare.getLocation(request);
        let { country } = cfData;

        // If we can't get that information, return the response as it is.
        // We also add a header to the response to show that the country was not found. (optional)
        if (!country) {
            return new Response(response.body, {
                ...response,
                headers: {
                    ...response.headers,
                    'grid-aware': 'Error - Country not found',
                },
            });
        }

        // Fetch the grid data from Electricity Maps via the grid-aware-websites library
        const gridData = await ${method}(country, 'AN_API_KEY_HERE');

        // If the grid data status is error, return the response as is.
        if (gridData.status === 'error') {
            return new Response(response.body, {
                ...response,
                headers: {
                    ...response.headers,
                    'grid-aware': 'Error - Unable to fetch grid data',
                },
            });
        }

        // If the gridAware value is set to true, we add a data-grid-aware attribute to the HTML tag of the page using the HTMLRewriter
        if (gridData.gridAware) {
            const rewriter = new HTMLRewriter()
                .on('html', {
                    element(element) {
                        element.setAttribute('data-grid-aware', 'true');
                    },
                })
                
                // ... Add more rewriter rules here. I have removed them for brevity.

            // Return the response with the rewriter applied
            // You can also return some of the grid-aware data in the headers of the response if you want.
            return new Response(rewriter.transform(response).body, {
                ...response,
                contentType: 'text/html',
                headers: {
                    ...response.headers,
                    'grid-aware': 'true',
                },
            });
        }


        // Otherwise, if the gridAware value is false, we return the response as is.
        // Again, we can add some headers to the response to show that the page is not grid-aware.
        return new Response(addData.transform(response).body, {
            ...response,
            contentType: 'text/html',
            headers: {
                ...response.headers,
                'grid-aware': 'false',
            },
        });
    },
};`
}