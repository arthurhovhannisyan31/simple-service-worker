import { DEFAULT_SW_PATH, SW_VERSION, SWActionLabels, SWActions, swRegistrationConfig } from "../constants";
import { createAction, createSimpleAction, isShowNotificationAction, noop } from "../helpers";
export class SWManager {
    container;
    registration;
    sw;
    postMessage;
    constructor(swRegistration, postMessage) {
        /* communication channel with host client */
        this.postMessage = postMessage;
        this.initContainer();
        this.initRegistration(swRegistration);
        this.sw = this.container?.controller;
        this.onRegistrationEnd();
    }
    initContainer() {
        this.container = navigator.serviceWorker;
        this.container.onmessage = this.onMessage;
        this.container.onmessageerror = this.onMessageError;
        this.container.oncontrollerchange = this.onControllerChange;
    }
    initRegistration(swRegistration) {
        this.registration = swRegistration;
        this.registration.onupdatefound = this.onUpdateFound;
        if (this.registration.installing) {
            this.registration.installing.onstatechange = this.onStateChange;
        }
    }
    onControllerChange = () => {
        if (navigator.serviceWorker.controller) {
            this.sw = navigator.serviceWorker.controller;
            if (this.container) {
                this.container.onmessage = this.onMessage;
            }
        }
    };
    onRegistrationEnd = async () => {
        this.sw = this.registration?.active;
        await this.dispatchMessage(createAction(SWActions.REGISTRATION_END, "SWManager: Registration end"));
        await this.dispatchMessage(createSimpleAction(SWActions.CONNECT_CLIENT));
    };
    onUpdateFound = async () => {
        await this.dispatchMessage(createSimpleAction(SWActions.UPDATE_FOUND));
    };
    onStateChange = async () => {
        this.sw = this.registration?.active;
        await this.dispatchMessage(createSimpleAction("SWManager: state change"));
    };
    onMessage = (event) => {
        console.log("Received message from worker", event);
    };
    onMessageError = (event) => {
        console.log("Error receiving message from worker:", event);
    };
    dispatchMessage = async (action) => {
        switch (action.type) {
            case SWActions.SHOW_NOTIFICATION: {
                if (isShowNotificationAction(action)) {
                    await this.registration?.showNotification(action.payload.body ?? "", action.payload);
                }
                break;
            }
            case SWActions.CONNECT_CLIENT: {
                this.sw?.postMessage(action);
                break;
            }
            case SWActions.UNREGISTER_SW: {
                this.sw?.postMessage(action);
                await this.#unregister();
                break;
            }
        }
    };
    static async init({ enabled, postMessage = noop, swPath = DEFAULT_SW_PATH, }) {
        if (!enabled) {
            try {
                await SWManager.unregister(swPath);
            }
            catch (err) {
                postMessage({
                    type: SWActions.ERROR,
                    payload: {
                        eventName: SWActionLabels[SWActions.ERROR],
                        eventProperties: {
                            err: err?.message ?? "n/a",
                            userAgent: navigator?.userAgent ?? "n/a",
                        },
                    }
                });
            }
            return;
        }
        let serviceWorker;
        try {
            serviceWorker = await SWManager.register(swPath, swRegistrationConfig, postMessage);
        }
        catch (err) {
            postMessage({
                type: SWActions.REGISTRATION_FAILURE,
                payload: {
                    eventName: SWActionLabels[SWActions.REGISTRATION_FAILURE],
                    eventProperties: {
                        err: err?.message ?? "n/a",
                        userAgent: navigator?.userAgent ?? "n/a",
                    },
                }
            });
        }
        return serviceWorker;
    }
    static async register(url, options, postMessage) {
        let swRegistration;
        swRegistration = await navigator.serviceWorker.getRegistration(url);
        if (swRegistration) {
            await swRegistration.update();
        }
        else {
            swRegistration = await navigator.serviceWorker.register(url, options);
        }
        postMessage({
            type: SWActions.REGISTRATION,
            payload: {
                eventName: SWActionLabels[SWActions.REGISTRATION],
                eventProperties: {
                    SW_VERSION,
                },
            }
        });
        return new SWManager(swRegistration, postMessage);
    }
    async #unregister() {
        return await this.registration?.unregister() ?? false;
    }
    static async unregister(url) {
        const swRegistration = await navigator.serviceWorker.getRegistration(url);
        if (swRegistration) {
            await swRegistration.unregister();
        }
    }
}
//# sourceMappingURL=sw-manager.js.map