import { DEFAULT_SW_PATH, SW_VERSION, SWActionLabels, SWActions, swRegistrationConfig } from "../constants";
import { createAction, createSimpleAction, isShowNotificationAction, noop } from "../helpers";

export class SWManager {
  container?: ServiceWorkerContainer;
  registration?: ServiceWorkerRegistration;
  sw: ServiceWorker | null | undefined;
  postMessage: (action: AnyAction) => void;

  protected constructor(
    swRegistration: ServiceWorkerRegistration,
    postMessage: (action: AnyAction) => void
  ) {
    /* communication channel with host client */
    this.postMessage = postMessage;
    this.initContainer();
    this.initRegistration(swRegistration);
    this.sw = this.container?.controller;
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

  protected onControllerChange: ServiceWorkerContainer["oncontrollerchange"] = () => {
    if (navigator.serviceWorker.controller) {
      this.sw = navigator.serviceWorker.controller;

      if (this.container) {
        this.container.onmessage = this.onMessage;
      }
    }
  };

  protected onRegistrationEnd = async (): Promise<void> => {
    this.sw = this.registration?.active;
    await this.dispatchMessage(createAction(SWActions.REGISTRATION_END, "SWManager: Registration end"));
    await this.dispatchMessage(createSimpleAction(SWActions.CONNECT_CLIENT));
  };

  protected onUpdateFound: ServiceWorkerRegistration["onupdatefound"] = async (): Promise<void> => {
    await this.dispatchMessage(createSimpleAction(SWActions.UPDATE_FOUND));
  };

  protected onStateChange: ServiceWorker["onstatechange"] = async () => {
    this.sw = this.registration?.active;
    await this.dispatchMessage(createSimpleAction("SWManager: state change"));
  };

  protected onMessage: ServiceWorkerContainer["onmessage"] = (event: MessageEvent) => {
    console.log("Received message from worker", event);
  };

  protected onMessageError: ServiceWorkerContainer["onmessageerror"] = (event: MessageEvent) => {
    console.log("Error receiving message from worker:", event);
  };

  dispatchMessage = async (action: AnyAction): Promise<void> => {
    switch (action.type as SWActions) {
      case SWActions.SHOW_NOTIFICATION: {
        if (isShowNotificationAction(action)) {
          await this.registration?.showNotification(
            action.payload.body ?? "",
            action.payload,
          );
        }
        break;
      }
      case SWActions.CONNECT_CLIENT:{
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

  static async init({
    enabled,
    postMessage = noop,
    swPath = DEFAULT_SW_PATH,
  }: {
    enabled: boolean;
    postMessage?: (action: AnyAction) => void;
    swPath?: string;
  }): Promise<SWManager | undefined> {
    if (!enabled) {
      try {
        await SWManager.unregister(swPath);
      } catch (err: unknown) {
        postMessage({
          type: SWActions.ERROR,
          payload: {
            eventName: SWActionLabels[SWActions.ERROR],
            eventProperties: {
              err: (err as Error)?.message ?? "n/a",
              userAgent: navigator?.userAgent ?? "n/a",
            },
          }
        });
      }

      return;
    }

    let serviceWorker: SWManager | undefined;

    try {
      serviceWorker = await SWManager.register(
        swPath,
        swRegistrationConfig,
        postMessage
      );
    } catch (err: unknown) {
      postMessage({
        type: SWActions.REGISTRATION_FAILURE,
        payload: {
          eventName: SWActionLabels[SWActions.REGISTRATION_FAILURE],
          eventProperties: {
            err: (err as Error)?.message ?? "n/a",
            userAgent: navigator?.userAgent ?? "n/a",
          },
        }
      });
    }

    return serviceWorker;
  }

  static async register(
    url: string,
    options: RegistrationOptions,
    postMessage: (action: AnyAction) => void,
  ): Promise<SWManager> {
    let swRegistration: ServiceWorkerRegistration | undefined;
    swRegistration = await navigator.serviceWorker.getRegistration(url);

    if (swRegistration) {
      await swRegistration.update();
    } else {
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

  async #unregister(): Promise<boolean> {
    return await this.registration?.unregister() ?? false;
  }

  static async unregister(url: string): Promise<void> {
    const swRegistration = await navigator.serviceWorker.getRegistration(url);

    if (swRegistration) {
      await swRegistration.unregister();
    }
  }
}
