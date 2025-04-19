import { AbstractSW } from "./common";
import { CacheManager, DataManager, StoreManager } from "./managers";
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
