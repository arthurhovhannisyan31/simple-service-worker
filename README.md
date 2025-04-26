<div align="center">
  <h1><code>simple-service-worker</code></h1><sub>Built with 🕸</sub>
</div>

## Usage

yarn add

no env variables required
pass config to constructor and init helpers

## Description

This Service worker (SW) implements [proxy server](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) for HTTP requests initiated in the
[Main thread](https://developer.mozilla.org/en-US/docs/Glossary/Main_thread) or
[Worker thread](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).

All requests are intercepted by `SW` and only `GET` requests for static assets are served from the
browser
[Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) if present.

Implemented serving strategy is [Cache first](https://web.dev/learn/pwa/serving#cache_first).
The main idea is to serve assets from the `Cache` and fetch missing assets, and store them
to the `Cache`.

> Learn more:
> - [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
> - [PWA: Service workers](https://web.dev/learn/pwa/service-workers)

## Configuration

`SW` activity is configured by the feature flag and can be turned on and off for all users.
Please see environment variable `NEXT_PUBLIC_SW_ACTIVE` on Vercel
[Project Settings](https://vercel.com/billups/measurements-dashboard/settings/environment-variables).

On each page load user client checks `SW` activity and registers `SW` if flag is enabled and
unregisters existing `SW` if flag is disabled.

## Workflow

### Bootstrap
- Create sw.js file and init module scoped worker
```javascript
// Add example
``` 
- Configure webpack build for service worker
```javascript
// Add example
```
- Update project build workflow 
```javascript
// Add example
```

### Build
During the build process NextJS generates a json report, the `assets-manifest.json`. This report
includes information about the generated static assets. Filenames include the hashed code, the [contenthash](https://webpack.js.org/guides/caching/#output-filenames). It works as file versioning and helps to
distinguish assets from the same import path between the builds.

Please see the [next.config.js](../../../../next.config.js) for implementation details.

assets-manifest.json:
```json
{
  "/static/media/1.webp": {
    "path": "/static/media/1.bd3b73c4.webp",
    "size": 6994
  },
  "pages/_app.css": {
    "path": "static/css/c39d84cdd9950dfd.css",
    "size": 11274
  },
  "main.js": {
    "path": "static/chunks/main-cb94f45fca856550.js",
    "size": 124939
  },
  "pages/_app.js": {
    "path": "static/chunks/pages/_app-acce6e5444b2ecfa.js",
    "size": 561517
  },
  "pages/attention-delivery/[id]/reach.js": {
    "path": "static/chunks/pages/attention-delivery/[id]/reach-ec4e6315d934a434.js",
    "size": 3787
  },
  "static/chunks/9820-da8c62c9051da335.js": {
    "path": "static/chunks/9820-da8c62c9051da335.js",
    "size": 11290
  }
}
```

### Assets caching and serving
NextJS web-server serves static assets from `_next/static/` path and presence of this
path is checked in each `GET` request `URL`. Matching request response is searched in dedicated
`CachedStorage` and served right away if present and missing assets are fetched.

Before pushing response to the dedicated `CachedStorage` available memory quota is checked using
`StorageManager`.
In case a given response size can fit into available memory quota, the response is cached.

### Cleanup
Before storing responses to browser `Cache` all outdated responses are cleaned up from the memory.
On page load registered `SW` checks dedicated `CachedStorage` against newest `assets-manifest.json` file. Any response from cache missing in assets-manifest is deleted as outdated, hence only
assets from the latest build stored in the client memory.

> Learn more:
> - [Webpack Assets Manifest](https://github.com/webdeveric/webpack-assets-manifest)
> - [Webpack Caching](https://webpack.js.org/guides/caching/#output-filenames)
> - [StorageManager](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager)
> - [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
> - [CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)

## Development

In order to force update of `SW` on the client side, the `SW_VERSION` should be changed to
trigger the `byte-by-byte`check. This way the
[update](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update)
will kick off and replace active `SW` with the new one.

For development purposes, it is recommended to run production build locally.
```shell
yarn build && yarn start
```
The `contenthash` that is generated for files is inconsistent in webpack dev server between the builds.
It generates a new `sw.js` file after each file change, which triggers registration of a new `SW` over and over again.
Please see the links for details.

> Learn more:
> - [Webpack build's [contenthash] diverges from build to build](https://github.com/webpack/webpack/issues/17757)
> - [ServiceWorkerRegistration:update](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update)

