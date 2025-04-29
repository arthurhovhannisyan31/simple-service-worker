<div align="center">
  <h1><code>simple-service-worker</code></h1>
</div>

# Overview
This Service worker (SW)  implements [proxy server](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) for HTTP requests initiated in the [Main thread](https://developer.mozilla.org/en-US/docs/Glossary/Main_thread) or [Worker thread](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).
All requests are intercepted by `SW` and only validated requests are served right from the  browser [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) if present.
Implemented serving strategy is [Cache first](https://web.dev/learn/pwa/serving#cache_first). Assets are served from the `Cache` and missing assets are fetched and stored in the `Cache`. 

`SW` is framework-agnostic, it does not affect runtime code in any way. `SW` is easy to add and remove from the project, it does not create any dependency risk.

Only one instance of `SW` is allowed for registration and only one instance of `Cache` can be used at time.

> Learn more:
> - [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
> - [PWA: Service workers](https://web.dev/learn/pwa/service-workers)

# Assets fetching, caching and serving
Request validation includes checks for request method, protocol and match against manifest file. 

Request should have `GET` method, `http*` like protocol and `URL` should have matching entry in `assets-manifest`.
Matching request response is searched in dedicated `CachedStorage` and served right away if present and missing assets are fetched and cached.

All other type of requests are fetched and served as usual, `SW` does not modify or change any parameters in request or response.

Before pushing response to the dedicated `CachedStorage` available memory quota is checked using
`StorageManager`.
In case a given response size can fit into available memory quota, the response is cached.

This approach provides flexibility in build assets structure and limits files which will be stored in user browser memory.

> See implementation details [sw.ts](https://github.com/arthurhovhannisyan31/simple-service-worker/blob/main/lib/sw.ts), [data-manager.ts](https://github.com/arthurhovhannisyan31/simple-service-worker/blob/main/lib/managers/data-manager.ts)

# Cleanup
Before storing responses to browser `Cache` all outdated responses are cleaned up from the memory.
On page load registered `SW` checks dedicated `CachedStorage` against newest `assets-manifest.json` file. Any response from cache missing in assets-manifest is deleted as outdated, hence only
assets from the latest build stored in the client memory.

> See implementation details [cache-manager.ts](https://github.com/arthurhovhannisyan31/simple-service-worker/blob/main/lib/managers/cache-manager.ts)
 
> Learn more:
> - [Webpack Assets Manifest](https://github.com/webdeveric/webpack-assets-manifest)
> - [Webpack Caching](https://webpack.js.org/guides/caching/#output-filenames)
> - [StorageManager](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager)
> - [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
> - [CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
___

# Usage

## Install
Install the package using following command:
```shell
  npm install @arthurhovhannisyan31/simple-service-worker
```
```shell 
  yarn add @arthurhovhannisyan31/simple-service-worker
```


## Configuration
In order to add this `SW` to the project several steps needs to be configured:
- Assets-manifest should be generated after each build
- `SW` module should import latest `assets-manifest`
- `SW` bundle should be generated and deployed with project build files
- `SW` init function should be called on page load

`SW` activity can be configured by the feature flag on your deployment platform and can be turned on and off for all users.
On each page load user client checks `SW` activity and registers `SW` if flag is enabled and
unregisters existing `SW` if flag is disabled.

### Assets-manifest generation
`assets-manifest` should not be versioned and should be generated during the build.
The file should have the following structure to match `SW` implementation.
```typescript
type AssetsManifest = Record<string, AssetsManifestEntry>

interface AssetsManifestEntry {
    path: string;
    prefetch: boolean;
    size: number;
}
```
Example: 
```json
{
  "acabf7c2dab4fc2cae30.393.chunk.js": {
    "path": "acabf7c2dab4fc2cae30.393.chunk.js",
    "size": 2320,
    "prefetch": false
  },
  "...": {},
  "favicon.ico": {
    "path": "favicon.ico",
    "size": 318,
    "prefetch": false
  }
}
```
Filenames should include the hashed code, the [contenthash](https://webpack.js.org/guides/caching/#output-filenames). It works as file versioning and helps to
distinguish assets from the same import path between the builds. If file name is missing `contenthash` from it's name it will not be invalidated by `SW` and new response for that request will not be served.

> To force `SW` update it's cached assets a new `cache-name` should be provided to `SW` constructor. A new cache will be created and old one disposed.

### `assets-manifest` generation using [webpack-assets-manifest](https://www.npmjs.com/package/webpack-assets-manifest)
```js
  plugins: [
    ...
    new WebpackAssetsManifest({
      enabled: true,
      customize(entry, _, __, asset) {
        if (entry.key.match(excludedAssetsRegExp)) {
          return false;
        }

        return {
          key: entry.key,
          value: {
            path: entry.value,
            size: asset.source.size(),
            prefetch: prefetchedAssetsRegExp.test(entry.key),
          },
        };
      },
      async done(manifest) {
        await manifest.writeTo("public/assets-manifest.json");
      },
    })
    ...
  ]
```
### `SW` module
A `SW` module should be a standalone js module, which should include all required code for it's workflow.

Create a new file `<sw-module-name>.ts` and set it up as follows:

```typescript
import { MainSW, type AssetsManifest } from "@arthurhovhannisyan31/simple-service-worker";

export const assetsPath = process.env.ASSETS_PATH;
export const cacheName = process.env.CACHE_VERSION;
export const debugMode = process.env.DEBUG_MODE === "true";

import assetsManifest from "public/assets-manifest.json";

declare const self: ServiceWorkerGlobalScope;

new MainSW(
  self,
  assetsManifest as AssetsManifest, {
    assetsPath,
    cacheName,
    debugMode,
  });

export default {} as ServiceWorker;
```
- `MainSW` - will bring all the JS code needed for the `SW` instance. `MainSW` is a regular JS class and can be subclassed and enhanced if needed.
- `assetsPath` - is the base path to serving folder of your FE server. Resulting path builds as follows: `${assetsPath}/${filePath}`.
- `debugMode` - provides extra information regarding `SW` workflow which is logged to the console.
- `assets-manifest` - can be generated to any path and should be available for import during build time.

> - NextJS web-server serves static assets from `/_next` and resulting path should have following structure: `/_next/static/chunks/webpack-fb87bb6d32811a51.js`
> - Assets may be served from the root path, in that case `assetsPath` can be omited: `/favicon.ico`
> - To avoid missing `assets-manifest` import error just [touch](https://www.ibm.com/docs/hu/aix/7.2?topic=t-touch-command) the file before running build scripts 

### `SW` bundle generation
`SW` bundle should include all the required code and emitted to project distribution folder along with other files. Code can be bundled to a single file or imported using ES imports. 

> Learn more 
> [ES modules in service workers](https://web.dev/articles/es-modules-in-sw)

### `SW` bundle generation using `webpack`
```typescript
/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("path");

const dotenv = require("dotenv").config();
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const webpack = require("webpack");

const isProd = process.env.NODE_ENV === "production";

/** @type { import('webpack').Configuration } */
module.exports = {
  mode: "production",
  target: ["web", "es2020"],
  entry: {
    "service-worker": {
      import: path.resolve("src", "lib", "service-worker", "index.ts"),
      filename: "service-worker.js",
    },
  },
  output: {
    path: path.resolve("dist"),
    publicPath: "",
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin({
      configFile: "./tsconfig.json",
    })],
    extensions: [".ts", ".js"],
  },
  stats: "minimal",
  optimization: {
    minimize: true,
  },
  module: {
    rules: [
      {
        exclude: [/node_modules/],
        test: /\.(ts|js)?$/,
        loader: "ts-loader",
        options: {
          compilerOptions: {
            noEmit: false,
            outDir: "dist",
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(isProd ? process.env : dotenv.parsed),
    }),
  ],
};
```

- `entry["service-worker"].import` is the path to `<sw-module-name>.ts` file.
- `entry["service-worker"].filename` is the resulting filename of `SW` bundle. 

### `SW` init function
`SW` init function should be added to the root of your main.js file or root component.

A `SW Manager` instance accepts following config for instantiation: 

```typescript
    {
        enabled: boolean;
        postMessage?: (action: AnyAction) => void;
        swPath?: string;   
    }
```
- `enabled` - flag determines whether `SW` should be deactivated or stay enabled.
- `postMessage` - callback to accept messages before and after `SW` initialization. Messages are dispatched on registration success or failure cases. See full list of actions here [constants.ts](https://github.com/arthurhovhannisyan31/simple-service-worker/blob/main/lib/constants.ts).
- `swPath` - is the path to `SW` module in build assets. The default value is `"/service-worker.js"`

```typescript
  const swManager = await SWManager.init({
    enabled: swEnabled,
    postMessage: (action: AnyArray) => {
      console.log(action);
    },
  });
```
Example of using with react:
```typescript
import { useEffect, useRef } from "react";

import { isSWRegistrationValid, SWManager } from "@arthurhovhannisyan31/simple-service-worker";

import { swEnabled } from "lib/constants";

export const useInitSW = (): void => {
  const swManagerRef = useRef<SWManager>(undefined);

  useEffect(() => {
    if (!isSWRegistrationValid() || swManagerRef.current) return;

    const init = async (): Promise<void> => {
      const swManager = await SWManager.init({
        enabled: swEnabled,
        postMessage: (action) => {
          console.log(action);
        },
      });

      if (swManager) {
        swManagerRef.current = swManager;
      }
    };

    init();
  }, []);
};

```

## Development
In order to force update of `SW` on the client side, the `SW_VERSION` should be changed to
trigger the `byte-by-byte`check. This way the
[update](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update)
will kick off and replace active `SW` with the new one.

For development purposes, it is recommended to run production build locally.
```shell
yarn build && yarn start
```

> Learn more:
> - [Webpack build's [contenthash] diverges from build to build](https://github.com/webpack/webpack/issues/17757)
> - [ServiceWorkerRegistration:update](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update)

