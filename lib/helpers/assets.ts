import type { AssetsConfig, AssetsManifest } from "../types";

export const getAssetsConfig = (
  assetsManifest: AssetsManifest,
  assetsPath: string
): AssetsConfig => {
  const resources = Object.values(assetsManifest);

  return resources.reduce((acc, { size, path, prefetch }) => {
    acc.paths.push(path);

    if (prefetch) {
      acc.prefetchPaths.push(`/${assetsPath}/${path}`);
      acc.prefetchSize += size;
    }

    return acc;
  }, {
    paths: [] as string[],
    prefetchPaths: [] as string[],
    prefetchSize: 0,
  });
};
