export declare abstract class AbstractSW {
    protected worker: ServiceWorkerGlobalScope;
    protected abstract onInstall: ServiceWorkerGlobalScope["oninstall"];
    protected abstract onActivate: ServiceWorkerGlobalScope["onactivate"];
    protected abstract onFetch: ServiceWorkerGlobalScope["onfetch"];
    protected abstract onMessage: ServiceWorkerGlobalScope["onmessage"];
    protected constructor(worker: ServiceWorkerGlobalScope);
    protected setup(installHandler: ServiceWorkerGlobalScope["oninstall"], activateHandler: ServiceWorkerGlobalScope["onactivate"], fetchHandler: ServiceWorkerGlobalScope["onfetch"], messageHandler: ServiceWorkerGlobalScope["onmessage"]): void;
    protected skipWaiting(): Promise<void>;
    protected claim(): Promise<void>;
}
