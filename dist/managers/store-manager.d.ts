import type { StorageState } from "../types";
export declare class StoreManager {
    protected worker: ServiceWorkerGlobalScope;
    storageState: StorageState;
    constructor(worker: ServiceWorkerGlobalScope);
    estimate: () => Promise<void>;
    getEstimation: () => StorageState;
    persistData: () => Promise<boolean | undefined>;
    isPersisted: () => Promise<boolean>;
}
