import { PROD_ENV } from "configs/constants";
import { NEXT_CACHE_VERSION } from "lib/workers/service-worker/constants";
import { getAssetsConfig } from "lib/workers/service-worker/helpers";

import type { StoreManager } from "./store-manager";
import type { AssetsManifest } from "lib/workers/service-worker/types";

export class CacheManager {
  assets: RequestInfo[];

  constructor(
    protected worker: ServiceWorkerGlobalScope,
    protected storeManager: StoreManager,
  ) {}

  init = async (assetsManifest: AssetsManifest): Promise<void> => {
    const { paths, prefetchPaths, prefetchSize } = getAssetsConfig(assetsManifest);

    this.assets = paths;

    await this.add(
      prefetchPaths,
      prefetchSize,
    );
  };

  async add(requests: RequestInfo[], size: number): Promise<void> {
    try {
      const estimation = this.storeManager.getEstimation();

      if (estimation.quotaMemory > size) {
        const versionedCache = await caches.open(NEXT_CACHE_VERSION);

        await versionedCache.addAll(requests);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async put(request: RequestInfo, response: Response): Promise<void> {
    try {
      await this.storeManager.estimate();
      const estimation = this.storeManager.getEstimation();
      const responseSize = Number(response.headers.get("content-length") ?? 0);

      if (estimation.quotaMemory > responseSize) {
        const versionedCache = await caches.open(NEXT_CACHE_VERSION);

        await versionedCache.put(request, response);
      }
    } catch (err) {
      console.log(err);
    }
  }

  delete = async (key: string): Promise<void> => {
    await caches.delete(key);
  };

  deleteAll = async (): Promise<void> => {
    const keys = await caches.keys();
    await Promise.all(keys.map(this.delete));
  };

  deleteOldCaches = async (): Promise<void> => {
    const cacheKeepList = [NEXT_CACHE_VERSION];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(this.delete));
  };

  deleteOldResources = async (): Promise<void> => {
    const versionedCache = await caches.open(NEXT_CACHE_VERSION);
    const versionedCacheKeys = await versionedCache.keys();
    const removedAssets: string[] = [];

    versionedCacheKeys.forEach((request) => {
      if (!this.assets.some((asset: string) => request.url.includes(asset))) {
        if (!PROD_ENV) removedAssets.push(request.url);

        versionedCache.delete(request);
      }
    });
    if (!PROD_ENV && removedAssets.length) {
      console.group("Debug: Remove outdated assets from cache");
      removedAssets.forEach((el) => console.log(el));
      console.groupEnd();
    }
  };
}
