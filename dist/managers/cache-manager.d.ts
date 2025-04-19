import type { StoreManager } from "./store-manager";
import type { AssetsManifest } from "../types";
export declare class CacheManager {
    protected worker: ServiceWorkerGlobalScope;
    protected storeManager: StoreManager;
    protected cacheVersion: string;
    protected debug: boolean;
    assets: string[];
    constructor(worker: ServiceWorkerGlobalScope, storeManager: StoreManager, cacheVersion: string, debug: boolean);
    init: (assetsManifest: AssetsManifest, assetsPath: string) => Promise<void>;
    add(requests: RequestInfo[], size: number): Promise<void>;
    put(request: RequestInfo, response: Response): Promise<void>;
    delete: (key: string) => Promise<void>;
    deleteAll: () => Promise<void>;
    deleteOldCaches: () => Promise<void>;
    deleteOldResources: () => Promise<void>;
}
