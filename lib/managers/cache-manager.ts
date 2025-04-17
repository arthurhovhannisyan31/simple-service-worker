import { getAssetsConfig } from "lib/helpers";

import type { StoreManager } from "./store-manager";
import type { AssetsManifest } from "lib/types";

export class CacheManager {
  assets: string[] = [];

  constructor(
    protected worker: ServiceWorkerGlobalScope,
    protected storeManager: StoreManager,
    protected cacheVersion: string,
    protected debug: boolean,
  ) {}

  init = async (
    assetsManifest: AssetsManifest,
    assetsPath: string
  ): Promise<void> => {
    const { paths, prefetchPaths, prefetchSize } = getAssetsConfig(
      assetsManifest,
      assetsPath
    );

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
        const versionedCache = await caches.open(this.cacheVersion);

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
        const versionedCache = await caches.open(this.cacheVersion);

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
    const cacheKeepList = [this.cacheVersion];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(this.delete));
  };

  deleteOldResources = async (): Promise<void> => {
    if (!this.assets.length) {
      return;
    }

    const versionedCache = await caches.open(this.cacheVersion);
    const versionedCacheKeys = await versionedCache.keys();
    const removedAssets: string[] = [];

    versionedCacheKeys.forEach((request: Request) => {
      if (!this.assets.some((asset: string) => request.url.includes(asset))) {
        if (!this.debug) removedAssets.push(request.url);

        versionedCache.delete(request);
      }
    });

    if (!this.debug && removedAssets.length) {
      console.group("Debug: Remove outdated assets from cache");
      removedAssets.forEach((el) => console.log(el));
      console.groupEnd();
    }
  };
}
