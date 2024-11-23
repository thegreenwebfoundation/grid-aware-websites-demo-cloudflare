/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { gridAwareCO2e, gridAwarePower} from 'grid-aware-websites';
import {cloudflare} from 'grid-aware-websites/plugins/edge';
import {gridAwareRewriter, regularRewriter} from '../../utils';

export default {
	async fetch(request, env, ctx) {
		// First fetch the request
		const response = await fetch(request.url);
		// Then check if the request content type is HTML. If not, return the request and headers as is.
		const contentType = response.headers.get('content-type');
		const { pathname } = new URL(request.url);

		if ((!contentType || !contentType.includes('text/html'))) {
			return new Response(response.body, {
				...response,
			});
		}

		// If the content type is HTML, we can then do the grid aware checks
		let cfData = cloudflare.getLocation(request);
		let { country } = cfData;


		if (!country) {
			return new Response(response.body, {
				...response,
				headers: {
					...response.headers,
					'grid-aware': 'Error - Country not found',
				},
			});
		}

		const gridData = await gridAwareCO2e(country, env.EMAPS_API_KEY);

		// console.log(gridData);

		if (gridData.status === 'error') {
			return new Response(response.body, {
				...response,
				headers: {
					...response.headers,
					'grid-aware': 'Error - Unable to fetch grid data',
				},
			});
		}

		// If the gridAware value is set to true, then we need to edit the "data-theme" attribute of the HTML tag to "dark" using the HTmlRewriter
		if (gridData.gridAware) {
			// Create a new HTMLRewriter instance
			// Also add a banner to the top of the page to show that this is a modified page
			const rewriter = gridAwareRewriter(gridData, "gridAwareCO2e");


			// Return the response with the rewriter applied
			return new Response(rewriter.transform(response).body, {
				...response,
				contentType: 'text/html',
				headers: {
					...response.headers,
					'grid-aware': 'true',
					zone: gridData.region,
					carbonIntensity: gridData.data.carbonIntensity,
					averageCarbonIntensity: gridData.data.averageIntensity,
					mode: gridData.data.mode,
					minimumPercentage: gridData.data.minimumPercentage,
					"low-carbon-percentage": gridData.data["low-carbon percentage"],
					"renewable-percentage": gridData.data["renewable percentage"],
				},
			});
		}

		
		const rewriter = regularRewriter(gridData, "gridAwareCO2e");

		return new Response(rewriter.transform(response).body, {
			...response,
			contentType: 'text/html',
			headers: {
				...response.headers,
				'grid-aware': 'false',
				zone: gridData.region,
					carbonIntensity: gridData.data.carbonIntensity,
					averageCarbonIntensity: gridData.data.averageIntensity,
					mode: gridData.data.mode,
					minimumPercentage: gridData.data.minimumPercentage,
					"low-carbon-percentage": gridData.data["low-carbon percentage"],
					"renewable-percentage": gridData.data["renewable percentage"],
			},
		});
}
}
