import { AbstractSW } from "./common";
import { CacheManager, DataManager, StoreManager } from "./managers";
import type { SWConfig } from "./types";
export declare class MainSW extends AbstractSW {
    cacheManager: CacheManager;
    storageManager: StoreManager;
    dataManager: DataManager;
    client?: Client;
    version: string;
    config: SWConfig;
    constructor(sw: ServiceWorkerGlobalScope, { assetsPath, staticAssetsPath, cacheName, debugMode }: Partial<SWConfig>);
    init: () => Promise<void>;
    onInstall: ServiceWorkerGlobalScope["oninstall"];
    onActivate: ServiceWorkerGlobalScope["onactivate"];
    getClients: (senderId?: string) => Promise<Client[]>;
    onFetch: ServiceWorkerGlobalScope["onfetch"];
    onMessage: ServiceWorkerGlobalScope["onmessage"];
    dispose(): Promise<void>;
}
