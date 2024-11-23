import { gridAwarePower } from '@greenweb/grid-aware-websites';
import { cloudflare } from '@greenweb/grid-aware-websites/plugins/edge';

export default {
	async fetch(request, env, ctx) {
		// First fetch the request
		const response = await fetch(request.url);
		// Then check if the request content type is HTML. If not, return the request and headers as is.
		const contentType = response.headers.get('content-type');

		// Check if the content type is HTML.
		// If not, return the response as is.
		if (!contentType || !contentType.includes('text/html')) {
			return new Response(response.body, {
				...response,
			});
		}

		// Get the country of the user from the Cloudflare data
		let cfData = cloudflare.getLocation(request);
		let { country } = cfData;

		// If the country is not found, return the response as is.
		if (!country) {
			return new Response(response.body, {
				...response,
				headers: {
					...response.headers,
					'grid-aware': 'Error - Country not found',
				},
			});
		}

		// Fetch the grid data for the country using the @greenweb/grid-aware-websites package
		const gridData = await gridAwarePower(country, env.EMAPS_API_KEY);

		// If the grid data is not found, return the response as is.
		if (gridData.status === 'error') {
			return new Response(response.body, {
				...response,
				headers: {
					...response.headers,
					'grid-aware': 'Error - Unable to fetch grid data',
				},
			});
		}

		// If the gridAware value is set to true, then let's modify the page
		if (gridData.gridAware) {
			let gridAwarePage = response
			/*
				Here you can use the HTMLRewriter API, or you can
				use other methods such as redirecting the user to a different page,
				or using a regular expression to change the CSS file used by the page.

				You can also import other libraries like Cheerio or JSDOM to modify the page
				if you are more comfortable with those.

				For this example, we will use the HTMLRewriter API to add a banner to the top of the page
				to show that this is a modified page.

				return new Response(new HTMLRewriter().on('html', {
					element(element) {
						element.prepend('<div>This is a modified page</div>', { html: true });
					},
				}).transform(response).body, {
					...response,
					contentType: 'text/html',
				});
			*/
			return new Response(gridAwarePage.body, {
				contentType: 'text/html',
				headers: {
					...gridAwarePage.headers,
					// We can also add some of the grid-aware data to the headers of the response
					'grid-aware': 'false',
					'grid-aware-zone': gridData.region,
					'grid-aware-power-mode': gridData.data.mode,
					'grid-aware-power-minimum': gridData.data.minimumPercentage,
					'low-carbon-percentage': gridData.data['low-carbon percentage'],
					'renewable-percentage': gridData.data['renewable percentage'],
				},
			});
		}

		return new Response(response.body, {
			contentType: 'text/html',
			headers: {
				...response.headers,
				// We can also add some of the grid-aware data to the headers of the response
				'grid-aware': 'false',
				'grid-aware-zone': gridData.region,
				'grid-aware-power-mode': gridData.data.mode,
				'grid-aware-power-minimum': gridData.data.minimumPercentage,
				'low-carbon-percentage': gridData.data['low-carbon percentage'],
				'renewable-percentage': gridData.data['renewable percentage'],
			},
		});
	},
};
