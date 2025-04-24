import { AbstractSW } from "./common";
import { ASSETS_PATH, CACHE_VERSION, DEBUG_MODE, STATIC_ASSETS_PATH, SW_VERSION, SWActions } from "./constants";
import { CacheManager, DataManager, StoreManager } from "./managers";
export class MainSW extends AbstractSW {
    cacheManager;
    storageManager;
    dataManager;
    client;
    version = SW_VERSION;
    constructor(sw) {
        super(sw);
        this.storageManager = new StoreManager(sw);
        this.cacheManager = new CacheManager(sw, this.storageManager, CACHE_VERSION, DEBUG_MODE);
        this.dataManager = new DataManager(sw, this.cacheManager, CACHE_VERSION);
        this.setup(this.onInstall, this.onActivate, this.onFetch, this.onMessage);
    }
    init = async () => {
        await this.storageManager.estimate();
        const assetsPath = process.env.ASSETS_MANIFEST;
        if (!assetsPath) {
            return;
        }
        const assetsManifest = await fetch(assetsPath); // TODO Add types for response
        await this.cacheManager.init(assetsManifest, ASSETS_PATH);
    };
    onInstall = (_e) => {
        _e.waitUntil(this.init());
        _e.waitUntil(this.skipWaiting());
    };
    onActivate = (_e) => {
        _e.waitUntil(this.dataManager.enableNavigationPreload());
        _e.waitUntil(this.cacheManager.deleteOldCaches());
        _e.waitUntil(this.cacheManager.deleteOldResources());
        _e.waitUntil(this.claim());
    };
    getClients = async (senderId = "") => {
        const clients = await this.worker.clients?.matchAll({
            includeUncontrolled: true,
        }) ?? [];
        return clients.filter((client) => client.id !== senderId);
    };
    onFetch = (_e) => {
        if (_e.request.mode === "navigate" && _e.preloadResponse) {
            _e.respondWith(_e.preloadResponse);
            return;
        }
        if (_e.request.method === "GET" && _e.request.url.includes(STATIC_ASSETS_PATH)) {
            _e.respondWith(this.dataManager.cacheWithPreload(_e.request, _e.preloadResponse));
            return;
        }
        _e.respondWith(fetch(_e.request));
    };
    onMessage = async (_e) => {
        const senderId = _e.source.id;
        switch (_e.data.type) {
            case SWActions.LOGOUT: {
                try {
                    const clients = await this.getClients(senderId);
                    clients.forEach((client) => client.postMessage({
                        type: SWActions.LOGOUT,
                    }));
                }
                catch (_err) {
                    console.error(_err);
                }
                break;
            }
            case SWActions.DISPOSE: {
                await this.cacheManager.deleteAll();
                break;
            }
            case SWActions.CONNECT_CLIENT: {
                try {
                    this.client = await this.worker.clients.get(senderId);
                }
                catch (_err) {
                    console.error(_err);
                }
                break;
            }
            case SWActions.UNREGISTER_SW: {
                await this.dispose();
                break;
            }
        }
    };
    async dispose() {
        await this.cacheManager.deleteAll();
    }
}
//# sourceMappingURL=sw.js.map