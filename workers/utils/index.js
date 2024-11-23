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
                if (method === 'gridAwarePower') {
                    element.setInnerContent('using less than 50% renewable energy.');
                } else {
                    element.setInnerContent('has a higher grid intensity than average.');
                }
            },
        })
        .on('#data', {
            element(element) {
                element.setInnerContent(JSON.stringify(gridData, null, 2).trim());
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
        })
}

export const regularRewriter = (gridData, method) => {
    return new HTMLRewriter()
        .on('#data', {
            element(element) {
                element.setInnerContent(JSON.stringify(gridData, null, 2).trim());
            },
        })
}