import { HttpStatusCode } from "lib/constants";

import type { CacheManager } from "./cache-manager";

export class DataManager {
  constructor(
    protected worker: ServiceWorkerGlobalScope,
    protected cacheManager: CacheManager,
    protected cacheVersion: string
  ) {}

  enableNavigationPreload = async (): Promise<void> => {
    if (this.worker.registration.navigationPreload) {
      await this.worker.registration.navigationPreload.enable();
    }
  };

  cacheWithPreload = async (
    request: FetchEvent["request"],
    preloadedResponse: FetchEvent["preloadResponse"],
  ): Promise<Response> => {
    const versionedCache = await caches.open(this.cacheVersion);
    const responseFromCache = await versionedCache.match(request.url);
    const rangedRequest = !!request.headers.get("range");

    if (responseFromCache) {
      if (rangedRequest) {
        return this.resolveRangeRequest(
          request,
          responseFromCache,
        );
      }

      return responseFromCache;
    }

    let response: Response = await preloadedResponse;

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

  resolveRangeRequest = async (
    request: FetchEvent["request"],
    response: Response,
  ): Promise<Response> => {
    const arrayBuffer = await response.arrayBuffer();
    const bytes = /^bytes=(\d+)-(\d+)?$/g.exec(
      request.headers.get("range") as string,
    );

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
      headers.append(header, response.headers.get(header) as string);
    });

    return new Response(
      arrayBuffer.slice(start, end + 1),
      {
        status: HttpStatusCode.PartialContent,
        statusText: "Partial Content",
        headers,
      },
    );
  };
}
