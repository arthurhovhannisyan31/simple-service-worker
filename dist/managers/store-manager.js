export class StoreManager {
    worker;
    storageState = {
        quotaMemory: 0,
        usedMemory: 0,
        usedSpace: 0,
    };
    constructor(worker) {
        this.worker = worker;
    }
    estimate = async () => {
        const sm = navigator.storage;
        const { usage, quota } = await sm.estimate();
        if (usage !== undefined && quota !== undefined) {
            this.storageState.quotaMemory = quota;
            this.storageState.usedMemory = usage;
            this.storageState.usedSpace = Number((usage / quota).toFixed(4)) * 100;
        }
    };
    getEstimation = () => ({
        usedSpace: this.storageState.usedSpace,
        quotaMemory: this.storageState.quotaMemory,
        usedMemory: this.storageState.usedMemory,
    });
    persistData = async () => {
        if (navigator.storage && navigator.storage.persist) {
            return navigator.storage.persist();
        }
        return undefined;
    };
    isPersisted = async () => navigator.storage.persisted();
}
//# sourceMappingURL=store-manager.js.map