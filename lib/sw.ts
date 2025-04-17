import { AbstractSW } from "lib/common/abstract-sw";
import { CacheManager } from "lib/managers/cache-manager";
import { DataManager } from "lib/managers/data-manager";
import { StoreManager } from "lib/managers/store-manager";

import {
  ASSETS_PATH,
  CACHE_VERSION,
  DEBUG_MODE,
  STATIC_ASSETS_PATH,
  SW_VERSION,
  SWActions
} from "./constants";

import type { AssetsManifest } from "lib/types";

export class MainSW extends AbstractSW {
  cacheManager: CacheManager;
  storageManager: StoreManager;
  dataManager: DataManager;
  client?: Client;
  version = SW_VERSION;

  constructor(sw: ServiceWorkerGlobalScope) {
    super(sw);

    this.storageManager = new StoreManager(sw);
    this.cacheManager = new CacheManager(
      sw,
      this.storageManager,
      CACHE_VERSION,
      DEBUG_MODE
    );
    this.dataManager = new DataManager(
      sw,
      this.cacheManager,
      CACHE_VERSION
    );

    this.setup(
      this.onInstall,
      this.onActivate,
      this.onFetch,
      this.onMessage,
    );
  }

  init = async (): Promise<void> => {
    await this.storageManager.estimate();
    // ../../../../configs/generated/assets-manifest.json
    const assetsPath: string = process.env.ASSETS_MANIFEST ?? "";

    if (!assetsPath) {
      return;
    }

    const assetsManifest = await fetch(assetsPath); // TODO Add types

    await this.cacheManager.init(
      assetsManifest as never as AssetsManifest,
      ASSETS_PATH
    );
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

    if (_e.request.method === "GET" && _e.request.url.includes(STATIC_ASSETS_PATH)) {
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
