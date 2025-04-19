import { SWActions } from "../constants";
import { createAction, createSimpleAction, isShowNotificationAction } from "../helpers";
export class SWManager {
    container;
    registration;
    sw;
    constructor(swRegistration) {
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
    static async register(url, options) {
        let swRegistration;
        swRegistration = await navigator.serviceWorker.getRegistration(url);
        if (swRegistration) {
            await swRegistration.update();
        }
        else {
            swRegistration = await navigator.serviceWorker.register(url, options);
        }
        // TODO Post message
        // trackEvents({
        //   eventName: SWActionLabels[SWActions.REGISTRATION],
        //   eventProperties: {
        //     SW_VERSION,
        //   },
        // });
        return new SWManager(swRegistration);
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
        await this.postMessage(createAction(SWActions.REGISTRATION_END, "SWManager: Registration end"));
        await this.postMessage(createSimpleAction(SWActions.CONNECT_CLIENT));
    };
    onUpdateFound = async () => {
        await this.postMessage(createSimpleAction(SWActions.UPDATE_FOUND));
    };
    onStateChange = async () => {
        this.sw = this.registration?.active;
        await this.postMessage(createSimpleAction("SWManager: state change"));
    };
    onMessage = () => { };
    onMessageError = () => { };
    postMessage = async (action) => {
        switch (action.type) {
            case SWActions.SHOW_NOTIFICATION: {
                if (isShowNotificationAction(action)) {
                    await this.registration?.showNotification(action.payload.body ?? "", action.payload);
                }
                break;
            }
            case SWActions.UNREGISTER_SW: {
                this.sw?.postMessage(action);
                await this.#unregister();
                break;
            }
            default: {
                this.sw?.postMessage(action);
                break;
            }
        }
    };
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