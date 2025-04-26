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

export interface AssetsManifestEntry {
  path: string;
  prefetch: boolean;
  size: number;
}

export type AssetsManifest = Record<string, AssetsManifestEntry>;

export interface SWConfig {
  assetsPath: string;
  staticAssetsPath: string; // Not needed
  cacheName: string;
  debugMode: boolean; // Not needed
}
