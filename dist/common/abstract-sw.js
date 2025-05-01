export class AbstractSW {
    worker;
    constructor(worker) {
        this.worker = worker;
    }
    setup(installHandler, activateHandler, fetchHandler, messageHandler) {
        this.worker.oninstall = installHandler;
        this.worker.onactivate = activateHandler;
        this.worker.onfetch = fetchHandler;
        this.worker.onmessage = messageHandler;
    }
    skipWaiting() {
        // Force activation
        return this.worker.skipWaiting();
    }
    claim() {
        // Claim the service work for this client, forcing `controllerchange` event
        return this.worker.clients.claim();
    }
}
//# sourceMappingURL=abstract-sw.js.map