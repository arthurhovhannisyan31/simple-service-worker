import { HttpStatusCode } from "lib/constants";
export class DataManager {
    worker;
    cacheManager;
    cacheVersion;
    constructor(worker, cacheManager, cacheVersion) {
        this.worker = worker;
        this.cacheManager = cacheManager;
        this.cacheVersion = cacheVersion;
    }
    enableNavigationPreload = async () => {
        if (this.worker.registration.navigationPreload) {
            await this.worker.registration.navigationPreload.enable();
        }
    };
    cacheWithPreload = async (request, preloadedResponse) => {
        const versionedCache = await caches.open(this.cacheVersion);
        const responseFromCache = await versionedCache.match(request.url);
        const rangedRequest = !!request.headers.get("range");
        if (responseFromCache) {
            if (rangedRequest) {
                return this.resolveRangeRequest(request, responseFromCache);
            }
            return responseFromCache;
        }
        let response = await preloadedResponse;
        if (rangedRequest) {
            /* Ranged requests are not possible to store by Partial Content,
            * hence they are prefetched and served partially */
            return response;
        }
        /* Consider adding retry method */
        if (!response || response.status >= 400) {
            response = await fetch(request);
        }
        if (response.ok) {
            await this.cacheManager.put(request, response.clone());
        }
        return response;
    };
    resolveRangeRequest = async (request, response) => {
        const arrayBuffer = await response.arrayBuffer();
        const bytes = /^bytes=(\d+)-(\d+)?$/g.exec(request.headers.get("range"));
        if (!bytes) {
            return new Response(null, {
                status: HttpStatusCode.RangeNotSatisfiable,
                statusText: "Range Not Satisfiable",
                headers: [["Content-Range", `*/${arrayBuffer.byteLength}`]],
            });
        }
        const start = Number(bytes[1]);
        const end = Number(bytes[2]) || arrayBuffer.byteLength - 1;
        const headers = new Headers();
        headers.append("Content-Range", `bytes ${start}-${end}/${arrayBuffer.byteLength}`);
        headers.append("Content-Length", arrayBuffer.byteLength.toString());
        ["Content-Security-Policy", "Content-Type"].forEach((header) => {
            headers.append(header, response.headers.get(header));
        });
        return new Response(arrayBuffer.slice(start, end + 1), {
            status: HttpStatusCode.PartialContent,
            statusText: "Partial Content",
            headers,
        });
    };
}
//# sourceMappingURL=data-manager.js.map