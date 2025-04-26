export interface StorageState {
  quotaMemory: number;
  usedMemory: number;
  usedSpace: number;
}

export interface AssetsConfig {
  paths: string[];
  prefetchPaths: string[];
  prefetchSize: number;
}

export interface AssetsManifest {
  key: string;
  value: {
    path: string;
    prefetch: boolean;
  };
}

export interface SWConfig {
  assetsPath: string;
  staticAssetsPath: string; // Not needed
  cacheName: string;
  debugMode: boolean; // Not needed
}
