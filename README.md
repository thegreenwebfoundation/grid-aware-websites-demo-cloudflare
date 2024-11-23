# Grid-aware websites demo

This repo is a demo site for the Green Web Foundation's Grid-aware Websites project. It demonstrates grid-aware code being run in:

- Cloudflare Workers
- Netlify Edge Functions
- ... more to come

## Demo sites

You can see this code working on the public internet at:

### Cloudflare Workers

[https://gaw.fershad.com](https://gaw.fershad.com)

This website is hosted on Cloudflare Pages, and has Cloudflare Workers running on the `/grid-intensity` and `/power-breakdown` routes. You can view the workers code for those routes at [`/grid-aware-workers/cloudflare`](/grid-aware-workers/cloudflare/).

### Netlify Edge Functions

[https://grid-aware-demo.netlify.app/](https://grid-aware-demo.netlify.app/)

This website is hosted on Netlify, and uses their Edge Functions platform to run on the `/grid-intensity` and `/power-breakdown` routes. You can view the workers code for those routes at [`/grid-aware-workers/netlify`](/grid-aware-workers/netlify)
