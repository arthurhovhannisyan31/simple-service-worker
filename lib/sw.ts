import { AbstractSW } from "lib/workers/service-worker/common/abstract-sw";
import { CacheManager } from "lib/workers/service-worker/managers/cache-manager";
import { DataManager } from "lib/workers/service-worker/managers/data-manager";
import { StoreManager } from "lib/workers/service-worker/managers/store-manager";

import { NEXT_STATIC_FILE_PATH, SW_VERSION, SWActions } from "./constants";
import assetsManifest from "../../../../configs/generated/assets-manifest.json";

import type { AssetsManifest } from "lib/workers/service-worker/types";

export class MainSW extends AbstractSW {
  cacheManager: CacheManager;

  storageManager: StoreManager;

  dataManager: DataManager;

  client: Client;

  version = SW_VERSION;

  constructor(sw: ServiceWorkerGlobalScope) {
    super(sw);

    this.storageManager = new StoreManager(sw);
    this.cacheManager = new CacheManager(sw, this.storageManager);
    this.dataManager = new DataManager(sw, this.cacheManager);

    this.setup(
      this.onInstall,
      this.onActivate,
      this.onFetch,
      this.onMessage,
    );
  }

  init = async (): Promise<void> => {
    await this.storageManager.estimate();
    await this.cacheManager.init(assetsManifest as never as AssetsManifest);
  };

  onInstall: ServiceWorkerGlobalScope["oninstall"] = (_e): void => {
    _e.waitUntil(this.init());
    _e.waitUntil(this.skipWaiting());
  };

  onActivate: ServiceWorkerGlobalScope["onactivate"] = (_e): void => {
    _e.waitUntil(this.dataManager.enableNavigationPreload());
    _e.waitUntil(this.cacheManager.deleteOldCaches());
    _e.waitUntil(this.cacheManager.deleteOldResources());
    _e.waitUntil(this.claim());
  };

  getClients = async (senderId = ""): Promise<Client[]> => {
    const clients = await this.worker.clients?.matchAll({
      includeUncontrolled: true,
    }) ?? [];

    return clients.filter((client) => client.id !== senderId);
  };

  onFetch: ServiceWorkerGlobalScope["onfetch"] = (
    _e,
  ): void => {
    if (_e.request.mode === "navigate" && _e.preloadResponse) {
      _e.respondWith(_e.preloadResponse);

      return;
    }

    if (_e.request.method === "GET" && _e.request.url.includes(NEXT_STATIC_FILE_PATH)) {
      _e.respondWith(this.dataManager.cacheWithPreload(
        _e.request,
        _e.preloadResponse,
      ));

      return;
    }

    _e.respondWith(
      fetch(_e.request),
    );
  };

  onMessage: ServiceWorkerGlobalScope["onmessage"] = async (
    _e,
  ): Promise<void> => {
    const senderId = (_e.source as WindowClient).id;

    switch (_e.data.type) {
      case SWActions.LOGOUT: {
        try {
          const clients = await this.getClients(senderId);
          clients.forEach((client) => client.postMessage({
            type: SWActions.LOGOUT,
          }));
        } catch (_err) {
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
        } catch (_err) {
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

  async dispose(): Promise<void> {
    await this.cacheManager.deleteAll();
  }
}

declare const self: ServiceWorkerGlobalScope;

new MainSW(self);

export default {} as ServiceWorker;
