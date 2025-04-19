export declare class SWManager {
    #private;
    container?: ServiceWorkerContainer;
    registration?: ServiceWorkerRegistration;
    sw: ServiceWorker | null | undefined;
    protected constructor(swRegistration: ServiceWorkerRegistration);
    initContainer(): void;
    initRegistration(swRegistration: ServiceWorkerRegistration): void;
    static register(url: string, options?: RegistrationOptions): Promise<SWManager>;
    protected onControllerChange: ServiceWorkerContainer["oncontrollerchange"];
    protected onRegistrationEnd: () => Promise<void>;
    protected onUpdateFound: ServiceWorkerRegistration["onupdatefound"];
    protected onStateChange: ServiceWorker["onstatechange"];
    protected onMessage: ServiceWorkerContainer["onmessage"];
    protected onMessageError: ServiceWorkerContainer["onmessageerror"];
    postMessage: (action: AnyAction) => Promise<void>;
    static unregister(url: string): Promise<void>;
}
