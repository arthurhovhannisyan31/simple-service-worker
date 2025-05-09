import { AbstractSW } from "./common";
import {
  DEFAULT_ASSETS_PATH,
  DEFAULT_CACHE_NAME,
  SW_VERSION,
  SWActions
} from "./constants";
import { getAssetsConfig } from "./helpers";
import { CacheManager, DataManager, StoreManager } from "./managers";

import type { AssetsConfig, AssetsManifest, SWConfig } from "./types";

export class MainSW extends AbstractSW {
  cacheManager: CacheManager;
  storageManager: StoreManager;
  dataManager: DataManager;
  client?: Client;
  version = SW_VERSION;
  assetsConfig: AssetsConfig;
  config: SWConfig;

  constructor(
    sw: ServiceWorkerGlobalScope,
    assetsManifest: AssetsManifest,
    {
      assetsPath = DEFAULT_ASSETS_PATH,
      cacheName = DEFAULT_CACHE_NAME,
      debugMode = false
    }: Partial<SWConfig>
  ) {
    super(sw);

    this.config = {
      assetsPath,
      cacheName,
      debugMode
    };
    this.assetsConfig = getAssetsConfig(assetsManifest, assetsPath);
    this.storageManager = new StoreManager(sw);
    this.cacheManager = new CacheManager(
      sw,
      this.storageManager,
      this.config.cacheName,
      this.config.debugMode
    );
    this.dataManager = new DataManager(
      sw,
      this.cacheManager,
      this.config.cacheName
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
    await this.cacheManager.init(this.assetsConfig);
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

    /*
    * skip non GET requests
    * skip non http requests (chrome-extension://*)
    * skip requests out of assets-manifest scope
    * */
    if (
      _e.request.method !== "GET"
      || !_e.request.url.startsWith("http")
      || !this.assetsConfig.paths.some((path) => _e.request.url.includes(path))
    ) {
      _e.respondWith(
        fetch(_e.request),
      );

      return;
    }

    _e.respondWith(this.dataManager.cacheWithPreload(
      _e.request,
      _e.preloadResponse,
    ));

    return;
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
