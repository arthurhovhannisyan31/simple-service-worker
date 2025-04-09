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
