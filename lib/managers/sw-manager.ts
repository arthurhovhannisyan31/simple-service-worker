import { trackEvents } from "lib/util-functions";
import { createAction, createSimpleAction } from "lib/workers/actions/createAction";
import { SWActions, SW_VERSION, SWActionLabels } from "lib/workers/service-worker/constants";
import { isShowNotificationAction } from "lib/workers/service-worker/helpers";

export class SWManager {
  container: ServiceWorkerContainer;

  registration: ServiceWorkerRegistration;

  sw: ServiceWorker | null = null;

  protected constructor(swRegistration: ServiceWorkerRegistration) {
    this.initContainer();
    this.initRegistration(swRegistration);
    this.sw = this.container.controller;
    this.onRegistrationEnd();
  }

  initContainer(): void {
    this.container = navigator.serviceWorker;
    this.container.onmessage = this.onMessage;
    this.container.onmessageerror = this.onMessageError;
    this.container.oncontrollerchange = this.onControllerChange;
  }

  initRegistration(swRegistration: ServiceWorkerRegistration): void {
    this.registration = swRegistration;
    this.registration.onupdatefound = this.onUpdateFound;

    if (this.registration.installing) {
      this.registration.installing.onstatechange = this.onStateChange;
    }
  }

  static async register(
    url: string,
    options?: RegistrationOptions,
  ): Promise<SWManager> {
    let swRegistration: ServiceWorkerRegistration;
    swRegistration = await navigator.serviceWorker.getRegistration(url);

    if (swRegistration) {
      await swRegistration.update();
    } else {
      swRegistration = await navigator.serviceWorker.register(url, options);
    }

    trackEvents({
      eventName: SWActionLabels[SWActions.REGISTRATION],
      eventProperties: {
        SW_VERSION,
      },
    });

    return new SWManager(swRegistration);
  }

  protected onControllerChange: ServiceWorkerContainer["oncontrollerchange"] = () => {
    if (navigator.serviceWorker.controller) {
      this.sw = navigator.serviceWorker.controller;

      this.container.onmessage = this.onMessage;
    }
  };

  protected onRegistrationEnd = async (): Promise<void> => {
    this.sw = this.registration.active;
    await this.postMessage(createAction(SWActions.REGISTRATION_END, "SWManager: Registration end"));
    await this.postMessage(createSimpleAction(SWActions.CONNECT_CLIENT));
  };

  protected onUpdateFound: ServiceWorkerRegistration["onupdatefound"] = async (): Promise<void> => {
    await this.postMessage(createSimpleAction(SWActions.UPDATE_FOUND));
  };

  protected onStateChange: ServiceWorker["onstatechange"] = async () => {
    this.sw = this.registration.active;
    await this.postMessage(createSimpleAction("SWManager: state change"));
  };

  protected onMessage: ServiceWorkerContainer["onmessage"] = () => {};

  protected onMessageError: ServiceWorkerContainer["onmessageerror"] = () => {};

  postMessage = async (action: AnyAction): Promise<void> => {
    switch (action.type) {
      case SWActions.SHOW_NOTIFICATION: {
        if (isShowNotificationAction(action)) {
          await this.registration.showNotification(
            action.payload.body,
            action.payload,
          );
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

  #unregister(): Promise<boolean> {
    return this.registration.unregister();
  }

  static async unregister(url: string): Promise<void> {
    const swRegistration = await navigator.serviceWorker.getRegistration(url);

    if (swRegistration) {
      await swRegistration.unregister();
    }
  }
}
