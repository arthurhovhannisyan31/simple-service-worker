export class CacheManager {
    worker;
    storeManager;
    cacheVersion;
    debug;
    assets = [];
    constructor(worker, storeManager, cacheVersion, debug) {
        this.worker = worker;
        this.storeManager = storeManager;
        this.cacheVersion = cacheVersion;
        this.debug = debug;
    }
    init = async (assetsConfig) => {
        const { paths, prefetchPaths, prefetchSize } = assetsConfig;
        this.assets = paths;
        await this.add(prefetchPaths, prefetchSize);
    };
    async add(requests, size) {
        try {
            const estimation = this.storeManager.getEstimation();
            if (estimation.quotaMemory > size) {
                const versionedCache = await caches.open(this.cacheVersion);
                await versionedCache.addAll(requests);
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    async put(request, response) {
        try {
            await this.storeManager.estimate();
            const estimation = this.storeManager.getEstimation();
            const responseSize = Number(response.headers.get("content-length") ?? 0);
            if (estimation.quotaMemory > responseSize) {
                const versionedCache = await caches.open(this.cacheVersion);
                await versionedCache.put(request, response);
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    delete = async (key) => {
        await caches.delete(key);
    };
    deleteAll = async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map(this.delete));
    };
    deleteOldCaches = async () => {
        const cacheKeepList = [this.cacheVersion];
        const keyList = await caches.keys();
        const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
        await Promise.all(cachesToDelete.map(this.delete));
    };
    deleteOldResources = async () => {
        if (!this.assets.length) {
            return;
        }
        const versionedCache = await caches.open(this.cacheVersion);
        const versionedCacheKeys = await versionedCache.keys();
        const removedAssets = [];
        for (const request of versionedCacheKeys) {
            if (!this.assets.some((asset) => request.url.includes(asset))) {
                if (!this.debug)
                    removedAssets.push(request.url);
                await versionedCache.delete(request);
            }
        }
        if (!this.debug && removedAssets.length) {
            console.group("Debug: Remove outdated assets from cache");
            removedAssets.forEach((el) => console.log(el));
            console.groupEnd();
        }
    };
}
//# sourceMappingURL=cache-manager.js.map