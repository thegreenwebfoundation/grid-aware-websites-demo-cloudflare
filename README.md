# Grid-aware websites demo

This repo is a demo website for the Green Web Foundation's [Grid-aware Websites](https://github.com/thegreenwebfoundation/grid-aware-websites) project. It demonstrates grid-aware code being run in against routes using Cloudflare Workers.

## Demo sites

You can see this code working on the public internet at: [https://gaw.greenweb.org](https://gaw.greenweb.org)

## How it works

This demo shows the `@greenweb/grid-aware-websites` package being used to check the state of the client's energy grid in order to determine if changes should be made to the returned web page. The code runs in two Cloudflare Workers, one for each of the routes below:

- `/power-breakdown`: This worker checks to see if the current percentage of renewable energy being used on the client's electricity grid is below a set threshold (in our case 50%). If it is, then the `@greenweb/grid-aware-websites` library returns a value indicating that changes should be made to the returned web page to reduce the energy it might use on the client's device. These changes are applied using the `HTMLRewriter` API. [See the Worker source code.](/workers/power/src/index.js).
- `/grid-breakdown`: This worker checks to see if the current grid carbon intensity (in grams CO2e/kilowatt-hour) of the client's electricity grid is above the last known annual average. If it is, then the `@greenweb/grid-aware-websites` library returns a value indicating that changes should be made to the returned web page to reduce the energy it might use on the client's device. These changes are applied using the `HTMLRewriter` API. [See the Worker source code.](/workers/co2e/src/index.js).

For more information, see the [Grid-aware Websites](https://github.com/thegreenwebfoundation/grid-aware-websites) project repository.

## Running locally

This website is a minimal Eleventy site with some static assets. To run this project locally, you can:

1. Clone the repository
2. In the root folder for this project, run `npm install`.
3. In the `workers/co2e` and `workers/power` folders, rename the `example.dev.vars` to `.dev.vars`. Inside that file, update the `EMAPS_API_KEY` variable to your [Electricity Maps API Key](https://www.electricitymaps.com/free-tier-api).
4. To run the site locally, you can run the following commands:
   1. `npm run dev:power` to check the `/power-breakdown` route.
   1. `npm run dev:co2e` to check the `/grid-intensity` route.

## Deploying the site

You can deploy this site to Cloudflare Pages by following their regular [deployment instructions for Eleventy websites](https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/#deploy-with-cloudflare-pages).

### Before deploying Workers

Before deploying the Cloudflare Workers, you should first change the `routes` in the `wrangler.toml` files that are located in the `workers/co2e` and `workers/power` folders. Change the routes to the url `pattern` & `zone_name` or `zone_id` your recently deployed site.

### Deploying Workers

To deploy the Cloudflare Worker scripts, run the following command in the root of this project.

1. `npx wrangler login`. This will log you in to your Cloudflare account.
2. `npm run workers:deploy`. This should deploy the two workers to the Cloudflare zone you've specified.
