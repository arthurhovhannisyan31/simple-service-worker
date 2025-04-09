import { type MutableRefObject, useEffect, useRef } from "react";

import { trackEvents } from "lib/util-functions";
import {
  SW_PATH,
  SWActionLabels,
  SWActions,
  swRegistrationConfig,
} from "lib/workers/service-worker/constants";
import { isSwEnabled, isSWRegistrationValid } from "lib/workers/service-worker/helpers";
import { SWManager } from "lib/workers/service-worker/managers/sw-manager";

const initSw = async (swManagerRef: MutableRefObject<SWManager>): Promise<void> => {
  if (!isSwEnabled()) {
    try {
      await SWManager.unregister(SW_PATH);
    } catch (err) {
      trackEvents({
        eventName: SWActionLabels[SWActions.ERROR],
        eventProperties: {
          err: (err as Error)?.message ?? "n/a",
          userAgent: navigator?.userAgent ?? "n/a",
        },
      });
    }

    return;
  }

  let serviceWorker: SWManager;

  try {
    serviceWorker = await SWManager.register(SW_PATH, swRegistrationConfig);
  } catch (err) {
    trackEvents({
      eventName: SWActionLabels[SWActions.REGISTRATION_FAILURE],
      eventProperties: {
        err: (err as Error)?.message ?? "n/a",
        userAgent: navigator?.userAgent ?? "n/a",
      },
    });
  }

  swManagerRef.current = serviceWorker;
};

export const useInitSW = (): void => {
  const swManagerRef = useRef<SWManager | null>(null);

  useEffect(() => {
    if (!isSWRegistrationValid() || swManagerRef.current) return;

    initSw(swManagerRef);
  }, []);
};
