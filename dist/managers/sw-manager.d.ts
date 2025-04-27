export declare class SWManager {
    #private;
    container?: ServiceWorkerContainer;
    registration?: ServiceWorkerRegistration;
    sw: ServiceWorker | null | undefined;
    postMessage: (action: AnyAction) => void;
    protected constructor(swRegistration: ServiceWorkerRegistration, postMessage: (action: AnyAction) => void);
    initContainer(): void;
    initRegistration(swRegistration: ServiceWorkerRegistration): void;
    protected onControllerChange: ServiceWorkerContainer["oncontrollerchange"];
    protected onRegistrationEnd: () => Promise<void>;
    protected onUpdateFound: ServiceWorkerRegistration["onupdatefound"];
    protected onStateChange: ServiceWorker["onstatechange"];
    protected onMessage: ServiceWorkerContainer["onmessage"];
    protected onMessageError: ServiceWorkerContainer["onmessageerror"];
    dispatchMessage: (action: AnyAction) => Promise<void>;
    static init({ enabled, postMessage, swPath, }: {
        enabled: boolean;
        postMessage?: (action: AnyAction) => void;
        swPath?: string;
    }): Promise<SWManager | undefined>;
    static register(url: string, options: RegistrationOptions, postMessage: (action: AnyAction) => void): Promise<SWManager>;
    static unregister(url: string): Promise<void>;
}
