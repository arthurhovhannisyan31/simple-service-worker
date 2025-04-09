export abstract class AbstractSW {
  protected abstract onInstall: ServiceWorkerGlobalScope["oninstall"];

  protected abstract onActivate: ServiceWorkerGlobalScope["onactivate"];

  protected abstract onFetch: ServiceWorkerGlobalScope["onfetch"];

  protected abstract onMessage: ServiceWorkerGlobalScope["onmessage"];

  protected constructor(protected worker: ServiceWorkerGlobalScope) {}

  protected setup(
    installHandler: ServiceWorkerGlobalScope["oninstall"],
    activateHandler: ServiceWorkerGlobalScope["onactivate"],
    fetchHandler: ServiceWorkerGlobalScope["onfetch"],
    messageHandler: ServiceWorkerGlobalScope["onmessage"],
  ): void {
    this.worker.oninstall = installHandler;
    this.worker.onactivate = activateHandler;
    this.worker.onfetch = fetchHandler;
    this.worker.onmessage = messageHandler;
  }

  protected skipWaiting(): Promise<void> {
    // Force activation
    return this.worker.skipWaiting();
  }

  protected claim(): Promise<void> {
    // Claim the service work for this client, forcing `controllerchange` event
    return this.worker.clients.claim();
  }
}
