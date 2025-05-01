export const getAssetsConfig = (assetsManifest, assetsPath) => {
    const resources = Object.values(assetsManifest);
    return resources.reduce((acc, { size, path, prefetch }) => {
        acc.paths.push(path);
        if (prefetch) {
            acc.prefetchPaths.push(`${assetsPath}/${path}`);
            acc.prefetchSize += size;
        }
        return acc;
    }, {
        paths: [],
        prefetchPaths: [],
        prefetchSize: 0,
    });
};
//# sourceMappingURL=assets.js.map