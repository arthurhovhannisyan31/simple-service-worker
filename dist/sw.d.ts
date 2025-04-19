import { AbstractSW } from "lib/common/abstract-sw";
import { CacheManager } from "lib/managers/cache-manager";
import { DataManager } from "lib/managers/data-manager";
import { StoreManager } from "lib/managers/store-manager";
export declare class MainSW extends AbstractSW {
    cacheManager: CacheManager;
    storageManager: StoreManager;
    dataManager: DataManager;
    client?: Client;
    version: string;
    constructor(sw: ServiceWorkerGlobalScope);
    init: () => Promise<void>;
    onInstall: ServiceWorkerGlobalScope["oninstall"];
    onActivate: ServiceWorkerGlobalScope["onactivate"];
    getClients: (senderId?: string) => Promise<Client[]>;
    onFetch: ServiceWorkerGlobalScope["onfetch"];
    onMessage: ServiceWorkerGlobalScope["onmessage"];
    dispose(): Promise<void>;
}
