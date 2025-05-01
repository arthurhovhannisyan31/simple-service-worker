import type { CacheManager } from "./cache-manager";
export declare class DataManager {
    protected worker: ServiceWorkerGlobalScope;
    protected cacheManager: CacheManager;
    protected cacheVersion: string;
    constructor(worker: ServiceWorkerGlobalScope, cacheManager: CacheManager, cacheVersion: string);
    enableNavigationPreload: () => Promise<void>;
    cacheWithPreload: (request: FetchEvent["request"], preloadedResponse: FetchEvent["preloadResponse"]) => Promise<Response>;
    resolveRangeRequest: (request: FetchEvent["request"], response: Response) => Promise<Response>;
}
